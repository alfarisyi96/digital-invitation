'use client'

import React from 'react'

interface PublicInvitationViewProps {
  invitation: any
}

export default function PublicInvitationView({ invitation }: PublicInvitationViewProps) {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m0 0V6a2 2 0 012-2h10a2 2 0 012 2v2" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {invitation.title}
        </h1>
        
        <p className="text-gray-600 mb-6">
          Public invitation viewing is coming soon! The creator can preview and manage this invitation from their dashboard.
        </p>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            <strong>Invitation ID:</strong> {invitation.id}<br />
            <strong>Template:</strong> {invitation.templates?.name}<br />
            <strong>Status:</strong> {invitation.status}
          </p>
        </div>
      </div>
    </div>
  )
}
