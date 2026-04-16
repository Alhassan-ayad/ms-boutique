-- =====================================================
-- YASSO Blog Posts - Database Migration
-- Add fields for homepage featured blog posts
-- =====================================================

-- Add new columns to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS excerpt_ar TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS featured_order INT DEFAULT 0;

-- Create index for better performance on featured queries
CREATE INDEX IF NOT EXISTS idx_blog_featured 
ON blog_posts(is_featured, featured_order, published_date DESC)
WHERE is_published = TRUE AND is_featured = TRUE;

-- Mark first 3 published posts as featured (example)
UPDATE blog_posts 
SET is_featured = TRUE, 
    featured_order = 1 
WHERE is_published = TRUE 
  AND id = (SELECT id FROM blog_posts WHERE is_published = TRUE ORDER BY published_date DESC LIMIT 1 OFFSET 0);

UPDATE blog_posts 
SET is_featured = TRUE, 
    featured_order = 2 
WHERE is_published = TRUE 
  AND id = (SELECT id FROM blog_posts WHERE is_published = TRUE ORDER BY published_date DESC LIMIT 1 OFFSET 1);

UPDATE blog_posts 
SET is_featured = TRUE, 
    featured_order = 3 
WHERE is_published = TRUE 
  AND id = (SELECT id FROM blog_posts WHERE is_published = TRUE ORDER BY published_date DESC LIMIT 1 OFFSET 2);

-- Verify the changes
SELECT id, title, is_published, is_featured, featured_order, published_date 
FROM blog_posts 
WHERE is_featured = TRUE 
ORDER BY featured_order ASC;
