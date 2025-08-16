import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown } from 'lucide-react'
import { GOLD_PACKAGE_FEATURES, GOLD_PACKAGE_PRICE } from '../constants'
import { PaymentConfirmationModal } from './PaymentConfirmationModal'
import { PaymentConfirmation } from '@/services/edgeFunctionsService'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSubmit: (paymentData: PaymentConfirmation) => Promise<{ success: boolean; error?: string }>
  isLoading?: boolean
  errorType?: 'PACKAGE_LIMIT_EXCEEDED' | 'TEMPLATE_ACCESS_DENIED' | 'PREMIUM_TEMPLATE_REQUIRED'
}

export function UpgradeModal({ isOpen, onClose, onPaymentSubmit, isLoading = false, errorType }: UpgradeModalProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Get messaging based on error type
  const getModalContent = () => {
    switch (errorType) {
      case 'PACKAGE_LIMIT_EXCEEDED':
        return {
          title: 'Package Limit Reached',
          description: 'You have reached your invitation limit for the Basic package. Upgrade to Gold for unlimited invitations.',
          icon: '📊'
        }
      case 'TEMPLATE_ACCESS_DENIED':
      case 'PREMIUM_TEMPLATE_REQUIRED':
        return {
          title: 'Premium Template Access',
          description: 'This beautiful template is only available with the Gold package. Upgrade to access premium templates.',
          icon: '👑'
        }
      default:
        return {
          title: 'Upgrade to Gold Package',
          description: 'Unlock premium features and templates with the Gold package.',
          icon: '✨'
        }
    }
  }

  const content = getModalContent()

  const handleUpgradeClick = () => {
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = async (paymentData: PaymentConfirmation) => {
    const result = await onPaymentSubmit(paymentData)
    if (result.success) {
      setShowPaymentModal(false)
      onClose()
    }
    return result
  }

  return (
    <>
      <Dialog open={isOpen && !showPaymentModal} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="mr-2">{content.icon}</span>
              {content.title}
            </DialogTitle>
            <DialogDescription>
              {content.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Gold Package Features:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                {GOLD_PACKAGE_FEATURES.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900">{GOLD_PACKAGE_PRICE}</span>
              <span className="text-gray-600 ml-1">one-time</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpgradeClick}
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaymentConfirmationModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handlePaymentSubmit}
        isLoading={isLoading}
      />
    </>
  )
}
