# Homepage Dynamic Content Setup Guide

## Overview

The homepage content is now **fully dynamic** and loaded from the `website_content` database table. Content supports **both English and Arabic** languages through the `contentValue` and `contentValueAr` fields.

---

## Database Structure

### Table: `website_content`

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key |
| `page_name` | VARCHAR(50) | Page name (e.g., "Home", "About") |
| `section_name` | VARCHAR(100) | Section name (e.g., "Hero", "Featured") |
| `content_type` | ENUM | Content type: TEXT, IMAGE, HTML, VIDEO, URL |
| `content_value` | TEXT | English content |
| `content_value_ar` | TEXT | Arabic content (optional) |
| `display_order` | INT | Display order within section |
| `is_active` | BOOLEAN | Whether content is active |

---

## Content Types

| Type | Usage | Example |
|------|-------|---------|
| **TEXT** | Plain text content | "Leather Bags", "محفظة جلدية" |
| **HTML** | Rich text with HTML tags | `<span class="highlight">Premium</span> Quality` |
| **IMAGE** | Image URLs | `/uploads/images/hero-banner.jpg` or `https://...` |
| **VIDEO** | Video URLs | `https://youtube.com/embed/...` |
| **URL** | Links/URLs | `/shop-sidebar.html`, `https://...` |

---

## Homepage Sections

### 1. Hero Section (Banner)

**Section Name:** `Hero`  
**Page Name:** `Home`

| Display Order | Content Type | Description | Example (English) | Example (Arabic) |
|---------------|--------------|-------------|-------------------|------------------|
| 1 | TEXT | First title word | "Leather" | "حقائب" |
| 2 | TEXT | Second title word | "BAGS" | "جلدية" |
| 3 | HTML | Subtitle | "Crafted from finest leather for modern icons" | "مصنوعة من أجود أنواع الجلود" |
| 4 | TEXT | Button text | "Shop Now" | "تسوق الآن" |
| 5 | URL | Button link | "/shop-sidebar.html" | "/shop-sidebar.html" |
| 6 | IMAGE | Hero image | "/assets/img/hero/hero-1.jpg" | "/assets/img/hero/hero-ar.jpg" |

**Sample SQL:**
```sql
INSERT INTO website_content (page_name, section_name, content_type, content_value, content_value_ar, display_order, is_active) VALUES
('Home', 'Hero', 'TEXT', 'Leather', 'حقائب', 1, true),
('Home', 'Hero', 'TEXT', 'BAGS', 'جلدية', 2, true),
('Home', 'Hero', 'HTML', 'Crafted from finest leather for modern icons', 'مصنوعة من أجود أنواع الجلود للأيقونات العصرية', 3, true),
('Home', 'Hero', 'TEXT', 'Shop Now', 'تسوق الآن', 4, true),
('Home', 'Hero', 'URL', '/shop-sidebar.html', '/shop-sidebar.html', 5, true),
('Home', 'Hero', 'IMAGE', 'assets/img/hero/hero-slide-1-1-3.jpg', 'assets/img/hero/hero-slide-1-1-3.jpg', 6, true);
```

---

### 2. Featured Products Section

**Section Name:** `Featured`  
**Page Name:** `Home`

This section has **two parts**:
1. **Section Header** - From `website_content` table
2. **Product Cards** - From `products` table (marked as featured)

#### 2.1 Section Header (website_content)

| Display Order | Content Type | Description | Example (English) | Example (Arabic) |
|---------------|--------------|-------------|-------------------|------------------|
| 1 | TEXT | Subtitle | "Find the perfect" | "اعثر على الأفضل" |
| 2 | TEXT | Title | "High Class Bags" | "عوض" |

**Sample SQL:**
```sql
INSERT INTO website_content (page_name, section_name, content_type, content_value, content_value_ar, display_order, is_active) VALUES
('Home', 'Featured', 'TEXT', 'Find the perfect', 'اعثر على الأفضل', 1, true),
('Home', 'Featured', 'TEXT', 'High Class Bags', 'عوض', 2, true);
```

#### 2.2 Featured Products (products table)

**Products are marked as featured using `is_featured` column:**

