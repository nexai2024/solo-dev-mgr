"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAnalysisSchema } from "@/lib/validations/blueocean";
import { createAnalysis } from "@/lib/actions/blueocean.actions";
import { App, CreateAnalysisInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface NewAnalysisClientProps {
  apps: App[];
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

export function NewAnalysisClient({ apps }: NewAnalysisClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateAnalysisInput>({
    resolver: zodResolver(createAnalysisSchema),
    defaultValues: {
      status: "draft",
    },
  });

  const onSubmit = async (data: CreateAnalysisInput) => {
    setIsSubmitting(true);
    setError("");

    try {
      const analysis = await createAnalysis(data);
      router.push(`/blue-ocean/${analysis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/blue-ocean">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Analysis</h1>
          <p className="text-gray-600 mt-1">
            Start your Blue Ocean Strategy analysis to discover untapped opportunities
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name">Analysis Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Task Manager for Designers"
                className="mt-1"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register("description")}
                placeholder="Brief description of your app idea..."
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Industry */}
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select onValueChange={(value) => setValue("industry", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select industry..." />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-red-600 mt-1">{errors.industry.message}</p>
              )}
            </div>

            {/* Link to App */}
            {apps.length > 0 && (
              <div>
                <Label htmlFor="app_id">Link to Existing App (Optional)</Label>
                <Select onValueChange={(value) => setValue("app_id", value === "none" ? undefined : value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select app..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Creating..." : "Create Analysis"}
              </Button>
              <Link href="/blue-ocean" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>

          {/* Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Define your ERRC matrix (Eliminate, Reduce, Raise, Create)</li>
              <li>• Add competitors and analyze their offerings</li>
              <li>• Discover pain points from user feedback</li>
              <li>• Create your Strategy Canvas visualization</li>
              <li>• Build an implementation roadmap</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
