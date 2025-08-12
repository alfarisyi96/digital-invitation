# Database Migration Documentation

## Overview
This comprehensive migration captures the current state of the Supabase database and fixes several critical issues that were causing inconsistencies and foreign key constraint violations.

## Issues Addressed

### 1. **Corrupted Users Table** 
- **Problem**: The `users` table had duplicate and conflicting columns from mixing Supabase Auth schema with custom schema
- **Solution**: Clean recreation of users table with proper structure and data migration

### 2. **Missing Auth User Sync**
- **Problem**: Users created in `auth.users` were not automatically synced to custom `users` table, causing foreign key violations
- **Solution**: Created `handle_new_user()` function and `on_auth_user_created` trigger for automatic sync

### 3. **Inconsistent Schema**
- **Problem**: Missing indexes, inconsistent constraints, and unorganized structure
- **Solution**: Comprehensive schema standardization with proper indexes and constraints

## Migration Files

### Primary Migration: `20250809100000_comprehensive_schema_migration.sql`
This file contains:

1. **Schema Cleanup**
   - Fixes corrupted users table
   - Standardizes all table structures
   - Adds proper constraints and indexes

2. **Functions**
   - `handle_new_user()`: Syncs auth users with custom users table
   - `update_updated_at_column()`: Automatically updates timestamps
   - `generate_referral_code()`: Creates unique referral codes
   - `generate_unique_slug()`: Creates unique invitation slugs
   - `track_invitation_visitor()`: Tracks invitation visitors
   - `get_dashboard_stats()`: Provides dashboard statistics

3. **Triggers**
   - Auth user sync trigger
   - Updated_at triggers for all tables
   - Referral code generation trigger

4. **Views**
   - `user_stats`: User statistics
   - `invite_stats`: Invitation statistics  
   - `order_stats`: Order statistics

5. **Initial Data**
   - Sample plans (Free, Pro, Enterprise)

### Rollback Migration: `20250809100001_rollback_comprehensive_schema.sql`
- Safely removes all additions from the comprehensive migration
- Preserves data by default (table drops are commented out)
- Can be used to revert if issues arise

## Database Schema

### Core Tables

#### users
- Primary user table synced with Supabase Auth
- Links to resellers for commission tracking
- **Key Fix**: Cleaned up corruption and established proper auth sync

#### invites  
- Main invitation entities
- Links to users (creators) and templates
- Tracks views, confirmations, and visitor statistics
- **Key Fix**: Foreign key to users now works properly

#### templates
- Invitation templates with JSON data
- Categorized and can be premium/free
- Used as base for creating invitations

#### admin_users
- Separate admin authentication system
- Independent from regular users

#### resellers
- Reseller management with commission tracking
- Auto-generates unique referral codes
- Links to users for commission attribution

#### plans
- Subscription/pricing plans
- JSON features configuration
- Limits for invites and templates

#### orders
- Transaction records
- Links users, plans, and resellers
- Tracks commission amounts

#### Supporting Tables
- `invite_guests`: Guest list for invitations
- `invite_visitors`: Visitor tracking for analytics

### Critical Relationships

```sql
-- Auth sync (fixes the main issue)
auth.users --> users (via trigger)

-- Core relationships
users --> invites (one-to-many)
templates --> invites (template usage)
invites --> invite_guests (guest lists)
invites --> invite_visitors (analytics)
resellers --> users (affiliate relationships)
plans --> orders (purchases)
```

## Running the Migration

### Apply Migration
```bash
# Run the comprehensive migration
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/migrations/20250809100000_comprehensive_schema_migration.sql
```

### Verify Migration
```bash
# Check that tables exist
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "\dt"

# Check that triggers exist
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';"

# Test auth sync
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "SELECT COUNT(*) FROM users;"
```

### Rollback (if needed)
```bash
# Rollback migration (preserves data)
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/migrations/20250809100001_rollback_comprehensive_schema.sql
```

## Testing the Fix

After running the migration:

1. **Test Auth Sync**: Sign up a new user and verify they appear in both `auth.users` and `users` tables
2. **Test Invitation Creation**: Create an invitation to verify foreign key constraints work
3. **Test Referral Codes**: Create a reseller and verify unique referral code generation
4. **Test Analytics**: Visit an invitation and verify visitor tracking

## Future Enhancements

When enhancing the database:

1. **Always create migrations**: Don't modify the database directly
2. **Test with sample data**: Use the provided sample plans and test users
3. **Check constraints**: Ensure new tables have proper foreign keys and indexes
4. **Update documentation**: Keep this file updated with schema changes

## Monitoring

Key things to monitor after migration:

- **Auth sync**: Ensure new users appear in both tables
- **Foreign key violations**: Should be eliminated
- **Performance**: New indexes should improve query performance
- **Data integrity**: Check that relationships are maintained

## Backup Strategy

Before any future migrations:

```bash
# Backup entire database
pg_dump "postgresql://postgres:postgres@127.0.0.1:54322/postgres" > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific tables
pg_dump "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -t users -t invites > critical_tables_backup.sql
```

This migration provides a solid foundation for the invitation system with proper data integrity, performance optimization, and automatic auth synchronization.
