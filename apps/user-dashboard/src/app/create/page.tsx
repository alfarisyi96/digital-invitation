'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useUserInvitations, usePublicTemplates } from '@/hooks/useSupabaseData'
import { InvitationType, PackageType, WeddingFormData } from '@/services/supabaseService'
import { withAuth } from '@/contexts/SupabaseUserContext'
import { 
  ArrowLeft, 
  Heart, 
  Cake, 
  GraduationCap, 
  Baby, 
  Briefcase, 
  Calendar,
  Users
} from 'lucide-react'

// Wedding form validation schema
const weddingFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  bride_full_name: z.string().min(1, 'Bride name is required'),
  bride_nickname: z.string().optional(),
  groom_full_name: z.string().min(1, 'Groom name is required'),
  groom_nickname: z.string().optional(),
  wedding_date: z.string().min(1, 'Wedding date is required'),
  ceremony_time: z.string().optional(),
  reception_time: z.string().optional(),
  venue_name: z.string().min(1, 'Venue name is required'),
  venue_address: z.string().optional(),
  invitation_message: z.string().optional(),
  bride_father: z.string().optional(),
  bride_mother: z.string().optional(),
  groom_father: z.string().optional(),
  groom_mother: z.string().optional(),
})

type WeddingFormValues = z.infer<typeof weddingFormSchema>

// Category definitions
const categories = [
  {
    id: 'wedding' as InvitationType,
    name: 'Wedding',
    icon: Heart,
    description: 'Wedding invitations and ceremonies',
    color: 'bg-rose-50 text-rose-600 border-rose-200'
  },
  {
    id: 'birthday' as InvitationType,
    name: 'Birthday',
    icon: Cake,
    description: 'Birthday party invitations',
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200'
  },
  {
    id: 'graduation' as InvitationType,
    name: 'Graduation',
    icon: GraduationCap,
    description: 'Graduation ceremony invitations',
    color: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    id: 'baby_shower' as InvitationType,
    name: 'Baby Shower',
    icon: Baby,
    description: 'Baby shower invitations',
    color: 'bg-pink-50 text-pink-600 border-pink-200'
  },
  {
    id: 'business' as InvitationType,
    name: 'Business',
    icon: Briefcase,
    description: 'Corporate and business events',
    color: 'bg-gray-50 text-gray-600 border-gray-200'
  }
]

