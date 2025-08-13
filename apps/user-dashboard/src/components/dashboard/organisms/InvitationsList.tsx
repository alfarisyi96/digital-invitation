import React from 'react'
import { InvitationCard } from '../molecules/InvitationCard'
import type { Invitation } from '@/services/supabaseService'

interface InvitationsListProps {
  invitations: Invitation[]
  actionLoading: string | null
  onEdit: (id: string, category: string) => void
  onPublish: (id: string) => void
  onUnpublish: (id: string) => void
  onPreview: (slugOrId: string) => void
  onManage: (id: string) => void
  getStatusBadge: (status: string, isPublished: boolean) => string
}

export function InvitationsList({
  invitations,
  actionLoading,
  onEdit,
  onPublish,
  onUnpublish,
  onPreview,
  onManage,
  getStatusBadge
}: InvitationsListProps) {
  if (invitations.length === 0) {
    return (
      <div className="px-4">
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No invitations</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first invitation.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invitations.map((invitation) => (
          <InvitationCard
            key={invitation.id}
            invitation={invitation}
            actionLoading={actionLoading}
            onEdit={onEdit}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            onPreview={onPreview}
            onManage={onManage}
            getStatusBadge={getStatusBadge}
          />
        ))}
      </div>
    </div>
  )
}
