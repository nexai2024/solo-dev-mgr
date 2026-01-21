import { getApps } from "@/lib/actions/app.actions";
import { NewAnalysisClient } from "./NewAnalysisClient";

export default async function NewAnalysisPage() {
  const apps = await getApps();

  return <NewAnalysisClient apps={apps} />;
}
