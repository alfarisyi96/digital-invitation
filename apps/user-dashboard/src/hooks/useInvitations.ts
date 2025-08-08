'use client'

import { useState, useEffect } from 'react'
import { Invitation, CreateInvitationForm, InvitationType, InvitationStatus } from '@/types'

// Mock data for development
const mockInvitations: Invitation[] = [
  {
    id: '1',
    title: 'Sarah & John Wedding',
    type: InvitationType.WEDDING,
    status: InvitationStatus.PUBLISHED,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-16',
    shareUrl: 'https://invite.me/sarah-john-wedding',
    analytics: {
      views: 145,
      rsvpResponses: 89,
      shareCount: 23,
      dailyViews: []
    }
  },
  {
    id: '2',
    title: 'Birthday Celebration',
    type: InvitationType.BIRTHDAY,
    status: InvitationStatus.DRAFT,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  }
]

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call
    const loadInvitations = async () => {
      try {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        setInvitations(mockInvitations)
      } catch (err) {
        setError('Failed to load invitations')
      } finally {
        setIsLoading(false)
      }
    }

    loadInvitations()
  }, [])

  const createInvitation = async (data: CreateInvitationForm): Promise<Invitation> => {
    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newInvitation: Invitation = {
        id: Date.now().toString(),
        title: data.title,
        type: data.type,
        status: InvitationStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        planId: data.planId
      }
      
      setInvitations(prev => [newInvitation, ...prev])
      return newInvitation
    } catch (err) {
      setError('Failed to create invitation')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateInvitation = async (id: string, updates: Partial<Invitation>): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === id 
            ? { ...inv, ...updates, updatedAt: new Date().toISOString() }
            : inv
        )
      )
    } catch (err) {
      setError('Failed to update invitation')
      throw err
    }
  }

  const deleteInvitation = async (id: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setInvitations(prev => prev.filter(inv => inv.id !== id))
    } catch (err) {
      setError('Failed to delete invitation')
      throw err
    }
  }

  const duplicateInvitation = async (id: string): Promise<Invitation> => {
    try {
      const original = invitations.find(inv => inv.id === id)
      if (!original) throw new Error('Invitation not found')
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const duplicate: Invitation = {
        ...original,
        id: Date.now().toString(),
        title: `${original.title} (Copy)`,
        status: InvitationStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shareUrl: undefined,
        analytics: undefined
      }
      
      setInvitations(prev => [duplicate, ...prev])
      return duplicate
    } catch (err) {
      setError('Failed to duplicate invitation')
      throw err
    }
  }

  return {
    invitations,
    isLoading,
    error,
    createInvitation,
    updateInvitation,
    deleteInvitation,
    duplicateInvitation,
    clearError: () => setError(null)
  }
}
