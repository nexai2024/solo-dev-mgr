import { Suspense } from 'react';
import { getMarketingApps } from '@/lib/actions/marketing-apps.actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Megaphone,
  Users,
  Mail,
  TrendingUp,
  MessageSquare,
  Gift,
  DollarSign,
  BarChart3,
  Plus,
} from 'lucide-react';

export default async function MarketingPage() {
  const result = await getMarketingApps();

  if (!result.success) {
    return <div>Error loading marketing apps: {result.error}</div>;
  }

  const apps = result.data || [];

  // If no apps, show onboarding
  if (apps.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Megaphone className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Welcome to Vantage Marketing</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your all-in-one marketing automation platform for indie developers
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>Audience Building</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Build in public, schedule social posts, manage waitlists, and optimize app store presence
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>Deep Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Email campaigns, community management, referral programs, and UGC galleries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>Monetization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Dynamic pricing, creator CRM, ad tracking, and abandonment recovery
                </p>
              </CardContent>
            </Card>
          </div>

          <Link href="/marketing/apps/new">
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Marketing App
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // If user has apps, show dashboard with first app selected
  const firstApp = apps[0];
  redirect(`/marketing/${firstApp.id}/dashboard`);
}
