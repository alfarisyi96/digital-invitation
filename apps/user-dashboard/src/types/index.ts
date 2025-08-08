// User Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

// Invitation Types
export interface Invitation {
  id: string
  title: string
  type: InvitationType
  status: InvitationStatus
  createdAt: string
  updatedAt: string
  planId?: string
  templateId?: string
  customization?: InvitationCustomization
  content?: InvitationContent
  shareUrl?: string
  analytics?: InvitationAnalytics
}

export enum InvitationType {
  WEDDING = 'wedding',
  BIRTHDAY = 'birthday',
  ANNIVERSARY = 'anniversary',
  GRADUATION = 'graduation',
  BABY_SHOWER = 'baby_shower',
  BUSINESS = 'business',
  OTHER = 'other'
}

export enum InvitationStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// Plan Types
export interface Plan {
  id: string
  name: string
  price: number
  features: string[]
  limits: PlanLimits
  isPopular?: boolean
}

export interface PlanLimits {
  maxInvitations: number
  maxGuests: number
  customization: boolean
  analytics: boolean
  customDomain: boolean
}

// Template Types
export interface Template {
  id: string
  name: string
  category: InvitationType
  thumbnail: string
  preview: string
  isPremium: boolean
  colors: TemplateColor[]
  fonts: TemplateFont[]
  style: TemplateStyle
  description: string
  features: string[]
  popularity: number
}

export interface TemplateColor {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
}

export interface TemplateFont {
  name: string
  family: string
  weights: string[]
}

export enum TemplateStyle {
  CLASSIC = 'classic',
  MODERN = 'modern',
  ELEGANT = 'elegant',
  RUSTIC = 'rustic',
  FLORAL = 'floral',
  MINIMALIST = 'minimalist',
  VINTAGE = 'vintage',
  ROMANTIC = 'romantic'
}

// Customization Types
export interface InvitationCustomization {
  colors: TemplateColor
  fonts: TemplateFont
  layout: string
  animations: boolean
  music?: string
}

// Content Types
export interface InvitationContent {
  title: string
  subtitle?: string
  date: string
  time: string
  venue: VenueInfo
  hosts: HostInfo[]
  message?: string
  rsvp?: RSVPInfo
  additionalInfo?: AdditionalInfo[]
  weddingDetails?: WeddingDetails
  media?: MediaContent
  timeline?: EventTimeline[]
}

export interface VenueInfo {
  name: string
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface HostInfo {
  name: string
  role: string
  photo?: string
}

export interface RSVPInfo {
  enabled: boolean
  deadline?: string
  options: string[]
  message?: string
}

export interface AdditionalInfo {
  title: string
  content: string
  icon?: string
}

// Wedding Specific Types
export interface WeddingDetails {
  groomName: string
  brideName: string
  groomParents?: string[]
  brideParents?: string[]
  story?: string
  hashtag?: string
  dresscode?: string
  giftRegistry?: GiftRegistry
}

export interface GiftRegistry {
  enabled: boolean
  bankAccount?: BankAccount
  wishlistUrl?: string
  message?: string
}

export interface BankAccount {
  bankName: string
  accountNumber: string
  accountName: string
}

// Media Types
export interface MediaContent {
  heroImage?: string
  gallery?: PhotoGallery
  backgroundMusic?: BackgroundMusic
  videos?: VideoContent[]
}

export interface PhotoGallery {
  photos: Photo[]
  layout: GalleryLayout
}

export interface Photo {
  id: string
  url: string
  caption?: string
  order: number
  isHero?: boolean
}

export enum GalleryLayout {
  GRID = 'grid',
  CAROUSEL = 'carousel',
  MASONRY = 'masonry',
  SLIDESHOW = 'slideshow'
}

export interface BackgroundMusic {
  enabled: boolean
  url?: string
  title?: string
  artist?: string
  autoplay: boolean
  loop: boolean
  volume: number
}

export interface VideoContent {
  id: string
  url: string
  title?: string
  thumbnail?: string
  order: number
}

// Timeline Types
export interface EventTimeline {
  id: string
  time: string
  title: string
  description?: string
  location?: string
  icon?: string
  order: number
}

// Analytics Types
export interface InvitationAnalytics {
  views: number
  rsvpResponses: number
  shareCount: number
  dailyViews: DailyView[]
}

export interface DailyView {
  date: string
  views: number
}

// Form Types
export interface CreateInvitationForm {
  title: string
  type: InvitationType
  planId?: string
}

export interface InvitationDetailsForm extends InvitationContent {
  // Additional form-specific fields
}

// UI Types
export interface MobileNavigationItem {
  id: string
  title: string
  icon: string
  href: string
  badge?: number
}

export interface StepIndicator {
  step: number
  title: string
  completed: boolean
  active: boolean
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Error Types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

// Auth Types
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface GoogleAuthResponse {
  user: User
  token: string
}
