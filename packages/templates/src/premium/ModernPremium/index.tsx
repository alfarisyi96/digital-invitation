import React from 'react'
import { TemplateProps } from '../../types'
import { Section, EditableText, EditableImage, Ornament } from '../../components/shared'
import { ornaments } from './ornaments'

export default function ModernPremiumTemplate({ invitation, isEditable = false }: TemplateProps) {
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
    <div className="modern-premium-template relative min-h-screen bg-gray-50">
      {/* Hero Section */}
      <Section name="hero" className="relative min-h-screen flex items-center">
        <EditableImage 
          src={hero_image}
          alt="Wedding Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
        
        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl text-white">
            <EditableText 
              value={title}
              tag="h1"
              className="font-light text-5xl md:text-7xl mb-6 leading-tight"
            />
            
            <div className="space-y-4 mb-8">
              <EditableText 
                value={bride_full_name}
                tag="h2"
                className="font-light text-3xl md:text-4xl"
              />
              <div className="w-16 h-0.5 bg-white my-4"></div>
              <EditableText 
                value={groom_full_name}
                tag="h2"
                className="font-light text-3xl md:text-4xl"
              />
            </div>
            
            <EditableText 
              value={formatDate(ceremony_date)}
              className="text-xl font-light tracking-wide"
            />
          </div>
        </div>
      </Section>

      {/* Couple Section */}
      <Section name="couple" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              <div className="text-center">
                <EditableImage 
                  src={bride_image}
                  alt={bride_full_name}
                  className="w-48 h-48 mx-auto rounded-full object-cover shadow-xl"
                />
                <EditableText 
                  value={bride_full_name}
                  tag="h3"
                  className="text-2xl font-light text-gray-800 mt-6"
                />
              </div>
              
              <div className="text-center">
                <EditableImage 
                  src={groom_image}
                  alt={groom_full_name}
                  className="w-48 h-48 mx-auto rounded-full object-cover shadow-xl"
                />
                <EditableText 
                  value={groom_full_name}
                  tag="h3"
                  className="text-2xl font-light text-gray-800 mt-6"
                />
              </div>
            </div>
            
            <div className="space-y-8">
              <h3 className="text-4xl font-light text-gray-800">Our Story</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                We are excited to celebrate our love with our family and friends. 
                Join us for a day filled with joy, laughter, and unforgettable memories.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Event Details */}
      <Section name="details" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <h3 className="text-4xl font-light text-gray-800 text-center mb-16">Event Details</h3>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Ceremony */}
            <div className="bg-white p-8 shadow-lg">
              <h4 className="text-2xl font-light text-gray-800 mb-6">Ceremony</h4>
              <div className="space-y-4 text-gray-600">
                <div className="flex justify-between">
                  <span>Date</span>
                  <EditableText 
                    value={formatDate(ceremony_date)}
                    className="font-medium"
                  />
                </div>
                <div className="flex justify-between">
                  <span>Time</span>
                  <EditableText 
                    value={ceremony_time}
                    className="font-medium"
                  />
                </div>
                <div className="pt-4 border-t">
                  <EditableText 
                    value={ceremony_venue}
                    className="font-medium text-lg"
                  />
                  <EditableText 
                    value={ceremony_address}
                    tag="p"
                    className="text-sm mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Reception */}
            {reception_date && (
              <div className="bg-white p-8 shadow-lg">
                <h4 className="text-2xl font-light text-gray-800 mb-6">Reception</h4>
                <div className="space-y-4 text-gray-600">
                  <div className="flex justify-between">
                    <span>Date</span>
                    <EditableText 
                      value={formatDate(reception_date)}
                      className="font-medium"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Time</span>
                    <EditableText 
                      value={reception_time || ''}
                      className="font-medium"
                    />
                  </div>
                  <div className="pt-4 border-t">
                    <EditableText 
                      value={reception_venue || ''}
                      className="font-medium text-lg"
                    />
                    <EditableText 
                      value={reception_address || ''}
                      tag="p"
                      className="text-sm mt-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Gallery */}
      {settings.gallery_enabled && gallery_photos.length > 0 && (
        <Section name="gallery" className="py-20 bg-white">
          <div className="container mx-auto px-6 max-w-7xl">
            <h3 className="text-4xl font-light text-gray-800 text-center mb-16">Gallery</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gallery_photos.map((photo, index) => (
                <EditableImage 
                  key={index}
                  src={photo}
                  alt={`Gallery photo ${index + 1}`}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                />
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* RSVP & Comments */}
      <Section name="interactive" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h3 className="text-4xl font-light text-center mb-16">Join Us</h3>
          
          <div className="grid md:grid-cols-2 gap-12">
            {settings.rsvp_enabled && (
              <div className="bg-white/10 p-8 backdrop-blur-sm">
                <h4 className="text-2xl font-light mb-6">RSVP</h4>
                {isEditable ? (
                  <p className="text-gray-300">RSVP form will appear here for guests</p>
                ) : (
                  <form className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="w-full p-3 bg-white/20 border border-white/30 rounded text-white placeholder-gray-300"
                    />
                    <select className="w-full p-3 bg-white/20 border border-white/30 rounded text-white">
                      <option>Will you attend?</option>
                      <option>Yes, I'll be there</option>
                      <option>Sorry, can't make it</option>
                    </select>
                    <button className="w-full bg-white text-gray-900 py-3 rounded font-medium hover:bg-gray-100 transition-colors">
                      Send RSVP
                    </button>
                  </form>
                )}
              </div>
            )}
            
            {settings.comments_enabled && (
              <div className="bg-white/10 p-8 backdrop-blur-sm">
                <h4 className="text-2xl font-light mb-6">Leave a Message</h4>
                {isEditable ? (
                  <p className="text-gray-300">Guest message form will appear here</p>
                ) : (
                  <form className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="w-full p-3 bg-white/20 border border-white/30 rounded text-white placeholder-gray-300"
                    />
                    <textarea 
                      rows={4}
                      placeholder="Your message for the couple"
                      className="w-full p-3 bg-white/20 border border-white/30 rounded text-white placeholder-gray-300"
                    ></textarea>
                    <button className="w-full bg-white text-gray-900 py-3 rounded font-medium hover:bg-gray-100 transition-colors">
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Footer */}
      <Section name="footer" className="py-12 bg-black text-white text-center">
        <p className="text-lg font-light">
          Looking forward to celebrating with you
        </p>
        <div className="mt-4 text-sm tracking-wider opacity-70">
          {bride_nickname} & {groom_nickname}
        </div>
      </Section>
    </div>
  )
}
