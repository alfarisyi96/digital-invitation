'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  Settings,
  Shield,
  BarChart3,
  Mail,
  Crown,
  CreditCard,
  MessageSquare,
  UserCheck,
  Palette
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: string;
  requiredRole?: string | string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
    requiredPermission: 'manage_users',
  },
  {
    title: 'Invitations',
    href: '/dashboard/invites',
    icon: Mail,
    requiredPermission: 'manage_invitations',
  },
  {
    title: 'Plans',
    href: '/dashboard/plans',
    icon: Package,
    requiredPermission: 'manage_plans',
  },
  {
    title: 'Templates',
    href: '/dashboard/templates',
    icon: Palette,
    requiredPermission: 'manage_templates',
  },
  {
    title: 'Resellers',
    href: '/dashboard/resellers',
    icon: Crown,
    requiredPermission: 'manage_resellers',
  },
  {
    title: 'Payments',
    href: '/dashboard/payments',
    icon: CreditCard,
    requiredPermission: 'manage_payments',
  },
  {
    title: 'Guestbook',
    href: '/dashboard/guestbook',
    icon: MessageSquare,
    requiredPermission: 'manage_guestbook',
  },
  {
    title: 'RSVPs',
    href: '/dashboard/rsvps',
    icon: UserCheck,
    requiredPermission: 'manage_rsvps',
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    requiredPermission: 'view_analytics',
  },
  {
    title: 'Admin Users',
    href: '/dashboard/admin-users',
    icon: Shield,
    requiredRole: 'super_admin',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    requiredRole: 'super_admin',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { hasPermission, hasRole } = useAuth();

  const isNavItemVisible = (item: NavItem) => {
    if (item.requiredRole && !hasRole(item.requiredRole)) {
      return false;
    }
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      return false;
    }
    return true;
  };

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.filter(isNavItemVisible).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
