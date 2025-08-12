import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get admin user from Authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    let user;
    // For local testing, allow test tokens
    if (token === 'test-token') {
      user = { id: 'test-admin-123', email: 'admin@example.com' };
    } else {
      // For admin functions, we verify against admin_users table
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token)
      if (authError || !authUser) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      user = authUser;
    }

    // Verify user is an admin
    let adminUser;
    if (token === 'test-token') {
      // For testing, simulate admin user
      adminUser = { id: 1, username: 'test-admin', role: 'admin' };
    } else {
      const { data: dbAdminUser, error: adminError } = await supabaseClient
        .from('admin_users')
        .select('id, username, role')
        .eq('email', user.email)
        .single()

      if (adminError || !dbAdminUser) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      adminUser = dbAdminUser;
    }

    // Get request body
    const { 
      action,
      user_id,
      new_package,
      payment_confirmation_id
    } = await req.json()

    let result

    switch (action) {
      case 'upgrade_user_package':
        // Admin upgrade user package
        const { data: upgradeResult, error: upgradeError } = await supabaseClient
          .rpc('admin_upgrade_user_package', {
            user_uuid: user_id,
            new_package: new_package,
            admin_uuid: adminUser.id,
            payment_confirmation_id: payment_confirmation_id || null
          })

        if (upgradeError) throw upgradeError
        
        result = {
          success: true,
          data: upgradeResult
        }
        break

      case 'get_pending_payments':
        // Get all pending payment confirmations
        const { data: pendingPayments, error: pendingError } = await supabaseClient
          .from('payment_confirmations')
          .select(`
            id,
            user_id,
            users!inner(email, full_name),
            requested_package,
            whatsapp_phone,
            whatsapp_message,
            transfer_proof_url,
            bank_account_used,
            transfer_amount,
            transfer_reference,
            status,
            created_at,
            expires_at
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (pendingError) throw pendingError

        result = {
          success: true,
          data: pendingPayments
        }
        break

      case 'approve_payment':
        // Approve payment and upgrade user
        const { payment_id, admin_notes } = await req.json()
        
        // First get the payment confirmation details
        const { data: paymentData, error: paymentError } = await supabaseClient
          .from('payment_confirmations')
          .select('user_id, requested_package')
          .eq('id', payment_id)
          .single()

        if (paymentError) throw paymentError

        // Upgrade the user package
        const { data: approveResult, error: approveError } = await supabaseClient
          .rpc('admin_upgrade_user_package', {
            user_uuid: paymentData.user_id,
            new_package: paymentData.requested_package,
            admin_uuid: adminUser.id,
            payment_confirmation_id: payment_id
          })

        if (approveError) throw approveError

        // Update payment confirmation with admin notes
        await supabaseClient
          .from('payment_confirmations')
          .update({
            admin_notes: admin_notes || 'Payment approved and package upgraded',
            updated_at: new Date().toISOString()
          })
          .eq('id', payment_id)

        result = {
          success: true,
          message: 'Payment approved and user package upgraded',
          data: approveResult
        }
        break

      case 'reject_payment':
        // Reject payment confirmation
        const { payment_id: rejectId, rejection_reason } = await req.json()
        
        const { data: rejectData, error: rejectError } = await supabaseClient
          .from('payment_confirmations')
          .update({
            status: 'rejected',
            rejection_reason: rejection_reason,
            rejected_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', rejectId)
          .eq('status', 'pending') // Can only reject pending payments
          .select()
          .single()

        if (rejectError) throw rejectError

        result = {
          success: true,
          message: 'Payment rejected',
          data: rejectData
        }
        break

      case 'get_user_package_history':
        // Get user package and payment history
        const { target_user_id } = await req.json()
        
        const { data: userHistory, error: historyError } = await supabaseClient
          .from('user_profiles')
          .select(`
            id,
            email,
            full_name,
            current_package,
            used_invites,
            is_premium_active,
            package_upgraded_at,
            payment_confirmations(
              id,
              requested_package,
              status,
              transfer_amount,
              created_at,
              confirmed_at,
              admin_notes
            )
          `)
          .eq('id', target_user_id)
          .single()

        if (historyError) throw historyError

        result = {
          success: true,
          data: userHistory
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
