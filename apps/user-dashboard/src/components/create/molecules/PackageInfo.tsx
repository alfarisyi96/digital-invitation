import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PackageType } from '@/services/supabaseService'

interface PackageInfoProps {
  currentPackage: PackageType
  onUpgrade: () => void
}

export function PackageInfo({ currentPackage, onUpgrade }: PackageInfoProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center">
          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
          <span className="text-sm sm:text-base font-medium text-blue-900">
            Current Package: {currentPackage === 'basic' ? 'Basic (Free)' : 'Gold (Premium)'}
          </span>
        </div>
        {currentPackage === 'basic' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onUpgrade}
            className="border-blue-300 text-blue-700 hover:bg-blue-100 w-full sm:w-auto"
          >
            Upgrade to Gold
          </Button>
        )}
      </div>
    </div>
  )
}
