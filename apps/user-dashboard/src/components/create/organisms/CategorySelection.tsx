import { CategoryCard } from '../molecules/CategoryCard'
import { DevTools } from '../molecules/DevTools'
import { InvitationType } from '@/services/supabaseService'
import { INVITATION_CATEGORIES } from '../constants'

interface CategorySelectionProps {
  selectedCategory: InvitationType | null
  onCategorySelect: (category: InvitationType) => void
  onSuperQuickStart?: () => void
  isEditMode?: boolean
}

export function CategorySelection({ selectedCategory, onCategorySelect, onSuperQuickStart, isEditMode = false }: CategorySelectionProps) {
  const currentCategory = selectedCategory ? INVITATION_CATEGORIES.find(cat => cat.id === selectedCategory) : null

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Update Your Event Category' : 'Choose Your Event Category'}
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          {isEditMode 
            ? 'Change the type of invitation if needed'
            : 'Select the type of invitation you want to create'
          }
        </p>
                
        <DevTools 
          onQuickStartCategory={onCategorySelect}
          onSuperQuickStart={onSuperQuickStart}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INVITATION_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onClick={onCategorySelect}
          />
        ))}
      </div>
    </div>
  )
}
