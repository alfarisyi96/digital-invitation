'use client'

import { CreateInvitationLayout } from '@/components/create/templates/CreateInvitationLayout'
import { UpgradeModal } from '@/components/create/molecules/UpgradeModal'
import { ShareModal } from '@/components/create/molecules/ShareModal'
import { DraftRecoveryModal } from '@/components/create/molecules/DraftRecoveryModal'
import { StepRenderer } from '@/components/create/organisms/StepRenderer'
import { useCreateInvitationFlow } from '@/hooks/create/useCreateInvitationFlow'

/**
 * Pure Presentation Container
 * 
 * Responsibilities:
 * 1. Use business logic hook
 * 2. Render components with data from hook
 * 3. Pass event handlers from hook to components
 * 
 * NO business logic - everything comes from the hook!
 */
export function CreateInvitationContainer() {
  // Get ALL business logic from the hook
  const {
    // State for rendering
    currentStep,
    selectedCategory,
    selectedTemplate,
    selectedPackage,
    formData,
    templates,
    templatesLoading,
    selectedTemplateData,
    shouldShowSaveButton,
    
    // Edit mode state
    isEditMode,
    existingInvitationTitle,
    
    // Loading states
    isSubmitting,
    isSaving,
    
    // Session and draft state
    hasCreatedInvitation,
    saveAction,
    isDraftAvailable,
    
    // Modal state
    showUpgradeModal,
    upgradeErrorType,
    showShareModal,
    createdInvitation,
    
    // Draft recovery state
    showDraftRecovery,
    draftInfo,
    
    // Form instance
    form,
    
    // Event handlers (all from hook)
    stepHandlers,
    handleBack,
    handleUpgradeAndCreate,
    handlePaymentSubmission,
    goToDashboard,
    handleStepClick,
    showUpgradeDialog,
    hideUpgradeDialog,
    hideShareModal,
    
    // Draft recovery handlers
    handleRestoreDraft,
    handleDiscardDraft,
  } = useCreateInvitationFlow()

  // Pure rendering - no logic, just passing props
  return (
    <>
      {/* Layout Template */}
      <CreateInvitationLayout
        currentStep={currentStep}
        isEditMode={isEditMode}
        existingInvitationTitle={existingInvitationTitle}
        onBack={handleBack}
        onSave={stepHandlers.handleSaveInvitation}
        isSaving={isSaving}
        showSaveButton={shouldShowSaveButton}
        onStepClick={handleStepClick}
        selectedCategory={selectedCategory}
        formData={formData}
        selectedTemplate={selectedTemplate}
        saveAction={saveAction as 'create' | 'update'}
        isDraftAvailable={isDraftAvailable}
      >
        {/* Step Content Renderer */}
        <StepRenderer
          currentStep={currentStep}
          selectedCategory={selectedCategory}
          selectedTemplate={selectedTemplate}
          selectedPackage={selectedPackage}
          formData={formData}
          templates={templates}
          templatesLoading={templatesLoading}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          form={form}
          selectedTemplateData={selectedTemplateData}
          onCategorySelect={stepHandlers.handleCategorySelect}
          onSuperQuickStart={stepHandlers.handleSuperQuickStart}
          onFormSubmit={stepHandlers.handleFormSubmit}
          onTemplateSelect={stepHandlers.handleTemplateSelect}
          onPackageUpgrade={showUpgradeDialog}
          onAutoFill={stepHandlers.handleAutoFill}
          onEditorContinue={stepHandlers.handleEditorContinue}
        />
      </CreateInvitationLayout>

      {/* Modals */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={hideUpgradeDialog}
        onPaymentSubmit={handlePaymentSubmission}
        isLoading={isSubmitting}
        errorType={upgradeErrorType}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={hideShareModal}
        invitation={createdInvitation}
        template={selectedTemplateData}
        onGoToDashboard={goToDashboard}
      />

      {/* Draft Recovery Modal */}
      <DraftRecoveryModal
        isOpen={showDraftRecovery}
        draftInfo={draftInfo}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
      />
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: 'black', 
          color: 'white', 
          padding: '10px', 
          fontSize: '12px',
          zIndex: 9999 
        }}>
          showDraftRecovery: {showDraftRecovery ? 'true' : 'false'}<br/>
          draftInfo: {draftInfo ? 'exists' : 'null'}<br/>
          isDraftAvailable: {isDraftAvailable ? 'true' : 'false'}
        </div>
      )}
    </>
  )
}
