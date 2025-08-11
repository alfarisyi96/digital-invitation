import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Share2, Globe, Lock } from 'lucide-react'
import { type Invitation } from '@/services/supabaseService'

interface PreviewLayoutProps {
  invitation: Invitation | null
  loading: boolean
  error: string | null
  onBack: () => void
  onEdit: () => void
  onShare: () => void
  children: React.ReactNode
}

export function PreviewLayout({
  invitation,
  loading,
  error,
  onBack,
  onEdit,
  onShare,
  children
}: PreviewLayoutProps) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error || 'Invitation not found'}</p>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 break-words hyphens-auto">
                  Preview Invitation
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    invitation.is_published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {invitation.is_published ? (
                      <>
                        <Globe className="w-3 h-3 mr-1" />
                        Published
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Draft Preview
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {invitation.is_published && (
                <Button variant="outline" onClick={onShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Public URL
                </Button>
              )}
              <Button onClick={onEdit}>
                Edit Invitation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
