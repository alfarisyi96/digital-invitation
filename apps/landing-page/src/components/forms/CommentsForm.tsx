'use client'

import { useState, useEffect } from 'react'

interface Comment {
  id: string
  author_name: string
  comment_text: string
  created_at: string
  is_featured: boolean
}

interface CommentsFormProps {
  invitationId: string
  onSubmit: (data: any) => Promise<void>
  onLoadComments: () => Promise<Comment[]>
  className?: string
}

export function CommentsForm({ invitationId, onSubmit, onLoadComments, className = '' }: CommentsFormProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    comment_text: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadComments()
  }, [])

  const loadComments = async () => {
    try {
      setIsLoading(true)
      const loadedComments = await onLoadComments()
      setComments(loadedComments || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !formData.author_name || !formData.comment_text) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        ...formData,
        invitation_id: invitationId
      })
      
      // Reset form
      setFormData({
        author_name: '',
        author_email: '',
        comment_text: ''
      })
      
      // Reload comments
      await loadComments()
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={className}>
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Leave a Message
      </h3>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              id="author_name"
              required
              value={formData.author_name}
              onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="author_email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="author_email"
              value={formData.author_email}
              onChange={(e) => setFormData(prev => ({ ...prev, author_email: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email (optional)"
            />
          </div>
        </div>

        <div>
          <label htmlFor="comment_text" className="block text-sm font-medium text-gray-700 mb-2">
            Your Message *
          </label>
          <textarea
            id="comment_text"
            rows={4}
            required
            value={formData.comment_text}
            onChange={(e) => setFormData(prev => ({ ...prev, comment_text: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Share your well wishes for the happy couple..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.author_name || !formData.comment_text}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Message'}
        </button>
      </form>

      {/* Comments Display */}
      <div>
        <h4 className="text-xl font-semibold text-gray-800 mb-6">
          Messages from Friends & Family
        </h4>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading messages...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No messages yet. Be the first to leave a message!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`p-6 rounded-lg border ${
                  comment.is_featured 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-semibold text-gray-800">
                      {comment.author_name}
                      {comment.is_featured && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </h5>
                    <p className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {comment.comment_text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
