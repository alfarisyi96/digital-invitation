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
    if (invitation?.public_slug && invitation.is_published) {
      // This would be the actual public URL on your landing page frontend
      const publicUrl = `${process.env.NEXT_PUBLIC_LANDING_PAGE_URL || 'https://your-landing-page.com'}/invite/${invitation.public_slug}`
      
      if (navigator.share) {
        navigator.share({
          title: invitation.title,
          text: `You're invited! ${invitation.description || ''}`,
          url: publicUrl,
        })
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(publicUrl).then(() => {
          alert('Public URL copied to clipboard!')
        })
      }
    } else {
      alert('Invitation must be published to share publicly')
    }
  }

  // Extract form data from custom_data
  const formData = invitation?.custom_data as any || {}

  return {
    // State
    invitation,
    formData,
    loading,
    error,
    
    // Actions
    handleBack,
    handleEdit,
    handleShare,
    
    // Utility
    slugOrId
  }
}
