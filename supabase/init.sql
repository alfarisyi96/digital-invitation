

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."invite_status" AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE "public"."invite_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_upgrade_user_package"("user_uuid" "uuid", "new_package" character varying, "admin_uuid" "uuid", "payment_confirmation_id" "uuid" DEFAULT NULL::"uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    package_exists BOOLEAN;
    old_package VARCHAR(20);
BEGIN
    -- Verify package exists
    SELECT EXISTS(SELECT 1 FROM package_definitions WHERE package_name = new_package)
    INTO package_exists;
    
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
            'error', 'User not found'
        );
    END IF;
    
    -- Update user package in user_profiles
    UPDATE user_profiles 
    SET 
        current_package = new_package,
        is_premium_active = CASE WHEN new_package != 'basic' THEN true ELSE false END,
        package_upgraded_at = NOW(),
        package_expires_at = NULL, -- For now, no expiry. Can be added later
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    -- If payment confirmation provided, mark it as confirmed
    IF payment_confirmation_id IS NOT NULL THEN
        UPDATE payment_confirmations
        SET 
            status = 'confirmed',
            confirmed_by = admin_uuid,
            confirmed_at = NOW(),
            admin_notes = 'Package upgraded by admin',
            updated_at = NOW()
        WHERE id = payment_confirmation_id AND user_id = user_uuid;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'User package upgraded successfully',
        'old_package', old_package,
        'new_package', new_package,
        'upgraded_at', NOW()
    );
END;
$$;


