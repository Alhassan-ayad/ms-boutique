# Backend Implementation Guide - Featured Blog Posts

## 📋 Files to Update

### 1. BlogPost.java (Entity)
**Location:** `src/main/java/com/yasso/yasso/model/BlogPost.java`

**Add these fields:**
```java
@Column(columnDefinition = "TEXT")
private String excerpt;  // NEW: Short summary

@Column(columnDefinition = "TEXT")
private String excerptAr;  // NEW: Arabic summary

@Column(name = "is_featured", nullable = false)
private Boolean isFeatured = false;  // NEW: Mark for homepage

@Column(name = "featured_order")
private Integer featuredOrder = 0;  // NEW: Display order

// Helper method
@Transient
public String getAuthorName() {
    return author != null ? author.getFullName() : "Admin";
}
```

**See:** `BlogPost_UPDATED.java` for complete code

---

### 2. Database Migration
**Run this SQL:**

```sql
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS excerpt_ar TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS featured_order INT DEFAULT 0;

-- Create performance index
CREATE INDEX IF NOT EXISTS idx_blog_featured 
ON blog_posts(is_featured, featured_order, published_date DESC)
WHERE is_published = TRUE AND is_featured = TRUE;
```

**See:** `blog_posts_migration.sql` for complete script

---

### 3. BlogPostRepository.java
**Location:** `src/main/java/com/yasso/yasso/repository/BlogPostRepository.java`

**Add this method:**
```java
@Query("SELECT b FROM BlogPost b WHERE b.isPublished = true AND b.isFeatured = true " +
       "ORDER BY b.featuredOrder ASC, b.publishedDate DESC")
List<BlogPost> findFeaturedBlogPosts(Pageable pageable);
```

**See:** `BlogPostRepository_UPDATED.java` for complete code

---

### 4. BlogPostDTO.java
**Location:** `src/main/java/com/yasso/yasso/dto/BlogPostDTO.java`

**Add these fields:**
```java
private String excerpt;
private String excerptAr;
private Boolean isFeatured;
private Integer featuredOrder;
private String authorName;
```

**See:** `BlogPostDTO.java` for complete code

---

### 5. BlogPostMapper.java
**Location:** `src/main/java/com/yasso/yasso/mapper/BlogPostMapper.java`

**Update toDTO() to include:**
```java
dto.setExcerpt(blogPost.getExcerpt());
dto.setExcerptAr(blogPost.getExcerptAr());
dto.setIsFeatured(blogPost.getIsFeatured());
dto.setFeaturedOrder(blogPost.getFeaturedOrder());
dto.setAuthorName(blogPost.getAuthorName());
```

**See:** `BlogPostMapper.java` for complete code

---

### 6. BlogPostController.java
**Location:** `src/main/java/com/yasso/yasso/controller/BlogPostController.java`

**Add this endpoint:**
```java
@GetMapping("/featured")
public ResponseEntity<List<BlogPostDTO>> getFeaturedBlogPosts(
        @RequestParam(defaultValue = "3") int limit) {
    
    List<BlogPost> featuredPosts = blogPostRepository
            .findFeaturedBlogPosts(PageRequest.of(0, limit));
    
    List<BlogPostDTO> postDTOs = featuredPosts.stream()
            .map(blogPostMapper::toDTO)
            .collect(Collectors.toList());
    
    return ResponseEntity.ok(postDTOs);
}
```

**See:** `BlogPostController_ENDPOINTS.java` for complete code

---

## 🧪 Testing

### 1. Run Database Migration
```bash
# Execute the SQL migration script
mysql -u your_user -p yasso_db < blog_posts_migration.sql
# OR for PostgreSQL:
psql -U your_user -d yasso_db -f blog_posts_migration.sql
```

### 2. Restart Backend Server
```bash
mvn spring-boot:run
# or
./mvnw spring-boot:run
```

### 3. Test API Endpoint
```bash
# Test featured posts endpoint
curl /api/blog-posts/featured?limit=3

# Test recent posts endpoint (fallback)
curl /api/blog-posts/recent?limit=3
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "title": "Blog Post Title",
    "titleAr": "عنوان المقال",
    "excerpt": "Short summary...",
    "excerptAr": "ملخص قصير...",
    "featuredImage": "https://...",
    "publishedDate": "2024-01-15T10:00:00",
    "slug": "blog-post-title",
    "authorName": "Admin",
    "isPublished": true,
    "isFeatured": true,
    "featuredOrder": 1
  }
]
```

---

## 📝 Mark Blog Posts as Featured

### Option 1: SQL Update
```sql
-- Mark specific posts as featured
UPDATE blog_posts 
SET is_featured = true, featured_order = 1 
WHERE id = 5;

UPDATE blog_posts 
SET is_featured = true, featured_order = 2 
WHERE id = 8;

UPDATE blog_posts 
SET is_featured = true, featured_order = 3 
WHERE id = 12;
```

### Option 2: Admin Dashboard
Add checkboxes to your blog post edit form:
- `isFeatured` - Checkbox "Show on Homepage"
- `featuredOrder` - Number input "Display Order (1-99)"

---

## ✅ Verification Checklist

- [ ] Database migration completed
- [ ] New columns added to blog_posts table
- [ ] BlogPost entity updated with new fields
- [ ] BlogPostDTO updated
- [ ] BlogPostMapper includes new fields
- [ ] Repository method added
- [ ] Controller endpoint `/featured` added
- [ ] Backend server restarted
- [ ] API returns featured posts
- [ ] At least 3 posts marked as featured
- [ ] Frontend loads and displays posts

---

## 🎯 Result

Homepage will now display **only the blog posts you select** by marking them as featured:
- ✅ Control which posts appear (`isFeatured = true`)
- ✅ Control display order (`featuredOrder = 1, 2, 3`)
- ✅ Not all posts - only featured ones!
- ✅ Automatic fallback to recent posts if needed

**API Endpoint:** `GET /api/blog-posts/featured?limit=3`
