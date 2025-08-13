-- =====================================================
-- TEMPLATE DATA MIGRATION
-- Date: 2025-08-13
-- Description: Insert initial template data for wedding invitations
-- This migration adds our Phase 2 template components to the database
-- =====================================================

-- Insert our Phase 2 templates
INSERT INTO templates (
  id,
  name,
  description,
  slug,
  category,
  required_package,
  package_tier,
  tier,
  is_premium,
  is_premium_only,
  template_data,
  default_styles,
  color_combinations,
  features,
  thumbnail_url,
  is_active
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Sunda Traditional',
  'Traditional Indonesian Sunda wedding invitation with elegant gold accents and cultural motifs',
  'sunda-traditional',
  'wedding',
  'basic',
  1,
  'basic',
  false,
  false,
  '{
    "layout": "vertical",
    "sections": ["hero", "couple", "event", "location", "closing"],
    "defaultText": {
      "title": "Undangan Pernikahan",
      "subtitle": "Dengan memohon ridho Allah SWT",
      "groomName": "Rahmat",
      "brideName": "Sari",
      "eventDate": "Sabtu, 15 Juni 2024",
      "eventTime": "09:00 WIB",
      "venue": "Gedung Serbaguna",
      "address": "Jl. Merdeka No. 123, Bandung",
      "closing": "Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir"
    }
  }',
  '{
    "--primary-color": "#D4AF37",
    "--secondary-color": "#8B4513",
    "--accent-color": "#FFD700",
    "--text-color": "#2C1810",
    "--background-color": "#FFF8DC",
    "--font-family": "\"Playfair Display\", serif",
    "--heading-font": "\"Playfair Display\", serif"
  }',
  '[
    {
      "name": "Golden Traditional",
      "primary": "#D4AF37",
      "secondary": "#8B4513",
      "accent": "#FFD700",
      "text": "#2C1810",
      "background": "#FFF8DC"
    },
    {
      "name": "Royal Blue",
      "primary": "#1E3A8A",
      "secondary": "#3B82F6",
      "accent": "#60A5FA",
      "text": "#1F2937",
      "background": "#F8FAFC"
    },
    {
      "name": "Emerald Green",
      "primary": "#047857",
      "secondary": "#10B981",
      "accent": "#34D399",
      "text": "#1F2937",
      "background": "#F0FDF4"
    }
  ]',
  '{
    "rsvp": false,
    "images": false,
    "comments": false,
    "responsive": true,
    "customizable": true
  }',
  '/templates/sunda-traditional-thumb.jpg',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Modern Minimalist',
  'Clean and elegant modern wedding invitation with minimalist design and typography focus',
  'modern-minimalist',
  'category',
  'gold',
  2,
  'gold',
  true,
  false,
  '{
    "layout": "clean",
    "sections": ["hero", "couple", "event", "rsvp"],
    "defaultText": {
      "title": "Wedding Invitation",
      "subtitle": "Together with our families",
      "groomName": "Alexander",
      "brideName": "Jessica",
      "eventDate": "Saturday, June 15, 2024",
      "eventTime": "4:00 PM",
      "venue": "Grand Ballroom",
      "address": "The Plaza Hotel, New York",
      "rsvp": "Please confirm your attendance"
    }
  }',
  '{
    "--primary-color": "#1F2937",
    "--secondary-color": "#6B7280",
    "--accent-color": "#F59E0B",
    "--text-color": "#111827",
    "--background-color": "#FFFFFF",
    "--font-family": "\"Inter\", sans-serif",
    "--heading-font": "\"Playfair Display\", serif"
  }',
  '[
    {
      "name": "Modern Classic",
      "primary": "#1F2937",
      "secondary": "#6B7280",
      "accent": "#F59E0B",
      "text": "#111827",
      "background": "#FFFFFF"
    },
    {
      "name": "Rose Gold",
      "primary": "#BE185D",
      "secondary": "#EC4899",
      "accent": "#F9A8D4",
      "text": "#831843",
      "background": "#FDF2F8"
    },
    {
      "name": "Ocean Blue",
      "primary": "#0C4A6E",
      "secondary": "#0284C7",
      "accent": "#38BDF8",
      "text": "#0F172A",
      "background": "#F0F9FF"
    }
  ]',
  '{
    "rsvp": true,
    "images": true,
    "comments": false,
    "responsive": true,
    "customizable": true,
    "animations": true
  }',
  '/templates/modern-minimalist-thumb.jpg',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Royal Elegant',
  'Luxurious royal wedding invitation with purple tones and elegant crown motifs',
  'royal-elegant',
  'wedding',
  'gold',
  2,
  'gold',
  true,
  false,
  '{
    "layout": "luxury",
    "sections": ["hero", "couple", "ceremony", "reception", "rsvp"],
    "defaultText": {
      "title": "Royal Wedding Invitation",
      "subtitle": "By the Grace of God",
      "groomName": "Prince Alexander",
      "brideName": "Princess Isabella",
      "eventDate": "Saturday, June 15, 2024",
      "eventTime": "3:00 PM",
      "venue": "St. Marys Cathedral",
      "address": "123 Cathedral Street, Royal City",
      "rsvp": "Kindly Respond",
      "closing": "Together with our families, we invite you to share in our joy"
    }
  }',
  '{
    "--primary-color": "#7C3AED",
    "--secondary-color": "#A855F7",
    "--accent-color": "#DDD6FE",
    "--text-color": "#1F2937",
    "--background-color": "#FFFFFF",
    "--font-family": "\"Playfair Display\", serif",
    "--heading-font": "\"Playfair Display\", serif"
  }',
  '[
    {
      "name": "Royal Purple",
      "primary": "#7C3AED",
      "secondary": "#A855F7",
      "accent": "#DDD6FE",
      "text": "#1F2937",
      "background": "#FFFFFF"
    },
    {
      "name": "Emerald Royal",
      "primary": "#047857",
      "secondary": "#10B981",
      "accent": "#A7F3D0",
      "text": "#1F2937",
      "background": "#ECFDF5"
    },
    {
      "name": "Navy Gold",
      "primary": "#1E3A8A",
      "secondary": "#F59E0B",
      "accent": "#FEF3C7",
      "text": "#1F2937",
      "background": "#FFFBEB"
    }
  ]',
  '{
    "rsvp": true,
    "images": true,
    "comments": false,
    "responsive": true,
    "customizable": true,
    "luxury_design": true
  }',
  '/templates/royal-elegant-thumb.jpg',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Floral Romantic',
  'Romantic floral wedding invitation with pink and rose tones and flower motifs',
  'floral-romantic',
  'wedding',
  'gold',
  2,
  'gold',
  true,
  false,
  '{
    "layout": "romantic",
    "sections": ["hero", "couple", "event", "rsvp"],
    "defaultText": {
      "title": "Wedding Invitation",
      "subtitle": "Join us in celebration",
      "groomName": "David",
      "brideName": "Sarah",
      "eventDate": "Saturday, June 15, 2024",
      "eventTime": "4:00 PM",
      "venue": "Garden Rose Chapel",
      "address": "123 Blossom Avenue, Flower City",
      "rsvp": "Please join us as we celebrate our love story",
      "closing": "With love and gratitude"
    }
  }',
  '{
    "--primary-color": "#BE185D",
    "--secondary-color": "#EC4899",
    "--accent-color": "#FBCFE8",
    "--text-color": "#831843",
    "--background-color": "#FDF2F8",
    "--font-family": "\"Dancing Script\", cursive",
    "--heading-font": "\"Dancing Script\", cursive"
  }',
  '[
    {
      "name": "Rose Garden",
      "primary": "#BE185D",
      "secondary": "#EC4899",
      "accent": "#FBCFE8",
      "text": "#831843",
      "background": "#FDF2F8"
    },
    {
      "name": "Lavender Dreams",
      "primary": "#7C3AED",
      "secondary": "#A78BFA",
      "accent": "#EDE9FE",
      "text": "#581C87",
      "background": "#FAF5FF"
    },
    {
      "name": "Peach Blossom",
      "primary": "#EA580C",
      "secondary": "#FB923C",
      "accent": "#FED7AA",
      "text": "#9A3412",
      "background": "#FFF7ED"
    }
  ]',
  '{
    "rsvp": true,
    "images": true,
    "comments": false,
    "responsive": true,
    "customizable": true,
    "floral_elements": true
  }',
  '/templates/floral-romantic-thumb.jpg',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  'Rustic Charm',
  'Country-style rustic wedding invitation with warm amber tones and barn motifs',
  'rustic-charm',
  'wedding',
  'basic',
  1,
  'basic',
  false,
  false,
  '{
    "layout": "rustic",
    "sections": ["hero", "couple", "event", "reception", "rsvp"],
    "defaultText": {
      "title": "Rustic Wedding",
      "subtitle": "A Country Celebration",
      "groomName": "Jack",
      "brideName": "Emma",
      "eventDate": "Saturday, June 15, 2024",
      "eventTime": "5:00 PM",
      "venue": "Barn at Sunset Farm",
      "address": "123 Country Road, Countryside Valley",
      "rsvp": "Please Join Us!",
      "closing": "Cant wait to celebrate with our favorite people!"
    }
  }',
  '{
    "--primary-color": "#92400E",
    "--secondary-color": "#D97706",
    "--accent-color": "#FED7AA",
    "--text-color": "#78350F",
    "--background-color": "#FFFBEB",
    "--font-family": "\"Merriweather\", serif",
    "--heading-font": "\"Merriweather\", serif"
  }',
  '[
    {
      "name": "Autumn Harvest",
      "primary": "#92400E",
      "secondary": "#D97706",
      "accent": "#FED7AA",
      "text": "#78350F",
      "background": "#FFFBEB"
    },
    {
      "name": "Forest Green",
      "primary": "#166534",
      "secondary": "#22C55E",
      "accent": "#BBF7D0",
      "text": "#14532D",
      "background": "#F0FDF4"
    },
    {
      "name": "Sunset Orange",
      "primary": "#C2410C",
      "secondary": "#FB923C",
      "accent": "#FFEDD5",
      "text": "#9A3412",
      "background": "#FFF7ED"
    }
  ]',
  '{
    "rsvp": true,
    "images": true,
    "comments": false,
    "responsive": true,
    "customizable": true,
    "rustic_style": true
  }',
  '/templates/rustic-charm-thumb.jpg',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  'Placeholder Template',
  'Placeholder template for testing and development purposes',
  'placeholder',
  'wedding',
  'basic',
  1,
  'basic',
  false,
  false,
  '{
    "layout": "simple",
    "sections": ["header", "content", "footer"],
    "defaultText": {
      "title": "Sample Wedding Invitation",
      "subtitle": "Join us for our special day",
      "content": "This is a placeholder template used during development"
    }
  }',
  '{
    "--primary-color": "#6B7280",
    "--secondary-color": "#9CA3AF",
    "--accent-color": "#D1D5DB",
    "--text-color": "#374151",
    "--background-color": "#F9FAFB",
    "--font-family": "system-ui, sans-serif",
    "--heading-font": "system-ui, sans-serif"
  }',
  '[
    {
      "name": "Default Gray",
      "primary": "#6B7280",
      "secondary": "#9CA3AF",
      "accent": "#D1D5DB",
      "text": "#374151",
      "background": "#F9FAFB"
    }
  ]',
  '{
    "rsvp": false,
    "images": false,
    "comments": false,
    "responsive": true,
    "customizable": true
  }',
  '/templates/placeholder-thumb.jpg',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  required_package = EXCLUDED.required_package,
  package_tier = EXCLUDED.package_tier,
  tier = EXCLUDED.tier,
  is_premium = EXCLUDED.is_premium,
  is_premium_only = EXCLUDED.is_premium_only,
  template_data = EXCLUDED.template_data,
  default_styles = EXCLUDED.default_styles,
  color_combinations = EXCLUDED.color_combinations,
  features = EXCLUDED.features,
  thumbnail_url = EXCLUDED.thumbnail_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the insertion
SELECT 
  name,
  slug,
  required_package,
  package_tier,
  is_active
FROM templates 
WHERE slug IN ('sunda-traditional', 'modern-minimalist', 'floral-romantic', 'rustic-charm', 'placeholder')
ORDER BY package_tier, name;
