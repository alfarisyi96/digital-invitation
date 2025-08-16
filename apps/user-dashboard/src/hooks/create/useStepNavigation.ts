import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { InvitationType } from '@/services/supabaseService'

interface StepNavigationState {
  currentStep: number
  selectedCategory: InvitationType | null
  selectedTemplate: string | null
}

export function useStepNavigation(isEditMode = false) {
  const searchParams = useSearchParams()
  
  // Initialize state from URL or defaults
  const [state, setState] = useState<StepNavigationState>(() => ({
    currentStep: parseInt(searchParams.get('step') || '1'),
    selectedCategory: (searchParams.get('category') as InvitationType) || null,
    selectedTemplate: searchParams.get('template') || null
  }))

  // Update URL with current state
  const updateURL = useCallback((updates: Partial<StepNavigationState>) => {
    const params = new URLSearchParams(window.location.search)
    
    // Only update parameters that are explicitly provided
    if (updates.currentStep !== undefined) {
      params.set('step', updates.currentStep.toString())
    }
    
    if (updates.selectedCategory !== undefined) {
      if (updates.selectedCategory) {
        params.set('category', updates.selectedCategory)
      } else {
        params.delete('category')
      }
    }
    
    if (updates.selectedTemplate !== undefined) {
      if (updates.selectedTemplate) {
        params.set('template', updates.selectedTemplate)
      } else {
        params.delete('template')
      }
    }
    
    const url = `/create?${params.toString()}`
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 URL Update:', {
        updates,
        url,
        currentParams: Object.fromEntries(params.entries())
      })
    }
    
    window.history.pushState(null, '', url)
  }, [])

  // Setters that also update URL
  const setCurrentStep = useCallback((step: number) => {
    setState(prevState => {
      const newState = { ...prevState, currentStep: step }
      if (process.env.NODE_ENV === 'development') {
        console.log('📍 Step changed to:', step, 'State:', newState)
      }
      return newState
    })
    updateURL({ currentStep: step }) // Only update the step, preserve other params
  }, [])

  const setSelectedCategory = useCallback((category: InvitationType | null) => {
    setState(prevState => {
      const newState = { ...prevState, selectedCategory: category }
      if (process.env.NODE_ENV === 'development') {
        console.log('📂 Category changed to:', category, 'State:', newState)
      }
      return newState
    })
    updateURL({ selectedCategory: category }) // Only update the category, preserve other params
  }, [])

  const setSelectedTemplate = useCallback((template: string | null) => {
    setState(prevState => {
      const newState = { ...prevState, selectedTemplate: template }
      if (process.env.NODE_ENV === 'development') {
        console.log('🎨 Template changed to:', template, 'State:', newState)
      }
      return newState
    })
    updateURL({ selectedTemplate: template }) // Only update the template, preserve other params
  }, [])

  // Navigate to next step
  const goToNextStep = () => {
    if (state.currentStep < 5) {
      setCurrentStep(state.currentStep + 1)
    }
  }

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (state.currentStep > 1) {
      setCurrentStep(state.currentStep - 1)
    }
  }

  // Combined setter for atomic updates
  const updateState = (updates: Partial<StepNavigationState>) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates }
      console.log('🔄 State updated:', updates, 'New state:', newState)
      return newState
    })
    updateURL(updates)
  }

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setState({
        currentStep: parseInt(params.get('step') || '1'),
        selectedCategory: (params.get('category') as InvitationType) || null,
        selectedTemplate: params.get('template') || null
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Sync with URL changes
  useEffect(() => {
    const newState = {
      currentStep: parseInt(searchParams.get('step') || '1'),
      selectedCategory: (searchParams.get('category') as InvitationType) || null,
      selectedTemplate: searchParams.get('template') || null
    }
    
    // Only update if there's a difference
    if (JSON.stringify(newState) !== JSON.stringify(state)) {
      setState(newState)
    }
  }, [searchParams])

  return {
    currentStep: state.currentStep,
    selectedCategory: state.selectedCategory,
    selectedTemplate: state.selectedTemplate,
    setCurrentStep,
    setSelectedCategory,
    setSelectedTemplate,
    updateState,
    goToNextStep,
    goToPreviousStep
  }
}
