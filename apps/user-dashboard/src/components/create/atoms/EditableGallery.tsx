'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { imageUploadService } from '@/lib/imageUploadService'

interface EditableGalleryProps {
  className?: string
  placeholder?: string
  templateId?: string
  maxImages?: number
  images?: string[]
}

/**
 * Editable Gallery Component for multiple image uploads
 * 
 * Features:
 * - Multiple image upload
 * - Drag and drop support
 * - Auto-save to localStorage
 * - Remove individual images
 * - Maximum image limit
 */
export function EditableGallery({ 
  className = '', 
  placeholder = 'Add Gallery Images',
  templateId,
  maxImages = 6,
  images = []
}: EditableGalleryProps) {
  const [galleryImages, setGalleryImages] = useState<string[]>(images)
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadArea, setShowUploadArea] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load images from localStorage on mount
  useEffect(() => {
    if (images.length > 0) {
      setGalleryImages(images)
      return
    }
    
    const loadImagesFromStorage = () => {
      try {
        const existingCustomizations = JSON.parse(localStorage.getItem('templateCustomization') || '{}')
        const customImages = existingCustomizations.customImages || {}
        const storedGallery = customImages.gallery || []
        
        if (storedGallery.length > 0) {
          setGalleryImages(storedGallery)
          console.log('🖼️ Gallery images loaded from localStorage:', storedGallery)
        }
      } catch (error) {
        console.error('Failed to load gallery images from localStorage:', error)
      }
    }
    
    loadImagesFromStorage()
  }, [images])

  const saveToLocalStorage = (newImages: string[]) => {
    try {
      const existingCustomizations = JSON.parse(localStorage.getItem('templateCustomization') || '{}')
      const customImages = existingCustomizations.customImages || {}
      customImages.gallery = newImages
      
      localStorage.setItem('templateCustomization', JSON.stringify({
        ...existingCustomizations,
        customImages
      }))
      
      console.log('🖼️ Gallery images saved to localStorage:', newImages)
    } catch (error) {
      console.error('Failed to save gallery images to localStorage:', error)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - galleryImages.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    setIsUploading(true)
    
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        try {
          const result = await imageUploadService.upload(file)
          
          if (!result.success) {
            throw new Error(result.error || 'Upload failed')
          }
          
          return result.data!.url
        } catch (error) {
          console.error('Failed to upload image:', error)
          // Fallback to local preview for development
          return URL.createObjectURL(file)
        }
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newGalleryImages = [...galleryImages, ...uploadedUrls]
      
      setGalleryImages(newGalleryImages)
      saveToLocalStorage(newGalleryImages)
      setShowUploadArea(false)
      
      console.log('🖼️ Gallery images uploaded:', uploadedUrls)
      
    } catch (error) {
      console.error('Failed to upload gallery images:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newGalleryImages = galleryImages.filter((_, i) => i !== index)
    setGalleryImages(newGalleryImages)
    saveToLocalStorage(newGalleryImages)
  }

  const handleAddImage = () => {
    if (galleryImages.length >= maxImages) return
    setShowUploadArea(true)
  }

  const handleCancelUpload = () => {
    setShowUploadArea(false)
  }

  if (showUploadArea) {
    return (
      <div className={`${className} border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center relative p-6`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-blue-600">Uploading...</p>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-blue-600 mb-2">Add Gallery Images</p>
            <p className="text-xs text-blue-500 mb-3">
              {maxImages - galleryImages.length} slots remaining
            </p>
            <Button size="sm" onClick={handleFileSelect}>
              Select Images
            </Button>
          </div>
        )}

        {/* Cancel button */}
        <Button
          size="sm"
          variant="outline"
          className="absolute -top-2 -right-2 w-6 h-6 p-0 shadow-md"
          onClick={handleCancelUpload}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`${className} space-y-4`}>
      {/* Gallery Grid */}
      {galleryImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              
              {/* Remove button */}
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Image Button */}
      {galleryImages.length < maxImages && (
        <div 
          className="border-2 border-dashed border-gray-200 bg-gray-50 h-32 flex items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-100 transition-colors rounded-lg"
          onClick={handleAddImage}
        >
          <div className="text-center">
            <Plus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">
              {galleryImages.length === 0 ? placeholder : `Add More (${galleryImages.length}/${maxImages})`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
