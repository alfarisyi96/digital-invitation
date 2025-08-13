-- Fix missing user profiles issue
-- Since we can't create triggers on auth.users in Supabase, we'll:
-- 1. Create a function to handle missing profiles
-- 2. Update the handle_new_user function to be more robust

-- Create function to ensure user profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile(user_id_param UUID, user_email TEXT DEFAULT NULL, user_name TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM user_profiles WHERE user_id = user_id_param) INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Create the missing profile
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
      user_id_param,
      COALESCE(user_email, 'unknown@example.com'),
      COALESCE(user_name, 'Unknown User'),
      'basic',
      0,
      false,
      NOW(),
      NOW()
    );
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'User profile created',
      'user_id', user_id_param
    );
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'message', 'User profile already exists',
      'user_id', user_id_param
    );
  END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION ensure_user_profile(UUID, TEXT, TEXT) TO authenticated;

-- Comment explaining the function
COMMENT ON FUNCTION ensure_user_profile(UUID, TEXT, TEXT) IS 
'Ensures a user profile exists for the given user_id. Creates one if missing. Used to fix missing profiles after auth signup.';
