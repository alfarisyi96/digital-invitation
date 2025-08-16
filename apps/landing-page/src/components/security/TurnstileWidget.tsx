"use client"

import { useEffect, useRef, useState } from 'react'

interface TurnstileWidgetProps {
  siteKey?: string
  onToken: (token: string | null) => void
  theme?: 'light' | 'dark' | 'auto'
  action?: string
  cdata?: string
  className?: string
}

// Minimal Turnstile widget loader; emits token via onToken
export function TurnstileWidget({ siteKey, onToken, theme = 'auto', action, cdata, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  const resolvedSiteKey = siteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!resolvedSiteKey) {
      // If no site key, emit null to allow server to decide policy
      onToken(null)
      return
    }

    // Load script once
    const ensureScript = () => new Promise<void>((resolve) => {
      if ((window as any).turnstile) return resolve()
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      s.async = true
      s.defer = true
      s.onload = () => resolve()
      document.head.appendChild(s)
    })

    let widgetId: any
    let cancelled = false

    ensureScript().then(() => {
      if (cancelled) return
      setReady(true)
      const t = (window as any).turnstile
      if (!t || !containerRef.current) return

      widgetId = t.render(containerRef.current, {
        sitekey: resolvedSiteKey,
        theme,
        action,
        cdata,
        callback: (token: string) => onToken(token),
        'error-callback': () => onToken(null),
        'expired-callback': () => onToken(null)
      })
    })

    return () => {
      cancelled = true
      try {
        const t = (window as any).turnstile
        if (t && widgetId) t.remove(widgetId)
      } catch {}
    }
  }, [resolvedSiteKey, theme, action, cdata, onToken])

  return <div className={className} ref={containerRef} aria-busy={!ready} />
}
