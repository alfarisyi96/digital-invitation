// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

// Backend entity types
export interface BackendUser {
  id: string;
  email: string;
  name: string;
  reseller_id?: string;
  created_at: string;
  reseller?: Reseller;
  invites?: Invitation[];
}

export interface Reseller {
  id: string;
  user_id: string;
  type: 'FREE' | 'PREMIUM';
  referral_code: string;
  landing_slug?: string;
  custom_domain?: string;
  total_referred: number;
  created_at: string;
  updated_at: string;
  user?: BackendUser;
}

export interface Invitation {
  id: string;
  user_id: string;
  plan_id?: string;
  template_id?: string;
  type: 'WEDDING' | 'BIRTHDAY' | 'PARTY' | 'CORPORATE';
  title: string;
  slug: string;
  is_published: boolean;
  is_featured: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
  user?: BackendUser;
  plan?: Plan;
  template?: Template;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  preview_image?: string;
  category: string;
  metadata?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
  user?: BackendUser;
  plan?: Plan;
}

export interface GuestMessage {
  id: string;
  invite_id: string;
  guest_name: string;
  message: string;
  is_approved: boolean;
  created_at: string;
  invitation?: Invitation;
}

export interface RSVP {
  id: string;
  invite_id: string;
  guest_name: string;
  guest_email?: string;
  status: 'attending' | 'not_attending' | 'maybe';
  plus_ones?: number;
  dietary_requirements?: string;
  created_at: string;
  invitation?: Invitation;
}

// Statistics types
export interface DashboardStats {
  users: {
    total: number;
    new_30d: number;
    active: number;
    with_reseller: number;
  };
  invites: {
    total: number;
    new_30d: number;
    sent: number;
    total_views: number;
    total_confirmations: number;
  };
  orders: {
    total: number;
    new_30d: number;
    total_revenue: number;
    avg_order_value: number;
  };
}

export interface UserStats {
  totalUsers: number;
  totalInvites: number;
  totalResellers: number;
  recentSignups: number;
  planDistribution: Record<string, number>;
  resellerTypeDistribution: Record<string, number>;
}

export interface InviteStats {
  totalInvites: number;
  publishedInvites: number;
  draftInvites: number;
  typeDistribution: Record<string, number>;
  recentInvites: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

// Filter types
export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  reseller_id?: string;
}

export interface ResellerFilters {
  page?: number;
  limit?: number;
  type?: 'FREE' | 'PREMIUM';
  search?: string;
}

export interface InvitationFilters {
  page?: number;
  limit?: number;
  user_id?: string;
  plan_id?: string;
  template_id?: string;
  type?: 'WEDDING' | 'BIRTHDAY' | 'PARTY' | 'CORPORATE';
  is_published?: string; // 'true' | 'false' | undefined for API calls
  search?: string;
}

// Form types
export interface CreateResellerForm {
  user_id: string;
  type: 'FREE' | 'PREMIUM';
  landing_slug?: string;
  custom_domain?: string;
}

export interface UpdateResellerForm {
  type?: 'FREE' | 'PREMIUM';
  landing_slug?: string;
  custom_domain?: string;
}

export interface CreateAdminForm {
  name: string;
  email: string;
  password: string;
}
