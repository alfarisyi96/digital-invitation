import { BackendUser } from '@/types';
import { StatCardData } from '@/components/StatisticsCards';
import { Users, UserCheck, UserX, Plus } from 'lucide-react';

export function calculateUserStatistics(users: BackendUser[], total: number): StatCardData[] {
  const withReseller = users.filter(user => user.reseller_id).length;
  const withInvites = users.filter(user => user.invites && user.invites.length > 0).length;
  
  const recentSignups = users.filter(user => {
    const createdAt = new Date(user.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt > thirtyDaysAgo;
  }).length;

  return [
    {
      title: "Total Users",
      value: total,
      description: `${recentSignups} from last month`,
      icon: Users,
      trend: {
        value: recentSignups,
        label: "from last month",
        positive: true,
      },
    },
    {
      title: "With Reseller",
      value: withReseller,
      description: `${total > 0 ? ((withReseller / total) * 100).toFixed(1) : 0}% of total`,
      icon: UserCheck,
    },
    {
      title: "Active Users",
      value: withInvites,
      description: "Users with invitations",
      icon: UserX,
    },
    {
      title: "Recent Signups",
      value: recentSignups,
      description: "Last 30 days",
      icon: Plus,
    },
  ];
}
