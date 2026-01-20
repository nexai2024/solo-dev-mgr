export type Recipe = {
  id?: string;
  name: string;
  ingredients: string[];
  instructions: string;
};

export type Comment = {
  id?: string;
  comment: string;
  created_at: string;
  user_id: string;
  recipe_id: string;
};

// App Module Types

export type AppStatus = 'idea' | 'development' | 'staging' | 'production' | 'maintenance' | 'archived';

export type AppCategory = 'web_app' | 'mobile_app' | 'api_backend' | 'desktop_app' | 'cli_tool' | 'other';

export interface App {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  description: string | null;
  status: AppStatus;
  tech_stack: string | null;
  category: AppCategory | null;
  production_url: string | null;
  staging_url: string | null;
  repository_url: string | null;
  documentation_url: string | null;
  monitoring_url: string | null;
  started_date: string | null;
  first_deploy_date: string | null;
  notes: string | null;
  active_users: number;
  monthly_revenue: number;
  current_uptime: number;
  open_issues: number;
}

export type CreateAppInput = Omit<App, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'active_users' | 'monthly_revenue' | 'current_uptime' | 'open_issues'>;

export type UpdateAppInput = Partial<CreateAppInput>;

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentVariable {
  id: string;
  created_at: string;
  updated_at: string;
  app_id: string;
  environment: Environment;
  key_name: string;
  value: string;
  is_sensitive: boolean;
}

export type CreateEnvVarInput = Omit<EnvironmentVariable, 'id' | 'created_at' | 'updated_at'>;

export type UpdateEnvVarInput = Partial<Omit<CreateEnvVarInput, 'app_id'>>;

export interface Deployment {
  id: string;
  created_at: string;
  app_id: string;
  version: string;
  deployed_at: string;
  notes: string | null;
}

export type CreateDeploymentInput = Omit<Deployment, 'id' | 'created_at'>;

export type UpdateDeploymentInput = Partial<Omit<CreateDeploymentInput, 'app_id'>>;

export type RepositoryPlatform = 'github' | 'gitlab' | 'bitbucket' | 'other';

export interface Repository {
  id: string;
  created_at: string;
  app_id: string;
  name: string;
  url: string;
  platform: RepositoryPlatform;
  is_primary: boolean;
}

export type CreateRepositoryInput = Omit<Repository, 'id' | 'created_at'>;

export type UpdateRepositoryInput = Partial<Omit<CreateRepositoryInput, 'app_id'>>;
