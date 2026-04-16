# Dynamic Product Filters Guide

## Overview

The product filtering and search system now **dynamically fetches data from the backend database** instead of using hardcoded values. This includes:

✅ **Available colors** from actual product variants  
✅ **Min/Max price range** from actual product prices  
✅ **Product search** by name and description  
✅ **Color filtering** based on database inventory  
✅ **Price range filtering** with database limits  

---

## 🎨 What Changed

### 1. **Website (shop-sidebar.html)**

#### New Features:
- **Dynamic Color Filters**: Colors are loaded from products in the database
- **Dynamic Price Range**: Min/Max prices are fetched from actual product pricing
- **Real-time Color Counts**: Shows how many products are available in each color
- **Search Integration**: Search bar now queries the backend API

#### New File Added:
- `assets/js/product-filters.js` - Handles all dynamic filter operations

---

### 2. **Admin Dashboard (admin-dashboard.html)**

#### New Features:
- **Dynamic Color Dropdown**: Populated with colors from database products
- **Dynamic Price Range**: Min/Max placeholders show actual price limits
- **Enhanced Search**: Search with Enter key support
- **Better Error Handling**: Loading states and error messages

#### Modified File:
- `assets/js/admin-dashboard.js` - Added `initializeProductFilters()` function

---

## 📡 Backend API Endpoints Used

### Get All Products
```
GET /api/products/active?page={page}&size={size}
```
Used to fetch all products and extract:
- Unique colors from `colorVariants[]`
- Min/Max price from `price` field

### Filter by Color and Price
```
GET /api/products/filter?color={color}&minPrice={min}&maxPrice={max}&page={page}&size={size}
```
Filters products based on selected criteria.

### Search Products
```
GET /api/products/search?keyword={keyword}&page={page}&size={size}
```
Searches product names and descriptions.

---

## 🚀 How It Works

### On Page Load (Website)

1. **Load Available Colors**
   ```javascript
   loadAvailableColors()
   ```
   - Fetches all active products
   - Extracts unique colors from `colorVariants`
   - Updates color checkboxes in filter sidebar
   - Displays count for each color

2. **Load Price Range**
   ```javascript
   loadPriceRange()
   ```
   - Fetches all active products
   - Calculates min/max from all product prices
   - Updates price slider with real limits

3. **Setup Listeners**
   ```javascript
   setupFilterListeners()
   ```
   - Binds color checkbox changes
   - Binds price slider updates
   - Binds search button click

### When Filters Applied

1. User selects filters (colors, price range)
2. `applyFilters()` is called
3. Backend API is queried with parameters
4. Products are re-rendered with filtered results
5. Color counts are updated

### Search Functionality

**Website:**
- User enters keyword in search bar
- Clicks search button or presses Enter
- Calls `/products/search?keyword={keyword}`
- Displays matching products

**Admin Dashboard:**
- User enters keyword in product search
- Clicks search button or presses Enter
- Calls `/products/search?keyword={keyword}`
- Displays results in products table

---

## 💡 Usage Examples

### Example 1: Filter by Color

**User Action:**
1. Opens shop page
2. Sees available colors (dynamically loaded)
3. Checks "Black" color
4. Clicks "Filter" button

**What Happens:**
```
GET /api/products/filter?color=Black&page=0&size=12&sort=name,asc
```
Shows only products with Black color variants in stock.

---

### Example 2: Filter by Price Range

**User Action:**
1. Adjusts price slider to $50 - $200
2. Clicks "Filter" button

**What Happens:**
```
GET /api/products/filter?minPrice=50&maxPrice=200&page=0&size=12
```
Shows products priced between $50 and $200.

---

### Example 3: Combined Filters

**User Action:**
1. Selects "Brown" color
2. Sets price range $100 - $300
3. Clicks "Filter"

**What Happens:**
```
GET /api/products/filter?color=Brown&minPrice=100&maxPrice=300&page=0&size=12
```
Shows Brown products priced $100-$300.

---

### Example 4: Search

**User Action:**
1. Types "leather bag" in search
2. Presses Enter or clicks search button

**What Happens:**
```
GET /api/products/search?keyword=leather%20bag&page=0&size=12
```
Shows products matching "leather bag" in name or description.

---

## 🔧 Configuration

### Customize Default Page Size

In `product-filters.js`:
```javascript
const DEFAULT_PAGE_SIZE = 12; // Change this value
```

### Customize API Base URL

In `product-filters.js`:
```javascript
const API_BASE_URL = window.API_CONFIG?.BASE_URL || 'http://localhost:8081/api';
```

---

## 📊 Color Filter Display

### Before (Hardcoded):
```html
<li><input type="checkbox" id="brown"> <label>Brown</label> <span>02</span></li>
<li><input type="checkbox" id="black"> <label>Black</label> <span>03</span></li>
```

