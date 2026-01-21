import { notFound } from "next/navigation";
import { getApp } from "@/lib/actions/app.actions";
import AppDetailClient from "./AppDetailClient";

interface AppDetailPageProps {
  params: Promise<{ id: string }>;
}

const AppDetailPage = async ({ params }: AppDetailPageProps) => {
  const { id } = await params;
  const app = await getApp(id);

  if (!app) {
    notFound();
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <AppDetailClient app={app} />
    </main>
  );
};

export default AppDetailPage;
