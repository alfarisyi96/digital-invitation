import React from 'react'
import { TemplateProps } from '../../types'
import { Section, EditableText, EditableImage, Ornament } from '../../components/shared'
import { ornaments } from './ornaments'

// Premium components for RSVP and Comments
function RSVPForm({ invitationId, isEditable }: { invitationId: string; isEditable?: boolean }) {
  if (isEditable) {
    return (
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
        <h3 className="font-serif text-xl text-gray-800 mb-4 text-center">RSVP Form Preview</h3>
        <p className="text-sm text-gray-600 text-center">
          This form will be interactive for guests on the live invitation
        </p>
      </div>
    )
  }
  
  // Real RSVP form for landing page
  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
      <h3 className="font-serif text-xl text-gray-800 mb-6 text-center">Please RSVP</h3>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Will you attend?</label>
          <select className="w-full p-2 border border-gray-300 rounded">
            <option>Joyfully accept</option>
            <option>Regretfully decline</option>
            <option>Maybe</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of guests</label>
          <input type="number" min="1" className="w-full p-2 border border-gray-300 rounded" />
        </div>
        <button type="submit" className="w-full bg-gold-600 text-white py-2 px-4 rounded hover:bg-gold-700">
          Submit RSVP
        </button>
      </form>
    </div>
  )
}

function CommentForm({ invitationId, isEditable }: { invitationId: string; isEditable?: boolean }) {
  if (isEditable) {
    return (
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
        <h3 className="font-serif text-xl text-gray-800 mb-4 text-center">Guest Comments Preview</h3>
        <p className="text-sm text-gray-600 text-center">
          Guests will be able to leave well wishes here
        </p>
      </div>
    )
  }
  
  // Real comment form for landing page
  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
      <h3 className="font-serif text-xl text-gray-800 mb-6 text-center">Leave a Message</h3>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
          <textarea rows={4} className="w-full p-2 border border-gray-300 rounded"></textarea>
        </div>
        <button type="submit" className="w-full bg-gold-600 text-white py-2 px-4 rounded hover:bg-gold-700">
          Send Wishes
        </button>
      </form>
    </div>
  )
}

