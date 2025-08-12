-- Migration: Enhance existing templates table for new template system
-- Date: 2025-08-11
-- Adds missing fields to existing templates table

-- Add missing columns to templates table
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS default_styles JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS color_combinations JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{"rsvp": false, "comments": false, "images": false}';

-- Add missing columns to invites table  
ALTER TABLE invites 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'wedding',
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '{}';

-- Update existing templates with slugs and enhanced data
UPDATE templates SET 
    slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', '')) 
WHERE slug IS NULL;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_templates_slug ON templates(slug);
CREATE INDEX IF NOT EXISTS idx_templates_tier ON templates(tier);
CREATE INDEX IF NOT EXISTS idx_invites_category ON invites(category);

-- Insert sample enhanced templates (only if they don't exist)
INSERT INTO templates (name, slug, category, tier, description, thumbnail_url, template_data, default_styles, color_combinations, features, is_premium, is_active)
SELECT * FROM (VALUES
    (
        'Sunda Traditional Wedding',
        'sunda-traditional',
        'wedding',
        'basic',
        'Traditional Indonesian wedding invitation with cultural elements',
        NULL,
        '{}'::jsonb,
        '{"sections": {"header": {"fontSize": "32px", "fontWeight": "bold", "textAlign": "center"}, "subtitle": {"fontSize": "18px", "fontWeight": "normal"}, "body": {"fontSize": "16px", "fontWeight": "normal"}}}'::jsonb,
        '[
            {"name": "Traditional Gold", "primary": "#D4AF37", "secondary": "#8B4513", "accent": "#FFD700"},
            {"name": "Elegant Maroon", "primary": "#800020", "secondary": "#F5F5DC", "accent": "#CD853F"},
            {"name": "Royal Blue", "primary": "#4169E1", "secondary": "#F0F8FF", "accent": "#FFD700"}
        ]'::jsonb,
        '{"rsvp": false, "comments": false, "images": false}'::jsonb,
        false,
        true
    ),
    (
        'Modern Minimalist Wedding',
        'modern-minimalist',
        'wedding',
        'basic',
        'Clean and modern wedding invitation design',
        NULL,
        '{}'::jsonb,
        '{"sections": {"header": {"fontSize": "28px", "fontWeight": "300", "textAlign": "center"}, "subtitle": {"fontSize": "16px", "fontWeight": "normal"}, "body": {"fontSize": "14px", "fontWeight": "normal"}}}'::jsonb,
        '[
            {"name": "Clean White", "primary": "#2D3748", "secondary": "#F7FAFC", "accent": "#4299E1"},
            {"name": "Soft Gray", "primary": "#4A5568", "secondary": "#EDF2F7", "accent": "#38B2AC"},
            {"name": "Warm Beige", "primary": "#744210", "secondary": "#FFFAF0", "accent": "#D69E2E"}
        ]'::jsonb,
        '{"rsvp": false, "comments": false, "images": false}'::jsonb,
        false,
        true
    ),
    (
        'Royal Wedding Premium',
        'royal-wedding',
        'wedding',
        'premium',
        'Luxurious wedding invitation with premium features',
        NULL,
        '{}'::jsonb,
        '{"sections": {"header": {"fontSize": "36px", "fontWeight": "bold", "textAlign": "center"}, "subtitle": {"fontSize": "20px", "fontWeight": "normal"}, "body": {"fontSize": "16px", "fontWeight": "normal"}}}'::jsonb,
        '[
            {"name": "Royal Purple", "primary": "#6B46C1", "secondary": "#F3F4F6", "accent": "#D97706"},
            {"name": "Elegant Black", "primary": "#1A202C", "secondary": "#F7FAFC", "accent": "#E53E3E"},
            {"name": "Classic Gold", "primary": "#B7791F", "secondary": "#FFFAF0", "accent": "#C53030"}
        ]'::jsonb,
        '{"rsvp": true, "comments": true, "images": true}'::jsonb,
        true,
        true
    )
) AS new_templates(name, slug, category, tier, description, thumbnail_url, template_data, default_styles, color_combinations, features, is_premium, is_active)
WHERE NOT EXISTS (
    SELECT 1 FROM templates WHERE slug = new_templates.slug
);

-- Update existing invites to have wedding category if null
UPDATE invites 
SET category = 'wedding' 
WHERE category IS NULL OR category = '';

-- Ensure slug uniqueness constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'templates_slug_key' 
        AND table_name = 'templates'
    ) THEN
        ALTER TABLE templates ADD CONSTRAINT templates_slug_key UNIQUE (slug);
    END IF;
END $$;
