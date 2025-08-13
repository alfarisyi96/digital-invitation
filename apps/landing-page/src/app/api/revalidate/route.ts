import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from user-dashboard (security)
    const authHeader = headers().get('authorization')
    const expectedToken = process.env.REVALIDATION_SECRET
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { path, slug, lastUpdated } = await request.json()

    if (!path && !slug) {
      return NextResponse.json({ error: 'Path or slug required' }, { status: 400 })
    }

    // Determine the path to revalidate
    const revalidationPath = path || `/i/${slug}`
    
    // Revalidate the specific invitation page
    revalidatePath(revalidationPath)
    
    // Update revalidation timestamp in database
    if (slug && lastUpdated) {
      const supabase = createClient()
      
      // Generate content version hash
      const contentVersion = Buffer.from(lastUpdated + slug).toString('base64').slice(0, 12)
      
      await supabase
        .from('invites')
        .update({ 
          last_revalidated: new Date().toISOString(),
          content_version: contentVersion
        })
        .eq('public_slug', slug)
    }
    
    console.log(`✅ Revalidated: ${revalidationPath} at ${new Date().toISOString()}`)
    
    return NextResponse.json({ 
      revalidated: true, 
      path: revalidationPath,
      timestamp: new Date().toISOString() 
    })
    
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Revalidation failed', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
