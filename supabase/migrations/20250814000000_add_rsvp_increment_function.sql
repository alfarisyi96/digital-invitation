-- Add function to increment RSVP counts
CREATE OR REPLACE FUNCTION increment_rsvp_counts(invite_id UUID, guests_to_add INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE invites 
    SET 
        rsvp_count = COALESCE(rsvp_count, 0) + 1,
        total_guests = COALESCE(total_guests, 0) + guests_to_add,
        updated_at = NOW()
    WHERE id = invite_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION increment_rsvp_counts(UUID, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION increment_rsvp_counts(UUID, INTEGER) TO authenticated;
