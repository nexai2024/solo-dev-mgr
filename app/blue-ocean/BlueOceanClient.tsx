"use client";

import { AnalysisSummary } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Target, Users, Lightbulb } from "lucide-react";

interface BlueOceanClientProps {
  analyses: AnalysisSummary[];
}

export function BlueOceanClient({ analyses }: BlueOceanClientProps) {
  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    archived: "bg-gray-100 text-gray-600",
  };

  // Calculate stats
  const stats = {
    active: analyses.filter((a) => a.status !== "archived").length,
    competitors: analyses.reduce((sum, a) => sum + a.competitor_count, 0),
    painPoints: analyses.reduce((sum, a) => sum + a.pain_point_count, 0),
    opportunities: analyses.filter((a) => a.canvas_exists && a.errc_exists).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blue Ocean Strategy</h1>
            <p className="text-gray-600 mt-1">
              Discover untapped market opportunities and create your own market space
            </p>
          </div>
          <Link href="/blue-ocean/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Analyses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Competitors Tracked</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.competitors}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pain Points Found</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.painPoints}</p>
              </div>
              <Target className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blue Ocean Opportunities</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.opportunities}</p>
              </div>
              <Lightbulb className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Analyses Grid */}
        {analyses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Start Your First Blue Ocean Analysis
            </h2>
            <p className="text-gray-600 mb-6">
              Discover untapped market opportunities and create your own market space
            </p>
            <Link href="/blue-ocean/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Analysis
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {analyses.map((analysis) => (
              <Link key={analysis.id} href={`/blue-ocean/${analysis.id}`}>
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-2">
                      {analysis.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        statusColors[analysis.status]
                      }`}
                    >
                      {analysis.status.replace("_", " ")}
                    </span>
                  </div>

                  {analysis.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {analysis.description}
                    </p>
                  )}

                  {analysis.industry && (
                    <div className="mb-4">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {analysis.industry}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{analysis.competitor_count} competitors</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{analysis.pain_point_count} pain points</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Updated{" "}
                    {new Date(analysis.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <Link href="/blue-ocean/profile">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-900 mb-2">Set Up Your Profile</h3>
              <p className="text-sm text-gray-600">
                Configure your niche and skills for better AI recommendations
              </p>
            </div>
          </Link>

          <Link href="/blue-ocean/discover">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-900 mb-2">Discover Opportunities</h3>
              <p className="text-sm text-gray-600">
                AI-powered opportunity discovery based on your skillset
              </p>
            </div>
          </Link>

          <Link href="/blue-ocean/templates">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-900 mb-2">Browse Templates</h3>
              <p className="text-sm text-gray-600">
                Industry-specific ERRC templates to jumpstart your analysis
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
