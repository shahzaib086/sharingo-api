-- =====================================================
-- Add status column to chats table
-- =====================================================
-- This migration adds a status column to track if a chat is active or inactive
-- Status values: 1 = ACTIVE, 2 = INACTIVE

-- Add status column with default value of 1 (ACTIVE)
ALTER TABLE chats 
ADD COLUMN IF NOT EXISTS status INTEGER DEFAULT 1;

-- Add comment for documentation
COMMENT ON COLUMN chats.status IS 'Chat status: 1 = ACTIVE, 2 = INACTIVE';

-- Add index for status if needed for filtering
CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this query after migration to verify the column was added

-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'chats' AND column_name = 'status';

