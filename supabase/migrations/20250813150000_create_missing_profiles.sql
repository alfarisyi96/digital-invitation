-- Add a function to manually create missing user profiles for existing auth users
-- This helps with the immediate fix for users who already signed up but don't have profiles

CREATE OR REPLACE FUNCTION create_missing_user_profiles()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  user_record RECORD;
  created_count INTEGER := 0;
  total_users INTEGER := 0;
BEGIN
  -- Count total auth users
  SELECT COUNT(*) INTO total_users FROM auth.users;
  
  -- Loop through auth users who don't have profiles
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE p.user_id IS NULL
  LOOP
    -- Create profile for this user
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
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name', 'Unknown User'),
      'basic',
      0,
      false,
      NOW(),
      NOW()
    );
    
    created_count := created_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'total_auth_users', total_users,
    'created_profiles', created_count,
    'message', format('Created %s missing user profiles', created_count)
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_missing_user_profiles() TO authenticated, service_role;
