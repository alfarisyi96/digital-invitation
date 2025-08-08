'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { User, AuthState } from '@/types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true }
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false
      }
    case 'LOGIN_ERROR':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false
      }
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true
  })

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
      } catch {
        localStorage.removeItem('user')
        dispatch({ type: 'LOGIN_ERROR' })
      }
    } else {
      dispatch({ type: 'LOGIN_ERROR' })
    }
  }, [])

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=0f172a&color=fff`
      }
      
      localStorage.setItem('user', JSON.stringify(mockUser))
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser })
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR' })
      throw error
    }
  }

  const loginWithGoogle = async () => {
    dispatch({ type: 'LOGIN_START' })
    try {
      // TODO: Replace with actual Google OAuth
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser: User = {
        id: '1',
        email: 'user@gmail.com',
        name: 'John Doe',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0f172a&color=fff'
      }
      
      localStorage.setItem('user', JSON.stringify(mockUser))
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser })
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR' })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData })
    if (state.user) {
      const updatedUser = { ...state.user, ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    loginWithGoogle,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
