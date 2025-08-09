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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
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
  Users,
  Package,
  Star,
  FileText,
  CheckCircle,
  Crown,
  Lock
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
  const { createInvitation, updateInvitation } = useUserInvitations()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<InvitationType | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('basic')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [createdInvitation, setCreatedInvitation] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const { templates, loading: templatesLoading } = usePublicTemplates(selectedCategory || undefined)

  // Filter templates by current package
  const basicTemplates = templates.filter(t => t.package_type === 'basic')
  const goldTemplates = templates.filter(t => t.package_type === 'gold')

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
    if (currentStep === 4) {
      setCurrentStep(3) // Back to template selection
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push('/dashboard')
    }
  }

  const finalizeInvitation = async (template: any) => {
    setIsSubmitting(true)
    try {
      if (createdInvitation) {
        // Update the invitation with the selected template
        await updateInvitation(createdInvitation.id, {
          template_id: template.id
        })
      }
      
      // Show share modal instead of redirecting
      setShowShareModal(true)
    } catch (error) {
      console.error('Error applying template:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpgradePackage = async () => {
    setSelectedPackage('gold')
    setShowUpgradeModal(false)
    
    const template = templates.find(t => t.id === selectedTemplate)
    if (template) {
      await finalizeInvitation(template)
    }
  }

  const handleSaveInvitation = async () => {
    if (!selectedTemplate || !createdInvitation) return

    const template = templates.find(t => t.id === selectedTemplate)
    if (!template) return

    // Check if user needs to upgrade package
    if (template.package_type === 'gold' && selectedPackage === 'basic') {
      setShowUpgradeModal(true)
      return
    }

    // Apply template to invitation
    await finalizeInvitation(template)
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
        setCreatedInvitation(invitation)
        setCurrentStep(3) // Move to template selection
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
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Choose Your Event Category</h2>
              <p className="text-sm sm:text-base text-gray-600">Select the type of invitation you want to create</p>
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
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setCurrentStep(2) // Auto-advance to form
                    }}
                  >
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${category.color} flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">{category.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{category.description}</p>
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
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Wedding Details</h2>
                <p className="text-sm sm:text-base text-gray-600">Tell us about your special day</p>
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

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Choose Your Template</h2>
              <p className="text-sm sm:text-base text-gray-600">Select a beautiful template for your invitation</p>
            </div>

            {/* Package Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
                  <span className="text-sm sm:text-base font-medium text-blue-900">
                    Current Package: {selectedPackage === 'basic' ? 'Basic (Free)' : 'Gold (Premium)'}
                  </span>
                </div>
                {selectedPackage === 'basic' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedPackage('gold')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100 w-full sm:w-auto"
                  >
                    Upgrade to Gold
                  </Button>
                )}
              </div>
            </div>

            {templatesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Templates */}
                {basicTemplates.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-500" />
                      Free Templates
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {basicTemplates.map((template) => (
                        <Card 
                          key={template.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            setSelectedTemplate(template.id)
                            setCurrentStep(4) // Go to preview
                          }}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
                              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                            <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1">{template.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Free
                              </span>
                              {selectedTemplate === template.id && (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gold Templates */}
                {goldTemplates.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-600" />
                      Premium Templates
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {goldTemplates.map((template) => (
                        <Card 
                          key={template.id}
                          className={`cursor-pointer transition-all hover:shadow-md relative ${
                            selectedTemplate === template.id ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''
                          } ${selectedPackage === 'basic' ? 'opacity-75' : ''}`}
                          onClick={() => {
                            setSelectedTemplate(template.id)
                            setCurrentStep(4) // Go to preview
                          }}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="aspect-[3/4] bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
                              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                            </div>
                            <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1">{template.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Premium
                              </span>
                              {selectedTemplate === template.id && (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                              )}
                            </div>
                            {selectedPackage === 'basic' && (
                              <div className="absolute top-2 right-2">
                                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {templates.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No templates available for this category yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case 4:
        if (!selectedTemplate || !createdInvitation) {
          setCurrentStep(3) // Go back to template selection
          return null
        }

        const selectedTemplateData = templates.find(t => t.id === selectedTemplate)
        
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Preview Your Invitation</h2>
              <p className="text-sm sm:text-base text-gray-600">Review your invitation before saving</p>
            </div>

            {/* Template Preview */}
            <Card className="mx-auto max-w-2xl">
              <CardContent className="p-4 sm:p-8">
                <div className="text-center space-y-4">
                  <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                    <div className="text-center space-y-2">
                      <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto" />
                      <p className="text-xs sm:text-sm text-blue-800">Template Preview</p>
                      <p className="text-sm sm:text-base font-semibold text-blue-900">{selectedTemplateData?.name}</p>
                    </div>
                  </div>
                  
                  {/* Invitation Content Preview */}
                  {selectedCategory === 'wedding' && createdInvitation.form_data && (
                    <div className="space-y-4 text-left">
                      <div className="text-center">
                        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
                          {createdInvitation.title}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Bride:</span>
                          <p className="break-words">{createdInvitation.form_data.bride_full_name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Groom:</span>
                          <p className="break-words">{createdInvitation.form_data.groom_full_name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>
                          <p>{createdInvitation.form_data.wedding_date}</p>
                        </div>
                        <div>
                          <span className="font-medium">Venue:</span>
                          <p className="break-words">{createdInvitation.form_data.venue_name}</p>
                        </div>
                      </div>
                      
                      {createdInvitation.form_data.invitation_message && (
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                          <span className="font-medium">Message:</span>
                          <p className="mt-1 text-gray-700 text-sm break-words">{createdInvitation.form_data.invitation_message}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Package Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
                    <div className="flex items-center justify-center">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
                      <span className="text-sm sm:text-base font-medium text-blue-900">
                        Package: {selectedPackage === 'basic' ? 'Basic (Free)' : 'Gold (Premium)'}
                      </span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-xs sm:text-sm text-blue-700">Template: {selectedTemplateData?.name}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <Button variant="ghost" onClick={handleBack} className="flex items-center self-start">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 4 ? 'Choose Template' : 'Back'}
          </Button>
          
          {currentStep === 4 ? (
            <Button 
              onClick={handleSaveInvitation}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              {isSubmitting ? 'Saving...' : 'Save Invitation'}
            </Button>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 order-first sm:order-none">
              <span className={`px-2 py-1 rounded text-xs ${currentStep >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
                1. Category
              </span>
              <span className="hidden sm:inline">→</span>
              <span className={`px-2 py-1 rounded text-xs ${currentStep >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
                2. Details
              </span>
              <span className="hidden sm:inline">→</span>
              <span className={`px-2 py-1 rounded text-xs ${currentStep >= 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
                3. Templates
              </span>
              <span className="hidden sm:inline">→</span>
              <span className={`px-2 py-1 rounded text-xs ${currentStep >= 4 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
                4. Preview
              </span>
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          {renderStepContent()}
        </div>

        {/* Footer Actions */}
        {currentStep === 2 && selectedCategory === 'wedding' && (
          <div className="flex justify-end">
            <Button 
              onClick={() => form.handleSubmit(onSubmit)()}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              {isSubmitting ? 'Creating...' : 'Continue to Templates'}
            </Button>
          </div>
        )}
      </div>

      {/* Package Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
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
                <li>• Premium template designs</li>
                <li>• Advanced customization options</li>
                <li>• Priority support</li>
                <li>• No watermarks</li>
                <li>• Analytics dashboard</li>
              </ul>
            </div>
            
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900">$9.99</span>
              <span className="text-gray-600 ml-1">one-time</span>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUpgradeModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpgradePackage}
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Upgrading...' : 'Upgrade Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Invitation Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Your invitation has been saved and is ready to share.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Your invitation is ready!</h4>
              <p className="text-sm text-green-800">
                You can now share it with your guests or continue editing in your dashboard.
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">{createdInvitation?.title}</h5>
                  <p className="text-sm text-gray-600">
                    {selectedPackage === 'basic' ? 'Basic Package' : 'Gold Package'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Template</p>
                  <p className="font-medium text-gray-900">
                    {templates.find(t => t.id === selectedTemplate)?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowShareModal(false)
                router.push('/dashboard')
              }}
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => {
                // Future: implement sharing functionality
                navigator.clipboard.writeText(`${window.location.origin}/invitation/${createdInvitation?.id}`)
                alert('Invitation link copied to clipboard!')
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
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
              <p className="text-sm text-green-800">{createdInvitation?.title}</p>
              <p className="text-xs text-green-700 mt-1">
                Template: {templates.find(t => t.id === selectedTemplate)?.name}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  // Copy share link to clipboard
                  const shareUrl = `${window.location.origin}/invitation/${createdInvitation?.id}`
                  navigator.clipboard.writeText(shareUrl)
                }}
                className="w-full"
                variant="outline"
              >
                📋 Copy Share Link
              </Button>
              
              <Button 
                onClick={() => {
                  // Share via WhatsApp
                  const shareUrl = `${window.location.origin}/invitation/${createdInvitation?.id}`
                  const message = `You're invited! Check out my invitation: ${shareUrl}`
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                📱 Share via WhatsApp
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowShareModal(false)
                router.push('/dashboard')
              }}
            >
              Done
            </Button>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(CreateInvitationPage)
