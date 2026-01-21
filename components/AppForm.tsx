"use client";

// @ts-nocheck - Complex type mismatch between zod transforms and react-hook-form

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { appFormSchema } from "@/lib/validations/app.validation";
import { App } from "@/types";

interface AppFormProps {
  mode: "create" | "edit";
  defaultValues?: App;
  onSubmit: (data: z.infer<typeof appFormSchema>) => Promise<void>;
}

const AppForm = ({ mode, defaultValues, onSubmit }: AppFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof appFormSchema>>({
    resolver: zodResolver(appFormSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          status: defaultValues.status,
          description: defaultValues.description ?? "",
          tech_stack: defaultValues.tech_stack ?? "",
          category: defaultValues.category ?? undefined,
          production_url: defaultValues.production_url ?? "",
          staging_url: defaultValues.staging_url ?? "",
          repository_url: defaultValues.repository_url ?? "",
          documentation_url: defaultValues.documentation_url ?? "",
          monitoring_url: defaultValues.monitoring_url ?? "",
          started_date: defaultValues.started_date ?? "",
          first_deploy_date: defaultValues.first_deploy_date ?? "",
          notes: defaultValues.notes ?? "",
        }
      : {
          name: "",
          status: "idea" as const,
          description: "",
          tech_stack: "",
          category: undefined,
          production_url: "",
          staging_url: "",
          repository_url: "",
          documentation_url: "",
          monitoring_url: "",
          started_date: "",
          first_deploy_date: "",
          notes: "",
        },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 max-w-4xl mx-auto">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome App" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging/Testing</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of your app..."
                    className="resize-none"
                    rows={3}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tech_stack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stack</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Next.js, Postgres, Redis"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="web_app">Web App</SelectItem>
                      <SelectItem value="mobile_app">Mobile App</SelectItem>
                      <SelectItem value="api_backend">API/Backend</SelectItem>
                      <SelectItem value="desktop_app">Desktop App</SelectItem>
                      <SelectItem value="cli_tool">CLI Tool</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* URLs & Links Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">URLs & Links</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="production_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Production URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://myapp.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="staging_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staging URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://staging.myapp.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repository_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repository URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://github.com/user/repo"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentation_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documentation URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://docs.myapp.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monitoring_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monitoring URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://status.myapp.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Project Details Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Project Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="started_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Started Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="first_deploy_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Deploy Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Internal notes, ideas, or anything you want to remember..."
                    className="resize-none"
                    rows={5}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
              ? "Create App"
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AppForm;
