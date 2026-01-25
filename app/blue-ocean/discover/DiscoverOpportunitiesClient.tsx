"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles, Lightbulb, TrendingUp, Target } from "lucide-react";
import { createAnalysis } from "@/lib/actions/blueocean.actions";

interface Opportunity {
  name: string;
  description: string;
  industry: string;
  keyInsights: string[];
  potentialValue: string;
}

const industries = [
  "SaaS",
  "Mobile Gaming",
  "DevTools",
  "E-commerce",
  "Productivity",
  "Social Media",
  "FinTech",
  "HealthTech",
  "EdTech",
  "Other",
];

export function DiscoverOpportunitiesClient() {
  const router = useRouter();
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [experience, setExperience] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [error, setError] = useState("");

  const generateOpportunities = async () => {
    if (!skills.trim()) {
      setError("Please enter at least your skills");
      return;
    }

    setIsGenerating(true);
    setError("");
    setOpportunities([]);

    try {
      // Simulate AI-powered opportunity generation
      // In a real implementation, this would call an AI API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate sample opportunities based on inputs
      const generated: Opportunity[] = [
        {
          name: `${skills.split(",")[0]?.trim() || "Tech"} Solution for ${targetAudience || "Developers"}`,
          description: `A specialized tool leveraging ${skills} to solve common pain points in ${interests || "the industry"}. This opportunity combines your technical expertise with market needs.`,
          industry: interests || "DevTools",
          keyInsights: [
            `High demand for ${skills.split(",")[0]?.trim() || "technical"} solutions`,
            `Growing market in ${interests || "tech"} space`,
            `Opportunity to differentiate through specialization`,
          ],
          potentialValue: "High - Untapped niche with growing demand",
        },
        {
          name: `Streamlined ${interests || "Productivity"} Platform`,
          description: `An integrated platform that simplifies workflows for ${targetAudience || "professionals"} using modern ${skills} technologies.`,
          industry: interests || "Productivity",
          keyInsights: [
            "Market gap in integrated solutions",
            "User frustration with fragmented tools",
            "Opportunity for unified experience",
          ],
          potentialValue: "Medium-High - Competitive but differentiated approach",
        },
        {
          name: `AI-Enhanced ${skills.split(",")[0]?.trim() || "Development"} Assistant`,
          description: `Leverage AI to augment ${skills} workflows, making complex tasks more accessible to ${targetAudience || "developers"}.`,
          industry: "DevTools",
          keyInsights: [
            "AI integration is a key differentiator",
            "Growing demand for developer productivity tools",
            "First-mover advantage in AI-assisted workflows",
          ],
          potentialValue: "High - Emerging technology with strong growth potential",
        },
      ];

      setOpportunities(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate opportunities");
    } finally {
      setIsGenerating(false);
    }
  };

  const createAnalysisFromOpportunity = async (opportunity: Opportunity) => {
    try {
      const analysis = await createAnalysis({
        name: opportunity.name,
        description: opportunity.description,
        industry: opportunity.industry as any,
        status: "draft",
      });
      router.push(`/blue-ocean/${analysis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/blue-ocean">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Discover Opportunities</h1>
          </div>
          <p className="text-gray-600">
            AI-powered opportunity discovery based on your skillset, interests, and experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skills">Skills & Technologies *</Label>
                  <textarea
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., React, Node.js, Python, AI/ML"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated list</p>
                </div>

                <div>
                  <Label htmlFor="interests">Industry Interests</Label>
                  <textarea
                    id="interests"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g., SaaS, DevTools, Productivity"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Experience Level</Label>
                  <Input
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g., 5 years, Senior Developer"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Solo developers, Small teams"
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={generateOpportunities}
                  disabled={isGenerating || !skills.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Discover Opportunities
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {opportunities.length === 0 && !isGenerating && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Discover Opportunities?
                </h3>
                <p className="text-gray-600 mb-6">
                  Fill in your profile on the left and click "Discover Opportunities" to get
                  AI-powered suggestions for blue ocean opportunities tailored to your skillset.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>Based on market trends and your expertise</span>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Analyzing Opportunities...
                </h3>
                <p className="text-gray-600">
                  Our AI is analyzing market trends, your skills, and identifying untapped
                  opportunities.
                </p>
              </div>
            )}

            {opportunities.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Discovered Opportunities ({opportunities.length})
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpportunities([]);
                      setError("");
                    }}
                  >
                    Clear Results
                  </Button>
                </div>

                {opportunities.map((opportunity, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {opportunity.name}
                        </h3>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {opportunity.industry}
                        </span>
                      </div>
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>

                    <p className="text-gray-600 mb-4">{opportunity.description}</p>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Insights:</h4>
                      <ul className="space-y-1">
                        {opportunity.keyInsights.map((insight, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">
                        <span className="font-semibold text-gray-900">Potential Value: </span>
                        <span className="text-gray-700">{opportunity.potentialValue}</span>
                      </p>
                    </div>

                    <Button
                      onClick={() => createAnalysisFromOpportunity(opportunity)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Create Analysis from This Opportunity
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-3">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <div className="font-semibold text-gray-900 mb-1">1. Input Your Profile</div>
              <p>Share your skills, interests, and experience level</p>
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">2. AI Analysis</div>
              <p>Our system analyzes market trends and identifies opportunities</p>
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">3. Create Analysis</div>
              <p>Select an opportunity to start your Blue Ocean Strategy analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
