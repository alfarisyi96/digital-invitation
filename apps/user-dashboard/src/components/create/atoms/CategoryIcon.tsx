import { LucideIcon } from 'lucide-react'

interface CategoryIconProps {
  icon: LucideIcon
  color: string
  size?: 'sm' | 'md' | 'lg'
}

export function CategoryIcon({ icon: Icon, color, size = 'md' }: CategoryIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-6 h-6 sm:w-8 sm:h-8'
  }

  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-12 h-12 sm:w-16 sm:h-16'
  }

  return (
    <div className={`${containerSizes[size]} rounded-full ${color} flex items-center justify-center mx-auto`}>
      <Icon className={sizeClasses[size]} />
    </div>
  )
}
