import { createClient } from '@/lib/supabase/client'

export class ImageUploadService {
  private supabase = createClient()

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
    try {
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

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split('.').pop() || 'jpg'
      const fileName = `invitation-images/${timestamp}-${randomString}.${fileExtension}`

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('invitation-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Supabase storage error:', error)
        return {
          success: false,
          error: error.message || 'Failed to upload image'
        }
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('invitation-images')
        .getPublicUrl(data.path)

      // Create variants using Supabase's built-in transformations
      const baseUrl = publicUrl
      const variants = {
        thumbnail: `${baseUrl}?width=150&height=150&resize=cover&quality=80`,
        medium: `${baseUrl}?width=400&height=400&resize=cover&quality=85`,
        large: `${baseUrl}?width=800&height=800&resize=cover&quality=90`
      }

      console.log('✅ Image uploaded to Supabase Storage:', baseUrl)

      return {
        success: true,
        data: {
          id: data.path,
          url: publicUrl,
          variants,
          filename: file.name,
          uploaded: new Date().toISOString()
        }
      }

    } catch (error) {
      console.error('Image upload error:', error)
      return {
        success: false,
        error: 'Failed to upload image'
      }
    }
  }

  // Method to delete an image from storage
  async deleteImage(imagePath: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { error } = await this.supabase.storage
        .from('invitation-images')
        .remove([imagePath])

      if (error) {
        console.error('Failed to delete image:', error)
        return {
          success: false,
          error: error.message || 'Failed to delete image'
        }
      }

      console.log('✅ Image deleted from Supabase Storage:', imagePath)
      return { success: true }

    } catch (error) {
      console.error('Delete image error:', error)
      return {
        success: false,
        error: 'Failed to delete image'
      }
    }
  }
}

export const imageUploadService = new ImageUploadService()
