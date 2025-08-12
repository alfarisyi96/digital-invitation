-- Fix authentication trigger after users table cleanup
-- This migration ensures the trigger is on the correct auth.users table

-- Note: The users table was already dropped in a previous migration
-- So we only need to ensure the trigger is on auth.users

-- Ensure the trigger is dropped from auth.users first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on the correct auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'Auth trigger fixed: now properly attached to auth.users table';
    RAISE NOTICE 'New OAuth users will automatically get user_profiles entries';
END $$;