ALTER FUNCTION "public"."admin_upgrade_user_package"("user_uuid" "uuid", "new_package" character varying, "admin_uuid" "uuid", "payment_confirmation_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_user_create_invitation"("user_uuid" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_record RECORD;
    package_info RECORD;
    result JSONB;
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
            'message', 'User not found'
        );
    END IF;
    
    -- Get package limits
    SELECT pd.max_invitations
    INTO package_info
    FROM package_definitions pd
    WHERE pd.package_name = user_record.current_package;
    
    -- Check limits
    IF package_info.max_invitations IS NULL THEN
        -- Unlimited package
        RETURN jsonb_build_object(
            'can_create', true,
            'reason', 'unlimited',
            'used_invites', user_record.used_invites,
            'package', user_record.current_package
        );
    ELSIF user_record.used_invites >= package_info.max_invitations THEN
        -- Limit exceeded
        RETURN jsonb_build_object(
            'can_create', false,
            'reason', 'limit_exceeded',
            'message', 'Package invitation limit exceeded',
            'used_invites', user_record.used_invites,
            'max_invites', package_info.max_invitations,
            'package', user_record.current_package
        );
    ELSE
        -- Can create
        RETURN jsonb_build_object(
            'can_create', true,
            'reason', 'within_limits',
            'used_invites', user_record.used_invites,
            'max_invites', package_info.max_invitations,
            'remaining', package_info.max_invitations - user_record.used_invites,
            'package', user_record.current_package
        );
    END IF;
END;
$$;


ALTER FUNCTION "public"."can_user_create_invitation"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_missing_user_profiles"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."create_missing_user_profiles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_user_profile"("user_id_param" "uuid", "user_email" "text" DEFAULT NULL::"text", "user_name" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."ensure_user_profile"("user_id_param" "uuid", "user_email" "text", "user_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."ensure_user_profile"("user_id_param" "uuid", "user_email" "text", "user_name" "text") IS 'Ensures a user profile exists for the given user_id. Creates one if missing. Used to fix missing profiles after auth signup.';



CREATE OR REPLACE FUNCTION "public"."generate_referral_code"("length" integer DEFAULT 8) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
    is_unique BOOLEAN := FALSE;
BEGIN
    WHILE NOT is_unique LOOP
        result := '';
        FOR i IN 1..length LOOP
            result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
        END LOOP;
        
        -- Check if the code is unique
        SELECT NOT EXISTS(SELECT 1 FROM resellers WHERE referral_code = result) INTO is_unique;
    END LOOP;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."generate_referral_code"("length" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_unique_slug"("base_title" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
    is_unique BOOLEAN := FALSE;
BEGIN
    WHILE NOT is_unique LOOP
        result := '';
        FOR i IN 1..4 LOOP
            result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
        END LOOP;
        
        -- Check if the slug is unique
        SELECT NOT EXISTS(SELECT 1 FROM invites WHERE public_slug = result) INTO is_unique;
    END LOOP;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."generate_unique_slug"("base_title" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_unique_slug"("base_title" "text") IS 'Generates a unique 4-character alphanumeric slug. The base_title parameter is kept for backward compatibility but not used in generation.';



CREATE OR REPLACE FUNCTION "public"."get_dashboard_stats"() RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'users', (SELECT json_build_object(
            'total', COALESCE((SELECT total_users FROM user_stats), 0),
            'new_30d', COALESCE((SELECT new_users_30d FROM user_stats), 0),
            'active', COALESCE((SELECT active_users FROM user_stats), 0),
            'with_reseller', COALESCE((SELECT reseller_users FROM user_stats), 0)
        )),
        'invites', (SELECT json_build_object(
            'total', COALESCE((SELECT total_invites FROM invite_stats), 0),
            'new_30d', COALESCE((SELECT new_invites_30d FROM invite_stats), 0),
            'sent', COALESCE((SELECT sent_invites FROM invite_stats), 0),
            'total_views', COALESCE((SELECT total_views FROM invite_stats), 0),
            'total_confirmations', COALESCE((SELECT total_confirmations FROM invite_stats), 0)
        )),
        'orders', (SELECT json_build_object(
            'total', COALESCE((SELECT total_orders FROM order_stats), 0),
            'new_30d', COALESCE((SELECT new_orders_30d FROM order_stats), 0),
            'total_revenue', COALESCE((SELECT total_revenue FROM order_stats), 0),
            'avg_order_value', COALESCE((SELECT average_order_value FROM order_stats), 0)
        ))
    ) INTO result;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_dashboard_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_invitation_by_slug"("slug_param" "text") RETURNS TABLE("invitation_id" "uuid", "title" character varying, "description" "text", "event_date" timestamp with time zone, "venue" character varying, "location" character varying, "custom_data" "jsonb", "views_count" integer, "confirmations_count" integer, "rsvp_count" integer, "template_data" "jsonb", "template_name" character varying, "template_thumbnail" character varying)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Increment view count
    UPDATE invites 
    SET views_count = COALESCE(views_count, 0) + 1,
        unique_visitors = COALESCE(unique_visitors, 0) + 1
    WHERE public_slug = slug_param 
    AND is_published = true;
    
    -- Return invitation data
    RETURN QUERY
    SELECT 
        i.id,
        i.title,
        i.description,
        i.event_date,
        i.venue,
        i.location,
        i.custom_data,
        i.views_count,
        i.confirmations_count,
        i.rsvp_count,
        t.template_data,
        t.name,
        t.thumbnail_url
    FROM invites i
    LEFT JOIN templates t ON i.template_id = t.id
    WHERE i.public_slug = slug_param 
    AND i.is_published = true;
END;
$$;


ALTER FUNCTION "public"."get_invitation_by_slug"("slug_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_invitation_comments"("invitation_id" "uuid", "include_pending" boolean DEFAULT false) RETURNS TABLE("id" "uuid", "author_name" character varying, "comment_text" "text", "is_featured" boolean, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.author_name,
    c.comment_text,
    c.is_featured,
    c.created_at
  FROM invitation_comments c
  WHERE c.invite_id = invitation_id
    AND (c.is_approved = true OR include_pending = true)
  ORDER BY c.is_featured DESC, c.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_invitation_comments"("invitation_id" "uuid", "include_pending" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_rsvp_summary"("invitation_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_responses', COUNT(*),
    'attending', COUNT(*) FILTER (WHERE attendance_status = 'attending'),
    'not_attending', COUNT(*) FILTER (WHERE attendance_status = 'not_attending'),
    'maybe', COUNT(*) FILTER (WHERE attendance_status = 'maybe'),
    'total_guests', COALESCE(SUM(number_of_guests) FILTER (WHERE attendance_status = 'attending'), 0),
    'response_rate', ROUND(
      (COUNT(*)::DECIMAL / NULLIF(
        (SELECT confirmations_count FROM invites WHERE id = invitation_id), 0
      )) * 100, 2
    )
  ) INTO result
  FROM rsvp_responses
  WHERE invite_id = invitation_id;
  
  RETURN COALESCE(result, '{"total_responses": 0, "attending": 0, "not_attending": 0, "maybe": 0, "total_guests": 0, "response_rate": 0}'::jsonb);
END;
$$;


ALTER FUNCTION "public"."get_rsvp_summary"("invitation_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_accessible_templates"("user_uuid" "uuid") RETURNS TABLE("template_id" "uuid", "template_name" character varying, "template_description" "text", "required_package" character varying, "package_tier" integer, "user_current_package" character varying, "user_package_level" integer, "template_required_level" integer, "user_can_access" boolean, "template_data" "jsonb", "thumbnail_url" character varying, "is_active" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_user_accessible_templates"("user_uuid" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_accessible_templates"("user_uuid" "uuid") IS 'Returns all templates with hierarchical accessibility based on user package level. Higher-tier packages can access all lower-tier templates. Package hierarchy: basic(1) -> gold(2) -> platinum(3) -> enterprise(4). Used by edge functions for template access validation.';



CREATE OR REPLACE FUNCTION "public"."get_user_package_status"("user_uuid" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_record RECORD;
    package_info RECORD;
    pending_upgrade RECORD;
BEGIN
    -- Get user info
    SELECT up.current_package, up.used_invites, up.is_premium_active, 
           up.package_upgraded_at, up.package_expires_at
    INTO user_record
    FROM user_profiles up 
    WHERE up.user_id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'User not found');
    END IF;
    
    -- Get package definition
    SELECT pd.display_name, pd.description, pd.price, pd.max_invitations, 
           pd.max_templates_access, pd.features
    INTO package_info
    FROM package_definitions pd
    WHERE pd.package_name = user_record.current_package;
    
    -- Check for pending upgrade requests
    SELECT pc.id, pc.status, pc.created_at, pc.requested_package
    INTO pending_upgrade
    FROM payment_confirmations pc
    WHERE pc.user_id = user_uuid 
      AND pc.status = 'pending'
      AND pc.expires_at > NOW()
    ORDER BY pc.created_at DESC
    LIMIT 1;
    
    RETURN jsonb_build_object(
        'current_package', user_record.current_package,
        'package_info', jsonb_build_object(
            'display_name', package_info.display_name,
            'description', package_info.description,
            'price', package_info.price,
            'max_invitations', package_info.max_invitations,
            'max_templates_access', package_info.max_templates_access,
            'features', package_info.features
        ),
        'usage', jsonb_build_object(
            'used_invites', user_record.used_invites,
            'remaining_invites', 
                CASE 
                    WHEN package_info.max_invitations IS NULL THEN NULL
                    ELSE package_info.max_invitations - user_record.used_invites
                END
        ),
        'premium_status', jsonb_build_object(
            'is_active', user_record.is_premium_active,
            'upgraded_at', user_record.package_upgraded_at,
            'expires_at', user_record.package_expires_at
        ),
        'pending_upgrade', 
            CASE 
                WHEN pending_upgrade.id IS NOT NULL THEN
                    jsonb_build_object(
                        'id', pending_upgrade.id,
                        'status', pending_upgrade.status,
                        'requested_package', pending_upgrade.requested_package,
                        'created_at', pending_upgrade.created_at
                    )
                ELSE NULL
            END
    );
END;
$$;


ALTER FUNCTION "public"."get_user_package_status"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_rsvp_counts"("invite_id" "uuid", "guests_to_add" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE invites 
    SET 
        rsvp_count = COALESCE(rsvp_count, 0) + 1,
        total_guests = COALESCE(total_guests, 0) + guests_to_add,
        updated_at = NOW()
    WHERE id = invite_id;
END;
$$;


ALTER FUNCTION "public"."increment_rsvp_counts"("invite_id" "uuid", "guests_to_add" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_user_invitations"("user_uuid" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."increment_user_invitations"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_invitation_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Only generate slug if it's not already set
    IF NEW.public_slug IS NULL OR NEW.public_slug = '' THEN
        NEW.public_slug := generate_unique_slug(NEW.title);
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_invitation_slug"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."set_invitation_slug"() IS 'Automatically generates a unique 4-character alphanumeric slug for new invitations if public_slug is not provided.';



CREATE OR REPLACE FUNCTION "public"."set_referral_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_referral_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_comment"("invitation_id" "uuid", "author_name_param" character varying, "comment_text_param" "text", "author_email_param" character varying DEFAULT NULL::character varying) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  settings_record RECORD;
  comment_id UUID;
  result JSONB;
BEGIN
  -- Get comment settings for this invitation
  SELECT * INTO settings_record 
  FROM comment_settings 
  WHERE invite_id = invitation_id;
  
  -- Use default settings if none exist
  IF NOT FOUND THEN
    settings_record.is_enabled := true;
    settings_record.require_approval := false;
    settings_record.require_email := false;
    settings_record.max_comment_length := 500;
  END IF;
  
  -- Check if comments are enabled
  IF NOT settings_record.is_enabled THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Comments are not enabled for this invitation'
    );
  END IF;
  
  -- Validate required fields
  IF settings_record.require_email AND (author_email_param IS NULL OR author_email_param = '') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email is required'
    );
  END IF;
  
  -- Validate comment length
  IF LENGTH(comment_text_param) > settings_record.max_comment_length THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Comment must be %s characters or less', settings_record.max_comment_length)
    );
  END IF;
  
  -- Insert comment
  INSERT INTO invitation_comments (
    invite_id,
    author_name,
    author_email,
    comment_text,
    is_approved
  ) VALUES (
    invitation_id,
    author_name_param,
    author_email_param,
    comment_text_param,
    NOT settings_record.require_approval
  ) RETURNING id INTO comment_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'comment_id', comment_id,
    'message', CASE 
      WHEN settings_record.require_approval 
      THEN 'Thank you for your comment! It will be visible after approval.' 
      ELSE 'Thank you for your comment!'
    END,
    'requires_approval', settings_record.require_approval
  );
END;
$$;


ALTER FUNCTION "public"."submit_comment"("invitation_id" "uuid", "author_name_param" character varying, "comment_text_param" "text", "author_email_param" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_rsvp"("invitation_id" "uuid", "guest_name_param" character varying, "guest_email_param" character varying DEFAULT NULL::character varying, "guest_phone_param" character varying DEFAULT NULL::character varying, "attendance_status_param" character varying DEFAULT 'attending'::character varying, "number_of_guests_param" integer DEFAULT 1, "dietary_restrictions_param" "text" DEFAULT NULL::"text", "special_requests_param" "text" DEFAULT NULL::"text", "message_param" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  settings_record RECORD;
  response_id UUID;
  result JSONB;
BEGIN
  -- Get RSVP settings for this invitation
  SELECT * INTO settings_record 
  FROM rsvp_settings 
  WHERE invite_id = invitation_id;
  
  -- Check if RSVP is enabled
  IF NOT FOUND OR NOT settings_record.is_enabled THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'RSVP is not enabled for this invitation'
    );
  END IF;
  
  -- Check deadline
  IF settings_record.deadline IS NOT NULL AND NOW() > settings_record.deadline THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'RSVP deadline has passed'
    );
  END IF;
  
  -- Validate required fields
  IF settings_record.require_email AND (guest_email_param IS NULL OR guest_email_param = '') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email is required'
    );
  END IF;
  
  IF settings_record.require_phone AND (guest_phone_param IS NULL OR guest_phone_param = '') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Phone number is required'
    );
  END IF;
  
  -- Validate number of guests
  IF number_of_guests_param > settings_record.max_guests_per_response THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Maximum %s guests allowed per response', settings_record.max_guests_per_response)
    );
  END IF;
  
  -- Insert RSVP response
  INSERT INTO rsvp_responses (
    invite_id,
    guest_name,
    guest_email,
    guest_phone,
    attendance_status,
    number_of_guests,
    dietary_restrictions,
    special_requests,
    message
  ) VALUES (
    invitation_id,
    guest_name_param,
    guest_email_param,
    guest_phone_param,
    attendance_status_param,
    number_of_guests_param,
    dietary_restrictions_param,
    special_requests_param,
    message_param
  ) RETURNING id INTO response_id;
  
  -- Update invitation RSVP count
  UPDATE invites 
  SET rsvp_count = rsvp_count + 1,
      confirmed_count = CASE 
        WHEN attendance_status_param = 'attending' 
        THEN confirmed_count + number_of_guests_param 
        ELSE confirmed_count 
      END
  WHERE id = invitation_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'response_id', response_id,
    'message', settings_record.confirmation_message
  );
