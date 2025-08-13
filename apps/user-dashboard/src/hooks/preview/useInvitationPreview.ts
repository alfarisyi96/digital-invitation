import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { type Invitation } from '@/services/supabaseService'
import { useUserInvitations } from '@/hooks/useSupabaseData'

export function useInvitationPreview() {
  const params = useParams()
  const router = useRouter()
  const slugOrId = params.id as string
  const { invitations } = useUserInvitations()
  
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    if (slugOrId && invitations.length > 0) {
      loadInvitation()
    }
  }, [slugOrId, invitations])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      
      // First try to find by public_slug, then by ID
      let found = invitations.find(inv => inv.public_slug === slugOrId)
      if (!found) {
        found = invitations.find(inv => inv.id === slugOrId)
      }
      
      if (found) {
        setInvitation(found)
        setError(null)
      } else {
        setError('Invitation not found')
      }
    } catch (err) {
      setError('Failed to load invitation')
      console.error('Error loading invitation:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  const handleEdit = () => {
    if (invitation?.id) {
      router.push(`/create?step=1&edit=${invitation.id}`)
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  // Extract form data from custom_data
  const formData = invitation?.custom_data as any || {}

  // Prepare share invitation data
  const shareInvitationData = invitation ? {
    id: invitation.id,
    title: invitation.title,
    public_slug: invitation.public_slug || undefined,
    bride_full_name: formData?.bride_full_name,
    groom_full_name: formData?.groom_full_name,
    ceremony_date: formData?.ceremony_date
  } : null

  return {
    // State
    invitation,
    formData,
    loading,
    error,
    showShareModal,
    shareInvitationData,
    
    // Actions
    handleBack,
    handleEdit,
    handleShare,
    setShowShareModal,
    
    // Utility
    slugOrId
  }
}
