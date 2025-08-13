import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface InvitationDetailsRequest {
  invitation_id: string
  user_id?: string
}

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const url = new URL(req.url)
    const invitation_id = url.searchParams.get('invitation_id')
    
    if (!invitation_id) {
      return new Response(JSON.stringify({ error: 'invitation_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get invitation with template info
    const { data: invitation, error: inviteError } = await supabase
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
      .eq('id', invitation_id)
      .single()

    if (inviteError || !invitation) {
      return new Response(JSON.stringify({ error: 'Invitation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get RSVP summary using RPC function
    const { data: rsvpSummary } = await supabase.rpc('get_rsvp_summary', {
      invitation_id: invitation_id
    })

    // Get RSVP responses
    const { data: rsvpResponses } = await supabase
      .from('rsvp_responses')
      .select('*')
      .eq('invitation_id', invitation_id)
      .order('created_at', { ascending: false })

    // Get comments (including unapproved for admin view)
    const { data: comments } = await supabase
      .from('invitation_comments')
      .select('*')
      .eq('invitation_id', invitation_id)
      .order('created_at', { ascending: false })

    // Return consolidated data
    return new Response(JSON.stringify({
      invitation,
      rsvpSummary,
      rsvpResponses: rsvpResponses || [],
      comments: comments || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error fetching invitation details:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
