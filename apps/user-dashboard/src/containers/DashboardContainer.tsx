import React from 'react'
import { useDashboard } from '../hooks/dashboard/useDashboard'
import { DashboardLayout } from '../components/dashboard/templates/DashboardLayout'

export function DashboardContainer() {
  const {
    user,
    profile,
    invitations,
    filteredInvitations,
    searchQuery,
    actionLoading,
    loading,
    setSearchQuery,
    handleCreateInvitation,
    handleEditInvitation,
    handlePublishInvitation,
    handleUnpublishInvitation,
    openInvitationPreview,
    handleManageInvitation,
    getStatusBadge
  } = useDashboard()

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <DashboardLayout
      loading={loading}
      userName={userName}
      invitations={invitations}
      filteredInvitations={filteredInvitations}
      searchQuery={searchQuery}
      actionLoading={actionLoading}
      onCreateInvitation={handleCreateInvitation}
      onSearchChange={setSearchQuery}
      onEdit={handleEditInvitation}
      onPublish={handlePublishInvitation}
      onUnpublish={handleUnpublishInvitation}
      onPreview={openInvitationPreview}
      onManage={handleManageInvitation}
      getStatusBadge={getStatusBadge}
    />
  )
}
