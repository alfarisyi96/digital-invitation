import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TemplateRegistry } from '@invitation/templates'
import type { InvitationData } from '@invitation/templates'

interface PageProps {
  params: {
    slug: string
  }
}

// ISR: Revalidate only via webhook, not time-based
export const revalidate = false

// Generate static params for popular invitations at build time
export async function generateStaticParams() {
  try {
    // Use a direct connection for build-time static generation
    const { createClient } = await import('@supabase/supabase-js')
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not found for static generation')
      return []
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data: invitations } = await supabase
      .from('invites')
      .select('public_slug')
      .eq('is_published', true)
      .not('public_slug', 'is', null)
      .limit(100) // Pre-generate top 100 popular invitations
      
    return invitations?.map((invitation) => ({
      slug: invitation.public_slug,
    })) || []
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function PublicInvitationPage({ params }: PageProps) {
  const supabase = createClient()
  
  // Get invitation by public_slug with template info
  const { data: invitation, error } = await supabase
    .from('invites')
    .select(`
      *,
      templates (
        id,
        name,
        slug,
        tier,
        features
      )
    `)
    .eq('public_slug', params.slug)
    .eq('is_published', true) // Only show published invitations
    .single()

  if (error || !invitation) {
    notFound()
  }

  // Transform to our template data format
  const customData = invitation.custom_data as any
  const templateData: InvitationData = {
    id: invitation.id,
    title: invitation.title,
    public_slug: invitation.public_slug,
    status: invitation.status,
    last_updated: invitation.updated_at,
    last_revalidated: invitation.last_revalidated,
    content_version: invitation.content_version || 'initial',
    
    // Wedding details from custom_data
    bride_full_name: customData?.bride_full_name || '',
    bride_nickname: customData?.bride_nickname || '',
    groom_full_name: customData?.groom_full_name || '',
    groom_nickname: customData?.groom_nickname || '',
    
    // Event details
    ceremony_date: customData?.ceremony_date || '',
    ceremony_time: customData?.ceremony_time || '',
    ceremony_venue: customData?.ceremony_venue || '',
    ceremony_address: customData?.ceremony_address || '',
    
    reception_date: customData?.reception_date,
    reception_time: customData?.reception_time,
    reception_venue: customData?.reception_venue,
    reception_address: customData?.reception_address,
    
    // Premium features
    hero_image: customData?.hero_image,
    bride_image: customData?.bride_image,
    groom_image: customData?.groom_image,
    gallery_photos: customData?.gallery_photos || [],
    
    // Template info
    template: {
      id: invitation.templates.id,
      name: invitation.templates.name,
      slug: invitation.templates.slug,
      tier: invitation.templates.tier
    },
    
    // Settings
    settings: {
      rsvp_enabled: customData?.settings?.rsvp_enabled ?? true,
      comments_enabled: customData?.settings?.comments_enabled ?? true,
      gallery_enabled: customData?.settings?.gallery_enabled ?? true,
    }
  }

  // Load the appropriate template component
  const TemplateComponent = await TemplateRegistry.getTemplate(invitation.templates.slug)
  
  if (!TemplateComponent) {
    console.error(`Template not found: ${invitation.templates.slug}`)
    notFound()
  }

  // Version data for client-side staleness detection
  const versionData = {
    contentVersion: templateData.content_version,
    lastUpdated: templateData.last_updated,
    lastRevalidated: templateData.last_revalidated,
  }

  return (
    <>
      {/* Version data for client-side checks */}
      <script
        id="invitation-version"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(versionData) }}
      />
      
      {/* Render the template (not editable for public view) */}
      <TemplateComponent invitation={templateData} isEditable={false} />
    </>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = createClient()
  
  const { data: invitation } = await supabase
    .from('invites')
    .select('title, description, custom_data, updated_at')
    .eq('public_slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!invitation) {
    return {
      title: 'Invitation Not Found'
    }
  }

  const customData = invitation.custom_data as any
  const brideGroom = customData?.bride_full_name && customData?.groom_full_name 
    ? `${customData.bride_full_name} & ${customData.groom_full_name}`
    : invitation.title

  const ceremonyDate = customData?.ceremony_date 
    ? new Date(customData.ceremony_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : ''

  return {
    title: `${brideGroom} Wedding Invitation`,
    description: `You're invited to celebrate the wedding of ${brideGroom}${ceremonyDate ? ` on ${ceremonyDate}` : ''}`,
    openGraph: {
      title: `${brideGroom} Wedding Invitation`,
      description: `Join us for our special day${ceremonyDate ? ` on ${ceremonyDate}` : ''}`,
      type: 'website',
      images: customData?.hero_image ? [
        {
          url: customData.hero_image,
          width: 1200,
          height: 630,
          alt: `${brideGroom} Wedding`
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brideGroom} Wedding Invitation`,
      description: `Join us for our special day${ceremonyDate ? ` on ${ceremonyDate}` : ''}`,
      images: customData?.hero_image ? [customData.hero_image] : [],
    }
  }
}
