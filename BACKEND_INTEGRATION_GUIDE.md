# YASSO Backend Integration - Implementation Guide

## Overview

This implementation connects the YASSO website bag/shop page to the backend API to fetch and display products dynamically. The system includes filtering, sorting, pagination, and category management.

## Files Modified/Created

### New Files Created:

1. **`assets/js/api-config.js`** - Centralized API configuration
2. **`assets/js/products-data.js`** - Main products data handler (replaced old version)
3. **`assets/js/categories-loader.js`** - Categories loader for sidebar and menu
4. **`assets/js/products-data.js.backup`** - Backup of original file

### Modified Files:

1. **`shop-sidebar.html`** - Added new script references for API integration

## Features Implemented

### ✅ Product Listing
- Fetches products from `/api/products/active` endpoint
- Displays products with images, names, prices, and stock status
- Supports pagination (12 products per page)
- Shows "New" and "Out of Stock" badges

### ✅ Filtering
- **By Color**: Multiple color selection (Brown, Gold, Beige, Black, etc.)
- **By Price**: Price range slider (EGP 0 - EGP 2000)
- Calls `/api/products/filter` endpoint with selected filters

### ✅ Sorting
- Sort by popularity
- Sort by rating
- Sort by latest
- Sort by price (low to high)
- Sort by price (high to low)

### ✅ Category Navigation
- Fetches categories from `/api/product-categories/all-active`
- Displays categories in sidebar as radio buttons
- Updates navigation menu with category links
- Filters products when category is selected

### ✅ Search
- Supports URL parameter: `?search=keyword`
- Calls `/api/products/search` endpoint

### ✅ Pagination
- Dynamic pagination based on API response
- Shows current page, total pages
- Previous/Next navigation
- Direct page number navigation

### ✅ Error Handling
- Graceful fallback to cached data if API is down
- Shows loading states during API calls
- Displays error messages with retry option
- User-friendly "No products found" message

### ✅ Offline Support
- Caches products and categories in localStorage
- Falls back to cached data if API is unavailable
- Cache expires after 5 minutes

### ✅ Shopping Cart
- Add to cart functionality
- Cart count updates in header
- Stores cart in localStorage
- Displays success notifications

## API Endpoints Used

### Products
- `GET /api/products/active?page={page}&size={size}&sort={sort}` - Get active products
- `GET /api/products/filter?color={color}&minPrice={min}&maxPrice={max}` - Filter products
- `GET /api/products/category/{categoryId}` - Get products by category
- `GET /api/products/search?keyword={keyword}` - Search products

### Categories
- `GET /api/product-categories/all-active` - Get all active categories

### Reviews (Ready for future implementation)
- `GET /api/product-reviews/product/{productId}/visible` - Get product reviews
- `POST /api/product-reviews` - Submit review

## Configuration

### Change API Base URL

Edit `assets/js/api-config.js`:

```javascript
window.YASSO_CONFIG = {
  API_BASE_URL: 'http://localhost:8081/api', // Change this to your production API
  // ... other settings
};
```

### Adjust Pagination

Edit `assets/js/api-config.js`:

```javascript
DEFAULT_PAGE_SIZE: 12, // Change to 20, 24, etc.
```

### Currency Settings

Edit `assets/js/api-config.js`:

```javascript
CURRENCY: {
  SYMBOL: 'EGP',
  CODE: 'EGP',
  POSITION: 'before' // 'before' or 'after'
}
```

## How It Works

### Page Load Flow

1. **Page loads** → `shop-sidebar.html`
2. **Scripts load in order**:
   - `api-config.js` - Sets up global configuration
   - `products-data.js` - Main products handler
   - `categories-loader.js` - Categories loader

3. **On DOMContentLoaded**:
   - Check URL parameters (category, search)
   - Fetch categories from API
   - Render categories in sidebar and menu
   - Fetch products from API (with filters if any)
   - Render products in grid
   - Update pagination controls
   - Update color counts
   - Setup event listeners for filters and sorting

### Filtering Flow

1. User selects color or adjusts price range
2. User clicks "Filter" button
3. `applyCurrentFilters()` is called
4. Collects selected colors and price range
5. Calls `loadProducts()` with filters
6. Calls API: `GET /api/products/filter?color=Brown&minPrice=100&maxPrice=500`
7. Renders filtered products
8. Updates results count

### Category Selection Flow

1. User clicks category radio button
2. `filterByCategory(categoryId)` is called
3. Calls API: `GET /api/products/category/{categoryId}`
4. Renders category products
5. Updates results count

### Pagination Flow

1. User clicks page number or prev/next
2. `goToPage(page)` is called
3. Scrolls to top of page
4. Calls `loadProducts(page, currentFilters)`
5. Fetches products for that page
6. Renders products
7. Updates pagination controls

### Add to Cart Flow

1. User clicks "Add to Cart" button
2. `addToCart(productId)` is called
3. Retrieves cart from localStorage
4. Adds product or increments quantity
5. Saves cart to localStorage
6. Updates cart count in header
7. Shows success notification

## Data Structures

### Product Object (from API)

```json
{
  "id": 1,
  "name": "Leather Tote Bag",
  "description": "Premium leather tote bag",
  "price": 149.99,
  "color": "Brown",
  "sku": "BAG-001",
  "stockQuantity": 25,
  "averageRating": 4.5,
  "totalReviewsCount": 12,
  "images": [
    {
      "id": 1,
      "imageUrl": "https://example.com/image.jpg",
      "displayOrder": 1
    }
  ],
  "category": {
    "id": 1,
    "name": "Tote Bags"
  }
}
```

