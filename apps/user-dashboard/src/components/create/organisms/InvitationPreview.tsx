import { Card, CardContent } from '@/components/ui/card'
import { PackageInfo } from '../molecules/PackageInfo'
import { Template, PackageType, WeddingFormData } from '@/services/supabaseService'
import { FileText } from 'lucide-react'

interface InvitationPreviewProps {
  template: Template | undefined
  formData: WeddingFormData | null
  currentPackage: PackageType
  category: string
  onPackageUpgrade: () => void
}

export function InvitationPreview({ 
  template, 
  formData, 
  currentPackage, 
  category,
  onPackageUpgrade 
}: InvitationPreviewProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Preview Your Invitation
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Review your invitation before saving
        </p>
      </div>

      {/* Template Preview */}
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-4 sm:p-8">
          <div className="text-center space-y-4">
            <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <div className="text-center space-y-2">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto" />
                <p className="text-xs sm:text-sm text-blue-800">Template Preview</p>
                <p className="text-sm sm:text-base font-semibold text-blue-900">
                  {template?.name}
                </p>
              </div>
            </div>
            
            {/* Invitation Content Preview */}
            {category === 'wedding' && formData && (
              <div className="space-y-4 text-left">
                <div className="text-center">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
                    {formData.bride_full_name && formData.groom_full_name 
                      ? `${formData.bride_full_name} & ${formData.groom_full_name} Wedding`
                      : 'Wedding Invitation'
                    }
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Bride:</span>
                    <p className="break-words">{formData.bride_full_name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Groom:</span>
                    <p className="break-words">{formData.groom_full_name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <p>{formData.wedding_date}</p>
                  </div>
                  <div>
                    <span className="font-medium">Venue:</span>
                    <p className="break-words">{formData.venue_name}</p>
                  </div>
                </div>
                
                {formData.invitation_message && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <span className="font-medium">Message:</span>
                    <p className="mt-1 text-gray-700 text-sm break-words">
                      {formData.invitation_message}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <PackageInfo 
              currentPackage={currentPackage}
              onUpgrade={onPackageUpgrade}
            />
            
            <div className="text-center mt-2">
              <span className="text-xs sm:text-sm text-blue-700">
                Template: {template?.name}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
