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
      message
    } = body

    // Validate required fields
    if (!invitationId || !message?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Get comment settings to check if moderation is required
    const { data: settings } = await supabase
      .from('comment_settings')
      .select('require_moderation, max_comment_length, require_name')
      .eq('invite_id', invitationId)
      .single()

    const requireModeration = settings?.require_moderation ?? true
    const maxLength = settings?.max_comment_length ?? 500
    const requireName = settings?.require_name ?? true

    // Validate message length
    if (message.length > maxLength) {
      return NextResponse.json({
        success: false,
        error: `Message must be ${maxLength} characters or less`
      }, { status: 400 })
    }

    // Validate name if required
    if (requireName && !guestName?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Name is required'
      }, { status: 400 })
    }

    // Insert the comment
    const { data, error } = await supabase
      .from('invitation_comments')
      .insert({
        invite_id: invitationId,
        guest_name: guestName?.trim() || 'Anonymous',
        message: message.trim(),
        is_approved: !requireModeration // Auto-approve if moderation not required
      })
      .select()
      .single()

    if (error) {
      console.error('Comment submission error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        commentId: data.id,
        message: requireModeration 
          ? 'Your comment will appear after approval'
          : 'Comment submitted successfully',
        requiresModeration: requireModeration
      }
    })

  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to submit comment'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('invitationId')
    const includeUnapproved = searchParams.get('includeUnapproved') === 'true'

    if (!invitationId) {
      return NextResponse.json({
        success: false,
        error: 'Invitation ID is required'
      }, { status: 400 })
    }

    // Build query
    let query = supabase
      .from('invitation_comments')
      .select('*')
      .eq('invite_id', invitationId)
      .order('created_at', { ascending: false })

    // Filter by approval status unless admin view
    if (!includeUnapproved) {
      query = query.eq('is_approved', true)
    }

    const { data: comments, error: commentsError } = await query

    if (commentsError) {
      console.error('Comments fetch error:', commentsError)
      return NextResponse.json({
        success: false,
        error: commentsError.message
      }, { status: 500 })
    }

    // Get comment settings
    const { data: settings, error: settingsError } = await supabase
      .from('comment_settings')
      .select('*')
      .eq('invite_id', invitationId)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') { // Not found is OK
      console.error('Comment settings error:', settingsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        comments: comments || [],
        settings: settings || {
          is_enabled: true,
          require_moderation: true,
          max_comment_length: 500,
          require_name: true,
          allow_anonymous: false
        }
      }
    })

  } catch (error) {
    console.error('Comments GET API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get comments'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { commentId, action } = body

    if (!commentId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    let updateData: any = {}

    switch (action) {
      case 'approve':
        updateData = { is_approved: true }
        break
      case 'reject':
        updateData = { is_approved: false }
        break
      case 'delete':
        // For delete, we'll use a separate DELETE request
        const { error: deleteError } = await supabase
          .from('invitation_comments')
          .delete()
          .eq('id', commentId)

        if (deleteError) {
          return NextResponse.json({
            success: false,
            error: deleteError.message
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Comment deleted successfully'
        })
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('invitation_comments')
      .update(updateData)
      .eq('id', commentId)
      .select()
      .single()

    if (error) {
      console.error('Comment update error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Comment ${action}d successfully`
    })

  } catch (error) {
    console.error('Comment PATCH API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update comment'
    }, { status: 500 })
  }
}
