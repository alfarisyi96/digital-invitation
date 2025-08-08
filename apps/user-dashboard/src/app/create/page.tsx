'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useInvitations } from '@/hooks/useInvitations'
import { InvitationType, Plan } from '@/types'
import { 
  ArrowLeft, 
  Heart, 
  Cake, 
  GraduationCap, 
  Baby, 
  Briefcase, 
  Calendar,
  Check,
  Star,
  Crown,
  Zap
} from 'lucide-react'

// Mock plans data
const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '1 invitation',
      'Basic templates',
      'Up to 50 guests',
      'Standard analytics'
    ],
    limits: {
      maxInvitations: 1,
      maxGuests: 50,
      customization: false,
      analytics: false,
      customDomain: false
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    features: [
      'Unlimited invitations',
      'Premium templates',
      'Unlimited guests',
      'Advanced customization',
      'Detailed analytics',
      'Custom domain'
    ],
    limits: {
      maxInvitations: -1,
      maxGuests: -1,
      customization: true,
      analytics: true,
      customDomain: true
    },
    isPopular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 19.99,
    features: [
      'Everything in Premium',
      'White label solution',
      'Priority support',
      'API access',
      'Team collaboration'
    ],
    limits: {
      maxInvitations: -1,
      maxGuests: -1,
      customization: true,
      analytics: true,
      customDomain: true
    }
  }
]

const invitationTypes = [
  {
    type: InvitationType.WEDDING,
    title: 'Wedding',
    description: 'Celebrate your special day',
    icon: Heart,
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50'
  },
  {
    type: InvitationType.BIRTHDAY,
    title: 'Birthday',
    description: 'Make birthdays memorable',
    icon: Cake,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50'
  },
  {
    type: InvitationType.GRADUATION,
    title: 'Graduation',
    description: 'Celebrate achievements',
    icon: GraduationCap,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50'
  },
  {
    type: InvitationType.BABY_SHOWER,
    title: 'Baby Shower',
    description: 'Welcome new arrivals',
    icon: Baby,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50'
  },
  {
    type: InvitationType.BUSINESS,
    title: 'Business Event',
    description: 'Professional gatherings',
    icon: Briefcase,
    color: 'from-gray-500 to-slate-500',
    bgColor: 'bg-gray-50'
  },
  {
    type: InvitationType.OTHER,
    title: 'Other',
    description: 'Custom celebrations',
    icon: Calendar,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50'
  }
]

export default function CreateInvitationPage() {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [selectedType, setSelectedType] = useState<InvitationType | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { createInvitation } = useInvitations()

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else router.back()
  }

  const handleCreate = async () => {
    if (!title || !selectedType) return
    
    setIsCreating(true)
    try {
      const invitation = await createInvitation({
        title,
        type: selectedType,
        planId: selectedPlan || undefined
      })
      router.push(`/create/${invitation.id}/details`)
    } catch (error) {
      console.error('Failed to create invitation:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return title.trim().length > 0
      case 2: return selectedType !== null
      case 3: return selectedPlan !== null
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Create Invitation
            </h1>
            <div className="w-9 h-9" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNumber === step 
                  ? 'bg-rose-500 text-white' 
                  : stepNumber < step 
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {stepNumber < step ? <Check className="w-4 h-4" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  stepNumber < step ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">
            Step {step} of 3: {
              step === 1 ? 'Basic Info' : 
              step === 2 ? 'Event Type' : 
              'Choose Plan'
            }
          </p>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">What's your event?</h2>
              <p className="text-gray-600">Give your invitation a memorable title</p>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Sarah & John's Wedding"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 text-base"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500">
                    This will be displayed prominently on your invitation
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Examples:</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  "Sarah & John's Wedding",
                  "Emma's 25th Birthday Bash",
                  "Baby Shower for Alex",
                  "Annual Company Retreat"
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setTitle(example)}
                    className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors"
                  >
                    <span className="text-gray-700">{example}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Event Type */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">What type of event?</h2>
              <p className="text-gray-600">Choose the category that best fits your celebration</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {invitationTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedType === type.type
                
                return (
                  <button
                    key={type.type}
                    onClick={() => setSelectedType(type.type)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-rose-500 bg-rose-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${type.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-gray-900">{type.title}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Choose Plan */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Choose your plan</h2>
              <p className="text-gray-600">Select the features that work best for your event</p>
            </div>

            <div className="space-y-4">
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id
                
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-rose-500 bg-rose-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${plan.isPopular ? 'relative' : ''}`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Most Popular</span>
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                          {plan.id === 'premium' && <Star className="w-5 h-5 text-yellow-500" />}
                          {plan.id === 'business' && <Zap className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div className="mt-1">
                          <span className="text-3xl font-bold text-gray-900">
                            ${plan.price}
                          </span>
                          {plan.price > 0 && <span className="text-gray-500">/month</span>}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-6 h-6 text-rose-500" />
                      )}
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="mt-8 pb-20">
          <Button
            onClick={step === 3 ? handleCreate : handleNext}
            disabled={!canProceed() || isCreating}
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50"
          >
            {isCreating 
              ? 'Creating...' 
              : step === 3 
                ? 'Create Invitation' 
                : 'Continue'
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
