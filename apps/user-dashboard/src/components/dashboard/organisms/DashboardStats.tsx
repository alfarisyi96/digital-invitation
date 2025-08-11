import React from 'react'
import { Package2, Plus, Eye, Calendar } from 'lucide-react'
import type { Invitation } from '@/services/supabaseService'

interface DashboardStatsProps {
  invitations: Invitation[]
}

export function DashboardStats({ invitations }: DashboardStatsProps) {
  const stats = [
    {
      name: 'Total Invitations',
      value: invitations.length.toString(),
      icon: Package2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Draft',
      value: invitations.filter((inv: Invitation) => !inv.is_published).length.toString(),
      icon: Plus,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Published',
      value: invitations.filter((inv: Invitation) => inv.is_published).length.toString(),
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'This Month',
      value: invitations.filter((inv: Invitation) => {
        const invDate = new Date(inv.created_at)
        const now = new Date()
        return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear()
      }).length.toString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="px-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
