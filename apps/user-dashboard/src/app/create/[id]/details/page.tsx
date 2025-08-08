'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FileUpload } from '@/components/ui/file-upload'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  MapPin,
  Heart,
  Camera,
  Music,
  Users,
  Gift,
  Plus,
  X,
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react'

interface WeddingFormData {
  // Basic Details
  groomName: string
  brideName: string
  groomParents: string[]
  brideParents: string[]
  
  // Event Details
  date: string
  time: string
  venueName: string
  venueAddress: string
  
  // Story & Message
  story: string
  message: string
  hashtag: string
  dresscode: string
  
  // Media
  heroImage: string | null
  gallery: any[]
  backgroundMusic: {
    enabled: boolean
    url: string
    title: string
    artist: string
    autoplay: boolean
    volume: number
  }
  
  // Timeline
  timeline: Array<{
    time: string
    title: string
    description: string
    location: string
  }>
  
  // RSVP & Gift
  rsvpEnabled: boolean
  rsvpDeadline: string
  giftRegistryEnabled: boolean
  bankAccount: {
    bankName: string
    accountNumber: string
    accountName: string
  }
}

export default function WeddingDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState<WeddingFormData>({
    groomName: '',
    brideName: '',
    groomParents: [''],
    brideParents: [''],
    date: '',
    time: '',
    venueName: '',
    venueAddress: '',
    story: '',
    message: '',
    hashtag: '',
    dresscode: '',
    heroImage: null,
    gallery: [],
    backgroundMusic: {
      enabled: false,
      url: '',
      title: '',
      artist: '',
      autoplay: false,
      volume: 50
    },
    timeline: [
      { time: '', title: '', description: '', location: '' }
    ],
    rsvpEnabled: true,
    rsvpDeadline: '',
    giftRegistryEnabled: false,
    bankAccount: {
      bankName: '',
      accountNumber: '',
      accountName: ''
    }
  })

  const steps = [
    { id: 1, title: 'Basic Info', icon: Heart },
    { id: 2, title: 'Event Details', icon: Calendar },
    { id: 3, title: 'Story & Message', icon: Users },
    { id: 4, title: 'Media & Music', icon: Camera },
    { id: 5, title: 'Timeline', icon: Clock },
    { id: 6, title: 'RSVP & Gifts', icon: Gift }
  ]

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof WeddingFormData] as any,
        [field]: value
      }
    }))
  }

  const addParent = (type: 'groom' | 'bride') => {
    const field = `${type}Parents` as keyof WeddingFormData
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }))
  }

  const removeParent = (type: 'groom' | 'bride', index: number) => {
    const field = `${type}Parents` as keyof WeddingFormData
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const updateParent = (type: 'groom' | 'bride', index: number, value: string) => {
    const field = `${type}Parents` as keyof WeddingFormData
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((parent, i) => i === index ? value : parent)
    }))
  }

  const addTimelineItem = () => {
    setFormData(prev => ({
      ...prev,
      timeline: [...prev.timeline, { time: '', title: '', description: '', location: '' }]
    }))
  }

  const removeTimelineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.filter((_, i) => i !== index)
    }))
  }

  const updateTimelineItem = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Save to backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push(`/create/${params.id}/templates`)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.groomName && formData.brideName
      case 2: return formData.date && formData.time && formData.venueName
      case 3: return true // Optional fields
      case 4: return true // Optional fields
      case 5: return true // Optional fields
      case 6: return true // Optional fields
      default: return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Heart className="w-12 h-12 text-rose-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Couple Details</h2>
              <p className="text-gray-600">Tell us about the happy couple</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groomName">Groom's Name</Label>
                  <Input
                    id="groomName"
                    value={formData.groomName}
                    onChange={(e) => updateFormData('groomName', e.target.value)}
                    placeholder="Enter groom's full name"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brideName">Bride's Name</Label>
                  <Input
                    id="brideName"
                    value={formData.brideName}
                    onChange={(e) => updateFormData('brideName', e.target.value)}
                    placeholder="Enter bride's full name"
                    className="h-12"
                  />
                </div>
              </div>

              {/* Groom's Parents */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Groom's Parents</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addParent('groom')}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Parent
                  </Button>
                </div>
                {formData.groomParents.map((parent, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={parent}
                      onChange={(e) => updateParent('groom', index, e.target.value)}
                      placeholder={`Parent ${index + 1} name`}
                      className="h-10"
                    />
                    {formData.groomParents.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeParent('groom', index)}
                        className="h-10 w-10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Bride's Parents */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Bride's Parents</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addParent('bride')}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Parent
                  </Button>
                </div>
                {formData.brideParents.map((parent, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={parent}
                      onChange={(e) => updateParent('bride', index, e.target.value)}
                      placeholder={`Parent ${index + 1} name`}
                      className="h-10"
                    />
                    {formData.brideParents.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeParent('bride', index)}
                        className="h-10 w-10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Calendar className="w-12 h-12 text-blue-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
              <p className="text-gray-600">When and where is the celebration?</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Wedding Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData('date', e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => updateFormData('time', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name</Label>
                <Input
                  id="venueName"
                  value={formData.venueName}
                  onChange={(e) => updateFormData('venueName', e.target.value)}
                  placeholder="e.g., Grand Ballroom Hotel Mulia"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueAddress">Venue Address</Label>
                <Textarea
                  id="venueAddress"
                  value={formData.venueAddress}
                  onChange={(e) => updateFormData('venueAddress', e.target.value)}
                  placeholder="Enter full address with city and postal code"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dresscode">Dress Code (Optional)</Label>
                <Select onValueChange={(value) => updateFormData('dresscode', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select dress code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal / Black Tie</SelectItem>
                    <SelectItem value="semi-formal">Semi-Formal</SelectItem>
                    <SelectItem value="cocktail">Cocktail Attire</SelectItem>
                    <SelectItem value="casual">Smart Casual</SelectItem>
                    <SelectItem value="themed">Themed</SelectItem>
                    <SelectItem value="traditional">Traditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Users className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Your Story</h2>
              <p className="text-gray-600">Share your love story and message</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="story">Love Story (Optional)</Label>
                <Textarea
                  id="story"
                  value={formData.story}
                  onChange={(e) => updateFormData('story', e.target.value)}
                  placeholder="Tell your guests how you met and fell in love..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Welcome Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => updateFormData('message', e.target.value)}
                  placeholder="A special message for your guests..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtag">Wedding Hashtag (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                  <Input
                    id="hashtag"
                    value={formData.hashtag}
                    onChange={(e) => updateFormData('hashtag', e.target.value)}
                    placeholder="SarahJohnWedding2025"
                    className="h-12 pl-8"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Encourage guests to use this hashtag when posting photos
                </p>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Camera className="w-12 h-12 text-purple-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Media & Music</h2>
              <p className="text-gray-600">Add photos and background music</p>
            </div>

            <div className="space-y-6">
              {/* Hero Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hero Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFileSelect={(files) => {
                      if (files.length > 0) {
                        // In a real app, you'd upload to a server here
                        const url = URL.createObjectURL(files[0])
                        updateFormData('heroImage', url)
                      }
                    }}
                    accept="image/*"
                    multiple={false}
                    maxSize={10}
                  >
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-600 mb-1">Upload your main wedding photo</p>
                        <p className="text-sm text-gray-400">Recommended: 1200x800px or larger</p>
                        <Button variant="outline" className="mt-4" type="button">
                          Choose Image
                        </Button>
                      </div>
                    </div>
                  </FileUpload>
                </CardContent>
              </Card>

              {/* Photo Gallery */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Photo Gallery (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFileSelect={(files) => {
                      // In a real app, you'd upload to a server here
                      const newPhotos = files.map((file, index) => ({
                        id: Date.now() + index,
                        url: URL.createObjectURL(file),
                        caption: '',
                        order: formData.gallery.length + index
                      }))
                      updateFormData('gallery', [...formData.gallery, ...newPhotos])
                    }}
                    accept="image/*"
                    multiple={true}
                    maxFiles={20}
                    maxSize={5}
                  >
                    <div className="space-y-2">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-600 mb-1">Add more photos to showcase your journey</p>
                        <p className="text-sm text-gray-400">Upload multiple images (max 20 photos)</p>
                        <Button variant="outline" className="mt-4" type="button">
                          Add Photos
                        </Button>
                      </div>
                    </div>
                  </FileUpload>
                </CardContent>
              </Card>

              {/* Background Music */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Background Music (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Checkbox
                    id="musicEnabled"
                    label="Enable background music"
                    checked={formData.backgroundMusic.enabled}
                    onChange={(e) => updateNestedFormData('backgroundMusic', 'enabled', e.target.checked)}
                  />

                  {formData.backgroundMusic.enabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Song Title</Label>
                        <Input
                          value={formData.backgroundMusic.title}
                          onChange={(e) => updateNestedFormData('backgroundMusic', 'title', e.target.value)}
                          placeholder="Perfect - Ed Sheeran"
                          className="h-10"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Artist</Label>
                        <Input
                          value={formData.backgroundMusic.artist}
                          onChange={(e) => updateNestedFormData('backgroundMusic', 'artist', e.target.value)}
                          placeholder="Ed Sheeran"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Music File</Label>
                        <FileUpload
                          onFileSelect={(files) => {
                            if (files.length > 0) {
                              const url = URL.createObjectURL(files[0])
                              updateNestedFormData('backgroundMusic', 'url', url)
                            }
                          }}
                          accept="audio/*"
                          multiple={false}
                          maxSize={10}
                        >
                          <div className="space-y-2">
                            <Music className="w-8 h-8 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Upload MP3 file</p>
                              <p className="text-xs text-gray-400">Max 10MB</p>
                              <Button variant="outline" size="sm" type="button">
                                Choose File
                              </Button>
                            </div>
                          </div>
                        </FileUpload>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Checkbox
                          id="autoplay"
                          label="Auto-play"
                          checked={formData.backgroundMusic.autoplay}
                          onChange={(e) => updateNestedFormData('backgroundMusic', 'autoplay', e.target.checked)}
                        />

                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-4 h-4 text-gray-500" />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={formData.backgroundMusic.volume}
                            onChange={(e) => updateNestedFormData('backgroundMusic', 'volume', parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-500 w-8">{formData.backgroundMusic.volume}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Clock className="w-12 h-12 text-orange-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Event Timeline</h2>
              <p className="text-gray-600">Schedule of wedding events (Optional)</p>
            </div>

            <div className="space-y-4">
              {formData.timeline.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium">Event {index + 1}</h4>
                      {formData.timeline.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeTimelineItem(index)}
                          className="h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="space-y-1">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={item.time}
                          onChange={(e) => updateTimelineItem(index, 'time', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => updateTimelineItem(index, 'title', e.target.value)}
                          placeholder="e.g., Ceremony"
                          className="h-9"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <Label>Description (Optional)</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateTimelineItem(index, 'description', e.target.value)}
                        placeholder="Brief description"
                        className="h-9"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label>Location (Optional)</Label>
                      <Input
                        value={item.location}
                        onChange={(e) => updateTimelineItem(index, 'location', e.target.value)}
                        placeholder="Specific location if different"
                        className="h-9"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                variant="outline"
                onClick={addTimelineItem}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Timeline Event
              </Button>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Gift className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">RSVP & Gifts</h2>
              <p className="text-gray-600">Manage responses and gift preferences</p>
            </div>

            <div className="space-y-6">
              {/* RSVP Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">RSVP Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Checkbox
                    id="rsvpEnabled"
                    label="Enable RSVP"
                    checked={formData.rsvpEnabled}
                    onChange={(e) => updateFormData('rsvpEnabled', e.target.checked)}
                  />

                  {formData.rsvpEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="rsvpDeadline">RSVP Deadline</Label>
                      <Input
                        id="rsvpDeadline"
                        type="date"
                        value={formData.rsvpDeadline}
                        onChange={(e) => updateFormData('rsvpDeadline', e.target.value)}
                        className="h-10"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gift Registry */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gift Registry</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Checkbox
                    id="giftRegistryEnabled"
                    label="Show gift information"
                    checked={formData.giftRegistryEnabled}
                    onChange={(e) => updateFormData('giftRegistryEnabled', e.target.checked)}
                  />

                  {formData.giftRegistryEnabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input
                          value={formData.bankAccount.bankName}
                          onChange={(e) => updateNestedFormData('bankAccount', 'bankName', e.target.value)}
                          placeholder="Bank Central Asia (BCA)"
                          className="h-10"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input
                          value={formData.bankAccount.accountNumber}
                          onChange={(e) => updateNestedFormData('bankAccount', 'accountNumber', e.target.value)}
                          placeholder="1234567890"
                          className="h-10"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Account Name</Label>
                        <Input
                          value={formData.bankAccount.accountName}
                          onChange={(e) => updateNestedFormData('bankAccount', 'accountName', e.target.value)}
                          placeholder="Sarah & John Wedding"
                          className="h-10"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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
            <h1 className="text-lg font-semibold text-gray-900">
              Wedding Details
            </h1>
            <div className="w-9 h-9" />
          </div>
        </div>
      </header>

      {/* Step Navigation */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'bg-rose-500 text-white' 
                    : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{step.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {renderStep()}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto flex space-x-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              Previous
            </Button>
          )}
          
          {currentStep < steps.length ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={!canProceed() || isSaving}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
            >
              {isSaving ? 'Saving...' : 'Save & Continue'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
