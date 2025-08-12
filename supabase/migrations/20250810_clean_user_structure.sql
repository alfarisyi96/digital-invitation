-- Simple clean migration to fix user table structure
-- This removes conflicts and sets up proper user_profiles structure

-- Drop conflicting indexes and constraints first
DROP INDEX IF EXISTS idx_templates_user_id;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_reseller_id;

-- Remove conflicting foreign keys
ALTER TABLE IF EXISTS invites DROP CONSTRAINT IF EXISTS invites_user_id_fkey;
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE IF EXISTS templates DROP CONSTRAINT IF EXISTS templates_user_id_fkey;

-- Drop conflicting tables
DROP TABLE IF EXISTS users CASCADE;

-- Ensure user_profiles has all required fields
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS current_package VARCHAR(20) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS used_invites INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS package_upgraded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_premium_active BOOLEAN DEFAULT false;

-- Add user_id to templates if it doesn't exist
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix invites table to reference auth.users
ALTER TABLE invites 
ALTER COLUMN user_id TYPE UUID,
ADD CONSTRAINT invites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_invites_user_id ON invites(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Create user registration trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (
        user_id,
        email,
        full_name,
        current_package,
        used_invites,
        is_premium_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        'basic',
        0,
        false,
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;

CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all profiles" ON user_profiles
    USING (auth.role() = 'service_role');
