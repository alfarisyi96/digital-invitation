'use client'

import { PreviewInvitationContainer } from '@/containers/preview/PreviewInvitationContainer'
import { withAuth } from '@/contexts/SupabaseUserContext'

function PreviewInvitationPage() {
  return <PreviewInvitationContainer />
}

export default withAuth(PreviewInvitationPage)
