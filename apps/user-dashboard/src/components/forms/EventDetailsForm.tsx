import React, { useState } from 'react'
import { Calendar, Clock, MapPin, Plus, Trash2, ExternalLink } from 'lucide-react'
import type { EventDetails } from '@/services/supabaseService'

interface EventDetailsFormProps {
  events: EventDetails[]
  onChange: (events: EventDetails[]) => void
}

export function EventDetailsForm({ events, onChange }: EventDetailsFormProps) {
  const [expandedEvent, setExpandedEvent] = useState<number | null>(0)

  const addEvent = () => {
    const newEvent: EventDetails = {
      type: 'custom',
      title: '',
      date: '',
      time: '',
      location: '',
      address: '',
      google_maps_url: '',
      google_maps_embed: ''
    }
    onChange([...events, newEvent])
    setExpandedEvent(events.length) // Expand the new event
  }

  const updateEvent = (index: number, field: keyof EventDetails, value: string) => {
    const updated = events.map((event, i) => 
      i === index ? { ...event, [field]: value } : event
    )
    onChange(updated)
  }

  const removeEvent = (index: number) => {
    if (events.length <= 1) return // Keep at least one event
    const updated = events.filter((_, i) => i !== index)
    onChange(updated)
    if (expandedEvent === index) {
      setExpandedEvent(0)
    }
  }

  const handleGoogleMapsInput = (index: number, url: string) => {
    updateEvent(index, 'google_maps_url', url)
    
    // Extract embed URL if it's a regular Google Maps link
    if (url.includes('maps.google.com') || url.includes('goo.gl/maps')) {
      try {
        // Convert share link to embed URL
        let embedUrl = url
        if (url.includes('/maps/place/') || url.includes('/maps/dir/')) {
          // Extract coordinates or place info for embed
          const embedBase = 'https://www.google.com/maps/embed/v1/place'
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          if (apiKey) {
            // This would need proper parsing based on the URL format
            embedUrl = `${embedBase}?key=${apiKey}&q=${encodeURIComponent(events[index].location)}`
          }
        }
        updateEvent(index, 'google_maps_embed', embedUrl)
      } catch (error) {
        console.error('Error processing Google Maps URL:', error)
      }
    }
  }

  const eventTypeOptions = [
    { value: 'akad', label: 'Akad Nikah', icon: '💒' },
    { value: 'resepsi', label: 'Resepsi', icon: '🎉' },
    { value: 'main', label: 'Main Event', icon: '🎯' },
    { value: 'custom', label: 'Custom Event', icon: '📅' }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
        <button
          type="button"
          onClick={addEvent}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Event
        </button>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div 
            key={index} 
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Event Header */}
            <div 
              className="px-4 py-3 bg-gray-50 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedEvent(expandedEvent === index ? null : index)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">
                  {eventTypeOptions.find(opt => opt.value === event.type)?.icon || '📅'}
                </span>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {event.title || `Event ${index + 1}`}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {event.date && event.time ? `${event.date} at ${event.time}` : 'No date set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {events.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeEvent(index)
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <span className="text-gray-400">
                  {expandedEvent === index ? '−' : '+'}
                </span>
              </div>
            </div>

            {/* Event Details (Expandable) */}
            {expandedEvent === index && (
              <div className="px-4 py-4 space-y-4">
                {/* Event Type and Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      value={event.type}
                      onChange={(e) => updateEvent(index, 'type', e.target.value as EventDetails['type'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {eventTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Akad Nikah"
                      value={event.title}
                      onChange={(e) => updateEvent(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={event.date}
                      onChange={(e) => updateEvent(index, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Time
                    </label>
                    <input
                      type="time"
                      value={event.time}
                      onChange={(e) => updateEvent(index, 'time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Location Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Masjid Al-Ikhlas"
                    value={event.location}
                    onChange={(e) => updateEvent(index, 'location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <textarea
                    placeholder="e.g., Jl. Sudirman No. 123, Jakarta Pusat"
                    value={event.address}
                    onChange={(e) => updateEvent(index, 'address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Google Maps */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Maps Link
                    <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                  </label>
                  <div className="flex">
                    <input
                      type="url"
                      placeholder="https://maps.google.com/..."
                      value={event.google_maps_url}
                      onChange={(e) => handleGoogleMapsInput(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {event.google_maps_url && (
                      <a
                        href={event.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Share a Google Maps link to help guests find the location
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Calendar className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No events added yet</p>
          <button
            type="button"
            onClick={addEvent}
            className="mt-2 text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Add your first event
          </button>
        </div>
      )}
    </div>
  )
}
