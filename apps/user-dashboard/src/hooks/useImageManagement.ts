'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ImageData {
  hero_image?: string
  bride_image?: string
  groom_image?: string
  gallery_photos?: string[]
}

export interface ImageManagementHook {
  images: ImageData
  updateImage: (key: keyof ImageData, url: string) => void
  addGalleryImage: (url: string) => void
  removeGalleryImage: (index: number) => void
  loadFromLocalStorage: () => void
  getImagesForSave: () => ImageData
  clearImages: () => void
}

/**
 * Hook to manage template image uploads and persistence
 * Integrates with localStorage for drafts and database for final save
 */
export function useImageManagement(): ImageManagementHook {
  const [images, setImages] = useState<ImageData>({
    hero_image: '',
    bride_image: '',
    groom_image: '',
    gallery_photos: []
  })

  // Utility function to save to localStorage - defined first
  const saveToLocalStorage = useCallback((key: string, value: string | string[]) => {
    try {
      const existingCustomizations = JSON.parse(localStorage.getItem('templateCustomization') || '{}')
      const customImages = existingCustomizations.customImages || {}
      
      customImages[key] = value
      
      localStorage.setItem('templateCustomization', JSON.stringify({
        ...existingCustomizations,
        customImages
      }))
      
      // Only log once on initial load, not on every save
      if (key !== 'initial_load') {
        console.log('🖼️ Image saved to localStorage:', { [key]: value })
      }
    } catch (error) {
      console.error('Failed to save image to localStorage:', error)
    }
  }, [])

  const loadFromLocalStorage = useCallback(() => {
    try {
      const existingCustomizations = JSON.parse(localStorage.getItem('templateCustomization') || '{}')
      const customImages = existingCustomizations.customImages || {}
      
      const loadedImages: ImageData = {
        hero_image: customImages.hero || '',
        bride_image: customImages.bride || '',
        groom_image: customImages.groom || '',
        gallery_photos: customImages.gallery || []
      }
      
      setImages(loadedImages)
      // Only log this once during actual loading, not on every render
      console.log('🖼️ Images loaded from localStorage:', loadedImages)
    } catch (error) {
      console.error('Failed to load images from localStorage:', error)
    }
  }, [])

  // Load images from localStorage on mount - only once
  useEffect(() => {
    loadFromLocalStorage()
  }, []) // Empty dependency array to run only once

  // Listen for manual localStorage updates (like from edit mode)
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('📢 Manual localStorage reload triggered')
      loadFromLocalStorage()
    }

    // Custom event for manual triggers
    window.addEventListener('templateImagesUpdated', handleStorageChange)
    return () => window.removeEventListener('templateImagesUpdated', handleStorageChange)
  }, [loadFromLocalStorage])

  const updateImage = useCallback((key: keyof ImageData, url: string) => {
    setImages(prev => ({
      ...prev,
      [key]: url
    }))
    
    // Save to localStorage
    saveToLocalStorage(key, url)
  }, [saveToLocalStorage])

  const addGalleryImage = useCallback((url: string) => {
    setImages(prev => {
      const newGallery = [...(prev.gallery_photos || []), url]
      // Save gallery to localStorage immediately
      saveToLocalStorage('gallery', newGallery)
      return {
        ...prev,
        gallery_photos: newGallery
      }
    })
  }, [saveToLocalStorage])

  const removeGalleryImage = useCallback((index: number) => {
    setImages(prev => {
      const updatedGallery = prev.gallery_photos?.filter((_, i) => i !== index) || []
      // Update localStorage with the new gallery
      saveToLocalStorage('gallery', updatedGallery)
      return {
        ...prev,
        gallery_photos: updatedGallery
      }
    })
  }, [saveToLocalStorage])

  const getImagesForSave = useCallback((): ImageData => {
    return {
      hero_image: images.hero_image || '',
      bride_image: images.bride_image || '',
      groom_image: images.groom_image || '',
      gallery_photos: images.gallery_photos || []
    }
  }, [images])

  const clearImages = useCallback(() => {
    setImages({
      hero_image: '',
      bride_image: '',
      groom_image: '',
      gallery_photos: []
    })
    
    // Clear from localStorage
    try {
      const existingCustomizations = JSON.parse(localStorage.getItem('templateCustomization') || '{}')
      delete existingCustomizations.customImages
      localStorage.setItem('templateCustomization', JSON.stringify(existingCustomizations))
    } catch (error) {
      console.error('Failed to clear images from localStorage:', error)
    }
  }, [])

  return {
    images,
    updateImage,
    addGalleryImage,
    removeGalleryImage,
    loadFromLocalStorage,
    getImagesForSave,
    clearImages
  }
}
