import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvitationDetailView from '@/components/dashboard/InvitationDetailView'

interface PageProps {
  params: {
    id: string
  }
}

export default async function InvitationDetailPage({ params }: PageProps) {
  const supabase = createClient()
  
  // Get invitation with template info
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
    .eq('id', params.id)
    .single()

  if (error || !invitation) {
    notFound()
  }

  // Get RSVP summary
  const { data: rsvpSummary } = await supabase.rpc('get_rsvp_summary', {
    invitation_id: params.id
  })

  // Get RSVP responses
  const { data: rsvpResponses } = await supabase
    .from('rsvp_responses')
    .select('*')
    .eq('invitation_id', params.id)
    .order('created_at', { ascending: false })

  // Get comments (including unapproved for admin view)
  const { data: comments } = await supabase
    .from('invitation_comments')
    .select('*')
    .eq('invitation_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <InvitationDetailView 
        invitation={invitation}
        rsvpSummary={rsvpSummary}
        rsvpResponses={rsvpResponses || []}
        comments={comments || []}
      />
    </div>
  )
}
