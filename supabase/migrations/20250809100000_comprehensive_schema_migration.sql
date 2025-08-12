-- =====================================================
-- COMPREHENSIVE DATABASE MIGRATION
-- Date: 2025-08-09
-- Description: Complete database schema with all tables, functions, triggers, and constraints
-- This migration captures the current state and fixes inconsistencies
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

-- Create enum for invite status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_status') THEN
        CREATE TYPE invite_status AS ENUM ('draft', 'published', 'archived');
    END IF;
END $$;

-- =====================================================
-- CLEAN UP AND RECREATE USERS TABLE
-- =====================================================

-- Simply create the users table (no backup needed for fresh install)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    reseller_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    features JSONB,
    max_invites INTEGER,
    max_templates INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resellers Table
CREATE TABLE IF NOT EXISTS resellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    company_name VARCHAR(255),
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    referral_code VARCHAR(20) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Templates Table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    template_data JSONB NOT NULL,
    category VARCHAR(50),
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Invites Table
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    template_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    venue VARCHAR(500),
    location VARCHAR(500),
    custom_data JSONB,
    status invite_status DEFAULT 'draft',
    views_count INTEGER DEFAULT 0,
    confirmations_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    rsvp_count INTEGER DEFAULT 0,
    confirmed_count INTEGER DEFAULT 0,
    share_url VARCHAR(500),
    public_slug VARCHAR(255) UNIQUE,
    category_id UUID,
    require_approval BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Invite Guests Table
