import { z } from "zod";

// App Form Schema (for create/edit app form)
export const appFormSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),

  status: z.enum(['idea', 'development', 'staging', 'production', 'maintenance', 'archived'], {
    required_error: "Status is required"
  }),

  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),

  tech_stack: z.string()
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),

  category: z.enum(['web_app', 'mobile_app', 'api_backend', 'desktop_app', 'cli_tool', 'other'])
    .optional()
    .nullable(),

  production_url: z.string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),

  staging_url: z.string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),

  repository_url: z.string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),

  documentation_url: z.string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),

  monitoring_url: z.string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),

  started_date: z.string()
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),

  first_deploy_date: z.string()
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),

  notes: z.string()
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
}).refine((data) => {
  // Custom validation: first_deploy_date must be >= started_date
  if (data.first_deploy_date && data.started_date) {
    return new Date(data.first_deploy_date) >= new Date(data.started_date);
  }
  return true;
}, {
  message: "First deploy date cannot be before started date",
  path: ["first_deploy_date"],
});

// Environment Variable Form Schema
export const envVarFormSchema = z.object({
  environment: z.enum(['development', 'staging', 'production'], {
    required_error: "Environment is required"
  }),

  key_name: z.string()
    .min(1, "Key name is required")
    .regex(/^[A-Z_][A-Z0-9_]*$/, "Must be uppercase with underscores only (e.g., DATABASE_URL)"),

  value: z.string()
    .min(1, "Value is required"),

  is_sensitive: z.boolean()
    .default(true),
});

// Deployment Form Schema
export const deploymentFormSchema = z.object({
  version: z.string()
    .min(1, "Version is required")
    .regex(/^v?\d+\.\d+\.\d+$/, "Must be valid version format (e.g., 1.2.3 or v1.2.3)"),

  deployed_at: z.string()
    .min(1, "Deployment date is required"),

  notes: z.string()
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
});

// Repository Form Schema
export const repositoryFormSchema = z.object({
  name: z.string()
    .min(1, "Repository name is required"),

  url: z.string()
    .url("Must be a valid URL"),

  platform: z.enum(['github', 'gitlab', 'bitbucket', 'other'], {
    required_error: "Platform is required"
  }),

  is_primary: z.boolean()
    .default(false),
});
