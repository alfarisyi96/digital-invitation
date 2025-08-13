-- Template Seeder
-- This file seeds the templates table with wedding invitation templates
-- Updated to match the actual templates available in @invitation/templates package
-- Run with: supabase db reset --local (includes seeds) or manually execute this file

-- Clear existing templates first (for reseeding)
DELETE FROM templates WHERE created_at IS NOT NULL;

-- Insert wedding invitation templates (matching templates package)
INSERT INTO templates (
    id,
    name,
    description,
    thumbnail_url,
    template_data,
    category,
    is_premium,
    is_active,
    required_package,
    package_tier,
    is_premium_only,
    slug,
    tier,
    features
) VALUES 
-- Template 1: Simple Classic (Basic Package)
(
    '11111111-1111-1111-1111-111111111111',
    'Simple Classic',
    'Clean and timeless design with classic typography. Perfect for traditional weddings.',
    'https://images.unsplash.com/photo-1573495627361-d9b87960b12d?w=400&h=600&fit=crop',
    '{
        "layout": "classic",
        "theme": "simple",
        "colors": {
            "primary": "#2C3E50",
            "secondary": "#ECF0F1",
            "accent": "#E74C3C",
            "text": "#34495E"
        },
        "fonts": {
            "heading": "Playfair Display",
            "body": "Crimson Text",
            "accent": "Dancing Script"
        },
        "elements": {
            "border": "simple",
            "background": "white",
            "decorations": ["classic_dividers"]
        },
        "layout_sections": ["header", "couple_names", "ceremony_details", "footer"]
    }',
    'wedding',
    false,
    true,
    'basic',
    1,
    false,
    'simple-classic',
    'basic',
    '{"rsvp": true, "images": false, "comments": true}'
),

-- Template 2: Elegant Basic (Basic Package)
(
    '22222222-2222-2222-2222-222222222222',
    'Elegant Basic',
    'Sophisticated elegance with refined typography and golden accents. Perfect for formal weddings.',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=600&fit=crop',
    '{
        "layout": "elegant",
        "theme": "elegant",
        "colors": {
            "primary": "#D4AF37",
            "secondary": "#8B4513",
            "accent": "#F5F5DC",
            "text": "#2F4F4F"
        },
        "fonts": {
            "heading": "Playfair Display",
            "body": "Crimson Text",
            "accent": "Dancing Script"
        },
        "elements": {
            "border": "ornamental",
            "background": "cream_texture",
            "decorations": ["floral_corners", "elegant_dividers"]
        },
        "layout_sections": ["header", "couple_names", "ceremony_details", "reception_info", "rsvp"]
    }',
    'wedding',
    false,
    true,
    'basic',
    1,
    false,
    'elegant-basic',
    'basic',
    '{"rsvp": true, "images": false, "comments": true}'
),

-- Template 3: Luxury Premium (Premium Package)
(
    '33333333-3333-3333-3333-333333333333',
    'Luxury Premium',
    'Opulent design with gold foil effects, marble textures, and premium features. Exclusive premium template.',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=600&fit=crop',
    '{
        "layout": "luxury",
        "theme": "luxury",
        "colors": {
            "primary": "#FFD700",
            "secondary": "#800080",
            "accent": "#F8F8FF",
            "text": "#191970"
        },
        "fonts": {
            "heading": "Cormorant Garamond",
            "body": "EB Garamond",
            "accent": "Allura"
        },
        "elements": {
            "border": "gold_ornate",
            "background": "marble_luxury",
            "decorations": ["crown_motifs", "gold_foil", "crystal_accents"]
        },
        "special_effects": ["parallax_scrolling", "fade_animations", "gold_particle_effects"],
        "layout_sections": ["hero", "couple_gallery", "ceremony_details", "reception_info", "photo_gallery", "rsvp", "comments"]
    }',
    'wedding',
    true,
    true,
    'gold',
    2,
    true,
    'luxury-premium',
    'premium',
    '{"rsvp": true, "images": true, "comments": true, "gallery": true, "hero_image": true}'
),

