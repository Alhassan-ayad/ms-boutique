# Dynamic Content Management Guide

## Overview
Your YASSO website already has a complete dynamic content management system! This guide shows you how to use it.

## System Components

### ✅ Already Implemented
1. **Backend API**: Website Content Management endpoints
2. **Frontend Loader**: `home-content-loader.js` script
3. **HTML Structure**: Data attributes for dynamic content
4. **Bilingual Support**: English + Arabic content fields

---

## Currently Active Dynamic Sections

### 1. **Hero Section** (`Hero`)
- Display Order 1: Title Word 1 (TEXT)
- Display Order 2: Title Word 2 (TEXT)
- Display Order 3: Subtitle (HTML)
- Display Order 4: Button Text (TEXT)
- Display Order 5: Button URL (URL)
- Display Order 6: Hero Image (IMAGE)

### 2. **Featured Products Section** (`Featured`)
- Display Order 1: Subtitle (TEXT) - e.g., "Find the perfect"
- Display Order 2: Main Title (TEXT) - e.g., "High Class Bags"
- Products loaded from `/products/featured` API

### 3. **Story Section** (`Story`) ⭐ NEW
- Display Order 1: Subtitle (TEXT) - e.g., "our story"
- Display Order 2: Main Heading (TEXT) - e.g., "OUR STORY"
- Display Order 3: Story Text (HTML/TEXT) - Full story paragraph

---

## How to Add Content via Admin Dashboard

### Step 1: Login to Admin Dashboard
Navigate to `admin-dashboard.html` and login with your credentials.

### Step 2: Go to "Website Content" Section
In the sidebar, click on **Website Content Management**.

### Step 3: Add New Content

Click **"Add Content"** and fill in these fields:

#### Required Fields:
- **Page Name**: `Home` (or other page names)
- **Section Name**: `Story` (must match exactly - case sensitive)
- **Content Type**: Choose from:
  - `TEXT` - Plain text
  - `HTML` - Rich text with HTML tags
  - `IMAGE` - Image URL
  - `VIDEO` - Video URL
  - `URL` - Link/URL
- **Content Value**: English content
- **Content Value (Arabic)**: Arabic translation (optional)
- **Display Order**: Numeric order (1, 2, 3...)
- **Is Active**: Check to make it visible

---

## Example: Adding Story Section Content

### Content Item #1 - Subtitle
```
Page Name: Home
Section Name: Story
Content Type: TEXT
Content Value: our story
Content Value (Arabic): قصتنا
Display Order: 1
Is Active: ✓
```

### Content Item #2 - Heading
```
Page Name: Home
Section Name: Story
Content Type: TEXT
Content Value: OUR STORY
Content Value (Arabic): قصتنا
Display Order: 2
Is Active: ✓
```

### Content Item #3 - Story Paragraph
```
Page Name: Home
Section Name: Story
Content Type: HTML
Content Value: Born fourteen years ago from a true love story, YASSO was created where craftsmanship met devotion — a brand defined by passion and timeless elegance. More than a handbag, each piece is thoughtfully designed to complement your lifestyle and accompany you beautifully for years. With refined silhouettes, intelligent interiors, premium leather, and meticulous craftsmanship, every detail reflects our commitment to exceptional quality and sophisticated style.
Content Value (Arabic): وُلدت قبل أربعة عشر عامًا من قصة حب حقيقية، تم إنشاء ياسو حيث التقت الحرفية بالتفاني - علامة تجارية تتميز بالشغف والأناقة الخالدة...
Display Order: 3
Is Active: ✓
```

---

## Adding New Dynamic Sections

Want to make another section dynamic? Follow these steps:

### 1. Update HTML with data-content Attributes

```html
<section class="my-section">
  <h2 data-content="mysection-title">Static Title</h2>
  <p data-content="mysection-text">Static text</p>
  <img data-content="mysection-image" src="fallback.jpg" alt="image">
</section>
```

### 2. Add Renderer Function in home-content-loader.js

