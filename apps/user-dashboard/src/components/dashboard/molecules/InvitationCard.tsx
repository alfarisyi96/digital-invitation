import React from 'react'
import { Calendar, Eye, Settings, Share2, Edit3, Trash2 } from 'lucide-react'
import type { Invitation } from '@/services/supabaseService'

interface InvitationCardProps {
  invitation: Invitation
  actionLoading: string | null
  onEdit: (id: string, category: string) => void
  onPublish: (id: string) => void
  onUnpublish: (id: string) => void
  onPreview: (slugOrId: string) => void
  onManage: (id: string) => void
  getStatusBadge: (status: string, isPublished: boolean) => string
}

export function InvitationCard({ 
  invitation, 
  actionLoading, 
  onEdit, 
  onPublish, 
  onUnpublish, 
  onPreview, 
  onManage,
  getStatusBadge 
}: InvitationCardProps) {
  const isLoading = actionLoading === invitation.id

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleShare = async () => {
    if (invitation.public_slug && invitation.is_published) {
      const shareUrl = `${window.location.origin}/i/${invitation.public_slug}`
      try {
        await navigator.clipboard.writeText(shareUrl)
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 
              className="text-lg font-semibold text-gray-900 break-words hyphens-auto leading-tight cursor-pointer hover:text-blue-600 transition-colors duration-200"
              onClick={() => onManage(invitation.id)}
              title="Click to manage RSVP and comments"
            >
              {invitation.title}
            </h3>
            {invitation.description && (
              <p className="mt-1 text-sm text-gray-600 break-words hyphens-auto leading-tight line-clamp-2">
                {invitation.description}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(invitation.status, invitation.is_published)}`}>
              {invitation.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Created {formatDate(invitation.created_at)}</span>
          </div>
          {invitation.unique_visitors !== undefined && (
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{invitation.unique_visitors} views</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(invitation.id, invitation.category)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </button>
            <button
              onClick={() => onPreview(invitation.public_slug || invitation.id)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </button>
          </div>

          <div className="flex space-x-2">
            {invitation.is_published && invitation.public_slug && (
              <button
                onClick={handleShare}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Copy share link"
              >
                <Share2 className="h-3 w-3" />
              </button>
            )}
            
            {invitation.is_published ? (
              <button
                onClick={() => onUnpublish(invitation.id)}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoading ? 'Unpublishing...' : 'Unpublish'}
              </button>
            ) : (
              <button
                onClick={() => onPublish(invitation.id)}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Publishing...' : 'Publish'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
