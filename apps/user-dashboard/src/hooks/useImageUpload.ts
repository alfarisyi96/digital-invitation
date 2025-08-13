'use client'

import { useState } from 'react'

export interface ImageUploadResult {
  id: string
  url: string
  variants: {
    thumbnail: string
    medium: string
    large: string
  }
  filename: string
  uploaded: string
}

export interface UploadResponse {
  success: boolean
  data?: ImageUploadResult
  error?: string
}

interface CloudflareUploadResponse {
  success: boolean
  result: {
    id: string
    filename: string
    uploaded: string
    requireSignedURLs: boolean
    variants: string[]
  }
  errors: any[]
  messages: any[]
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = async (file: File): Promise<UploadResponse> => {
    try {
      setUploading(true)
      setError(null)

      // Validate file
      if (!file) {
        return {
          success: false,
          error: 'No file provided'
        }
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
        }
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File too large. Maximum size is 10MB.'
        }
      }

      // Get Cloudflare credentials from environment
      const cloudflareAccountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
      const cloudflareToken = process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_API_TOKEN
      
      if (!cloudflareAccountId || !cloudflareToken) {
        console.error('Missing Cloudflare credentials')
        return {
          success: false,
          error: 'Image upload service not configured'
        }
      }

      // Prepare form data for Cloudflare
      const formData = new FormData()
      formData.append('file', file)
      
      // Optional: Add metadata
      const metadata = {
        uploadedBy: 'invitation-user',
        uploadedAt: new Date().toISOString(),
        originalName: file.name
      }
      formData.append('metadata', JSON.stringify(metadata))

      // Upload to Cloudflare Images
      const cloudflareUrl = `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/images/v1`
      
      const response = await fetch(cloudflareUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudflareToken}`
        },
        body: formData
      })

      const result: CloudflareUploadResponse = await response.json()

      if (!result.success) {
        console.error('Cloudflare upload failed:', result.errors)
        return {
          success: false,
          error: 'Failed to upload image'
        }
      }

      // Return the image URL and metadata
      const imageData: ImageUploadResult = {
        id: result.result.id,
        url: `https://imagedelivery.net/${cloudflareAccountId}/${result.result.id}/public`,
        variants: {
          thumbnail: `https://imagedelivery.net/${cloudflareAccountId}/${result.result.id}/thumbnail`,
          medium: `https://imagedelivery.net/${cloudflareAccountId}/${result.result.id}/medium`,
          large: `https://imagedelivery.net/${cloudflareAccountId}/${result.result.id}/large`
        },
        filename: result.result.filename,
        uploaded: result.result.uploaded
      }

      return {
        success: true,
        data: imageData
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setUploading(false)
    }
  }

  const uploadMultipleImages = async (files: File[]): Promise<UploadResponse[]> => {
    const uploadPromises = files.map(file => uploadImage(file))
    return Promise.all(uploadPromises)
  }

  return {
    uploading,
    error,
    uploadImage,
    uploadMultipleImages
  }
}

// Hook for batch image upload with progress tracking
export function useBatchImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadImages = async (
    files: File[], 
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse[]> => {
    try {
      setUploading(true)
      setProgress(0)
      setError(null)

      const results: UploadResponse[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Use the single upload hook
        const { uploadImage } = useImageUpload()
        const result = await uploadImage(file)
        
        results.push(result)
        
        // Update progress
        const currentProgress = ((i + 1) / files.length) * 100
        setProgress(currentProgress)
        
        if (onProgress) {
          onProgress(currentProgress)
        }
      }

      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload images'
      setError(errorMessage)
      return []
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return {
    uploading,
    progress,
    error,
    uploadImages
  }
}

// Hook for image upload with preview
export function useImageUploadWithPreview() {
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { uploadImage } = useImageUpload()

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newPreviews: string[] = []
    
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string)
          setPreviews(prev => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const uploadWithPreview = async (file: File): Promise<UploadResponse> => {
    setUploading(true)
    setError(null)

    try {
      const result = await uploadImage(file)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setUploading(false)
    }
  }

  const clearPreviews = () => {
    setPreviews([])
  }

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  return {
    previews,
    uploading,
    error,
    handleFileSelect,
    uploadWithPreview,
    clearPreviews,
    removePreview
  }
}
