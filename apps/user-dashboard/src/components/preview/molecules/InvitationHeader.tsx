import React from 'react'
import { type Invitation } from '@/services/supabaseService'

interface InvitationHeaderProps {
  invitation: Invitation
}

export function InvitationHeader({ invitation }: InvitationHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 text-center">
      <h1 className="text-3xl font-bold mb-4 break-words hyphens-auto">
        {invitation.title}
      </h1>
      {invitation.description && (
        <p className="text-blue-100 text-lg break-words hyphens-auto">
          {invitation.description}
        </p>
      )}
    </div>
  )
}
