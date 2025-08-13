'use client'

import { withAuth } from '@/contexts/SupabaseUserContext'
import { DashboardContainer } from '@/containers/dashboard/DashboardContainer'

function DashboardPage() {
  return <DashboardContainer />
}

export default withAuth(DashboardPage)
