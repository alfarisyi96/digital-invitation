'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseService, type Invitation } from '@/services/supabaseService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserInvitations } from '@/hooks/useSupabaseData'
import { ArrowLeft, Eye, Globe, Lock, Share2 } from 'lucide-react'

export default function PreviewInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const slugOrId = params.id as string
  const { invitations } = useUserInvitations()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slugOrId && invitations.length > 0) {
      loadInvitation()
    }
  }, [slugOrId, invitations])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      
      // First try to find by public_slug, then by ID
      let found = invitations.find(inv => inv.public_slug === slugOrId)
      if (!found) {
        found = invitations.find(inv => inv.id === slugOrId)
      }
      
      if (found) {
        setInvitation(found)
      } else {
        setError('Invitation not found')
      }
    } catch (err) {
      setError('Failed to load invitation')
      console.error('Error loading invitation:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  const handleShare = () => {
    if (invitation?.public_slug && invitation.is_published) {
      // This would be the actual public URL on your landing page frontend
      const publicUrl = `${process.env.NEXT_PUBLIC_LANDING_PAGE_URL || 'https://your-landing-page.com'}/invite/${invitation.public_slug}`
      
      if (navigator.share) {
        navigator.share({
          title: invitation.title,
          text: `You're invited! ${invitation.description || ''}`,
          url: publicUrl,
        })
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(publicUrl).then(() => {
          alert('Public URL copied to clipboard!')
        })
      }
    } else {
      alert('Invitation must be published to share publicly')
    }
  }

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
            <Button onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Extract form data from custom_data
  const formData = invitation.custom_data as any || {}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Preview Invitation</h1>
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
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Public URL
                </Button>
              )}
              <Button onClick={() => router.push(`/create?step=1&edit=${invitation.id}`)}>
                Edit Invitation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Main Preview */}
          <div>
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">{invitation.title}</h1>
                {invitation.description && (
                  <p className="text-blue-100 text-lg">{invitation.description}</p>
                )}
              </div>
              
              <CardContent className="p-8">
                {/* Wedding Details */}
                {formData.bride_full_name && formData.groom_full_name && (
                  <div className="text-center mb-8">
                    <div className="space-y-2">
                      <div className="text-2xl font-elegant text-gray-800">
                        {formData.bride_full_name}
                      </div>
                      <div className="text-xl text-gray-600">&</div>
                      <div className="text-2xl font-elegant text-gray-800">
                        {formData.groom_full_name}
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Details */}
                <div className="space-y-6">
                  {invitation.event_date && (
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Date</h3>
                      <p className="text-gray-700">
                        {new Date(invitation.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {formData.ceremony_time && (
                        <p className="text-gray-600 mt-1">Ceremony: {formData.ceremony_time}</p>
                      )}
                      {formData.reception_time && (
                        <p className="text-gray-600">Reception: {formData.reception_time}</p>
                      )}
                    </div>
                  )}

                  {(formData.venue_name || invitation.location) && (
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Venue</h3>
                      {formData.venue_name && (
                        <p className="text-gray-700 font-medium">{formData.venue_name}</p>
                      )}
                      {invitation.location && (
                        <p className="text-gray-600">{invitation.location}</p>
                      )}
                    </div>
                  )}

                  {formData.invitation_message && (
                    <div className="text-center bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Message</h3>
                      <p className="text-gray-700 italic">{formData.invitation_message}</p>
                    </div>
                  )}

                  {/* Parents Information */}
                  {(formData.bride_father || formData.bride_mother || formData.groom_father || formData.groom_mother) && (
                    <div className="grid md:grid-cols-2 gap-6 border-t pt-6">
                      {(formData.bride_father || formData.bride_mother) && (
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-900 mb-2">Bride's Parents</h4>
                          {formData.bride_father && <p className="text-gray-700">{formData.bride_father}</p>}
                          {formData.bride_mother && <p className="text-gray-700">{formData.bride_mother}</p>}
                        </div>
                      )}
                      {(formData.groom_father || formData.groom_mother) && (
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-900 mb-2">Groom's Parents</h4>
                          {formData.groom_father && <p className="text-gray-700">{formData.groom_father}</p>}
                          {formData.groom_mother && <p className="text-gray-700">{formData.groom_mother}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* RSVP Section */}
                <div className="text-center mt-8 pt-6 border-t">
                  <Button disabled className="bg-blue-600 text-white px-8 py-3">
                    RSVP (Preview Mode)
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    This button will be functional on the public invitation page
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