export default function LuxuryPremiumTemplate({ invitation, isEditable = false }: TemplateProps) {
  const { 
    title,
    bride_full_name, 
    bride_nickname,
    groom_full_name, 
    groom_nickname,
    ceremony_date,
    ceremony_time,
    ceremony_venue,
    ceremony_address,
    reception_date,
    reception_time,
    reception_venue,
    reception_address,
    hero_image,
    bride_image,
    groom_image,
    gallery_photos = [],
    settings
  } = invitation

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="luxury-premium-template relative min-h-screen bg-gradient-to-b from-cream-100 to-gold-50">
      {/* Hero Section with Background Image */}
      <Section name="hero" className="relative h-screen flex items-center justify-center">
        <EditableImage 
          src={hero_image}
          alt="Wedding Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Gold frame overlay */}
        <Ornament type="border" src={ornaments.goldFrame} className="opacity-40" />
        
        <div className="relative z-20 text-center text-white px-4">
          <EditableText 
            value={title}
            tag="h1"
            className="font-serif text-4xl md:text-6xl mb-8 drop-shadow-lg"
          />
          
          <Ornament type="divider" src={ornaments.goldDivider} className="mb-8 opacity-80" />
          
          <div className="space-y-6">
            <EditableText 
              value={bride_full_name}
              tag="h2"
              className="font-serif text-2xl md:text-4xl drop-shadow-lg"
            />
            <div className="text-xl md:text-2xl font-light italic">
              &
            </div>
            <EditableText 
              value={groom_full_name}
              tag="h2"
              className="font-serif text-2xl md:text-4xl drop-shadow-lg"
            />
          </div>
          
          <div className="mt-8">
            <EditableText 
              value={formatDate(ceremony_date)}
              className="text-lg md:text-xl font-light tracking-wide drop-shadow-lg"
            />
          </div>
        </div>
      </Section>

      {/* Couple Photos Section */}
      <Section name="couple" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Ornament type="divider" src={ornaments.goldDivider} className="mb-12" />
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center">
              <EditableImage 
                src={bride_image}
                alt={bride_full_name}
                className="w-64 h-64 mx-auto rounded-full object-cover shadow-2xl border-4 border-gold-300"
              />
              <EditableText 
                value={bride_full_name}
                tag="h3"
                className="font-serif text-2xl text-gray-800 mt-6"
              />
            </div>
            
            <div className="text-center">
              <EditableImage 
                src={groom_image}
                alt={groom_full_name}
                className="w-64 h-64 mx-auto rounded-full object-cover shadow-2xl border-4 border-gold-300"
              />
              <EditableText 
                value={groom_full_name}
                tag="h3"
                className="font-serif text-2xl text-gray-800 mt-6"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Event Details */}
      <Section name="details" className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-4xl">
          <Ornament type="divider" src={ornaments.goldDivider} className="mb-12" />
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ceremony */}
            <div className="bg-white/80 p-8 rounded-lg shadow-lg">
              <h3 className="font-serif text-2xl text-gray-800 mb-6 text-center">Ceremony</h3>
              <div className="space-y-4 text-center text-gray-700">
                <EditableText 
                  value={formatDate(ceremony_date)}
                  className="text-lg font-medium"
                />
                <EditableText 
                  value={ceremony_time}
                  className="text-lg"
                />
                <div className="mt-6">
                  <EditableText 
                    value={ceremony_venue}
                    className="text-lg font-medium"
                  />
                  <EditableText 
                    value={ceremony_address}
                    tag="p"
                    className="text-base text-gray-600 mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Reception */}
            {reception_date && (
              <div className="bg-white/80 p-8 rounded-lg shadow-lg">
                <h3 className="font-serif text-2xl text-gray-800 mb-6 text-center">Reception</h3>
                <div className="space-y-4 text-center text-gray-700">
                  <EditableText 
                    value={formatDate(reception_date)}
                    className="text-lg font-medium"
                  />
                  <EditableText 
                    value={reception_time || ''}
                    className="text-lg"
                  />
                  <div className="mt-6">
                    <EditableText 
                      value={reception_venue || ''}
                      className="text-lg font-medium"
                    />
                    <EditableText 
                      value={reception_address || ''}
                      tag="p"
                      className="text-base text-gray-600 mt-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Gallery Section */}
      {settings.gallery_enabled && gallery_photos.length > 0 && (
        <Section name="gallery" className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <Ornament type="divider" src={ornaments.goldDivider} className="mb-12" />
            <h3 className="font-serif text-3xl text-gray-800 text-center mb-12">Our Gallery</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery_photos.map((photo, index) => (
                <EditableImage 
                  key={index}
                  src={photo}
                  alt={`Gallery photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                />
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* RSVP & Comments Section */}
      <Section name="interactive" className="py-16 px-4 bg-gradient-to-r from-gold-100 to-cream-100">
        <div className="container mx-auto max-w-4xl">
          <Ornament type="divider" src={ornaments.goldDivider} className="mb-12" />
          
          <div className="grid md:grid-cols-2 gap-8">
            {settings.rsvp_enabled && (
              <RSVPForm invitationId={invitation.id} isEditable={isEditable} />
            )}
            
            {settings.comments_enabled && (
              <CommentForm invitationId={invitation.id} isEditable={isEditable} />
            )}
          </div>
        </div>
      </Section>

      {/* Footer */}
      <Section name="footer" className="py-12 text-center bg-gray-900 text-white">
        <Ornament type="divider" src={ornaments.goldDivider} className="mb-6 opacity-60" />
        <p className="font-serif text-lg italic">
          Thank you for being part of our special day
        </p>
        <div className="mt-4 font-serif text-sm tracking-widest">
          {bride_nickname} & {groom_nickname}
        </div>
      </Section>
    </div>
  )
}
