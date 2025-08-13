# Template Seeder Documentation

## Overview

The template seeder is responsible for populating the `templates` table with wedding invitation templates that correspond to the actual template components available in the `@invitation/templates` package.

## Files

### 1. `seed.sql` - Main Seeder
- **Purpose**: SQL script that seeds templates and package definitions
- **Usage**: Run via `supabase db reset` or manually with `psql`
- **Features**: 
  - Clears existing templates for clean reseeding
  - Inserts templates with proper UUIDs and metadata
  - Includes both primary templates and fallback mappings
  - Seeds package definitions

### 2. `seed-templates.js` - JavaScript Runner
- **Purpose**: Cross-platform Node.js script for running the seeder
- **Usage**: `node supabase/seed-templates.js`
- **Features**:
  - Checks Supabase connection before seeding
  - Provides colored console output with progress indicators
  - Shows detailed summary of seeded templates
  - Error handling with helpful messages

## Template Mapping

### Primary Templates (Available in Templates Package)
1. **Simple Classic** (`simple-classic`)
   - ID: `11111111-1111-1111-1111-111111111111`
   - Tier: Basic
   - Package: basic

2. **Elegant Basic** (`elegant-basic`)
   - ID: `22222222-2222-2222-2222-222222222222`
   - Tier: Basic
   - Package: basic

3. **Luxury Premium** (`luxury-premium`)
   - ID: `33333333-3333-3333-3333-333333333333`
   - Tier: Premium
   - Package: gold

4. **Modern Premium** (`modern-premium`)
   - ID: `44444444-4444-4444-4444-444444444444`
   - Tier: Premium
   - Package: gold

### Fallback Templates (For Backward Compatibility)
1. **Elegant Classic** (`elegant-classic`)
   - Maps to: `elegant-basic` component
   - ID: `e1a2b3c4-d5e6-47f8-89a0-123456789abc`

2. **Modern Minimalist** (`modern-minimalist`)
   - Maps to: `simple-classic` component
   - ID: `f2a3b4c5-d6e7-48f9-9ab0-123456789def`

## Template Registry Mapping

The `@invitation/templates` package registry includes fallback mappings:

```typescript
const templateImports = {
  'simple-classic': () => import('./basic/SimpleClassic/index'),
  'elegant-basic': () => import('./basic/ElegantBasic/index'),
  'elegant-classic': () => import('./basic/ElegantBasic/index'), // Fallback
  'modern-minimalist': () => import('./basic/SimpleClassic/index'), // Fallback
  'luxury-premium': () => import('./premium/LuxuryPremium/index'),
  'modern-premium': () => import('./premium/ModernPremium/index'),
}
```

## Features Included

### Basic Templates
- RSVP functionality
- Comments system
- Basic ceremony details

### Premium Templates
- All basic features plus:
- Hero image support
- Photo galleries
- Parallax effects (Modern Premium only)
- Advanced customization options

## Usage Instructions

### Running the Seeder

#### Option 1: Via Database Reset (Recommended)
```bash
cd /path/to/project/web/supabase
supabase db reset
```

#### Option 2: Via JavaScript Runner
```bash
cd /path/to/project/web
node supabase/seed-templates.js
```

#### Option 3: Direct SQL Execution
```bash
cd /path/to/project/web/supabase
psql postgresql://postgres:postgres@localhost:54322/postgres -f seed.sql
```

### Verification

After seeding, verify templates are loaded:

```sql
SELECT name, slug, tier, required_package 
FROM templates 
ORDER BY tier, name;
```

Expected output: 6 templates (4 basic, 2 premium)

### Updating Existing Invitations

If you have existing invitations, update them to use valid template IDs:

```sql
-- For existing invitations with old template references
UPDATE invites 
SET template_id = 'e1a2b3c4-d5e6-47f8-89a0-123456789abc' 
WHERE template_id IS NULL OR template_id NOT IN (
    SELECT id FROM templates
);
```

## Package Definitions

The seeder also creates package definitions:

1. **Basic Package**
   - Price: Free
   - Max Invitations: 1
   - Access: Basic templates only

2. **Gold Package**  
   - Price: $9.99
   - Max Invitations: Unlimited (-1)
   - Access: All templates including premium

## Troubleshooting

### Common Issues

1. **Supabase Not Running**
   ```bash
   supabase start
   ```

2. **Template Not Found Errors**
   - Ensure templates package is built: `cd packages/templates && npm run build`
   - Check template registry includes the slug

3. **UUID Format Errors**
   - Template IDs must be valid UUIDs
   - Use the predefined UUIDs in the seeder

4. **Permission Errors**
   - Ensure proper database permissions
   - Check Supabase is running on correct port (54322)

## Development Notes

- Template components must exist in `packages/templates/src/`
- Template registry must include all slug mappings
- Database templates should have corresponding React components
- Fallback mappings allow backward compatibility
- Features JSON defines available template capabilities

## Future Enhancements

- Dynamic template discovery from filesystem
- Template validation against components
- Automatic thumbnail generation
- Template versioning support
- Custom template upload system
