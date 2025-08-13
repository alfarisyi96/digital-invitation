import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { EditableText } from '@/components/create/atoms/EditableText'
import { EditableImage } from '@/components/create/atoms/EditableImage'
import { Template, WeddingFormData } from '@/services/supabaseService'
import { loadTemplate } from '@/lib/templateConfig'
import { FileText } from 'lucide-react'

interface TemplatePreviewProps {
  template: Template
  formData: WeddingFormData
  category: string
}

/**
 * Template Preview Component
 * 
 * Features:
 * - Live preview with real-time style updates
 * - Dynamic template loading based on slug
 * - CSS variables for instant style changes
 * - Fallback to placeholder if template not found
 */
export function TemplatePreview({ template, formData, category }: TemplatePreviewProps) {
  const [TemplateComponent, setTemplateComponent] = useState<React.ComponentType<any> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get customization from localStorage directly
  const getCustomization = () => {
    try {
      const stored = localStorage.getItem('templateCustomization')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  const customization = getCustomization()

  // CSS variables for real-time style updates
  const styleVars = {
    '--primary-color': customization?.selectedColorCombination?.primary || template.color_combinations[0]?.primary || '#374151',
    '--secondary-color': customization?.selectedColorCombination?.secondary || template.color_combinations[0]?.secondary || '#F9FAFB',
    '--accent-color': customization?.selectedColorCombination?.accent || template.color_combinations[0]?.accent || '#3B82F6',
    '--heading-font': customization?.selectedFontOption?.heading || 'Playfair Display',
    '--body-font': customization?.selectedFontOption?.body || 'Lora',
  } as React.CSSProperties

  // Load template component dynamically
  useEffect(() => {
    const loadTemplateComponent = async () => {
      if (!template.slug) {
        setError('Template slug not found')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const Component = await loadTemplate(template.slug)
        setTemplateComponent(() => Component)
      } catch (err) {
        console.warn(`Template ${template.slug} not found, using fallback`, err)
        setError(`Template ${template.slug} not implemented yet`)
        setTemplateComponent(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplateComponent()
  }, [template.slug])

  if (category !== 'wedding') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-gray-600">Template preview for {category} coming soon</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-0">
        {/* Template Container with CSS Variables */}
        <div 
          className="template-preview"
          style={styleVars}
        >
          {isLoading ? (
            <div className="min-h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading template...</p>
              </div>
            </div>
          ) : error || !TemplateComponent ? (
            <PlaceholderTemplate 
              template={template}
              formData={formData}
              error={error}
            />
          ) : (
            <TemplateComponent 
              formData={formData}
              customization={customization}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Placeholder Template Component
 * Used as fallback when real template is not available
 */
function PlaceholderTemplate({ 
  template, 
  formData,
  error 
}: { 
  template: Template
  formData: WeddingFormData
  error?: string | null 
}) {
  return (
    <div className="placeholder-template min-h-[600px] bg-[var(--secondary-color)]">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center">
        <EditableImage
          imageKey="hero"
          className="absolute inset-0 w-full h-full object-cover"
          placeholder="Hero Image"
        />
        <div className="relative z-10 text-center text-white p-6">
          <EditableText
            textKey="wedding_title"
            defaultValue="The Wedding Of"
            className="text-lg opacity-90 mb-2"
            style={{ fontFamily: 'var(--body-font)' }}
            tag="p"
          />
          <EditableText
            textKey="couple_names"
            defaultValue={`${formData.bride_full_name || 'Bride'} & ${formData.groom_full_name || 'Groom'}`}
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--heading-font)' }}
            tag="h1"
          />
        </div>
      </div>

      {/* Notice */}
      <div className="p-8 bg-yellow-50 border-l-4 border-yellow-400">
        <div className="flex items-center">
          <FileText className="w-6 h-6 text-yellow-600 mr-3" />
          <div>
            <p className="text-yellow-800 font-medium">Template Preview</p>
            <p className="text-yellow-700 text-sm">
              {error || `Template "${template.name}" is being developed. Using placeholder preview.`}
            </p>
          </div>
        </div>
      </div>

      {/* Couple Section */}
      <div className="p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Bride */}
          <div className="text-center">
            <EditableImage
              imageKey="bride"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover bg-gray-100"
              placeholder="Bride Photo"
            />
            <EditableText
              textKey="bride_name"
              defaultValue={formData.bride_full_name || 'Bride Name'}
              className="text-xl text-[var(--primary-color)] mb-2"
              style={{ fontFamily: 'var(--heading-font)' }}
              tag="h3"
            />
            <EditableText
              textKey="bride_parents"
              defaultValue={`Daughter of ${formData.bride_father || 'Father'} & ${formData.bride_mother || 'Mother'}`}
              className="text-sm text-gray-600"
              style={{ fontFamily: 'var(--body-font)' }}
              tag="p"
            />
          </div>

          {/* Groom */}
          <div className="text-center">
            <EditableImage
              imageKey="groom"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover bg-gray-100"
              placeholder="Groom Photo"
            />
            <EditableText
              textKey="groom_name"
              defaultValue={formData.groom_full_name || 'Groom Name'}
              className="text-xl text-[var(--primary-color)] mb-2"
              style={{ fontFamily: 'var(--heading-font)' }}
              tag="h3"
            />
            <EditableText
              textKey="groom_parents"
              defaultValue={`Son of ${formData.groom_father || 'Father'} & ${formData.groom_mother || 'Mother'}`}
              className="text-sm text-gray-600"
              style={{ fontFamily: 'var(--body-font)' }}
              tag="p"
            />
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-8 bg-[var(--secondary-color)]">
        <div className="max-w-4xl mx-auto">
          <EditableText
            textKey="event_section_title"
            defaultValue="Event Details"
            className="text-2xl text-[var(--primary-color)] text-center mb-6"
            style={{ fontFamily: 'var(--heading-font)' }}
            tag="h2"
          />
          
          {formData.events && formData.events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.events.map((event, index) => (
                <div key={index} className="bg-white p-6 rounded-lg">
                  <EditableText
                    textKey={`event_${index}_title`}
                    defaultValue={event.name || `Event ${index + 1}`}
                    className="text-lg text-[var(--primary-color)] mb-2"
                    style={{ fontFamily: 'var(--heading-font)' }}
                    tag="h3"
                  />
                  <EditableText
                    textKey={`event_${index}_datetime`}
                    defaultValue={`${event.date} • ${event.time}`}
                    className="text-sm text-gray-600 mb-1"
                    style={{ fontFamily: 'var(--body-font)' }}
                    tag="p"
                  />
                  <EditableText
                    textKey={`event_${index}_venue`}
                    defaultValue={event.venue_name}
                    className="text-sm text-gray-600"
                    style={{ fontFamily: 'var(--body-font)' }}
                    tag="p"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg text-center">
              <p className="text-gray-500">Event details will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-8 bg-[var(--primary-color)] text-white text-center">
        <EditableText
          textKey="footer_message"
          defaultValue="We can't wait to celebrate with you!"
          className="text-lg"
          style={{ fontFamily: 'var(--body-font)' }}
          tag="p"
        />
      </div>
    </div>
  )
}

/**
 * Wedding Template Preview Component
 * Placeholder template with editable elements
 */
function WeddingTemplatePreview({ 
  template, 
  formData 
}: { 
  template: Template
  formData: WeddingFormData 
}) {
  return (
    <div className="wedding-template min-h-[600px] bg-[var(--secondary-color)]">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center">
        <EditableImage
          imageKey="hero"
          className="absolute inset-0 w-full h-full object-cover"
          placeholder="Hero Image"
        />
        <div className="relative z-10 text-center text-white p-6">
          <EditableText
            textKey="wedding_title"
            defaultValue="The Wedding Of"
            className="text-lg font-[var(--body-font)] opacity-90 mb-2"
            tag="p"
          />
          <EditableText
            textKey="couple_names"
            defaultValue={`${formData.bride_full_name || 'Bride'} & ${formData.groom_full_name || 'Groom'}`}
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--heading-font)' }}
            tag="h1"
          />
        </div>
      </div>

      {/* Couple Section */}
      <div className="p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Bride */}
          <div className="text-center">
            <EditableImage
              imageKey="bride"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover bg-gray-100"
              placeholder="Bride Photo"
            />
            <EditableText
              textKey="bride_name"
              defaultValue={formData.bride_full_name || 'Bride Name'}
              className="text-xl font-[var(--heading-font)] text-[var(--primary-color)] mb-2"
              tag="h3"
            />
            <EditableText
              textKey="bride_parents"
              defaultValue={`Daughter of ${formData.bride_father || 'Father'} & ${formData.bride_mother || 'Mother'}`}
              className="text-sm font-[var(--body-font)] text-gray-600"
              tag="p"
            />
          </div>

          {/* Groom */}
          <div className="text-center">
            <EditableImage
              imageKey="groom"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover bg-gray-100"
              placeholder="Groom Photo"
            />
            <EditableText
              textKey="groom_name"
              defaultValue={formData.groom_full_name || 'Groom Name'}
              className="text-xl font-[var(--heading-font)] text-[var(--primary-color)] mb-2"
              tag="h3"
            />
            <EditableText
              textKey="groom_parents"
              defaultValue={`Son of ${formData.groom_father || 'Father'} & ${formData.groom_mother || 'Mother'}`}
              className="text-sm font-[var(--body-font)] text-gray-600"
              tag="p"
            />
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-8 bg-[var(--secondary-color)]">
        <div className="max-w-4xl mx-auto">
          <EditableText
            textKey="event_section_title"
            defaultValue="Event Details"
            className="text-2xl font-[var(--heading-font)] text-[var(--primary-color)] text-center mb-6"
            tag="h2"
          />
          
          {formData.events && formData.events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.events.map((event, index) => (
                <div key={index} className="bg-white p-6 rounded-lg">
                  <EditableText
                    textKey={`event_${index}_title`}
                    defaultValue={event.name || `Event ${index + 1}`}
                    className="text-lg font-[var(--heading-font)] text-[var(--primary-color)] mb-2"
                    tag="h3"
                  />
                  <EditableText
                    textKey={`event_${index}_datetime`}
                    defaultValue={`${event.date} • ${event.time}`}
                    className="text-sm font-[var(--body-font)] text-gray-600 mb-1"
                    tag="p"
                  />
                  <EditableText
                    textKey={`event_${index}_venue`}
                    defaultValue={event.venue_name}
                    className="text-sm font-[var(--body-font)] text-gray-600"
                    tag="p"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg text-center">
              <p className="text-gray-500">Event details will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-8 bg-[var(--primary-color)] text-white text-center">
        <EditableText
          textKey="footer_message"
          defaultValue="We can't wait to celebrate with you!"
          className="text-lg font-[var(--body-font)]"
          tag="p"
        />
      </div>
    </div>
  )
}
