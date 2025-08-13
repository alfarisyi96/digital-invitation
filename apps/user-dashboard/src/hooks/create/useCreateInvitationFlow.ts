import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  useStepNavigation,
  useInvitationCreation,
  useEditMode,
  usePackageManagement,
  useFormData,
  useModalState,
  useWeddingForm,
  useStepHandlers,
  useSessionManagement,
  useDraftPersistence
} from '@/hooks/create'
import { useUserInvitations, usePublicTemplates } from '@/hooks/useSupabaseData'
import { Template } from '@/services/supabaseService'

/**
 * Custom Hook: Complete Create Invitation Business Logic
 * 
 * Encapsulates ALL business logic for the create invitation flow:
 * - State management
 * - Data fetching  
 * - Business operations
 * - Event handlers
 * - Navigation logic
 * 
 * Returns everything the container needs for rendering
 */
export function useCreateInvitationFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { invitations } = useUserInvitations()
  
  // Edit mode detection
  const editId = searchParams.get('edit')
  
  // Session and draft management
  const sessionManagement = useSessionManagement()
  const draftPersistence = useDraftPersistence(sessionManagement.sessionId)
  
  // Core state management via hooks
  const navigationState = useStepNavigation()
  const packageState = usePackageManagement()
  const formDataState = useFormData()
  const modalState = useModalState()
  
  // Draft recovery state
  const [showDraftRecovery, setShowDraftRecovery] = useState(false)
  const [draftInfo, setDraftInfo] = useState<any>(null)
  const [hasCheckedInitialDraft, setHasCheckedInitialDraft] = useState(false)
  const [isRestoringDraft, setIsRestoringDraft] = useState(false)
  const [originalDraftStep, setOriginalDraftStep] = useState<number | null>(null)
  
  // Form and data management
  const form = useWeddingForm()
  const editModeState = useEditMode(form, editId, invitations)
  const { templates, loading: templatesLoading } = usePublicTemplates(navigationState.selectedCategory || undefined)
  
  // Derived state
  const selectedTemplateData = templates.find((t: Template) => t.id === navigationState.selectedTemplate)
  const shouldShowSaveButton = navigationState.currentStep === 5

  // Business operations
  const invitationOperations = useInvitationCreation()

  // Sync form data with form state (for auto-fill functionality)
  useEffect(() => {
    if (formDataState.formData && !editModeState.isEditMode) {
      const formValues = {
        title: 'Wedding Invitation',
        bride_full_name: formDataState.formData.bride_full_name || '',
        bride_nickname: formDataState.formData.bride_nickname || '',
        groom_full_name: formDataState.formData.groom_full_name || '',
        groom_nickname: formDataState.formData.groom_nickname || '',
        wedding_date: formDataState.formData.wedding_date || '',
        ceremony_time: formDataState.formData.ceremony_time || '',
        reception_time: formDataState.formData.reception_time || '',
        venue_name: formDataState.formData.venue_name || '',
        venue_address: formDataState.formData.venue_address || '',
        invitation_message: formDataState.formData.invitation_message || '',
        bride_father: formDataState.formData.bride_father || '',
        bride_mother: formDataState.formData.bride_mother || '',
        groom_father: formDataState.formData.groom_father || '',
        groom_mother: formDataState.formData.groom_mother || '',
        // Enhanced fields
        events: formDataState.formData.events || [],
        gift_accounts: formDataState.formData.gift_accounts || [],
      }
      
      console.log('🔄 Syncing form data with form state:', formValues)
      form.reset(formValues)
    }
  }, [formDataState.formData, form, editModeState.isEditMode])

  // Draft persistence effects
  useEffect(() => {
    // Auto-save form data to draft (skip during restoration AND initial load)
    if (!isRestoringDraft && hasCheckedInitialDraft && formDataState.formData) {
      console.log('💾 Auto-saving form data to draft:', formDataState.formData)
      draftPersistence.updateDraftFormData(formDataState.formData)
    }
  }, [formDataState.formData, isRestoringDraft, hasCheckedInitialDraft])

  useEffect(() => {
    // Auto-save category to draft (skip during restoration AND initial load)
    if (!isRestoringDraft && hasCheckedInitialDraft && navigationState.selectedCategory) {
      console.log('💾 Auto-saving category to draft:', navigationState.selectedCategory)
      draftPersistence.updateDraftCategory(navigationState.selectedCategory)
    }
  }, [navigationState.selectedCategory, isRestoringDraft, hasCheckedInitialDraft])

  useEffect(() => {
    // Auto-save template to draft (skip during restoration AND initial load)
    if (!isRestoringDraft && hasCheckedInitialDraft && navigationState.selectedTemplate) {
      console.log('💾 Auto-saving template to draft:', navigationState.selectedTemplate)
      draftPersistence.updateDraftTemplate(navigationState.selectedTemplate)
    }
  }, [navigationState.selectedTemplate, isRestoringDraft, hasCheckedInitialDraft])

  useEffect(() => {
    // Auto-save current step to draft (skip during restoration AND initial load)
    if (!isRestoringDraft && hasCheckedInitialDraft) {
      console.log('💾 Auto-saving step to draft:', navigationState.currentStep)
      draftPersistence.updateDraftStep(navigationState.currentStep)
    } else {
      console.log('⏸️ Skipping step auto-save:', { isRestoringDraft, hasCheckedInitialDraft, currentStep: navigationState.currentStep })
    }
  }, [navigationState.currentStep, isRestoringDraft, hasCheckedInitialDraft])

  // Restore draft on mount (ONLY on initial page load)
  useEffect(() => {
    console.log('🔍 Draft check effect triggered:', {
      hasCheckedInitialDraft,
      isDraftAvailable: draftPersistence.isDraftAvailable,
      isEditMode: editModeState.isEditMode,
      showDraftRecovery
    })
    
    // Only check for draft on the very first load, not on subsequent state changes
    if (!hasCheckedInitialDraft && !editModeState.isEditMode) {
      console.log('🎯 Performing initial draft check...')
      
      if (draftPersistence.isDraftAvailable) {
        const info = draftPersistence.getDraftInfo()
        console.log('🔄 Draft info retrieved:', info)
        if (info && info.isRecent) {
          console.log('✨ Found recent draft on initial load - showing recovery option:', info)
          
          // Double-check what's actually in localStorage
          const rawDraft = localStorage.getItem('draft_invitation_global')
          const parsedDraft = rawDraft ? JSON.parse(rawDraft) : null
          console.log('🔍 Raw localStorage draft:', parsedDraft)
          
          // Cache the original step before any auto-saves can overwrite it
          if (parsedDraft && parsedDraft.currentStep) {
            setOriginalDraftStep(parsedDraft.currentStep)
            console.log('📌 Cached original draft step:', parsedDraft.currentStep)
          }
          
          setDraftInfo(info)
          setShowDraftRecovery(true)
        } else {
          console.log('❌ Draft found but not recent or invalid')
        }
      } else {
        console.log('❌ No draft available')
      }
      
      setHasCheckedInitialDraft(true) // Mark that we've done the initial check
      console.log('✅ Initial draft check completed, hasCheckedInitialDraft set to true')
    } else {
      console.log('⏭️ Skipping draft check:', {
        reason: hasCheckedInitialDraft ? 'Already checked' : 'Edit mode active'
      })
    }
  }, [draftPersistence.isDraftAvailable, editModeState.isEditMode, hasCheckedInitialDraft])

  // Draft recovery handlers
  const handleRestoreDraft = () => {
    setIsRestoringDraft(true) // Prevent auto-save during restoration
    
    const draft = draftPersistence.restoreDraft()
    if (draft) {
      console.log('🔄 Restoring draft data:', draft)
      console.log('🔄 Current state before restoration:', {
        currentStep: navigationState.currentStep,
        selectedCategory: navigationState.selectedCategory,
        selectedTemplate: navigationState.selectedTemplate,
        formData: formDataState.formData
      })
      
      // Restore navigation state in sequence
      if (draft.selectedCategory) {
        console.log('🔄 Setting category:', draft.selectedCategory)
        navigationState.setSelectedCategory(draft.selectedCategory)
      }
      if (draft.selectedTemplate) {
        console.log('🔄 Setting template:', draft.selectedTemplate)
        navigationState.setSelectedTemplate(draft.selectedTemplate)
      }
      
      // Restore form data
      if (draft.formData) {
        console.log('🔄 Setting form data:', draft.formData)
        formDataState.updateFormData(draft.formData)
      }
      
      // Restore step LAST to ensure all prerequisites are set
      const stepToRestore = originalDraftStep || draft.currentStep
      console.log('🔄 Setting step from', navigationState.currentStep, 'to', stepToRestore, '(original cached:', originalDraftStep, ', draft contains:', draft.currentStep, ')')
      
      // Use setTimeout to ensure step is set after other state updates
      setTimeout(() => {
        navigationState.setCurrentStep(stepToRestore)
        console.log('✅ Step restoration completed:', stepToRestore)
      }, 50)
      
      console.log('🔄 State after restoration (before step delay):', {
        currentStep: 'pending...',
        stepToRestore: stepToRestore,
        selectedCategory: draft.selectedCategory,
        selectedTemplate: draft.selectedTemplate,
        formData: !!draft.formData
      })
    }
    
    setShowDraftRecovery(false)
    setHasCheckedInitialDraft(true) // Prevent modal from showing again in this session
    
    // Re-enable auto-save after a short delay to ensure restoration is complete
    setTimeout(() => {
      setIsRestoringDraft(false)
      console.log('✅ Draft restoration completed, auto-save re-enabled')
    }, 100)
  }

  // Debug current step changes
  useEffect(() => {
    console.log('📍 Current step changed to:', navigationState.currentStep, {
      isRestoringDraft,
      hasCheckedInitialDraft,
      selectedCategory: navigationState.selectedCategory,
      formData: !!formDataState.formData,
      selectedTemplate: navigationState.selectedTemplate
    })
  }, [navigationState.currentStep, isRestoringDraft])

  const handleDiscardDraft = () => {
    // Clear draft from localStorage
    draftPersistence.clearDraft()
    
    // Reset ALL application state to initial values
    navigationState.setSelectedCategory(null)
    navigationState.setSelectedTemplate(null)
    navigationState.setCurrentStep(1)
    
    // Clear form data state
    formDataState.clearFormData()
    
    // Reset package state to default
    packageState.setSelectedPackage('basic')
    
    // Reset form instance to empty values
    form.reset({
      title: '',
      bride_full_name: '',
      bride_nickname: '',
      groom_full_name: '',
      groom_nickname: '',
      wedding_date: '',
      ceremony_time: '',
      reception_time: '',
      venue_name: '',
      venue_address: '',
      invitation_message: '',
      bride_father: '',
      bride_mother: '',
      groom_father: '',
      groom_mother: '',
    })
    
    // Close modal and ensure it doesn't show again in this session
    setShowDraftRecovery(false)
    setHasCheckedInitialDraft(true) // Prevent modal from showing again
    
    console.log('🗑️ User chose to discard draft and start fresh - ALL data cleared including:')
    console.log('  ✅ Draft data from localStorage')
    console.log('  ✅ Navigation state (category, template, step)')
    console.log('  ✅ Form data state')
    console.log('  ✅ Package selection')
    console.log('  ✅ Form instance values')
    console.log('  ✅ Modal disabled for this session')
  }

  // Primary business logic: Create invitation
  const handleCreateInvitation = async () => {
    const { selectedTemplate } = navigationState
    const { formData } = formDataState
    const { selectedCategory } = navigationState
    const { selectedPackage } = packageState
    const { isEditMode, existingInvitation } = editModeState

    const saveAction = sessionManagement.getSaveAction()
    
    console.log('🔥 handleCreateInvitation called:', {
      selectedTemplate,
      hasFormData: !!formData,
      selectedCategory,
      selectedPackage,
      isEditMode,
      saveAction,
      sessionId: sessionManagement.sessionId,
      existingInvitationId: sessionManagement.createdInvitationId
    })

    if (!selectedTemplate || !formData || !selectedCategory) {
      console.error('❌ Missing required data:', {
        hasTemplate: !!selectedTemplate,
        hasFormData: !!formData,
        hasCategory: !!selectedCategory
      })
      return
    }

    try {
      if (isEditMode && existingInvitation) {
        console.log('📝 Updating existing invitation (edit mode)')
        await invitationOperations.updateExistingInvitation(
          existingInvitation.id,
          formData,
          selectedTemplate,
          existingInvitation
        )
        // Clear draft and session after successful edit
        draftPersistence.clearDraft()
        router.push('/dashboard')
        
      } else if (saveAction === 'update' && sessionManagement.createdInvitationId) {
        console.log('🔄 Updating existing invitation (same session)')
        await invitationOperations.updateExistingInvitation(
          sessionManagement.createdInvitationId,
          formData,
          selectedTemplate,
          null // We don't have the existing invitation object in this case
        )
        modalState.showShare()
        
      } else {
        console.log('✨ Creating new invitation')
        const createdInvitation = await invitationOperations.createNewInvitation(
          selectedCategory,
          formData,
          selectedPackage,
          selectedTemplate
        )
        
        // Mark invitation as created in this session
        if (createdInvitation?.id) {
          sessionManagement.markInvitationCreated(createdInvitation.id)
        }
        
        modalState.showShare()
      }
      
      console.log('✅ Invitation operation completed successfully')
    } catch (error: any) {
      console.error('❌ Error saving invitation:', error)
      console.log('Error details:', {
        message: error.message,
        type: error.type,
        stack: error.stack,
        details: error.details
      })
      
      // Handle specific error types that should trigger upgrade flow
      if (error.type === 'PACKAGE_LIMIT_EXCEEDED' || error.message?.includes('Package limit exceeded')) {
        console.log('📦 Package limit exceeded - showing upgrade modal')
        packageState.showUpgradeDialog()
      } else if (error.type === 'TEMPLATE_ACCESS_DENIED' || error.message?.includes('Template not accessible with current package')) {
        console.log('🔒 Template access denied - showing upgrade modal')
        packageState.showUpgradeDialog()
      } else {
        // Handle other errors (could show a generic error modal here)
        console.error('❌ Unexpected error:', error.message)
        // For debugging: also show upgrade modal for any creation error in case the error type detection failed
        if (error.message?.includes('Package') || error.message?.includes('limit') || error.message?.includes('Template')) {
          console.log('🤔 Error might be package-related, showing upgrade modal as fallback')
          packageState.showUpgradeDialog()
        }
      }
    }
  }

  // Package upgrade business logic with payment
  const handlePaymentSubmission = async (paymentData: any) => {
    try {
      const result = await packageState.submitPaymentConfirmation(paymentData)
      return result
    } catch (error) {
      console.error('Error submitting payment:', error)
      return { success: false, error: 'Failed to submit payment confirmation' }
    }
  }

  const handleUpgradeAndCreate = async () => {
    // This is now handled by the payment flow
    // Keep for backward compatibility but it should trigger payment modal
    packageState.showUpgradeDialog()
  }

  // Navigation business logic
  const handleBack = () => {
    const { currentStep, setCurrentStep, goToPreviousStep } = navigationState
    
    if (currentStep === 5) {
      setCurrentStep(4) // Go back to editor
    } else if (currentStep === 4) {
      setCurrentStep(3) // Go back to template selection
    } else if (currentStep > 1) {
      goToPreviousStep()
    } else {
      router.push('/dashboard')
    }
  }

  // Navigation to dashboard
  const goToDashboard = () => {
    // Clear draft and session when going to dashboard
    draftPersistence.clearDraft()
    sessionManagement.clearSession()
    router.push('/dashboard')
  }

  // Handle step navigation (enhancement)
  const handleStepClick = (step: number) => {
    // Only allow navigation to accessible steps
    if (step === 1) {
      navigationState.setCurrentStep(1)
    } else if (step === 2 && navigationState.selectedCategory) {
      navigationState.setCurrentStep(2)
    } else if (step === 3 && navigationState.selectedCategory && formDataState.formData) {
      navigationState.setCurrentStep(3)
    } else if (step === 4 && navigationState.selectedCategory && formDataState.formData && navigationState.selectedTemplate) {
      navigationState.setCurrentStep(4)
    } else if (step === 5 && navigationState.selectedCategory && formDataState.formData && navigationState.selectedTemplate) {
      navigationState.setCurrentStep(5)
    }
  }

  // Step handlers (business logic)
  const stepHandlers = useStepHandlers({
    selectedCategory: navigationState.selectedCategory,
    formData: formDataState.formData,
    selectedTemplate: navigationState.selectedTemplate,
    selectedPackage: packageState.selectedPackage,
    templates,
    setSelectedCategory: navigationState.setSelectedCategory,
    setCurrentStep: navigationState.setCurrentStep,
    setSelectedTemplate: navigationState.setSelectedTemplate,
    updateFormData: formDataState.updateFormData,
    showUpgradeDialog: packageState.showUpgradeDialog,
    onCreateInvitation: handleCreateInvitation,
    updateState: navigationState.updateState,
    form
  })

  // Return everything the container needs
  return {
    // State for rendering
    currentStep: navigationState.currentStep,
    selectedCategory: navigationState.selectedCategory,
    selectedTemplate: navigationState.selectedTemplate,
    selectedPackage: packageState.selectedPackage,
    formData: formDataState.formData,
    templates,
    templatesLoading,
    selectedTemplateData,
    shouldShowSaveButton,
    
    // Edit mode state
    isEditMode: editModeState.isEditMode,
    existingInvitationTitle: editModeState.existingInvitation?.title,
    
    // Loading states
    isSubmitting: invitationOperations.isSubmitting,
    isSaving: invitationOperations.isSaving,
    
    // Modal state
    showUpgradeModal: packageState.showUpgradeModal,
    showShareModal: modalState.showShareModal,
    createdInvitation: invitationOperations.createdInvitation,
    
    // Session and draft state
    sessionId: sessionManagement.sessionId,
    hasCreatedInvitation: sessionManagement.hasCreatedInvitation,
    saveAction: sessionManagement.getSaveAction(),
    isDraftAvailable: draftPersistence.isDraftAvailable,
    
    // Draft recovery state
    showDraftRecovery,
    draftInfo,
    
    // Form instance
    form,
    
    // Event handlers
    stepHandlers,
    handleBack,
    handleUpgradeAndCreate,
    handlePaymentSubmission,
    goToDashboard,
    handleStepClick,
    
    // Modal handlers
    showUpgradeDialog: packageState.showUpgradeDialog,
    hideUpgradeDialog: packageState.hideUpgradeDialog,
    hideShareModal: modalState.hideShare,
    
    // Draft recovery handlers
    handleRestoreDraft,
    handleDiscardDraft,
  }
}
