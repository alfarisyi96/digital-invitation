'use client'

import { useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useWeddingDetails } from '@/hooks/useWeddingDetails'
import { 
  ArrowLeft, 
  Share2,
  Download,
  Edit,
  Eye,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Mail,
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Clock,
  Calendar,
  Heart,
  Users,
  Gift,
  Music
} from 'lucide-react'

export default function PreviewPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const { details, isLoading, error } = useWeddingDetails(params.id as string)

  const mockInvitationUrl = `https://invite.me/${details?.groomName?.toLowerCase()}-${details?.brideName?.toLowerCase()}-wedding-${params.id}`

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      // TODO: Publish invitation to backend
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShareUrl(mockInvitationUrl)
      setIsPublished(true)
    } catch (error) {
      console.error('Failed to publish:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = (platform: string) => {
    if (!details) return
    
    const coupleNames = `${details.brideName} & ${details.groomName}`
    const text = `You're invited to ${coupleNames}'s Wedding! 💕`
    const url = shareUrl
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      instagram: url, // Instagram doesn't support direct sharing
      email: `mailto:?subject=${encodeURIComponent(`Wedding Invitation - ${coupleNames}`)}&body=${encodeURIComponent(text + '\n\n' + url)}`
    }

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wedding details...</p>
        </div>
      </div>
    )
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Wedding details not found'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
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
              <h1 className="text-lg font-semibold text-gray-900">Preview</h1>
              <p className="text-sm text-gray-600">
                {details.brideName} & {details.groomName} Wedding
              </p>
            </div>
            {isPublished ? (
              <button 
                onClick={() => handleShare('whatsapp')}
                className="p-2 bg-rose-500 hover:bg-rose-600 rounded-full text-white"
              >
                <Share2 className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => router.push(`/create/${params.id}/templates`)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Edit className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Status Card */}
        {!isPublished ? (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-900">Preview Mode</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This is how your invitation will look to guests.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-green-900">Published Successfully!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your invitation is now live and ready to share.
                  </p>
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-900">Share URL:</span>
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 text-sm bg-white border border-green-200 rounded px-2 py-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyUrl}
                        className="border-green-300 hover:bg-green-100"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full-Screen Wedding Invitation */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Wedding Invitation - Real Page Design */}
            <div className="bg-gradient-to-b from-rose-50 to-pink-50 min-h-screen">
              {/* Header */}
              <div className="bg-gradient-to-r from-rose-400 to-pink-400 px-6 py-12 text-center text-white relative">
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-4">💕</div>
                  <h1 className="text-3xl font-bold mb-2">{details.brideName} & {details.groomName}</h1>
                  <p className="text-lg opacity-90">{formatDate(details.date)}</p>
                  {details.hashtag && (
                    <p className="text-sm opacity-80 mt-3">{details.hashtag}</p>
                  )}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Welcome Message */}
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">You're Invited!</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {details.message || 'Join us as we celebrate our special day and begin our journey together as husband and wife.'}
                  </p>
                </div>
                
                {/* Event Details */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-rose-100">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-5 h-5 text-rose-500" />
                      <div>
                        <p className="font-semibold text-gray-800">{formatDate(details.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Clock className="w-5 h-5 text-rose-500" />
                      <div>
                        <p className="text-gray-600">{formatTime(details.time)}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <MapPin className="w-5 h-5 text-rose-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-800">{details.venueName}</p>
                        <p className="text-sm text-gray-600">{details.venueAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parents */}
                {(details.groomParents.length > 0 || details.brideParents.length > 0) && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-rose-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <Users className="w-5 h-5 text-rose-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Our Families</h3>
                    </div>
                    <div className="space-y-4 text-sm">
                      {details.groomParents.length > 0 && (
                        <div>
                          <p className="font-semibold text-gray-700 mb-1">Son of:</p>
                          {details.groomParents.map((parent, index) => (
                            <p key={index} className="text-gray-600">{parent}</p>
                          ))}
                        </div>
                      )}
                      {details.brideParents.length > 0 && (
                        <div>
                          <p className="font-semibold text-gray-700 mb-1">Daughter of:</p>
                          {details.brideParents.map((parent, index) => (
                            <p key={index} className="text-gray-600">{parent}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Love Story */}
                {details.story && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-rose-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Our Story</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{details.story}</p>
                  </div>
                )}
                
                {/* Timeline */}
                {details.timeline.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-rose-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Timeline</h3>
                    <div className="space-y-4">
                      {details.timeline.map((item, index) => (
                        <div key={index} className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-700">{item.title}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <p className="text-sm text-gray-500">{item.location}</p>
                          </div>
                          <span className="font-semibold text-rose-600 ml-4">{formatTime(item.time)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dress Code */}
                {details.dresscode && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-rose-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Dress Code</h3>
                    <p className="text-gray-600">{details.dresscode}</p>
                  </div>
                )}

                {/* Background Music */}
                {details.backgroundMusic.enabled && details.backgroundMusic.title && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-rose-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <Music className="w-5 h-5 text-rose-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Our Song</h3>
                    </div>
                    <p className="text-gray-600">
                      {details.backgroundMusic.title} - {details.backgroundMusic.artist}
                    </p>
                  </div>
                )}

                {/* Gift Registry */}
                {details.giftRegistryEnabled && details.bankAccount.accountNumber && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-rose-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <Gift className="w-5 h-5 text-rose-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Wedding Gift</h3>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><span className="font-semibold">Bank:</span> {details.bankAccount.bankName}</p>
                      <p><span className="font-semibold">Account:</span> {details.bankAccount.accountNumber}</p>
                      <p><span className="font-semibold">Name:</span> {details.bankAccount.accountName}</p>
                    </div>
                  </div>
                )}
                
                {/* RSVP Button */}
                {details.rsvpEnabled && (
                  <div className="pt-4">
                    <button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg">
                      RSVP Now
                    </button>
                  </div>
                )}

                {/* Share Section - Only show when published */}
                {isPublished && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-rose-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Share Our Wedding</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleShare('whatsapp')}
                        className="flex items-center justify-center space-x-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleShare('email')}
                        className="flex items-center justify-center space-x-2"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleShare('facebook')}
                        className="flex items-center justify-center space-x-2"
                      >
                        <Facebook className="w-4 h-4" />
                        <span>Facebook</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleShare('instagram')}
                        className="flex items-center justify-center space-x-2"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>Instagram</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {!isPublished ? (
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 py-3"
            >
              {isPublishing ? 'Publishing...' : 'Publish Invitation'}
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/create/${params.id}/templates`)}
                className="flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Template</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/create/${params.id}/details`)}
                className="flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Details</span>
              </Button>
            </div>
          )}
          
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
