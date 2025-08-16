'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Comment {
  id: string
  invite_id: string
  author_name: string
  comment_text: string
  is_approved: boolean
  created_at: string
}

export interface CommentSettings {
  is_enabled: boolean
  require_approval: boolean
  max_comment_length: number
  require_email: boolean
  welcome_message: string
}

export interface SubmitCommentData {
  invitationId: string
  authorName: string
  commentText: string
  authorEmail?: string
}

export interface CommentResponse {
  success: boolean
  data?: {
    commentId: string
    message: string
    requiresModeration: boolean
  }
  error?: string
}

export function useComments(invitationId?: string, includeUnapproved: boolean = false) {
  const [comments, setComments] = useState<Comment[]>([])
  const [settings, setSettings] = useState<CommentSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch comments and settings
  const fetchComments = async () => {
    if (!invitationId) return

    try {
      setLoading(true)
      setError(null)

      // Build query for comments
      let query = supabase
        .from('invitation_comments')
        .select('*')
        .eq('invite_id', invitationId)
        .order('created_at', { ascending: false })

      // Filter by approval status unless admin view
      if (!includeUnapproved) {
        query = query.eq('is_approved', true)
      }

      const { data: commentsData, error: commentsError } = await query

      if (commentsError) {
        throw new Error(commentsError.message)
      }

      // Get comment settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('comment_settings')
        .select('*')
        .eq('invite_id', invitationId)
        .maybeSingle() // Use maybeSingle() instead of single() to handle 0 rows gracefully

      if (settingsError) {
        console.error('Comment settings error:', settingsError)
      }

      // If no settings exist, create default ones
      let finalSettingsData = settingsData
      if (!settingsData) {
        const defaultSettings = {
          invite_id: invitationId,
          is_enabled: true,
          require_approval: false,
          max_comment_length: 500,
          require_email: false,
          welcome_message: 'Share your thoughts and well wishes!'
        }

        const { data: createdSettings, error: createError } = await supabase
          .from('comment_settings')
          .insert(defaultSettings)
          .select()
          .single()

        if (createError) {
          console.error('Error creating default comment settings:', createError)
          // Use default values if creation fails
          finalSettingsData = defaultSettings
        } else {
          finalSettingsData = createdSettings
        }
      }

      setComments(commentsData || [])
      setSettings(finalSettingsData || {
        is_enabled: true,
        require_approval: false,
        max_comment_length: 500,
        require_email: false,
        welcome_message: 'Share your thoughts and well wishes!'
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments')
    } finally {
      setLoading(false)
    }
  }

  // Submit a new comment
  const submitComment = async (commentData: SubmitCommentData): Promise<CommentResponse> => {
    try {
      setError(null)

      const { invitationId, authorName, commentText, authorEmail } = commentData

      // Validate required fields
      if (!invitationId || !commentText?.trim()) {
        return {
          success: false,
          error: 'Missing required fields'
        }
      }

      // Get comment settings to check if moderation is required
      const { data: commentSettings } = await supabase
        .from('comment_settings')
        .select('require_approval, max_comment_length, require_email')
        .eq('invite_id', invitationId)
        .single()

      const requireModeration = commentSettings?.require_approval ?? false
      const maxLength = commentSettings?.max_comment_length ?? 500
      const requireEmail = commentSettings?.require_email ?? false

      // Validate comment length
      if (commentText.length > maxLength) {
        return {
          success: false,
          error: `Comment must be ${maxLength} characters or less`
        }
      }

      // Validate email if required
      if (requireEmail && !authorEmail?.trim()) {
        return {
          success: false,
          error: 'Email is required'
        }
      }

      // Insert the comment
      const { data, error } = await supabase
        .from('invitation_comments')
        .insert({
          invite_id: invitationId,
          author_name: authorName?.trim() || 'Anonymous',
          author_email: authorEmail?.trim() || null,
          comment_text: commentText.trim(),
          is_approved: !requireModeration // Auto-approve if moderation not required
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      // Refresh comments if this is the same invitation
      if (invitationId === invitationId) {
        await fetchComments()
      }

      return {
        success: true,
        data: {
          commentId: data.id,
          message: requireModeration 
            ? 'Your comment will appear after approval'
            : 'Comment submitted successfully',
          requiresModeration: requireModeration
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit comment'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // Moderate a comment (approve/reject/delete/toggle)
  const moderateComment = async (commentId: string, action: 'approve' | 'reject' | 'delete' | 'toggle'): Promise<boolean> => {
    try {
      setError(null)

      if (action === 'delete') {
        const { error: deleteError } = await supabase
          .from('invitation_comments')
          .delete()
          .eq('id', commentId)

        if (deleteError) {
          throw new Error(deleteError.message)
        }
      } else {
        let updateData: any = {}

        if (action === 'toggle') {
          // First get current status
          const { data: currentComment, error: fetchError } = await supabase
            .from('invitation_comments')
            .select('is_approved')
            .eq('id', commentId)
            .single()

          if (fetchError) {
            throw new Error(fetchError.message)
          }

          // Toggle the approval status
          updateData = { is_approved: !currentComment.is_approved }
        } else {
          switch (action) {
            case 'approve':
              updateData = { is_approved: true }
              break
            case 'reject':
              updateData = { is_approved: false }
              break
          }
        }

        const { error } = await supabase
          .from('invitation_comments')
          .update(updateData)
          .eq('id', commentId)

        if (error) {
          throw new Error(error.message)
        }
      }

      // Refresh comments
      await fetchComments()
      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to moderate comment'
      setError(errorMessage)
      return false
    }
  }

  // Setup real-time subscription
  useEffect(() => {
    if (!invitationId) return

    fetchComments()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`comments_${invitationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invitation_comments',
          filter: `invite_id=eq.${invitationId}`,
        },
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [invitationId, includeUnapproved])

  return {
    comments,
    settings,
    loading,
    error,
    submitComment,
    moderateComment,
    refetch: fetchComments
  }
}
