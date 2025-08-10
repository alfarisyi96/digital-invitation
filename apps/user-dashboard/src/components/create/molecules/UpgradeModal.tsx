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
}

export function UpgradeModal({ isOpen, onClose, onPaymentSubmit, isLoading = false }: UpgradeModalProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

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
              <Crown className="w-5 h-5 mr-2 text-yellow-600" />
              Upgrade to Gold Package
            </DialogTitle>
            <DialogDescription>
              This template is only available with the Gold package. Would you like to upgrade?
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
