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
  type: InvitationType
  status: InvitationStatus
  
  // Dynamic form data (JSON structure varies by type)
  form_data: Record<string, any>
  
  // Common extracted fields for easier querying
  event_date: string | null
  venue_name: string | null
  venue_address: string | null
  
  // Template and package information
  template_id: string | null
  template_customization: Record<string, any> | null
  package_type: PackageType
  
  // Publishing and sharing
  slug: string | null
  is_published: boolean
  published_at: string | null
  expires_at: string | null
  
  // Settings
  rsvp_enabled: boolean
  rsvp_deadline: string | null
  guest_can_invite_others: boolean
  require_approval: boolean
  
  // Analytics
  view_count: number
  unique_view_count: number
  rsvp_count: number
  confirmed_count: number
  
  // SEO and sharing
  meta_title: string | null
  meta_description: string | null
  og_image_url: string | null
  
  created_at: string
  updated_at: string
}

export type InvitationType = 'wedding' | 'birthday' | 'graduation' | 'baby_shower' | 'business' | 'anniversary' | 'party'
export type InvitationStatus = 'draft' | 'published' | 'archived' | 'expired'
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
  preview_url: string | null
  
  // Template categorization
  category: InvitationType
  style: TemplateStyle
  
  // Template data and configuration
  template_data: Record<string, any>
  default_config: Record<string, any> | null
  supported_fields: string[] | null
  
  // Pricing and availability
  is_premium: boolean
  package_type: PackageType
  price: number
  
  // Popularity and metrics
  popularity_score: number
  usage_count: number
  
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

    const invitationData = {
      user_id: user.id,
      title: invitation.title,
      type: invitation.type,
      form_data: invitation.form_data || {},
      package_type: invitation.package_type || 'basic',
      status: 'draft' as InvitationStatus,
      rsvp_enabled: false,
      guest_can_invite_others: false,
      require_approval: false,
      view_count: 0,
      unique_view_count: 0,
      rsvp_count: 0,
      confirmed_count: 0,
      is_published: false
    }

    const { data, error } = await this.supabase
      .from('invitations')
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
      .from('invitations')
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

  // Template Methods
  async getTemplates(category?: InvitationType, packageType?: PackageType): Promise<Template[]> {
    let query = this.supabase
      .from('templates')
      .select('*')
      .order('popularity_score', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (packageType) {
      query = query.eq('package_type', packageType)
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

  // Utility Methods
  hasFeature(invitation: Invitation, feature: string): boolean {
    const features = PACKAGE_FEATURES[invitation.package_type] || []
    return features.includes(feature as any)
  }

  async upgradeInvitationPackage(id: string, newPackage: PackageType): Promise<Invitation | null> {
    return this.updateInvitation(id, { package_type: newPackage })
  }
}

export const supabaseService = new SupabaseService()
