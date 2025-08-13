import { useState, useEffect, useCallback } from 'react'
import { ColorCombination, FontOption } from '@/services/supabaseService'
import { GLOBAL_FONT_OPTIONS } from '@/lib/templateConfig'

interface TemplateCustomization {
  selectedColorCombination?: ColorCombination
  selectedFontOption?: FontOption
  customTexts?: Record<string, string>
  customImages?: Record<string, string>
}

const STORAGE_KEY = 'templateCustomization'

/**
 * Template Customization Hook
 * 
 * Features:
 * - Manages template customization state
 * - Auto-saves to localStorage on every change
 * - Provides methods to update fonts, colors, texts, images
 * - Reset to template defaults
 */
export function useTemplateCustomization(templateId?: string) {
  const [customization, setCustomization] = useState<TemplateCustomization | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load customization from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setCustomization(parsed)
        console.log('🔄 Loaded customization from localStorage:', parsed)
      } else {
        // Initialize with defaults
        const defaultCustomization: TemplateCustomization = {
          selectedFontOption: GLOBAL_FONT_OPTIONS[0],
          customTexts: {},
          customImages: {}
        }
        setCustomization(defaultCustomization)
      }
    } catch (error) {
      console.error('Failed to load customization from localStorage:', error)
      setCustomization({
        selectedFontOption: GLOBAL_FONT_OPTIONS[0],
        customTexts: {},
        customImages: {}
      })
    }
  }, [])

  // Save to localStorage
  const saveToStorage = useCallback((newCustomization: TemplateCustomization) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCustomization))
      console.log('💾 Customization saved to localStorage:', newCustomization)
    } catch (error) {
      console.error('Failed to save customization to localStorage:', error)
    }
  }, [])

  // Update font
  const updateFont = useCallback((fontOption: FontOption) => {
    setIsLoading(true)
    
    const newCustomization = {
      ...customization,
      selectedFontOption: fontOption
    }
    
    setCustomization(newCustomization)
    saveToStorage(newCustomization)
    
    // Simulate small delay for UX
    setTimeout(() => setIsLoading(false), 200)
  }, [customization, saveToStorage])

  // Update colors
  const updateColors = useCallback((colorCombination: ColorCombination) => {
    setIsLoading(true)
    
    const newCustomization = {
      ...customization,
      selectedColorCombination: colorCombination
    }
    
    setCustomization(newCustomization)
    saveToStorage(newCustomization)
    
    // Apply CSS variables immediately for live preview
    document.documentElement.style.setProperty('--primary-color', colorCombination.primary)
    document.documentElement.style.setProperty('--secondary-color', colorCombination.secondary)
    document.documentElement.style.setProperty('--accent-color', colorCombination.accent)
    
    setTimeout(() => setIsLoading(false), 200)
  }, [customization, saveToStorage])

  // Update custom text
  const updateCustomText = useCallback((textKey: string, text: string) => {
    const newCustomTexts = {
      ...(customization?.customTexts || {}),
      [textKey]: text
    }
    
    const newCustomization = {
      ...customization,
      customTexts: newCustomTexts
    }
    
    setCustomization(newCustomization)
    saveToStorage(newCustomization)
  }, [customization, saveToStorage])

  // Update custom image
  const updateCustomImage = useCallback((imageKey: string, imageUrl: string) => {
    const newCustomImages = {
      ...(customization?.customImages || {}),
      [imageKey]: imageUrl
    }
    
    const newCustomization = {
      ...customization,
      customImages: newCustomImages
    }
    
    setCustomization(newCustomization)
    saveToStorage(newCustomization)
  }, [customization, saveToStorage])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setIsLoading(true)
    
    const defaultCustomization: TemplateCustomization = {
      selectedFontOption: GLOBAL_FONT_OPTIONS[0],
      customTexts: {},
      customImages: {}
    }
    
    setCustomization(defaultCustomization)
    saveToStorage(defaultCustomization)
    
    // Reset CSS variables
    document.documentElement.style.removeProperty('--primary-color')
    document.documentElement.style.removeProperty('--secondary-color')
    document.documentElement.style.removeProperty('--accent-color')
    
    setTimeout(() => setIsLoading(false), 200)
    
    console.log('🔄 Reset to defaults')
  }, [saveToStorage])

  // Clear all customizations
  const clearCustomization = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCustomization(null)
    console.log('🗑️ Cleared all customizations')
  }, [])

  return {
    customization,
    isLoading,
    updateFont,
    updateColors,
    updateCustomText,
    updateCustomImage,
    resetToDefaults,
    clearCustomization
  }
}
