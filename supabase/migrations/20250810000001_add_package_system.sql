-- =====================================================
-- 1. ADD PACKAGE COLUMNS TO USER_PROFILES TABLE
-- =====================================================

-- Add package management fields to user_profiles (auth.users based)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS current_package VARCHAR(20) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS used_invites INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS package_upgraded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_premium_active BOOLEAN DEFAULT false;

-- Create indexes for package queries on user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_package ON user_profiles(current_package);
CREATE INDEX IF NOT EXISTS idx_user_profiles_package_status ON user_profiles(current_package, is_premium_active);

-- =====================================================
-- 2. ADD PACKAGE COLUMNS TO EXISTING TEMPLATES TABLE
-- =====================================================

-- =====================================================
-- 1. ADD PACKAGE COLUMNS TO EXISTING USERS TABLE
-- =====================================================

-- Add package-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_package VARCHAR(20) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS used_invites INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS package_upgraded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_premium_active BOOLEAN DEFAULT false;

-- Create indexes for package queries
CREATE INDEX IF NOT EXISTS idx_users_current_package ON users(current_package);
CREATE INDEX IF NOT EXISTS idx_users_package_status ON users(current_package, is_premium_active);

-- =====================================================
-- 2. ADD PACKAGE COLUMNS TO EXISTING TEMPLATES TABLE
-- =====================================================

-- Add package requirements to templates
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS required_package VARCHAR(20) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS package_tier INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_premium_only BOOLEAN DEFAULT false;

-- Create indexes for template package filtering
CREATE INDEX IF NOT EXISTS idx_templates_package_req ON templates(required_package, is_active);
CREATE INDEX IF NOT EXISTS idx_templates_premium ON templates(is_premium_only, is_active);

-- =====================================================
-- 3. CREATE PAYMENT CONFIRMATIONS TABLE
-- =====================================================

-- Table to track manual payment confirmations
CREATE TABLE IF NOT EXISTS payment_confirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Add indexes for payment confirmations
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_user ON payment_confirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_status ON payment_confirmations(status);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_pending ON payment_confirmations(status, created_at) 
WHERE status = 'pending';

-- =====================================================
-- 4. CREATE PACKAGE DEFINITIONS TABLE
-- =====================================================

-- Define available packages and their limits
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. PACKAGE VALIDATION FUNCTIONS
-- =====================================================

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
            'message', 'User not found'
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

