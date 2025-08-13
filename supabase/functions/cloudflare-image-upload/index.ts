import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Cloudflare credentials from environment
    const cloudflareAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')
    const cloudflareToken = Deno.env.get('CLOUDFLARE_IMAGES_API_TOKEN')
    
    if (!cloudflareAccountId || !cloudflareToken) {
      console.error('Missing Cloudflare credentials')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Image upload service not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the file from form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No file provided' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'File too large. Maximum size is 10MB.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
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
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to upload image',
          details: result.errors
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
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

    return new Response(
      JSON.stringify({
        success: true,
        data: imageData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Image upload error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to upload image',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
