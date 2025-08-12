import { Card, CardContent } from '@/components/ui/card'
import { CategoryIcon } from '../atoms/CategoryIcon'
import { InvitationType } from '@/services/supabaseService'
import { LucideIcon } from 'lucide-react'

interface CategoryCardProps {
  category: {
    id: InvitationType
    name: string
    icon: LucideIcon
    description: string
    color: string
  }
  isSelected: boolean
  onClick: (categoryId: InvitationType) => void
}

export function CategoryCard({ category, isSelected, onClick }: CategoryCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg relative ${
        isSelected 
          ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
          : 'hover:border-gray-300'
      }`}
      onClick={() => onClick(category.id)}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
          ✓
        </div>
      )}
      <CardContent className="p-4 sm:p-6 text-center">
        <CategoryIcon 
          icon={category.icon} 
          color={category.color}
          size="md"
        />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words mt-3 sm:mt-4">
          {category.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
          {category.description}
        </p>
      </CardContent>
    </Card>
  )
}
