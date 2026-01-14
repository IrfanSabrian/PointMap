-- Migration: Add kategori_kampus column to bangunan table
-- Description: Adds campus category support for multi-campus feature
-- Date: 2026-01-14

-- Step 1: Add the kategori_kampus column with default value
ALTER TABLE bangunan 
ADD COLUMN kategori_kampus VARCHAR(100) DEFAULT 'Politeknik Negeri Pontianak';

-- Step 2: Update all existing records to have the default campus value
UPDATE bangunan 
SET kategori_kampus = 'Politeknik Negeri Pontianak' 
WHERE kategori_kampus IS NULL;

-- Step 3: Add index for better query performance
CREATE INDEX idx_bangunan_kampus ON bangunan(kategori_kampus);

-- Verification query (optional - for testing)
-- SELECT id_bangunan, nama, kategori_kampus FROM bangunan LIMIT 10;
