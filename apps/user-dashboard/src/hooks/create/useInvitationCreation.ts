import { useState } from 'react'
import { useUserInvitations } from '@/hooks/useSupabaseData'
import { InvitationType, PackageType, WeddingFormData, supabaseService } from '@/services/supabaseService'
import { edgeFunctionsService } from '@/services/edgeFunctionsService'

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
      // Use secure invitation creation through Edge Function
      // The edge function handles both package validation and template access validation
      const result = await supabaseService.createInvitationSecure({
        title: formData.bride_full_name && formData.groom_full_name 
          ? `${formData.bride_full_name} & ${formData.groom_full_name} Wedding`
          : 'Wedding Invitation',
        type: category,
        template_id: templateId,
        form_data: formData
      })

      if (!result.success) {
        console.log('🚨 Invitation creation failed:', result)
        
        // Check for specific error types that should trigger upgrade flow
        if (result.error === 'Package limit exceeded') {
          console.log('📦 Creating PACKAGE_LIMIT_EXCEEDED error')
          const packageLimitError = new Error(result.error)
          // Add error type for UI to handle upgrade flow
          ;(packageLimitError as any).type = 'PACKAGE_LIMIT_EXCEEDED'
          ;(packageLimitError as any).details = result
          throw packageLimitError
        }
        
        if (result.error === 'Template not accessible with current package') {
          console.log('🔒 Creating TEMPLATE_ACCESS_DENIED error')
          const templateAccessError = new Error(result.error)
          ;(templateAccessError as any).type = 'TEMPLATE_ACCESS_DENIED'
          ;(templateAccessError as any).details = result
          throw templateAccessError
        }
        
        throw new Error(result.error || 'Failed to create invitation')
      }

      // Check if package was reset and show notification
      if (result.packageReset && result.packageReset.old_package !== 'basic') {
        console.log(`Package reset: ${result.packageReset.old_package} → ${result.packageReset.new_package}`)
        // You could add a toast notification here if you have a toast system
        // toast.info(`Your ${result.packageReset.old_package} package has been used and reset to basic. Purchase again for more premium invitations.`)
      }

      // Get the created invitation details
      const invitation = {
        id: result.invitationId,
        title: formData.bride_full_name && formData.groom_full_name 
          ? `${formData.bride_full_name} & ${formData.groom_full_name} Wedding`
          : 'Wedding Invitation',
        // Add other necessary fields
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
