import React from 'react'
import { RSVPForm } from './forms/RSVPForm'
import { CommentsForm } from './forms/CommentsForm'

interface PublicTemplateRendererProps {
  templateName: string
  formData: any
  invitationId: string
  onRSVPSubmit: (data: any) => Promise<void>
  onCommentSubmit: (data: any) => Promise<void>
  onLoadComments: () => Promise<any[]>
}

export default function PublicTemplateRenderer({
  templateName,
  formData,
  invitationId,
  onRSVPSubmit,
  onCommentSubmit,
  onLoadComments
}: PublicTemplateRendererProps) {
  
  // Get custom data or defaults
  const getCustomValue = (key: string, defaultValue: string) => {
    return formData?.[key] || defaultValue
  }

  // Common template structure for all templates
  const renderCommonTemplate = (themeClasses: string, accentColor: string) => (
    <div className={`min-h-screen ${themeClasses}`}>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-6">
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Hero Image */}
          {formData?.hero_image && (
            <div className="mb-16">
              <img 
                src={formData.hero_image} 
                alt="Wedding"
                className="w-full max-w-2xl h-96 mx-auto rounded-2xl object-cover shadow-2xl"
              />
            </div>
          )}

          {/* Names */}
          <div className="space-y-8">
            <p className="text-lg text-gray-600 tracking-wider uppercase">
              {getCustomValue('pre_title', "You're Invited to the Wedding of")}
            </p>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-light text-gray-800">
                {getCustomValue('bride_name', 'Bride')}
              </h1>
              <div className={`text-4xl ${accentColor}`}>&</div>
              <h1 className="text-5xl md:text-7xl font-light text-gray-800">
                {getCustomValue('groom_name', 'Groom')}
              </h1>
            </div>
          </div>

          {/* Date & Venue */}
          <div className="mt-16 space-y-6">
            <div className="inline-block px-8 py-4 bg-gray-50 rounded-full">
              <p className="text-xl text-gray-700">
                {getCustomValue('wedding_date', 'Wedding Date')}
              </p>
            </div>
            
            <p className="text-lg text-gray-600">
              {getCustomValue('venue_name', 'Venue Name')}
            </p>
            <p className="text-gray-500">
              {getCustomValue('venue_address', 'Venue Address')}
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      {formData?.love_story && (
        <div className="py-20 px-6 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-light text-gray-800 mb-8">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {formData.love_story}
            </p>
          </div>
        </div>
      )}

      {/* RSVP Section */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <RSVPForm
            invitationId={invitationId}
            onSubmit={onRSVPSubmit}
            className="bg-white p-8 rounded-2xl shadow-sm"
          />
        </div>
      </div>

      {/* Comments Section */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <CommentsForm
            invitationId={invitationId}
            onSubmit={onCommentSubmit}
            onLoadComments={onLoadComments}
            className="bg-white p-8 rounded-2xl shadow-sm"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-xl font-light text-gray-600 mb-6">
            {getCustomValue('closing', 'Thank you for being part of our special day')}
          </p>
          <div className="w-16 h-px bg-gray-300 mx-auto mb-6"></div>
          <p className="text-gray-500 italic">
            {getCustomValue('signature', 'With love and gratitude')}
          </p>
        </div>
      </div>
    </div>
  )

  // Render different templates with their specific styling
  switch (templateName) {
    case 'ModernMinimalist':
      return renderCommonTemplate('bg-white', 'text-gray-400')
      
    case 'FloralRomantic':
      return renderCommonTemplate('bg-gradient-to-br from-pink-50 to-rose-100', 'text-pink-400')
      
    case 'SundaTraditional':
      return renderCommonTemplate('bg-gradient-to-br from-amber-50 to-orange-100', 'text-amber-600')
      
    case 'RusticCharm':
      return renderCommonTemplate('bg-gradient-to-br from-green-50 to-emerald-100', 'text-green-600')
      
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Template Not Found</h1>
            <p className="text-gray-600">The invitation template "{templateName}" could not be loaded.</p>
          </div>
        </div>
      )
  }
}
