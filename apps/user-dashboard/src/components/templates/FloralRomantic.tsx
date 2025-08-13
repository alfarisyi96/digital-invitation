import React from 'react';
import { EditableText } from '../create/atoms/EditableText';
import { EditableImage } from '../create/atoms/EditableImage';
import { RSVPForm } from '../create/molecules/RSVPForm';
import { CommentsForm } from '../create/molecules/CommentsForm';

interface FloralRomanticProps {
  formData: any;
  customText: Record<string, string>;
  fonts: Record<string, string>;
  colors: Record<string, string>;
  invitationId?: string; // Add for RSVP and Comments
  showInteractiveFeatures?: boolean; // Toggle for preview vs public view
}

export const FloralRomantic: React.FC<FloralRomanticProps> = ({
  formData,
  customText,
  fonts,
  colors,
  invitationId,
  showInteractiveFeatures = false
}) => {
  
  // RSVP and Comments handlers
  const handleRSVPSubmit = async (data: any) => {
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, invitationId })
    })
    
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error)
    }
  }

  const handleCommentSubmit = async (data: any) => {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, invitationId })
    })
    
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error)
    }
  }

  const loadComments = async () => {
    const response = await fetch(`/api/comments?invitationId=${invitationId}`)
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result.data.comments
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Floral Header */}
        <div className="relative bg-gradient-to-r from-pink-300 to-rose-300 p-12 text-center">
          <div className="absolute inset-0 opacity-20">
            <div className="text-6xl text-rose-600">🌸</div>
            <div className="absolute top-4 right-4 text-4xl text-pink-600">🌺</div>
            <div className="absolute bottom-4 left-4 text-4xl text-rose-500">🌼</div>
          </div>
          
          <div className="relative z-10 text-white">
            <div className="text-lg mb-4 opacity-90">
              <EditableText
                textKey="floral-subtitle"
                defaultValue={customText.subtitle || "Join us in celebration"}
                className="block"
              />
            </div>
            <h1 className="text-4xl mb-6 font-serif">
              <EditableText
                textKey="floral-title"
                defaultValue={customText.title || "Wedding Invitation"}
                className="block"
                tag="h1"
              />
            </h1>
          </div>
        </div>

        {/* Couple Names */}
        <div className="p-12 text-center">
          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="text-center">
              <h2 className="text-3xl font-script text-rose-700 mb-2">
                <EditableText
                  textKey="floral-bride-name"
                  defaultValue={customText.brideName || formData?.brideName || "Sarah"}
                  className="block"
                  tag="h2"
                />
              </h2>
            </div>
            
            <div className="text-4xl text-rose-400">💕</div>
            
            <div className="text-center">
              <h2 className="text-3xl font-script text-rose-700 mb-2">
                <EditableText
                  textKey="floral-groom-name"
                  defaultValue={customText.groomName || formData?.groomName || "David"}
                  className="block"
                  tag="h2"
                />
              </h2>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-rose-50 p-8 rounded-xl mb-8">
            <div className="text-center">
              <h3 className="text-xl font-serif text-rose-800 mb-4">Our Wedding Day</h3>
              <div className="text-rose-700 space-y-2">
                <p className="text-lg">
                  <EditableText
                    textKey="floral-event-date"
                    defaultValue={customText.eventDate || formData?.eventDate || "Saturday, June 15, 2024"}
                    className="block"
                  />
                </p>
                <p>
                  <EditableText
                    textKey="floral-event-time"
                    defaultValue={customText.eventTime || formData?.eventTime || "4:00 PM"}
                    className="block"
                  />
                </p>
                <p className="font-medium">
                  <EditableText
                    textKey="floral-venue"
                    defaultValue={customText.venue || formData?.venue || "Garden Rose Chapel"}
                    className="block"
                  />
                </p>
                <p className="text-sm">
                  <EditableText
                    textKey="floral-address"
                    defaultValue={customText.location || formData?.location || "123 Blossom Avenue, Flower City"}
                    className="block"
                  />
                </p>
              </div>
            </div>
          </div>

          {/* RSVP */}
          <div className="text-center">
            <p className="text-rose-600 mb-4">
              <EditableText
                textKey="floral-rsvp"
                defaultValue="Please join us as we celebrate our love story"
                className="block"
              />
            </p>
            <div className="text-sm text-rose-500">
              <EditableText
                textKey="floral-contact"
                defaultValue="RSVP: sarah.david@wedding.com"
                className="block"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-pink-200 to-rose-200 p-6 text-center">
          <div className="text-2xl mb-2">🌹</div>
          <p className="text-rose-700 italic">
            <EditableText
              textKey="floral-closing"
              defaultValue="With love and gratitude"
              className="block"
            />
          </p>
        </div>
        
        {/* RSVP Section - Premium Feature */}
        {showInteractiveFeatures && invitationId && (
          <div className="p-12 bg-pink-50">
            <RSVPForm
              invitationId={invitationId}
              onSubmit={handleRSVPSubmit}
              className="bg-white p-8 rounded-2xl shadow-sm border border-pink-200"
            />
          </div>
        )}

        {/* Comments/Guest Book Section - Premium Feature */}
        {showInteractiveFeatures && invitationId && (
          <div className="p-12">
            <CommentsForm
              invitationId={invitationId}
              onSubmit={handleCommentSubmit}
              onLoadComments={loadComments}
              className="bg-pink-50 p-8 rounded-2xl border border-pink-200"
            />
          </div>
        )}
      </div>
    </div>
  );
};