END;
$$;


ALTER FUNCTION "public"."submit_rsvp"("invitation_id" "uuid", "guest_name_param" character varying, "guest_email_param" character varying, "guest_phone_param" character varying, "attendance_status_param" character varying, "number_of_guests_param" integer, "dietary_restrictions_param" "text", "special_requests_param" "text", "message_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_invitation_visitor"("invitation_slug" "text", "visitor_id" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    invite_id_var UUID;
BEGIN
    -- Get the invitation ID from slug
    SELECT id INTO invite_id_var FROM invites WHERE public_slug = invitation_slug;
    
    IF invite_id_var IS NOT NULL THEN
        -- Try to insert visitor record (will fail silently if already exists)
        INSERT INTO invite_visitors (invite_id, visitor_id)
        VALUES (invite_id_var, visitor_id)
        ON CONFLICT (invite_id, visitor_id) DO NOTHING;
        
        -- Update the unique visitors count
        UPDATE invites
        SET unique_visitors = (
            SELECT COUNT(*) FROM invite_visitors WHERE invite_id = invite_id_var
        )
        WHERE id = invite_id_var;
        
        -- Also increment the general views_count
        UPDATE invites
        SET views_count = COALESCE(views_count, 0) + 1
        WHERE id = invite_id_var;
    END IF;
END;
$$;


ALTER FUNCTION "public"."track_invitation_visitor"("invitation_slug" "text", "visitor_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "username" character varying(50) NOT NULL,
    "email" character varying(255) NOT NULL,
    "password_hash" character varying(255) NOT NULL,
    "full_name" character varying(255),
    "role" character varying(20) DEFAULT 'admin'::character varying,
    "is_active" boolean DEFAULT true,
    "last_login" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comment_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invite_id" "uuid" NOT NULL,
    "is_enabled" boolean DEFAULT true,
    "require_approval" boolean DEFAULT false,
    "require_email" boolean DEFAULT false,
    "max_comment_length" integer DEFAULT 500,
    "welcome_message" "text" DEFAULT 'Share your thoughts and well wishes for the happy couple!'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comment_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invitation_comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invite_id" "uuid" NOT NULL,
    "author_name" character varying(255) NOT NULL,
    "author_email" character varying(255),
    "comment_text" "text" NOT NULL,
    "is_approved" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."invitation_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invite_guests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invite_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "email" character varying(255),
    "phone" character varying(20),
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "confirmed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."invite_guests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invites" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "template_id" "uuid",
    "title" character varying(255) NOT NULL,
    "description" "text",
    "event_date" timestamp with time zone,
    "venue" character varying(500),
    "location" character varying(500),
    "custom_data" "jsonb",
    "status" "public"."invite_status" DEFAULT 'draft'::"public"."invite_status",
    "views_count" integer DEFAULT 0,
    "confirmations_count" integer DEFAULT 0,
    "unique_visitors" integer DEFAULT 0,
    "rsvp_count" integer DEFAULT 0,
    "confirmed_count" integer DEFAULT 0,
    "share_url" character varying(500),
    "public_slug" character varying(255),
    "category_id" "uuid",
    "require_approval" boolean DEFAULT false,
    "is_published" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "category" character varying(50) DEFAULT 'wedding'::character varying,
    "images" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."invites" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."invite_stats" AS
 SELECT "count"(*) AS "total_invites",
    "count"(*) FILTER (WHERE ("created_at" >= ("now"() - '30 days'::interval))) AS "new_invites_30d",
    "count"(*) FILTER (WHERE ("status" = 'published'::"public"."invite_status")) AS "published_invites",
    COALESCE("sum"("views_count"), (0)::bigint) AS "total_views",
    COALESCE("sum"("confirmations_count"), (0)::bigint) AS "total_confirmations"
   FROM "public"."invites";


ALTER VIEW "public"."invite_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invite_visitors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invite_id" "uuid",
    "visitor_id" character varying(255) NOT NULL,
    "visited_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."invite_visitors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plan_id" "uuid",
    "reseller_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "commission_amount" numeric(10,2),
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "payment_method" character varying(50),
    "payment_reference" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."order_stats" AS
 SELECT "count"(*) AS "total_orders",
    "count"(*) FILTER (WHERE ("created_at" >= ("now"() - '30 days'::interval))) AS "new_orders_30d",
    COALESCE("sum"("amount"), (0)::numeric) AS "total_revenue",
    COALESCE("avg"("amount"), (0)::numeric) AS "average_order_value"
   FROM "public"."orders"
  WHERE (("status")::"text" = 'completed'::"text");


ALTER VIEW "public"."order_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."package_definitions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "package_name" character varying(20) NOT NULL,
    "display_name" character varying(50) NOT NULL,
    "description" "text",
    "price" numeric(10,2) DEFAULT 0.00,
    "max_invitations" integer,
    "max_templates_access" integer,
    "features" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."package_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_confirmations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "requested_package" character varying(20) DEFAULT 'gold'::character varying NOT NULL,
    "whatsapp_phone" character varying(20),
    "whatsapp_message" "text",
    "transfer_proof_url" character varying(500),
    "bank_account_used" character varying(100),
    "transfer_amount" numeric(10,2),
    "transfer_reference" character varying(100),
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "admin_notes" "text",
    "confirmed_by" "uuid",
    "confirmed_at" timestamp with time zone,
    "rejected_at" timestamp with time zone,
    "rejection_reason" "text",
    "expires_at" timestamp with time zone DEFAULT ("now"() + '24:00:00'::interval),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_confirmations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "features" "jsonb",
    "max_invites" integer,
    "max_templates" integer,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "thumbnail_url" character varying(500),
    "template_data" "jsonb" NOT NULL,
    "category" character varying(50),
    "is_premium" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "required_package" character varying(20) DEFAULT 'basic'::character varying,
    "package_tier" integer DEFAULT 1,
    "is_premium_only" boolean DEFAULT false,
    "slug" character varying(255),
    "tier" character varying(20) DEFAULT 'basic'::character varying,
    "default_styles" "jsonb" DEFAULT '{}'::"jsonb",
    "color_combinations" "jsonb" DEFAULT '[]'::"jsonb",
    "features" "jsonb" DEFAULT '{"rsvp": false, "images": false, "comments": false}'::"jsonb"
);


ALTER TABLE "public"."templates" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_invitations" AS
 SELECT "i"."id",
    "i"."title",
    "i"."description",
    "i"."event_date",
    "i"."venue",
    "i"."location",
    "i"."custom_data",
    "i"."views_count",
    "i"."confirmations_count",
    "i"."unique_visitors",
    "i"."rsvp_count",
    "i"."confirmed_count",
    "i"."public_slug",
    "i"."created_at",
    "t"."name" AS "template_name",
    "t"."thumbnail_url" AS "template_thumbnail"
   FROM ("public"."invites" "i"
     LEFT JOIN "public"."templates" "t" ON (("i"."template_id" = "t"."id")))
  WHERE (("i"."is_published" = true) AND ("i"."public_slug" IS NOT NULL));


ALTER VIEW "public"."public_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resellers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "username" character varying(50) NOT NULL,
    "email" character varying(255) NOT NULL,
    "password_hash" character varying(255) NOT NULL,
    "full_name" character varying(255),
    "phone" character varying(20),
    "company_name" character varying(255),
    "commission_rate" numeric(5,2) DEFAULT 10.00,
    "referral_code" character varying(20),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."resellers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rsvp_responses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invite_id" "uuid" NOT NULL,
    "guest_name" character varying(255) NOT NULL,
    "guest_email" character varying(255),
    "guest_phone" character varying(20),
    "attendance_status" character varying(20) NOT NULL,
    "number_of_guests" integer DEFAULT 1,
    "dietary_restrictions" "text",
    "special_requests" "text",
    "message" "text",
    "responded_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "rsvp_responses_attendance_status_check" CHECK ((("attendance_status")::"text" = ANY ((ARRAY['attending'::character varying, 'not_attending'::character varying, 'maybe'::character varying])::"text"[]))),
    CONSTRAINT "rsvp_responses_number_of_guests_check" CHECK (("number_of_guests" >= 0))
);


ALTER TABLE "public"."rsvp_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rsvp_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invite_id" "uuid" NOT NULL,
    "is_enabled" boolean DEFAULT true,
    "deadline" timestamp with time zone,
    "max_guests_per_response" integer DEFAULT 4,
    "require_email" boolean DEFAULT false,
    "require_phone" boolean DEFAULT false,
    "collect_dietary_restrictions" boolean DEFAULT true,
    "collect_special_requests" boolean DEFAULT true,
    "allow_guest_message" boolean DEFAULT true,
    "custom_questions" "jsonb" DEFAULT '[]'::"jsonb",
    "confirmation_message" "text" DEFAULT 'Thank you for your RSVP!'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."rsvp_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "full_name" character varying(255),
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "current_package" character varying(20) DEFAULT 'basic'::character varying,
    "used_invites" integer DEFAULT 0,
    "package_upgraded_at" timestamp with time zone,
    "package_expires_at" timestamp with time zone,
    "is_premium_active" boolean DEFAULT false
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_stats" AS
 SELECT "count"(*) AS "total_users",
    "count"(*) FILTER (WHERE ("created_at" >= ("now"() - '30 days'::interval))) AS "new_users_30d",
    "count"(*) FILTER (WHERE ("is_premium_active" = true)) AS "premium_users",
    "count"(*) FILTER (WHERE (("current_package")::"text" = 'gold'::"text")) AS "gold_users"
   FROM "public"."user_profiles";


ALTER VIEW "public"."user_stats" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."comment_settings"
    ADD CONSTRAINT "comment_settings_invite_id_key" UNIQUE ("invite_id");



ALTER TABLE ONLY "public"."comment_settings"
    ADD CONSTRAINT "comment_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitation_comments"
    ADD CONSTRAINT "invitation_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invite_guests"
    ADD CONSTRAINT "invite_guests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invite_visitors"
    ADD CONSTRAINT "invite_visitors_invite_id_visitor_id_key" UNIQUE ("invite_id", "visitor_id");



ALTER TABLE ONLY "public"."invite_visitors"
    ADD CONSTRAINT "invite_visitors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_public_slug_key" UNIQUE ("public_slug");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."package_definitions"
    ADD CONSTRAINT "package_definitions_package_name_key" UNIQUE ("package_name");



ALTER TABLE ONLY "public"."package_definitions"
    ADD CONSTRAINT "package_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_confirmations"
    ADD CONSTRAINT "payment_confirmations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resellers"
    ADD CONSTRAINT "resellers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."resellers"
    ADD CONSTRAINT "resellers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resellers"
    ADD CONSTRAINT "resellers_referral_code_key" UNIQUE ("referral_code");



ALTER TABLE ONLY "public"."resellers"
    ADD CONSTRAINT "resellers_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."rsvp_responses"
    ADD CONSTRAINT "rsvp_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rsvp_settings"
    ADD CONSTRAINT "rsvp_settings_invite_id_key" UNIQUE ("invite_id");



ALTER TABLE ONLY "public"."rsvp_settings"
    ADD CONSTRAINT "rsvp_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



CREATE INDEX "idx_comment_settings_invite_id" ON "public"."comment_settings" USING "btree" ("invite_id");



CREATE INDEX "idx_invitation_comments_approved" ON "public"."invitation_comments" USING "btree" ("is_approved");



CREATE INDEX "idx_invitation_comments_created_at" ON "public"."invitation_comments" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_invitation_comments_featured" ON "public"."invitation_comments" USING "btree" ("is_featured");



CREATE INDEX "idx_invitation_comments_invite_id" ON "public"."invitation_comments" USING "btree" ("invite_id");



CREATE INDEX "idx_invite_guests_invite_id" ON "public"."invite_guests" USING "btree" ("invite_id");



CREATE INDEX "idx_invite_visitors_invite_id" ON "public"."invite_visitors" USING "btree" ("invite_id");



CREATE INDEX "idx_invites_category" ON "public"."invites" USING "btree" ("category");



CREATE INDEX "idx_invites_public_slug" ON "public"."invites" USING "btree" ("public_slug");



CREATE INDEX "idx_invites_status" ON "public"."invites" USING "btree" ("status");



CREATE INDEX "idx_invites_user_id" ON "public"."invites" USING "btree" ("user_id");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_orders_user_id" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "idx_payment_confirmations_pending" ON "public"."payment_confirmations" USING "btree" ("status", "created_at") WHERE (("status")::"text" = 'pending'::"text");



CREATE INDEX "idx_payment_confirmations_status" ON "public"."payment_confirmations" USING "btree" ("status");



CREATE INDEX "idx_payment_confirmations_user" ON "public"."payment_confirmations" USING "btree" ("user_id");



CREATE INDEX "idx_resellers_referral_code" ON "public"."resellers" USING "btree" ("referral_code");



CREATE INDEX "idx_rsvp_responses_invite_id" ON "public"."rsvp_responses" USING "btree" ("invite_id");



CREATE INDEX "idx_rsvp_responses_responded_at" ON "public"."rsvp_responses" USING "btree" ("responded_at");



CREATE INDEX "idx_rsvp_responses_status" ON "public"."rsvp_responses" USING "btree" ("attendance_status");



CREATE INDEX "idx_rsvp_settings_invite_id" ON "public"."rsvp_settings" USING "btree" ("invite_id");



CREATE INDEX "idx_templates_category" ON "public"."templates" USING "btree" ("category");



CREATE INDEX "idx_templates_package_req" ON "public"."templates" USING "btree" ("required_package", "is_active");



CREATE INDEX "idx_templates_premium" ON "public"."templates" USING "btree" ("is_premium_only", "is_active");



CREATE INDEX "idx_templates_slug" ON "public"."templates" USING "btree" ("slug");



CREATE INDEX "idx_templates_tier" ON "public"."templates" USING "btree" ("tier");



CREATE INDEX "idx_user_profiles_current_package" ON "public"."user_profiles" USING "btree" ("current_package");



CREATE INDEX "idx_user_profiles_package" ON "public"."user_profiles" USING "btree" ("current_package", "is_premium_active");



CREATE INDEX "idx_user_profiles_package_status" ON "public"."user_profiles" USING "btree" ("current_package", "is_premium_active");



CREATE INDEX "idx_user_profiles_user_id" ON "public"."user_profiles" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "set_invitation_slug_trigger" BEFORE INSERT ON "public"."invites" FOR EACH ROW EXECUTE FUNCTION "public"."set_invitation_slug"();



COMMENT ON TRIGGER "set_invitation_slug_trigger" ON "public"."invites" IS 'Trigger that automatically generates public_slug for new invitations using the generate_unique_slug function.';



CREATE OR REPLACE TRIGGER "trigger_set_referral_code" BEFORE INSERT ON "public"."resellers" FOR EACH ROW EXECUTE FUNCTION "public"."set_referral_code"();



CREATE OR REPLACE TRIGGER "update_admin_users_updated_at" BEFORE UPDATE ON "public"."admin_users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_comment_settings_updated_at" BEFORE UPDATE ON "public"."comment_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_invitation_comments_updated_at" BEFORE UPDATE ON "public"."invitation_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_invites_updated_at" BEFORE UPDATE ON "public"."invites" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_package_definitions_updated_at" BEFORE UPDATE ON "public"."package_definitions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_payment_confirmations_updated_at" BEFORE UPDATE ON "public"."payment_confirmations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_plans_updated_at" BEFORE UPDATE ON "public"."plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_resellers_updated_at" BEFORE UPDATE ON "public"."resellers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_rsvp_responses_updated_at" BEFORE UPDATE ON "public"."rsvp_responses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_rsvp_settings_updated_at" BEFORE UPDATE ON "public"."rsvp_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_templates_updated_at" BEFORE UPDATE ON "public"."templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."comment_settings"
    ADD CONSTRAINT "comment_settings_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitation_comments"
    ADD CONSTRAINT "invitation_comments_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invite_guests"
    ADD CONSTRAINT "invite_guests_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invite_visitors"
    ADD CONSTRAINT "invite_visitors_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_reseller_id_fkey" FOREIGN KEY ("reseller_id") REFERENCES "public"."resellers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payment_confirmations"
    ADD CONSTRAINT "payment_confirmations_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "public"."admin_users"("id");



ALTER TABLE ONLY "public"."payment_confirmations"
    ADD CONSTRAINT "payment_confirmations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rsvp_responses"
    ADD CONSTRAINT "rsvp_responses_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rsvp_settings"
    ADD CONSTRAINT "rsvp_settings_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow anon and auth RSVP" ON "public"."rsvp_responses" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anonymous users can RSVP to published invites" ON "public"."invite_visitors" FOR INSERT TO "anon" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "invite_visitors"."invite_id") AND ("invites"."is_published" = true) AND ("invites"."public_slug" IS NOT NULL)))));



CREATE POLICY "Anonymous users can view guests of published invites" ON "public"."invite_guests" FOR SELECT TO "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "invite_guests"."invite_id") AND ("invites"."is_published" = true) AND ("invites"."public_slug" IS NOT NULL)))));



CREATE POLICY "Anonymous users can view published invites by slug" ON "public"."invites" FOR SELECT TO "anon" USING ((("is_published" = true) AND ("public_slug" IS NOT NULL)));



CREATE POLICY "Anonymous users can view visitors of published invites" ON "public"."invite_visitors" FOR SELECT TO "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "invite_visitors"."invite_id") AND ("invites"."is_published" = true) AND ("invites"."public_slug" IS NOT NULL)))));



CREATE POLICY "Anyone can view active packages" ON "public"."package_definitions" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view package definitions" ON "public"."package_definitions" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Authenticated users can view guests of published invites" ON "public"."invite_guests" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "invite_guests"."invite_id") AND ("invites"."is_published" = true) AND ("invites"."public_slug" IS NOT NULL)))));



