import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { Template } from '@/services/supabaseService'
import { useEffect, useState } from 'react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  invitation: any
  template: Template | undefined
  onGoToDashboard: () => void
}

export function ShareModal({ isOpen, onClose, invitation, template, onGoToDashboard }: ShareModalProps) {
  const [countdown, setCountdown] = useState(10)
  
  // Auto-redirect countdown
  useEffect(() => {
    if (!isOpen) return
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onGoToDashboard()
          return 10 // Reset for next time
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isOpen, onGoToDashboard])
  
  // Reset countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(10)
    }
  }, [isOpen])

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/invitation/${invitation?.id}`
    navigator.clipboard.writeText(shareUrl)
    // You could add a toast notification here
  }

  const handleShareWhatsApp = () => {
    const shareUrl = `${window.location.origin}/invitation/${invitation?.id}`
    const message = `You're invited! Check out my invitation: ${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Invitation Created Successfully!
          </DialogTitle>
          <DialogDescription>
            Your invitation has been saved. Share it with your guests now.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Ready to Share:</h4>
            <p className="text-sm text-green-800">{invitation?.title}</p>
            <p className="text-xs text-green-700 mt-1">
              Template: {template?.name}
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleCopyLink}
              className="w-full"
              variant="outline"
            >
              📋 Copy Share Link
            </Button>
            
            <Button 
              onClick={handleShareWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              📱 Share via WhatsApp
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={onGoToDashboard}
            className="bg-blue-600 hover:bg-blue-700 w-full"
          >
            Go to Dashboard ({countdown}s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
