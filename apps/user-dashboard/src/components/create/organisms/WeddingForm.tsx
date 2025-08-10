import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '../molecules/FormField'
import { DevTools } from '../molecules/DevTools'
import { Heart, Calendar, Users } from 'lucide-react'

interface WeddingFormValues {
  title: string
  bride_full_name: string
  bride_nickname?: string
  groom_full_name: string
  groom_nickname?: string
  wedding_date: string
  ceremony_time?: string
  reception_time?: string
  venue_name: string
  venue_address?: string
  invitation_message?: string
  bride_father?: string
  bride_mother?: string
  groom_father?: string
  groom_mother?: string
}

interface WeddingFormProps {
  form: UseFormReturn<WeddingFormValues>
  onAutoFill?: () => void
}

export function WeddingForm({ form, onAutoFill }: WeddingFormProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Wedding Details</h2>
        <p className="text-sm sm:text-base text-gray-600">Tell us about your special day</p>
        
        <DevTools form={form} onAutoFill={onAutoFill} />
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2 text-rose-500" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="title"
            label="Invitation Title"
            placeholder="e.g., Sarah & John Wedding"
            form={form}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="bride_full_name"
              label="Bride Full Name"
              placeholder="e.g., Sarah Elizabeth Johnson"
              required
              form={form}
            />
            <FormField
              id="bride_nickname"
              label="Bride Nickname (Optional)"
              placeholder="e.g., Sarah"
              form={form}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="groom_full_name"
              label="Groom Full Name"
              placeholder="e.g., John Michael Smith"
              required
              form={form}
            />
            <FormField
              id="groom_nickname"
              label="Groom Nickname (Optional)"
              placeholder="e.g., John"
              form={form}
            />
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
            <FormField
              id="wedding_date"
              label="Wedding Date"
              type="date"
              required
              form={form}
            />
            <FormField
              id="ceremony_time"
              label="Ceremony Time (Optional)"
              type="time"
              form={form}
            />
            <FormField
              id="reception_time"
              label="Reception Time (Optional)"
              type="time"
              form={form}
            />
          </div>

          <FormField
            id="venue_name"
            label="Venue Name"
            placeholder="e.g., Grand Ballroom Hotel"
            required
            form={form}
          />

          <FormField
            id="venue_address"
            label="Venue Address (Optional)"
            placeholder="e.g., 123 Main Street, City, State"
            form={form}
          />
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
            <FormField
              id="bride_father"
              label="Bride's Father"
              placeholder="e.g., Mr. Robert Johnson"
              form={form}
            />
            <FormField
              id="bride_mother"
              label="Bride's Mother"
              placeholder="e.g., Mrs. Mary Johnson"
              form={form}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="groom_father"
              label="Groom's Father"
              placeholder="e.g., Mr. David Smith"
              form={form}
            />
            <FormField
              id="groom_mother"
              label="Groom's Mother"
              placeholder="e.g., Mrs. Lisa Smith"
              form={form}
            />
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
            <label htmlFor="invitation_message" className="block text-sm font-medium text-gray-700 mb-2">
              Invitation Message
            </label>
            <Textarea 
              id="invitation_message"
              placeholder="Write a personal message for your guests..."
              rows={4}
              {...form.register('invitation_message')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
