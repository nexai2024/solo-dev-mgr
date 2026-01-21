"use client";

import { useState } from "react";
import {
  BlueOceanAnalysis,
  Competitor,
  ERRCMatrix,
  StrategyCanvasConfig,
  PainPoint,
  ValueCostEstimate,
  ImplementationRoadmap,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, Users, Target, Calculator, Map } from "lucide-react";
import Link from "next/link";

interface AnalysisDetailClientProps {
  analysis: BlueOceanAnalysis;
  competitors: Competitor[];
  errc: ERRCMatrix | null;
  canvas: StrategyCanvasConfig | null;
  painPoints: PainPoint[];
  estimates: ValueCostEstimate[];
  roadmap: ImplementationRoadmap | null;
}

export function AnalysisDetailClient({
  analysis,
  competitors,
  errc,
  canvas,
  painPoints,
  estimates,
  roadmap,
}: AnalysisDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    archived: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/blue-ocean">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{analysis.name}</h1>
              {analysis.description && (
                <p className="text-gray-600 mt-2">{analysis.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                {analysis.industry && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                    {analysis.industry}
                  </span>
                )}
                <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[analysis.status]}`}>
                  {analysis.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border-b">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="competitors">
              Competitors ({competitors.length})
            </TabsTrigger>
            <TabsTrigger value="errc">ERRC Matrix</TabsTrigger>
            <TabsTrigger value="canvas">Strategy Canvas</TabsTrigger>
            <TabsTrigger value="painpoints">
              Pain Points ({painPoints.length})
            </TabsTrigger>
            <TabsTrigger value="calculator">
              Value Calculator ({estimates.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Summary Card */}
              <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-gray-900 font-medium">{analysis.name}</p>
                  </div>
                  {analysis.description && (
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-gray-900">{analysis.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Industry</p>
                    <p className="text-gray-900">{analysis.industry || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${statusColors[analysis.status]}`}>
                      {analysis.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-gray-900">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-gray-900">
                        {new Date(analysis.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Competitors</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{competitors.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pain Points</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{painPoints.length}</p>
                    </div>
                    <Target className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Features Analyzed</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{estimates.length}</p>
                    </div>
                    <Calculator className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Competitors</h2>
              {competitors.length === 0 ? (
                <p className="text-gray-600">No competitors added yet. Add competitors to analyze the market landscape.</p>
              ) : (
                <div className="space-y-4">
                  {competitors.map((competitor) => (
                    <div key={competitor.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
                          {competitor.description && (
                            <p className="text-sm text-gray-600 mt-1">{competitor.description}</p>
                          )}
                        </div>
                        {competitor.market_position && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {competitor.market_position}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex gap-4">
                        {competitor.url && (
                          <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            Visit Website
                          </a>
                        )}
                        <span className="text-sm text-gray-500">
                          {competitor.features.length} features tracked
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ERRC Matrix Tab */}
          <TabsContent value="errc" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Eliminate */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Eliminate</h3>
                <p className="text-sm text-gray-600 mb-4">
                  What factors should be eliminated that the industry takes for granted?
                </p>
                {errc && errc.eliminate.length > 0 ? (
                  <div className="space-y-3">
                    {errc.eliminate.map((item, idx) => (
                      <div key={idx} className="border-l-2 border-red-200 pl-3">
                        <p className="font-medium text-gray-900">{item.factor}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.reasoning}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No factors defined yet</p>
                )}
              </div>

              {/* Reduce */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reduce</h3>
                <p className="text-sm text-gray-600 mb-4">
                  What factors should be reduced well below the industry standard?
                </p>
                {errc && errc.reduce.length > 0 ? (
                  <div className="space-y-3">
                    {errc.reduce.map((item, idx) => (
                      <div key={idx} className="border-l-2 border-yellow-200 pl-3">
                        <p className="font-medium text-gray-900">{item.factor}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.reasoning}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No factors defined yet</p>
                )}
              </div>

              {/* Raise */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Raise</h3>
                <p className="text-sm text-gray-600 mb-4">
                  What factors should be raised well above the industry standard?
                </p>
                {errc && errc.raise.length > 0 ? (
                  <div className="space-y-3">
                    {errc.raise.map((item, idx) => (
                      <div key={idx} className="border-l-2 border-green-200 pl-3">
                        <p className="font-medium text-gray-900">{item.factor}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.reasoning}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No factors defined yet</p>
                )}
              </div>

              {/* Create */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create</h3>
                <p className="text-sm text-gray-600 mb-4">
                  What factors should be created that the industry has never offered?
                </p>
                {errc && errc.create.length > 0 ? (
                  <div className="space-y-3">
                    {errc.create.map((item, idx) => (
                      <div key={idx} className="border-l-2 border-blue-200 pl-3">
                        <p className="font-medium text-gray-900">{item.factor}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.reasoning}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No factors defined yet</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Strategy Canvas Tab */}
          <TabsContent value="canvas" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Strategy Canvas</h2>
              {canvas ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Visualize your value curve against industry baseline and competitors
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Factors</h3>
                      <div className="flex gap-2 flex-wrap">
                        {canvas.factors.map((factor, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Your Value Curve</h3>
                      <div className="flex gap-2">
                        {canvas.your_curve.map((value, idx) => (
                          <div key={idx} className="text-center">
                            <div className="bg-blue-600 text-white rounded px-3 py-2 font-semibold">
                              {value}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{canvas.factors[idx]}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Strategy canvas not configured yet</p>
              )}
            </div>
          </TabsContent>

          {/* Pain Points Tab */}
          <TabsContent value="painpoints" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pain Points</h2>
              {painPoints.length === 0 ? (
                <p className="text-gray-600">No pain points discovered yet. Start discovering user pain points from various sources.</p>
              ) : (
                <div className="space-y-4">
                  {painPoints.map((point) => (
                    <div key={point.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {point.source}
                        </span>
                        {point.category && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {point.category}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900">{point.content}</p>
                      {point.ai_summary && (
                        <p className="text-sm text-gray-600 mt-2 italic">{point.ai_summary}</p>
                      )}
                      {point.sentiment_score !== null && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded">
                              <div
                                className={`h-full rounded ${
                                  point.sentiment_score < -0.3
                                    ? "bg-red-500"
                                    : point.sentiment_score < 0.3
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${Math.abs(point.sentiment_score) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">
                              {(point.sentiment_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Value Calculator Tab */}
          <TabsContent value="calculator" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Value Cost Calculator</h2>
              {estimates.length === 0 ? (
                <p className="text-gray-600">No features analyzed yet. Start adding features to calculate cost-value trade-offs.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Dev Hours</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Cost</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Value</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Diff.</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estimates.map((estimate) => (
                        <tr key={estimate.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{estimate.feature_name}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {estimate.estimated_dev_hours ? `${estimate.estimated_dev_hours}h` : "—"}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {estimate.estimated_cost_usd ? `$${estimate.estimated_cost_usd}` : "—"}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {estimate.perceived_value_score ? `${estimate.perceived_value_score}/10` : "—"}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {estimate.differentiation_score ? `${estimate.differentiation_score}/10` : "—"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                estimate.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : estimate.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {estimate.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
