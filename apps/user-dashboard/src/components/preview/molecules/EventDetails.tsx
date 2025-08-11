import React from 'react'

interface EventDetailsProps {
  eventDate?: string
  ceremonyTime?: string
  receptionTime?: string
  venueName?: string
  location?: string
}

export function EventDetails({ 
  eventDate, 
  ceremonyTime, 
  receptionTime, 
  venueName, 
  location 
}: EventDetailsProps) {
  return (
    <div className="space-y-6">
      {eventDate && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Date</h3>
          <p className="text-gray-700">
            {new Date(eventDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {ceremonyTime && (
            <p className="text-gray-600 mt-1">Ceremony: {ceremonyTime}</p>
          )}
          {receptionTime && (
            <p className="text-gray-600">Reception: {receptionTime}</p>
          )}
        </div>
      )}

      {(venueName || location) && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Venue</h3>
          {venueName && (
            <p className="text-gray-700 font-medium break-words hyphens-auto">{venueName}</p>
          )}
          {location && (
            <p className="text-gray-600 break-words hyphens-auto">{location}</p>
          )}
        </div>
      )}
    </div>
  )
}
