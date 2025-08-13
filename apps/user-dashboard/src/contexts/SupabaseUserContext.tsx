'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const transformUser = (supabaseUser: SupabaseUser): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email || 'User',
    avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture
  })

  const ensureUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Ensuring user profile for:', supabaseUser.id)
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile check timeout')), 10000)
      )
      
      const profilePromise = supabase.rpc('ensure_user_profile', {
        user_id_param: supabaseUser.id,
        user_email: supabaseUser.email,
        user_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name
      })

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any

      if (error) {
        console.warn('Failed to ensure user profile:', error)
      } else {
        console.log('User profile check result:', data)
      }
    } catch (error) {
      console.warn('Error checking user profile:', error)
      // Don't throw the error, just log it so auth flow continues
    }
  }

  const checkAuth = useCallback(async () => {
    try {
      console.log('Checking auth...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth check error:', error)
        setUser(null)
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      if (session?.user) {
        console.log('Session found, ensuring user profile...')
        // Ensure user profile exists before setting user state
        await ensureUserProfile(session.user)
        
        const transformedUser = transformUser(session.user)
        setUser(transformedUser)
        setIsAuthenticated(true)
      } else {
        console.log('No session found')
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      console.log('Auth check complete, setting loading to false')
      setIsLoading(false)
    }
  }, [supabase.auth])

  useEffect(() => {
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, !!session?.user)
      
      if (session?.user) {
        // Ensure user profile exists for any auth state change
        await ensureUserProfile(session.user)
        
        const transformedUser = transformUser(session.user)
        setUser(transformedUser)
        setIsAuthenticated(true)
        
        // Redirect to dashboard on successful login
        if (event === 'SIGNED_IN') {
          router.push('/dashboard')
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
        
        // Redirect to login on logout
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
      
      // Always set loading to false after handling auth state change
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [checkAuth, router, supabase.auth])

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/dashboard`
        }
      })

      if (error) {
        console.error('Google sign-in error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Google sign-in failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Sign-in failed' }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign-out error:', error)
      }
      // The onAuthStateChange listener will handle the redirect
    } catch (error) {
      console.error('Sign-out failed:', error)
    }
  }

  console.log(isAuthenticated, 'isAuthenticated');

  const value = {
    user,
    isLoading,
    isAuthenticated,
    signInWithGoogle,
    signOut
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// HOC for protecting routes
export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
      console.log(isAuthenticated, 'isAuthenticated');
      console.log(isLoading, 'isLoading');

      if (!isLoading && !isAuthenticated) {
        router.replace('/login')
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}
