import { getMarketingAppSummary } from '@/lib/actions/marketing-apps.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Share2, Mail } from 'lucide-react';

export default async function DashboardPage({ params }: { params: { appId: string } }) {
  const result = await getMarketingAppSummary(params.appId);

  if (!result.success) {
    return <div>Error loading dashboard: {result.error}</div>;
  }

  const summary = result.data!;

  const stats = [
    {
      title: 'Total Subscribers',
      value: summary.totalSubscribers,
      icon: Users,
      description: 'Active email subscribers',
    },
    {
      title: 'DevLogs Published',
      value: summary.totalDevLogs,
      icon: FileText,
      description: 'Build in public posts',
    },
    {
      title: 'Social Posts',
      value: summary.totalSocialPosts,
      icon: Share2,
      description: 'Scheduled & published',
    },
    {
      title: 'Email Campaigns',
      value: summary.totalEmailCampaigns,
      icon: Mail,
      description: 'Total campaigns sent',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Marketing Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your marketing efforts</CardDescription>
        </CardHeader>
        <CardContent>
          {summary.recentActivity && summary.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {summary.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No recent activity. Start by creating a devlog or scheduling a social post!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