-- Template 4: Modern Premium (Premium Package)
(
    '44444444-4444-4444-4444-444444444444',
    'Modern Premium',
    'Contemporary design with bold typography, parallax effects, and modern features. Premium exclusive template.',
    'https://images.unsplash.com/photo-1544981236-3ce519d9f4e4?w=400&h=600&fit=crop',
    '{
        "layout": "modern",
        "theme": "modern",
        "colors": {
            "primary": "#2C3E50",
            "secondary": "#ECF0F1",
            "accent": "#E74C3C",
            "text": "#34495E"
        },
        "fonts": {
            "heading": "Montserrat",
            "body": "Open Sans",
            "accent": "Lato"
        },
        "elements": {
            "border": "minimal",
            "background": "gradient",
            "decorations": ["geometric_shapes", "modern_accents"]
        },
        "special_effects": ["parallax_scrolling", "fade_animations", "smooth_transitions"],
        "layout_sections": ["hero", "couple_story", "ceremony_details", "reception_info", "photo_gallery", "rsvp", "comments"]
    }',
    'wedding',
    true,
    true,
    'gold',
    2,
    true,
    'modern-premium',
    'premium',
    '{"rsvp": true, "images": true, "comments": true, "gallery": true, "hero_image": true, "parallax": true}'
),

-- Template 5: Fallback Templates (for backward compatibility)
-- Elegant Classic (fallback to elegant-basic)
(
    'e1a2b3c4-d5e6-47f8-89a0-123456789abc',
    'Elegant Classic',
    'Timeless elegance with classic typography and golden accents. Maps to Elegant Basic template.',
    'https://images.unsplash.com/photo-1573495627361-d9b87960b12d?w=400&h=600&fit=crop',
    '{
        "layout": "classic",
        "theme": "elegant",
        "colors": {
            "primary": "#D4AF37",
            "secondary": "#8B4513",
            "accent": "#F5F5DC",
            "text": "#2F4F4F"
        },
        "fonts": {
            "heading": "Playfair Display",
            "body": "Crimson Text",
            "accent": "Dancing Script"
        },
        "elements": {
            "border": "ornamental",
            "background": "cream_texture",
            "decorations": ["floral_corners", "gold_dividers"]
        },
        "layout_sections": ["header", "couple_names", "date_time", "venue", "rsvp", "footer"]
    }',
    'wedding',
    false,
    true,
    'basic',
    1,
    false,
    'elegant-classic',
    'basic',
    '{"rsvp": true, "images": false, "comments": true}'
),

-- Modern Minimalist (fallback to simple-classic)
(
    'f2a3b4c5-d6e7-48f9-9ab0-123456789def',
    'Modern Minimalist',
    'Clean, contemporary design with bold typography. Maps to Simple Classic template.',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=600&fit=crop',
    '{
        "layout": "modern",
        "theme": "minimalist",
        "colors": {
            "primary": "#2C3E50",
            "secondary": "#ECF0F1",
            "accent": "#E74C3C",
            "text": "#34495E"
        },
        "fonts": {
            "heading": "Montserrat",
            "body": "Open Sans",
            "accent": "Lato"
        },
        "elements": {
            "border": "thin_line",
            "background": "white_clean",
            "decorations": ["geometric_shapes", "subtle_shadows"]
        },
        "layout_sections": ["hero", "couple_info", "ceremony_details", "reception_info", "rsvp_form"]
    }',
    'wedding',
    false,
    true,
    'basic',
    1,
    false,
    'modern-minimalist',
    'basic',
    '{"rsvp": true, "images": false, "comments": true}'
);

-- Insert package definitions if they don't exist
INSERT INTO package_definitions (
    id,
    package_name,
    display_name,
    description,
    price,
    max_invitations,
    max_templates_access,
    features,
    is_active
) VALUES 
(
    '11111111-2222-3333-4444-555555555555',
    'basic',
    'Basic',
    'Perfect for simple wedding invitations',
    0,
    1,
    10,
    '["1 invitation", "Basic templates", "Standard support", "Basic customization"]',
    true
),
(
    '22222222-3333-4444-5555-666666666666', 
    'gold',
    'Gold',
    'Premium unlimited invitations with exclusive templates',
    9.99,
    -1,
    -1,
    '["Unlimited invitations", "Premium templates", "Priority support", "Advanced customization", "Export options", "Analytics"]',
    true
) ON CONFLICT (id) DO NOTHING;

-- Log seeding completion
SELECT 
    COUNT(*) as templates_seeded,
    COUNT(*) FILTER (WHERE required_package = 'basic') as basic_templates,
    COUNT(*) FILTER (WHERE required_package = 'gold') as premium_templates,
    COUNT(*) FILTER (WHERE tier = 'basic') as basic_tier,
    COUNT(*) FILTER (WHERE tier = 'premium') as premium_tier
FROM templates;

-- Show template mapping
SELECT 
    name,
    slug,
    tier,
    required_package,
    CASE 
        WHEN id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444')
        THEN 'Available in templates package'
        ELSE 'Fallback mapping'
    END as availability_status
FROM templates
ORDER BY tier, name;
