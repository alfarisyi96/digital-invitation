import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown } from 'lucide-react'
import { GOLD_PACKAGE_FEATURES, GOLD_PACKAGE_PRICE } from '../constants'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
  isLoading?: boolean
}

export function UpgradeModal({ isOpen, onClose, onUpgrade, isLoading = false }: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            onClick={onUpgrade}
            className="bg-yellow-600 hover:bg-yellow-700"
            disabled={isLoading}
          >
            {isLoading ? 'Upgrading...' : 'Upgrade Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
