import React from 'react'
import { EditableText } from '@/components/create/atoms/EditableText'
import { EditableImage } from '@/components/create/atoms/EditableImage'
import { EditableGallery } from '@/components/create/atoms/EditableGallery'
import { RSVPForm } from '@/components/create/molecules/RSVPForm'
import { CommentsForm } from '@/components/create/molecules/CommentsForm'
import { WeddingFormData } from '@/services/supabaseService'

interface ModernMinimalistProps {
  formData: WeddingFormData
  customization?: any
  images?: {
    hero_image?: string
    bride_image?: string
    groom_image?: string
    gallery_photos?: string[]
  }
  invitationId?: string // Add for RSVP and Comments
  showInteractiveFeatures?: boolean // Toggle for preview vs public view
}

/**
 * Modern Minimalist Wedding Template
 * 
 * Features:
 * - Clean, minimal design
 * - Lots of white space
 * - Modern typography
 * - Subtle colors and gradients
 */
export function ModernMinimalist({ formData, customization, images, invitationId, showInteractiveFeatures = false }: ModernMinimalistProps) {
  
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
    <div className="modern-template bg-white min-h-screen">
      {/* Hero Section - Clean and Minimal */}
      <div className="relative min-h-screen flex items-center justify-center px-6">
        {/* Background Pattern - Subtle */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-[var(--primary-color)]"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-[var(--accent-color)]"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Hero Image - Large and Central */}
          <div className="mb-16">
            <EditableImage
              imageKey="hero"
              src={images?.hero_image}
              className="w-full max-w-2xl h-96 mx-auto rounded-2xl object-cover shadow-2xl"
              placeholder="Upload Hero Image"
            />
          </div>

          {/* Couple Names - Prominent Typography */}
          <div className="space-y-8">
            <EditableText
              textKey="pre_title"
              defaultValue="You're Invited to the Wedding of"
              className="text-lg text-gray-600 tracking-wider uppercase"
              style={{ fontFamily: 'var(--body-font)' }}
              tag="p"
            />
            
            <div className="space-y-4">
              <EditableText
                textKey="bride_name_hero"
                defaultValue={formData.bride_full_name || 'Bride'}
                className="text-5xl md:text-7xl font-light text-[var(--primary-color)]"
                style={{ fontFamily: 'var(--heading-font)' }}
                tag="h1"
              />
              
              <div className="flex items-center justify-center space-x-8">
                <div className="w-16 h-px bg-[var(--accent-color)]"></div>
                <span className="text-2xl text-[var(--accent-color)] font-light">&</span>
                <div className="w-16 h-px bg-[var(--accent-color)]"></div>
              </div>
              
              <EditableText
                textKey="groom_name_hero"
                defaultValue={formData.groom_full_name || 'Groom'}
                className="text-5xl md:text-7xl font-light text-[var(--primary-color)]"
                style={{ fontFamily: 'var(--heading-font)' }}
                tag="h1"
              />
            </div>

            {/* Date - Clean Typography */}
            {formData.events && formData.events.length > 0 && (
              <div className="mt-12">
                <EditableText
                  textKey="main_event_date"
                  defaultValue={formData.events[0]?.date || 'Wedding Date'}
                  className="text-xl text-gray-700 tracking-wide"
                  style={{ fontFamily: 'var(--body-font)' }}
                  tag="p"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About Section - Couple Photos and Story */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <EditableText
              textKey="about_title"
              defaultValue="Our Story"
              className="text-3xl font-light text-[var(--primary-color)] mb-4"
              style={{ fontFamily: 'var(--heading-font)' }}
              tag="h2"
            />
            <div className="w-24 h-px bg-[var(--accent-color)] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Bride */}
            <div className="text-center">
              <EditableImage
                imageKey="bride"
                src={images?.bride_image}
                className="w-48 h-48 rounded-full mx-auto mb-8 object-cover shadow-xl"
                placeholder="Bride Photo"
              />
              <EditableText
                textKey="bride_name_about"
                defaultValue={formData.bride_full_name || 'Bride Name'}
                className="text-2xl font-light text-[var(--primary-color)] mb-2"
                style={{ fontFamily: 'var(--heading-font)' }}
                tag="h3"
              />
              <EditableText
                textKey="bride_description"
                defaultValue="Daughter of loving parents who taught her the values of kindness and compassion."
                className="text-gray-600 leading-relaxed max-w-sm mx-auto"
                style={{ fontFamily: 'var(--body-font)' }}
                tag="p"
              />
            </div>

            {/* Groom */}
            <div className="text-center">
              <EditableImage
                imageKey="groom"
                src={images?.groom_image}
                className="w-48 h-48 rounded-full mx-auto mb-8 object-cover shadow-xl"
                placeholder="Groom Photo"
              />
              <EditableText
                textKey="groom_name_about"
                defaultValue={formData.groom_full_name || 'Groom Name'}
                className="text-2xl font-light text-[var(--primary-color)] mb-2"
                style={{ fontFamily: 'var(--heading-font)' }}
                tag="h3"
              />
              <EditableText
                textKey="groom_description"
                defaultValue="Son of wonderful parents who instilled in him the importance of love and commitment."
                className="text-gray-600 leading-relaxed max-w-sm mx-auto"
                style={{ fontFamily: 'var(--body-font)' }}
                tag="p"
              />
            </div>
          </div>

          {/* Love Story */}
          <div className="mt-20 text-center max-w-3xl mx-auto">
            <EditableText
              textKey="love_story_title"
              defaultValue="How We Met"
              className="text-2xl font-light text-[var(--primary-color)] mb-6"
              style={{ fontFamily: 'var(--heading-font)' }}
              tag="h3"
            />
            <EditableText
              textKey="love_story"
              defaultValue="Two hearts, one journey. Our story began with a chance meeting and blossomed into a love that will last a lifetime. We're excited to start this new chapter together, surrounded by the people we love most."
              className="text-gray-700 leading-relaxed text-lg"
              style={{ fontFamily: 'var(--body-font)' }}
              tag="p"
            />
          </div>
        </div>
      </div>

      {/* Event Details - Clean Cards */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <EditableText
              textKey="events_title"
              defaultValue="Wedding Events"
              className="text-3xl font-light text-[var(--primary-color)] mb-4"
              style={{ fontFamily: 'var(--heading-font)' }}
              tag="h2"
            />
            <div className="w-24 h-px bg-[var(--accent-color)] mx-auto"></div>
          </div>

          {formData.events && formData.events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {formData.events.map((event, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <EditableText
                    textKey={`event_${index}_title_modern`}
                    defaultValue={event.name || `Event ${index + 1}`}
                    className="text-xl font-light text-[var(--primary-color)] mb-6 text-center"
                    style={{ fontFamily: 'var(--heading-font)' }}
                    tag="h3"
                  />
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-1 h-8 bg-[var(--accent-color)]"></div>
                      <div>
                        <EditableText
                          textKey={`event_${index}_date_modern`}
                          defaultValue={event.date || 'Date'}
                          className="font-medium text-gray-800"
                          style={{ fontFamily: 'var(--body-font)' }}
                          tag="p"
                        />
                        <EditableText
                          textKey={`event_${index}_time_modern`}
                          defaultValue={event.time || 'Time'}
                          className="text-gray-600"
                          style={{ fontFamily: 'var(--body-font)' }}
                          tag="p"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-1 h-8 bg-[var(--accent-color)]"></div>
                      <div>
                        <EditableText
                          textKey={`event_${index}_venue_modern`}
                          defaultValue={event.venue_name || 'Venue Name'}
                          className="font-medium text-gray-800"
                          style={{ fontFamily: 'var(--body-font)' }}
                          tag="p"
                        />
                        <EditableText
                          textKey={`event_${index}_address_modern`}
                          defaultValue={event.venue_address || 'Address'}
                          className="text-gray-600 text-sm"
                          style={{ fontFamily: 'var(--body-font)' }}
                          tag="p"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-lg text-center">
              <p className="text-gray-500">Event details will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Gift Section - Minimal Design */}
      {formData.gift_accounts && formData.gift_accounts.length > 0 && (
        <div className="py-20 px-6 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <EditableText
                textKey="gift_title_modern"
                defaultValue="Wedding Gift"
                className="text-3xl font-light text-[var(--primary-color)] mb-4"
                style={{ fontFamily: 'var(--heading-font)' }}
                tag="h2"
              />
              <EditableText
                textKey="gift_subtitle_modern"
                defaultValue="Your presence is the greatest gift, but if you wish to honor us with a gift, you may do so through:"
                className="text-gray-600 leading-relaxed"
                style={{ fontFamily: 'var(--body-font)' }}
                tag="p"
              />
            </div>
            
            <div className="space-y-6">
              {formData.gift_accounts.map((account, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="text-center space-y-3">
                    <EditableText
                      textKey={`gift_${index}_bank_modern`}
                      defaultValue={account.bank_name || 'Bank/E-Wallet Name'}
                      className="text-lg font-medium text-[var(--primary-color)]"
                      style={{ fontFamily: 'var(--heading-font)' }}
                      tag="p"
                    />
                    <EditableText
                      textKey={`gift_${index}_number_modern`}
                      defaultValue={account.account_number || 'Account Number'}
                      className="text-xl font-mono text-gray-800 tracking-wider"
                      tag="p"
                    />
                    <EditableText
                      textKey={`gift_${index}_name_modern`}
                      defaultValue={account.account_name || 'Account Holder'}
                      className="text-gray-600"
                      style={{ fontFamily: 'var(--body-font)' }}
                      tag="p"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Section */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <EditableText
              textKey="gallery_title"
              defaultValue="Our Memories"
              className="text-4xl font-light text-[var(--primary-color)] mb-4"
              style={{ fontFamily: 'var(--heading-font)' }}
              tag="h2"
            />
            <EditableText
              textKey="gallery_subtitle"
              defaultValue="Moments that made us who we are"
              className="text-gray-600 text-lg"
              style={{ fontFamily: 'var(--body-font)' }}
              tag="p"
            />
          </div>
          <EditableGallery
            maxImages={6}
            className="grid grid-cols-2 md:grid-cols-3 gap-6"
            placeholder="Add Gallery Images"
            images={images?.gallery_photos}
          />
        </div>
      </div>

      {/* RSVP Section - Premium Feature */}
      {showInteractiveFeatures && invitationId && (
        <div className="py-20 px-6 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <RSVPForm
              invitationId={invitationId}
              onSubmit={handleRSVPSubmit}
              className="bg-white p-8 rounded-2xl shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Comments/Guest Book Section - Premium Feature */}
      {showInteractiveFeatures && invitationId && (
        <div className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <CommentsForm
              invitationId={invitationId}
              onSubmit={handleCommentSubmit}
              onLoadComments={loadComments}
              className="bg-white p-8 rounded-2xl shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Footer - Simple and Clean */}
      <div className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <EditableText
            textKey="closing_modern"
            defaultValue="Thank you for being part of our special day"
            className="text-xl font-light text-[var(--primary-color)] mb-6"
            style={{ fontFamily: 'var(--heading-font)' }}
            tag="p"
          />
          
          <div className="w-16 h-px bg-[var(--accent-color)] mx-auto mb-6"></div>
          
          <EditableText
            textKey="signature_modern"
            defaultValue="With love and gratitude"
            className="text-gray-600 italic"
            style={{ fontFamily: 'var(--body-font)' }}
            tag="p"
          />
        </div>
      </div>
    </div>
  )
}