```javascript
function renderMySection(content) {
  if (!content || content.length === 0) {
    console.log('No content for my section');
    return;
  }
  
  const title = document.querySelector('[data-content="mysection-title"]');
  const text = document.querySelector('[data-content="mysection-text"]');
  const image = document.querySelector('[data-content="mysection-image"]');
  
  const contentByOrder = {};
  content.forEach(item => {
    contentByOrder[item.displayOrder] = item;
  });
  
  if (contentByOrder[1] && title) {
    title.textContent = getContentValue(contentByOrder[1]);
  }
  
  if (contentByOrder[2] && text) {
    text.textContent = getContentValue(contentByOrder[2]);
  }
  
  if (contentByOrder[3] && image) {
    image.src = getContentValue(contentByOrder[3]);
  }
}
```

### 3. Load Section in loadHomeContent() Function

Add to the sections array and fetch:
```javascript
const sections = ['Hero', 'Featured', 'Story', 'MySection'];

const [heroContent, featuredContent, storyContent, myContent] = await Promise.all([
  fetchSectionContent('Hero'),
  fetchSectionContent('Featured'),
  fetchSectionContent('Story'),
  fetchSectionContent('MySection')
]);

if (myContent && myContent.length > 0) {
  renderMySection(myContent);
}
```

### 4. Add Content via Admin Dashboard

Create content items with:
- **Section Name**: `MySection` (must match exactly)
- **Display Order**: 1, 2, 3...
- Fill in content values

---

## API Endpoints Reference

### Fetch Section Content (Public - No Auth Required)
```
GET /api/website-content/section/{sectionName}/all
```

### Admin Endpoints (Auth Required)
```
POST   /api/website-content        - Create content
PUT    /api/website-content/{id}   - Update content
DELETE /api/website-content/{id}   - Delete content
GET    /api/website-content        - List all content
```

---

## Content Types Explained

| Type | Use For | Example |
|------|---------|---------|
| `TEXT` | Plain text, headings, buttons | "Our Story" |
| `HTML` | Rich text with formatting | `<strong>Bold</strong> text` |
| `IMAGE` | Image URLs | `https://example.com/image.jpg` |
| `VIDEO` | Video URLs | `https://youtube.com/watch?v=...` |
| `URL` | Links, button destinations | `/shop-sidebar.html` |

---

## Language Support

### How It Works
- All content has 2 fields: `contentValue` and `contentValueAr`
- Frontend automatically picks the right language based on user selection
- If Arabic translation missing, fallback to English

### Best Practices
1. **Always provide English** content in `contentValue`
2. **Add Arabic translation** in `contentValueAr` when available
3. Test both languages before publishing

---

## Testing Your Changes

1. **Add content** via admin dashboard
2. **Clear browser cache** (Ctrl + Shift + R)
3. **Reload homepage**
4. **Check console** (F12) for loading messages:
   ```
   🚀 Home Content Loader script loaded!
   📦 Fetched story content: [...]
   ✅ Story section rendered
   ```
5. **Switch languages** to test Arabic content

---

## Troubleshooting

### Content Not Showing?

**Check 1**: Is content marked as `Active`?
- Go to admin dashboard → Website Content
- Verify the checkbox is checked

**Check 2**: Is Section Name correct?
- Must match exactly (case-sensitive)
- `Story` ✓  `story` ✗

**Check 3**: Console errors?
- Open browser console (F12)
- Look for red error messages

**Check 4**: API responding?
- Test URL: `http://localhost:8081/api/website-content/section/Story/all`
- Should return JSON array

### Wrong Content Displaying?

**Check Display Order**:
- Display order determines position
- Lower numbers appear first
- Orders should be: 1, 2, 3, 4...

**Check Language**:
- If Arabic shows in English mode, check `contentValue` field
- If English shows in Arabic mode, check `contentValueAr` field

---

## Best Practices

1. **Use Meaningful Section Names**
   - `Story` ✓
   - `sec1` ✗

2. **Consistent Display Orders**
   - Start from 1
   - No gaps (1, 2, 3 not 1, 5, 10)

3. **Bilingual Content**
   - Always provide English
   - Add Arabic when possible

4. **Content Type Selection**
   - Use `TEXT` for simple text
   - Use `HTML` when you need formatting
   - Use `IMAGE` for all images

5. **Test Before Publishing**
   - Preview in both languages
   - Check on mobile devices

---

## Need More Help?

- Check browser console for detailed logs
- Verify API is running on `http://localhost:8081`
- Ensure you're logged in to admin dashboard
- Contact developer if issues persist

---

**Last Updated**: March 3, 2026
