import { TemplateCard } from '../molecules/TemplateCard'
import { PackageInfo } from '../molecules/PackageInfo'
import { PackageGate } from '../molecules/PackageGate'
import { LoadingSpinner } from '../atoms/LoadingSpinner'
import { Template, PackageType } from '@/services/supabaseService'
import { Star, Crown, FileText, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TemplateSelectionProps {
  templates: Template[]
  selectedTemplate: string | null
  currentPackage: PackageType
  loading: boolean
  onTemplateSelect: (templateId: string) => void
  onPackageUpgrade: () => void
}

export function TemplateSelection({ 
  templates, 
  selectedTemplate, 
  currentPackage, 
  loading,
  onTemplateSelect,
  onPackageUpgrade 
}: TemplateSelectionProps) {
  const basicTemplates = templates.filter(t => !t.is_premium)
  const goldTemplates = templates.filter(t => t.is_premium)

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Choose Your Template
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Select a beautiful template for your invitation
        </p>
      </div>

      <PackageInfo 
        currentPackage={currentPackage}
        onUpgrade={onPackageUpgrade}
      />

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
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  isLocked={false}
                  onClick={onTemplateSelect}
                />
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
              {currentPackage === 'basic' && (
                <Badge variant="outline" className="ml-2 text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Requires Gold
                </Badge>
              )}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {goldTemplates.map((template) => (
                <div key={template.id} className="relative">
                  <TemplateCard
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    isLocked={false} // Allow selection but show visual indicators
                    onClick={onTemplateSelect}
                  />
                  {currentPackage === 'basic' && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="default" className="text-xs bg-yellow-500 shadow-md">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {currentPackage === 'basic' && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Crown className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Premium templates selected
                      </p>
                      <p className="text-xs text-yellow-600">
                        Upgrade to Gold to create invitations with premium templates
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={onPackageUpgrade}
                    size="sm"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    Upgrade Now
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {templates.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No templates available for this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
