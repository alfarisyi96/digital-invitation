import { useState, useEffect, useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { debounce } from 'lodash'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from './FormField'
import { Calendar, Clock, MapPin, Plus, Trash2 } from 'lucide-react'
import { FormEventDetails, InvitationType } from '@/services/supabaseService'

interface EventDetailsFormProps {
  form: UseFormReturn<any>
  category?: InvitationType | null
  onLocationSelect?: (address: string, mapsUrl: string) => void
}

export function EventDetailsForm({ form, category, onLocationSelect }: EventDetailsFormProps) {
  // Get default events based on category
  const getDefaultEvents = (category: InvitationType | null | undefined): FormEventDetails[] => {
    switch (category) {
      case 'wedding':
        return [
          {
            name: 'Akad Nikah',
            date: '',
            time: '',
            venue_name: '',
            venue_address: '',
            venue_maps_url: '',
            dress_code: '',
            notes: ''
          },
          {
            name: 'Reception',
            date: '',
            time: '',
            venue_name: '',
            venue_address: '',
            venue_maps_url: '',
            dress_code: '',
            notes: ''
          }
        ]
      case 'birthday':
        return [
          {
            name: 'Birthday Party',
            date: '',
            time: '',
            venue_name: '',
            venue_address: '',
            venue_maps_url: '',
            dress_code: '',
            notes: ''
          }
        ]
      case 'graduation':
        return [
          {
            name: 'Graduation Ceremony',
            date: '',
            time: '',
            venue_name: '',
            venue_address: '',
            venue_maps_url: '',
            dress_code: '',
            notes: ''
          }
        ]
      default:
        return [
          {
            name: 'Main Event',
            date: '',
            time: '',
            venue_name: '',
            venue_address: '',
            venue_maps_url: '',
            dress_code: '',
            notes: ''
          }
        ]
    }
  }

  const [events, setEvents] = useState<FormEventDetails[]>(getDefaultEvents(category))

  // Category-specific event suggestions
  const getEventSuggestions = (category: InvitationType | null | undefined) => {
    switch (category) {
      case 'wedding':
        return ['Akad Nikah', 'Reception', 'Engagement', 'Bridal Shower', 'Bachelor Party', 'Rehearsal Dinner']
      case 'birthday':
        return ['Birthday Party', 'Surprise Party', 'Dinner', 'Celebration', 'Gathering']
      case 'graduation':
        return ['Graduation Ceremony', 'Graduation Party', 'Celebration Dinner', 'Open House']
      case 'anniversary':
        return ['Anniversary Dinner', 'Anniversary Party', 'Celebration', 'Renewal of Vows']
      case 'baby_shower':
        return ['Baby Shower', 'Gender Reveal', 'Baby Welcome Party', 'Blessing Ceremony']
      case 'business':
        return ['Business Event', 'Conference', 'Meeting', 'Seminar', 'Workshop', 'Networking Event']
      case 'party':
        return ['Party', 'Celebration', 'Social Gathering', 'Fun Event', 'Get Together']
      default:
        return ['Main Event', 'Ceremony', 'Reception', 'Party', 'Celebration', 'Gathering']
    }
  }

  const eventNameSuggestions = getEventSuggestions(category)

  const addEvent = () => {
    setEvents([...events, {
      name: '',
      date: '',
      time: '',
      venue_name: '',
      venue_address: '',
      venue_maps_url: '',
      dress_code: '',
      notes: ''
    }])
  }

  const removeEvent = (index: number) => {
    if (events.length > 1) {
      const updatedEvents = events.filter((_, i) => i !== index)
      setEvents(updatedEvents)
      form.setValue('events', updatedEvents)
    }
  }

  const updateEvent = (index: number, field: keyof FormEventDetails, value: string) => {
    const updatedEvents = [...events]
    updatedEvents[index] = { ...updatedEvents[index], [field]: value }
    setEvents(updatedEvents)
    
    // Update form with events data
    form.setValue('events', updatedEvents)
  }

  // Debounced auto-fill detection
  const debouncedUpdateEvents = useCallback(
    debounce((formData: any) => {
      if (formData.events && Array.isArray(formData.events) && formData.events.length > 0) {
        console.log('EventDetailsForm: Auto-fill detected (debounced), updating events:', formData.events)
        setEvents(formData.events)
      }
    }, 300),
    []
  )

  // Sync with form data when auto-fill is triggered
  useEffect(() => {
    const subscription = form.watch(() => {
      const formData = form.getValues()
      debouncedUpdateEvents(formData)
    })
    return () => subscription.unsubscribe()
  }, [form, debouncedUpdateEvents])

  // Additional effect to sync with form values (especially for edit mode)
  useEffect(() => {
    const formEvents = form.getValues('events')
    if (formEvents && Array.isArray(formEvents) && formEvents.length > 0) {
      console.log('EventDetailsForm: Direct form values sync, updating events:', formEvents)
      setEvents(formEvents)
    }
  }, [form.formState.defaultValues]) // Trigger when form default values change (including reset)

  const handleLocationSearch = (index: number, address: string) => {
    // Simulate Google Maps integration
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`
    updateEvent(index, 'venue_maps_url', mapsUrl)
    
    if (onLocationSelect) {
      onLocationSelect(address, mapsUrl)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-500" />
          Event Details
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEvent}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Event
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg relative">
            {events.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEvent(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            
            {/* Event Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Name *
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={event.name}
                  onChange={(e) => updateEvent(index, 'name', e.target.value)}
                  placeholder="e.g., Akad Nikah, Reception"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">Suggestions:</span>
                  {eventNameSuggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateEvent(index, 'name', suggestion)}
                      className="text-xs h-6 px-2"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) => updateEvent(index, 'date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Time *
                </label>
                <input
                  type="time"
                  value={event.time}
                  onChange={(e) => updateEvent(index, 'time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                value={event.venue_name}
                onChange={(e) => updateEvent(index, 'venue_name', e.target.value)}
                placeholder="e.g., Grand Ballroom Hotel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Venue Address
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={event.venue_address}
                  onChange={(e) => updateEvent(index, 'venue_address', e.target.value)}
                  placeholder="e.g., 123 Main Street, City, State"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleLocationSearch(index, event.venue_address)}
                  disabled={!event.venue_address}
                  className="flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Map
                </Button>
              </div>
              {event.venue_maps_url && (
                <p className="text-xs text-green-600 mt-1">
                  Maps link generated: {event.venue_maps_url}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Maps Link (Optional)
              </label>
              <input
                type="url"
                value={event.venue_maps_url || ''}
                onChange={(e) => updateEvent(index, 'venue_maps_url', e.target.value)}
                placeholder="e.g., https://maps.google.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can paste a Google Maps link here or use the "Map" button above to generate one
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dress Code (Optional)
                </label>
                <input
                  type="text"
                  value={event.dress_code}
                  onChange={(e) => updateEvent(index, 'dress_code', e.target.value)}
                  placeholder="e.g., Formal, Casual, Traditional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <Textarea
                value={event.notes}
                onChange={(e) => updateEvent(index, 'notes', e.target.value)}
                placeholder="Any special instructions or additional information..."
                rows={3}
                className="w-full"
              />
            </div>
          </div>
        ))}

        <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Pro Tips:</p>
          <ul className="space-y-1 text-xs">
            <li>• Use the Map button to generate Google Maps links for easy navigation</li>
            <li>• Add multiple events if you have separate ceremony and reception</li>
            <li>• Include dress code to help guests prepare appropriately</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
