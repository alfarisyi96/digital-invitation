import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/SupabaseUserContext'
import { useUserInvitations, useUserProfile } from '@/hooks/useSupabaseData'

export function useDashboard() {
  const { user } = useUser()
  const router = useRouter()
  const { 
    invitations, 
    loading: invitationsLoading, 
    publishInvitation,
    unpublishInvitation 
  } = useUserInvitations()
  const { profile, loading: profileLoading } = useUserProfile()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filter invitations based on search query (client-side filtering of RLS-filtered data)
  const filteredInvitations = invitations.filter(invitation =>
    invitation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (invitation.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCreateInvitation = () => {
    router.push('/create?step=1')
  }

  const handleEditInvitation = (id: string, category: string) => {
    router.push(`/create?step=1&edit=${id}&category=${category}`)
  }

  const handlePublishInvitation = async (id: string) => {
    setActionLoading(id)
    try {
      await publishInvitation(id)
    } catch (error) {
      console.error('Error publishing invitation:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnpublishInvitation = async (id: string) => {
    setActionLoading(id)
    try {
      await unpublishInvitation(id)
    } catch (error) {
      console.error('Error unpublishing invitation:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const openInvitationPreview = (slugOrId: string) => {
    if (slugOrId) {
      // For private preview in user dashboard - use a preview route that doesn't require public publishing
      // This route would be handled within the user dashboard app for private previews
      window.open(`/preview/${slugOrId}`, '_blank')
    }
  }

  const handleManageInvitation = (id: string) => {
    router.push(`/dashboard/invitations/${id}`)
  }

  const getStatusBadge = (status: string, isPublished: boolean) => {
    if (isPublished) {
      return 'bg-green-100 text-green-800'
    } else {
      return 'bg-red-100 text-red-800'
    }
  }

  // Calculate dashboard statistics
  const stats = {
    total: invitations.length,
    draft: invitations.filter(inv => !inv.is_published).length,
    published: invitations.filter(inv => inv.is_published).length,
    totalViews: invitations.reduce((total, inv) => total + (inv.unique_visitors || 0), 0)
  }

  return {
    // State
    user,
    profile,
    invitations,
    filteredInvitations,
    searchQuery,
    actionLoading,
    loading: profileLoading || invitationsLoading,
    stats,
    
    // Actions
    setSearchQuery,
    handleCreateInvitation,
    handleEditInvitation,
    handlePublishInvitation,
    handleUnpublishInvitation,
    openInvitationPreview,
    handleManageInvitation,
    getStatusBadge
  }
}
