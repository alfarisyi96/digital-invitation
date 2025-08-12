# Template Seeder Documentation

This project includes a comprehensive template seeding system that populates the database with wedding invitation templates and package definitions.

## Available Commands

### Shell Script (Unix/Linux/macOS)
```bash
# Run the shell script directly
./seed-templates.sh

# Or using npm script
npm run seed:templates
npm run db:seed
```

### Node.js Script (Cross-platform)
```bash
# Run the Node.js script directly  
node seed-templates.js

# Or using npm script
npm run seed:templates
```

### Combined Commands
```bash
# Reset database and seed templates
npm run db:reset:seed

# Start Supabase, reset DB, seed templates, and start frontend
npm run setup
```

## What Gets Seeded

### Templates (7 total)
**Basic Package Templates (4):**
1. **Elegant Classic** - Timeless elegance with classic typography and golden accents
2. **Modern Minimalist** - Clean, contemporary design with bold typography  
3. **Rustic Garden** - Natural beauty with botanical illustrations and earthy tones
4. **Beach Sunset** - Coastal vibes with sunset colors and ocean motifs

**Premium/Gold Package Templates (3):**
1. **Luxury Royal** - Opulent design with gold foil effects and marble textures
2. **Vintage Romance** - Romantic vintage design with lace patterns and pastels
3. **Urban Chic** - Metropolitan sophistication with industrial elements

### Package Definitions (2)
1. **Basic Package** - Free, 1 invitation limit, basic templates
2. **Gold Package** - $9.99, unlimited invitations, premium templates

## Template Structure

Each template includes:
- **Basic Info**: Name, description, thumbnail URL
- **Design Data**: Colors, fonts, layout elements, decorations
- **Package Requirements**: Basic or Gold package access
- **Special Effects**: Premium templates include advanced animations
- **Layout Sections**: Predefined sections for different invitation parts

## Prerequisites

- Supabase running locally (`supabase start`)
- PostgreSQL client tools (`psql`) installed
- Node.js (for the JavaScript version)

## File Structure

```
/
├── seed-templates.sh          # Shell script seeder
├── seed-templates.js          # Node.js script seeder  
├── supabase/seed.sql          # SQL seed data
├── package.json               # NPM scripts
└── README-SEEDER.md          # This documentation
```

## Template Data Structure

Templates are stored with comprehensive JSON configuration:

```json
{
  "layout": "classic|modern|organic|luxury|vintage|coastal|metropolitan",
  "theme": "elegant|minimalist|rustic|royal|romantic|beach|urban", 
  "colors": {
    "primary": "#color",
    "secondary": "#color",
    "accent": "#color", 
    "text": "#color"
  },
  "fonts": {
    "heading": "Font Name",
    "body": "Font Name",
    "accent": "Font Name"
  },
  "elements": {
    "border": "style",
    "background": "texture",
    "decorations": ["element1", "element2"]
  },
  "special_effects": ["effect1", "effect2"], // Premium only
  "layout_sections": ["section1", "section2", "section3"]
}
```

## Usage in Application

After seeding, templates can be accessed via:

```sql
-- Get all basic templates
SELECT * FROM templates WHERE required_package = 'basic' AND is_active = true;

-- Get premium templates  
SELECT * FROM templates WHERE required_package = 'gold' AND is_active = true;

-- Get template by ID
SELECT * FROM templates WHERE id = 'template-uuid';
```

## Troubleshooting

### Common Issues

1. **"Supabase is not running"**
   ```bash
   supabase start
   ```

2. **"Seed file not found"**
   - Ensure you're in the project root directory
   - Check that `supabase/seed.sql` exists

3. **"Permission denied"**
   ```bash
   chmod +x seed-templates.sh
   chmod +x seed-templates.js
   ```

4. **"pg_isready command not found"**
   - Install PostgreSQL client tools
   - Or use the Node.js version instead

### Verify Seeding

```bash
# Check template count
npm run db:query "SELECT COUNT(*) FROM templates;"

# Check package definitions
npm run db:query "SELECT package_name, display_name FROM package_definitions;"
```

## Customization

To add more templates:

1. Edit `supabase/seed.sql`
2. Add new template entries following the existing pattern
3. Use proper UUID format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
4. Set appropriate `required_package` and `package_tier`
5. Run seeder to apply changes

## Integration with Frontend

The seeded templates integrate with:

- Template selection in invitation creation flow
- Package-based access control
- Theme customization system
- Preview functionality

Templates are automatically filtered based on user's current package (basic/gold) ensuring proper access control.
