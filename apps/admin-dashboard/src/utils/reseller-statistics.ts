import { Reseller } from '@/services/reseller-api';
import { StatCardData } from '@/components/StatisticsCards';
import { Users, DollarSign, TrendingUp, Award } from 'lucide-react';

export function calculateResellerStatistics(resellers: Reseller[], total: number): StatCardData[] {
  const activeResellers = resellers.filter(reseller => reseller.status === 'ACTIVE').length;
  const premiumResellers = resellers.filter(reseller => reseller.type === 'PREMIUM').length;
  const averageCommission = resellers.length > 0 
    ? resellers.reduce((sum, reseller) => sum + reseller.commission_rate, 0) / resellers.length 
    : 0;

  return [
    {
      title: "Total Resellers",
      value: total,
      description: "All registered resellers",
      icon: Users,
    },
    {
      title: "Active Resellers",
      value: activeResellers,
      description: `${total > 0 ? ((activeResellers / total) * 100).toFixed(1) : 0}% of total`,
      icon: TrendingUp,
    },
    {
      title: "Premium Resellers",
      value: premiumResellers,
      description: "Premium tier resellers",
      icon: Award,
    },
    {
      title: "Avg Commission",
      value: `${averageCommission.toFixed(1)}%`,
      description: "Average commission rate",
      icon: DollarSign,
    },
  ];
}
