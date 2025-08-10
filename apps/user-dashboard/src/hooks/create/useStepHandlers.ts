import { InvitationType, WeddingFormData, Template, PackageType } from '@/services/supabaseService'
import { WeddingFormValues } from './useWeddingForm'
import { SAMPLE_WEDDING_DATA } from '@/components/create/utils/devUtils'

interface StepHandlersProps {
  selectedCategory: InvitationType | null
  formData: WeddingFormData | null
  selectedTemplate: string | null
  selectedPackage: PackageType
  templates: Template[]
  setSelectedCategory: (category: InvitationType | null) => void
  setCurrentStep: (step: number) => void
  setSelectedTemplate: (template: string | null) => void
  updateFormData: (data: WeddingFormData) => void
  showUpgradeDialog: () => void
  onCreateInvitation: () => Promise<void>
  updateState?: (updates: { currentStep?: number; selectedCategory?: InvitationType | null; selectedTemplate?: string | null }) => void
  form?: any // Add form reference to populate it
}

export function useStepHandlers({
  selectedCategory,
  formData,
  selectedTemplate,
  selectedPackage,
  templates,
  setSelectedCategory,
  setCurrentStep,
  setSelectedTemplate,
  updateFormData,
  showUpgradeDialog,
  onCreateInvitation,
  updateState,
  form
}: StepHandlersProps) {

  const handleCategorySelect = (category: InvitationType) => {
    console.log('🎯 Category selected:', category)
    // Use atomic update if available, otherwise fallback to individual setters
    if (updateState) {
      updateState({ selectedCategory: category, currentStep: 2 })
    } else {
      setSelectedCategory(category)
      setTimeout(() => setCurrentStep(2), 0)
    }
  }

  const handleSuperQuickStart = () => {
    console.log('🚀 Super quick start triggered')
    setSelectedCategory('wedding')
    updateFormData(SAMPLE_WEDDING_DATA)
    
    // Also populate the React Hook Form for auto-fill
    if (form) {
      const formValues = {
        title: 'Wedding Invitation',
        bride_full_name: SAMPLE_WEDDING_DATA.bride_full_name,
        bride_nickname: SAMPLE_WEDDING_DATA.bride_nickname || '',
        groom_full_name: SAMPLE_WEDDING_DATA.groom_full_name,
        groom_nickname: SAMPLE_WEDDING_DATA.groom_nickname || '',
        wedding_date: SAMPLE_WEDDING_DATA.wedding_date,
        ceremony_time: SAMPLE_WEDDING_DATA.ceremony_time || '',
        reception_time: SAMPLE_WEDDING_DATA.reception_time || '',
        venue_name: SAMPLE_WEDDING_DATA.venue_name,
        venue_address: SAMPLE_WEDDING_DATA.venue_address || '',
        invitation_message: SAMPLE_WEDDING_DATA.invitation_message || '',
        bride_father: SAMPLE_WEDDING_DATA.bride_father || '',
        bride_mother: SAMPLE_WEDDING_DATA.bride_mother || '',
        groom_father: SAMPLE_WEDDING_DATA.groom_father || '',
        groom_mother: SAMPLE_WEDDING_DATA.groom_mother || '',
      }
      
      console.log('📝 Populating form with sample data:', formValues)
      form.reset(formValues)
    }
    
    setCurrentStep(3) // Go straight to template selection
  }

  const handleAutoFill = () => {
    console.log('🎯 Auto-fill for testing triggered')
    updateFormData(SAMPLE_WEDDING_DATA)
    
    // Populate the React Hook Form
    if (form) {
      const formValues = {
        title: 'Wedding Invitation',
        bride_full_name: SAMPLE_WEDDING_DATA.bride_full_name,
        bride_nickname: SAMPLE_WEDDING_DATA.bride_nickname || '',
        groom_full_name: SAMPLE_WEDDING_DATA.groom_full_name,
        groom_nickname: SAMPLE_WEDDING_DATA.groom_nickname || '',
        wedding_date: SAMPLE_WEDDING_DATA.wedding_date,
        ceremony_time: SAMPLE_WEDDING_DATA.ceremony_time || '',
        reception_time: SAMPLE_WEDDING_DATA.reception_time || '',
        venue_name: SAMPLE_WEDDING_DATA.venue_name,
        venue_address: SAMPLE_WEDDING_DATA.venue_address || '',
        invitation_message: SAMPLE_WEDDING_DATA.invitation_message || '',
        bride_father: SAMPLE_WEDDING_DATA.bride_father || '',
        bride_mother: SAMPLE_WEDDING_DATA.bride_mother || '',
        groom_father: SAMPLE_WEDDING_DATA.groom_father || '',
        groom_mother: SAMPLE_WEDDING_DATA.groom_mother || '',
      }
      
      console.log('✅ Auto-fill form completed:', formValues)
      form.reset(formValues)
    }
  }

  const handleFormSubmit = async (data: WeddingFormValues) => {
    console.log('📝 Form submitted:', data)
    if (!selectedCategory) {
      console.warn('❌ No category selected for form submit')
      return
    }

    const localFormData: WeddingFormData = {
      bride_full_name: data.bride_full_name,
      bride_nickname: data.bride_nickname,
      groom_full_name: data.groom_full_name,
      groom_nickname: data.groom_nickname,
      wedding_date: data.wedding_date,
      ceremony_time: data.ceremony_time,
      reception_time: data.reception_time,
      venue_name: data.venue_name,
      venue_address: data.venue_address,
      invitation_message: data.invitation_message,
      bride_father: data.bride_father,
      bride_mother: data.bride_mother,
      groom_father: data.groom_father,
      groom_mother: data.groom_mother,
    }

    console.log('✅ Form data processed:', localFormData)
    updateFormData(localFormData)
    setCurrentStep(3)
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setCurrentStep(4)
  }

  const handleSaveInvitation = async () => {
    console.log('💾 Save invitation triggered:', {
      selectedTemplate,
      formData,
      selectedCategory,
      hasTemplate: !!templates.find((t: Template) => t.id === selectedTemplate)
    })
    
    if (!selectedTemplate || !formData || !selectedCategory) {
      console.warn('❌ Missing required data for save:', {
        hasTemplate: !!selectedTemplate,
        hasFormData: !!formData,
        hasCategory: !!selectedCategory
      })
      return
    }

    const template = templates.find((t: Template) => t.id === selectedTemplate)
    if (!template) {
      console.warn('❌ Template not found:', selectedTemplate)
      return
    }

    console.log('✅ All data available, proceeding with save')

    console.log('🚀 Calling onCreateInvitation')
    await onCreateInvitation()
  }

  return {
    handleCategorySelect,
    handleSuperQuickStart,
    handleFormSubmit,
    handleTemplateSelect,
    handleSaveInvitation,
    handleAutoFill
  }
}
