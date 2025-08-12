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
    const { action } = await req.json()

    console.log(`[Debug] User ID: ${user.id}, Action: ${action}`)

    let result

    switch (action) {
      case 'check_limits':
        // Check if user can create invitation
        const { data: checkResult, error: checkError } = await supabaseClient
          .rpc('can_user_create_invitation', { user_uuid: user.id })

        if (checkError) throw checkError
        
        result = {
          success: true,
          data: checkResult
        }
        break

      case 'increment_count':
        // Increment user invitation count
        const { data: incrementResult, error: incrementError } = await supabaseClient
          .rpc('increment_user_invitations', { user_uuid: user.id })

        if (incrementError) throw incrementError
        
        result = {
          success: true,
          data: incrementResult
        }
        break

      case 'get_package_status':
        // Get user package status and usage
        const { data: packageStatus, error: packageError } = await supabaseClient
          .from('user_profiles')
          .select(`
            current_package,
            used_invites,
            is_premium_active,
            package_upgraded_at,
            package_expires_at
          `)
          .eq('user_id', user.id)
          .single()

        if (packageError) throw packageError

        // Get package definition
        const { data: packageDef, error: defError } = await supabaseClient
          .from('package_definitions')
          .select('*')
          .eq('package_name', packageStatus.current_package)
          .single()

        if (defError) throw defError

        result = {
          success: true,
          data: {
            ...packageStatus,
            package_definition: packageDef,
            remaining_invites: packageDef.max_invitations 
              ? packageDef.max_invitations - packageStatus.used_invites 
              : null // unlimited
          }
        }
        break

      case 'get_accessible_templates':
        // Get templates user can access based on package
        const { data: templates, error: templatesError } = await supabaseClient
          .rpc('get_user_accessible_templates', { user_uuid: user.id })

        if (templatesError) throw templatesError
        
        result = {
          success: true,
          data: templates
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