```sql
-- Add is_featured column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_order INT DEFAULT 0;

-- Mark products as featured
UPDATE products SET is_featured = true, featured_order = 1 WHERE id = 1;
UPDATE products SET is_featured = true, featured_order = 2 WHERE id = 2;
```

**Fetch featured products:**
```sql
SELECT p.*, json_agg(cv.*) as color_variants
FROM products p
LEFT JOIN product_color_variants cv ON p.id = cv.product_id
WHERE p.is_featured = true AND p.is_active = true
GROUP BY p.id
ORDER BY p.featured_order ASC
LIMIT 8;
```

**Note:** See [FEATURED_PRODUCTS_SQL_SETUP.sql](FEATURED_PRODUCTS_SQL_SETUP.sql) for complete SQL setup.

---

### 3. About Section

**Section Name:** `About`  
**Page Name:** `Home`

| Display Order | Content Type | Description | Example (English) | Example (Arabic) |
|---------------|--------------|-------------|-------------------|------------------|
| 1 | TEXT | Section title | "About YASSO" | "عن ياسو" |
| 2 | HTML | About text | Full about description | النص الكامل بالعربية |
| 3 | IMAGE | About image | "/assets/img/about/about-1.jpg" | "/assets/img/about/about-ar.jpg" |

**Sample SQL:**
```sql
INSERT INTO website_content (page_name, section_name, content_type, content_value, content_value_ar, display_order, is_active) VALUES
('Home', 'About', 'TEXT', 'About YASSO', 'عن ياسو', 1, true),
('Home', 'About', 'HTML', '<p>YASSO is a premium leather bag brand...</p>', '<p>ياسو هي علامة تجارية راقية للحقائب الجلدية...</p>', 2, true),
('Home', 'About', 'IMAGE', 'assets/img/about/about-1.jpg', 'assets/img/about/about-1.jpg', 3, true);
```

---

### 4. Story Section

**Section Name:** `Story`  
**Page Name:** `Home`

| Display Order | Content Type | Description | Example (English) | Example (Arabic) |
|---------------|--------------|-------------|-------------------|------------------|
| 1 | TEXT | Subtitle | "our story" | "قصتنا" |
| 2 | TEXT | Heading | "OUR STORY" | "قصتنا" |
| 3 | HTML | Story text | Full story content | النص الكامل بالعربية |

**Sample SQL:**
```sql
INSERT INTO website_content (page_name, section_name, content_type, content_value, content_value_ar, display_order, is_active) VALUES
('Home', 'Story', 'TEXT', 'our story', 'قصتنا', 1, true),
('Home', 'Story', 'TEXT', 'OUR STORY', 'قصتنا', 2, true),
('Home', 'Story', 'HTML', '<p>Born fourteen years ago from a true love story...</p>', '<p>ولدت قبل أربعة عشر عامًا من قصة حب حقيقية...</p>', 3, true);
```

---

## How It Works

### Frontend (home-content-loader.js)

```javascript
// Automatically detects current language
const currentLanguage = getCurrentLanguage(); // 'en' or 'ar'

// Fetches content from API
const heroContent = await fetchSectionContent('Hero');

// getContentValue() automatically chooses correct language
function getContentValue(contentItem) {
  let value = contentItem.contentValue;
  if (currentLanguage === 'ar' && contentItem.contentValueAr) {
    value = contentItem.contentValueAr;
  }
  return value;
}
```

### Backend API Endpoint

```
GET /api/website-content/section/Hero/all
```

**Response:**
```json
[
  {
    "id": 1,
    "pageName": "Home",
    "sectionName": "Hero",
    "contentType": "TEXT",
    "contentValue": "Leather",
    "contentValueAr": "حقائب",
    "displayOrder": 1,
    "isActive": true
  }
]
```

---

### 5. Blog/News Section

**Section Name:** `Blog` (Note: This section loads directly from the Blog Management API)  
**Page Name:** `Home`

Unlike other sections that use the `website_content` table, the Blog section loads blog posts directly from the `blog_posts` table via the Blog Management API.

#### Blog Section Header (website_content)

