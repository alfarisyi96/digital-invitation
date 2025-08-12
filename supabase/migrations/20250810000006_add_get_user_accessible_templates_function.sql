-- Add function to get user accessible templates based on their package level
-- This function uses a hierarchical level system where higher packages can access lower-tier templates
-- Package hierarchy: basic (level 1) -> gold (level 2) -> platinum (level 3), etc.

-- Drop function if it exists to allow recreation
DROP FUNCTION IF EXISTS public.get_user_accessible_templates(UUID);

CREATE OR REPLACE FUNCTION public.get_user_accessible_templates(user_uuid UUID)
RETURNS TABLE (
    template_id UUID,
    template_name CHARACTER VARYING(100),
    template_description TEXT,
    required_package CHARACTER VARYING(20),
    package_tier INTEGER,
    user_current_package CHARACTER VARYING(20),
    user_package_level INTEGER,
    template_required_level INTEGER,
    user_can_access BOOLEAN,
    template_data JSONB,
    thumbnail_url CHARACTER VARYING(500),
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_package CHARACTER VARYING(20);
    user_premium_active BOOLEAN;
    user_level INTEGER;
BEGIN
    -- Get user's current package and premium status
    SELECT 
        COALESCE(up.current_package, 'basic'),
        COALESCE(up.is_premium_active, false)
    INTO 
        user_package,
        user_premium_active
    FROM public.user_profiles up
    WHERE up.user_id = user_uuid;
    
    -- If user not found, default to basic package
    IF user_package IS NULL THEN
        user_package := 'basic';
        user_premium_active := false;
    END IF;

    -- Determine user's package level (higher number = higher tier)
    user_level := CASE 
        WHEN user_package = 'basic' THEN 1
        WHEN user_package = 'gold' OR user_premium_active = true THEN 2
        WHEN user_package = 'platinum' THEN 3
        WHEN user_package = 'enterprise' THEN 4
        ELSE 1 -- Default to basic level
    END;

    -- Return all templates with hierarchical access information
    RETURN QUERY
    SELECT 
        t.id as template_id,
        t.name as template_name,
        t.description as template_description,
        t.required_package,
        t.package_tier,
        user_package as user_current_package,
        user_level as user_package_level,
        -- Template required level based on package tier or explicit mapping
        CASE 
            WHEN t.required_package = 'basic' THEN 1
            WHEN t.required_package = 'gold' THEN 2
            WHEN t.required_package = 'platinum' THEN 3
            WHEN t.required_package = 'enterprise' THEN 4
            ELSE COALESCE(t.package_tier, 1) -- Fallback to package_tier or basic
        END as template_required_level,
        -- User can access if their level is >= template required level
        (user_level >= CASE 
            WHEN t.required_package = 'basic' THEN 1
            WHEN t.required_package = 'gold' THEN 2
            WHEN t.required_package = 'platinum' THEN 3
            WHEN t.required_package = 'enterprise' THEN 4
            ELSE COALESCE(t.package_tier, 1)
        END) as user_can_access,
        t.template_data,
        t.thumbnail_url,
        t.is_active
    FROM public.templates t
    WHERE t.is_active = true
    ORDER BY 
        -- Sort by required level first, then by name
        CASE 
            WHEN t.required_package = 'basic' THEN 1
            WHEN t.required_package = 'gold' THEN 2
            WHEN t.required_package = 'platinum' THEN 3
            WHEN t.required_package = 'enterprise' THEN 4
            ELSE COALESCE(t.package_tier, 1)
        END ASC, 
        t.name ASC;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_accessible_templates(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_accessible_templates(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_accessible_templates(UUID) TO anon;

-- Add comment
COMMENT ON FUNCTION public.get_user_accessible_templates(UUID) IS 
'Returns all templates with hierarchical accessibility based on user package level. Higher-tier packages can access all lower-tier templates. Package hierarchy: basic(1) -> gold(2) -> platinum(3) -> enterprise(4). Used by edge functions for template access validation.';
