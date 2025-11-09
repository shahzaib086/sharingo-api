-- =====================================================
-- User Tokens Table Migration
-- =====================================================
-- This migration creates the user_tokens table for storing FCM tokens
-- Run this migration after ensuring users table exists

-- Create user_tokens table
CREATE TABLE IF NOT EXISTS user_tokens (
  id SERIAL PRIMARY KEY,
  "deviceId" VARCHAR(255) UNIQUE NOT NULL,
  "fcmToken" TEXT NOT NULL,
  "userId" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key constraint (nullable for guest users)
  CONSTRAINT fk_user_token_user FOREIGN KEY ("userId") 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_tokens_user ON user_tokens("userId");
CREATE INDEX IF NOT EXISTS idx_user_tokens_device ON user_tokens("deviceId");

-- Add comments for documentation
COMMENT ON TABLE user_tokens IS 'Stores FCM tokens for push notifications (supports both authenticated and guest users)';
COMMENT ON COLUMN user_tokens."deviceId" IS 'Unique device identifier';
COMMENT ON COLUMN user_tokens."fcmToken" IS 'Firebase Cloud Messaging token for push notifications';
COMMENT ON COLUMN user_tokens."userId" IS 'User ID (nullable for guest users who are not logged in)';

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these queries after migration to verify table was created successfully

-- Check if table exists
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'user_tokens';

-- Check indexes
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE tablename = 'user_tokens';

-- Check constraints
-- SELECT conname, contype FROM pg_constraint 
-- WHERE conrelid = 'user_tokens'::regclass;

