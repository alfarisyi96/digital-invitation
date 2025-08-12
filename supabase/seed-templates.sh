#!/bin/bash

# Template Seeder Script
# This script seeds the database with wedding invitation templates

set -e

echo "🌱 Template Seeder Starting..."

# Configuration
DB_HOST="localhost"
DB_PORT="54322"
DB_USER="postgres"
DB_NAME="postgres"
SEED_FILE="supabase/seed.sql"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if supabase is running
echo "📡 Checking Supabase connection..."
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; then
    echo -e "${RED}❌ Supabase is not running. Please start it with: supabase start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Supabase is running${NC}"

# Check if seed file exists
if [ ! -f "$SEED_FILE" ]; then
    echo -e "${RED}❌ Seed file not found: $SEED_FILE${NC}"
    exit 1
fi

# Run the seeder
echo "🌱 Seeding templates..."
if PGPASSWORD=postgres psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$SEED_FILE"; then
    echo -e "${GREEN}✅ Templates seeded successfully!${NC}"
    
    # Show summary
    echo ""
    echo "📊 Seeding Summary:"
    PGPASSWORD=postgres psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
    SELECT 
        '📝 Total Templates: ' || COUNT(*) as summary
    FROM templates
    UNION ALL
    SELECT 
        '🆓 Basic Templates: ' || COUNT(*) 
    FROM templates WHERE required_package = 'basic'
    UNION ALL
    SELECT 
        '👑 Premium Templates: ' || COUNT(*) 
    FROM templates WHERE required_package = 'gold'
    UNION ALL
    SELECT 
        '📦 Package Definitions: ' || COUNT(*) 
    FROM package_definitions;
    " -t
    
    echo ""
    echo -e "${GREEN}🎉 Seeding completed successfully!${NC}"
    echo -e "${YELLOW}💡 Templates are now available in your application${NC}"
else
    echo -e "${RED}❌ Seeding failed${NC}"
    exit 1
fi
