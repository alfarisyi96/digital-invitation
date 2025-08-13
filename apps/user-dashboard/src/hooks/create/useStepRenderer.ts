import { InvitationType } from '@/services/supabaseService'

interface StepRenderProps {
  currentStep: number
  selectedCategory: InvitationType | null
}

export function useStepRenderer({ currentStep, selectedCategory }: StepRenderProps) {
  
  const getStepComponent = () => {
    switch (currentStep) {
      case 1:
        return 'CategorySelection'
      case 2:
        return selectedCategory === 'wedding' ? 'WeddingForm' : null
      case 3:
        return 'TemplateSelection'
      case 4:
        return 'TemplateEditor'
      case 5:
        return 'InvitationPreview'
      default:
        return null
    }
  }

  const shouldShowForm = currentStep === 2 && selectedCategory === 'wedding'
  const shouldShowSaveButton = currentStep === 5

  return { 
    getStepComponent,
    shouldShowForm,
    shouldShowSaveButton
  }
}
