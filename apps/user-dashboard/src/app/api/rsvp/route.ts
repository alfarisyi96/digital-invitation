import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      invitationId,
      guestName,
      guestEmail,
      guestPhone,
      attendanceStatus,
      numberOfGuests,
      dietaryRestrictions,
      specialRequests,
      message
    } = body

    // Validate required fields
    if (!invitationId || !guestName || !attendanceStatus) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Call the submit_rsvp function
    const { data, error } = await supabase.rpc('submit_rsvp', {
      invitation_id: invitationId,
      guest_name_param: guestName,
      guest_email_param: guestEmail || null,
      guest_phone_param: guestPhone || null,
      attendance_status_param: attendanceStatus,
      number_of_guests_param: numberOfGuests || 1,
      dietary_restrictions_param: dietaryRestrictions || null,
      special_requests_param: specialRequests || null,
      message_param: message || null
    })

    if (error) {
      console.error('RSVP submission error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // Check if the function returned an error
    if (!data.success) {
      return NextResponse.json({
        success: false,
        error: data.error
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        responseId: data.response_id,
        message: data.message
      }
    })

  } catch (error) {
    console.error('RSVP API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to submit RSVP'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('invitationId')

    if (!invitationId) {
      return NextResponse.json({
        success: false,
        error: 'Invitation ID is required'
      }, { status: 400 })
    }

    // Get RSVP summary
    const { data: summary, error: summaryError } = await supabase.rpc('get_rsvp_summary', {
      invitation_id: invitationId
    })

    if (summaryError) {
      console.error('RSVP summary error:', summaryError)
      return NextResponse.json({
        success: false,
        error: summaryError.message
      }, { status: 500 })
    }

    // Get RSVP settings
    const { data: settings, error: settingsError } = await supabase
      .from('rsvp_settings')
      .select('*')
      .eq('invite_id', invitationId)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') { // Not found is OK
      console.error('RSVP settings error:', settingsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        settings: settings || {
          is_enabled: true,
          max_guests_per_response: 4,
          require_email: false,
          require_phone: false,
          collect_dietary_restrictions: true,
          collect_special_requests: true,
          allow_guest_message: true
        }
      }
    })

  } catch (error) {
    console.error('RSVP GET API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get RSVP data'
    }, { status: 500 })
  }
}
