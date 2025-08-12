-- =====================================================
-- UNIFIED INVITATION SYSTEM MIGRATION
-- Date: 2025-08-10
-- Description: Complete invitation system with admin and user capabilities
-- Combines admin backend with user dashboard functionality
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
        CREATE TYPE invite_status AS ENUM ('draft', 'published', 'archived', 'sent', 'viewed', 'confirmed');
    END IF;
END $$;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase Auth)
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

-- User profiles table (for Supabase Auth users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

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

-- Package Definitions Table (for user packages)
CREATE TABLE IF NOT EXISTS package_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_name VARCHAR(20) UNIQUE NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    max_invitations INTEGER, -- NULL means unlimited
    max_templates_access INTEGER, -- NULL means unlimited
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
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
    user_id UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT true,
    required_package VARCHAR(20) DEFAULT 'basic',
    package_tier INTEGER DEFAULT 1,
    is_premium_only BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Invites Table (supports both auth.users and legacy users)
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id),
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
    invite_id UUID NOT NULL REFERENCES invites(id) ON DELETE CASCADE,
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
    invite_id UUID REFERENCES invites(id) ON DELETE CASCADE,
    visitor_id VARCHAR(255) NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(invite_id, visitor_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    reseller_id UUID REFERENCES resellers(id),
    amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payment Confirmations Table (for manual payment flow)
CREATE TABLE IF NOT EXISTS payment_confirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_package VARCHAR(20) NOT NULL DEFAULT 'gold',
    whatsapp_phone VARCHAR(20),
    whatsapp_message TEXT,
    transfer_proof_url VARCHAR(500),
    bank_account_used VARCHAR(100),
    transfer_amount DECIMAL(10,2),
    transfer_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, rejected, expired
    admin_notes TEXT,
    confirmed_by UUID REFERENCES admin_users(id),
    confirmed_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADD PACKAGE COLUMNS TO AUTH USERS VIA USER_PROFILES
-- =====================================================

-- Add package tracking columns to user_profiles
DO $$
BEGIN
    -- Add package-related columns to user_profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'current_package') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN current_package VARCHAR(20) DEFAULT 'basic',
        ADD COLUMN used_invites INTEGER DEFAULT 0,
        ADD COLUMN package_upgraded_at TIMESTAMPTZ,
        ADD COLUMN package_expires_at TIMESTAMPTZ,
        ADD COLUMN is_premium_active BOOLEAN DEFAULT false;
    END IF;
END $$;

