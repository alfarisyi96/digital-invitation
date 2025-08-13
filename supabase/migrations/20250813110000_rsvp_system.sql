-- =====================================================
-- RSVP SYSTEM MIGRATION
-- Date: 2025-08-13
-- Description: Add RSVP functionality for wedding invitations
-- This migration adds tables and functions for guest RSVP management
-- =====================================================

-- Create RSVP responses table
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_id UUID NOT NULL REFERENCES invites(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255),
  guest_phone VARCHAR(20),
  attendance_status VARCHAR(20) NOT NULL CHECK (attendance_status IN ('attending', 'not_attending', 'maybe')),
  number_of_guests INTEGER DEFAULT 1 CHECK (number_of_guests >= 0),
  dietary_restrictions TEXT,
  special_requests TEXT,
  message TEXT,
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RSVP configuration table for invitation-specific settings
CREATE TABLE IF NOT EXISTS rsvp_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_id UUID NOT NULL REFERENCES invites(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  deadline TIMESTAMPTZ,
  max_guests_per_response INTEGER DEFAULT 4,
  require_email BOOLEAN DEFAULT false,
  require_phone BOOLEAN DEFAULT false,
  collect_dietary_restrictions BOOLEAN DEFAULT true,
  collect_special_requests BOOLEAN DEFAULT true,
  allow_guest_message BOOLEAN DEFAULT true,
  custom_questions JSONB DEFAULT '[]'::jsonb,
  confirmation_message TEXT DEFAULT 'Thank you for your RSVP!',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_rsvp_responses_invite_id ON rsvp_responses(invite_id);
CREATE INDEX idx_rsvp_responses_status ON rsvp_responses(attendance_status);
CREATE INDEX idx_rsvp_responses_responded_at ON rsvp_responses(responded_at);
CREATE INDEX idx_rsvp_settings_invite_id ON rsvp_settings(invite_id);

-- Add RSVP summary function
CREATE OR REPLACE FUNCTION get_rsvp_summary(invitation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add function to submit RSVP
CREATE OR REPLACE FUNCTION submit_rsvp(
  invitation_id UUID,
  guest_name_param VARCHAR(255),
  guest_email_param VARCHAR(255) DEFAULT NULL,
  guest_phone_param VARCHAR(20) DEFAULT NULL,
  attendance_status_param VARCHAR(20) DEFAULT 'attending',
  number_of_guests_param INTEGER DEFAULT 1,
  dietary_restrictions_param TEXT DEFAULT NULL,
  special_requests_param TEXT DEFAULT NULL,
  message_param TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add triggers for updated_at
CREATE OR REPLACE TRIGGER update_rsvp_responses_updated_at
  BEFORE UPDATE ON rsvp_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_rsvp_settings_updated_at
  BEFORE UPDATE ON rsvp_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_settings ENABLE ROW LEVEL SECURITY;

-- Allow public RSVP submission for published invitations
CREATE POLICY "Public can submit RSVP for published invites" ON rsvp_responses
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invites 
      WHERE id = invite_id 
      AND is_published = true 
      AND public_slug IS NOT NULL
    )
  );

-- Allow invitation owners to view their RSVP responses
CREATE POLICY "Users can view RSVPs for own invites" ON rsvp_responses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invites 
      WHERE id = invite_id 
      AND user_id = auth.uid()
    )
  );

-- Allow invitation owners to manage RSVP settings
CREATE POLICY "Users can manage RSVP settings for own invites" ON rsvp_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invites 
      WHERE id = invite_id 
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invites 
      WHERE id = invite_id 
      AND user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_rsvp_summary(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_rsvp(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, TEXT, TEXT, TEXT) TO anon, authenticated;
