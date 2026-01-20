"use client";

import { App } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { deleteApp } from "@/lib/actions/app.actions";
import { useState } from "react";
import AppTabs from "@/components/AppTabs";

interface AppDetailClientProps {
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

const AppDetailClient = ({ app }: AppDetailClientProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);


  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this app? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteApp(app.id);
      router.push("/apps");
    } catch (error) {
      console.error("Failed to delete app:", error);
      alert("Failed to delete app. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/apps" className="hover:underline">
              Apps
            </Link>{" "}
            / {app.name}
          </nav>
          <div className="flex items-start gap-4 mb-4">
            <h1 className="text-4xl font-bold">{app.name}</h1>
            <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[app.status]}`}>
              {statusLabels[app.status]}
            </span>
          </div>
          {app.description && (
            <p className="text-gray-600 max-w-3xl">{app.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/apps/${app.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Tabbed Interface */}
      <AppTabs app={app} />
    </div>
  );
};

export default AppDetailClient;