function CreateInvitationPage() {
  const router = useRouter()
  const { createInvitation } = useUserInvitations()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<InvitationType | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { templates, loading: templatesLoading } = usePublicTemplates(selectedCategory || undefined, selectedPackage)

  const form = useForm<WeddingFormValues>({
    resolver: zodResolver(weddingFormSchema),
    defaultValues: {
      title: '',
      bride_full_name: '',
      bride_nickname: '',
      groom_full_name: '',
      groom_nickname: '',
      wedding_date: '',
      ceremony_time: '',
      reception_time: '',
      venue_name: '',
      venue_address: '',
      invitation_message: '',
      bride_father: '',
      bride_mother: '',
      groom_father: '',
      groom_mother: '',
    }
  })

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push('/dashboard')
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && selectedCategory) {
      setCurrentStep(2)
    } else if (currentStep === 2 && selectedCategory === 'wedding') {
      form.handleSubmit(onSubmit)()
    }
  }

  const onSubmit = async (data: WeddingFormValues) => {
    if (!selectedCategory) return

    setIsSubmitting(true)
    
    try {
      const formData: WeddingFormData = {
        bride_full_name: data.bride_full_name,
        bride_nickname: data.bride_nickname,
        groom_full_name: data.groom_full_name,
        groom_nickname: data.groom_nickname,
        wedding_date: data.wedding_date,
        ceremony_time: data.ceremony_time,
        reception_time: data.reception_time,
        venue_name: data.venue_name,
        venue_address: data.venue_address,
        invitation_message: data.invitation_message,
        bride_father: data.bride_father,
        bride_mother: data.bride_mother,
        groom_father: data.groom_father,
        groom_mother: data.groom_mother,
      }

      const invitation = await createInvitation({
        title: data.title,
        type: selectedCategory,
        form_data: formData,
        package_type: selectedPackage
      })

      if (invitation) {
        router.push(`/dashboard`)
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Event Category</h2>
              <p className="text-gray-600">Select the type of invitation you want to create</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Card 
                    key={category.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedCategory === category.id 
                        ? 'ring-2 ring-blue-500 border-blue-500' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 2:
        if (selectedCategory === 'wedding') {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Wedding Details</h2>
                <p className="text-gray-600">Tell us about your special day</p>
              </div>

              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-rose-500" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Invitation Title</Label>
                      <Input 
                        id="title"
                        placeholder="e.g., Sarah & John Wedding"
                        {...form.register('title')}
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bride_full_name">Bride Full Name</Label>
                        <Input 
                          id="bride_full_name"
                          placeholder="e.g., Sarah Elizabeth Johnson"
                          {...form.register('bride_full_name')}
                        />
                        {form.formState.errors.bride_full_name && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.bride_full_name.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="bride_nickname">Bride Nickname (Optional)</Label>
                        <Input 
                          id="bride_nickname"
                          placeholder="e.g., Sarah"
                          {...form.register('bride_nickname')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="groom_full_name">Groom Full Name</Label>
                        <Input 
                          id="groom_full_name"
                          placeholder="e.g., John Michael Smith"
                          {...form.register('groom_full_name')}
                        />
                        {form.formState.errors.groom_full_name && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.groom_full_name.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="groom_nickname">Groom Nickname (Optional)</Label>
                        <Input 
                          id="groom_nickname"
                          placeholder="e.g., John"
                          {...form.register('groom_nickname')}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Event Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      Event Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="wedding_date">Wedding Date</Label>
                        <Input 
                          id="wedding_date"
                          type="date"
                          {...form.register('wedding_date')}
                        />
                        {form.formState.errors.wedding_date && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.wedding_date.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="ceremony_time">Ceremony Time (Optional)</Label>
                        <Input 
                          id="ceremony_time"
                          type="time"
                          {...form.register('ceremony_time')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reception_time">Reception Time (Optional)</Label>
                        <Input 
                          id="reception_time"
                          type="time"
                          {...form.register('reception_time')}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="venue_name">Venue Name</Label>
                      <Input 
                        id="venue_name"
                        placeholder="e.g., Grand Ballroom Hotel"
                        {...form.register('venue_name')}
                      />
                      {form.formState.errors.venue_name && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.venue_name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="venue_address">Venue Address (Optional)</Label>
                      <Input 
                        id="venue_address"
                        placeholder="e.g., 123 Main Street, City, State"
                        {...form.register('venue_address')}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Family Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-purple-500" />
                      Family Information (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bride_father">Bride's Father</Label>
                        <Input 
                          id="bride_father"
                          placeholder="e.g., Mr. Robert Johnson"
                          {...form.register('bride_father')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bride_mother">Bride's Mother</Label>
                        <Input 
                          id="bride_mother"
                          placeholder="e.g., Mrs. Mary Johnson"
                          {...form.register('bride_mother')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="groom_father">Groom's Father</Label>
                        <Input 
                          id="groom_father"
                          placeholder="e.g., Mr. David Smith"
                          {...form.register('groom_father')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="groom_mother">Groom's Mother</Label>
                        <Input 
                          id="groom_mother"
                          placeholder="e.g., Mrs. Lisa Smith"
                          {...form.register('groom_mother')}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Message */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-red-500" />
                      Personal Message (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="invitation_message">Invitation Message</Label>
                      <Textarea 
                        id="invitation_message"
                        placeholder="Write a personal message for your guests..."
                        rows={4}
                        {...form.register('invitation_message')}
                      />
                    </div>
                  </CardContent>
                </Card>
              </form>
            </div>
          )
        }
        break

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={handleBack} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className={`px-2 py-1 rounded ${currentStep >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
              1. Category
            </span>
            <span>→</span>
            <span className={`px-2 py-1 rounded ${currentStep >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
              2. Details
            </span>
            <span>→</span>
            <span className={`px-2 py-1 rounded ${currentStep >= 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
              3. Templates
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <div />
          <div className="space-x-4">
            {currentStep === 1 && (
              <Button 
                onClick={handleNext}
                disabled={!selectedCategory}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue
              </Button>
            )}
            {currentStep === 2 && selectedCategory === 'wedding' && (
              <Button 
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Creating...' : 'Create Invitation'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(CreateInvitationPage)
