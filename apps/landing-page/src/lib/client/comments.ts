"use client"

export async function submitComment(payload: {
  invitation_id: string
  guest_name: string
  message: string
  turnstile_token: string | null
}) {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Failed to submit comment')
  return data
}
