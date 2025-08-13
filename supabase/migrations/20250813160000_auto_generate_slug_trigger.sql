-- Create trigger to auto-generate public_slug for invitations
-- This moves slug generation from frontend to backend for better reliability

-- Create trigger function to generate slug before insert
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

-- Create the trigger
CREATE TRIGGER "set_invitation_slug_trigger"
    BEFORE INSERT ON "public"."invites"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."set_invitation_slug"();

-- Add comment explaining the trigger
COMMENT ON FUNCTION "public"."set_invitation_slug"() IS 
'Automatically generates a unique 4-character alphanumeric slug for new invitations if public_slug is not provided.';

COMMENT ON TRIGGER "set_invitation_slug_trigger" ON "public"."invites" IS 
'Trigger that automatically generates public_slug for new invitations using the generate_unique_slug function.';
