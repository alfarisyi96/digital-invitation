import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MessageCircle, Heart, Send, Calendar, CheckCircle2, User } from 'lucide-react'

interface Comment {
  id: string
  guestName: string
  message: string
  createdAt: string
  isApproved: boolean
}

interface CommentsFormProps {
  invitationId: string
  settings?: {
    requireName: boolean
    requireModeration: boolean
    maxCommentLength: number
    allowAnonymous: boolean
  }
  onSubmit: (data: CommentFormData) => Promise<void>
  onLoadComments: () => Promise<Comment[]>
  className?: string
}

interface CommentFormData {
  guestName: string
  message: string
}

export function CommentsForm({ 
  invitationId, 
  settings = {
    requireName: true,
    requireModeration: true,
    maxCommentLength: 500,
    allowAnonymous: false
  },
  onSubmit,
  onLoadComments,
  className = '' 
}: CommentsFormProps) {
  const [formData, setFormData] = useState<CommentFormData>({
    guestName: '',
    message: ''
  })
  
  const [comments, setComments] = useState<Comment[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadComments()
  }, [])

  const loadComments = async () => {
    try {
      setIsLoading(true)
      const loadedComments = await onLoadComments()
      // Only show approved comments in public view
      setComments(loadedComments.filter(comment => comment.isApproved))
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.message.trim()) {
      alert('Please enter a message')
      return
    }
    
    if (settings.requireName && !formData.guestName.trim()) {
      alert('Please enter your name')
      return
    }
    
    if (formData.message.length > settings.maxCommentLength) {
      alert(`Message must be ${settings.maxCommentLength} characters or less`)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
      setIsSubmitted(true)
      
      // Reset form
      setFormData({ guestName: '', message: '' })
      setShowForm(false)
      
      // Reload comments if not requiring moderation
      if (!settings.requireModeration) {
        await loadComments()
      }
      
    } catch (error) {
      console.error('Comment submission failed:', error)
      alert('Failed to submit comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (field: keyof CommentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageCircle className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-2xl font-serif text-gray-800 mb-2">Guest Book</h3>
        <p className="text-gray-600">Share your love, memories, and well wishes</p>
      </div>

      {/* Success Message */}
      {isSubmitted && (
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-green-800 font-medium">
            {settings.requireModeration 
              ? 'Thank you! Your message will appear after approval.'
              : 'Thank you for your message!'}
          </p>
        </div>
      )}

      {/* Add Comment Button/Form */}
      {!showForm ? (
        <div className="text-center">
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            <Heart className="w-4 h-4 mr-2" />
            Leave a Message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Leave a Message</h4>
          
          {/* Guest Name */}
          {(settings.requireName || !settings.allowAnonymous) && (
            <div className="mb-4">
              <Label htmlFor="guestName" className="text-sm font-medium text-gray-700">
                Your Name {settings.requireName ? '*' : '(Optional)'}
              </Label>
              <Input
                id="guestName"
                type="text"
                value={formData.guestName}
                onChange={(e) => updateFormData('guestName', e.target.value)}
                placeholder="Enter your name"
                required={settings.requireName}
                className="mt-1"
              />
            </div>
          )}

          {/* Message */}
          <div className="mb-4">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              Your Message *
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => updateFormData('message', e.target.value)}
              placeholder="Share your love, memories, or well wishes for the couple..."
              className="mt-1"
              rows={4}
              maxLength={settings.maxCommentLength}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.message.length}/{settings.maxCommentLength} characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setFormData({ guestName: '', message: '' })
              }}
              className="px-4 py-2"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Comments Display */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-gray-600">Loading messages...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No messages yet. Be the first to leave a message!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800 mb-4 text-center">
              Messages from Loved Ones ({comments.length})
            </h4>
            
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium text-gray-800">
                        {comment.guestName || 'Anonymous'}
                      </h5>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
