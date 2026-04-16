# Website Content Management API Documentation

**Base URL:** `/api`

---

## 📋 Overview

The Website Content Management system allows you to dynamically manage home page content (and other pages) through the backend. Content is stored in the `website_content` table and can be managed through admin dashboard or API.

### ✅ Key Features

- **Multi-language Support** - English (`_EN`) and Arabic (`_AR`) content
- **Multiple Content Types** - TEXT, IMAGE, HTML, VIDEO, URL
- **Display Order Control** - Order content by `displayOrder` field
- **Active**Status - Show/hide content with `isActive` flag
- **Section-based Organization** - Group content by section names

---

## 🗂️ WebsiteContent Model

```java
@Entity
@Table(name = "website_content")
public class WebsiteContent {
    private Long id;
    private String pageName;      // Home, About, Contact, Policies
    private String sectionName;   // Hero_EN, Hero_AR, Features_EN, etc.
    private ContentType contentType; // TEXT, IMAGE, HTML, VIDEO, URL
    private String contentValue;   // The actual content
    private Integer displayOrder;  // Order of display (ascending)
    private Boolean isActive;      // true/false
    
    public enum ContentType {
        TEXT, IMAGE, HTML, VIDEO, URL
    }
}
```

---

## 🌐 API Endpoints

### GET /website-content/page/{pageName}
**Description:** Get all content for a specific page  
**Authentication:** None  

**Example Request:**
```http
GET /api/website-content/page/Home
```

**Example Response:**
```json
[
  {
    "id": 1,
    "pageName": "Home",
    "sectionName": "Hero_EN",
    "contentType": "TEXT",
    "contentValue": "Leather",
    "displayOrder": 1,
    "isActive": true
  },
  {
    "id": 2,
    "pageName": "Home",
    "sectionName": "Hero_EN",
    "contentType": "TEXT",
    "contentValue": "BAGS",
    "displayOrder": 2,
    "isActive": true
  },
  {
    "id": 3,
    "pageName": "Home",
    "sectionName": "Hero_EN",
    "contentType": "HTML",
    "contentValue": "Crafted from Finest Leather <a href='/shop'>for Modern Icons</a>",
    "displayOrder": 3,
    "isActive": true
  },
  {
    "id": 4,
    "pageName": "Home",
    "sectionName": "Hero_EN",
    "contentType": "IMAGE",
    "contentValue": "/uploads/hero-banner.jpg",
    "displayOrder": 4,
    "isActive": true
  }
]
```

### GET /website-content/page/{pageName}/section/{sectionName}
**Description:** Get content for a specific section  
**Authentication:** None  

**Example Request:**
```http
GET /api/website-content/page/Home/section/Hero_EN
```

### GET /website-content/{id}
**Description:** Get single content by ID  
**Authentication:** Required (Admin)  

### POST /website-content
**Description:** Create new website content  
**Authentication:** Required (Admin)  

**Request Body:**
```json
{
  "pageName": "Home",
  "sectionName": "Hero_EN",
  "contentType": "TEXT",
  "contentValue": "Leather",
  "displayOrder": 1,
  "isActive": true
}
```

### PUT /website-content/{id}
**Description:** Update website content  
**Authentication:** Required (Admin)  

### PATCH /website-content/{id}/toggle-active
**Description:** Toggle content active status  
**Authentication:** Required (Admin)  

### DELETE /website-content/{id}
**Description:** Delete website content  
**Authentication:** Required (Admin)  

---

## 📝 Content Organization Guide

### Naming Convention

Use the format: `{Section}_{Language}`

**Examples:**
- `Hero_EN` - English hero section
- `Hero_AR` - Arabic hero section
- `Features_EN` - English features section
- `About_AR` - Arabic about section

### Section Names for Home Page

| Section Name | Purpose | Content Types |
|-------------|---------|---------------|
| `Hero_EN` / `Hero_AR` | Main hero/banner section | TEXT, IMAGE, HTML, URL |
| `About_EN` / `About_AR` | About section | TEXT, HTML, IMAGE |
| `Features_EN` / `Features_AR` | Features/benefits section | TEXT, IMAGE |
| `Testimonials_EN` / `Testimonials_AR` | Customer testimonials | TEXT, IMAGE |
| `CTA_EN` / `CTA_AR` | Call-to-action section | TEXT, URL |

