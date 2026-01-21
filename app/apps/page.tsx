import { getApps } from "@/lib/actions/app.actions";
import AppsClient from "./AppsClient";

const AppsPage = async () => {
  const apps = await getApps();

  return (
    <main className="container mx-auto py-8 px-4">
      <AppsClient apps={apps} />
    </main>
  );
};

export default AppsPage;
