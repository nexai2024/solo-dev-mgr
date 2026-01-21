"use client";

import { App } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink } from "lucide-react";
import EnvVarList from "./EnvVarList";
import DeploymentList from "./DeploymentList";
import RepositoryList from "./RepositoryList";

interface AppTabsProps {
  app: App;
}

const AppTabs = ({ app }: AppTabsProps) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="env-vars">Environment Variables</TabsTrigger>
        <TabsTrigger value="deployments">Deployments</TabsTrigger>
        <TabsTrigger value="repositories">Repositories</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6 mt-6">
        {/* Application Details Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Application Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {app.production_url && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Production URL</p>
                <a
                  href={app.production_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {app.production_url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {app.staging_url && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Staging URL</p>
                <a
                  href={app.staging_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {app.staging_url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {app.repository_url && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Repository URL</p>
                <a
                  href={app.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {app.repository_url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {app.documentation_url && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Documentation URL</p>
                <a
                  href={app.documentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {app.documentation_url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {app.monitoring_url && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Monitoring URL</p>
                <a
                  href={app.monitoring_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {app.monitoring_url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {app.category && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Category</p>
                <p className="font-medium">
                  {app.category.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>
            )}

            {app.started_date && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Started Date</p>
                <p className="font-medium">{formatDate(app.started_date)}</p>
              </div>
            )}

            {app.first_deploy_date && (
              <div>
                <p className="text-sm text-gray-500 mb-1">First Deploy Date</p>
                <p className="font-medium">{formatDate(app.first_deploy_date)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tech Stack Section */}
        {app.tech_stack && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tech Stack</h2>
            <p className="text-gray-700">{app.tech_stack}</p>
          </div>
        )}

        {/* Quick Stats Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Users</p>
              <p className="text-2xl font-bold">{app.active_users}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Monthly Revenue</p>
              <p className="text-2xl font-bold">
                ${app.monthly_revenue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Uptime</p>
              <p className="text-2xl font-bold">{app.current_uptime.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Open Issues</p>
              <p className="text-2xl font-bold">{app.open_issues}</p>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Environment Variables Tab */}
      <TabsContent value="env-vars" className="mt-6">
        <EnvVarList appId={app.id} />
      </TabsContent>

      {/* Deployments Tab */}
      <TabsContent value="deployments" className="mt-6">
        <DeploymentList appId={app.id} />
      </TabsContent>

      {/* Repositories Tab */}
      <TabsContent value="repositories" className="mt-6">
        <RepositoryList appId={app.id} />
      </TabsContent>

      {/* Notes Tab */}
      <TabsContent value="notes" className="mt-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          {app.notes ? (
            <p className="text-gray-700 whitespace-pre-wrap">{app.notes}</p>
          ) : (
            <p className="text-gray-500 italic">No notes yet. Click Edit to add notes.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AppTabs;
