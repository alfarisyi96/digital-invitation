-- =====================================================
-- COMMENTS SYSTEM MIGRATION  
-- Date: 2025-08-13
-- Description: Add comments/guest book functionality for wedding invitations
-- This migration adds tables and functions for guest comments and well-wishes
-- =====================================================

-- Create comments table
CREATE TABLE IF NOT EXISTS invitation_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_id UUID NOT NULL REFERENCES invites(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  comment_text TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comment settings table
CREATE TABLE IF NOT EXISTS comment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_id UUID NOT NULL REFERENCES invites(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,
  require_email BOOLEAN DEFAULT false,
  max_comment_length INTEGER DEFAULT 500,
  welcome_message TEXT DEFAULT 'Share your thoughts and well wishes for the happy couple!',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_invitation_comments_invite_id ON invitation_comments(invite_id);
CREATE INDEX idx_invitation_comments_approved ON invitation_comments(is_approved);
CREATE INDEX idx_invitation_comments_featured ON invitation_comments(is_featured);
CREATE INDEX idx_invitation_comments_created_at ON invitation_comments(created_at DESC);
CREATE INDEX idx_comment_settings_invite_id ON comment_settings(invite_id);

-- Add function to submit comment
CREATE OR REPLACE FUNCTION submit_comment(
  invitation_id UUID,
  author_name_param VARCHAR(255),
  comment_text_param TEXT,
  author_email_param VARCHAR(255) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add function to get comments for an invitation
CREATE OR REPLACE FUNCTION get_invitation_comments(invitation_id UUID, include_pending BOOLEAN DEFAULT false)
RETURNS TABLE(
  id UUID,
  author_name VARCHAR(255),
  comment_text TEXT,
  is_featured BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add triggers for updated_at
CREATE OR REPLACE TRIGGER update_invitation_comments_updated_at
  BEFORE UPDATE ON invitation_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_comment_settings_updated_at
  BEFORE UPDATE ON comment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE invitation_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_settings ENABLE ROW LEVEL SECURITY;

-- Allow public to view approved comments for published invitations
CREATE POLICY "Public can view approved comments for published invites" ON invitation_comments
  FOR SELECT TO anon, authenticated
  USING (
    is_approved = true AND
    EXISTS (
      SELECT 1 FROM invites 
      WHERE id = invite_id 
      AND is_published = true 
      AND public_slug IS NOT NULL
    )
  );

-- Allow public to submit comments for published invitations  
CREATE POLICY "Public can submit comments for published invites" ON invitation_comments
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invites 
      WHERE id = invite_id 
      AND is_published = true 
      AND public_slug IS NOT NULL
    )
  );

-- Allow invitation owners to view all comments (including pending)
CREATE POLICY "Users can view all comments for own invites" ON invitation_comments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invites 
      WHERE id = invite_id 
      AND user_id = auth.uid()
    )
  );

-- Allow invitation owners to manage comments
CREATE POLICY "Users can manage comments for own invites" ON invitation_comments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invites 
      WHERE id = invite_id 
      AND user_id = auth.uid()
    )
  );

-- Allow invitation owners to manage comment settings
CREATE POLICY "Users can manage comment settings for own invites" ON comment_settings
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
GRANT EXECUTE ON FUNCTION submit_comment(UUID, VARCHAR, TEXT, VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_invitation_comments(UUID, BOOLEAN) TO anon, authenticated;
