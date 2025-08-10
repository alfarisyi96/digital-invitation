import { useState, useEffect, useCallback } from 'react'
import { WeddingFormData, InvitationType } from '@/services/supabaseService'

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

interface DraftData {
  formData: WeddingFormData | null
  selectedCategory: InvitationType | null
  selectedTemplate: string | null
  currentStep: number
  timestamp: number
  lastSaved: string // Human readable timestamp
}

/**
 * Hook for persisting form data in browser localStorage
 * Prevents data loss on browser refresh/crash
 * Uses GLOBAL draft storage for customer end-users (single invitation workflow)
 */
export function useDraftPersistence(sessionId: string) {
  const DRAFT_KEY = 'draft_invitation_global' // Global key for customer end-users
  const AUTOSAVE_DELAY = 1000 // Reduced to 1 second for faster updates

  // Check for existing draft synchronously on initialization
  const [isDraftAvailable, setIsDraftAvailable] = useState(() => {
    try {
      const existingDraft = localStorage.getItem(DRAFT_KEY)
      if (existingDraft) {
        const draftData = JSON.parse(existingDraft) as DraftData
        const isRecent = Date.now() - draftData.timestamp < 24 * 60 * 60 * 1000
        console.log('🔍 Initial draft check (synchronous):', {
          found: true,
          isRecent,
          timestamp: draftData.timestamp
        })
        return isRecent
      }
      console.log('🔍 Initial draft check (synchronous): No draft found')
      return false
    } catch (error) {
      console.error('Error checking initial draft:', error)
      return false
    }
  })

  // Immediate save function (no debouncing for critical updates)
  const saveImmediately = useCallback((draftData: Partial<DraftData>) => {
    try {
      const currentDraft = getDraft()
      const updatedDraft: DraftData = {
        formData: null,
        selectedCategory: null,
        selectedTemplate: null,
        currentStep: 1,
        timestamp: Date.now(),
        lastSaved: new Date().toLocaleString(),
        ...currentDraft,
        ...draftData
      }

      localStorage.setItem(DRAFT_KEY, JSON.stringify(updatedDraft))
      console.log('💾 Global draft saved immediately:', draftData)
      setIsDraftAvailable(true)
    } catch (error) {
      console.error('Error saving draft immediately:', error)
    }
  }, [DRAFT_KEY])

  // Debounced save function for frequent updates
  const saveDraft = useCallback(
    debounce((draftData: Partial<DraftData>) => {
      saveImmediately(draftData)
    }, AUTOSAVE_DELAY),
    [saveImmediately]
  )

  // Clean up old drafts on mount (but don't change isDraftAvailable since it's set synchronously)
  useEffect(() => {
    const existingDraft = localStorage.getItem(DRAFT_KEY)
    if (existingDraft) {
      try {
        const draftData = JSON.parse(existingDraft) as DraftData
        const isRecent = Date.now() - draftData.timestamp < 24 * 60 * 60 * 1000
        
        if (!isRecent) {
          // Clean up old draft
          localStorage.removeItem(DRAFT_KEY)
          console.log('🧹 Old draft cleaned up (>24h) on mount')
          setIsDraftAvailable(false)
        }
      } catch (error) {
        console.error('Error parsing draft data on mount:', error)
        localStorage.removeItem(DRAFT_KEY)
        setIsDraftAvailable(false)
      }
    }
  }, [DRAFT_KEY])

  const getDraft = (): DraftData | null => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        return JSON.parse(draft) as DraftData
      }
    } catch (error) {
      console.error('Error getting draft:', error)
    }
    return null
  }

  const restoreDraft = (): DraftData | null => {
    const draft = getDraft()
    if (draft) {
      console.log('🔄 Restoring draft:', draft)
      return draft
    }
    return null
  }

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setIsDraftAvailable(false)
    console.log('🗑️ Global draft cleared')
  }

  const updateDraftFormData = (formData: WeddingFormData) => {
    saveDraft({ formData }) // Use debounced save for form data (frequent changes)
  }

  const updateDraftCategory = (selectedCategory: InvitationType) => {
    saveImmediately({ selectedCategory }) // Immediate save for critical selection
  }

  const updateDraftTemplate = (selectedTemplate: string) => {
    saveImmediately({ selectedTemplate }) // Immediate save for critical selection
  }

  const updateDraftStep = (currentStep: number) => {
    saveImmediately({ currentStep }) // Immediate save for navigation
  }

  const getDraftInfo = () => {
    const draft = getDraft()
    if (!draft) return null
    
    return {
      hasFormData: !!draft.formData,
      category: draft.selectedCategory,
      template: draft.selectedTemplate,
      step: draft.currentStep,
      lastSaved: draft.lastSaved || new Date(draft.timestamp).toLocaleString(),
      isRecent: Date.now() - draft.timestamp < 24 * 60 * 60 * 1000
    }
  }

  return {
    isDraftAvailable,
    saveDraft,
    saveImmediately,
    getDraft,
    getDraftInfo,
    restoreDraft,
    clearDraft,
    updateDraftFormData,
    updateDraftCategory,
    updateDraftTemplate,
    updateDraftStep
  }
}
