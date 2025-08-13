-- Update slug generation to use 4 alphanumeric characters
-- This migration updates the generate_unique_slug function

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

-- Add a comment explaining the change
COMMENT ON FUNCTION "public"."generate_unique_slug"("base_title" "text") IS 
'Generates a unique 4-character alphanumeric slug. The base_title parameter is kept for backward compatibility but not used in generation.';
