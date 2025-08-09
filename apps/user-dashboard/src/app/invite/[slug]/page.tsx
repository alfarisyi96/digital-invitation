'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabaseService, type Invitation } from '@/services/supabaseService'
import { Calendar, MapPin, Users, Share2 } from 'lucide-react'

export default function PublicInvitationPage() {
  const params = useParams()
  const slug = params.slug as string
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      loadInvitation()
      trackVisitor()
    }
  }, [slug])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.getInvitationBySlug(slug)
      if (data) {
        setInvitation(data)
      } else {
        setError('Invitation not found or not published')
      }
    } catch (err) {
      setError('Failed to load invitation')
      console.error('Error loading invitation:', err)
    } finally {
      setLoading(false)
    }
  }

  const trackVisitor = async () => {
    // Generate or get visitor ID from localStorage
    let visitorId = localStorage.getItem('visitor_id')
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('visitor_id', visitorId)
    }

    try {
      await supabaseService.incrementInvitationVisitor(slug, visitorId)
    } catch (error) {
      console.error('Error tracking visitor:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: invitation?.title,
          text: invitation?.description || 'You\'re invited!',
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invitation Not Found</h1>
          <p className="text-gray-600">{error || 'This invitation may have been removed or is no longer available.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Invitation</h1>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Invitation Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-4">{invitation.title}</h1>
            {invitation.description && (
              <p className="text-xl opacity-90">{invitation.description}</p>
            )}
          </div>

          {/* Invitation Details */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Event Details */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Event Details</h2>
                
                {invitation.event_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Date & Time</p>
                      <p className="text-gray-600">
                        {new Date(invitation.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-gray-600">
                        {new Date(invitation.event_date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {invitation.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Location</p>
                      <p className="text-gray-600">{invitation.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">RSVP</p>
                    <p className="text-gray-600">
                      {invitation.rsvp_count} confirmed • {invitation.views_count || 0} views
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Data / Additional Info */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                
                {invitation.custom_data && Object.keys(invitation.custom_data).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {Object.entries(invitation.custom_data).map(([key, value]) => (
                      <div key={key} className="mb-2">
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, ' ')}: 
                        </span>
                        <span className="ml-2 text-gray-600">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RSVP Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Will you be attending?</h3>
                <div className="flex gap-4 justify-center">
                  <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors">
                    Yes, I'll be there!
                  </button>
                  <button className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                    Can't make it
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Please let us know by responding above
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
