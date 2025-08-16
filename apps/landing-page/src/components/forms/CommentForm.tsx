"use client"

import { useState } from 'react'
import { TurnstileWidget } from '../security/TurnstileWidget'
import { submitComment } from '@/lib/client/comments'

export function CommentForm({ invitationId }: { invitationId: string }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const res = await submitComment({
        invitation_id: invitationId,
        guest_name: name,
        message,
        turnstile_token: token
      })
      setSuccess(res?.message || 'Submitted')
      setMessage('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Your name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <textarea
        className="border rounded px-3 py-2 w-full"
        placeholder="Your message"
        value={message}
        onChange={e => setMessage(e.target.value)}
        required
      />
      <TurnstileWidget onToken={setToken} className="my-2" />
      <button
        type="submit"
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Submitting…' : 'Submit'}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
    </form>
  )
}
