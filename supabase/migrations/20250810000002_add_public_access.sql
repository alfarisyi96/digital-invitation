-- Add public access policies for invitation viewing
-- This allows anonymous users to view published invitations via public_slug

-- Add policy for anonymous users to view published invites via public_slug
CREATE POLICY "Anonymous users can view published invites by slug" ON invites
    FOR SELECT TO anon
    USING (is_published = true AND public_slug IS NOT NULL);

-- Add policy for authenticated users to also view published invites by slug
-- (in addition to their own invites)
CREATE POLICY "Authenticated users can view published invites by slug" ON invites
    FOR SELECT TO authenticated  
    USING (is_published = true AND public_slug IS NOT NULL);

-- Allow anonymous users to view invite guests for published invites
CREATE POLICY "Anonymous users can view guests of published invites" ON invite_guests
    FOR SELECT TO anon
    USING (EXISTS (
        SELECT 1 FROM invites 
        WHERE invites.id = invite_guests.invite_id 
        AND invites.is_published = true 
        AND invites.public_slug IS NOT NULL
    ));

-- Allow authenticated users to view invite guests for published invites
CREATE POLICY "Authenticated users can view guests of published invites" ON invite_guests  
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM invites 
        WHERE invites.id = invite_guests.invite_id 
        AND invites.is_published = true 
        AND invites.public_slug IS NOT NULL
    ));

-- Allow anonymous users to view invite visitors (RSVP tracking)
CREATE POLICY "Anonymous users can view visitors of published invites" ON invite_visitors
    FOR SELECT TO anon
    USING (EXISTS (
        SELECT 1 FROM invites 
        WHERE invites.id = invite_visitors.invite_id 
        AND invites.is_published = true 
        AND invites.public_slug IS NOT NULL
    ));

-- Allow anonymous users to add themselves as visitors (RSVP)
CREATE POLICY "Anonymous users can RSVP to published invites" ON invite_visitors
    FOR INSERT TO anon
    WITH CHECK (EXISTS (
        SELECT 1 FROM invites 
        WHERE invites.id = invite_visitors.invite_id 
        AND invites.is_published = true 
        AND invites.public_slug IS NOT NULL
    ));

-- Allow anonymous users to view published invitation templates
-- (if templates table supports public viewing)
-- Note: This depends on whether templates have a public access mechanism
-- CREATE POLICY "Anonymous users can view public templates" ON templates
--     FOR SELECT TO anon  
--     USING (is_public = true AND is_active = true);

-- Create a view for public invitation access
-- This provides a clean interface for fetching public invitations
CREATE OR REPLACE VIEW public_invitations AS
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
    i.unique_visitors,
    i.rsvp_count,
    i.confirmed_count,
    i.public_slug,
    i.created_at,
    t.name as template_name,
    t.thumbnail_url as template_thumbnail
FROM invites i
LEFT JOIN templates t ON i.template_id = t.id
WHERE i.is_published = true 
AND i.public_slug IS NOT NULL;

-- Grant access to the public_invitations view
GRANT SELECT ON public_invitations TO anon;
GRANT SELECT ON public_invitations TO authenticated;

-- Create a function to get invitation by public slug
-- This provides a secure way to fetch invitation details
CREATE OR REPLACE FUNCTION get_invitation_by_slug(slug_param TEXT)
RETURNS TABLE(
    invitation_id UUID,
    title VARCHAR,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    venue VARCHAR,
    location VARCHAR,
    custom_data JSONB,
    views_count INTEGER,
    confirmations_count INTEGER,
    rsvp_count INTEGER,
    template_data JSONB,
    template_name VARCHAR,
    template_thumbnail VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_invitation_by_slug(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_invitation_by_slug(TEXT) TO authenticated;
