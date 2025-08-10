import { Card, CardContent } from '@/components/ui/card'
import { FileText, CheckCircle, Lock } from 'lucide-react'
import { PackageBadge } from '../atoms/PackageBadge'
import { Template } from '@/services/supabaseService'

interface TemplateCardProps {
  template: Template
  isSelected: boolean
  isLocked: boolean
  onClick: (templateId: string) => void
}

export function TemplateCard({ template, isSelected, isLocked, onClick }: TemplateCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md relative ${
        isSelected 
          ? isLocked 
            ? 'ring-2 ring-yellow-500 bg-yellow-50' 
            : 'ring-2 ring-blue-500 bg-blue-50'
          : ''
      } ${isLocked ? 'opacity-75' : ''}`}
      onClick={() => onClick(template.id)}
    >
      <CardContent className="p-3 sm:p-4">
        <div className={`aspect-[3/4] rounded-lg mb-2 sm:mb-3 flex items-center justify-center ${
          template.is_premium 
            ? 'bg-gradient-to-br from-yellow-100 to-yellow-200' 
            : 'bg-gradient-to-br from-gray-100 to-gray-200'
        }`}>
          <FileText className={`w-6 h-6 sm:w-8 sm:h-8 ${
            template.is_premium ? 'text-yellow-600' : 'text-gray-400'
          }`} />
        </div>
        
        <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1">
          {template.name}
        </h4>
        
        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
          {template.description}
        </p>
        
        <div className="flex items-center justify-between">
          <PackageBadge 
            packageType={template.is_premium ? 'gold' : 'basic'}
            isPremium={template.is_premium}
            size="sm"
          />
          
          {isSelected && (
            <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${
              template.is_premium ? 'text-yellow-600' : 'text-blue-600'
            }`} />
          )}
        </div>
        
        {isLocked && (
          <div className="absolute top-2 right-2">
            <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
