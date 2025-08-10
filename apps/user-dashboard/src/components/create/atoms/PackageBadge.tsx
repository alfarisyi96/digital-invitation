interface PackageBadgeProps {
  packageType: 'basic' | 'gold'
  isPremium?: boolean
  size?: 'sm' | 'md'
}

export function PackageBadge({ packageType, isPremium = false, size = 'md' }: PackageBadgeProps) {
  const isBasic = packageType === 'basic' && !isPremium
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'
  
  if (isBasic) {
    return (
      <span className={`bg-green-100 text-green-800 rounded ${sizeClasses}`}>
        Free
      </span>
    )
  }
  
  return (
    <span className={`bg-yellow-100 text-yellow-800 rounded ${sizeClasses}`}>
      Premium
    </span>
  )
}
