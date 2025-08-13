import { Button } from '@/components/ui/button'
import { CategorySelection } from '@/components/create/organisms/CategorySelection'
import { WeddingForm } from '@/components/create/organisms/WeddingForm'
import { TemplateSelection } from '@/components/create/organisms/TemplateSelection'
import { TemplateEditor } from '@/components/create/organisms/TemplateEditor'
import { InvitationPreview } from '@/components/create/organisms/InvitationPreview'
import { UseFormReturn } from 'react-hook-form'
import { WeddingFormValues } from '@/hooks/create/useWeddingForm'
import { InvitationType, PackageType, WeddingFormData, Template } from '@/services/supabaseService'

interface StepRendererProps {
  currentStep: number
  selectedCategory: InvitationType | null
  selectedTemplate: string | null
  selectedPackage: PackageType
  formData: WeddingFormData | null
  templates: Template[]
  templatesLoading: boolean
  isEditMode: boolean
  isSubmitting: boolean
  form: UseFormReturn<WeddingFormValues>
  selectedTemplateData: Template | undefined
  onCategorySelect: (category: InvitationType) => void
  onSuperQuickStart: () => void
  onFormSubmit: (data: WeddingFormValues) => void
  onTemplateSelect: (templateId: string) => void
  onPackageUpgrade: () => void
  onAutoFill?: () => void
  // New editor props
  onEditorContinue?: () => void
}

/**
 * Pure Presentational Component for Step Rendering
 * No business logic - only UI rendering based on props
 */
export function StepRenderer({
  currentStep,
  selectedCategory,
  selectedTemplate,
  selectedPackage,
  formData,
  templates,
  templatesLoading,
  isEditMode,
  isSubmitting,
  form,
  selectedTemplateData,
  onCategorySelect,
  onSuperQuickStart,
  onFormSubmit,
  onTemplateSelect,
  onPackageUpgrade,
  onAutoFill,
  onEditorContinue
}: StepRendererProps) {
  
  switch (currentStep) {
    case 1:
      return (
        <CategorySelection
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
          onSuperQuickStart={onSuperQuickStart}
          isEditMode={isEditMode}
        />
      )

    case 2:
      if (selectedCategory === 'wedding') {
        return (
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <WeddingForm 
              form={form} 
              category={selectedCategory}
              onAutoFill={onAutoFill} 
            />
            
            <div className="flex justify-end mt-6">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                {isSubmitting ? 'Creating...' : 'Continue to Templates'}
              </Button>
            </div>
          </form>
        )
      }
      return null

    case 3:
      return (
        <TemplateSelection
          templates={templates}
          selectedTemplate={selectedTemplate}
          currentPackage={selectedPackage}
          loading={templatesLoading}
          onTemplateSelect={onTemplateSelect}
          onPackageUpgrade={onPackageUpgrade}
        />
      )

    case 4:
      return (
        <TemplateEditor
          template={selectedTemplateData}
          formData={formData}
          currentPackage={selectedPackage}
          category={selectedCategory || ''}
          onContinue={onEditorContinue}
        />
      )

    case 5:
      return (
        <InvitationPreview
          template={selectedTemplateData}
          formData={formData}
          currentPackage={selectedPackage}
          category={selectedCategory || ''}
          onPackageUpgrade={onPackageUpgrade}
        />
      )

    default:
      return null
  }
}
