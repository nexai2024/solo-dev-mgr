"use client";

import { useRouter } from "next/navigation";
import AppForm from "@/components/AppForm";
import { createApp } from "@/lib/actions/app.actions";

const NewAppPage = () => {
  const router = useRouter();

  const handleSubmit = async (data: unknown) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createApp(data as any);
      router.push(`/apps`);
    } catch (error) {
      console.error("Failed to create app:", error);
      throw error;
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <nav className="text-sm text-gray-500 mb-4">
          Vantage / Apps / New App
        </nav>
        <h1 className="text-3xl font-bold">Create New App</h1>
      </div>
      <AppForm mode="create" onSubmit={handleSubmit} />
    </main>
  );
};

export default NewAppPage;
