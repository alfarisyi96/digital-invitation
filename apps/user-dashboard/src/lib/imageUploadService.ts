import { createClient } from '@/lib/supabase/client'

export class ImageUploadService {
  private supabase = createClient()

  async uploadToCloudflare(file: File): Promise<{
    success: boolean
    data?: {
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
    error?: string
  }> {
    try {
      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)

      // Call the Supabase edge function
      const { data, error } = await this.supabase.functions.invoke('cloudflare-image-upload', {
        body: formData
      })

      if (error) {
        console.error('Supabase function error:', error)
        return {
          success: false,
          error: error.message || 'Failed to upload image'
        }
      }

      if (!data?.success) {
        return {
          success: false,
          error: data?.error || 'Upload failed'
        }
      }

      return {
        success: true,
        data: data.data
      }

    } catch (error) {
      console.error('Image upload error:', error)
      return {
        success: false,
        error: 'Failed to upload image'
      }
    }
  }

  // Fallback method using the Next.js API route
  async uploadViaAPI(file: File): Promise<{
    success: boolean
    data?: {
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
    error?: string
  }> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Upload failed'
        }
      }
      
      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      console.error('API upload error:', error)
      return {
        success: false,
        error: 'Failed to upload image'
      }
    }
  }

  // Main upload method with fallback
  async upload(file: File): Promise<{
    success: boolean
    data?: {
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
    error?: string
  }> {
    // Try Supabase edge function first
    const edgeResult = await this.uploadToCloudflare(file)
    
    if (edgeResult.success) {
      console.log('✅ Image uploaded via Supabase edge function')
      return edgeResult
    }

    console.log('⚠️ Edge function failed, trying API fallback...')
    
    // Fallback to Next.js API route
    const apiResult = await this.uploadViaAPI(file)
    
    if (apiResult.success) {
      console.log('✅ Image uploaded via API fallback')
      return apiResult
    }

    console.error('❌ Both upload methods failed')
    return apiResult
  }
}

export const imageUploadService = new ImageUploadService()
