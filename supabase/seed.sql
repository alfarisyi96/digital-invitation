-- Template Seeder
-- This file seeds the templates table with wedding invitation templates
-- Run with: supabase db reset --local (includes seeds) or manually execute this file

-- Clear existing templates first (for reseeding)
DELETE FROM templates WHERE created_at IS NOT NULL;

-- Insert wedding invitation templates
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
    is_premium_only
) VALUES 
-- Template 1: Elegant Classic (Basic Package)
(
    'e1a2b3c4-d5e6-47f8-89a0-123456789abc',
    'Elegant Classic',
    'Timeless elegance with classic typography and golden accents. Perfect for traditional weddings.',
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
    false
),

-- Template 2: Modern Minimalist (Basic Package)
(
    'f2a3b4c5-d6e7-48f9-9ab0-123456789def',
    'Modern Minimalist',
    'Clean, contemporary design with bold typography and subtle geometric elements.',
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
    false
),

-- Template 3: Rustic Garden (Basic Package)
(
    'a3b4c5d6-e7f8-49ab-cdef-123456789012',
    'Rustic Garden',
    'Natural beauty with botanical illustrations and earthy tones. Ideal for outdoor weddings.',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=600&fit=crop',
    '{
        "layout": "organic",
        "theme": "rustic",
        "colors": {
            "primary": "#8FBC8F",
            "secondary": "#DEB887",
            "accent": "#CD853F",
            "text": "#2F4F2F"
        },
        "fonts": {
            "heading": "Libre Baskerville",
            "body": "Lora",
            "accent": "Great Vibes"
        },
        "elements": {
            "border": "botanical_frame",
            "background": "watercolor_texture",
            "decorations": ["leaf_patterns", "floral_wreaths", "wood_elements"]
        },
        "layout_sections": ["floral_header", "couple_portrait", "ceremony_garden", "celebration", "nature_rsvp"]
    }',
    'wedding',
    false,
    true,
    'basic',
    1,
    false
),

-- Template 4: Luxury Royal (Gold Package Only)
(
    'b4c5d6e7-f8a9-4bcd-efab-123456789345',
    'Luxury Royal',
    'Opulent design with gold foil effects, marble textures, and premium typography. Exclusive premium template.',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=600&fit=crop',
    '{
        "layout": "luxury",
        "theme": "royal",
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
            "decorations": ["crown_motifs", "gold_foil", "crystal_accents", "royal_crests"]
        },
        "special_effects": ["parallax_scrolling", "fade_animations", "gold_particle_effects"],
        "layout_sections": ["royal_header", "couple_crest", "ceremony_palace", "reception_ballroom", "premium_rsvp", "gift_registry"]
    }',
    'wedding',
    true,
    true,
    'gold',
    2,
    true
),

-- Template 5: Vintage Romance (Gold Package Only)
(
    'c5d6e7f8-a9bc-4def-abcd-123456789678',
    'Vintage Romance',
    'Romantic vintage design with lace patterns, soft pastels, and calligraphy fonts. Premium exclusive template.',
    'https://images.unsplash.com/photo-1544981236-3ce519d9f4e4?w=400&h=600&fit=crop',
    '{
        "layout": "vintage",
        "theme": "romantic",
        "colors": {
            "primary": "#F8BBD9",
            "secondary": "#E6E6FA",
            "accent": "#FFB6C1",
            "text": "#4B0082"
        },
        "fonts": {
            "heading": "Amatic SC",
            "body": "Merriweather",
            "accent": "Sacramento"
        },
        "elements": {
            "border": "lace_pattern",
            "background": "vintage_paper",
            "decorations": ["rose_borders", "vintage_frames", "ribbon_banners", "pearl_accents"]
        },
        "special_effects": ["soft_glow", "vintage_filter", "floating_petals"],
        "layout_sections": ["romantic_header", "love_story", "ceremony_chapel", "reception_garden", "photo_gallery", "guest_wishes"]
    }',
    'wedding',
    true,
    true,
    'gold',
    2,
    true
),

-- Template 6: Beach Sunset (Basic Package)
(
    'd6e7f8a9-bcde-4fab-cdef-123456789901',
    'Beach Sunset',
    'Coastal vibes with sunset colors and ocean motifs. Perfect for beach and destination weddings.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    '{
        "layout": "coastal",
        "theme": "beach",
        "colors": {
            "primary": "#FF7F50",
            "secondary": "#20B2AA",
            "accent": "#F0E68C",
            "text": "#2F4F4F"
        },
        "fonts": {
            "heading": "Roboto Slab",
            "body": "Source Sans Pro",
            "accent": "Kaushan Script"
        },
        "elements": {
            "border": "wave_pattern",
            "background": "sunset_gradient",
            "decorations": ["seashell_corners", "palm_leaves", "anchor_motifs"]
        },
        "layout_sections": ["ocean_header", "couple_silhouette", "beach_ceremony", "seaside_reception", "island_rsvp"]
    }',
    'wedding',
    false,
    true,
    'basic',
    1,
    false
),

-- Template 7: Urban Chic (Gold Package Only)
(
    'e7f8a9bc-defa-4bcd-efab-123456789234',
    'Urban Chic',
    'Metropolitan sophistication with industrial elements and bold graphics. Exclusive city-style design.',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop',
    '{
        "layout": "metropolitan",
        "theme": "urban",
        "colors": {
            "primary": "#36454F",
            "secondary": "#C0C0C0",
            "accent": "#FF4500",
            "text": "#2F2F2F"
        },
        "fonts": {
            "heading": "Oswald",
            "body": "Raleway",
            "accent": "Quicksand"
        },
        "elements": {
            "border": "industrial_frame",
            "background": "concrete_texture",
            "decorations": ["steel_accents", "neon_highlights", "skyline_silhouettes"]
        },
        "special_effects": ["3d_transitions", "neon_glow", "parallax_cityscape"],
        "layout_sections": ["skyline_header", "urban_couple", "rooftop_ceremony", "loft_reception", "city_rsvp", "downtown_directions"]
    }',
    'wedding',
    true,
    true,
    'gold',
    2,
    true
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
    COUNT(*) FILTER (WHERE required_package = 'gold') as premium_templates
FROM templates;
