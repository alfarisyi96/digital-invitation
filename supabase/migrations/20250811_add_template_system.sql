-- Migration: Add Template System and Enhanced Details
-- Date: 2025-08-11
-- Safe migration that won't break existing data

-- =====================================================
-- 1. ADD CATEGORY FIELD TO INVITES (SAFE)
-- =====================================================

-- Add category field with default value to maintain compatibility
ALTER TABLE invites ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'wedding';

-- Add images field for premium features
ALTER TABLE invites ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '{}';

-- =====================================================
-- 2. CREATE TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    
    -- Pricing and features
    is_premium BOOLEAN DEFAULT false,
    tier VARCHAR(20) DEFAULT 'basic',
    
    -- Template configuration
    default_styles JSONB NOT NULL DEFAULT '{}',
    color_combinations JSONB NOT NULL DEFAULT '[]',
    
    -- Premium features flags
    features JSONB DEFAULT '{"rsvp": false, "comments": false, "images": false}',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. INSERT SAMPLE TEMPLATES
-- =====================================================

INSERT INTO templates (name, slug, category, tier, default_styles, color_combinations, features) VALUES
-- Basic Wedding Templates
(
    'Sunda Traditional',
    'sunda-traditional',
    'wedding',
    'basic',
    '{"sections": {"header": {"fontSize": "32px", "fontWeight": "bold", "textAlign": "center"}, "subtitle": {"fontSize": "18px", "fontWeight": "normal"}, "body": {"fontSize": "16px", "fontWeight": "normal"}}}',
    '[
        {"name": "Traditional Gold", "primary": "#D4AF37", "secondary": "#8B4513", "accent": "#FFD700"},
        {"name": "Elegant Maroon", "primary": "#800020", "secondary": "#F5F5DC", "accent": "#CD853F"},
        {"name": "Royal Blue", "primary": "#4169E1", "secondary": "#F0F8FF", "accent": "#FFD700"}
    ]',
    '{"rsvp": false, "comments": false, "images": false}'
),
(
    'Modern Minimalist',
    'modern-minimalist',
    'wedding',
    'basic',
    '{"sections": {"header": {"fontSize": "28px", "fontWeight": "300", "textAlign": "center"}, "subtitle": {"fontSize": "16px", "fontWeight": "normal"}, "body": {"fontSize": "14px", "fontWeight": "normal"}}}',
    '[
        {"name": "Clean White", "primary": "#2D3748", "secondary": "#F7FAFC", "accent": "#4299E1"},
        {"name": "Soft Gray", "primary": "#4A5568", "secondary": "#EDF2F7", "accent": "#38B2AC"},
        {"name": "Warm Beige", "primary": "#744210", "secondary": "#FFFAF0", "accent": "#D69E2E"}
    ]',
    '{"rsvp": false, "comments": false, "images": false}'
),

-- Premium Wedding Templates
(
    'Royal Wedding',
    'royal-wedding',
    'wedding',
    'premium',
    '{"sections": {"header": {"fontSize": "36px", "fontWeight": "bold", "textAlign": "center"}, "subtitle": {"fontSize": "20px", "fontWeight": "normal"}, "body": {"fontSize": "16px", "fontWeight": "normal"}}}',
    '[
        {"name": "Royal Purple", "primary": "#6B46C1", "secondary": "#F3F4F6", "accent": "#D97706"},
        {"name": "Elegant Black", "primary": "#1A202C", "secondary": "#F7FAFC", "accent": "#E53E3E"},
        {"name": "Classic Gold", "primary": "#B7791F", "secondary": "#FFFAF0", "accent": "#C53030"}
    ]',
    '{"rsvp": true, "comments": true, "images": true}'
),

-- Birthday Templates
(
    'Vibrant Birthday',
    'vibrant-birthday',
    'birthday',
    'basic',
    '{"sections": {"header": {"fontSize": "30px", "fontWeight": "bold", "textAlign": "center"}, "subtitle": {"fontSize": "18px", "fontWeight": "normal"}, "body": {"fontSize": "16px", "fontWeight": "normal"}}}',
    '[
        {"name": "Rainbow Fun", "primary": "#FF6B6B", "secondary": "#4ECDC4", "accent": "#45B7D1"},
        {"name": "Pastel Dreams", "primary": "#FFB6C1", "secondary": "#E6E6FA", "accent": "#98FB98"},
        {"name": "Bold Contrast", "primary": "#FF4500", "secondary": "#000000", "accent": "#FFFF00"}
    ]',
    '{"rsvp": false, "comments": false, "images": false}'
),

-- Business Templates
(
    'Professional Event',
    'professional-event',
    'business',
    'basic',
    '{"sections": {"header": {"fontSize": "26px", "fontWeight": "600", "textAlign": "left"}, "subtitle": {"fontSize": "16px", "fontWeight": "normal"}, "body": {"fontSize": "14px", "fontWeight": "normal"}}}',
    '[
        {"name": "Corporate Blue", "primary": "#1E3A8A", "secondary": "#F8FAFC", "accent": "#3B82F6"},
        {"name": "Professional Gray", "primary": "#374151", "secondary": "#F9FAFB", "accent": "#6366F1"},
        {"name": "Executive Black", "primary": "#111827", "secondary": "#F3F4F6", "accent": "#10B981"}
    ]',
    '{"rsvp": false, "comments": false, "images": false}'
);

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_tier ON templates(tier);
CREATE INDEX IF NOT EXISTS idx_templates_slug ON templates(slug);
CREATE INDEX IF NOT EXISTS idx_invites_category ON invites(category);

-- =====================================================
-- 5. UPDATE EXISTING INVITES WITH DEFAULT CATEGORY
-- =====================================================

-- Update existing records to have wedding category if null
UPDATE invites 
SET category = 'wedding' 
WHERE category IS NULL OR category = '';

-- =====================================================
-- 6. COMMENTS AND FUTURE CONSIDERATIONS
-- =====================================================

-- Note: This migration is designed to be non-breaking
-- Existing invitations will continue to work unchanged
-- New features are opt-in through template selection
-- Details field structure is backward compatible
