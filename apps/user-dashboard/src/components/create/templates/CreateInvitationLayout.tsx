import { Button } from '@/components/ui/button'
import { StepIndicator } from '../atoms/StepIndicator'
import { STEP_LABELS } from '../constants'
import { ArrowLeft } from 'lucide-react'

interface CreateInvitationLayoutProps {
  children: React.ReactNode
  currentStep: number
  isEditMode?: boolean
  existingInvitationTitle?: string
  onBack: () => void
  onSave?: () => void
  isSaving?: boolean
  showSaveButton?: boolean
  onStepClick?: (step: number) => void
  selectedCategory?: string | null
  formData?: any
  selectedTemplate?: string | null
  saveAction?: 'create' | 'update'
  isDraftAvailable?: boolean
}

export function CreateInvitationLayout({
  children,
  currentStep,
  isEditMode = false,
  existingInvitationTitle,
  onBack,
  onSave,
  isSaving = false,
  showSaveButton = false,
  onStepClick,
  selectedCategory,
  formData,
  selectedTemplate,
  saveAction = 'create',
  isDraftAvailable = false
}: CreateInvitationLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <Button variant="ghost" onClick={onBack} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 4 ? 'Choose Template' : 'Back'}
            </Button>
            
            {/* Mobile Edit Mode Title */}
            {isEditMode && existingInvitationTitle && (
              <div className="sm:hidden">
                <h1 className="text-lg font-semibold text-gray-900">Edit Invitation</h1>
                <p className="text-sm text-gray-600 break-words hyphens-auto">{existingInvitationTitle}</p>
              </div>
            )}
          </div>
          
          {/* Desktop Edit Mode Title */}
          {isEditMode && existingInvitationTitle && (
            <div className="hidden sm:block text-center">
              <h1 className="text-2xl font-bold text-gray-900">Edit Invitation</h1>
              <p className="text-gray-600 break-words hyphens-auto max-w-2xl mx-auto">{existingInvitationTitle}</p>
            </div>
          )}
          
          {showSaveButton ? (
            <div className="flex flex-col items-end space-y-2">
              {isDraftAvailable && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  📄 Draft available
                </span>
              )}
              <Button 
                onClick={onSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                {isSaving 
                  ? 'Saving...' 
                  : isEditMode 
                    ? 'Update Invitation'
                    : saveAction === 'update'
                      ? 'Update Invitation'
                      : 'Save Invitation'
                }
              </Button>
            </div>
          ) : (
            <StepIndicator 
              currentStep={currentStep}
              totalSteps={4}
              stepLabels={STEP_LABELS}
              onStepClick={onStepClick}
              selectedCategory={selectedCategory}
              formData={formData}
              selectedTemplate={selectedTemplate}
            />
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          {children}
        </div>
      </div>
    </div>
  )
}
