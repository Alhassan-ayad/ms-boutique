# Featured Products Section - Database Setup Guide

## Overview
This guide shows how to make the "FIND THE PERFECT - HIGH CLASS BAGS" section dynamic using the database.

## Database Structure

### 1. Section Content (Title/Subtitle)
Store in the `website_content` table:

```sql
-- Featured Section Content for English
INSERT INTO website_content (page_name, section_name, content_type, content_value, display_order, is_active, created_at, updated_at) 
VALUES 
('Home', 'Featured_EN', 'TEXT', 'Find the perfect', 1, true, NOW(), NOW()),
('Home', 'Featured_EN', 'TEXT', 'High Class Bags', 2, true, NOW(), NOW());

-- Featured Section Content for Arabic
INSERT INTO website_content (page_name, section_name, content_type, content_value, display_order, is_active, created_at, updated_at) 
VALUES 
('Home', 'Featured_AR', 'TEXT', 'اعثر على المثالي', 1, true, NOW(), NOW()),
('Home', 'Featured_AR', 'TEXT', 'حقائب عالية الجودة', 2, true, NOW(), NOW());
```

### 2. Featured Products
Add a `is_featured` column to your `products` table (if not exists):

```sql
-- Add featured column
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_order INTEGER DEFAULT 0;

-- Mark products as featured
UPDATE products SET is_featured = true, featured_order = 1 WHERE product_name = 'Flower Pendant';
UPDATE products SET is_featured = true, featured_order = 2 WHERE product_name = 'Diamond Gold';
UPDATE products SET is_featured = true, featured_order = 3 WHERE product_name = 'Black Pendant';
UPDATE products SET is_featured = true, featured_order = 4 WHERE product_name = 'Wedding Ring';
```

## Using Admin Dashboard

### Step 1: Add Section Content
1. Open `admin-dashboard.html`
2. Go to **Home Content** section
3. Click **Add New Content**
4. Fill in the form:

**For Subtitle (Order 1):**
- Page Name: `Home`
- Section Name: `Featured_EN`
- Content Type: `TEXT`
- Content Value: `Find the perfect`
- Display Order: `1`
- Is Active: ✓

**For Title (Order 2):**
- Page Name: `Home`
- Section Name: `Featured_EN`
- Content Type: `TEXT`
- Content Value: `High Class Bags`
- Display Order: `2`
- Is Active: ✓

### Step 2: Mark Products as Featured

**Backend API Needed:**
Add this endpoint to your ProductController:

```java
@PutMapping("/products/{id}/featured")
public ResponseEntity<Product> setFeaturedStatus(
    @PathVariable Long id,
    @RequestParam boolean featured,
    @RequestParam(defaultValue = "0") int order
) {
    Product product = productService.findById(id);
    product.setFeatured(featured);
    product.setFeaturedOrder(order);
    productService.save(product);
    return ResponseEntity.ok(product);
}

@GetMapping("/products/featured")
public ResponseEntity<List<Product>> getFeaturedProducts() {
    List<Product> featured = productService.getFeaturedProducts();
    return ResponseEntity.ok(featured);
}
```

**Frontend Admin Dashboard:**
Add a "Featured" toggle button in the products management section.

## Content Structure

### Display Order Mapping
- **Order 1**: Subtitle (small text above main title)
- **Order 2**: Main Title (large heading)

### Section Names
- `Featured_EN` - English version
- `Featured_AR` - Arabic version

## Testing

1. Insert the SQL data above
2. Verify in admin dashboard: Home Content → Filter by "Featured_EN"
3. Should see 2 items (subtitle and title)
4. Refresh homepage - should load dynamically
5. Switch language to Arabic - should show Arabic text

## API Endpoints Used

- **Section Content**: `GET /api/website-content/section/Featured_EN/all`
- **Featured Products**: `GET /api/products/featured`

## Content Type Reference

| Content Type | Usage |
|--------------|-------|
| TEXT | Plain text (subtitle, title) |
| HTML | Rich text with formatting |
| IMAGE | Image URLs |
| URL | Links to other pages |

## Notes

- Products are managed separately in the products table
- Only section titles/subtitles are in website_content
- Products should be marked as featured via admin dashboard
- Display 4 featured products in grid layout
- Products include: image, title, price, rating, add to cart button
