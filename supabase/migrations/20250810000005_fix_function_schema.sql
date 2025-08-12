-- Fix handle_new_user function schema qualification
-- This ensures the function can properly access the user_profiles table from auth context

-- Recreate the function with explicit schema qualification
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        user_id,
        email,
        full_name,
        avatar_url,
        current_package,
        used_invites,
        is_premium_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        'basic',
        0,
        false,
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant proper permissions for auth service to execute this function
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticator;
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'handle_new_user function updated with explicit schema qualification';
    RAISE NOTICE 'Auth service should now be able to create user profiles on OAuth signup';
END $$;
