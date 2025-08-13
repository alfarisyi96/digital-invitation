import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PublicInvitationView from '@/components/PublicInvitationView'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function PublicInvitationPage({ params }: PageProps) {
  const supabase = createClient()
  
  // Get invitation by slug
  const { data: invitation, error } = await supabase
    .from('invites')
    .select(`
      *,
      templates (
        id,
        name,
        category,
        tier,
        component_name
      )
    `)
    .eq('slug', params.slug)
    .eq('status', 'published') // Only show published invitations
    .single()

  if (error || !invitation) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <PublicInvitationView invitation={invitation} />
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = createClient()
  
  const { data: invitation } = await supabase
    .from('invites')
    .select('title, description, custom_data')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!invitation) {
    return {
      title: 'Invitation Not Found'
    }
  }

  const customData = invitation.custom_data as any
  const brideGroom = customData?.bride_name && customData?.groom_name 
    ? `${customData.bride_name} & ${customData.groom_name}`
    : invitation.title

  return {
    title: `${brideGroom} - Wedding Invitation`,
    description: invitation.description || `Join us for ${brideGroom}'s wedding celebration`,
    openGraph: {
      title: `${brideGroom} - Wedding Invitation`,
      description: invitation.description || `Join us for ${brideGroom}'s wedding celebration`,
      type: 'website',
    }
  }
}
