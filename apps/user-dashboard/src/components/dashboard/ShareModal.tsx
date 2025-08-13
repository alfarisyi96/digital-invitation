import React, { useState } from 'react'
import { 
  Share2, 
  Copy, 
  Check, 
  X, 
  Facebook, 
  Twitter, 
  MessageCircle,
  Mail,
  Link,
  QrCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  invitation: {
    id: string
    title: string
    public_slug?: string
    bride_full_name?: string
    groom_full_name?: string
    ceremony_date?: string
  }
}

export function ShareModal({ isOpen, onClose, invitation }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  if (!isOpen) return null

  // Generate share URL using landing page domain
  const landingPageUrl = process.env.NEXT_PUBLIC_LANDING_PAGE_URL || 'https://your-invitation-domain.com'
  const shareUrl = invitation.public_slug 
    ? `${landingPageUrl}/i/${invitation.public_slug}`
    : `${landingPageUrl}/i/${invitation.public_slug}` // Always use public URL for sharing

  // Generate share text
  const shareText = invitation.bride_full_name && invitation.groom_full_name
    ? `Join us for ${invitation.bride_full_name} & ${invitation.groom_full_name}'s wedding celebration! 💕`
    : `You're invited to our wedding celebration! 💕`

  const ceremonyDate = invitation.ceremony_date 
    ? new Date(invitation.ceremony_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : ''

  const fullShareText = `${shareText}${ceremonyDate ? ` on ${ceremonyDate}` : ''}\n\n${shareUrl}`

  // Copy to clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "The invitation link has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        title: "Copy failed",
        description: "Please manually copy the link.",
        variant: "destructive"
      })
    }
  }

  // Share to social media
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`
    window.open(url, '_blank')
  }

  const shareViaEmail = () => {
    const subject = `Wedding Invitation - ${invitation.title}`
    const body = encodeURIComponent(fullShareText)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  // Generate QR code URL (using qr-server.com)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Share Invitation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Invitation Info */}
          <div className="text-center">
            <h4 className="font-medium text-gray-900 mb-1">{invitation.title}</h4>
            {ceremonyDate && (
              <p className="text-sm text-gray-600">{ceremonyDate}</p>
            )}
          </div>

          {/* Copy URL Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invitation Link
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-gray-50"
              />
              <Button
                onClick={handleCopyUrl}
                variant="outline"
                size="sm"
                className="px-3"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Click to copy the invitation link
            </p>
          </div>

          {/* Social Media Sharing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Share on Social Media
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareToFacebook}
                variant="outline"
                className="flex items-center justify-center space-x-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                <span>Facebook</span>
              </Button>
              
              <Button
                onClick={shareToTwitter}
                variant="outline"
                className="flex items-center justify-center space-x-2 hover:bg-blue-50 hover:border-blue-400"
              >
                <Twitter className="h-4 w-4 text-blue-500" />
                <span>Twitter</span>
              </Button>
              
              <Button
                onClick={shareToWhatsApp}
                variant="outline"
                className="flex items-center justify-center space-x-2 hover:bg-green-50 hover:border-green-400"
              >
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span>WhatsApp</span>
              </Button>
              
              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="flex items-center justify-center space-x-2 hover:bg-gray-50 hover:border-gray-400"
              >
                <Mail className="h-4 w-4 text-gray-600" />
                <span>Email</span>
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                QR Code
              </label>
              <Button
                onClick={() => setShowQR(!showQR)}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                <QrCode className="h-4 w-4 mr-1" />
                {showQR ? 'Hide' : 'Show'} QR Code
              </Button>
            </div>
            
            {showQR && (
              <div className="flex justify-center">
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code for invitation"
                    className="w-48 h-48"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Scan to open invitation
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Share Text Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Message Preview
            </label>
            <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 whitespace-pre-line">
              {fullShareText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
