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

    // Get invitation data from request
    const requestBody = await req.json()
    console.log('Received request body:', JSON.stringify(requestBody, null, 2))
    
    const { 
      templateId,
      invitationData,
      userId
    } = requestBody

    // Extract individual fields from invitationData for backward compatibility
    const {
      title,
      type,
      wedding_date: event_date,
      venue_name: venue,
      venue_address: location,
      ...custom_data
    } = invitationData || {}

    console.log('Extracted fields:', {
      title,
      type,
      event_date,
      venue,
      location,
      custom_data_keys: Object.keys(custom_data)
    })

    // Step 1: Ensure user profile exists - create if missing
    const { data: existingProfile, error: profileCheckError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      // User profile doesn't exist, create it
      console.log('Creating missing user profile for:', user.id)
      
      const { error: createProfileError } = await supabaseClient
        .from('user_profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          current_package: 'basic',
          used_invites: 0,
          is_premium_active: false
        })

      if (createProfileError) {
        console.error('Failed to create user profile:', createProfileError)
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to create user profile',
            details: createProfileError
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else if (profileCheckError) {
      throw profileCheckError
    }

    // Step 2: Check if user can create invitation (package limits)
    const { data: limitCheck, error: limitError } = await supabaseClient
      .rpc('can_user_create_invitation', { user_uuid: user.id })

    if (limitError) throw limitError

    if (!limitCheck.can_create) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Package limit exceeded',
          details: limitCheck
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Validate template access (package permissions)
    const { data: templates, error: templateError } = await supabaseClient
      .rpc('get_user_accessible_templates', { user_uuid: user.id })

    if (templateError) throw templateError

    // Debug logging
    console.log('Template validation:', {
      user_id: user.id,
      requested_template_id: templateId,
      total_templates: templates?.length || 0,
      accessible_templates: templates?.filter((t: any) => t.user_can_access).length || 0,
      accessible_template_ids: templates?.filter((t: any) => t.user_can_access).map((t: any) => t.template_id) || []
    });

    const accessibleTemplate = templates.find((t: any) => t.template_id === templateId && t.user_can_access)
    
    if (!accessibleTemplate) {
      console.log('Template access denied:', {
        templateId,
        available_templates: templates?.map((t: any) => ({ id: t.template_id, name: t.template_name, accessible: t.user_can_access })) || []
      });
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Template not accessible with current package',
          debug: {
            requested_template_id: templateId,
            accessible_template_ids: templates?.filter((t: any) => t.user_can_access).map((t: any) => t.template_id) || []
          }
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 4: Create the invitation
    const { data: newInvitation, error: createError } = await supabaseClient
      .from('invites')
      .insert({
        user_id: user.id,
        template_id: templateId,
        title,
        event_date: event_date ? new Date(event_date).toISOString() : null,
        venue,
        location,
        custom_data,
        status: 'draft'
      })
      .select()
      .single()

    if (createError) throw createError

    // Step 5: Increment user invitation count
    const { data: incrementResult, error: incrementError } = await supabaseClient
      .rpc('increment_user_invitations', { user_uuid: user.id })

    if (incrementError) {
      // If increment fails, rollback the invitation creation
      await supabaseClient
        .from('invites')
        .delete()
        .eq('id', newInvitation.id)
      
      throw incrementError
    }

    // Step 6: Reset package to "basic" after successful premium invitation creation
    // This implements Model 1: One-time purchase per invitation
    const { data: resetResult, error: resetError } = await supabaseClient
      .rpc('reset_user_package_to_basic', { user_uuid: user.id })

    if (resetError) {
      console.error('Warning: Failed to reset package to basic:', resetError)
      // Don't fail the entire operation if package reset fails
      // The invitation was created successfully
    }

    console.log('Package reset result:', resetResult)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Invitation created successfully',
        data: {
          invitation: newInvitation,
          usage_update: incrementResult,
          package_reset: resetResult || { message: 'Package reset failed but invitation created' }
        }
      }),
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
