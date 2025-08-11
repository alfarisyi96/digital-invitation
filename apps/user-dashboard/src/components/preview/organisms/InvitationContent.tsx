import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type Invitation } from '@/services/supabaseService'
import { InvitationHeader } from '../molecules/InvitationHeader'
import { CoupleNames } from '../molecules/CoupleNames'
import { EventDetails } from '../molecules/EventDetails'

interface InvitationContentProps {
  invitation: Invitation
  formData: any
}

export function InvitationContent({ invitation, formData }: InvitationContentProps) {
  return (
    <Card className="overflow-hidden">
      <InvitationHeader invitation={invitation} />
      
      <CardContent className="p-8">
        {/* Wedding Details */}
        {formData.bride_full_name && formData.groom_full_name && (
          <CoupleNames 
            brideName={formData.bride_full_name}
            groomName={formData.groom_full_name}
          />
        )}

        {/* Event Details */}
        <EventDetails
          eventDate={invitation.event_date || undefined}
          ceremonyTime={formData.ceremony_time}
          receptionTime={formData.reception_time}
          venueName={formData.venue_name}
          location={invitation.location || undefined}
        />

        {formData.invitation_message && (
          <div className="text-center bg-gray-50 p-6 rounded-lg mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Message</h3>
            <p className="text-gray-700 italic break-words hyphens-auto">{formData.invitation_message}</p>
          </div>
        )}

        {/* Parents Information */}
        {(formData.bride_father || formData.bride_mother || formData.groom_father || formData.groom_mother) && (
          <div className="grid md:grid-cols-2 gap-6 border-t pt-6 mt-6">
            {(formData.bride_father || formData.bride_mother) && (
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Bride's Parents</h4>
                {formData.bride_father && <p className="text-gray-700 break-words">{formData.bride_father}</p>}
                {formData.bride_mother && <p className="text-gray-700 break-words">{formData.bride_mother}</p>}
              </div>
            )}
            {(formData.groom_father || formData.groom_mother) && (
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Groom's Parents</h4>
                {formData.groom_father && <p className="text-gray-700 break-words">{formData.groom_father}</p>}
                {formData.groom_mother && <p className="text-gray-700 break-words">{formData.groom_mother}</p>}
              </div>
            )}
          </div>
        )}

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
  )
}
