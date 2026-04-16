# Arabic Content Support - API Reference for Frontend

## 📋 Overview

The Yasso API now supports **bilingual content** (English & Arabic) for Products and Blog Posts. All Arabic fields are **optional** and can be sent/received alongside English content.

## ⚡ Quick Setup Status

- ✅ **Backend entities ready:** `Product` and `BlogPost` entities have Arabic fields
- ✅ **Frontend ready:** All forms, display components, and RTL support implemented
- ⚠️ **Action needed:** Run database migration to add columns (see [ARABIC_SETUP_COMPLETE_GUIDE.md](ARABIC_SETUP_COMPLETE_GUIDE.md))

## 🚀 Quick Start

1. **Run database migration:** Execute [database-migration-simple.sql](database-migration-simple.sql)
2. **Restart backend server**
3. **Test:** Use [test-arabic-fields.html](download%20version/test-arabic-fields.html) to verify
4. **Done!** Your website now supports bilingual content

---

## 🛍️ Product APIs with Arabic Support

### Product Response Structure

All product endpoints now return Arabic fields:

```json
{
  "id": 1,
  "name": "Leather Tote Bag",
  "nameAr": "حقيبة يد جلدية",
  "description": "Premium leather tote bag with spacious interior",
  "descriptionAr": "حقيبة يد جلدية فاخرة مع مساحة داخلية واسعة",
  "price": 149.99,
  "sku": "BAG-001",
  "category": {
    "id": 1,
    "name": "Tote Bags",
    "description": "..."
  },
  "isActive": true,
  "totalStock": 33,
  "averageRating": 4.5,
  "totalReviewsCount": 12,
  "images": [...],
  "colorVariants": [...],
  "createdDate": "2026-02-14T10:00:00",
  "updatedDate": "2026-02-14T10:00:00"
}
```

### Create/Update Product Request

When creating or updating products (Admin only):

```json
{
  "name": "Leather Tote Bag",
  "nameAr": "حقيبة يد جلدية",
  "description": "Premium leather tote bag with spacious interior",
  "descriptionAr": "حقيبة يد جلدية فاخرة مع مساحة داخلية واسعة",
  "price": 149.99,
  "categoryId": 1,
  "sku": "BAG-001",
  "isActive": true,
  "colorVariants": [
    {
      "color": "Black",
      "stockQuantity": 15,
      "colorCode": "#000000"
    }
  ]
}
```

### Affected Product Endpoints

All these endpoints now include Arabic fields in responses:

**Public Endpoints (Website):**
- `GET /api/products/active` - Browse active products
- `GET /api/products/{id}` - Get product details
- `GET /api/products/category/{categoryId}` - Products by category
- `GET /api/products/search?keyword=...` - Search products
- `GET /api/products/filter?color=...&minPrice=...&maxPrice=...` - Filter products
- `GET /api/products/top-rated` - Top rated products

**Admin Endpoints:**
- `GET /api/products` - All products (with pagination)
- `POST /api/products` - Create product (requires Arabic fields in request)
- `PUT /api/products/{id}` - Update product (can update Arabic fields)
- `GET /api/products/low-stock?threshold=10` - Low stock products

---

## 📝 Blog Post APIs with Arabic Support

### Blog Post Response Structure

All blog endpoints now return Arabic fields:

```json
{
  "id": 1,
  "title": "How to Choose the Perfect Bag",
  "titleAr": "كيف تختار الحقيبة المثالية",
  "slug": "how-to-choose-perfect-bag",
  "content": "<h2>Comprehensive Guide</h2><p>When choosing a bag...</p>",
  "contentAr": "<h2>دليل شامل</h2><p>عند اختيار حقيبة...</p>",
  "authorId": 1,
  "authorName": "mohamed awad",
  "featuredImage": "https://images.unsplash.com/photo-123456?w=800",
  "category": "Style Tips",
  "categoryAr": "نصائح الأناقة",
  "tags": "fashion,bags,style",
  "isPublished": true,
  "publishedDate": "2026-02-14T10:00:00",
  "createdDate": "2026-02-14T09:30:00",
  "updatedDate": "2026-02-14T09:30:00"
}
```

### Create/Update Blog Post Request

When creating or updating blog posts (Admin only):