-- Function to get user package status
CREATE OR REPLACE FUNCTION get_user_package_status(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    user_record RECORD;
    package_info RECORD;
    pending_upgrade RECORD;
BEGIN
    -- Get user info
    SELECT up.current_package, up.used_invites, up.is_premium_active, 
           up.package_upgraded_at, up.package_expires_at
    INTO user_record
    FROM user_profiles up 
    WHERE up.user_id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'User not found');
    END IF;
    
    -- Get package definition
    SELECT pd.display_name, pd.description, pd.price, pd.max_invitations, 
           pd.max_templates_access, pd.features
    INTO package_info
    FROM package_definitions pd
    WHERE pd.package_name = user_record.current_package;
    
    -- Check for pending upgrade requests
    SELECT pc.id, pc.status, pc.created_at, pc.requested_package
    INTO pending_upgrade
    FROM payment_confirmations pc
    WHERE pc.user_id = user_uuid 
      AND pc.status = 'pending'
      AND pc.expires_at > NOW()
    ORDER BY pc.created_at DESC
    LIMIT 1;
    
    RETURN jsonb_build_object(
        'current_package', user_record.current_package,
        'package_info', jsonb_build_object(
            'display_name', package_info.display_name,
            'description', package_info.description,
            'price', package_info.price,
            'max_invitations', package_info.max_invitations,
            'max_templates_access', package_info.max_templates_access,
            'features', package_info.features
        ),
        'usage', jsonb_build_object(
            'used_invites', user_record.used_invites,
            'remaining_invites', 
                CASE 
                    WHEN package_info.max_invitations IS NULL THEN NULL
                    ELSE package_info.max_invitations - user_record.used_invites
                END
        ),
        'premium_status', jsonb_build_object(
            'is_active', user_record.is_premium_active,
            'upgraded_at', user_record.package_upgraded_at,
            'expires_at', user_record.package_expires_at
        ),
        'pending_upgrade', 
            CASE 
                WHEN pending_upgrade.id IS NOT NULL THEN
                    jsonb_build_object(
                        'id', pending_upgrade.id,
                        'status', pending_upgrade.status,
                        'requested_package', pending_upgrade.requested_package,
                        'created_at', pending_upgrade.created_at
                    )
                ELSE NULL
            END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for admin to upgrade user package
CREATE OR REPLACE FUNCTION admin_upgrade_user_package(
    user_uuid UUID,
    new_package VARCHAR(20),
    admin_uuid UUID,
    payment_confirmation_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    package_exists BOOLEAN;
    old_package VARCHAR(20);
BEGIN
    -- Verify package exists
    SELECT EXISTS(SELECT 1 FROM package_definitions WHERE package_name = new_package)
    INTO package_exists;
    
    IF NOT package_exists THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid package name'
        );
    END IF;
    
    -- Get current package from user_profiles
    SELECT current_package INTO old_package FROM user_profiles WHERE user_id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- Update user package in user_profiles
    UPDATE user_profiles 
    SET 
        current_package = new_package,
        is_premium_active = CASE WHEN new_package != 'basic' THEN true ELSE false END,
        package_upgraded_at = NOW(),
        package_expires_at = NULL, -- For now, no expiry. Can be added later
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    -- If payment confirmation provided, mark it as confirmed
    IF payment_confirmation_id IS NOT NULL THEN
        UPDATE payment_confirmations
        SET 
            status = 'confirmed',
            confirmed_by = admin_uuid,
            confirmed_at = NOW(),
            admin_notes = 'Package upgraded by admin',
            updated_at = NOW()
        WHERE id = payment_confirmation_id AND user_id = user_uuid;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'User package upgraded successfully',
        'old_package', old_package,
        'new_package', new_package,
        'upgraded_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. INSERT PACKAGE DEFINITIONS
-- =====================================================

-- Insert basic and gold packages
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

-- =====================================================
-- 7. UPDATE EXISTING DATA
-- =====================================================

-- Set all existing user_profiles to basic package and count their invitations
UPDATE user_profiles 
SET 
    current_package = 'basic',
    used_invites = COALESCE((
        SELECT COUNT(*) 
        FROM invites 
        WHERE invites.user_id = user_profiles.user_id
    ), 0),
    is_premium_active = false
WHERE current_package IS NULL;

-- Set all templates to basic package requirement
UPDATE templates 
SET 
    required_package = 'basic',
    is_premium_only = false
WHERE required_package IS NULL;

-- =====================================================
-- 8. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_definitions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own payment confirmations" ON payment_confirmations;
DROP POLICY IF EXISTS "Users can insert own payment confirmations" ON payment_confirmations; 
DROP POLICY IF EXISTS "Anyone can view active packages" ON package_definitions;
DROP POLICY IF EXISTS "Service role can manage package definitions" ON package_definitions;

-- Policies for payment_confirmations
CREATE POLICY "Users can view own payment confirmations" 
ON payment_confirmations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment confirmations" 
ON payment_confirmations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policies for package_definitions
CREATE POLICY "Anyone can view active packages" 
ON package_definitions FOR SELECT 
USING (is_active = true);

-- =====================================================
-- 9. TRIGGERS
-- =====================================================

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_payment_confirmations_updated_at ON payment_confirmations;
DROP TRIGGER IF EXISTS update_package_definitions_updated_at ON package_definitions;

-- Add updated_at trigger for payment_confirmations
CREATE TRIGGER update_payment_confirmations_updated_at
    BEFORE UPDATE ON payment_confirmations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for package_definitions  
CREATE TRIGGER update_package_definitions_updated_at
    BEFORE UPDATE ON package_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log completion
DO $$ 
BEGIN
    RAISE NOTICE 'Package system migration completed successfully at %', NOW();
    RAISE NOTICE 'Added package tracking, payment confirmations, and validation functions';
    RAISE NOTICE 'Users default to basic package (1 invitation limit)';
    RAISE NOTICE 'Gold package provides unlimited invitations';
    RAISE NOTICE 'Package validation functions are ready for frontend integration';
END $$;
