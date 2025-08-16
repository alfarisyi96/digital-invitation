'use client'

import React, { useState, useEffect } from 'react'
import { TurnstileWidget } from '../security/TurnstileWidget'

export interface RSVPSettings {
  is_enabled: boolean
  deadline?: string
  max_guests_per_response: number
  require_email: boolean
  require_phone: boolean
  collect_dietary_restrictions: boolean
  collect_special_requests: boolean
  allow_guest_message: boolean
  custom_questions: Array<{
    id: string
    question: string
    type: 'text' | 'textarea' | 'select' | 'checkbox'
    required: boolean
    options?: string[]
  }>
  confirmation_message: string
}

export interface RSVPFormData {
  guest_name: string
  guest_email?: string
  guest_phone?: string
  attendance_status: 'attending' | 'not_attending' | 'maybe'
  number_of_guests: number
  dietary_restrictions?: string
  special_requests?: string
  message?: string
  custom_answers?: Record<string, any>
}

interface RSVPFormProps {
  invitationId: string
  settings?: RSVPSettings
  eventDate?: string
  eventVenue?: string
  coupleName?: string
  onSubmit: (data: RSVPFormData) => Promise<void>
  className?: string
}

export function RSVPForm({ 
  invitationId, 
  settings, 
  eventDate, 
  eventVenue, 
  coupleName,
  onSubmit, 
  className = '' 
}: RSVPFormProps) {
  const [formData, setFormData] = useState<RSVPFormData>({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    attendance_status: 'attending',
    number_of_guests: 1,
    dietary_restrictions: '',
    special_requests: '',
    message: '',
    custom_answers: {}
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  // Default settings if none provided
  const defaultSettings: RSVPSettings = {
    is_enabled: true,
    max_guests_per_response: 4,
    require_email: false,
    require_phone: false,
    collect_dietary_restrictions: true,
    collect_special_requests: true,
    allow_guest_message: true,
    custom_questions: [],
    confirmation_message: 'Thank you for your RSVP!'
  }

  const activeSettings = settings || defaultSettings

  // Check if RSVP is enabled and not past deadline
  if (!activeSettings.is_enabled) {
    return null
  }

  if (activeSettings.deadline && new Date() > new Date(activeSettings.deadline)) {
    return (
      <div className={`${className} border-2 border-amber-200 bg-amber-50 rounded-lg p-6`}>
        <div className="text-center">
          <div className="text-2xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-amber-800 mb-2">RSVP Deadline Passed</h3>
          <p className="text-amber-700">
            We're sorry, but the RSVP deadline has passed. Please contact the couple directly if you need to make changes to your attendance.
          </p>
        </div>
      </div>
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.guest_name.trim()) {
      newErrors.guest_name = 'Name is required'
    }

    if (activeSettings.require_email && !formData.guest_email?.trim()) {
      newErrors.guest_email = 'Email is required'
    } else if (formData.guest_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guest_email)) {
      newErrors.guest_email = 'Please enter a valid email address'
    }

    if (activeSettings.require_phone && !formData.guest_phone?.trim()) {
      newErrors.guest_phone = 'Phone number is required'
    }

    if (formData.number_of_guests < 1 || formData.number_of_guests > activeSettings.max_guests_per_response) {
      newErrors.number_of_guests = `Number of guests must be between 1 and ${activeSettings.max_guests_per_response}`
    }

    // Validate custom questions
    activeSettings.custom_questions.forEach(question => {
      if (question.required && !formData.custom_answers?.[question.id]) {
        newErrors[`custom_${question.id}`] = `${question.question} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ ...formData, turnstile_token: captchaToken } as any)
      setIsSubmitted(true)
    } catch (error) {
      console.error('RSVP submission error:', error)
      setErrors({ submit: 'Failed to submit RSVP. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof RSVPFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCustomAnswerChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      custom_answers: {
        ...prev.custom_answers,
        [questionId]: value
      }
    }))
    // Clear error
    if (errors[`custom_${questionId}`]) {
      setErrors(prev => ({ ...prev, [`custom_${questionId}`]: '' }))
    }
  }

  if (isSubmitted) {
    return (
      <div className={`${className} border-2 border-green-200 bg-green-50 rounded-lg p-6`}>
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">RSVP Confirmed!</h3>
          <p className="text-green-700 mb-4">
            {activeSettings.confirmation_message}
          </p>
          <div className="space-y-2 text-sm text-green-600">
            <p><strong>Name:</strong> {formData.guest_name}</p>
            <p><strong>Response:</strong> {formData.attendance_status.replace('_', ' ').toUpperCase()}</p>
            {formData.attendance_status === 'attending' && (
              <p><strong>Number of Guests:</strong> {formData.number_of_guests}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} border border-gray-200 rounded-lg p-6 bg-white shadow-sm`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
          💌 RSVP
        </h3>
        <p className="text-gray-600">
          Please let {coupleName || 'us'} know if you'll be attending
          {eventDate && ` on ${new Date(eventDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`}
          {eventVenue && (
            <span className="block mt-1 text-sm">
              📍 {eventVenue}
            </span>
          )}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Guest Name */}
        <div className="space-y-2">
          <label htmlFor="guest_name" className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            id="guest_name"
            type="text"
            value={formData.guest_name}
            onChange={(e) => handleInputChange('guest_name', e.target.value)}
            placeholder="Enter your full name"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
              errors.guest_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.guest_name && <p className="text-sm text-red-500">{errors.guest_name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="guest_email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            📧 Email {activeSettings.require_email && '*'}
          </label>
          <input
            id="guest_email"
            type="email"
            value={formData.guest_email}
            onChange={(e) => handleInputChange('guest_email', e.target.value)}
            placeholder="Enter your email address"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
              errors.guest_email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.guest_email && <p className="text-sm text-red-500">{errors.guest_email}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label htmlFor="guest_phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            📱 Phone {activeSettings.require_phone && '*'}
          </label>
          <input
            id="guest_phone"
            type="tel"
            value={formData.guest_phone}
            onChange={(e) => handleInputChange('guest_phone', e.target.value)}
            placeholder="Enter your phone number"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
              errors.guest_phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.guest_phone && <p className="text-sm text-red-500">{errors.guest_phone}</p>}
        </div>

        {/* Attendance Status */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Will you be attending? *</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="attendance_status"
                value="attending"
                checked={formData.attendance_status === 'attending'}
                onChange={(e) => handleInputChange('attendance_status', e.target.value)}
                className="text-green-600"
              />
              <span className="text-green-700 font-medium">✓ Yes, I'll be there!</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="attendance_status"
                value="not_attending"
                checked={formData.attendance_status === 'not_attending'}
                onChange={(e) => handleInputChange('attendance_status', e.target.value)}
                className="text-red-600"
              />
              <span className="text-red-700 font-medium">✗ Sorry, I can't make it</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="attendance_status"
                value="maybe"
                checked={formData.attendance_status === 'maybe'}
                onChange={(e) => handleInputChange('attendance_status', e.target.value)}
                className="text-amber-600"
              />
              <span className="text-amber-700 font-medium">? Not sure yet</span>
            </label>
          </div>
        </div>

        {/* Number of Guests - only show if attending */}
        {formData.attendance_status === 'attending' && (
          <div className="space-y-2">
            <label htmlFor="number_of_guests" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              👥 Number of Guests (including yourself) *
            </label>
            <select
              id="number_of_guests"
              value={formData.number_of_guests}
              onChange={(e) => handleInputChange('number_of_guests', parseInt(e.target.value))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                errors.number_of_guests ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {Array.from({ length: activeSettings.max_guests_per_response }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
            {errors.number_of_guests && <p className="text-sm text-red-500">{errors.number_of_guests}</p>}
          </div>
        )}

        {/* Dietary Restrictions - only show if attending and enabled */}
        {formData.attendance_status === 'attending' && activeSettings.collect_dietary_restrictions && (
          <div className="space-y-2">
            <label htmlFor="dietary_restrictions" className="block text-sm font-medium text-gray-700">
              🥗 Dietary Restrictions or Allergies
            </label>
            <textarea
              id="dietary_restrictions"
              value={formData.dietary_restrictions}
              onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
              placeholder="Please let us know about any dietary restrictions or food allergies..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Special Requests - only show if attending and enabled */}
        {formData.attendance_status === 'attending' && activeSettings.collect_special_requests && (
          <div className="space-y-2">
            <label htmlFor="special_requests" className="block text-sm font-medium text-gray-700">
              ⭐ Special Requests
            </label>
            <textarea
              id="special_requests"
              value={formData.special_requests}
              onChange={(e) => handleInputChange('special_requests', e.target.value)}
              placeholder="Any special requests or accommodations needed..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Custom Questions */}
        {activeSettings.custom_questions.map(question => (
          <div key={question.id} className="space-y-2">
            <label htmlFor={`custom_${question.id}`} className="block text-sm font-medium text-gray-700">
              {question.question} {question.required && '*'}
            </label>
            
            {question.type === 'text' && (
              <input
                id={`custom_${question.id}`}
                type="text"
                value={formData.custom_answers?.[question.id] || ''}
                onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                  errors[`custom_${question.id}`] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
            
            {question.type === 'textarea' && (
              <textarea
                id={`custom_${question.id}`}
                value={formData.custom_answers?.[question.id] || ''}
                onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none ${
                  errors[`custom_${question.id}`] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
            
            {question.type === 'select' && question.options && (
              <select
                id={`custom_${question.id}`}
                value={formData.custom_answers?.[question.id] || ''}
                onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                  errors[`custom_${question.id}`] ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select an option</option>
                {question.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
            
            {question.type === 'checkbox' && (
              <div className="flex items-center space-x-2">
                <input
                  id={`custom_${question.id}`}
                  type="checkbox"
                  checked={formData.custom_answers?.[question.id] || false}
                  onChange={(e) => handleCustomAnswerChange(question.id, e.target.checked)}
                  className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor={`custom_${question.id}`} className="text-sm text-gray-700">
                  Yes
                </label>
              </div>
            )}
            
            {errors[`custom_${question.id}`] && (
              <p className="text-sm text-red-500">{errors[`custom_${question.id}`]}</p>
            )}
          </div>
        ))}

        {/* Message - show if enabled */}
        {activeSettings.allow_guest_message && (
          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              💝 Message for the Couple
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Share your excitement, memories, or well wishes..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Turnstile Captcha */}
        <div className="pt-2">
          <TurnstileWidget onToken={setCaptchaToken} />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
          </button>
          {errors.submit && <p className="text-sm text-red-500 mt-2 text-center">{errors.submit}</p>}
        </div>
      </form>
    </div>
  )
}
