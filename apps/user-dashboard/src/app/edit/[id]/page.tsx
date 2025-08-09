'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseService, type Invitation } from '@/services/supabaseService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/Header'
import { ArrowLeft, Save, Eye } from 'lucide-react'

export default function EditInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const invitationId = params.id as string
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    if (invitationId) {
      loadInvitation()
    }
  }, [invitationId])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      // We need to create a method to get invitation by ID
      const invitations = await supabaseService.getUserInvitations()
      const found = invitations.find(inv => inv.id === invitationId)
      
      if (found) {
        setInvitation(found)
        setTitle(found.title)
        setDescription(found.description || '')
        setEventDate(found.event_date ? found.event_date.split('T')[0] : '')
        setLocation(found.location || '')
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

  const handleSave = async () => {
    if (!invitation) return

    setSaving(true)
    try {
      const updates = {
        title,
        description,
        event_date: eventDate ? new Date(eventDate).toISOString() : null,
        location,
      }

      const updated = await supabaseService.updateInvitation(invitation.id, updates)
      if (updated) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error saving invitation:', error)
      setError('Failed to save invitation')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    if (invitation) {
      // Use the private preview route for both draft and published invitations
      window.open(`/preview/${invitation.public_slug || invitation.id}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error || 'Invitation not found'}</p>
            <Button onClick={() => router.push('/dashboard')}>
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
      <Header />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Invitation</h1>
              <p className="text-gray-600">Make changes to your invitation</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              {invitation.is_published ? 'Preview' : 'Preview Draft'}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Invitation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invitation Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter invitation title"
                    //required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter invitation description"
                  />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event location"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invitation.status === 'published' && invitation.is_published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {invitation.status === 'published' && invitation.is_published 
                        ? 'Published' 
                        : invitation.status
                      }
                    </span>
                  </div>
                  
                  {invitation.public_slug && (
                    <div className="text-sm">
                      <span className="text-gray-600">Public URL:</span>
                      <p className="text-blue-600 break-all">
                        /invite/{invitation.public_slug}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Unique Visitors:</span>
                    <span className="font-medium">{invitation.unique_visitors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Views:</span>
                    <span className="font-medium">{invitation.views_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">RSVPs:</span>
                    <span className="font-medium">{invitation.rsvp_count}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
