-- =====================================================
-- Product Reports Table Migration
-- =====================================================
-- This migration creates the product_reports table for storing product reports
-- Run Date: 2025-11-12

-- Create product_reports table
CREATE TABLE IF NOT EXISTS product_reports (
  id SERIAL PRIMARY KEY,
  "reportedUserId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  message TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_product_report_user FOREIGN KEY ("reportedUserId") 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_report_product FOREIGN KEY ("productId") 
    REFERENCES products(id) ON DELETE CASCADE,
    
  -- Unique constraint: one user can only report a product once
  CONSTRAINT uq_user_product_report UNIQUE ("reportedUserId", "productId")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_reports_user ON product_reports("reportedUserId");
CREATE INDEX IF NOT EXISTS idx_product_reports_product ON product_reports("productId");

-- Add comments for documentation
COMMENT ON TABLE product_reports IS 'Stores product reports from users';
COMMENT ON COLUMN product_reports."reportedUserId" IS 'User ID who reported the product';
COMMENT ON COLUMN product_reports."productId" IS 'Product ID that was reported';
COMMENT ON COLUMN product_reports.message IS 'Optional message describing the reason for report';

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these queries after migration to verify table was created successfully

-- Check if table exists
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'product_reports';

-- Check indexes
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE tablename = 'product_reports';

-- Check constraints
-- SELECT conname, contype FROM pg_constraint 
-- WHERE conrelid = 'product_reports'::regclass;

-- =====================================================
-- Rollback Query (if needed)
-- =====================================================
-- To rollback this migration, run:
-- DROP TABLE IF EXISTS product_reports CASCADE;

