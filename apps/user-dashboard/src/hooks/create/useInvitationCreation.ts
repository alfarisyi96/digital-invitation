import { useState } from 'react'
import { useUserInvitations } from '@/hooks/useSupabaseData'
import { InvitationType, PackageType, WeddingFormData } from '@/services/supabaseService'

export function useInvitationCreation() {
  const { createInvitation, updateInvitation } = useUserInvitations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [createdInvitation, setCreatedInvitation] = useState<any>(null)

  const createNewInvitation = async (
    category: InvitationType,
    formData: WeddingFormData,
    packageType: PackageType,
    templateId?: string
  ) => {
    setIsSubmitting(true)
    try {
      const invitation = await createInvitation({
        title: formData.bride_full_name && formData.groom_full_name 
          ? `${formData.bride_full_name} & ${formData.groom_full_name} Wedding`
          : 'Wedding Invitation',
        type: category,
        form_data: formData,
        package_type: packageType
      })

      if (invitation && templateId) {
        // Apply the selected template
        await updateInvitation(invitation.id, {
          template_id: templateId
        })
      }

      setCreatedInvitation(invitation)
      return invitation
    } catch (error) {
      console.error('Error creating invitation:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateExistingInvitation = async (
    invitationId: string,
    formData: WeddingFormData,
    templateId?: string,
    existingInvitation?: any
  ) => {
    setIsSaving(true)
    try {
      const updateData = {
        title: formData.bride_full_name && formData.groom_full_name 
          ? `${formData.bride_full_name} & ${formData.groom_full_name} Wedding`
          : existingInvitation?.title || 'Wedding Invitation',
        event_date: formData.wedding_date ? new Date(formData.wedding_date).toISOString() : existingInvitation?.event_date,
        location: formData.venue_address || formData.venue_name || existingInvitation?.location,
        description: formData.invitation_message || existingInvitation?.description,
        custom_data: formData,
        template_id: templateId || existingInvitation?.template_id
      }

      const updatedInvitation = await updateInvitation(invitationId, updateData)
      setCreatedInvitation(updatedInvitation)
      return updatedInvitation
    } catch (error) {
      console.error('Error updating invitation:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  return {
    createNewInvitation,
    updateExistingInvitation,
    isSubmitting,
    isSaving,
    createdInvitation,
    setCreatedInvitation
  }
}
