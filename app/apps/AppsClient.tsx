"use client";

import { useState } from "react";
import Link from "next/link";
import { App, AppStatus } from "@/types";
import AppCard from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface AppsClientProps {
  apps: App[];
}

const AppsClient = ({ apps }: AppsClientProps) => {
  const [statusFilter, setStatusFilter] = useState<AppStatus | "all">("all");

  // Filter apps based on selected status
  const filteredApps =
    statusFilter === "all"
      ? apps
      : apps.filter((app) => app.status === statusFilter);

  // Count apps by status
  const statusCounts = {
    all: apps.length,
    development: apps.filter((app) => app.status === "development").length,
    production: apps.filter((app) => app.status === "production").length,
    archived: apps.filter((app) => app.status === "archived").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center max-sm:flex-col max-sm:gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">My Apps ({apps.length})</h1>
          <p className="text-sm text-gray-500">
            Track and manage your applications from idea to production
          </p>
        </div>
        <Link href="/apps/new" className="max-sm:w-full">
          <Button className="max-sm:w-full">
            <PlusIcon className="w-4 h-4 mr-2" />
            New App
          </Button>
        </Link>
      </div>

      {apps.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <p className="text-gray-500 text-center">
            No apps yet. Create your first app to get started.
          </p>
          <Link href="/apps/new">
            <Button size="lg">
              <PlusIcon className="w-5 h-5 mr-2" />
              New App
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All ({statusCounts.all})
            </Button>
            <Button
              variant={statusFilter === "development" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("development")}
            >
              Development ({statusCounts.development})
            </Button>
            <Button
              variant={statusFilter === "production" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("production")}
            >
              Production ({statusCounts.production})
            </Button>
            <Button
              variant={statusFilter === "archived" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("archived")}
            >
              Archived ({statusCounts.archived})
            </Button>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No apps found with status &quot;{statusFilter}&quot;
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppsClient;
