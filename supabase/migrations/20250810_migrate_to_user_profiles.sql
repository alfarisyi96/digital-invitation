-- Migration: Remove users table and enhance user_profiles
-- This follows Supabase best practices by using auth.users as primary and user_profiles for additional data

-- Step 1: Add package management fields to user_profiles if they don't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS current_package VARCHAR(20) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS used_invites INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS package_upgraded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_premium_active BOOLEAN DEFAULT false;

-- Step 2: Migrate any existing data from users to user_profiles
INSERT INTO user_profiles (
    user_id, 
    full_name, 
    phone, 
    current_package, 
    used_invites, 
    package_upgraded_at, 
    package_expires_at, 
    is_premium_active,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.full_name,
    u.phone,
    u.current_package,
    u.used_invites,
    u.package_upgraded_at,
    u.package_expires_at,
    u.is_premium_active,
    u.created_at,
    u.updated_at
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE up.user_id IS NULL; -- Only insert if profile doesn't exist

-- Step 3: Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (
        user_id,
        full_name,
        current_package,
        used_invites,
        is_premium_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        'basic',
        0,
        false,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 5: Update all functions to use user_profiles instead of users

-- Update can_user_create_invitation function
CREATE OR REPLACE FUNCTION can_user_create_invitation(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    package_info RECORD;
BEGIN
    -- Get user package info from user_profiles
    SELECT up.current_package, up.used_invites, up.is_premium_active
    INTO user_record
    FROM user_profiles up 
    WHERE up.user_id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'can_create', false,
            'reason', 'user_not_found',
            'message', 'User profile not found'
        );
    END IF;
    
    -- Get package definition
    SELECT max_invitations, is_unlimited 
    INTO package_info
    FROM package_definitions 
    WHERE package_name = user_record.current_package 
    AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'can_create', false,
            'reason', 'invalid_package',
            'message', 'Invalid user package'
        );
    END IF;
    
    -- Check if user can create more invitations
    IF package_info.is_unlimited OR user_record.used_invites < package_info.max_invitations THEN
        RETURN jsonb_build_object(
            'can_create', true,
            'remaining_invites', CASE 
                WHEN package_info.is_unlimited THEN null 
                ELSE package_info.max_invitations - user_record.used_invites 
            END
        );
    ELSE
        RETURN jsonb_build_object(
            'can_create', false,
            'reason', 'limit_reached',
            'message', 'Package invitation limit reached'
        );
    END IF;
END;
$$;

-- Update increment_user_invitations function
CREATE OR REPLACE FUNCTION increment_user_invitations(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    validation_result JSONB;
BEGIN
    -- Check if user can create invitation
    validation_result := can_user_create_invitation(user_uuid);
    
    IF (validation_result->>'can_create')::boolean = false THEN
        RETURN validation_result;
    END IF;
    
    -- Increment the count in user_profiles
    UPDATE user_profiles 
    SET used_invites = used_invites + 1,
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Invitation count incremented',
        'new_count', (SELECT used_invites FROM user_profiles WHERE user_id = user_uuid)
    );
END;
$$;

-- Update admin_upgrade_user_package function
CREATE OR REPLACE FUNCTION admin_upgrade_user_package(
    user_uuid UUID,
    new_package VARCHAR(20),
    admin_uuid UUID DEFAULT NULL,
    payment_confirmation_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    package_exists BOOLEAN;
    old_package VARCHAR(20);
BEGIN
    -- Validate package exists
    SELECT EXISTS(
        SELECT 1 FROM package_definitions 
        WHERE package_name = new_package AND is_active = true
    ) INTO package_exists;
    
    IF NOT package_exists THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid package name'
        );
    END IF;
    
    -- Get current package from user_profiles
    SELECT current_package INTO old_package FROM user_profiles WHERE user_id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User profile not found'
        );
    END IF;
    
    -- Update user package in user_profiles
    UPDATE user_profiles 
    SET 
        current_package = new_package,
        is_premium_active = CASE WHEN new_package != 'basic' THEN true ELSE false END,
        package_upgraded_at = NOW(),
        package_expires_at = NULL,
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Package upgraded successfully',
        'old_package', old_package,
        'new_package', new_package
    );
END;
$$;

-- Update get_user_accessible_templates function
CREATE OR REPLACE FUNCTION get_user_accessible_templates(user_uuid UUID)
RETURNS TABLE(
    template_id UUID,
    template_name VARCHAR,
    description TEXT,
    category VARCHAR,
    required_package VARCHAR,
    is_premium_only BOOLEAN,
    user_can_access BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_package VARCHAR(20);
BEGIN
    -- Get user's current package from user_profiles
    SELECT current_package INTO user_package 
    FROM user_profiles 
    WHERE user_id = user_uuid;
    
    -- Return templates with access information
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.description,
        t.category,
        t.required_package,
        t.is_premium,
        CASE 
            WHEN t.required_package = 'basic' OR user_package = 'gold' THEN true
            ELSE false
        END as user_can_access
    FROM templates t
    WHERE t.is_active = true
    ORDER BY t.required_package, t.name;
END;
$$;

-- Step 6: Update RLS policies for user_profiles
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Policy for service role to manage all profiles
CREATE POLICY "Service role can manage all profiles" ON user_profiles
    USING (auth.role() = 'service_role');

-- Step 7: Drop the old users table (be careful!)
-- Note: Uncomment this line only after confirming everything works
-- DROP TABLE IF EXISTS users CASCADE;

-- Step 8: Update user_stats view to use user_profiles
DROP VIEW IF EXISTS user_stats;
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) AS total_users,
    COUNT(*) FILTER (WHERE created_at >= (NOW() - INTERVAL '30 days')) AS new_users_30d,
    COUNT(*) FILTER (WHERE is_premium_active = true) AS premium_users,
    COUNT(*) FILTER (WHERE current_package = 'gold') AS gold_users
FROM user_profiles;