```json
{
  "title": "How to Choose the Perfect Bag",
  "titleAr": "كيف تختار الحقيبة المثالية",
  "slug": "how-to-choose-perfect-bag",
  "content": "<h2>Comprehensive Guide</h2><p>When choosing a bag...</p>",
  "contentAr": "<h2>دليل شامل</h2><p>عند اختيار حقيبة...</p>",
  "authorId": 1,
  "featuredImage": "https://images.unsplash.com/photo-123456?w=800",
  "category": "Style Tips",
  "categoryAr": "نصائح الأناقة",
  "tags": "fashion,bags,style",
  "isPublished": true
}
```

### Affected Blog Post Endpoints

All these endpoints now include Arabic fields in responses:

**Public Endpoints (Website):**
- `GET /api/blog-posts/published` - Published blog posts
- `GET /api/blog-posts/{id}` - Get blog post by ID
- `GET /api/blog-posts/slug/{slug}` - Get blog post by slug
- `GET /api/blog-posts/category/{category}` - Posts by category
- `GET /api/blog-posts/tag/{tag}` - Posts by tag
- `GET /api/blog-posts/search?keyword=...` - Search posts
- `GET /api/blog-posts/recent?limit=5` - Recent posts

**Admin Endpoints:**
- `GET /api/blog-posts` - All blog posts
- `GET /api/blog-posts/drafts` - Draft posts
- `POST /api/blog-posts` - Create post (requires Arabic fields in request)
- `PUT /api/blog-posts/{id}` - Update post (can update Arabic fields)
- `PATCH /api/blog-posts/{id}/publish` - Publish post
- `PATCH /api/blog-posts/{id}/unpublish` - Unpublish post

---

## 🎯 Frontend Implementation Guidelines

### 1. Language Detection

Detect user's preferred language:
```javascript
const userLanguage = navigator.language.startsWith('ar') ? 'ar' : 'en';
```

### 2. Display Content Based on Language

For Products:
```javascript
const displayName = userLanguage === 'ar' && product.nameAr 
  ? product.nameAr 
  : product.name;

const displayDescription = userLanguage === 'ar' && product.descriptionAr 
  ? product.descriptionAr 
  : product.description;
```

For Blog Posts:
```javascript
const displayTitle = userLanguage === 'ar' && blogPost.titleAr 
  ? blogPost.titleAr 
  : blogPost.title;

const displayContent = userLanguage === 'ar' && blogPost.contentAr 
  ? blogPost.contentAr 
  : blogPost.content;

const displayCategory = userLanguage === 'ar' && blogPost.categoryAr 
  ? blogPost.categoryAr 
  : blogPost.category;
```

### 3. React Component Example

```jsx
function ProductCard({ product, language = 'en' }) {
  const name = language === 'ar' && product.nameAr 
    ? product.nameAr 
    : product.name;
    
  const description = language === 'ar' && product.descriptionAr 
    ? product.descriptionAr 
    : product.description;

  return (
    <div className="product-card" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <img src={product.images[0]?.imageUrl} alt={name} />
      <h3>{name}</h3>
      <p>{description}</p>
      <span className="price">${product.price}</span>
    </div>
  );
}
```

### 4. Admin Form Example (React)

```jsx
function ProductForm({ product, onSubmit }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    nameAr: product?.nameAr || '',
    description: product?.description || '',
    descriptionAr: product?.descriptionAr || '',
    price: product?.price || '',
    categoryId: product?.category?.id || '',
    sku: product?.sku || '',
    isActive: product?.isActive ?? true,
    colorVariants: product?.colorVariants || []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Product Name (English) *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Product Name (Arabic)</label>
          <input
            type="text"
            value={formData.nameAr}
            onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
            dir="rtl"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Description (English) *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Description (Arabic)</label>
          <textarea
            value={formData.descriptionAr}
            onChange={(e) => setFormData({...formData, descriptionAr: e.target.value})}
            dir="rtl"
          />
        </div>
      </div>

      {/* Other fields... */}
      
      <button type="submit">Save Product</button>
    </form>
  );
}
```

### 5. API Call Examples

**Fetch Products:**
```javascript
const fetchProducts = async () => {
  const response = await fetch('http://localhost:8081/api/products/active?page=0&size=12');
  const data = await response.json();
  // data.content contains array of products with Arabic fields
  return data;
};
```

**Create Product (Admin):**
```javascript
const createProduct = async (productData) => {
  const response = await fetch('http://localhost:8081/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      name: productData.name,
      nameAr: productData.nameAr,
      description: productData.description,
      descriptionAr: productData.descriptionAr,
      price: productData.price,
      categoryId: productData.categoryId,
      sku: productData.sku,
      isActive: productData.isActive,
      colorVariants: productData.colorVariants
    })
  });
  return response.json();
};
```

