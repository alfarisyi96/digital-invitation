export interface InvitationData {
  id: string
  title: string
  public_slug: string
  status: 'draft' | 'published' | 'archived'
  last_updated: string
  last_revalidated?: string
  content_version: string
  
  // Wedding details
  bride_full_name: string
  bride_nickname: string
  groom_full_name: string
  groom_nickname: string
  
  // Event details
  ceremony_date: string
  ceremony_time: string
  ceremony_venue: string
  ceremony_address: string
  
  reception_date?: string
  reception_time?: string
  reception_venue?: string
  reception_address?: string
  
  // Premium features
  hero_image?: string
  bride_image?: string
  groom_image?: string
  gallery_photos?: string[]
  
  // Template info
  template: {
    id: string
    name: string
    slug: string
    tier: 'basic' | 'premium'
    component_path?: string
  }
  
  // Settings
  settings: {
    rsvp_enabled: boolean
    comments_enabled: boolean
    gallery_enabled: boolean
  }
}

export interface TemplateProps {
  invitation: InvitationData
  isEditable?: boolean
  className?: string
}

export interface OrnamentConfig {
  cornerFlowers?: string
  borderPattern?: string
  divider?: string
  background?: string
  decorativeElements?: string[]
}

// Template component type
export type TemplateComponent = React.ComponentType<TemplateProps>

// Template metadata for database
export interface TemplateMetadata {
  id: string
  name: string
  slug: string
  tier: 'basic' | 'premium'
  component_path?: string
  features: string[]
  thumbnail_url: string
  ornament_set: string
}
