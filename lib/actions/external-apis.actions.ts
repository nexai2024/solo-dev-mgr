"use server";

import snoowrap from "snoowrap";
import * as appStore from "app-store-scraper";
import * as gPlay from "google-play-scraper";
import * as Sentry from "@sentry/nextjs";

// External API integrations for pain point discovery
// Reddit, Product Hunt, and App Store scraping

export interface RedditPainPoint {
  content: string;
  url: string;
  score: number;
  created: string;
}

export interface ProductHuntReview {
  content: string;
  productName: string;
  votes: number;
  date: string;
}

export interface AppStoreReview {
  content: string;
  rating: number;
  userName: string;
  date: string;
  appName: string;
  platform: "ios" | "android";
}

// ========== REDDIT API ==========

// Search Reddit for pain points
export const searchRedditPainPoints = async (
  subreddit: string,
  keywords: string[],
  limit: number = 50
): Promise<RedditPainPoint[]> => {
  try {
    // Initialize snoowrap client with credentials
    const reddit = new snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT || "SoloDevMgr/1.0.0",
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      username: "", // Client credentials flow (read-only)
      password: "",
    });

    // Search subreddit with keywords
    const query = keywords.join(" OR ");
    const searchResults = await reddit
      .getSubreddit(subreddit)
      .search({
        query,
        time: "month" as any,
        sort: "relevance" as any,
        limit,
      });

    // Map to RedditPainPoint format
    const painPoints: RedditPainPoint[] = searchResults.map((post: any) => ({
      content: post.title + (post.selftext ? `\n\n${post.selftext}` : ""),
      url: `https://reddit.com${post.permalink}`,
      score: post.score,
      created: new Date(post.created_utc * 1000).toISOString(),
    }));

    return painPoints;
  } catch (error) {
    // Log to Sentry
    Sentry.captureException(error, {
      tags: { function: "searchRedditPainPoints" },
      extra: { subreddit, keywords },
    });

    console.error("Reddit API error:", error);

    // Return empty array on failure (graceful degradation)
    return [];
  }
};

// ========== PRODUCT HUNT API ==========

// Search Product Hunt products
export const searchProductHuntProducts = async (
  category: string,
  keywords: string[]
): Promise<ProductHuntReview[]> => {
  // NOTE: Product Hunt GraphQL API requires OAuth authentication which is beyond MVP scope.
  // For now, returning mock data. Consider upgrading to paid API access or alternative source.
  // Alternative: Web scraping with Cheerio (against TOS, not recommended)
  // TODO: Implement when Product Hunt API access is available

  console.log(`Searching Product Hunt category: ${category} for keywords: ${keywords.join(", ")}`);

  return [
    {
      content: "Great product but the onboarding could be smoother. Had to watch 3 tutorial videos.",
      productName: "Example Product",
      votes: 156,
      date: new Date().toISOString(),
    },
    {
      content: "Love the concept but wish it had better mobile support.",
      productName: "Another Product",
      votes: 89,
      date: new Date().toISOString(),
    },
  ];
};

// ========== APP STORE SCRAPING ==========

// Scrape iOS App Store reviews
export const scrapeIosAppReviews = async (
  appId: string,
  country: string = "us",
  limit: number = 100
): Promise<AppStoreReview[]> => {
  try {
    // Fetch reviews using app-store-scraper
    const reviews = await appStore.reviews({
      appId,
      country,
      sort: appStore.sort.RECENT,
      page: 1,
    });

    // Get app metadata for app name
    let appName = "Unknown App";
    try {
      const appDetails = await appStore.app({ appId, country });
      appName = appDetails.title || appName;
    } catch (appError) {
      console.warn("Failed to fetch app name:", appError);
    }

    // Map to AppStoreReview format
    const mappedReviews: AppStoreReview[] = reviews.slice(0, limit).map((review: any) => ({
      content: review.text,
      rating: review.score,
      userName: review.userName || "Anonymous",
      date: new Date(review.date).toISOString(),
      appName,
      platform: "ios",
    }));

    return mappedReviews;
  } catch (error) {
    // Log to Sentry
    Sentry.captureException(error, {
      tags: { function: "scrapeIosAppReviews" },
      extra: { appId, country },
    });

    console.error("iOS App Store scraping error:", error);

    // Return empty array on failure (graceful degradation)
    return [];
  }
};

// Scrape Android Play Store reviews
export const scrapeAndroidAppReviews = async (
  appId: string,
  country: string = "us",
  limit: number = 100
): Promise<AppStoreReview[]> => {
  try {
    // Fetch reviews using google-play-scraper
    const reviewsResult = await gPlay.reviews({
      appId,
      lang: "en",
      country,
      sort: gPlay.sort.NEWEST,
      num: limit,
    });

    // Get app metadata for app name
    let appName = "Unknown App";
    try {
      const appDetails = await gPlay.app({ appId, lang: "en", country });
      appName = appDetails.title || appName;
    } catch (appError) {
      console.warn("Failed to fetch app name:", appError);
    }

    // Map to AppStoreReview format
    const mappedReviews: AppStoreReview[] = reviewsResult.data.map((review: any) => ({
      content: review.text,
      rating: review.score,
      userName: review.userName || "Anonymous",
      date: new Date(review.date).toISOString(),
      appName,
      platform: "android",
    }));

    return mappedReviews;
  } catch (error) {
    // Log to Sentry
    Sentry.captureException(error, {
      tags: { function: "scrapeAndroidAppReviews" },
      extra: { appId, country },
    });

    console.error("Google Play Store scraping error:", error);

    // Return empty array on failure (graceful degradation)
    return [];
  }
};

// ========== UNIFIED PAIN POINT DISCOVERY ==========

// Discover pain points from all sources
export const discoverPainPoints = async (config: {
  reddit?: { subreddits: string[]; keywords: string[]; limit: number };
  producthunt?: { category: string; keywords: string[] };
  appstore?: { ios_app_id?: string; android_app_id?: string; country: string; limit: number };
}): Promise<{
  reddit: RedditPainPoint[];
  producthunt: ProductHuntReview[];
  appstore: AppStoreReview[];
}> => {
  const results = {
    reddit: [] as RedditPainPoint[],
    producthunt: [] as ProductHuntReview[],
    appstore: [] as AppStoreReview[],
  };

  // Reddit
  if (config.reddit) {
    const redditResults = await Promise.all(
      config.reddit.subreddits.map((subreddit) =>
        searchRedditPainPoints(subreddit, config.reddit!.keywords, config.reddit!.limit)
      )
    );
    results.reddit = redditResults.flat();
  }

  // Product Hunt
  if (config.producthunt) {
    results.producthunt = await searchProductHuntProducts(
      config.producthunt.category,
      config.producthunt.keywords
    );
  }

  // App Store
  if (config.appstore) {
    const appStorePromises = [];

    if (config.appstore.ios_app_id) {
      appStorePromises.push(
        scrapeIosAppReviews(
          config.appstore.ios_app_id,
          config.appstore.country,
          config.appstore.limit
        )
      );
    }

    if (config.appstore.android_app_id) {
      appStorePromises.push(
        scrapeAndroidAppReviews(
          config.appstore.android_app_id,
          config.appstore.country,
          config.appstore.limit
        )
      );
    }

    const appStoreResults = await Promise.all(appStorePromises);
    results.appstore = appStoreResults.flat();
  }

  return results;
};
