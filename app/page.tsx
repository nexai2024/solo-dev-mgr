import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="container mx-auto py-16 px-4">
      <section className="flex flex-col gap-6 max-w-4xl">
        <h1 className="text-5xl font-bold">Welcome to DevManager</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          Your all-in-one platform for managing indie development projects from idea to production
        </h2>
        <p className="text-lg text-gray-600">
          Track, manage, and monitor the apps you create with comprehensive metadata,
          environment variables, deployment history, and more. Perfect for solo developers
          and small teams building custom applications.
        </p>
        <div className="flex gap-4 mt-4 flex-wrap">
          <Link href="/apps">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/apps/new">
            <Button variant="outline" size="lg">Create Your First App</Button>
          </Link>
          <Link href="/blue-ocean">
            <Button variant="outline" size="lg" className="bg-blue-50 hover:bg-blue-100">Blue Ocean Strategy</Button>
          </Link>
          <Link href="/marketing">
            <Button variant="outline" size="lg" className="bg-purple-50 hover:bg-purple-100">Marketing Automation</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
