'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/SupabaseUserContext'
import { supabaseService, type Invitation, type InvitationGuest, type Template, type UserProfile, type InvitationType, type PackageType } from '@/services/supabaseService'

// Hook for user profile with RLS
export function useUserProfile() {
  const { isAuthenticated } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null)
      setLoading(false)
      return
    }

    fetchProfile()
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await supabaseService.getUserProfile()
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setError(null)
      const updated = await supabaseService.updateUserProfile(updates)
      if (updated) {
        setProfile(updated)
      }
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return null
    }
  }

  return { profile, loading, error, updateProfile, refetch: fetchProfile }
}

// Hook for user invitations with RLS
export function useUserInvitations() {
  const { isAuthenticated } = useUser()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setInvitations([])
      setLoading(false)
      return
    }

    fetchInvitations()

    // Subscribe to real-time changes (RLS applies automatically)
    const subscription = supabaseService.subscribeToUserInvitations((payload) => {
      console.log('Invitation change:', payload)
      fetchInvitations() // Refetch on any change
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isAuthenticated])

  const fetchInvitations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await supabaseService.getUserInvitations()
      setInvitations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invitations')
    } finally {
      setLoading(false)
    }
  }

  const createInvitation = async (invitation: {
    title: string
    type: InvitationType
    form_data?: Record<string, any>
    package_type?: PackageType
  }) => {
    try {
      setError(null)
      const created = await supabaseService.createInvitation(invitation)
      if (created) {
        setInvitations(prev => [created, ...prev])
      }
      return created
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invitation')
      return null
    }
  }

  const updateInvitation = async (id: string, updates: Partial<Invitation>) => {
    try {
      setError(null)
      const updated = await supabaseService.updateInvitation(id, updates)
      if (updated) {
        setInvitations(prev => prev.map(inv => inv.id === id ? updated : inv))
      }
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invitation')
      return null
    }
  }

  const deleteInvitation = async (id: string) => {
    try {
      setError(null)
      const success = await supabaseService.deleteInvitation(id)
      if (success) {
        setInvitations(prev => prev.filter(inv => inv.id !== id))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invitation')
      return false
    }
  }

  const publishInvitation = async (id: string) => {
    try {
      setError(null)
      const updated = await supabaseService.publishInvitation(id)
      if (updated) {
        setInvitations(prev => prev.map(inv => inv.id === id ? updated : inv))
      }
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish invitation')
      return null
    }
  }

  const unpublishInvitation = async (id: string) => {
    try {
      setError(null)
      const updated = await supabaseService.unpublishInvitation(id)
      if (updated) {
        setInvitations(prev => prev.map(inv => inv.id === id ? updated : inv))
      }
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish invitation')
      return null
    }
  }

  return {
    invitations,
    loading,
    error,
    createInvitation,
    updateInvitation,
    deleteInvitation,
    publishInvitation,
    unpublishInvitation,
    refetch: fetchInvitations
  }
}

// Hook for invitation guests with RLS
export function useInvitationGuests(invitationId: string | null) {
  const { isAuthenticated } = useUser()
  const [guests, setGuests] = useState<InvitationGuest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !invitationId) {
      setGuests([])
      setLoading(false)
      return
    }

    fetchGuests()

    // Subscribe to real-time changes for this invitation
    const subscription = supabaseService.subscribeToInvitationGuests(invitationId, (payload) => {
      console.log('Guest change:', payload)
      fetchGuests()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isAuthenticated, invitationId])

  const fetchGuests = async () => {
    if (!invitationId) return

    try {
      setLoading(true)
      setError(null)
      const data = await supabaseService.getInvitationGuests(invitationId)
      setGuests(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch guests')
    } finally {
      setLoading(false)
    }
  }

  const addGuest = async (guest: Omit<InvitationGuest, 'id' | 'user_id' | 'created_at'>) => {
    try {
      setError(null)
      const created = await supabaseService.addInvitationGuest(guest)
      if (created) {
        setGuests(prev => [created, ...prev])
      }
      return created
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add guest')
      return null
    }
  }

  const updateGuest = async (id: string, updates: Partial<InvitationGuest>) => {
    try {
      setError(null)
      const updated = await supabaseService.updateInvitationGuest(id, updates)
      if (updated) {
        setGuests(prev => prev.map(guest => guest.id === id ? updated : guest))
      }
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update guest')
      return null
    }
  }

  const deleteGuest = async (id: string) => {
    try {
      setError(null)
      const success = await supabaseService.deleteInvitationGuest(id)
      if (success) {
        setGuests(prev => prev.filter(guest => guest.id !== id))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete guest')
      return false
    }
  }

  return {
    guests,
    loading,
    error,
    addGuest,
    updateGuest,
    deleteGuest,
    refetch: fetchGuests
  }
}

// Hook for templates with RLS
export function useTemplates() {
  const { isAuthenticated } = useUser()
  const [templates, setTemplates] = useState<Template[]>([])
  const [userTemplates, setUserTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setTemplates([])
      setUserTemplates([])
      setLoading(false)
      return
    }

    fetchTemplates()
  }, [isAuthenticated])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch available templates (public + user's own)
      const [allTemplates, userOnly] = await Promise.all([
        supabaseService.getAvailableTemplates(),
        supabaseService.getUserTemplates()
      ])
      
      setTemplates(allTemplates)
      setUserTemplates(userOnly)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = async (template: Omit<Template, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      const created = await supabaseService.createTemplate(template)
      if (created) {
        setTemplates(prev => [created, ...prev])
        setUserTemplates(prev => [created, ...prev])
      }
      return created
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template')
      return null
    }
  }

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      setError(null)
      const updated = await supabaseService.updateTemplate(id, updates)
      if (updated) {
        setTemplates(prev => prev.map(tmpl => tmpl.id === id ? updated : tmpl))
        setUserTemplates(prev => prev.map(tmpl => tmpl.id === id ? updated : tmpl))
      }
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template')
      return null
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      setError(null)
      const success = await supabaseService.deleteTemplate(id)
      if (success) {
        setTemplates(prev => prev.filter(tmpl => tmpl.id !== id))
        setUserTemplates(prev => prev.filter(tmpl => tmpl.id !== id))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template')
      return false
    }
  }

  return {
    templates,      // All available templates (public + user's)
    userTemplates,  // Only user's templates
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates
  }
}

// Hook for public templates with filtering
export function usePublicTemplates(category?: InvitationType, packageType?: PackageType) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [category, packageType])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await supabaseService.getTemplates(category, packageType)
      setTemplates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  return { templates, loading, error, refetch: fetchTemplates }
}

// Hook for single template
export function useTemplate(id?: string) {
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchTemplate()
    }
  }, [id])

  const fetchTemplate = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await supabaseService.getTemplate(id)
      setTemplate(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch template')
    } finally {
      setLoading(false)
    }
  }

  return { template, loading, error, refetch: fetchTemplate }
}
