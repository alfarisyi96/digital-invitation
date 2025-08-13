import React from 'react'
import Header from '@/components/Header'
import { WelcomeSection } from '../molecules/WelcomeSection'
import { SearchBar } from '../molecules/SearchBar'
import { DashboardStats } from '../organisms/DashboardStats'
import { InvitationsList } from '../organisms/InvitationsList'
import type { Invitation } from '@/services/supabaseService'

interface DashboardLayoutProps {
  loading: boolean
  userName: string
  invitations: Invitation[]
  filteredInvitations: Invitation[]
  searchQuery: string
  actionLoading: string | null
  onCreateInvitation: () => void
  onSearchChange: (query: string) => void
  onEdit: (id: string, category: string) => void
  onPublish: (id: string) => void
  onUnpublish: (id: string) => void
  onPreview: (slugOrId: string) => void
  onManage: (id: string) => void
  getStatusBadge: (status: string, isPublished: boolean) => string
}

export function DashboardLayout({
  loading,
  userName,
  invitations,
  filteredInvitations,
  searchQuery,
  actionLoading,
  onCreateInvitation,
  onSearchChange,
  onEdit,
  onPublish,
  onUnpublish,
  onPreview,
  onManage,
  getStatusBadge
}: DashboardLayoutProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto">
          <WelcomeSection 
            userName={userName}
            onCreateInvitation={onCreateInvitation}
          />
          
          <DashboardStats invitations={invitations} />
          
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
          
          <InvitationsList
            invitations={filteredInvitations}
            actionLoading={actionLoading}
            onEdit={onEdit}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            onPreview={onPreview}
            onManage={onManage}
            getStatusBadge={getStatusBadge}
          />
        </div>
      </main>
    </div>
  )
}
