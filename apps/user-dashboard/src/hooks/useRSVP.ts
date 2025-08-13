'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface RSVPData {
  invitationId: string
  guestName: string
  guestEmail?: string
  guestPhone?: string
  attendanceStatus: 'attending' | 'not_attending' | 'maybe'
  numberOfGuests?: number
  dietaryRestrictions?: string
  specialRequests?: string
  message?: string
}

export interface RSVPSettings {
  is_enabled: boolean
  max_guests_per_response: number
  require_email: boolean
  require_phone: boolean
  collect_dietary_restrictions: boolean
  collect_special_requests: boolean
  allow_guest_message: boolean
}

export interface RSVPSummary {
  total_responses: number
  attending: number
  not_attending: number
  maybe: number
  total_guests: number
}

export interface RSVPResponse {
  success: boolean
  data?: {
    responseId: string
    message: string
  }
  error?: string
}

export function useRSVP(invitationId?: string) {
  const [summary, setSummary] = useState<RSVPSummary | null>(null)
  const [settings, setSettings] = useState<RSVPSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch RSVP summary and settings
  const fetchRSVPData = async () => {
    if (!invitationId) return

    try {
      setLoading(true)
      setError(null)

      // Get RSVP summary using RPC function
      const { data: summaryData, error: summaryError } = await supabase.rpc('get_rsvp_summary', {
        invitation_id: invitationId
      })

      if (summaryError) {
        throw new Error(summaryError.message)
      }

      // Get RSVP settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('rsvp_settings')
        .select('*')
        .eq('invite_id', invitationId)
        .single()

      if (settingsError && settingsError.code !== 'PGRST116') { // Not found is OK
        console.error('RSVP settings error:', settingsError)
      }

      setSummary(summaryData)
      setSettings(settingsData || {
        is_enabled: true,
        max_guests_per_response: 4,
        require_email: false,
        require_phone: false,
        collect_dietary_restrictions: true,
        collect_special_requests: true,
        allow_guest_message: true
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RSVP data')
    } finally {
      setLoading(false)
    }
  }

  // Submit RSVP response
  const submitRSVP = async (rsvpData: RSVPData): Promise<RSVPResponse> => {
    try {
      setError(null)

      const {
        invitationId,
        guestName,
        guestEmail,
        guestPhone,
        attendanceStatus,
        numberOfGuests,
        dietaryRestrictions,
        specialRequests,
        message
      } = rsvpData

      // Validate required fields
      if (!invitationId || !guestName || !attendanceStatus) {
        return {
          success: false,
          error: 'Missing required fields'
        }
      }

      // Call the submit_rsvp RPC function
      const { data, error } = await supabase.rpc('submit_rsvp', {
        invitation_id: invitationId,
        guest_name_param: guestName,
        guest_email_param: guestEmail || null,
        guest_phone_param: guestPhone || null,
        attendance_status_param: attendanceStatus,
        number_of_guests_param: numberOfGuests || 1,
        dietary_restrictions_param: dietaryRestrictions || null,
        special_requests_param: specialRequests || null,
        message_param: message || null
      })

      if (error) {
        throw new Error(error.message)
      }

      // Check if the function returned an error
      if (!data.success) {
        return {
          success: false,
          error: data.error
        }
      }

      // Refresh RSVP data if this is the same invitation
      if (invitationId === invitationId) {
        await fetchRSVPData()
      }

      return {
        success: true,
        data: {
          responseId: data.response_id,
          message: data.message
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit RSVP'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // Setup real-time subscription and initial fetch
  useEffect(() => {
    if (!invitationId) return

    fetchRSVPData()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`rsvp_${invitationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rsvp_responses',
          filter: `invite_id=eq.${invitationId}`,
        },
        () => {
          fetchRSVPData()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [invitationId])

  return {
    summary,
    settings,
    loading,
    error,
    submitRSVP,
    refetch: fetchRSVPData
  }
}

// Hook specifically for public RSVP submission (no auth required)
export function usePublicRSVP() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const submitRSVP = async (rsvpData: RSVPData): Promise<RSVPResponse> => {
    try {
      setLoading(true)
      setError(null)

      const {
        invitationId,
        guestName,
        guestEmail,
        guestPhone,
        attendanceStatus,
        numberOfGuests,
        dietaryRestrictions,
        specialRequests,
        message
      } = rsvpData

      // Validate required fields
      if (!invitationId || !guestName || !attendanceStatus) {
        return {
          success: false,
          error: 'Missing required fields'
        }
      }

      // Call the submit_rsvp RPC function
      const { data, error } = await supabase.rpc('submit_rsvp', {
        invitation_id: invitationId,
        guest_name_param: guestName,
        guest_email_param: guestEmail || null,
        guest_phone_param: guestPhone || null,
        attendance_status_param: attendanceStatus,
        number_of_guests_param: numberOfGuests || 1,
        dietary_restrictions_param: dietaryRestrictions || null,
        special_requests_param: specialRequests || null,
        message_param: message || null
      })

      if (error) {
        throw new Error(error.message)
      }

      // Check if the function returned an error
      if (!data.success) {
        return {
          success: false,
          error: data.error
        }
      }

      return {
        success: true,
        data: {
          responseId: data.response_id,
          message: data.message
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit RSVP'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    submitRSVP
  }
}

// Hook for getting RSVP responses (admin view)
export function useRSVPResponses(invitationId?: string) {
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchResponses = async () => {
    if (!invitationId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('rsvp_responses')
        .select('*')
        .eq('invite_id', invitationId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setResponses(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RSVP responses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!invitationId) return

    fetchResponses()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`rsvp_responses_${invitationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rsvp_responses',
          filter: `invite_id=eq.${invitationId}`,
        },
        () => {
          fetchResponses()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [invitationId])

  return {
    responses,
    loading,
    error,
    refetch: fetchResponses
  }
}
