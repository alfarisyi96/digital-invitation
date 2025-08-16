import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { getClientIp, rateLimit, verifyTurnstile } from '../../../lib/security'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    const {
      invitation_id,
      guest_name,
  message,
  turnstile_token
    } = body

    // Validate required fields
    if (!invitation_id || !guest_name || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Basic rate limit: per IP+invite, 10 comments per 5 minutes
    const ip = getClientIp(request as unknown as Request)
    const rlKey = `comments:${invitation_id}:${ip || 'unknown'}`
    const rl = await rateLimit({ key: rlKey, limit: 10, window: 300 })
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

    // Get comment settings for this invitation
    const { data: settings } = await supabase
      .from('comment_settings')
      .select('*')
      .eq('invite_id', invitation_id)
      .single()

    // Check if comments are enabled (default to true if no settings)
    const isEnabled = settings ? settings.is_enabled : true
    if (!isEnabled) {
      return NextResponse.json(
        { error: 'Comments are not enabled for this invitation' },
        { status: 403 }
      )
    }

    // Determine if comment should be auto-approved
    const requiresApproval = settings ? settings.require_approval : false

    // Insert comment
    const { data: comment, error: commentError } = await supabase
      .from('invitation_comments')
      .insert({
        invite_id: invitation_id,
        author_name: guest_name.trim(),
        comment_text: message.trim(),
        is_approved: !requiresApproval // Auto-approve if not required
      })
      .select()
      .single()

    if (commentError) {
      console.error('Comment insertion error:', commentError)
      return NextResponse.json(
        { error: 'Failed to save comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: requiresApproval 
        ? 'Thank you for your message! It will appear after approval.' 
        : 'Thank you for your message!',
      comment_id: comment.id,
      requires_approval: requiresApproval
    })

  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get approved comments for an invitation (public endpoint)
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

    const supabase = createClient()

    // Get approved comments
    const { data: comments, error } = await supabase
      .from('invitation_comments')
      .select('id, author_name, comment_text, created_at, is_approved')
      .eq('invite_id', invitationId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      comments: comments || []
    })

  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
