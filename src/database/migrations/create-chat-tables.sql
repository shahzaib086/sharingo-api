-- =====================================================
-- Chat Module Database Migration
-- =====================================================
-- This migration creates the necessary tables for the chat module
-- Run this migration after ensuring products and users tables exist

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  "productId" INTEGER NOT NULL,
  "userAId" INTEGER NOT NULL,
  "userBId" INTEGER NOT NULL,
  "lastMessage" TEXT,
  "lastMessageAt" TIMESTAMP,
  "unreadCountUserA" INTEGER DEFAULT 0,
  "unreadCountUserB" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_chat_product FOREIGN KEY ("productId") 
    REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_userA FOREIGN KEY ("userAId") 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_userB FOREIGN KEY ("userBId") 
    REFERENCES users(id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate chats for same product and users
  CONSTRAINT unique_chat UNIQUE ("productId", "userAId", "userBId")
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  "chatId" INTEGER NOT NULL,
  "senderId" INTEGER NOT NULL,
  content TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT false,
  "readAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_message_chat FOREIGN KEY ("chatId") 
    REFERENCES chats(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_sender FOREIGN KEY ("senderId") 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chats_userA ON chats("userAId");
CREATE INDEX IF NOT EXISTS idx_chats_userB ON chats("userBId");
CREATE INDEX IF NOT EXISTS idx_chats_product ON chats("productId");
CREATE INDEX IF NOT EXISTS idx_chats_last_message ON chats("lastMessageAt" DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages("chatId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages("senderId");
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages("chatId", "isRead") WHERE "isRead" = false;

-- Add comments for documentation
COMMENT ON TABLE chats IS 'Stores chat conversations between users for specific products';
COMMENT ON TABLE messages IS 'Stores individual messages within chats';

COMMENT ON COLUMN chats."userAId" IS 'Product owner user ID (always the product owner)';
COMMENT ON COLUMN chats."userBId" IS 'Other user ID (interested buyer)';
COMMENT ON COLUMN chats."lastMessage" IS 'Preview of the last message (truncated to 100 chars)';
COMMENT ON COLUMN chats."unreadCountUserA" IS 'Number of unread messages for user A';
COMMENT ON COLUMN chats."unreadCountUserB" IS 'Number of unread messages for user B';

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these queries after migration to verify tables were created successfully

-- Check if tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('chats', 'messages');

-- Check indexes
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE tablename IN ('chats', 'messages');

-- Check constraints
-- SELECT conname, contype FROM pg_constraint 
-- WHERE conrelid IN ('chats'::regclass, 'messages'::regclass);