---

## 🎨 Hero Section Content Structure

The hero section requires multiple content items with specific display order:

### English Hero Content

```sql
INSERT INTO website_content (page_name, section_name, content_type, content_value, display_order, is_active) VALUES
('Home', 'Hero_Title1_EN', 'TEXT', 'Leather', 1, true),
('Home', 'Hero_Title2_EN', 'TEXT', 'BAGS', 2, true),
('Home', 'Hero_Subtitle_EN', 'HTML', 'Crafted from Finest Leather <a href="/shop-sidebar.html">for Modern Icons</a>', 3, true),
('Home', 'Hero_Button_EN', 'TEXT', 'Shop Now', 4, true),
('Home', 'Hero_ButtonLink_EN', 'URL', 'shop-sidebar.html', 5, true),
('Home', 'Hero_Image_EN', 'IMAGE', 'assets/img/hero/hero-slide-1-1-3.jpg', 6, true);
```

### Arabic Hero Content

```sql
INSERT INTO website_content (page_name, section_name, content_type, content_value, display_order, is_active) VALUES
('Home', 'Hero_Title1_AR', 'TEXT', 'جلد', 1, true),
('Home', 'Hero_Title2_AR', 'TEXT', 'حقائب', 2, true),
('Home', 'Hero_Subtitle_AR', 'HTML', 'مصنوعة من أجود أنواع الجلود <a href="/shop-sidebar.html">للأيقونات الحديثة</a>', 3, true),
('Home', 'Hero_Button_AR', 'TEXT', 'تسوق الآن', 4, true),
('Home', 'Hero_ButtonLink_AR', 'URL', 'shop-sidebar.html', 5, true),
('Home', 'Hero_Image_AR', 'IMAGE', 'assets/img/hero/hero-slide-ar.jpg', 6, true);
```

---

## 🔧 Frontend Implementation

### 1. HTML Structure with Data Attributes

```html
<div class="hero-content" data-content-section="hero">
  <h1 class="hero-title">
    <span class="highlight" data-content="hero-title1">Leather</span>
    <span data-content="hero-title2">BAGS</span>
  </h1>
  <span class="hero-subtitle" data-content="hero-subtitle">
    Crafted from Finest Leather
  </span>
  <a href="#" class="vs-btn" data-content="hero-button" data-link="hero-button-url">
    Shop Now
  </a>
</div>
<img src="#" class="hero-img" data-content="hero-image">
```

### 2. JavaScript Content Loader

The `home-content-loader.js` automatically:
- Fetches content from backend on page load
- Filters by current language
- Updates DOM elements with matching data attributes
- Handles language switching

### 3. Content Mapping

| Data Attribute | Section Name | Content Type |
|----------------|--------------|--------------|
| `data-content="hero-title1"` | `Hero_Title1_{LANG}` | TEXT |
| `data-content="hero-title2"` | `Hero_Title2_{LANG}` | TEXT |
| `data-content="hero-subtitle"` | `Hero_Subtitle_{LANG}` | HTML |
| `data-content="hero-button"` | `Hero_Button_{LANG}` | TEXT |
| `data-link="hero-button-url"` | `Hero_ButtonLink_{LANG}` | URL |
| `data-content="hero-image"` | `Hero_Image_{LANG}` | IMAGE |

---

## 💾 Database Setup

### Create Sample Home Page Content

