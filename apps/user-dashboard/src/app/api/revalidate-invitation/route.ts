import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { slug, lastUpdated, invitationId } = await request.json()
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 })
    }

    // Get landing page URL from environment
    const landingPageUrl = process.env.LANDING_PAGE_URL || 'http://localhost:3001'
    const revalidationSecret = process.env.REVALIDATION_SECRET
    
    if (!revalidationSecret) {
      console.error('REVALIDATION_SECRET not configured')
      return NextResponse.json({ error: 'Revalidation not configured' }, { status: 500 })
    }

    // Call landing page revalidation endpoint
    const revalidationResponse = await fetch(`${landingPageUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${revalidationSecret}`
      },
      body: JSON.stringify({
        slug,
        lastUpdated: lastUpdated || new Date().toISOString(),
        path: `/i/${slug}`
      })
    })

    if (!revalidationResponse.ok) {
      const errorText = await revalidationResponse.text()
      console.error('Revalidation failed:', errorText)
      return NextResponse.json({ 
        error: 'Revalidation failed', 
        details: errorText 
      }, { status: 500 })
    }

    const result = await revalidationResponse.json()
    
    console.log(`✅ Triggered revalidation for invitation: ${slug}`)
    
    return NextResponse.json({ 
      success: true, 
      revalidated: result.revalidated,
      timestamp: result.timestamp,
      path: result.path
    })
    
  } catch (error) {
    console.error('Revalidation trigger error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger revalidation', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
