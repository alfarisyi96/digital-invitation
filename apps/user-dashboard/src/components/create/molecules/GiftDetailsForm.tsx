import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Gift, Plus, Trash2 } from 'lucide-react'
import { FormGiftAccount } from '@/services/supabaseService'

interface GiftDetailsFormProps {
  form: UseFormReturn<any>
  onGenerateQR?: (accountData: FormGiftAccount) => Promise<string>
}

export function GiftDetailsForm({ form, onGenerateQR }: GiftDetailsFormProps) {
  const [giftAccounts, setGiftAccounts] = useState<FormGiftAccount[]>([])
  const [showGiftForm, setShowGiftForm] = useState(false)

  const addGiftAccount = () => {
    setGiftAccounts([...giftAccounts, {
      bank_name: '',
      account_number: '',
      account_name: '',
      account_type: 'bank',
      notes: ''
    }])
  }

  const removeGiftAccount = (index: number) => {
    const updatedAccounts = giftAccounts.filter((_, i) => i !== index)
    setGiftAccounts(updatedAccounts)
    form.setValue('gift_accounts', updatedAccounts)
  }

  const updateGiftAccount = (index: number, field: keyof FormGiftAccount, value: string) => {
    const updatedAccounts = [...giftAccounts]
    updatedAccounts[index] = { ...updatedAccounts[index], [field]: value }
    setGiftAccounts(updatedAccounts)
    
    // Update form with gift accounts data
    form.setValue('gift_accounts', updatedAccounts)
  }

  // Sync with form data when auto-fill is triggered
  useEffect(() => {
    const subscription = form.watch(() => {
      const formData = form.getValues()
      if (formData.gift_accounts && Array.isArray(formData.gift_accounts) && formData.gift_accounts.length > 0) {
        console.log('GiftDetailsForm: Auto-fill detected, updating gift accounts:', formData.gift_accounts)
        setGiftAccounts(formData.gift_accounts)
        setShowGiftForm(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Additional effect to sync with form values (especially for edit mode)
  useEffect(() => {
    const formGiftAccounts = form.getValues('gift_accounts')
    if (formGiftAccounts && Array.isArray(formGiftAccounts) && formGiftAccounts.length > 0) {
      console.log('GiftDetailsForm: Direct form values sync, updating gift accounts:', formGiftAccounts)
      setGiftAccounts(formGiftAccounts)
      setShowGiftForm(true)
    }
  }, [form.formState.defaultValues]) // Trigger when form default values change (including reset)

  const handleGenerateQR = async (index: number) => {
    if (onGenerateQR) {
      try {
        const qrUrl = await onGenerateQR(giftAccounts[index])
        updateGiftAccount(index, 'qr_code_url', qrUrl)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      }
    } else {
      // Simulate QR generation
      const simulatedQR = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        `Bank: ${giftAccounts[index].bank_name}\nAccount: ${giftAccounts[index].account_number}\nName: ${giftAccounts[index].account_name}`
      )}`
      updateGiftAccount(index, 'qr_code_url', simulatedQR)
    }
  }

  const accountTypes = [
    { value: 'bank', label: 'Bank Account' },
    { value: 'ewallet', label: 'E-Wallet' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Gift className="w-5 h-5 mr-2 text-green-500" />
          Gift Information (Optional)
        </CardTitle>
        {!showGiftForm && giftAccounts.length === 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowGiftForm(true)}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Gift Details
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {showGiftForm && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Gift Account Information</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGiftAccount}
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Account
              </Button>
            </div>

            {giftAccounts.map((account, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                {giftAccounts.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGiftAccount(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type *
                    </label>
                    <select
                      value={account.account_type}
                      onChange={(e) => updateGiftAccount(index, 'account_type', e.target.value as 'bank' | 'ewallet' | 'other')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {accountTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {account.account_type === 'bank' ? 'Bank Name' : 
                       account.account_type === 'ewallet' ? 'E-Wallet Provider' : 
                       'Provider Name'} *
                    </label>
                    <input
                      type="text"
                      value={account.bank_name}
                      onChange={(e) => updateGiftAccount(index, 'bank_name', e.target.value)}
                      placeholder={account.account_type === 'bank' ? 'e.g., BCA, Mandiri, BNI' : 
                                 account.account_type === 'ewallet' ? 'e.g., GoPay, OVO, DANA' : 
                                 'e.g., Provider name'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={account.account_number}
                      onChange={(e) => updateGiftAccount(index, 'account_number', e.target.value)}
                      placeholder="e.g., 1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      value={account.account_name}
                      onChange={(e) => updateGiftAccount(index, 'account_name', e.target.value)}
                      placeholder="e.g., John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <Textarea
                    value={account.notes}
                    onChange={(e) => updateGiftAccount(index, 'notes', e.target.value)}
                    placeholder="Any additional information for this account..."
                    rows={2}
                    className="w-full"
                  />
                </div>
              </div>
            ))}

            {giftAccounts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No gift accounts added yet</p>
                <p className="text-xs">Click "Add Account" to add payment information for gifts</p>
              </div>
            )}
          </div>
        )}

        {!showGiftForm && giftAccounts.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm mb-2">Gift information helps guests contribute easily</p>
            <p className="text-xs">Add bank accounts or e-wallet details for digital gifts</p>
          </div>
        )}

        <div className="text-sm text-gray-500 bg-green-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💝 Gift Feature Benefits:</p>
          <ul className="space-y-1 text-xs">
            <li>• Support for multiple banks and e-wallets</li>
            <li>• Organize different payment options for guests</li>
            <li>• Add helpful notes for each account</li>
            <li>• Optional - you can skip this if you prefer physical gifts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
