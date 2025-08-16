'use client'

import React, { useState, useEffect } from 'react'

export interface Comment {
  id: string
  author_name: string
  comment_text: string
  created_at: string
  is_approved: boolean
}

export interface CommentFormData {
  guest_name: string
  message: string
}

interface CommentsSectionProps {
  invitationId: string
  className?: string
}

export function CommentsSection({ invitationId, className = '' }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [formData, setFormData] = useState<CommentFormData>({
    guest_name: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await fetch(`/api/comments?invitation_id=${invitationId}`)
        if (response.ok) {
          const data = await response.json()
          setComments(data.comments || [])
        }
      } catch (error) {
        console.error('Failed to load comments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadComments()
  }, [invitationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.guest_name.trim() || !formData.message.trim()) {
      setSubmitMessage('Please fill in both name and message.')
      setSubmitSuccess(false)
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitation_id: invitationId,
          guest_name: formData.guest_name.trim(),
          message: formData.message.trim()
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        setSubmitMessage('Thank you for your message! It will appear after approval.')
        // Reset form
        setFormData({
          guest_name: '',
          message: ''
        })
        // Reload comments to show new one if auto-approved
        setTimeout(() => {
          const loadComments = async () => {
            try {
              const response = await fetch(`/api/comments?invitation_id=${invitationId}`)
              if (response.ok) {
                const data = await response.json()
                setComments(data.comments || [])
              }
            } catch (error) {
              console.error('Failed to reload comments:', error)
            }
          }
          loadComments()
        }, 1000)
      } else {
        setSubmitMessage(result.error || 'Failed to submit comment')
        setSubmitSuccess(false)
      }
    } catch (error) {
      setSubmitMessage('Failed to submit comment. Please try again.')
      setSubmitSuccess(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CommentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`comments-section ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Leave a Message</h3>
        
        {/* Comment Form */}
        <div className="mb-8">
          {submitMessage && (
            <div className={`mb-4 p-3 rounded-lg ${submitSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Guest Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.guest_name}
                onChange={(e) => handleInputChange('guest_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Message *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your thoughts and wishes..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Post Message'}
            </button>
          </form>
        </div>

        {/* Comments Display */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Messages from Guests</h4>
          
          {isLoading ? (
            <div className="text-center py-4 text-gray-600">
              Loading messages...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-gray-600">
              No messages yet. Be the first to leave one!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-800">{comment.author_name}</h5>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{comment.comment_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
