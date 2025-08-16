// Security utilities: Turnstile verification and Upstash REST rate limiting

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  reset: number // epoch ms when window resets
}

export async function verifyTurnstile(token: string | null | undefined, ip?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    // If not configured, skip verification (treat as passed)
    return true
  }
  if (!token) return false

  try {
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: ip || undefined
      })
    })

    const data = await resp.json()
    return !!data.success
  } catch (e) {
    console.error('Turnstile verification failed:', e)
    return false
  }
}

// Basic fixed-window rate limiter using Upstash Redis REST API
export async function rateLimit(params: { key: string; limit: number; window: number }): Promise<RateLimitResult> {
  const { key, limit, window } = params
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  // If not configured, allow requests
  if (!url || !token) {
    return { allowed: true, remaining: limit, limit, reset: Date.now() + window * 1000 }
  }

  const redisKey = `rl:${key}`

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pipeline: [
          ['INCR', redisKey],
          ['EXPIRE', redisKey, window, 'NX'],
          ['TTL', redisKey]
        ]
      })
    })

    if (!res.ok) {
      console.error('Upstash rate limit error status:', res.status)
      return { allowed: true, remaining: limit, limit, reset: Date.now() + window * 1000 }
    }

    const results = await res.json()
    // results is an array of reply arrays e.g., [["number",1],["boolean",true],["number",60]]
    const count = Array.isArray(results) && results[0] ? Number(results[0][1] ?? results[0]) : NaN
    const ttl = Array.isArray(results) && results[2] ? Number(results[2][1] ?? results[2]) : window
    const remaining = Math.max(0, limit - (isNaN(count) ? 0 : count))
    const allowed = (isNaN(count) ? true : count <= limit)
    const reset = Date.now() + (isNaN(ttl) ? window : ttl) * 1000

    return { allowed, remaining, limit, reset }
  } catch (e) {
    console.error('Upstash rate limit fetch failed:', e)
    return { allowed: true, remaining: limit, limit, reset: Date.now() + window * 1000 }
  }
}

export function getClientIp(req: Request): string | null {
  // Next.js exposes headers via request.headers
  const xfwd = req.headers.get('x-forwarded-for')
  if (xfwd) return xfwd.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  return realIp || null
}