CREATE TABLE IF NOT EXISTS invite_guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invite_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Invite Visitors Table
CREATE TABLE IF NOT EXISTS invite_visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invite_id UUID,
    visitor_id VARCHAR(255) NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(invite_id, visitor_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    plan_id UUID,
    reseller_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key constraints
ALTER TABLE users 
    DROP CONSTRAINT IF EXISTS users_reseller_id_fkey,
    ADD CONSTRAINT users_reseller_id_fkey 
    FOREIGN KEY (reseller_id) REFERENCES resellers(id) ON DELETE SET NULL;

ALTER TABLE invites 
    DROP CONSTRAINT IF EXISTS invites_user_id_fkey,
    ADD CONSTRAINT invites_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE invites 
    DROP CONSTRAINT IF EXISTS invites_template_id_fkey,
    ADD CONSTRAINT invites_template_id_fkey 
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL;

ALTER TABLE invite_guests 
    DROP CONSTRAINT IF EXISTS invite_guests_invite_id_fkey,
    ADD CONSTRAINT invite_guests_invite_id_fkey 
    FOREIGN KEY (invite_id) REFERENCES invites(id) ON DELETE CASCADE;

ALTER TABLE invite_visitors 
    DROP CONSTRAINT IF EXISTS invite_visitors_invite_id_fkey,
    ADD CONSTRAINT invite_visitors_invite_id_fkey 
    FOREIGN KEY (invite_id) REFERENCES invites(id) ON DELETE CASCADE;

ALTER TABLE orders 
    DROP CONSTRAINT IF EXISTS orders_user_id_fkey,
    ADD CONSTRAINT orders_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE orders 
    DROP CONSTRAINT IF EXISTS orders_plan_id_fkey,
    ADD CONSTRAINT orders_plan_id_fkey 
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL;

ALTER TABLE orders 
    DROP CONSTRAINT IF EXISTS orders_reseller_id_fkey,
    ADD CONSTRAINT orders_reseller_id_fkey 
    FOREIGN KEY (reseller_id) REFERENCES resellers(id) ON DELETE SET NULL;

-- =====================================================
-- INDEXES
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_reseller_id ON users(reseller_id);
CREATE INDEX IF NOT EXISTS idx_invites_user_id ON invites(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_public_slug ON invites(public_slug);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invite_guests_invite_id ON invite_guests(invite_id);
CREATE INDEX IF NOT EXISTS idx_invite_visitors_invite_id ON invite_visitors(invite_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_resellers_referral_code ON resellers(referral_code);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
    is_unique BOOLEAN := FALSE;
BEGIN
    WHILE NOT is_unique LOOP
        result := '';
        FOR i IN 1..length LOOP
            result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
        END LOOP;
        
        -- Check if the code is unique
        SELECT NOT EXISTS(SELECT 1 FROM resellers WHERE referral_code = result) INTO is_unique;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to set referral code before insert
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique slug for invitations
CREATE OR REPLACE FUNCTION generate_unique_slug(base_title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Convert title to URL-friendly slug
    base_slug := lower(trim(regexp_replace(base_title, '[^a-zA-Z0-9\s-]', '', 'g')));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(base_slug, '-');
    
    -- Ensure slug is not empty
    IF base_slug = '' THEN
        base_slug := 'invitation';
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and append number if needed
    WHILE EXISTS (SELECT 1 FROM invites WHERE public_slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to track invitation visitors
CREATE OR REPLACE FUNCTION track_invitation_visitor(invitation_slug TEXT, visitor_id TEXT)
RETURNS VOID AS $$
DECLARE
    invite_id_var UUID;
BEGIN
    -- Get the invitation ID from slug
    SELECT id INTO invite_id_var FROM invites WHERE public_slug = invitation_slug;
    
    IF invite_id_var IS NOT NULL THEN
        -- Try to insert visitor record (will fail silently if already exists)
        INSERT INTO invite_visitors (invite_id, visitor_id)
        VALUES (invite_id_var, visitor_id)
        ON CONFLICT (invite_id, visitor_id) DO NOTHING;
        
        -- Update the unique visitors count
        UPDATE invites
        SET unique_visitors = (
            SELECT COUNT(*) FROM invite_visitors WHERE invite_id = invite_id_var
        )
        WHERE id = invite_id_var;
        
        -- Also increment the general views_count
        UPDATE invites
        SET views_count = COALESCE(views_count, 0) + 1
        WHERE id = invite_id_var;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to sync auth users with custom users table
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'users', (SELECT json_build_object(
            'total', COALESCE((SELECT total_users FROM user_stats), 0),
            'new_30d', COALESCE((SELECT new_users_30d FROM user_stats), 0),
            'active', COALESCE((SELECT active_users FROM user_stats), 0),
            'with_reseller', COALESCE((SELECT reseller_users FROM user_stats), 0)
        )),
        'invites', (SELECT json_build_object(
            'total', COALESCE((SELECT total_invites FROM invite_stats), 0),
            'new_30d', COALESCE((SELECT new_invites_30d FROM invite_stats), 0),
            'sent', COALESCE((SELECT sent_invites FROM invite_stats), 0),
            'total_views', COALESCE((SELECT total_views FROM invite_stats), 0),
            'total_confirmations', COALESCE((SELECT total_confirmations FROM invite_stats), 0)
        )),
        'orders', (SELECT json_build_object(
            'total', COALESCE((SELECT total_orders FROM order_stats), 0),
            'new_30d', COALESCE((SELECT new_orders_30d FROM order_stats), 0),
            'total_revenue', COALESCE((SELECT total_revenue FROM order_stats), 0),
            'avg_order_value', COALESCE((SELECT average_order_value FROM order_stats), 0)
        ))
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers for all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resellers_updated_at ON resellers;
CREATE TRIGGER update_resellers_updated_at
    BEFORE UPDATE ON resellers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invites_updated_at ON invites;
CREATE TRIGGER update_invites_updated_at
    BEFORE UPDATE ON invites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Referral code trigger
DROP TRIGGER IF EXISTS trigger_set_referral_code ON resellers;
CREATE TRIGGER trigger_set_referral_code
    BEFORE INSERT ON resellers
    FOR EACH ROW EXECUTE FUNCTION set_referral_code();

-- Auth user sync trigger (critical for fixing foreign key issues)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- VIEWS
-- =====================================================

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE reseller_id IS NOT NULL) as reseller_users
FROM users;

-- Invitation statistics view  
CREATE OR REPLACE VIEW invite_stats AS
SELECT 
    COUNT(*) as total_invites,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_invites_30d,
    COUNT(*) FILTER (WHERE status = 'published') as sent_invites,
    COALESCE(SUM(views_count), 0) as total_views,
    COALESCE(SUM(confirmations_count), 0) as total_confirmations
FROM invites;

-- Order statistics view
CREATE OR REPLACE VIEW order_stats AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_orders_30d,
    COALESCE(SUM(amount), 0) as total_revenue,
    COALESCE(AVG(amount), 0) as average_order_value
FROM orders
WHERE status = 'completed';

-- =====================================================
-- SYNC EXISTING AUTH USERS
-- =====================================================

-- Sync any existing auth users to custom users table
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT au.id, au.email, au.created_at, au.updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = EXCLUDED.updated_at;

-- =====================================================
-- PERMISSIONS (RLS will be handled separately)
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert sample plans if none exist
INSERT INTO plans (name, description, price, max_invites, max_templates, features)
SELECT 'Free', 'Basic plan with limited features', 0.00, 5, 3, '{"templates": 3, "invites": 5, "support": "email"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Free');

INSERT INTO plans (name, description, price, max_invites, max_templates, features)
SELECT 'Pro', 'Professional plan with advanced features', 29.99, 100, 50, '{"templates": 50, "invites": 100, "support": "priority", "analytics": true}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Pro');

INSERT INTO plans (name, description, price, max_invites, max_templates, features)
SELECT 'Enterprise', 'Enterprise plan with unlimited features', 99.99, -1, -1, '{"templates": "unlimited", "invites": "unlimited", "support": "phone", "analytics": true, "custom_domain": true}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Enterprise');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$ 
BEGIN
    RAISE NOTICE 'Database migration completed successfully at %', NOW();
END $$;
