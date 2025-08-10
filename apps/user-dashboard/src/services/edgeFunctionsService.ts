import { createClient } from '@/lib/supabase/client'

export interface PackageStatus {
  package_type: 'basic' | 'gold'
  invitations_created: number
  invitations_limit: number | null
  can_create_more: boolean
  features: string[]
}

export interface PackageLimitsResponse {
  canCreate: boolean
  currentCount: number
  maxAllowed: number | null
  packageType: 'basic' | 'gold'
  message?: string
}

export interface PaymentConfirmation {
  amount: number
  paymentMethod: string
  notes?: string
}

export interface PaymentStatus {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  amount: number
  payment_method: string
  notes?: string
  created_at: string
}

class EdgeFunctionsService {
  private supabase = createClient()
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`
    : 'http://127.0.0.1:54321/functions/v1'

  private async getAuthHeaders() {
    const { data: { session } } = await this.supabase.auth.getSession()
    
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    }
  }

  private async makeRequest(endpoint: string, data: any) {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      })

      // Always try to parse JSON first, as edge functions may return structured errors
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        // If JSON parsing fails, fall back to text
        const errorText = await response.text()
        console.error(`Edge Function ${endpoint} JSON Parse Error:`, parseError)
        throw new Error(`Edge Function Error (${response.status}): ${errorText}`)
      }

      // Handle structured error responses (like 403 with package limit info)
      if (!response.ok) {
        console.error(`Edge Function ${endpoint} Error:`, {
          status: response.status,
          statusText: response.statusText,
          result: result,
          requestData: data
        })
        
        // If we have a structured error response, return it instead of throwing
        if (result && typeof result === 'object') {
          console.log(`Edge Function ${endpoint} Structured Error:`, result)
          return result
        }
        
        throw new Error(`Edge Function Error (${response.status}): ${JSON.stringify(result)}`)
      }

      console.log(`Edge Function ${endpoint} Success:`, result)
      return result
    } catch (error) {
      console.error(`Edge Function ${endpoint} Failed:`, error)
      throw error
    }
  }

  // Package Validation Functions
  async checkPackageLimits(userId?: string): Promise<PackageLimitsResponse> {
    const response = await this.makeRequest('package-validation', {
      action: 'check_limits',
      userId
    })

    // Transform the response to match our interface
    const canCreate = response.data || false
    return {
      canCreate,
      currentCount: 0, // Will need to get this from package status
      maxAllowed: null, // Will need to get this from package status
      packageType: 'basic', // Will need to get this from package status
      message: canCreate ? 'Can create invitation' : 'Package limit reached'
    }
  }

  async incrementUserInvitations(userId?: string): Promise<{ success: boolean; newCount: number }> {
    const response = await this.makeRequest('package-validation', {
      action: 'increment_count',
      userId
    })

    return {
      success: response.success || false,
      newCount: response.data?.new_count || 0
    }
  }

  async getPackageStatus(userId?: string): Promise<PackageStatus> {
    const response = await this.makeRequest('package-validation', {
      action: 'get_package_status',
      userId
    })

    // Transform the response to match our interface
    const data = response.data
    return {
      package_type: data.current_package as 'basic' | 'gold',
      invitations_created: data.used_invites || 0,
      invitations_limit: data.package_definition?.max_invitations || null,
      can_create_more: data.package_definition?.max_invitations 
        ? data.used_invites < data.package_definition.max_invitations 
        : true,
      features: [] // Will be populated from package definition
    }
  }

  async checkTemplateAccess(templateId: string, userId?: string): Promise<{ hasAccess: boolean; reason?: string }> {
    const response = await this.makeRequest('package-validation', {
      action: 'check_template_access',
      templateId,
      userId
    })

    return {
      hasAccess: response.hasAccess || false,
      reason: response.reason
    }
  }

  // Payment Management Functions
  async submitPaymentConfirmation(paymentData: PaymentConfirmation): Promise<{ success: boolean; confirmationId: string }> {
    return this.makeRequest('payment-management', {
      action: 'submit_payment_confirmation',
      ...paymentData
    })
  }

  async getPaymentStatus(): Promise<PaymentStatus[]> {
    return this.makeRequest('payment-management', {
      action: 'get_payment_status'
    })
  }

  async cancelPaymentConfirmation(confirmationId: string): Promise<{ success: boolean }> {
    return this.makeRequest('payment-management', {
      action: 'cancel_payment_request',
      confirmationId
    })
  }

  async getPackageInfo(): Promise<{
    current_package: string
    features: string[]
    upgrade_options: Array<{
      package: string
      price: number
      features: string[]
    }>
  }> {
    return this.makeRequest('payment-management', {
      action: 'get_package_info'
    })
  }

  // Secure Invitation Creation
  async createInvitationWithValidation(invitationData: {
    templateId: string
    invitationData: Record<string, any>
    userId?: string
  }): Promise<{ success: boolean; invitationId?: string; error?: string; data?: any; message?: string }> {
    return this.makeRequest('create-invitation-with-validation', invitationData)
  }

  // Admin Functions (for admin users only)
  async upgradeUserPackage(userId: string, packageType: 'gold'): Promise<{ success: boolean }> {
    return this.makeRequest('admin-package-management', {
      action: 'upgrade_user_package',
      userId,
      packageType
    })
  }

  async approvePayment(confirmationId: string): Promise<{ success: boolean }> {
    return this.makeRequest('admin-package-management', {
      action: 'approve_payment',
      confirmationId
    })
  }

  async getUsersList(): Promise<Array<{
    id: string
    email: string
    package_type: string
    invitations_created: number
    created_at: string
  }>> {
    return this.makeRequest('admin-package-management', {
      action: 'get_user_package_history'
    })
  }
}

export const edgeFunctionsService = new EdgeFunctionsService()
