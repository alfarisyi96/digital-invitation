import React, { useState, useRef } from 'react'
import { Upload, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { imageUploadService } from '@/lib/imageUploadService'

interface EditableImageProps {
  imageKey: string
  className?: string
  placeholder?: string
  templateId?: string
}

/**
 * Editable Image Component
 * 
 * Features:
 * - Click to upload image
 * - Crop/resize before upload (future enhancement)
 * - Upload to Cloudflare after user edits
 * - Auto-save to localStorage
 */
export function EditableImage({ 
  imageKey, 
  className = '', 
  placeholder = 'Upload Image',
  templateId
}: EditableImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadArea, setShowUploadArea] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const saveToLocalStorage = (key: string, url: string) => {
    try {
      const existingCustomizations = JSON.parse(localStorage.getItem('templateCustomization') || '{}')
      const customImages = existingCustomizations.customImages || {}
      customImages[key] = url
      
      localStorage.setItem('templateCustomization', JSON.stringify({
        ...existingCustomizations,
        customImages
      }))
      
      console.log('🖼️ Image saved to localStorage:', { [key]: url })
    } catch (error) {
      console.error('Failed to save image to localStorage:', error)
    }
  }

  const handleImageClick = () => {
    if (!imageUrl) {
      setShowUploadArea(true)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    try {
      // Upload using the new service (Supabase edge function with API fallback)
      const result = await imageUploadService.upload(file)
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }
      
      // Use the Cloudflare URL
      const cloudflareUrl = result.data!.url
      
      setImageUrl(cloudflareUrl)
      saveToLocalStorage(imageKey, cloudflareUrl)
      setShowUploadArea(false)
      
      console.log('�️ Image uploaded to Cloudflare:', { imageKey, url: cloudflareUrl })
      
    } catch (error) {
      console.error('Failed to upload image:', error)
      // Fallback to local preview for development
      const localUrl = URL.createObjectURL(file)
      setImageUrl(localUrl)
      saveToLocalStorage(imageKey, localUrl)
      setShowUploadArea(false)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
    setShowUploadArea(false)
    saveToLocalStorage(imageKey, '')
  }

  const handleCancelUpload = () => {
    setShowUploadArea(false)
  }

  if (imageUrl) {
    return (
      <div className="relative group">
        <img
          src={imageUrl}
          alt={placeholder}
          className={`${className} object-cover`}
        />
        
        {/* Remove button */}
        <Button
          size="sm"
          variant="destructive"
          className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          onClick={handleRemoveImage}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  if (showUploadArea) {
    return (
      <div className={`${className} border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center relative`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">{placeholder}</p>
            <Button size="sm" onClick={handleFileSelect}>
              Select Image
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
    <div 
      className={`${className} border-2 border-dashed border-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors group`}
      onClick={handleImageClick}
    >
      <div className="text-center">
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
        <p className="text-xs text-gray-500">{placeholder}</p>
      </div>
      
      {/* Upload icon on hover */}
      <Button
        size="sm"
        variant="outline"
        className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md"
        onClick={(e) => {
          e.stopPropagation()
          setShowUploadArea(true)
        }}
      >
        <Upload className="w-3 h-3" />
      </Button>
    </div>
  )
}
