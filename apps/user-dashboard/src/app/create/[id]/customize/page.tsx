'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTemplates } from '@/hooks/useTemplates'
import { Template, TemplateColor, TemplateFont } from '@/types'
import { 
  ArrowLeft, 
  Palette,
  Type,
  Layout,
  Eye,
  Save,
  Download,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'

interface CustomizationSettings {
  selectedColor: TemplateColor
  selectedFont: TemplateFont
  layout: 'single' | 'multi' | 'scroll'
  animations: boolean
  musicEnabled: boolean
  showTimeline: boolean
  showRSVP: boolean
  showGallery: boolean
}

export default function CustomizationPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  
  const { getTemplateById } = useTemplates()
  const [template, setTemplate] = useState<Template | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'layout' | 'preview'>('colors')
  
  const [customization, setCustomization] = useState<CustomizationSettings>({
    selectedColor: {} as TemplateColor,
    selectedFont: {} as TemplateFont,
    layout: 'single',
    animations: true,
    musicEnabled: false,
    showTimeline: true,
    showRSVP: true,
    showGallery: true
  })

  useEffect(() => {
    if (templateId) {
      const foundTemplate = getTemplateById(templateId)
      if (foundTemplate) {
        setTemplate(foundTemplate)
        setCustomization(prev => ({
          ...prev,
          selectedColor: foundTemplate.colors[0],
          selectedFont: foundTemplate.fonts[0]
        }))
      }
    }
  }, [templateId, getTemplateById])

  const updateCustomization = (field: keyof CustomizationSettings, value: any) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Save customization to backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Navigate to preview page
      router.push(`/create/${params.id}/preview`)
    } catch (error) {
      console.error('Failed to save customization:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefault = () => {
    if (template) {
      setCustomization({
        selectedColor: template.colors[0],
        selectedFont: template.fonts[0],
        layout: 'single',
        animations: true,
        musicEnabled: false,
        showTimeline: true,
        showRSVP: true,
        showGallery: true
      })
    }
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'colors':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h3>
              <div className="grid grid-cols-1 gap-4">
                {template.colors.map((color, index) => (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-all ${
                      customization.selectedColor.name === color.name 
                        ? 'ring-2 ring-rose-500' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => updateCustomization('selectedColor', color)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{color.name}</h4>
                        {customization.selectedColor.name === color.name && (
                          <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <div 
                          className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                          style={{ backgroundColor: color.primary }}
                          title="Primary"
                        ></div>
                        <div 
                          className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                          style={{ backgroundColor: color.secondary }}
                          title="Secondary"
                        ></div>
                        <div 
                          className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                          style={{ backgroundColor: color.accent }}
                          title="Accent"
                        ></div>
                        <div 
                          className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                          style={{ backgroundColor: color.background }}
                          title="Background"
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Custom Color Picker */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Custom Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={customization.selectedColor.primary}
                          onChange={(e) => updateCustomization('selectedColor', {
                            ...customization.selectedColor,
                            primary: e.target.value
                          })}
                          className="w-12 h-10 rounded border border-gray-300"
                        />
                        <Input
                          value={customization.selectedColor.primary}
                          onChange={(e) => updateCustomization('selectedColor', {
                            ...customization.selectedColor,
                            primary: e.target.value
                          })}
                          className="flex-1 h-10"
                          placeholder="#E8B4B8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={customization.selectedColor.secondary}
                          onChange={(e) => updateCustomization('selectedColor', {
                            ...customization.selectedColor,
                            secondary: e.target.value
                          })}
                          className="w-12 h-10 rounded border border-gray-300"
                        />
                        <Input
                          value={customization.selectedColor.secondary}
                          onChange={(e) => updateCustomization('selectedColor', {
                            ...customization.selectedColor,
                            secondary: e.target.value
                          })}
                          className="flex-1 h-10"
                          placeholder="#F5E6E8"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'fonts':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
              <div className="space-y-4">
                {template.fonts.map((font, index) => (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-all ${
                      customization.selectedFont.name === font.name 
                        ? 'ring-2 ring-rose-500' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => updateCustomization('selectedFont', font)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{font.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{font.family}</p>
                        </div>
                        {customization.selectedFont.name === font.name && (
                          <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p 
                          className="text-2xl"
                          style={{ fontFamily: font.name }}
                        >
                          Sarah & John
                        </p>
                        <p 
                          className="text-base text-gray-700"
                          style={{ fontFamily: font.name }}
                        >
                          You are cordially invited to celebrate our wedding
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Font Size Controls */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Font Sizes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Heading Size</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="24"
                          max="72"
                          defaultValue="48"
                          className="w-24"
                        />
                        <span className="text-sm text-gray-600 w-8">48px</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Body Size</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="12"
                          max="24"
                          defaultValue="16"
                          className="w-24"
                        />
                        <span className="text-sm text-gray-600 w-8">16px</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'layout':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Options</h3>
              
              {/* Layout Type */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Page Layout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'single', name: 'Single Page', description: 'All content on one page' },
                      { id: 'multi', name: 'Multi Page', description: 'Separate pages for different sections' },
                      { id: 'scroll', name: 'Long Scroll', description: 'Continuous scrolling experience' }
                    ].map((layoutOption) => (
                      <div
                        key={layoutOption.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          customization.layout === layoutOption.id
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateCustomization('layout', layoutOption.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{layoutOption.name}</h4>
                            <p className="text-sm text-gray-600">{layoutOption.description}</p>
                          </div>
                          {customization.layout === layoutOption.id && (
                            <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Section Toggles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sections to Include</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Checkbox
                    id="showTimeline"
                    label="Event Timeline"
                    checked={customization.showTimeline}
                    onChange={(e) => updateCustomization('showTimeline', e.target.checked)}
                  />
                  <Checkbox
                    id="showRSVP"
                    label="RSVP Form"
                    checked={customization.showRSVP}
                    onChange={(e) => updateCustomization('showRSVP', e.target.checked)}
                  />
                  <Checkbox
                    id="showGallery"
                    label="Photo Gallery"
                    checked={customization.showGallery}
                    onChange={(e) => updateCustomization('showGallery', e.target.checked)}
                  />
                  <Checkbox
                    id="animations"
                    label="Enable Animations"
                    checked={customization.animations}
                    onChange={(e) => updateCustomization('animations', e.target.checked)}
                  />
                  <Checkbox
                    id="musicEnabled"
                    label="Background Music"
                    checked={customization.musicEnabled}
                    onChange={(e) => updateCustomization('musicEnabled', e.target.checked)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'preview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
              
              {/* Mobile Preview Frame */}
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="bg-white rounded-lg shadow-lg mx-auto" style={{ width: '320px', height: '640px' }}>
                  <div 
                    className="h-full rounded-lg overflow-hidden"
                    style={{ 
                      backgroundColor: customization.selectedColor.background,
                      fontFamily: customization.selectedFont.name 
                    }}
                  >
                    {/* Preview Header */}
                    <div 
                      className="h-32 flex items-center justify-center"
                      style={{ backgroundColor: customization.selectedColor.primary }}
                    >
                      <h1 
                        className="text-2xl font-bold text-white text-center"
                        style={{ fontFamily: customization.selectedFont.name }}
                      >
                        Sarah & John
                      </h1>
                    </div>

                    {/* Preview Content */}
                    <div className="p-6 space-y-4">
                      <div className="text-center">
                        <p 
                          className="text-lg mb-2"
                          style={{ color: customization.selectedColor.primary }}
                        >
                          You're Invited!
                        </p>
                        <p className="text-gray-700 text-sm">
                          Join us as we celebrate our special day
                        </p>
                      </div>

                      <div 
                        className="bg-opacity-50 rounded-lg p-4"
                        style={{ backgroundColor: customization.selectedColor.secondary }}
                      >
                        <div className="text-center space-y-1">
                          <p className="font-medium">Saturday, August 15, 2025</p>
                          <p className="text-sm text-gray-600">4:00 PM</p>
                          <p className="text-sm text-gray-600">Grand Ballroom Hotel</p>
                        </div>
                      </div>

                      {customization.showTimeline && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Timeline</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Ceremony</span>
                              <span>4:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Reception</span>
                              <span>6:00 PM</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {customization.showRSVP && (
                        <Button
                          size="sm"
                          className="w-full"
                          style={{ backgroundColor: customization.selectedColor.accent }}
                        >
                          RSVP Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">Customize</h1>
              <p className="text-sm text-gray-600">{template.name}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'colors', label: 'Colors', icon: Palette },
            { id: 'fonts', label: 'Fonts', icon: Type },
            { id: 'layout', label: 'Layout', icon: Layout },
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {renderTabContent()}
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setActiveTab('preview')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
