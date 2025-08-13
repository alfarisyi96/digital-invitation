import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Heart, Users, MessageCircle } from 'lucide-react'

interface RSVPFormProps {
  invitationId: string
  settings?: {
    maxGuestsPerResponse: number
    requireEmail: boolean
    requirePhone: boolean
    collectDietaryRestrictions: boolean
    collectSpecialRequests: boolean
    allowGuestMessage: boolean
    deadline?: string
  }
  onSubmit: (data: RSVPFormData) => Promise<void>
  className?: string
}

interface RSVPFormData {
  guestName: string
  guestEmail?: string
  guestPhone?: string
  attendanceStatus: 'attending' | 'not_attending' | 'maybe'
  numberOfGuests: number
  dietaryRestrictions?: string
  specialRequests?: string
  message?: string
}

export function RSVPForm({ 
  invitationId, 
  settings = {
    maxGuestsPerResponse: 4,
    requireEmail: false,
    requirePhone: false,
    collectDietaryRestrictions: true,
    collectSpecialRequests: true,
    allowGuestMessage: true
  },
  onSubmit, 
  className = '' 
}: RSVPFormProps) {
  const [formData, setFormData] = useState<RSVPFormData>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    attendanceStatus: 'attending',
    numberOfGuests: 1,
    dietaryRestrictions: '',
    specialRequests: '',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.guestName.trim()) {
      alert('Please enter your name')
      return
    }
    
    if (settings.requireEmail && !formData.guestEmail?.trim()) {
      alert('Email is required')
      return
    }
    
    if (settings.requirePhone && !formData.guestPhone?.trim()) {
      alert('Phone number is required')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
      setIsSubmitted(true)
      setSubmitMessage('Thank you for your RSVP! We look forward to celebrating with you.')
    } catch (error) {
      console.error('RSVP submission failed:', error)
      alert('Failed to submit RSVP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (field: keyof RSVPFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <div className={`text-center p-8 bg-green-50 rounded-lg ${className}`}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">RSVP Submitted!</h3>
        <p className="text-green-700">{submitMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Heart className="w-6 h-6 text-pink-600" />
        </div>
        <h3 className="text-2xl font-serif text-gray-800 mb-2">RSVP</h3>
        <p className="text-gray-600">Please let us know if you can join our celebration</p>
        {settings.deadline && (
          <p className="text-sm text-orange-600 mt-2">
            Please respond by {new Date(settings.deadline).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Guest Name */}
      <div>
        <Label htmlFor="guestName" className="text-sm font-medium text-gray-700">
          Full Name *
        </Label>
        <Input
          id="guestName"
          type="text"
          value={formData.guestName}
          onChange={(e) => updateFormData('guestName', e.target.value)}
          placeholder="Enter your full name"
          required
          className="mt-1"
        />
      </div>

      {/* Email */}
      {(settings.requireEmail || !settings.requireEmail) && (
        <div>
          <Label htmlFor="guestEmail" className="text-sm font-medium text-gray-700">
            Email {settings.requireEmail ? '*' : '(Optional)'}
          </Label>
          <Input
            id="guestEmail"
            type="email"
            value={formData.guestEmail}
            onChange={(e) => updateFormData('guestEmail', e.target.value)}
            placeholder="your.email@example.com"
            required={settings.requireEmail}
            className="mt-1"
          />
        </div>
      )}

      {/* Phone */}
      {(settings.requirePhone || !settings.requirePhone) && (
        <div>
          <Label htmlFor="guestPhone" className="text-sm font-medium text-gray-700">
            Phone {settings.requirePhone ? '*' : '(Optional)'}
          </Label>
          <Input
            id="guestPhone"
            type="tel"
            value={formData.guestPhone}
            onChange={(e) => updateFormData('guestPhone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            required={settings.requirePhone}
            className="mt-1"
          />
        </div>
      )}

      {/* Attendance Status */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Will you be attending? *
        </Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="attending"
              name="attendance"
              value="attending"
              checked={formData.attendanceStatus === 'attending'}
              onChange={(e) => updateFormData('attendanceStatus', e.target.value as 'attending')}
              className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <Label htmlFor="attending" className="text-green-700 font-medium cursor-pointer">
              ✓ Yes, I'll be there!
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="not_attending"
              name="attendance"
              value="not_attending"
              checked={formData.attendanceStatus === 'not_attending'}
              onChange={(e) => updateFormData('attendanceStatus', e.target.value as 'not_attending')}
              className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
            />
            <Label htmlFor="not_attending" className="text-red-600 font-medium cursor-pointer">
              ✗ Sorry, can't make it
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="maybe"
              name="attendance"
              value="maybe"
              checked={formData.attendanceStatus === 'maybe'}
              onChange={(e) => updateFormData('attendanceStatus', e.target.value as 'maybe')}
              className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
            />
            <Label htmlFor="maybe" className="text-yellow-600 font-medium cursor-pointer">
              ? Not sure yet
            </Label>
          </div>
        </div>
      </div>

      {/* Number of Guests */}
      {formData.attendanceStatus === 'attending' && (
        <div>
          <Label htmlFor="numberOfGuests" className="text-sm font-medium text-gray-700">
            Number of Guests (Including yourself)
          </Label>
          <Select
            value={formData.numberOfGuests.toString()}
            onValueChange={(value) => updateFormData('numberOfGuests', parseInt(value))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: settings.maxGuestsPerResponse }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {i + 1} Guest{i > 0 ? 's' : ''}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Dietary Restrictions */}
      {settings.collectDietaryRestrictions && formData.attendanceStatus === 'attending' && (
        <div>
          <Label htmlFor="dietaryRestrictions" className="text-sm font-medium text-gray-700">
            Dietary Restrictions (Optional)
          </Label>
          <Textarea
            id="dietaryRestrictions"
            value={formData.dietaryRestrictions}
            onChange={(e) => updateFormData('dietaryRestrictions', e.target.value)}
            placeholder="Any allergies or dietary preferences we should know about?"
            className="mt-1"
            rows={2}
          />
        </div>
      )}

      {/* Special Requests */}
      {settings.collectSpecialRequests && formData.attendanceStatus === 'attending' && (
        <div>
          <Label htmlFor="specialRequests" className="text-sm font-medium text-gray-700">
            Special Requests (Optional)
          </Label>
          <Textarea
            id="specialRequests"
            value={formData.specialRequests}
            onChange={(e) => updateFormData('specialRequests', e.target.value)}
            placeholder="Any special accommodations needed?"
            className="mt-1"
            rows={2}
          />
        </div>
      )}

      {/* Message */}
      {settings.allowGuestMessage && (
        <div>
          <Label htmlFor="message" className="text-sm font-medium text-gray-700">
            Message for the Couple (Optional)
          </Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => updateFormData('message', e.target.value)}
            placeholder="Share your excitement, memories, or well wishes..."
            className="mt-1"
            rows={3}
          />
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg transition-colors"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Submitting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Submit RSVP
          </span>
        )}
      </Button>
    </form>
  )
}
