import { Button } from '@/components/ui/button'
import { SAMPLE_WEDDING_DATA, isDevelopment } from '../utils/devUtils'
import { UseFormReturn } from 'react-hook-form'
import { InvitationType } from '@/services/supabaseService'

interface DevToolsProps {
  form?: UseFormReturn<any>
  onQuickStartCategory?: (category: InvitationType) => void
  onSuperQuickStart?: () => void
  onAutoFill?: () => void
}

export function DevTools({ form, onQuickStartCategory, onSuperQuickStart, onAutoFill }: DevToolsProps) {
  if (!isDevelopment) return null

  const handleAutoFill = () => {
    if (onAutoFill) {
      onAutoFill()
    }
  }

  return (
    <div className="mt-4 space-x-2 flex flex-wrap gap-2">
      {onQuickStartCategory && (
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={() => onQuickStartCategory('wedding')}
          className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          ⚡ Quick Start Wedding
        </Button>
      )}
      
      {onSuperQuickStart && (
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={onSuperQuickStart}
          className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
        >
          🚀 Super Quick Start (Templates)
        </Button>
      )}
      
      {onAutoFill && (
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={handleAutoFill}
          className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
        >
          🚀 Auto-fill for Testing
        </Button>
      )}
    </div>
  )
}
