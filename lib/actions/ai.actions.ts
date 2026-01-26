"use server";

import {
  SentimentAnalysisResult,
  CompetitorAnalysisResult,
  ERRCSuggestions,
  OpportunityDiscovery,
  FeatureCostEstimate,
  UserProfile,
  Competitor,
  PainPoint,
} from "@/types";
import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/nextjs";

// AI Integration with Anthropic Claude
// Requires ANTHROPIC_API_KEY in environment

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Analyze pain point sentiment
export const analyzePainPointSentiment = async (
  painPointText: string
): Promise<SentimentAnalysisResult> => {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      temperature: 0.3,
      system: `You are a sentiment analysis expert. Analyze the following pain point text and return a JSON response with:
- sentiment_score (float -1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
- category (one of: Usability, Performance, Pricing, Features, Support, Other)
- summary (brief 1-sentence explanation)

Return ONLY valid JSON, no other text.`,
      messages: [
        {
          role: "user",
          content: painPointText,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(responseText);

    return {
      sentiment_score: parsed.sentiment_score,
      category: parsed.category,
      summary: parsed.summary,
    };
  } catch (error) {
    // Log to Sentry
    Sentry.captureException(error, {
      tags: { function: "analyzePainPointSentiment" },
      extra: { painPointText },
    });

    console.error("AI sentiment analysis error:", error);

    // Return fallback
    return {
      sentiment_score: 0,
      category: "Other",
      summary: "Unable to analyze sentiment",
    };
  }
};

// Analyze competitor based on URL/description
export const analyzeCompetitor = async (
  competitorUrl: string,
  description: string
): Promise<CompetitorAnalysisResult> => {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      temperature: 0.7,
      system: `You are a competitive analysis expert. Based on the competitor URL and description provided, analyze their product and return JSON with:
- features: array of objects with {name: string, value: number (1-10)}
- strengths: array of strings
- weaknesses: array of strings
- market_position: one of "Leader", "Challenger", "Niche", "Emerging"

Return ONLY valid JSON, no other text.`,
      messages: [
        {
          role: "user",
          content: `URL: ${competitorUrl}\nDescription: ${description}`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(responseText);

    return {
      features: parsed.features || [],
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      market_position: parsed.market_position || "Unknown",
    };
  } catch (error) {
    // Log to Sentry
    Sentry.captureException(error, {
      tags: { function: "analyzeCompetitor" },
      extra: { competitorUrl, description },
    });

    console.error("AI competitor analysis error:", error);

    // Return fallback
    return {
      features: [],
      strengths: [],
      weaknesses: [],
      market_position: "Unknown",
    };
  }
};

// Generate ERRC matrix suggestions
export const generateERRCSuggestions = async (
  industry: string,
  competitors: Competitor[],
  painPoints: PainPoint[]
): Promise<ERRCSuggestions> => {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      temperature: 0.7,
      system: `You are a Blue Ocean Strategy expert. Given an industry, competitor data, and user pain points, generate ERRC Grid suggestions (Eliminate, Reduce, Raise, Create). Return JSON with arrays for each category, where each item has:
- factor (string describing what to eliminate/reduce/raise/create)
- reasoning (string explanation why)

Return ONLY valid JSON, no other text.`,
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            industry,
            competitors: competitors.map((c) => ({
              name: c.name,
              url: c.url,
            })),
            painPoints: painPoints.map((p) => p.content || p.description),
          }),
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(responseText);

    return {
      eliminate: parsed.eliminate || [],
      reduce: parsed.reduce || [],
      raise: parsed.raise || [],
      create: parsed.create || [],
    };
  } catch (error) {
    // Log to Sentry
    Sentry.captureException(error, {
      tags: { function: "generateERRCSuggestions" },
      extra: { industry, competitorCount: competitors.length, painPointCount: painPoints.length },
    });

    console.error("AI ERRC generation error:", error);

    // Return empty arrays as fallback
    return {
      eliminate: [],
      reduce: [],
      raise: [],
      create: [],
    };
  }
};

// Find next big thing based on user profile and trends
export const findNextBigThing = async (
  userProfile: UserProfile,
  industry: string
): Promise<OpportunityDiscovery[]> => {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      temperature: 0.7,
      system: `You are a startup opportunity expert. Based on a user's profile (skills, interests, experience) and target industry, suggest 2-3 promising startup opportunities. Return JSON array where each opportunity has:
- title (string)
- description (string, 2 sentences)
- reasoning (string, why it fits the user)
- differentiation_score (number 1-10)
- fit_score (number 1-10)
- complexity (one of: "Low", "Medium", "High")

Return ONLY valid JSON array, no other text.`,
      messages: [
        {
          role: "user",
          content: JSON.stringify({ userProfile, industry }),
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(responseText);

    // Ensure it's an array and limit to 3 items
    const opportunities = Array.isArray(parsed) ? parsed.slice(0, 3) : [];

    return opportunities;
  } catch (error) {
    // Log to Sentry
    Sentry.captureException(error, {
      tags: { function: "findNextBigThing" },
      extra: { industry },
    });

    console.error("AI opportunity discovery error:", error);

    // Return empty array as fallback
    return [];
  }
};

// Estimate feature development cost
export const estimateFeatureCost = async (
  featureDescription: string,
  userSkills: string[]
): Promise<FeatureCostEstimate> => {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      temperature: 0.3,
      system: `You are a software development estimation expert. Given a feature description and user's skills, estimate development effort. Return JSON with:
- estimated_dev_hours (number, rounded to nearest 5)
- complexity_score (number 1-10)
- suggestions (string with actionable advice)

Return ONLY valid JSON, no other text.`,
      messages: [
        {
          role: "user",
          content: `Feature: ${featureDescription}\nUser skills: ${userSkills.join(", ")}`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(responseText);

    return {
      estimated_dev_hours: Math.round(parsed.estimated_dev_hours / 5) * 5, // Round to nearest 5
      complexity_score: parsed.complexity_score,
      suggestions: parsed.suggestions,
    };
  } catch (error) {
    // Log to Sentry
    Sentry.captureException(error, {
      tags: { function: "estimateFeatureCost" },
      extra: { featureDescription, userSkills },
    });

    console.error("AI feature cost estimation error:", error);

    // Return conservative fallback
    return {
      estimated_dev_hours: 50,
      complexity_score: 7,
      suggestions: "Unable to provide accurate estimate. Consider breaking feature into smaller tasks and estimating each separately.",
    };
  }
};
