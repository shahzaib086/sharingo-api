-- =====================================================
-- Add Role Column to Users Table
-- =====================================================
-- This migration adds a role column to the users table
-- to differentiate between admin and regular users
-- Run Date: 2025-11-12

-- Create enum type for user roles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('admin', 'user');
    END IF;
END $$;

-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role user_role_enum DEFAULT 'user' NOT NULL;

-- Update any existing users without a role to have 'user' role
UPDATE users 
SET role = 'user' 
WHERE role IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.role IS 'User role: admin or user (default: user)';

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these queries after migration to verify column was added successfully

-- Check if column exists
-- SELECT column_name, data_type, column_default, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'role';

-- Verify enum type
-- SELECT enumlabel FROM pg_enum 
-- WHERE enumtypid = 'user_role_enum'::regtype 
-- ORDER BY enumsortorder;

-- Check role distribution
-- SELECT role, COUNT(*) as count 
-- FROM users 
-- GROUP BY role;

-- =====================================================
-- Rollback Query (if needed)
-- =====================================================
-- To rollback this migration, run:
-- ALTER TABLE users DROP COLUMN IF EXISTS role;
-- DROP TYPE IF EXISTS user_role_enum;

