import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: string
  user_id: string
  title: string
  description: string | null
  event_date: string | null
  event_location: string | null
  template_id: string | null
  status: 'draft' | 'published' | 'sent'
  created_at: string
  updated_at: string
}

export interface InvitationGuest {
  id: string
  invitation_id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  status: 'pending' | 'confirmed' | 'declined'
  created_at: string
}

export interface Template {
  id: string
  user_id: string | null
  name: string
  description: string | null
  category: string | null
  template_data: any
  is_public: boolean
  created_at: string
  updated_at: string
}

class SupabaseService {
  private supabase = createClient()

  // User Profile Methods
  async getUserProfile(): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }

    return data
  }

  // Invitation Methods (RLS automatically filters to user's data)
  async getUserInvitations(): Promise<Invitation[]> {
    const { data, error } = await this.supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      return []
    }

    return data || []
  }

  async createInvitation(invitation: Omit<Invitation, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Invitation | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      console.error('User not authenticated')
      return null
    }

    const { data, error } = await this.supabase
      .from('invitations')
      .insert({
        ...invitation,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating invitation:', error)
      return null
    }

    return data
  }

  async updateInvitation(id: string, updates: Partial<Invitation>): Promise<Invitation | null> {
    const { data, error } = await this.supabase
      .from('invitations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating invitation:', error)
      return null
    }

    return data
  }

  async deleteInvitation(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('invitations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting invitation:', error)
      return false
    }

    return true
  }

  // Invitation Guests Methods
  async getInvitationGuests(invitationId: string): Promise<InvitationGuest[]> {
    const { data, error } = await this.supabase
      .from('invitation_guests')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitation guests:', error)
      return []
    }

    return data || []
  }

  async addInvitationGuest(guest: Omit<InvitationGuest, 'id' | 'user_id' | 'created_at'>): Promise<InvitationGuest | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      console.error('User not authenticated')
      return null
    }

    const { data, error } = await this.supabase
      .from('invitation_guests')
      .insert({
        ...guest,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding guest:', error)
      return null
    }

    return data
  }

  async updateInvitationGuest(id: string, updates: Partial<InvitationGuest>): Promise<InvitationGuest | null> {
    const { data, error } = await this.supabase
      .from('invitation_guests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating guest:', error)
      return null
    }

    return data
  }

  async deleteInvitationGuest(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('invitation_guests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting guest:', error)
      return false
    }

    return true
  }

  // Template Methods
  async getAvailableTemplates(): Promise<Template[]> {
    // This will return public templates + user's own templates due to RLS
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      return []
    }

    return data || []
  }

  async getUserTemplates(): Promise<Template[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) return []

    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user templates:', error)
      return []
    }

    return data || []
  }

  async createTemplate(template: Omit<Template, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Template | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      console.error('User not authenticated')
      return null
    }

    const { data, error } = await this.supabase
      .from('templates')
      .insert({
        ...template,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      return null
    }

    return data
  }

  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating template:', error)
      return null
    }

    return data
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting template:', error)
      return false
    }

    return true
  }

  // Real-time subscriptions for user data
  subscribeToUserInvitations(callback: (payload: any) => void) {
    return this.supabase
      .channel('user_invitations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invitations',
        },
        callback
      )
      .subscribe()
  }

  subscribeToInvitationGuests(invitationId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`invitation_guests_${invitationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invitation_guests',
          filter: `invitation_id=eq.${invitationId}`,
        },
        callback
      )
      .subscribe()
  }
}

export const supabaseService = new SupabaseService()
