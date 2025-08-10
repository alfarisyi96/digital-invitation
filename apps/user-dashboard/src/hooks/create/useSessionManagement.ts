import { useState, useEffect } from 'react'

interface SessionData {
  sessionId: string
  createdInvitationId: string | null
  hasCreatedInvitation: boolean
}

/**
 * Hook for managing browser session state during invitation creation
 * Tracks whether user has already created an invitation in this session
 * Enhanced for global draft persistence (customer end-user workflow)
 */
export function useSessionManagement() {
  const [sessionData, setSessionData] = useState<SessionData>(() => {
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('invitation_session_id')
    if (!sessionId) {
      sessionId = `create_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('invitation_session_id', sessionId)
    }

    // Check if invitation was already created in this session
    const createdInvitationId = sessionStorage.getItem(`created_invitation_${sessionId}`)
    
    return {
      sessionId,
      createdInvitationId,
      hasCreatedInvitation: !!createdInvitationId
    }
  })

  const markInvitationCreated = (invitationId: string) => {
    const newSessionData = {
      ...sessionData,
      createdInvitationId: invitationId,
      hasCreatedInvitation: true
    }
    
    setSessionData(newSessionData)
    sessionStorage.setItem(`created_invitation_${sessionData.sessionId}`, invitationId)
    
    console.log('📍 Session marked invitation created:', {
      sessionId: sessionData.sessionId,
      invitationId
    })
  }

  const clearSession = () => {
    sessionStorage.removeItem('invitation_session_id')
    sessionStorage.removeItem(`created_invitation_${sessionData.sessionId}`)
    
    // Generate new session
    const newSessionId = `create_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('invitation_session_id', newSessionId)
    
    setSessionData({
      sessionId: newSessionId,
      createdInvitationId: null,
      hasCreatedInvitation: false
    })
    
    console.log('🔄 Session cleared, new session:', newSessionId)
  }

  const getSaveAction = () => {
    return sessionData.hasCreatedInvitation ? 'update' : 'create'
  }

  return {
    sessionId: sessionData.sessionId,
    createdInvitationId: sessionData.createdInvitationId,
    hasCreatedInvitation: sessionData.hasCreatedInvitation,
    markInvitationCreated,
    clearSession,
    getSaveAction
  }
}
