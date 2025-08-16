import { useState, useEffect, useRef } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Invitation } from '@/services/supabaseService'
import { WeddingFormValues } from './useWeddingForm'

export function useEditMode(
  form: UseFormReturn<WeddingFormValues>,
  editId: string | null,
  invitations: Invitation[],
  setSelectedTemplate?: (templateId: string | null) => void,
  setSelectedCategory?: (category: any) => void,
  setCurrentStep?: (step: number) => void
) {
  const [isEditMode] = useState(!!editId)
  const [existingInvitation, setExistingInvitation] = useState<Invitation | null>(null)
  // Ensure we only initialize once per editId to avoid loops
  const initializedRef = useRef<string | null>(null)

  // Helper function to load images into localStorage
  const loadImagesToLocalStorage = (customData: any, imagesField: any) => {
    try {
      console.log('🖼️ Loading images from database to localStorage:', {
        customData_images: customData,
        images_field: imagesField
      })
      
      const existingCustomizations = JSON.parse(localStorage.getItem('templateCustomization') || '{}')
      
      // Try to get images from custom_data first, then from images field
      let imageData = null
      if (customData && (customData.hero_image || customData.bride_image || customData.groom_image || customData.gallery_photos)) {
        // Images are in custom_data (old format)
        imageData = {
          hero_image: customData.hero_image || '',
          bride_image: customData.bride_image || '',
          groom_image: customData.groom_image || '',
          gallery_photos: customData.gallery_photos || []
        }
        console.log('📍 Found images in custom_data:', imageData)
      } else if (imagesField) {
        // Images are in separate images field (new format)
        imageData = {
          hero_image: imagesField.hero_image || '',
          bride_image: imagesField.bride_image || '',
          groom_image: imagesField.groom_image || '',
          gallery_photos: imagesField.gallery_photos || []
        }
        console.log('📍 Found images in images field:', imageData)
      }

      if (imageData) {
        const customImages = {
          hero: imageData.hero_image || '',
          bride: imageData.bride_image || '',
          groom: imageData.groom_image || '',
          gallery: imageData.gallery_photos || []
        }
        
        localStorage.setItem('templateCustomization', JSON.stringify({
          ...existingCustomizations,
          customImages
        }))
        
        console.log('✅ Images loaded to localStorage for editing:', customImages)
        
        // Trigger custom event to notify image management hook
        window.dispatchEvent(new CustomEvent('templateImagesUpdated'))
      } else {
        console.log('⚠️ No images found in either custom_data or images field')
      }
    } catch (error) {
      console.error('Failed to load images to localStorage:', error)
    }
  }

  useEffect(() => {
    if (isEditMode && editId && invitations.length > 0) {
      // Skip if we've already initialized for this editId
      if (initializedRef.current === editId) return

      const invitation = invitations.find(inv => inv.id === editId)
      if (invitation) {
        setExistingInvitation(invitation)
        
        console.log('🔍 Edit mode - Loading invitation for editing:', {
          invitationId: invitation.id,
          templateId: invitation.template_id,
          category: invitation.category,
          customData: invitation.custom_data,
          images: invitation.images
        })
        
        // Set template selection state if template_id exists
        if (invitation.template_id && setSelectedTemplate) {
          console.log('🎨 Edit mode - Setting selected template:', invitation.template_id)
          setSelectedTemplate(invitation.template_id)
        }
        
        // Set category if it exists and setter is provided
        if (invitation.category && setSelectedCategory) {
          console.log('📂 Edit mode - Setting selected category:', invitation.category)
          setSelectedCategory(invitation.category as any)
        }
        
  // Do NOT auto-advance the step in edit mode; user should start from step 1
  // Previously we navigated to step 4 (template editor) automatically.
  // This has been removed per UX request to keep users on step 1 when editing.
        
        // Populate form with existing data
        const customData = invitation.custom_data as any
        if (customData) {
          console.log('🔍 Edit mode - Loading invitation data:', {
            invitationId: invitation.id,
            customData,
            events: customData.events,
            gift_accounts: customData.gift_accounts,
            images: invitation.images
          })
          
          // Load images from database to localStorage (check both locations)
          loadImagesToLocalStorage(customData, invitation.images)
          
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

    // Mark initialized for this editId
    initializedRef.current = editId
      }
    }
  }, [isEditMode, editId, invitations, form])

  return {
    isEditMode,
    existingInvitation
  }
}