### After (Dynamic):
```javascript
// Colors loaded from database
availableColors = ['Black', 'Brown', 'Beige', 'Gold', 'Burgundy']

// Count calculated from actual products
colorCounts = {
  'Black': 5,
  'Brown': 3,
  'Beige': 2,
  'Gold': 1,
  'Burgundy': 0
}
```

---

## 🎯 Price Range Handling

### Before (Hardcoded):
```html
<input type="number" id="minPrice" placeholder="Min">
<input type="number" id="maxPrice" placeholder="Max">
```

### After (Dynamic):
```javascript
// Fetched from database
priceRange = {
  min: 45,  // Lowest priced product
  max: 350  // Highest priced product
}

// Applied to inputs
<input type="number" min="45" max="350" placeholder="Min: $45">
<input type="number" min="45" max="350" placeholder="Max: $350">
```

---

## 🔍 Admin Dashboard Filters

### Color Dropdown

**Before:**
```html
<select id="productColorFilter">
  <option value="all">All Colors</option>
  <option value="Red">Red</option>
  <option value="Blue">Blue</option>
  <!-- ... hardcoded colors -->
</select>
```

**After:**
```javascript
async function loadProductColors() {
  // Fetches products from database
  // Extracts unique colors from colorVariants
  // Dynamically populates dropdown
}
```

**Result:**
```html
<select id="productColorFilter">
  <option value="all">All Colors</option>
  <option value="Beige">Beige</option>
  <option value="Black">Black</option>
  <option value="Brown">Brown</option>
  <!-- ... colors from database -->
</select>
```

---

## 🚨 Error Handling

### Network Errors

If API is unreachable:
1. **Website**: Falls back to cached products or sample data
2. **Admin Dashboard**: Shows error message and retains current display

### Empty Results

If no products match filters:
- Website shows "No products found" message
- Admin dashboard shows empty table with helpful message

---

## 🧪 Testing

### Test Dynamic Filters

1. **Add New Product with New Color**
   - Add product in admin dashboard with color "Navy Blue"
   - Refresh shop page
   - ✅ "Navy Blue" should appear in color filters

2. **Change Product Prices**
   - Update product prices in database
   - Reload shop page
   - ✅ Price range slider should reflect new min/max

3. **Search Functionality**
   - Search for "leather"
   - ✅ Should show all products with "leather" in name or description

4. **Filter Combinations**
   - Select color + price range
   - ✅ Should show products matching BOTH criteria

---

## 📝 API Requirements

### Product Object Structure

The backend must return products with this structure:

```json
{
  "id": 1,
  "name": "Leather Tote Bag",
  "description": "Premium leather...",
  "price": 149.99,
  "colorVariants": [
    {
      "id": 1,
      "color": "Black",
      "stockQuantity": 15,
      "colorCode": "#000000"
    },
    {
      "id": 2,
      "color": "Brown",
      "stockQuantity": 10,
      "colorCode": "#8B4513"
    }
  ]
}
```

### Required API Endpoints

✅ `GET /products/active` - List of active products  
✅ `GET /products/filter` - Filter by color and price  
✅ `GET /products/search` - Search by keyword  

---

## 🎨 UI/UX Improvements

1. **Color Count Badges**: Shows product availability per color
2. **Smart Placeholders**: Price inputs show actual min/max from database
3. **Loading States**: Visual feedback during API calls
4. **Error Messages**: User-friendly error handling
5. **Enter Key Support**: Search on Enter key press
6. **Auto-update**: Color counts refresh after filtering

---

## 🔄 Future Enhancements

Potential improvements:

- [ ] Multi-color selection (AND/OR logic)
- [ ] Category + Color + Price combined filters
- [ ] Sort options (price: low-to-high, popularity, etc.)
- [ ] Filter persistence in URL parameters
- [ ] "Clear All Filters" button
- [ ] Filter count badges ("5 filters active")
- [ ] Advanced search (by SKU, category, etc.)

---

## 📚 Related Files

### Website
- `shop-sidebar.html` - Filter UI
- `assets/js/product-filters.js` - Filter logic (NEW)
- `assets/js/products-data.js` - Product rendering

### Admin Dashboard
- `admin-dashboard.html` - Admin filter UI
- `assets/js/admin-dashboard.js` - Admin filter logic (UPDATED)

### Documentation
- `WEBSITE_API.md` - Public API endpoints
- `ADMIN_DASHBOARD_API.md` - Admin API endpoints
- `DYNAMIC_FILTERS_GUIDE.md` - This file

---

## 🎉 Benefits

✅ **Accurate**: Filters always match current inventory  
✅ **Dynamic**: No need to update frontend when adding products/colors  
✅ **User-Friendly**: Shows only available options  
✅ **Scalable**: Works with any number of products/colors  
✅ **Maintainable**: Single source of truth (database)  

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify backend API is running
3. Test API endpoints directly
4. Check network tab in DevTools
5. Verify product data structure matches requirements

---

**Last Updated**: February 26, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
