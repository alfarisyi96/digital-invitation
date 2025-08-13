'use client'

import { useState } from 'react'

interface RSVPFormProps {
  invitationId: string
  onSubmit: (data: any) => Promise<void>
  className?: string
}

export function RSVPForm({ invitationId, onSubmit, className = '' }: RSVPFormProps) {
  const [formData, setFormData] = useState({
    guest_name: '',
    email: '',
    attending: '',
    guests_count: 1,
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !formData.guest_name || !formData.attending) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        ...formData,
        invitation_id: invitationId,
        guests_count: Number(formData.guests_count)
      })
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting RSVP:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-green-600 text-2xl mb-4">✓</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">RSVP Submitted!</h3>
        <p className="text-gray-600">
          Thank you for your response. We look forward to celebrating with you!
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">RSVP</h3>
      <p className="text-gray-600 text-center mb-8">
        Please confirm your attendance by filling out the form below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="guest_name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="guest_name"
            required
            value={formData.guest_name}
            onChange={(e) => setFormData(prev => ({ ...prev, guest_name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Will you be attending? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="attending"
                value="yes"
                checked={formData.attending === 'yes'}
                onChange={(e) => setFormData(prev => ({ ...prev, attending: e.target.value }))}
                className="mr-2"
              />
              <span>Yes, I will attend</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="attending"
                value="no"
                checked={formData.attending === 'no'}
                onChange={(e) => setFormData(prev => ({ ...prev, attending: e.target.value }))}
                className="mr-2"
              />
              <span>No, I cannot attend</span>
            </label>
          </div>
        </div>

        {formData.attending === 'yes' && (
          <div>
            <label htmlFor="guests_count" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests
            </label>
            <select
              id="guests_count"
              value={formData.guests_count}
              onChange={(e) => setFormData(prev => ({ ...prev, guests_count: Number(e.target.value) }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            id="message"
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Share your wishes or any special requests..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.guest_name || !formData.attending}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
        </button>
      </form>
    </div>
  )
}
