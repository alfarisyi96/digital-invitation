import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  is_active: boolean
  reseller_id: string | null
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: string
  user_id: string
  title: string
  description?: string
  template_id: string | null
  category_id: string | null
  event_date: string | null
  location?: string
  custom_data?: Record<string, any>
  status: 'draft' | 'sent' | 'viewed' | 'confirmed' | 'published' | 'unpublished'
  views_count?: number
  public_slug: string | null
  unique_visitors: number
  is_published: boolean
  require_approval: boolean
  rsvp_count: number
  confirmed_count: number
  created_at: string
  updated_at: string
}

export type InvitationType = 'wedding' | 'birthday' | 'graduation' | 'baby_shower' | 'business' | 'anniversary' | 'party'
export type InvitationStatus = 'draft' | 'published' | 'unpublished'
export type PackageType = 'basic' | 'gold'

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
  name: string
  description: string | null
  thumbnail_url: string | null
  template_data: Record<string, any>
  category: string | null
  is_premium: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TemplateStyle = 'classic' | 'modern' | 'elegant' | 'floral' | 'minimalist' | 'rustic' | 'vintage' | 'tropical'

// Wedding-specific form data structure
export interface WeddingFormData {
  // Essential couple info
  bride_full_name: string
  bride_nickname?: string
  groom_full_name: string
  groom_nickname?: string
  
  // Family info
  bride_father?: string
  bride_mother?: string
  groom_father?: string
  groom_mother?: string
  
  // Event details
  wedding_date: string
  ceremony_time?: string
  reception_time?: string
  venue_name: string
  venue_address?: string
  venue_hall?: string
  google_maps_link?: string
  
  // Content
  invitation_message?: string
  opening_verse?: string
  quranic_verse?: string
  
  // Social media
  bride_instagram?: string
  groom_instagram?: string
  
  // Love story (optional)
  love_story?: Array<{
    period: string
    title: string
    content: string
  }>
  
  // Media
  couple_photos?: string[]
  gallery_photos?: string[]
  
  // Gift registry
  gift_enabled?: boolean
  gift_details?: string
  bank_info?: {
    bank_name: string
    account_number: string
    account_name: string
  }
}

// Package feature definitions
export const PACKAGE_FEATURES = {
  basic: ['basic_display', 'simple_sharing', 'basic_customization'],
  gold: ['basic_display', 'simple_sharing', 'basic_customization', 'rsvp_form', 'comment_system', 'gallery', 'custom_colors', 'love_story']
} as const

class SupabaseService {
  private supabase = createClient()

  // User Profile Methods
  async getUserProfile(): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('users')
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
      .from('users')
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
      .from('invites')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      return []
    }

    return data || []
  }

  async createInvitation(invitation: {
    title: string
    type: InvitationType
    form_data?: Record<string, any>
    package_type?: PackageType
  }): Promise<Invitation | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      console.error('User not authenticated')
      return null
    }

    // Generate unique slug using database function
    const slugResult = await this.supabase
      .rpc('generate_unique_slug', { base_title: invitation.title })
    
    if (slugResult.error) {
      console.error('Error generating unique slug:', slugResult.error)
      return null
    }

    // Extract invitation details from form_data
    const formData = invitation.form_data || {}
    
    const invitationData = {
      title: invitation.title,
      description: formData.description || '',
      template_id: formData.template_id || null,
      category_id: formData.category_id || null,
      user_id: user.id,
      event_date: formData.event_date ? new Date(formData.event_date).toISOString() : null,
      location: formData.location || '',
      custom_data: formData,
      status: 'draft' as const,
      public_slug: slugResult.data,
      unique_visitors: 0,
      require_approval: false,
      views_count: 0,
      rsvp_count: 0,
      confirmed_count: 0,
      is_published: false
    }

    const { data, error } = await this.supabase
      .from('invites')
      .insert(invitationData)
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
      .from('invites')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating invitation:', error)
      return null
    }

    return data
  }

  // New Invitation Management Methods
  async publishInvitation(id: string): Promise<Invitation | null> {
    const { data, error } = await this.supabase
      .from('invites')
      .update({
        status: 'published',
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error publishing invitation:', error)
      return null
    }

    return data
  }

  async unpublishInvitation(id: string): Promise<Invitation | null> {
    const { data, error } = await this.supabase
      .from('invites')
      .update({
        status: 'unpublished',
        is_published: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error unpublishing invitation:', error)
      return null
    }

    return data
  }

  async getInvitationBySlug(slug: string): Promise<Invitation | null> {
    const { data, error } = await this.supabase
      .from('invites')
      .select('*')
      .eq('public_slug', slug)
      .eq('is_published', true)
      .single()

    if (error) {
      console.error('Error fetching invitation by slug:', error)
      return null
    }

    return data
  }

  async incrementInvitationVisitor(slug: string, visitorId: string): Promise<boolean> {
    try {
      // Call the database function to handle visitor tracking
      const { error } = await this.supabase
        .rpc('track_invitation_visitor', {
          invitation_slug: slug,
          visitor_id: visitorId
        })

      if (error) {
        console.error('Error tracking visitor:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error incrementing visitor:', error)
      return false
    }
  }

  async getInvitationAnalytics(id: string): Promise<{ unique_visitors: number } | null> {
    const { data, error } = await this.supabase
      .from('invites')
      .select('unique_visitors')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching invitation analytics:', error)
      return null
    }

    return { unique_visitors: data.unique_visitors || 0 }
  }

  async deleteInvitation(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('invites')
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

  // Template Methods
  async getTemplates(category?: InvitationType, packageType?: PackageType): Promise<Template[]> {
    let query = this.supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    // Note: package_type filtering removed since it doesn't exist in database
    // Will use is_premium instead
    if (packageType === 'basic') {
      query = query.eq('is_premium', false)
    } else if (packageType === 'gold') {
      query = query.eq('is_premium', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching templates:', error)
      return []
    }

    return data || []
  }

  async getTemplate(id: string): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching template:', error)
      return null
    }

    return data
  }
}

export const supabaseService = new SupabaseService()
