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

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    let user;
    // For local testing, allow test tokens
    if (token === 'test-token') {
      user = { id: 'test-user-123', email: 'test@example.com' };
    } else {
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token)
      if (authError || !authUser) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      user = authUser;
    }

    // Get request body
    const { 
      action,
      requested_package = 'gold',
      whatsapp_phone,
      whatsapp_message,
      transfer_proof_url,
      bank_account_used,
      transfer_amount,
      transfer_reference
    } = await req.json()

    let result

    switch (action) {
      case 'submit_payment_confirmation':
        // Create payment confirmation request
        const { data: confirmationData, error: confirmationError } = await supabaseClient
          .from('payment_confirmations')
          .insert({
            user_id: user.id,
            requested_package,
            whatsapp_phone,
            whatsapp_message,
            transfer_proof_url,
            bank_account_used,
            transfer_amount,
            transfer_reference,
            status: 'pending'
          })
          .select()
          .single()

        if (confirmationError) throw confirmationError

        result = {
          success: true,
          message: 'Payment confirmation submitted successfully',
          data: confirmationData
        }
        break

      case 'get_payment_status':
        // Get user's payment confirmations
        const { data: payments, error: paymentsError } = await supabaseClient
          .from('payment_confirmations')
          .select(`
            id,
            requested_package,
            status,
            transfer_amount,
            created_at,
            confirmed_at,
            admin_notes,
            expires_at
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (paymentsError) throw paymentsError

        result = {
          success: true,
          data: payments
        }
        break

      case 'cancel_payment_request':
        // Cancel pending payment request
        const { payment_id } = await req.json()
        
        const { data: cancelData, error: cancelError } = await supabaseClient
          .from('payment_confirmations')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', payment_id)
          .eq('user_id', user.id) // Security: user can only cancel their own
          .eq('status', 'pending') // Can only cancel pending requests
          .select()
          .single()

        if (cancelError) throw cancelError

        result = {
          success: true,
          message: 'Payment request cancelled',
          data: cancelData
        }
        break

      case 'get_package_info':
        // Get available packages for upgrade
        const { data: packages, error: packagesError } = await supabaseClient
          .from('package_definitions')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')

        if (packagesError) throw packagesError

        result = {
          success: true,
          data: packages
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
