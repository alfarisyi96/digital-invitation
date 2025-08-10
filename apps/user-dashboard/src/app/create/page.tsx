'use client'

import { CreateInvitationContainer } from '@/containers/create/CreateInvitationContainer.pure'
import { withAuth } from '@/contexts/SupabaseUserContext'

function CreateInvitationPage() {
  return <CreateInvitationContainer />
}

export default withAuth(CreateInvitationPage)
