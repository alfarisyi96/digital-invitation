import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, CreditCard, Smartphone, Building, CheckCircle } from 'lucide-react'
import { PaymentConfirmation } from '@/services/edgeFunctionsService'

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (paymentData: PaymentConfirmation) => Promise<{ success: boolean; error?: string }>
  isLoading?: boolean
}

export function PaymentConfirmationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: PaymentConfirmationModalProps) {
  const [paymentData, setPaymentData] = useState<PaymentConfirmation>({
    amount: 299000, // Default Gold package price
    paymentMethod: '',
    notes: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentData.paymentMethod) {
      return
    }

    const result = await onSubmit(paymentData)
    
    if (result.success) {
      setSubmitted(true)
      // Auto-close after success message
      setTimeout(() => {
        onClose()
        setSubmitted(false)
        setPaymentData({
          amount: 299000,
          paymentMethod: '',
          notes: ''
        })
      }, 3000)
    }
  }

  const handleClose = () => {
    onClose()
    setSubmitted(false)
    setPaymentData({
      amount: 299000,
      paymentMethod: '',
      notes: ''
    })
  }

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Confirmation Submitted!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We'll review your payment and upgrade your account within 24 hours.
            </p>
            <p className="text-xs text-muted-foreground">
              You'll receive a WhatsApp confirmation once approved.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade to Gold Package
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Package Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Gold Package Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Unlimited Invitations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Premium Templates</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Advanced Features</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Priority Support</span>
              </div>
              
              <div className="pt-2 border-t">
                <p className="font-semibold text-lg">
                  Rp {paymentData.amount.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-muted-foreground">One-time payment</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select 
                value={paymentData.paymentMethod} 
                onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                  <SelectItem value="e_wallet">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      E-Wallet (GoPay, OVO, DANA)
                    </div>
                  </SelectItem>
                  <SelectItem value="credit_card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Credit/Debit Card
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount (IDR)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  amount: parseInt(e.target.value) || 0 
                }))}
                min="1"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="notes">Payment Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Transaction ID, reference number, or additional information..."
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Payment Instructions:</h4>
              <ol className="text-xs text-muted-foreground space-y-1">
                <li>1. Make payment using your selected method</li>
                <li>2. Submit this confirmation with payment details</li>
                <li>3. We'll verify and upgrade your account within 24 hours</li>
                <li>4. You'll receive WhatsApp confirmation once approved</li>
              </ol>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                disabled={!paymentData.paymentMethod || isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Confirmation'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