-- =====================================================
-- INDEXES
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_reseller_id ON users(reseller_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_package ON user_profiles(current_package, is_premium_active);
CREATE INDEX IF NOT EXISTS idx_invites_user_id ON invites(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_public_slug ON invites(public_slug);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invite_guests_invite_id ON invite_guests(invite_id);
CREATE INDEX IF NOT EXISTS idx_invite_visitors_invite_id ON invite_visitors(invite_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_resellers_referral_code ON resellers(referral_code);
-- Skip templates indexes as columns don't exist yet in first migration
-- CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
-- CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public);
-- CREATE INDEX IF NOT EXISTS idx_templates_package_req ON templates(required_package, is_active);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_user ON payment_confirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_status ON payment_confirmations(status);

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

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url, current_package, used_invites, is_premium_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        NEW.raw_user_meta_data->>'avatar_url',
        'basic',
        0,
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create invitation
CREATE OR REPLACE FUNCTION can_user_create_invitation(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    user_record RECORD;
    package_info RECORD;
    result JSONB;
BEGIN
    -- Get user package info from user_profiles
    SELECT up.current_package, up.used_invites, up.is_premium_active
    INTO user_record
    FROM user_profiles up 
    WHERE up.user_id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'can_create', false,
            'reason', 'user_not_found',
            'message', 'User profile not found'
        );
    END IF;
    
    -- Get package limits
    SELECT pd.max_invitations
    INTO package_info
    FROM package_definitions pd
    WHERE pd.package_name = user_record.current_package;
    
    -- Check limits
    IF package_info.max_invitations IS NULL THEN
        -- Unlimited package
        RETURN jsonb_build_object(
            'can_create', true,
            'reason', 'unlimited',
            'used_invites', user_record.used_invites,
            'package', user_record.current_package
        );
    ELSIF user_record.used_invites >= package_info.max_invitations THEN
        -- Limit exceeded
        RETURN jsonb_build_object(
            'can_create', false,
            'reason', 'limit_exceeded',
            'message', 'Package invitation limit exceeded',
            'used_invites', user_record.used_invites,
            'max_invites', package_info.max_invitations,
            'package', user_record.current_package
        );
    ELSE
        -- Can create
        RETURN jsonb_build_object(
            'can_create', true,
            'reason', 'within_limits',
            'used_invites', user_record.used_invites,
            'max_invites', package_info.max_invitations,
            'remaining', package_info.max_invitations - user_record.used_invites,
            'package', user_record.current_package
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment user invitation count
CREATE OR REPLACE FUNCTION increment_user_invitations(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    validation_result JSONB;
BEGIN
    -- Check if user can create invitation
    validation_result := can_user_create_invitation(user_uuid);
    
    IF (validation_result->>'can_create')::boolean = false THEN
        RETURN validation_result;
    END IF;
    
    -- Increment the count in user_profiles
    UPDATE user_profiles 
    SET used_invites = used_invites + 1,
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Invitation count incremented',
        'new_count', (SELECT used_invites FROM user_profiles WHERE user_id = user_uuid)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Drop existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
DROP TRIGGER IF EXISTS update_resellers_updated_at ON resellers;
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
DROP TRIGGER IF EXISTS update_invites_updated_at ON invites;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_payment_confirmations_updated_at ON payment_confirmations;
DROP TRIGGER IF EXISTS update_package_definitions_updated_at ON package_definitions;
DROP TRIGGER IF EXISTS trigger_set_referral_code ON resellers;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Updated_at triggers for all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resellers_updated_at
    BEFORE UPDATE ON resellers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invites_updated_at
    BEFORE UPDATE ON invites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_confirmations_updated_at
    BEFORE UPDATE ON payment_confirmations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_definitions_updated_at
    BEFORE UPDATE ON package_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Referral code trigger
CREATE TRIGGER trigger_set_referral_code
    BEFORE INSERT ON resellers
    FOR EACH ROW EXECUTE FUNCTION set_referral_code();

-- Auth user sync trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_definitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for invites
CREATE POLICY "Users can view own invites" ON invites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invites" ON invites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invites" ON invites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invites" ON invites
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for invite_guests
CREATE POLICY "Users can view guests of own invites" ON invite_guests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invites 
            WHERE invites.id = invite_guests.invite_id 
            AND invites.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage guests of own invites" ON invite_guests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM invites 
            WHERE invites.id = invite_guests.invite_id 
            AND invites.user_id = auth.uid()
        )
    );

-- RLS Policies for templates - commented out as columns don't exist in first migration
-- CREATE POLICY "Users can view public templates and own templates" ON templates
--     FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- CREATE POLICY "Users can create own templates" ON templates
--     FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update own templates" ON templates
--     FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own templates" ON templates
--     FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment confirmations
CREATE POLICY "Users can view own payment confirmations" ON payment_confirmations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment confirmations" ON payment_confirmations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for package definitions
CREATE POLICY "Anyone can view package definitions" ON package_definitions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage package definitions" ON package_definitions
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- VIEWS
-- =====================================================

-- Drop existing view first to avoid column conflicts
DROP VIEW IF EXISTS user_stats;

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
    COUNT(*) FILTER (WHERE is_premium_active = true) as premium_users,
    COUNT(*) FILTER (WHERE current_package = 'gold') as gold_users
FROM user_profiles;

-- Drop existing views first to avoid column conflicts
DROP VIEW IF EXISTS invite_stats;
DROP VIEW IF EXISTS order_stats;
DROP VIEW IF EXISTS template_stats;

-- Invitation statistics view  
CREATE OR REPLACE VIEW invite_stats AS
SELECT 
    COUNT(*) as total_invites,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_invites_30d,
    COUNT(*) FILTER (WHERE status = 'published') as published_invites,
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
-- INITIAL DATA
-- =====================================================

-- Insert package definitions
INSERT INTO package_definitions (
    package_name, display_name, description, price, max_invitations, 
    max_templates_access, features, sort_order
) VALUES 
(
    'basic',
    'Basic (Free)',
    'Perfect for trying out our invitation system',
    0.00,
    1, -- Maximum 1 invitation
    NULL, -- Access to all basic templates
    jsonb_build_object(
        'invitation_limit', 1,
        'template_access', 'basic',
        'customer_support', 'email',
        'analytics', false,
        'custom_domain', false
    ),
    1
),
(
    'gold',
    'Gold (Premium)',
    'Unlimited invitations with premium features',
    29.99, -- Adjust price as needed
    NULL, -- Unlimited invitations
    NULL, -- Access to all templates
    jsonb_build_object(
        'invitation_limit', 'unlimited',
        'template_access', 'all',
        'customer_support', 'priority',
        'analytics', true,
        'custom_domain', true,
        'premium_templates', true
    ),
    2
)
ON CONFLICT (package_name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    max_invitations = EXCLUDED.max_invitations,
    max_templates_access = EXCLUDED.max_templates_access,
    features = EXCLUDED.features,
    updated_at = NOW();

-- Insert sample plans if none exist
INSERT INTO plans (name, description, price, max_invites, max_templates, features)
SELECT 'Free', 'Basic plan with limited features', 0.00, 5, 3, '{"templates": 3, "invites": 5, "support": "email"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Free');

INSERT INTO plans (name, description, price, max_invites, max_templates, features)
SELECT 'Pro', 'Professional plan with advanced features', 29.99, 100, 50, '{"templates": 50, "invites": 100, "support": "priority", "analytics": true}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Pro');

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON invites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON invite_guests TO authenticated;
GRANT SELECT ON templates TO authenticated;
GRANT INSERT ON templates TO authenticated;
GRANT SELECT, INSERT ON payment_confirmations TO authenticated;
GRANT SELECT ON package_definitions TO authenticated;

-- Grant access to service role for admin functions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$ 
BEGIN
    RAISE NOTICE 'Unified invitation system migration completed successfully at %', NOW();
    RAISE NOTICE 'Created admin and user capabilities in single database';
    RAISE NOTICE 'Package system: basic (1 invite) and gold (unlimited)';
    RAISE NOTICE 'Auth users automatically get user_profiles with basic package';
END $$;
