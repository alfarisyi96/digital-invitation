'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/SupabaseUserContext'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    console.log(isLoading, 'isLoading');
    console.log(isAuthenticated, 'isAuthenticated');
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <span className="text-white text-2xl">💌</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Invitation Builder</h1>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  )
}
