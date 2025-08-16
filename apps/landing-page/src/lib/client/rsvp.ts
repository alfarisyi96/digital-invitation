"use client"

export async function submitRSVP(payload: {
  invitation_id: string
  guest_name: string
  attendance_status: 'attending' | 'not_attending' | 'maybe'
  number_of_guests?: number
  turnstile_token: string | null
}) {
  const res = await fetch('/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Failed to submit RSVP')
  return data
}
