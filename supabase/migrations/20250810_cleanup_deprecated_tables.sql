-- Clean up unnecessary tables and structures
-- This removes the old users table and other deprecated elements to avoid confusion

-- Step 1: Drop the old users table completely
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Remove any remaining references to the old users table
-- (The CASCADE should handle most of this, but let's be explicit)

-- Step 3: Clean up any orphaned indexes or constraints
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_reseller_id;
DROP INDEX IF EXISTS idx_users_current_package;
DROP INDEX IF EXISTS idx_users_package_status;

-- Step 4: Verify user_profiles is our primary user data table
-- Make sure it has all required fields and proper constraints
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS current_package VARCHAR(20) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS used_invites INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS package_upgraded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_premium_active BOOLEAN DEFAULT false;

-- Step 5: Ensure user_profiles references auth.users properly
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey,
ADD CONSTRAINT user_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 6: Update any views that might reference the old users table
DROP VIEW IF EXISTS user_stats;
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) AS total_users,
    COUNT(*) FILTER (WHERE created_at >= (NOW() - INTERVAL '30 days')) AS new_users_30d,
    COUNT(*) FILTER (WHERE is_premium_active = true) AS premium_users,
    COUNT(*) FILTER (WHERE current_package = 'gold') AS gold_users
FROM user_profiles;

-- Step 7: Ensure the auth trigger is properly set up
-- This trigger creates user_profiles when auth.users records are created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (
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

-- Recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 8: Ensure proper RLS policies on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;

CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all profiles" ON user_profiles
    USING (auth.role() = 'service_role');

-- Step 9: Update all functions to ensure they use user_profiles
-- (These should already be updated, but let's make sure)

-- Step 10: Clean up any remaining old table references in other objects
-- Check for any remaining dependencies
DO $$ 
DECLARE
    rec RECORD;
BEGIN
    -- This will help identify any remaining references to the old users table
    FOR rec IN 
        SELECT n.nspname as schemaname, c.relname as tablename, a.attname
        FROM pg_attribute a
        JOIN pg_class c ON a.attrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE a.attname LIKE '%user_id%' 
        AND n.nspname = 'public'
        AND c.relname != 'user_profiles'
        AND c.relkind = 'r'
    LOOP
        RAISE NOTICE 'Found user_id column in table: %.%', rec.schemaname, rec.tablename;
    END LOOP;
END $$;
