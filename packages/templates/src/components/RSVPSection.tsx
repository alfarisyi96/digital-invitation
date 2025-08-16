'use client'

import React, { useState, useEffect } from 'react'

export interface RSVPSettings {
  is_enabled: boolean
  deadline?: string
  max_guests_per_response: number
  confirmation_message: string
}

export interface RSVPFormData {
  guest_name: string
  attendance_status: 'attending' | 'not_attending' | 'maybe'
  number_of_guests: number
}

interface RSVPSectionProps {
  invitationId: string
  className?: string
}

export function RSVPSection({ invitationId, className = '' }: RSVPSectionProps) {
  const [settings, setSettings] = useState<RSVPSettings | null>(null)
  const [formData, setFormData] = useState<RSVPFormData>({
    guest_name: '',
    attendance_status: 'attending',
    number_of_guests: 1
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Load RSVP settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(`/api/rsvp?invitation_id=${invitationId}`)
        if (response.ok) {
          const data = await response.json()
          setSettings(data.settings)
        }
      } catch (error) {
        console.error('Failed to load RSVP settings:', error)
      }
    }

    loadSettings()
  }, [invitationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!settings?.is_enabled) return

    // Check deadline
    if (settings.deadline && new Date() > new Date(settings.deadline)) {
      setSubmitMessage('The RSVP deadline has passed.')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitation_id: invitationId,
          ...formData
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        setSubmitMessage(result.message || settings.confirmation_message)
        // Reset form
        setFormData({
          guest_name: '',
          attendance_status: 'attending',
          number_of_guests: 1
        })
      } else {
        setSubmitMessage(result.error || 'Failed to submit RSVP')
        setSubmitSuccess(false)
      }
    } catch (error) {
      setSubmitMessage('Failed to submit RSVP. Please try again.')
      setSubmitSuccess(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof RSVPFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Don't render if RSVP is not enabled or settings not loaded
  if (!settings || !settings.is_enabled) {
    return null
  }

  // Show deadline message if passed
  if (settings.deadline && new Date() > new Date(settings.deadline)) {
    return (
      <div className={`rsvp-section ${className}`}>
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">RSVP</h3>
          <p className="text-gray-600">The RSVP deadline has passed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rsvp-section ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">RSVP</h3>
        
        {settings.deadline && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Please respond by {new Date(settings.deadline).toLocaleDateString()}
            </p>
          </div>
        )}

        {submitMessage && (
          <div className={`mb-4 p-3 rounded-lg ${submitSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {submitMessage}
          </div>
        )}

        {!submitSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Guest Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
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

            {/* Attendance Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Will you be attending? *
              </label>
              <div className="space-y-2">
                {(['attending', 'not_attending', 'maybe'] as const).map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="radio"
                      name="attendance_status"
                      value={status}
                      checked={formData.attendance_status === status}
                      onChange={(e) => handleInputChange('attendance_status', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-gray-700">
                      {status === 'attending' && 'Yes, I will attend'}
                      {status === 'not_attending' && 'No, I cannot attend'}
                      {status === 'maybe' && 'Maybe'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Number of Guests */}
            {formData.attendance_status === 'attending' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of guests (including yourself) *
                </label>
                <select
                  value={formData.number_of_guests}
                  onChange={(e) => handleInputChange('number_of_guests', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: settings.max_guests_per_response }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