CREATE POLICY "Authenticated users can view published invites by slug" ON "public"."invites" FOR SELECT TO "authenticated" USING ((("is_published" = true) AND ("public_slug" IS NOT NULL)));



CREATE POLICY "Public can submit comments for published invites" ON "public"."invitation_comments" FOR INSERT TO "authenticated", "anon" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "invitation_comments"."invite_id") AND ("invites"."is_published" = true) AND ("invites"."public_slug" IS NOT NULL)))));



CREATE POLICY "Public can view approved comments for published invites" ON "public"."invitation_comments" FOR SELECT TO "authenticated", "anon" USING ((("is_approved" = true) AND (EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "invitation_comments"."invite_id") AND ("invites"."is_published" = true) AND ("invites"."public_slug" IS NOT NULL))))));



CREATE POLICY "Service role can manage all profiles" ON "public"."user_profiles" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can create own invites" ON "public"."invites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own orders" ON "public"."orders" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own invites" ON "public"."invites" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own payment confirmations" ON "public"."payment_confirmations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage RSVP settings for own invites" ON "public"."rsvp_settings" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "rsvp_settings"."invite_id") AND ("invites"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "rsvp_settings"."invite_id") AND ("invites"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage comment settings for own invites" ON "public"."comment_settings" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "comment_settings"."invite_id") AND ("invites"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "comment_settings"."invite_id") AND ("invites"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage comments for own invites" ON "public"."invitation_comments" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "invitation_comments"."invite_id") AND ("invites"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage guests of own invites" ON "public"."invite_guests" USING ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "invite_guests"."invite_id") AND ("invites"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own invites" ON "public"."invites" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view RSVPs for own invites" ON "public"."rsvp_responses" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "rsvp_responses"."invite_id") AND ("invites"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view all comments for own invites" ON "public"."invitation_comments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "invitation_comments"."invite_id") AND ("invites"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view guests of own invites" ON "public"."invite_guests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."invites"
  WHERE (("invites"."id" = "invite_guests"."invite_id") AND ("invites"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own invites" ON "public"."invites" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own payment confirmations" ON "public"."payment_confirmations" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."comment_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invitation_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invite_guests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."package_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_confirmations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rsvp_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rsvp_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."admin_upgrade_user_package"("user_uuid" "uuid", "new_package" character varying, "admin_uuid" "uuid", "payment_confirmation_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_upgrade_user_package"("user_uuid" "uuid", "new_package" character varying, "admin_uuid" "uuid", "payment_confirmation_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_upgrade_user_package"("user_uuid" "uuid", "new_package" character varying, "admin_uuid" "uuid", "payment_confirmation_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_user_create_invitation"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_user_create_invitation"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_user_create_invitation"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_missing_user_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_missing_user_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_missing_user_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_user_profile"("user_id_param" "uuid", "user_email" "text", "user_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"("user_id_param" "uuid", "user_email" "text", "user_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"("user_id_param" "uuid", "user_email" "text", "user_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_referral_code"("length" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."generate_referral_code"("length" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_referral_code"("length" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_unique_slug"("base_title" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_unique_slug"("base_title" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_unique_slug"("base_title" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_invitation_by_slug"("slug_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_invitation_by_slug"("slug_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_invitation_by_slug"("slug_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_invitation_comments"("invitation_id" "uuid", "include_pending" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_invitation_comments"("invitation_id" "uuid", "include_pending" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_invitation_comments"("invitation_id" "uuid", "include_pending" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_rsvp_summary"("invitation_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_rsvp_summary"("invitation_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_rsvp_summary"("invitation_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_accessible_templates"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_accessible_templates"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_accessible_templates"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_package_status"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_package_status"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_package_status"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticator";



GRANT ALL ON FUNCTION "public"."increment_rsvp_counts"("invite_id" "uuid", "guests_to_add" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_rsvp_counts"("invite_id" "uuid", "guests_to_add" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_rsvp_counts"("invite_id" "uuid", "guests_to_add" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_user_invitations"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_user_invitations"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_user_invitations"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_invitation_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_invitation_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_invitation_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_referral_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_referral_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_referral_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_comment"("invitation_id" "uuid", "author_name_param" character varying, "comment_text_param" "text", "author_email_param" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_comment"("invitation_id" "uuid", "author_name_param" character varying, "comment_text_param" "text", "author_email_param" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_comment"("invitation_id" "uuid", "author_name_param" character varying, "comment_text_param" "text", "author_email_param" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_rsvp"("invitation_id" "uuid", "guest_name_param" character varying, "guest_email_param" character varying, "guest_phone_param" character varying, "attendance_status_param" character varying, "number_of_guests_param" integer, "dietary_restrictions_param" "text", "special_requests_param" "text", "message_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_rsvp"("invitation_id" "uuid", "guest_name_param" character varying, "guest_email_param" character varying, "guest_phone_param" character varying, "attendance_status_param" character varying, "number_of_guests_param" integer, "dietary_restrictions_param" "text", "special_requests_param" "text", "message_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_rsvp"("invitation_id" "uuid", "guest_name_param" character varying, "guest_email_param" character varying, "guest_phone_param" character varying, "attendance_status_param" character varying, "number_of_guests_param" integer, "dietary_restrictions_param" "text", "special_requests_param" "text", "message_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."track_invitation_visitor"("invitation_slug" "text", "visitor_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."track_invitation_visitor"("invitation_slug" "text", "visitor_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_invitation_visitor"("invitation_slug" "text", "visitor_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."comment_settings" TO "anon";
GRANT ALL ON TABLE "public"."comment_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_settings" TO "service_role";



GRANT ALL ON TABLE "public"."invitation_comments" TO "anon";
GRANT ALL ON TABLE "public"."invitation_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."invitation_comments" TO "service_role";



GRANT ALL ON TABLE "public"."invite_guests" TO "anon";
GRANT ALL ON TABLE "public"."invite_guests" TO "authenticated";
GRANT ALL ON TABLE "public"."invite_guests" TO "service_role";



GRANT ALL ON TABLE "public"."invites" TO "anon";
GRANT ALL ON TABLE "public"."invites" TO "authenticated";
GRANT ALL ON TABLE "public"."invites" TO "service_role";



GRANT ALL ON TABLE "public"."invite_stats" TO "anon";
GRANT ALL ON TABLE "public"."invite_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."invite_stats" TO "service_role";



GRANT ALL ON TABLE "public"."invite_visitors" TO "anon";
GRANT ALL ON TABLE "public"."invite_visitors" TO "authenticated";
GRANT ALL ON TABLE "public"."invite_visitors" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."order_stats" TO "anon";
GRANT ALL ON TABLE "public"."order_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."order_stats" TO "service_role";



GRANT ALL ON TABLE "public"."package_definitions" TO "anon";
GRANT ALL ON TABLE "public"."package_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."package_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."payment_confirmations" TO "anon";
GRANT ALL ON TABLE "public"."payment_confirmations" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_confirmations" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON TABLE "public"."templates" TO "anon";
GRANT ALL ON TABLE "public"."templates" TO "authenticated";
GRANT ALL ON TABLE "public"."templates" TO "service_role";



GRANT ALL ON TABLE "public"."public_invitations" TO "anon";
GRANT ALL ON TABLE "public"."public_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."public_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."resellers" TO "anon";
GRANT ALL ON TABLE "public"."resellers" TO "authenticated";
GRANT ALL ON TABLE "public"."resellers" TO "service_role";



GRANT ALL ON TABLE "public"."rsvp_responses" TO "anon";
GRANT ALL ON TABLE "public"."rsvp_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."rsvp_responses" TO "service_role";



GRANT ALL ON TABLE "public"."rsvp_settings" TO "anon";
GRANT ALL ON TABLE "public"."rsvp_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."rsvp_settings" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_stats" TO "anon";
GRANT ALL ON TABLE "public"."user_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."user_stats" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
