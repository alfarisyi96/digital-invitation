import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Get Cloudflare credentials from environment
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const cloudflareToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN
    
    if (!cloudflareAccountId || !cloudflareToken) {
      console.error('Missing Cloudflare credentials')
      return NextResponse.json({ 
        error: 'Image upload service not configured' 
      }, { status: 500 })
    }

    // Prepare form data for Cloudflare
    const cloudflareFormData = new FormData()
    cloudflareFormData.append('file', file)
    
    // Optional: Add metadata
    const metadata = {
      uploadedBy: 'invitation-user',
      uploadedAt: new Date().toISOString(),
      originalName: file.name
    }
    cloudflareFormData.append('metadata', JSON.stringify(metadata))

    // Upload to Cloudflare Images
    const cloudflareUrl = `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/images/v1`
    
    const response = await fetch(cloudflareUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cloudflareToken}`
      },
      body: cloudflareFormData
    })

    const result: CloudflareUploadResponse = await response.json()

    if (!result.success) {
      console.error('Cloudflare upload failed:', result.errors)
      return NextResponse.json({ 
        error: 'Failed to upload image' 
      }, { status: 500 })
    }

    // Return the image URL and metadata
    const imageData = {
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

    return NextResponse.json({
      success: true,
      data: imageData
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload image' 
    }, { status: 500 })
  }
}