**Fetch Blog Posts:**
```javascript
const fetchBlogPosts = async () => {
  const response = await fetch('http://localhost:8081/api/blog-posts/published?page=0&size=10');
  const data = await response.json();
  // data.content contains array of blog posts with Arabic fields
  return data;
};
```

**Create Blog Post (Admin):**
```javascript
const createBlogPost = async (postData) => {
  const response = await fetch('http://localhost:8081/api/blog-posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      title: postData.title,
      titleAr: postData.titleAr,
      slug: postData.slug,
      content: postData.content,
      contentAr: postData.contentAr,
      authorId: postData.authorId,
      featuredImage: postData.featuredImage,
      category: postData.category,
      categoryAr: postData.categoryAr,
      tags: postData.tags,
      isPublished: postData.isPublished
    })
  });
  return response.json();
};
```

---

## 🔑 Key Points for Frontend Developer

### ✅ What Changed:
1. **Product Model** - Added `nameAr` and `descriptionAr` fields
2. **BlogPost Model** - Added `titleAr`, `contentAr`, and `categoryAr` fields
3. **All GET endpoints** - Now return Arabic fields in responses
4. **All POST/PUT endpoints** - Can accept Arabic fields in requests

### ✅ Backward Compatibility:
- All Arabic fields are **optional**
- Existing API calls without Arabic fields will continue to work
- No breaking changes to existing functionality

### ✅ Required Fields:
- English fields (`name`, `description`, `title`, `content`) are **still required**
- Arabic fields (`nameAr`, `descriptionAr`, `titleAr`, `contentAr`, `categoryAr`) are **optional**

### ✅ Validation:
- Arabic fields have the same max length validation as English fields
- `nameAr` and `titleAr`: max 255 characters
- `descriptionAr` and `contentAr`: max 5000 characters
- `categoryAr`: max 100 characters

### ✅ RTL Support:
- Use `dir="rtl"` attribute when displaying Arabic content
- Apply appropriate CSS for right-to-left layout
- Consider Arabic font families (e.g., "Cairo", "Noto Sans Arabic")

### ✅ Language Switcher:
- Implement a language toggle (EN/AR) in header
- Store user preference in localStorage
- Apply language preference across all pages

### ✅ SEO Considerations:
- Use proper `lang` attribute on `<html>` tag
- Consider separate routes or query params for Arabic content
- Update meta tags based on language

---

## 📚 Testing Endpoints

You can test the updated endpoints using these sample requests:

### Test Product Creation (Admin):
```bash
curl -X POST http://localhost:8081/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Leather Tote Bag",
    "nameAr": "حقيبة يد جلدية",
    "description": "Premium leather tote bag",
    "descriptionAr": "حقيبة يد جلدية فاخرة",
    "price": 149.99,
    "categoryId": 1,
    "sku": "BAG-001",
    "isActive": true,
    "colorVariants": [
      {
        "color": "Black",
        "stockQuantity": 15,
        "colorCode": "#000000"
      }
    ]
  }'
```

### Test Blog Post Creation (Admin):
```bash
curl -X POST http://localhost:8081/api/blog-posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to Choose a Bag",
    "titleAr": "كيف تختار حقيبة",
    "slug": "how-to-choose-bag",
    "content": "<p>Guide content...</p>",
    "contentAr": "<p>محتوى الدليل...</p>",
    "authorId": 1,
    "category": "Style Tips",
    "categoryAr": "نصائح الأناقة",
    "isPublished": true
  }'
```

### Test Product Retrieval (Public):
```bash
curl http://localhost:8081/api/products/active?page=0&size=12
```

### Test Blog Retrieval (Public):
```bash
curl http://localhost:8081/api/blog-posts/published?page=0&size=10
```

---

## 📖 Additional Documentation

For complete API documentation, refer to:
- **[WEBSITE_API.md](WEBSITE_API.md)** - Public website/store APIs
- **[ADMIN_DASHBOARD_API.md](ADMIN_DASHBOARD_API.md)** - Admin dashboard APIs
- **[BLOG_API_DOCUMENTATION.md](BLOG_API_DOCUMENTATION.md)** - Blog-specific APIs

---

## 🆘 Support

If you encounter any issues or have questions:
1. Check the main API documentation files
2. Verify token authentication for admin endpoints
3. Ensure Content-Type headers are set correctly
4. Check browser console for any CORS issues

**Base URL:** `http://localhost:8081/api`
**Authentication:** Bearer token for admin endpoints
**No authentication required** for public website endpoints
