import React from 'react'
import { TemplateProps } from '../../types'
import { Section, EditableText, Ornament, RSVPSection, CommentsSection } from '../../components/shared'
import { ornaments } from './ornaments'

export default function ElegantBasicTemplate({ invitation, isEditable = false }: TemplateProps) {
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
    reception_address
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
    <div 
      className="elegant-basic-template relative min-h-screen bg-white text-gray-900"
      style={{ backgroundImage: `url(${ornaments.backgroundPattern})` }}
    >
      {/* Border frame */}
      <Ornament type="border" src={ornaments.borderFrame} className="opacity-20" />
      
      {/* Decorative corners */}
      <Ornament type="corner" position="top-left" src={ornaments.decorativeCorners} />
      <Ornament type="corner" position="top-right" src={ornaments.decorativeCorners} />
      <Ornament type="corner" position="bottom-left" src={ornaments.decorativeCorners} />
      <Ornament type="corner" position="bottom-right" src={ornaments.decorativeCorners} />

      <div className="relative z-10 container mx-auto px-8 py-20 max-w-3xl">
        {/* Header */}
        <Section name="hero" className="text-center mb-20">
          <div className="border-2 border-gray-300 p-8 md:p-12">
            <EditableText 
              value={title}
              tag="h1"
              className="font-serif text-2xl md:text-4xl text-gray-900 mb-6 tracking-wide uppercase"
            />
            
            <Ornament type="divider" src={ornaments.dividerFloral} className="mb-8" />
            
            <div className="space-y-6">
              <EditableText 
                value={bride_full_name}
                tag="h2"
                className="font-serif text-xl md:text-2xl text-gray-800 tracking-wider"
              />
              <div className="text-lg md:text-xl font-light text-gray-600 italic">
                and
              </div>
              <EditableText 
                value={groom_full_name}
                tag="h2"
                className="font-serif text-xl md:text-2xl text-gray-800 tracking-wider"
              />
            </div>
            
            <Ornament type="divider" src={ornaments.dividerFloral} className="mt-8" />
          </div>
        </Section>

        {/* Event Details */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Ceremony */}
          <Section name="ceremony" className="text-center">
            <div className="border border-gray-200 p-6">
              <h3 className="font-serif text-lg md:text-xl text-gray-900 mb-4 tracking-wide uppercase">
                Ceremony
              </h3>
              
              <div className="space-y-3 text-gray-700">
                <EditableText 
                  value={formatDate(ceremony_date)}
                  className="text-base font-medium"
                />
                <EditableText 
                  value={ceremony_time}
                  className="text-base"
                />
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <EditableText 
                    value={ceremony_venue}
                    className="text-base font-medium"
                  />
                  <EditableText 
                    value={ceremony_address}
                    tag="p"
                    className="text-sm text-gray-600 mt-1"
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Reception */}
          {reception_date && (
            <Section name="reception" className="text-center">
              <div className="border border-gray-200 p-6">
                <h3 className="font-serif text-lg md:text-xl text-gray-900 mb-4 tracking-wide uppercase">
                  Reception
                </h3>
                
                <div className="space-y-3 text-gray-700">
                  <EditableText 
                    value={formatDate(reception_date)}
                    className="text-base font-medium"
                  />
                  <EditableText 
                    value={reception_time || ''}
                    className="text-base"
                  />
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <EditableText 
                      value={reception_venue || ''}
                      className="text-base font-medium"
                    />
                    <EditableText 
                      value={reception_address || ''}
                      tag="p"
                      className="text-sm text-gray-600 mt-1"
                    />
                  </div>
                </div>
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        <Section name="closing" className="text-center mt-16">
          <Ornament type="divider" src={ornaments.dividerFloral} className="mb-6" />
          <p className="font-serif text-base md:text-lg text-gray-700 italic tracking-wide">
            Together with our families, we invite you to celebrate our union
          </p>
          <div className="mt-4 font-serif text-sm text-gray-600 tracking-widest uppercase">
            {bride_nickname} & {groom_nickname}
          </div>
        </Section>

        {/* RSVP Section */}
        {!isEditable && (
          <Section name="rsvp" className="mt-16">
            <Ornament type="divider" src={ornaments.dividerFloral} className="mb-8" />
            <RSVPSection invitationId={invitation.id} />
          </Section>
        )}

        {/* Comments Section */}
        {!isEditable && (
          <Section name="comments" className="mt-16">
            <Ornament type="divider" src={ornaments.dividerFloral} className="mb-8" />
            <CommentsSection invitationId={invitation.id} />
          </Section>
        )}
      </div>
    </div>
  )
}
