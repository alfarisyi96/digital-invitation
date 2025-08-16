import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient } from '../../../lib/supabase/public'
import { getClientIp, rateLimit, verifyTurnstile } from '../../../lib/security'

export async function POST(request: NextRequest) {
  try {
    const supabase = createPublicClient()
    const body = await request.json()
    
    const {
      invitation_id,
      guest_name,
      attendance_status,
  number_of_guests,
  turnstile_token
    } = body

    // Validate required fields
    if (!invitation_id || !guest_name || !attendance_status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Basic rate limit: per IP+invite, 8 RSVPs per 10 minutes
    const ip = getClientIp(request as unknown as Request)
    const rlKey = `rsvp:${invitation_id}:${ip || 'unknown'}`
    const rl = await rateLimit({ key: rlKey, limit: 8, window: 600 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rl.reset - Date.now()) / 1000).toString() } }
      )
    }

    // Turnstile verification (if configured)
    const captchaOk = await verifyTurnstile(turnstile_token, ip)
    if (!captchaOk) {
      return NextResponse.json(
        { error: 'Captcha verification failed' },
        { status: 400 }
      )
    }

    // Verify invitation exists and is published
    const { data: invitation, error: inviteError } = await supabase
      .from('invites')
      .select('id, is_published, public_slug')
      .eq('id', invitation_id)
      .eq('is_published', true)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or not published' },
        { status: 404 }
      )
    }

    // Get RSVP settings for this invitation
    const { data: settings } = await supabase
      .from('rsvp_settings')
      .select('*')
      .eq('invite_id', invitation_id)
      .single()

    // Check if RSVP is enabled
    if (settings && !settings.is_enabled) {
      return NextResponse.json(
        { error: 'RSVP is not enabled for this invitation' },
        { status: 403 }
      )
    }

    // Check deadline
    if (settings?.deadline && new Date() > new Date(settings.deadline)) {
      return NextResponse.json(
        { error: 'RSVP deadline has passed' },
        { status: 403 }
      )
    }

    // Validate number of guests
    const maxGuests = settings?.max_guests_per_response || 4
    if (number_of_guests > maxGuests) {
      return NextResponse.json(
        { error: `Maximum ${maxGuests} guests allowed` },
        { status: 400 }
      )
    }

    // Insert RSVP response using SECURITY DEFINER function
    console.log('Attempting to submit RSVP via function:', {
      invitation_id: invitation_id,
      guest_name_param: guest_name,
      attendance_status_param: attendance_status,
      number_of_guests_param: attendance_status === 'attending' ? number_of_guests : 0
    })

    const { data: rsvpResult, error: rsvpError } = await supabase
      .rpc('submit_rsvp', {
        invitation_id: invitation_id,
        guest_name_param: guest_name,
        attendance_status_param: attendance_status,
        number_of_guests_param: attendance_status === 'attending' ? number_of_guests : 0
      })

    if (rsvpError) {
      console.error('RSVP function error:', rsvpError)
      return NextResponse.json(
        { error: `Failed to save RSVP response: ${rsvpError.message}` },
        { status: 500 }
      )
    }

    // Check if the function returned an error
    if (!rsvpResult.success) {
      return NextResponse.json(
        { error: rsvpResult.error },
        { status: 400 }
      )
    }

    // Update invitation counters
    // Note: The submit_rsvp function already handles counter updates

    // Return success response with confirmation message
    const confirmationMessage = rsvpResult.message || 'Thank you for your RSVP!'

    return NextResponse.json({
      success: true,
      message: confirmationMessage,
      rsvp_id: rsvpResult.response_id,
      guest_name,
      attendance_status,
      number_of_guests: attendance_status === 'attending' ? number_of_guests : 0
    })

  } catch (error) {
    console.error('RSVP API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get RSVP settings for an invitation (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('invitation_id')

    if (!invitationId) {
      return NextResponse.json(
        { error: 'invitation_id parameter required' },
        { status: 400 }
      )
    }

    const supabase = createPublicClient()

    // Get RSVP settings
    const { data: settings, error } = await supabase
      .from('rsvp_settings')
      .select('*')
      .eq('invite_id', invitationId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching RSVP settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch RSVP settings' },
        { status: 500 }
      )
    }

    // Return default settings if none found
    const defaultSettings = {
      is_enabled: true,
      deadline: null,
      max_guests_per_response: 4,
      confirmation_message: 'Thank you for your RSVP!'
    }

    return NextResponse.json({
      settings: settings || defaultSettings
    })

  } catch (error) {
    console.error('RSVP settings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
