"use client";

import Link from "next/link";
import { App } from "@/types";
import { Button } from "./ui/button";

interface AppCardProps {
  app: App;
}

// Status badge colors
const statusColors = {
  idea: "bg-blue-50 text-blue-700",
  development: "bg-orange-50 text-orange-700",
  staging: "bg-purple-50 text-purple-700",
  production: "bg-green-50 text-green-700",
  maintenance: "bg-pink-50 text-pink-700",
  archived: "bg-gray-100 text-gray-700",
};

// Status display names
const statusLabels = {
  idea: "Idea",
  development: "Development",
  staging: "Staging",
  production: "Production",
  maintenance: "Maintenance",
  archived: "Archived",
};

const AppCard = ({ app }: AppCardProps) => {
  // Format dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="flex flex-col gap-3 border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow h-[200px] w-[320px]">
      {/* Header: Name + Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-bold line-clamp-1">{app.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusColors[app.status]}`}>
          {statusLabels[app.status]}
        </span>
      </div>

      {/* Description */}
      <p className="text-[11px] text-gray-500 line-clamp-3 flex-1">
        {app.description || "No description provided"}
      </p>

      {/* Metadata */}
      <div className="space-y-1 text-[10px] text-gray-600">
        {app.tech_stack && (
          <div className="line-clamp-1">
            <span className="font-medium">Stack:</span> {app.tech_stack}
          </div>
        )}
        {app.status === 'production' && app.first_deploy_date && (
          <div>
            <span className="font-medium">Deployed:</span> {formatDate(app.first_deploy_date)}
          </div>
        )}
        {(app.status === 'development' || app.status === 'staging') && app.started_date && (
          <div>
            <span className="font-medium">Started:</span> {formatDate(app.started_date)}
          </div>
        )}
        {!app.first_deploy_date && !app.started_date && (
          <div>
            <span className="font-medium">Created:</span> {formatDate(app.created_at)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link href={`/apps/${app.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            View
          </Button>
        </Link>
        <Link href={`/apps/${app.id}/edit`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            Edit
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AppCard;
