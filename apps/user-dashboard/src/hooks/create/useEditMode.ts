import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Invitation } from '@/services/supabaseService'
import { WeddingFormValues } from './useWeddingForm'

export function useEditMode(
  form: UseFormReturn<WeddingFormValues>,
  editId: string | null,
  invitations: Invitation[]
) {
  const [isEditMode] = useState(!!editId)
  const [existingInvitation, setExistingInvitation] = useState<Invitation | null>(null)

  useEffect(() => {
    if (isEditMode && editId && invitations.length > 0) {
      const invitation = invitations.find(inv => inv.id === editId)
      if (invitation) {
        setExistingInvitation(invitation)
        
        // Populate form with existing data
        const customData = invitation.custom_data as any
        if (customData) {
          console.log('🔍 Edit mode - Loading invitation data:', {
            invitationId: invitation.id,
            customData,
            events: customData.events,
            gift_accounts: customData.gift_accounts
          })
          
          const formValues: WeddingFormValues = {
            title: invitation.title || '',
            bride_full_name: customData.bride_full_name || '',
            bride_nickname: customData.bride_nickname || '',
            groom_full_name: customData.groom_full_name || '',
            groom_nickname: customData.groom_nickname || '',
            wedding_date: invitation.event_date ? 
              invitation.event_date.split('T')[0] : '',
            ceremony_time: customData.ceremony_time || '',
            reception_time: customData.reception_time || '',
            venue_name: customData.venue_name || '',
            venue_address: invitation.location || customData.venue_address || '',
            invitation_message: invitation.description || customData.invitation_message || '',
            bride_father: customData.bride_father || '',
            bride_mother: customData.bride_mother || '',
            groom_father: customData.groom_father || '',
            groom_mother: customData.groom_mother || '',
            // Enhanced fields
            events: customData.events || [],
            gift_accounts: customData.gift_accounts || [],
          }
          
          console.log('🔄 Edit mode - Setting form values:', formValues)
          form.reset(formValues)
          
          // Force sync enhanced fields after a brief delay to ensure form state is updated
          setTimeout(() => {
            console.log('🔄 Edit mode - Force syncing enhanced fields after reset')
            form.setValue('events', formValues.events, { shouldValidate: true })
            form.setValue('gift_accounts', formValues.gift_accounts, { shouldValidate: true })
          }, 100)
        }
      }
    }
  }, [isEditMode, editId, invitations, form])

  return {
    isEditMode,
    existingInvitation
  }
}
