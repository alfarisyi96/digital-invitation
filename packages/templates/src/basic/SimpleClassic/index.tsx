import React from 'react'
import { TemplateProps } from '../../types'
import { Section, EditableText, Ornament, RSVPSection, CommentsSection } from '../../components/shared'
import { ornaments } from './ornaments'

export default function SimpleClassicTemplate({ invitation, isEditable = false }: TemplateProps) {
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
      className="simple-classic-template relative min-h-screen bg-cream-50 text-gray-800"
      style={{ backgroundImage: `url(${ornaments.background})` }}
    >
      {/* Corner ornaments */}
      <Ornament type="corner" position="top-left" src={ornaments.cornerFlowers} />
      <Ornament type="corner" position="top-right" src={ornaments.cornerFlowers} />
      <Ornament type="corner" position="bottom-left" src={ornaments.cornerFlowers} />
      <Ornament type="corner" position="bottom-right" src={ornaments.cornerFlowers} />

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-2xl">
        {/* Main Title */}
        <Section name="hero" className="text-center mb-16">
          <EditableText 
            value={title}
            tag="h1"
            className="font-serif text-3xl md:text-5xl text-gray-800 mb-8 leading-tight"
          />
          
          <Ornament type="divider" src={ornaments.divider} className="mb-8" />
          
          <div className="space-y-4">
            <EditableText 
              value={bride_full_name}
              tag="h2"
              className="font-serif text-2xl md:text-3xl text-gray-700"
            />
            <div className="text-xl md:text-2xl font-light text-gray-600">
              &
            </div>
            <EditableText 
              value={groom_full_name}
              tag="h2"
              className="font-serif text-2xl md:text-3xl text-gray-700"
            />
          </div>
        </Section>

        <Ornament type="divider" src={ornaments.divider} />

        {/* Ceremony Details */}
        <Section name="ceremony" className="text-center mb-12">
          <h3 className="font-serif text-xl md:text-2xl text-gray-800 mb-6">Ceremony</h3>
          
          <div className="space-y-4 text-gray-700">
            <div>
              <EditableText 
                value={formatDate(ceremony_date)}
                className="text-lg font-medium"
              />
            </div>
            <div>
              <EditableText 
                value={ceremony_time}
                className="text-lg"
              />
            </div>
            <div className="mt-6">
              <EditableText 
                value={ceremony_venue}
                className="text-lg font-medium"
              />
              <br />
              <EditableText 
                value={ceremony_address}
                className="text-base text-gray-600"
              />
            </div>
          </div>
        </Section>

        {reception_date && (
          <>
            <Ornament type="divider" src={ornaments.divider} />
            
            {/* Reception Details */}
            <Section name="reception" className="text-center mb-12">
              <h3 className="font-serif text-xl md:text-2xl text-gray-800 mb-6">Reception</h3>
              
              <div className="space-y-4 text-gray-700">
                <div>
                  <EditableText 
                    value={formatDate(reception_date)}
                    className="text-lg font-medium"
                  />
                </div>
                <div>
                  <EditableText 
                    value={reception_time || ''}
                    className="text-lg"
                  />
                </div>
                <div className="mt-6">
                  <EditableText 
                    value={reception_venue || ''}
                    className="text-lg font-medium"
                  />
                  <br />
                  <EditableText 
                    value={reception_address || ''}
                    className="text-base text-gray-600"
                  />
                </div>
              </div>
            </Section>
          </>
        )}

        <Ornament type="divider" src={ornaments.divider} />

        {/* Closing Message */}
        <Section name="closing" className="text-center mb-12">
          <p className="font-serif text-lg md:text-xl text-gray-700 italic">
            We look forward to celebrating with you
          </p>
          <div className="mt-6 text-base text-gray-600">
            {bride_nickname} & {groom_nickname}
          </div>
        </Section>

        {/* RSVP Section */}
        {!isEditable && (
          <>
            <Ornament type="divider" src={ornaments.divider} />
            <Section name="rsvp" className="mb-12">
              <RSVPSection invitationId={invitation.id} />
            </Section>
          </>
        )}

        {/* Comments Section */}
        {!isEditable && (
          <>
            <Ornament type="divider" src={ornaments.divider} />
            <Section name="comments" className="mb-12">
              <CommentsSection invitationId={invitation.id} />
            </Section>
          </>
        )}
      </div>
    </div>
  )
}
