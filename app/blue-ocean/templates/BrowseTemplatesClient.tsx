"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle2, X, TrendingDown, TrendingUp, Plus } from "lucide-react";
import { createAnalysis } from "@/lib/actions/blueocean.actions";
import { updateERRCMatrix } from "@/lib/actions/blueocean.actions";
import type { ERRCFactor } from "@/types";

interface ERRCTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  eliminate: ERRCFactor[];
  reduce: ERRCFactor[];
  raise: ERRCFactor[];
  create: ERRCFactor[];
}

const templates: ERRCTemplate[] = [
  {
    id: "saas-dev-tools",
    name: "SaaS DevTools",
    industry: "DevTools",
    description: "Template for developer tools and SaaS platforms targeting software engineers",
    eliminate: [
      {
        factor: "Complex onboarding processes",
        reasoning: "Developers want to start using tools immediately without lengthy setup",
      },
      {
        factor: "Vendor lock-in",
        reasoning: "Developers prefer tools that integrate with their existing workflow",
      },
    ],
    reduce: [
      {
        factor: "Feature bloat",
        reasoning: "Focus on core functionality rather than trying to be everything to everyone",
      },
      {
        factor: "Pricing complexity",
        reasoning: "Simple, transparent pricing models are preferred",
      },
    ],
    raise: [
      {
        factor: "Developer experience",
        reasoning: "Superior UX and intuitive interfaces are key differentiators",
      },
      {
        factor: "Documentation quality",
        reasoning: "Comprehensive, clear documentation is essential for developer adoption",
      },
      {
        factor: "API reliability",
        reasoning: "High uptime and consistent performance build trust",
      },
    ],
    create: [
      {
        factor: "AI-powered assistance",
        reasoning: "Integrate AI to help developers code faster and solve problems",
      },
      {
        factor: "Real-time collaboration",
        reasoning: "Enable seamless team collaboration within development workflows",
      },
      {
        factor: "Open-source community",
        reasoning: "Build a community around the tool for feedback and contributions",
      },
    ],
  },
  {
    id: "productivity-saas",
    name: "Productivity SaaS",
    industry: "Productivity",
    description: "Template for productivity and workflow management tools",
    eliminate: [
      {
        factor: "Context switching between tools",
        reasoning: "Users want unified platforms that reduce app switching",
      },
      {
        factor: "Data silos",
        reasoning: "Information should flow seamlessly across different functions",
      },
    ],
    reduce: [
      {
        factor: "Learning curve",
        reasoning: "Tools should be intuitive and require minimal training",
      },
      {
        factor: "Subscription fatigue",
        reasoning: "Offer value that justifies the cost without overwhelming users",
      },
    ],
    raise: [
      {
        factor: "Automation capabilities",
        reasoning: "Powerful automation reduces manual work and increases efficiency",
      },
      {
        factor: "Mobile experience",
        reasoning: "Seamless mobile access is essential for modern productivity",
      },
      {
        factor: "Integration ecosystem",
        reasoning: "Connect with popular tools users already use",
      },
    ],
    create: [
      {
        factor: "AI workflow optimization",
        reasoning: "Use AI to suggest and implement workflow improvements",
      },
      {
        factor: "Team intelligence",
        reasoning: "Provide insights into team productivity and collaboration patterns",
      },
      {
        factor: "Wellness integration",
        reasoning: "Help users maintain work-life balance and prevent burnout",
      },
    ],
  },
  {
    id: "mobile-gaming",
    name: "Mobile Gaming",
    industry: "Mobile Gaming",
    description: "Template for mobile game development and monetization strategies",
    eliminate: [
      {
        factor: "Aggressive monetization",
        reasoning: "Players are tired of pay-to-win mechanics and excessive ads",
      },
      {
        factor: "Grinding requirements",
        reasoning: "Excessive time requirements alienate casual players",
      },
    ],
    reduce: [
      {
        factor: "Complex controls",
        reasoning: "Mobile games should be simple and intuitive to play",
      },
      {
        factor: "Download size",
        reasoning: "Large file sizes prevent users from trying new games",
      },
    ],
    raise: [
      {
        factor: "Social features",
        reasoning: "Multiplayer and social elements increase engagement and retention",
      },
      {
        factor: "Progressive difficulty",
        reasoning: "Games that adapt to player skill level maintain interest",
      },
      {
        factor: "Visual quality",
        reasoning: "High-quality graphics and animations create immersive experiences",
      },
    ],
    create: [
      {
        factor: "Cross-platform play",
        reasoning: "Allow players to continue games across devices seamlessly",
      },
      {
        factor: "User-generated content",
        reasoning: "Enable players to create and share their own content",
      },
      {
        factor: "Narrative-driven gameplay",
        reasoning: "Story-rich experiences differentiate from pure arcade games",
      },
    ],
  },
  {
    id: "fintech",
    name: "FinTech",
    industry: "FinTech",
    description: "Template for financial technology applications and services",
    eliminate: [
      {
        factor: "Hidden fees",
        reasoning: "Transparency builds trust in financial services",
      },
      {
        factor: "Complex approval processes",
        reasoning: "Streamlined onboarding increases user adoption",
      },
    ],
    reduce: [
      {
        factor: "Minimum balance requirements",
        reasoning: "Lower barriers to entry attract more users",
      },
      {
        factor: "Transaction delays",
        reasoning: "Faster processing improves user experience",
      },
    ],
    raise: [
      {
        factor: "Security standards",
        reasoning: "Bank-level security is non-negotiable for financial apps",
      },
      {
        factor: "Financial literacy tools",
        reasoning: "Educational content helps users make better financial decisions",
      },
      {
        factor: "Customer support",
        reasoning: "Responsive support is critical for financial services",
      },
    ],
    create: [
      {
        factor: "AI financial advisor",
        reasoning: "Personalized financial advice powered by AI",
      },
      {
        factor: "Micro-investing features",
        reasoning: "Make investing accessible with small amounts and automated strategies",
      },
      {
        factor: "Social finance features",
        reasoning: "Enable friends and family to manage shared expenses easily",
      },
    ],
  },
  {
    id: "edtech",
    name: "EdTech",
    industry: "EdTech",
    description: "Template for educational technology platforms and learning tools",
    eliminate: [
      {
        factor: "One-size-fits-all curriculum",
        reasoning: "Personalized learning paths improve outcomes",
      },
      {
        factor: "Passive learning",
        reasoning: "Interactive, engaging content increases retention",
      },
    ],
    reduce: [
      {
        factor: "Cost barriers",
        reasoning: "Affordable pricing makes education accessible to more learners",
      },
      {
        factor: "Time commitment",
        reasoning: "Flexible scheduling accommodates busy learners",
      },
    ],
    raise: [
      {
        factor: "Gamification",
        reasoning: "Game-like elements make learning fun and motivating",
      },
      {
        factor: "Progress tracking",
        reasoning: "Clear visibility into learning progress keeps students engaged",
      },
      {
        factor: "Instructor quality",
        reasoning: "Expert instructors and quality content are essential",
      },
    ],
    create: [
      {
        factor: "AI tutoring",
        reasoning: "Personalized AI tutors that adapt to each student's learning style",
      },
      {
        factor: "Peer learning networks",
        reasoning: "Connect learners with peers for collaborative learning",
      },
      {
        factor: "Skill-based certifications",
        reasoning: "Industry-recognized credentials that lead to career advancement",
      },
    ],
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    industry: "E-commerce",
    description: "Template for e-commerce platforms and online retail solutions",
    eliminate: [
      {
        factor: "Shipping delays",
        reasoning: "Fast, reliable delivery is a key competitive advantage",
      },
      {
        factor: "Return complexity",
        reasoning: "Easy returns build customer confidence and loyalty",
      },
    ],
    reduce: [
      {
        factor: "Cart abandonment",
        reasoning: "Streamlined checkout processes reduce friction",
      },
      {
        factor: "Search friction",
        reasoning: "Intuitive search and filtering help customers find products quickly",
      },
    ],
    raise: [
      {
        factor: "Product discovery",
        reasoning: "AI-powered recommendations help customers find relevant products",
      },
      {
        factor: "Customer reviews",
        reasoning: "Authentic reviews build trust and influence purchase decisions",
      },
      {
        factor: "Mobile shopping experience",
        reasoning: "Optimized mobile experience is essential for modern e-commerce",
      },
    ],
    create: [
      {
        factor: "Virtual try-on",
        reasoning: "AR/VR technology lets customers visualize products before buying",
      },
      {
        factor: "Subscription commerce",
        reasoning: "Recurring revenue models provide predictable income",
      },
      {
        factor: "Social commerce",
        reasoning: "Enable shopping directly from social media platforms",
      },
    ],
  },
];