```sql
-- English Content
INSERT INTO website_content (page_name, section_name, content_type, content_value, display_order, is_active) VALUES
-- Hero Section
('Home', 'Hero_Title1_EN', 'TEXT', 'Leather', 1, true),
('Home', 'Hero_Title2_EN', 'TEXT', 'BAGS', 2, true),
('Home', 'Hero_Subtitle_EN', 'HTML', 'Crafted from Finest Leather <a href="/shop-sidebar.html">for Modern Icons</a>', 3, true),
('Home', 'Hero_Button_EN', 'TEXT', 'Shop Now', 4, true),
('Home', 'Hero_ButtonLink_EN', 'URL', 'shop-sidebar.html', 5, true),
('Home', 'Hero_Image_EN', 'IMAGE', 'assets/img/hero/hero-slide-1-1-3.jpg', 6, true),

-- About Section
('Home', 'About_Title_EN', 'TEXT', 'About Yasso', 10, true),
('Home', 'About_Text_EN', 'HTML', '<p>We craft premium leather bags with exceptional quality and timeless design.</p>', 11, true),
('Home', 'About_Image_EN', 'IMAGE', 'assets/img/about/about-1.jpg', 12, true);

-- Arabic Content
INSERT INTO website_content (page_name, section_name, content_type, content_value, display_order, is_active) VALUES
-- Hero Section
('Home', 'Hero_Title1_AR', 'TEXT', 'جلد', 1, true),
('Home', 'Hero_Title2_AR', 'TEXT', 'حقائب', 2, true),
('Home', 'Hero_Subtitle_AR', 'HTML', 'مصنوعة من أجود أنواع الجلود <a href="/shop-sidebar.html">للأيقونات الحديثة</a>', 3, true),
('Home', 'Hero_Button_AR', 'TEXT', 'تسوق الآن', 4, true),
('Home', 'Hero_ButtonLink_AR', 'URL', 'shop-sidebar.html', 5, true),
('Home', 'Hero_Image_AR', 'IMAGE', 'assets/img/hero/hero-slide-1-1-3.jpg', 6, true),

-- About Section
('Home', 'About_Title_AR', 'TEXT', 'عن ياسو', 10, true),
('Home', 'About_Text_AR', 'HTML', '<p>نحن نصنع حقائب جلدية فاخرة بجودة استثنائية وتصميم خالد.</p>', 11, true),
('Home', 'About_Image_AR', 'IMAGE', 'assets/img/about/about-1.jpg', 12, true);
```

---

## 🔄 Admin Dashboard Integration

### Add Website Content Management Section

You can add a new section in the admin dashboard to manage website content:

```javascript
// In admin-dashboard.js
async function loadWebsiteContent() {
  const response = await apiRequest('/website-content/page/Home');
  const content = await response.json();
  displayWebsiteContent(content);
}

function displayWebsiteContent(content) {
  // Render table with content items
  // Allow edit, delete, toggle active
}
```

---

## 🌍 Language Switching

The system automatically handles language switching:

1. User selects language (English/Arabic)
2. `languageChanged` event is triggered
3. `home-content-loader.js` listens for the event
4. Content is reloaded for the new language
5. DOM is updated with language-specific content

---

## 📊 Content Types Usage

| Content Type | Use Case | Example |
|-------------|----------|---------|
| **TEXT** | Simple text content | Button labels, titles, short descriptions |
| **HTML** | Rich text with formatting | Paragraphs with links, formatted text |
| **IMAGE** | Image URLs/paths | Banner images, icons, photos |
| **VIDEO** | Video URLs | YouTube links, video files |
| **URL** | Links/endpoints | Button links, navigation URLs |

---

## ✅ Best Practices

1. **Always provide both languages** - Create `_EN` and `_AR` versions
2. **Use display order** - Control the sequence of content rendering
3. **Test inactive content** - Use `isActive=false` for drafts
4. **Consistent naming** - Follow the `{Section}_{Detail}_{LANG}` pattern
5. **Validate URLs** - Ensure image and link URLs are accessible
6. **Use HTML carefully** - Sanitize HTML content to prevent XSS
7. **Backup before changes** - Always backup content before updates

---

## 🐛 Troubleshooting

### Content Not Showing

1. Check `isActive` is `true`
2. Verify correct `pageName` (case-sensitive)
3. Ensure language suffix matches current language
4. Check browser console for errors
5. Verify API endpoint is accessible

### Images Not Loading

1. Check image path is correct
2. Ensure image exists in specified location
3. Verify API base URL configuration
4. Check CORS settings if loading from different domain

### Language Not Switching

1. Verify `_EN` and `_AR` versions exist
2. Check `i18n.js` is loaded before `home-content-loader.js`
3. Ensure `languageChanged` event is triggered
4. Check localStorage for language preference

---

## 🔗 Related Documentation

- [Admin Dashboard API](ADMIN_DASHBOARD_API.md)
- [Arabic Support Guide](ARABIC_SUPPORT_API_REFERENCE.md)
- [i18n Implementation](README.md#internationalization)

---

**Base URL:** `/api`  
**Admin Authentication:** Bearer token required for admin endpoints  
**Public Endpoints:** Read-only content access
