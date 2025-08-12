import React, { useState } from 'react'
import { CreditCard, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react'
import type { GiftDetails } from '@/services/supabaseService'

interface GiftDetailsFormProps {
  gifts: GiftDetails[]
  onChange: (gifts: GiftDetails[]) => void
}

export function GiftDetailsForm({ gifts, onChange }: GiftDetailsFormProps) {
  const [expandedGift, setExpandedGift] = useState<number | null>(0)

  const addGift = () => {
    const newGift: GiftDetails = {
      type: 'bank',
      bank_name: '',
      account_number: '',
      account_name: ''
    }
    onChange([...gifts, newGift])
    setExpandedGift(gifts.length) // Expand the new gift
  }

  const updateGift = (index: number, field: keyof GiftDetails, value: string) => {
    const updated = gifts.map((gift, i) => 
      i === index ? { ...gift, [field]: value } : gift
    )
    onChange(updated)
  }

  const removeGift = (index: number) => {
    if (gifts.length <= 1) return // Keep at least one gift option
    const updated = gifts.filter((_, i) => i !== index)
    onChange(updated)
    if (expandedGift === index) {
      setExpandedGift(0)
    }
  }

  const handleQRCodeUpload = async (index: number, file: File) => {
    try {
      // TODO: Implement Cloudflare Images upload
      console.log('Uploading QR code for gift', index, file)
      // const cloudflareImageId = await uploadToCloudflare(file)
      // updateGift(index, 'qr_code', cloudflareImageId)
    } catch (error) {
      console.error('Error uploading QR code:', error)
    }
  }

  const giftTypeOptions = [
    { value: 'bank', label: 'Bank Transfer', icon: '🏦', description: 'Traditional bank account' },
    { value: 'ewallet', label: 'E-Wallet', icon: '📱', description: 'Digital wallet (GoPay, OVO, etc.)' },
    { value: 'cash', label: 'Cash Gift', icon: '💵', description: 'Cash gift information' }
  ]

  const commonBanks = [
    'BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Danamon', 'Permata', 'Maybank',
    'OCBC NISP', 'Bank Mega', 'Jenius', 'Digibank'
  ]

  const commonEWallets = [
    'GoPay', 'OVO', 'Dana', 'LinkAja', 'ShopeePay', 'PayPal', 'Flip'
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Gift Information</h3>
          <p className="text-sm text-gray-500">Add bank accounts or e-wallets for gift transfers</p>
        </div>
        <button
          type="button"
          onClick={addGift}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Account
        </button>
      </div>

      <div className="space-y-4">
        {gifts.map((gift, index) => (
          <div 
            key={index} 
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Gift Header */}
            <div 
              className="px-4 py-3 bg-gray-50 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedGift(expandedGift === index ? null : index)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">
                  {giftTypeOptions.find(opt => opt.value === gift.type)?.icon || '💳'}
                </span>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {gift.bank_name || gift.type === 'bank' ? 'Bank Transfer' : gift.type === 'ewallet' ? 'E-Wallet' : 'Cash Gift'} 
                    {gift.bank_name && ` - ${gift.bank_name}`}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {gift.account_name || 'No account name set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {gifts.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeGift(index)
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <span className="text-gray-400">
                  {expandedGift === index ? '−' : '+'}
                </span>
              </div>
            </div>

            {/* Gift Details (Expandable) */}
            {expandedGift === index && (
              <div className="px-4 py-4 space-y-4">
                {/* Gift Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gift Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {giftTypeOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateGift(index, 'type', option.value as GiftDetails['type'])}
                        className={`p-3 text-left border rounded-lg transition-colors ${
                          gift.type === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{option.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bank/E-Wallet Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <CreditCard className="inline h-4 w-4 mr-1" />
                    {gift.type === 'bank' ? 'Bank Name' : gift.type === 'ewallet' ? 'E-Wallet Provider' : 'Payment Method'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={gift.type === 'bank' ? 'e.g., BCA, Mandiri' : gift.type === 'ewallet' ? 'e.g., GoPay, OVO' : 'e.g., Cash'}
                      value={gift.bank_name}
                      onChange={(e) => updateGift(index, 'bank_name', e.target.value)}
                      list={`${gift.type}-options-${index}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <datalist id={`${gift.type}-options-${index}`}>
                      {(gift.type === 'bank' ? commonBanks : gift.type === 'ewallet' ? commonEWallets : []).map(option => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Account Number/ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {gift.type === 'bank' ? 'Account Number' : gift.type === 'ewallet' ? 'Phone Number/ID' : 'Contact Info'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      gift.type === 'bank' ? 'e.g., 1234567890' : 
                      gift.type === 'ewallet' ? 'e.g., 081234567890' : 
                      'e.g., Phone number or contact'
                    }
                    value={gift.account_number}
                    onChange={(e) => updateGift(index, 'account_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Ahmad Dhani"
                    value={gift.account_name}
                    onChange={(e) => updateGift(index, 'account_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* QR Code Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    QR Code 
                    <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                  </label>
                  {gift.qr_code ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">QR Code uploaded</p>
                        <button
                          type="button"
                          onClick={() => updateGift(index, 'qr_code', '')}
                          className="text-sm text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Upload QR code for {gift.type === 'bank' ? 'mobile banking' : 'e-wallet'} transfers
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleQRCodeUpload(index, file)
                            }
                          }}
                          className="mt-2 text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    QR codes make it easier for guests to transfer gifts
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {gifts.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <CreditCard className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No gift accounts added yet</p>
          <button
            type="button"
            onClick={addGift}
            className="mt-2 text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Add your first gift account
          </button>
        </div>
      )}
    </div>
  )
}