export function BrowseTemplatesClient() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<ERRCTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const createAnalysisFromTemplate = async (template: ERRCTemplate) => {
    setIsCreating(true);
    setError("");

    try {
      // Create the analysis
      const analysis = await createAnalysis({
        name: `${template.name} Analysis`,
        description: `Blue Ocean Strategy analysis using the ${template.name} template: ${template.description}`,
        industry: template.industry as any,
        status: "draft",
      });

      // Update the ERRC matrix with template data
      await updateERRCMatrix({
        analysis_id: analysis.id,
        eliminate: template.eliminate,
        reduce: template.reduce,
        raise: template.raise,
        create: template.create,
        template_used: template.id,
      });

      router.push(`/blue-ocean/${analysis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis from template");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/blue-ocean">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Browse Templates</h1>
          </div>
          <p className="text-gray-600">
            Industry-specific ERRC templates to jumpstart your Blue Ocean Strategy analysis
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {template.industry}
                  </span>
                </div>
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                <div>
                  <span className="font-semibold">Eliminate:</span> {template.eliminate.length}
                </div>
                <div>
                  <span className="font-semibold">Reduce:</span> {template.reduce.length}
                </div>
                <div>
                  <span className="font-semibold">Raise:</span> {template.raise.length}
                </div>
                <div>
                  <span className="font-semibold">Create:</span> {template.create.length}
                </div>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  createAnalysisFromTemplate(template);
                }}
                disabled={isCreating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? "Creating..." : "Use This Template"}
              </Button>
            </div>
          ))}
        </div>

        {/* Template Detail Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedTemplate.description}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTemplate(null)}
                  className="ml-4"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Eliminate */}
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-center gap-2 mb-3">
                    <X className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Eliminate</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Factors the industry takes for granted that should be eliminated
                  </p>
                  <ul className="space-y-2">
                    {selectedTemplate.eliminate.map((factor, idx) => (
                      <li key={idx} className="bg-red-50 p-3 rounded">
                        <div className="font-semibold text-gray-900 text-sm">{factor.factor}</div>
                        <div className="text-xs text-gray-600 mt-1">{factor.reasoning}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reduce */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Reduce</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Factors that should be reduced well below the industry standard
                  </p>
                  <ul className="space-y-2">
                    {selectedTemplate.reduce.map((factor, idx) => (
                      <li key={idx} className="bg-orange-50 p-3 rounded">
                        <div className="font-semibold text-gray-900 text-sm">{factor.factor}</div>
                        <div className="text-xs text-gray-600 mt-1">{factor.reasoning}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Raise */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Raise</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Factors that should be raised well above the industry standard
                  </p>
                  <ul className="space-y-2">
                    {selectedTemplate.raise.map((factor, idx) => (
                      <li key={idx} className="bg-blue-50 p-3 rounded">
                        <div className="font-semibold text-gray-900 text-sm">{factor.factor}</div>
                        <div className="text-xs text-gray-600 mt-1">{factor.reasoning}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Create */}
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Create</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Factors that the industry has never offered that should be created
                  </p>
                  <ul className="space-y-2">
                    {selectedTemplate.create.map((factor, idx) => (
                      <li key={idx} className="bg-green-50 p-3 rounded">
                        <div className="font-semibold text-gray-900 text-sm">{factor.factor}</div>
                        <div className="text-xs text-gray-600 mt-1">{factor.reasoning}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-4">
                <Button
                  onClick={() => setSelectedTemplate(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createAnalysisFromTemplate(selectedTemplate)}
                  disabled={isCreating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isCreating ? "Creating..." : "Create Analysis from Template"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-3">About ERRC Templates</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              ERRC stands for <strong>Eliminate, Reduce, Raise, Create</strong> - the four actions
              framework from Blue Ocean Strategy. These templates provide industry-specific
              starting points for your analysis.
            </p>
            <p>
              Each template includes pre-filled factors based on common industry patterns. You can
              customize these factors after creating your analysis to match your specific
              opportunity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