The section header (title and subtitle) can be managed through the `website_content` table:

| Display Order | Content Type | Description | Example (English) | Example (Arabic) |
|---------------|--------------|-------------|-------------------|------------------|
| 1 | TEXT | Subtitle | "our news & blog" | "أخبارنا ومدونتنا" |
| 2 | TEXT | Title | "Latest News update" | "آخر الأخبار" |

**Sample SQL:**
```sql
INSERT INTO website_content (page_name, section_name, content_type, content_value, content_value_ar, display_order, is_active) VALUES
('Home', 'Blog', 'TEXT', 'our news & blog', 'أخبارنا ومدونتنا', 1, true),
('Home', 'Blog', 'TEXT', 'Latest News update', 'آخر الأخبار', 2, true);
```

#### Blog Posts (blog_posts table)

**Blog posts are fetched from the Blog Management API:**

**API Endpoint:** `GET /blog-posts/recent?limit=3`

**Required Fields:**
- `id` - Blog post ID
- `title` - English title
- `titleAr` - Arabic title
- `excerpt` - Short summary (English)
- `excerptAr` - Short summary (Arabic)
- `featuredImage` - Image URL
- `publishedDate` - Publication date
- `slug` - URL-friendly slug
- `authorName` - Author's name
- `isPublished` - Must be true to show on homepage

**Create Blog Posts via Admin Dashboard:**

Use the **Blog Management** section to:

1. **Create New Post:**
   - Enter title (English & Arabic)
   - Enter excerpt/summary (English & Arabic)
   - Upload featured image
   - Write content
   - Set author name
   - Set `isPublished` to true
   - Publish

2. **Featured on Homepage:**
   - Only published posts (`isPublished = true`) appear
   - Latest 3 posts are shown
   - Posts are ordered by `publishedDate` descending

**Rendering:**
- Blog cards are created dynamically by `createBlogCard()` function
- Supports bilingual display (English/Arabic)
- Click "Read More" links to `blog-details.html?slug={slug}`

**Sample Blog Post JSON Response:**
```json
[
  {
    "id": 1,
    "title": "Introducing Our New Leather Collection",
    "titleAr": "تقديم مجموعتنا الجلدية الجديدة",
    "excerpt": "Discover the finest handcrafted leather bags for 2024",
    "excerptAr": "اكتشف أفضل الحقائب الجلدية المصنوعة يدوياً لعام 2024",
    "featuredImage": "https://your-domain.com/uploads/blog/collection-2024.jpg",
    "publishedDate": "2024-01-15T10:00:00",
    "slug": "introducing-new-leather-collection",
    "authorName": "YASSO Team",
    "isPublished": true
  }
]
```

**Note:** See [BLOG_API_DOCUMENTATION.md](BLOG_API_DOCUMENTATION.md) for complete Blog Management API reference.

---

## Admin Dashboard Integration

### Add Content via Admin Panel

Use the **Website Content Management** section to:

1. **Create New Content:**
   - Select page: "Home"
   - Select section: "Hero", "Featured", "About", "Story"
   - Choose content type
   - Enter English content (`contentValue`)
   - Enter Arabic content (`contentValueAr`)
   - Set `displayOrder`
   - Set `isActive` to true

2. **Edit Existing Content:**
   - Find content by section
   - Update English/Arabic values

---

## Testing

### Test English Content
```javascript
localStorage.setItem('yasso_lang', 'en');
location.reload();
```

### Test Arabic Content
```javascript
localStorage.setItem('yasso_lang', 'ar');
location.reload();
```

---

## Summary

✅ **Dynamic Content** - All homepage content loaded from database  
✅ **Bilingual Support** - English and Arabic via `contentValue` / `contentValueAr`  
✅ **Multiple Content Types** - TEXT, IMAGE, HTML, VIDEO, URL  
✅ **Flexible Ordering** - `displayOrder` controls rendering sequence  
✅ **Easy Management** - Admin dashboard for CRUD operations  
✅ **Auto Language Switch** - Content changes when language changes  
✅ **Blog Integration** - Latest blog posts loaded from Blog Management API  

Your homepage is now fully dynamic! 🎉
