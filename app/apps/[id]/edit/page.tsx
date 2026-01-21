"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AppForm from "@/components/AppForm";
import { getApp, updateApp } from "@/lib/actions/app.actions";
import { App } from "@/types";

const EditAppPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [app, setApp] = useState<App | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const appData = await getApp(id);
        if (!appData) {
          router.push("/apps");
          return;
        }
        setApp(appData);
      } catch (error) {
        console.error("Failed to fetch app:", error);
        router.push("/apps");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApp();
  }, [id, router]);

  const handleSubmit = async (data: unknown) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateApp(id, data as any);
      router.push(`/apps/${id}`);
    } catch (error) {
      console.error("Failed to update app:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="text-center">Loading...</div>
      </main>
    );
  }

  if (!app) {
    return null;
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <nav className="text-sm text-gray-500 mb-4">
          DevManager / Apps / {app.name} / Edit
        </nav>
        <h1 className="text-3xl font-bold">Edit App</h1>
      </div>
      <AppForm mode="edit" defaultValues={app} onSubmit={handleSubmit} />
    </main>
  );
};

export default EditAppPage;
