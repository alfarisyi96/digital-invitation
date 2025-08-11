import React from 'react'
import { useInvitationPreview } from '@/hooks/preview/useInvitationPreview'
import { PreviewLayout } from '@/components/preview/templates/PreviewLayout'
import { InvitationContent } from '@/components/preview/organisms/InvitationContent'

export function PreviewInvitationContainer() {
  const {
    invitation,
    formData,
    loading,
    error,
    handleBack,
    handleEdit,
    handleShare
  } = useInvitationPreview()

  return (
    <PreviewLayout
      invitation={invitation}
      loading={loading}
      error={error}
      onBack={handleBack}
      onEdit={handleEdit}
      onShare={handleShare}
    >
      {invitation && (
        <InvitationContent
          invitation={invitation}
          formData={formData}
        />
      )}
    </PreviewLayout>
  )
}
