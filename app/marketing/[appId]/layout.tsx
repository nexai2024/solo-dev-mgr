import { ReactNode } from 'react';
import { getMarketingAppById } from '@/lib/actions/marketing-apps.actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Share2,
  Search,
  Users,
  Mail,
  MessageSquare,
  Gift,
  Image,
  DollarSign,
  UserPlus,
  TrendingUp,
  BarChart3,
  Sparkles,
  FileBox,
  Network,
} from 'lucide-react';

export default async function AppLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { appId: string };
}) {
  const result = await getMarketingAppById(params.appId);

  if (!result.success || !result.data) {
    notFound();
  }

  const app = result.data;

  const navigation = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', href: `/marketing/${app.id}/dashboard`, icon: LayoutDashboard },
      ],
    },
    {
      title: 'Audience Building',
      items: [
        { name: 'DevLogs', href: `/marketing/${app.id}/devlogs`, icon: FileText },
        { name: 'Social Scheduler', href: `/marketing/${app.id}/social`, icon: Share2 },
        { name: 'ASO Keywords', href: `/marketing/${app.id}/aso`, icon: Search },
        { name: 'Waitlist', href: `/marketing/${app.id}/waitlist`, icon: Users },
      ],
    },
    {
      title: 'Engagement',
      items: [
        { name: 'Email Campaigns', href: `/marketing/${app.id}/email`, icon: Mail },
        { name: 'Community', href: `/marketing/${app.id}/community`, icon: MessageSquare },
        { name: 'Referrals', href: `/marketing/${app.id}/referrals`, icon: Gift },
        { name: 'UGC Gallery', href: `/marketing/${app.id}/ugc`, icon: Image },
      ],
    },
    {
      title: 'Monetization',
      items: [
        { name: 'Pricing & Offers', href: `/marketing/${app.id}/pricing`, icon: DollarSign },
        { name: 'Creator CRM', href: `/marketing/${app.id}/creators`, icon: UserPlus },
        { name: 'Ad Campaigns', href: `/marketing/${app.id}/ads`, icon: TrendingUp },
      ],
    },
    {
      title: 'Analytics',
      items: [
        { name: 'North Star', href: `/marketing/${app.id}/analytics`, icon: BarChart3 },
        { name: 'Vibe Check', href: `/marketing/${app.id}/vibe-check`, icon: Sparkles },
        { name: 'Press Kit', href: `/marketing/${app.id}/press-kit`, icon: FileBox },
        { name: 'Cross-Promo', href: `/marketing/${app.id}/cross-promo`, icon: Network },
      ],
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r overflow-y-auto">
        <div className="p-6">
          <Link href="/marketing">
            <h2 className="text-lg font-bold mb-1">{app.name}</h2>
          </Link>
          <p className="text-xs text-muted-foreground truncate">{app.description}</p>
        </div>

        <nav className="px-3 pb-6">
          {navigation.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
