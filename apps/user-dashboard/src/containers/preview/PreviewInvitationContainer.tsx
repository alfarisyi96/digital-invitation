import React from 'react'
import { useInvitationPreview } from '@/hooks/preview/useInvitationPreview'
import { PreviewLayout } from '@/components/preview/templates/PreviewLayout'
import { InvitationContent } from '@/components/preview/organisms/InvitationContent'
import { ShareModal } from '@/components/dashboard/ShareModal'

export function PreviewInvitationContainer() {
  const {
    invitation,
    formData,
    loading,
    error,
    showShareModal,
    shareInvitationData,
    handleBack,
    handleEdit,
    handleShare,
    setShowShareModal
  } = useInvitationPreview()

  return (
    <>
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

      {shareInvitationData && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          invitation={shareInvitationData}
        />
      )}
    </>
  )
}
