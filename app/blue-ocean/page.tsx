import { getUserAnalyses } from "@/lib/actions/blueocean.actions";
import { BlueOceanClient } from "./BlueOceanClient";

export default async function BlueOceanDashboard() {
  const analyses = await getUserAnalyses();

  return <BlueOceanClient analyses={analyses} />;
}