### Paginated Response

```json
{
  "content": [...], // Array of products
  "totalElements": 50,
  "totalPages": 5,
  "number": 0, // Current page (0-based)
  "size": 12,
  "first": true,
  "last": false
}
```

### Category Object

```json
{
  "id": 1,
  "name": "Tote Bags",
  "description": "Spacious tote bags",
  "displayOrder": 1,
  "parentCategoryId": null
}
```

### Cart Structure (localStorage)

```json
[
  {
    "productId": 1,
    "quantity": 2,
    "addedDate": "2026-02-14T10:30:00"
  }
]
```

## Testing Checklist

### ✅ Basic Functionality
- [ ] Products load on page load
- [ ] Product images display correctly
- [ ] Product names and prices show correctly
- [ ] Stock status displays (In Stock / Out of Stock)
- [ ] "Add to Cart" button works
- [ ] Cart count updates in header

### ✅ Filtering
- [ ] Color filter works (single and multiple colors)
- [ ] Price range filter works
- [ ] "Clear All" button resets filters
- [ ] Filter results count updates correctly

### ✅ Sorting
- [ ] Sort by price (low to high) works
- [ ] Sort by price (high to low) works
- [ ] Sort by rating works
- [ ] Sort by latest works

### ✅ Categories
- [ ] Categories load in sidebar
- [ ] Category selection filters products
- [ ] "All Products" option shows all products
- [ ] Categories appear in navigation menu

### ✅ Pagination
- [ ] Pagination controls appear
- [ ] Page numbers are clickable
- [ ] Previous/Next buttons work
- [ ] Results count shows correct range
- [ ] Page number highlights current page

### ✅ Error Handling
- [ ] Loading state shows while fetching
- [ ] Error message shows if API fails
- [ ] Falls back to cached data if available
- [ ] "No products found" message displays correctly

### ✅ URL Parameters
- [ ] `?category=1` filters by category
- [ ] `?search=keyword` searches products

## Browser Console Logs

The implementation includes detailed console logging for debugging:

```javascript
// Example console output
"Initializing products page..."
"Fetching products from: http://localhost:8081/api/products/active?page=0&size=12"
"Products fetched successfully: {content: Array(12), totalElements: 50, ...}"
"renderProducts called with: 12 products"
"Products rendered successfully"
"Fetching categories from: http://localhost:8081/api/product-categories/all-active"
"Categories fetched successfully: [{id: 1, name: 'Tote Bags'}, ...]"
"Categories rendered in sidebar"
```

## Troubleshooting

### Products not loading?

1. Check browser console for errors
2. Verify API base URL in `api-config.js`
3. Check if backend API is running
4. Verify CORS is enabled on backend
5. Check network tab in DevTools

### Filters not working?

1. Check if jQuery UI is loaded (for price slider)
2. Verify filter event listeners are attached
3. Check console for API errors
4. Test API endpoint directly in browser/Postman

### Categories not showing?

1. Check if categories API returns data
2. Verify categories have `displayOrder` set
3. Check console logs for category loading
4. Ensure active status is true in backend

### Cart not working?

1. Check localStorage is enabled in browser
2. Verify `yasso_cart` key in localStorage
3. Check console for JavaScript errors
4. Test `addToCart()` function in console

### Images not loading?

1. Verify image URLs in API response
2. Check if images array has items
3. Ensure `displayOrder` is set on images
4. Check CORS settings for image URLs

## Quick Start

1. **Start your backend API** on `http://localhost:8081`

2. **Open shop-sidebar.html** in your browser

3. **Open browser console** (F12) to see logs

4. **Test basic functionality**:
   - Products should load automatically
   - Try filtering by color
   - Try sorting
   - Try pagination

5. **If products don't load**:
   - Check console for errors
   - Verify API is running
   - Check CORS settings

## Production Deployment

### Before deploying to production:

1. **Update API Base URL** in `api-config.js`:
   ```javascript
   API_BASE_URL: 'https://your-production-api.com/api'
   ```

2. **Test all features** on staging environment

3. **Verify CORS** settings on production API

4. **Enable caching** for better performance

5. **Monitor API** response times

6. **Setup error tracking** (e.g., Sentry)

## Future Enhancements

### Planned Features
- [ ] Wishlist functionality
- [ ] Product quick view modal
- [ ] Advanced search with autocomplete
- [ ] Recently viewed products
- [ ] Product comparison
- [ ] Social sharing
- [ ] Reviews display on product cards
- [ ] Filter by rating
- [ ] Infinite scroll option

### API Extensions Needed
- Wishlist endpoints (if backend implements them)
- Product comparison endpoint
- Recently viewed tracking
- Advanced search with filters

## Support

For issues or questions:
1. Check browser console for errors
2. Review API documentation: `WEBSITE_API.md`
3. Check backend logs
4. Test API endpoints directly

## Version History

### v1.0.0 (February 14, 2026)
- Initial implementation
- Products listing with pagination
- Color and price filters
- Category navigation
- Search functionality
- Shopping cart
- Error handling and offline support

---

**Developed by Alt Mate for YASSO**
