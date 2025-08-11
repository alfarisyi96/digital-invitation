import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface WelcomeSectionProps {
  userName: string
  onCreateInvitation: () => void
}

export function WelcomeSection({ userName, onCreateInvitation }: WelcomeSectionProps) {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 break-words hyphens-auto">
            Welcome back, {userName}! 
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Create beautiful invitations for your special events
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={onCreateInvitation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Invitation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
