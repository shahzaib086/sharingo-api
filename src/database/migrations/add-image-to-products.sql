-- =====================================================
-- Add image column to products table
-- =====================================================
-- This migration adds an image column to store the main/featured product image
-- The image column will be automatically populated from sequence 1 media

-- Add image column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image VARCHAR;

-- Add comment for documentation
COMMENT ON COLUMN products.image IS 'Main/featured product image URL (automatically synced with sequence 1 media)';

-- Optionally, populate existing products with their sequence 1 image
-- UPDATE products p
-- SET image = pm.mediaUrl
-- FROM product_media pm
-- WHERE p.id = pm.productId AND pm.sequence = 1;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this query after migration to verify the column was added

-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' AND column_name = 'image';

