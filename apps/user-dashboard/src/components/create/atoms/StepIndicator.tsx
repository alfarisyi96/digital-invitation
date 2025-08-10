interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabels: readonly string[]
  onStepClick?: (step: number) => void
  selectedCategory?: string | null
  formData?: any
  selectedTemplate?: string | null
}

export function StepIndicator({ 
  currentStep, 
  totalSteps, 
  stepLabels, 
  onStepClick,
  selectedCategory,
  formData,
  selectedTemplate 
}: StepIndicatorProps) {
  
  // Determine which steps are accessible
  const isStepAccessible = (stepNumber: number) => {
    if (stepNumber === 1) return true
    if (stepNumber === 2 && selectedCategory) return true
    if (stepNumber === 3 && selectedCategory && formData) return true
    if (stepNumber === 4 && selectedCategory && formData && selectedTemplate) return true
    return false
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
      {stepLabels.map((label, index) => {
        const stepNumber = index + 1
        const isActive = currentStep === stepNumber
        const isCompleted = currentStep > stepNumber
        const isAccessible = isStepAccessible(stepNumber)
        const isClickable = onStepClick && isAccessible && stepNumber !== currentStep
        const isLast = index === stepLabels.length - 1
        
        return (
          <div key={stepNumber} className="flex items-center">
            <span 
              className={`px-2 py-1 rounded text-xs transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white font-medium' 
                  : isCompleted
                  ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                  : isAccessible && isClickable
                  ? 'bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-400'
              } ${isClickable ? 'hover:scale-105' : ''}`}
              onClick={isClickable ? () => onStepClick(stepNumber) : undefined}
              title={isClickable ? `Go to ${label}` : undefined}
            >
              {stepNumber}. {label}
            </span>
            {!isLast && <span className="hidden sm:inline mx-1">→</span>}
          </div>
        )
      })}
    </div>
  )
}
