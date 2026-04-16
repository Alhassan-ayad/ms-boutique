# Troubleshooting Guide: Dashboard Not Loading Data

## Issue
The dashboard shows empty data for Products and Home Content sections.

## Root Cause
Two possible reasons:
1. **Backend endpoints mismatch** - Fixed in latest update
2. **No data in database** - Backend database is empty

## Solutions Implemented

### 1. Fixed Home Content API Endpoints
Updated `loadHomeContent()` function to use correct backend endpoints:
- `/website-content/section/{section}/all` - Returns List of content by section
- `/website-content/type/{type}` - Returns List of content by type  
- `/website-content?page=X&size=Y` - Returns paginated content (default)

### 2. Added Console Logging
Added debug logs to help track down issues:
- Open browser console (F12) to see:
  - "Loading products from backend..."
  - "Products loaded: {data}"
  - "Loading home content..." 
  - "Home content loaded: {data}"

### 3. Created API Test Page
Created `test-api.html` to verify backend connectivity:
1. Open `test-api.html` in browser
2. Login with admin credentials
3. Click "GET All Products" and "GET All Content"
4. Check if backend has data

## How to Test

### Step 1: Verify Backend is Running
```powershell
Test-NetConnection -ComputerName localhost -Port 8081
```
✅ Should show: `TcpTestSucceeded : True`

### Step 2: Test API Directly
1. Open `test-api.html` in browser
2. Enter admin credentials (default: admin/admin)
3. Click "Login" button
4. Click "Count Products" to see how many products exist
5. Click "GET All Content" to see website content

### Step 3: Open Dashboard
1. Open `admin-dashboard.html`
2. Login with admin credentials
3. Open browser console (F12 → Console tab)
4. Navigate to "Products" section
5. Check console logs:
   - If you see "Products loaded: { content: [], totalElements: 0 }" → Database is empty
   - If you see errors → Backend issue

### Step 4: Check for Empty Data
If `totalElements: 0`, you need to add data through:
- **Option A**: Use dashboard "Add Product" / "Add Home Content" buttons
- **Option B**: Use backend API directly via test-api.html
- **Option C**: Import sample data via backend

## Expected Console Output (When Working)

### Products Loading Successfully:
```
Loading products from backend... http://localhost:8081/api/products?page=0&size=10
Products loaded: {
  content: [{id: 1, name: "Product 1", ...}, ...],
  totalElements: 5,
  totalPages: 1,
  number: 0
}
```

### Home Content Loading Successfully:
```
Loading home content... {section: "all", type: "all", page: 0}
Fetching all content: /website-content?page=0&size=10&sort=section,asc
Home content loaded: {
  content: [{id: 1, key: "hero_title", section: "HERO", ...}, ...],
  totalElements: 12,
  totalPages: 2
}
```

## Common Errors & Fixes

### Error: "Failed to load products"
**Cause**: Backend not running or authentication failed
**Fix**: 
1. Check backend is running on port 8081
2. Verify you're logged in (check localStorage for 'adminToken')
3. Check browser console for 401 errors

### Error: 401 Unauthorized
**Cause**: Token expired or invalid
**Fix**: Logout and login again

### Success but Empty Data
**Cause**: Database has no records
**Fix**: Add data using dashboard forms:
1. Click "Add Product" button in Products section
2. Fill form and submit
3. Click "Add Home Content" button in Home Content section
4. Fill form and submit

## Quick Test Checklist

- [ ] Backend running on port 8081
- [ ] Can login successfully 
- [ ] Browser console shows "Loading products..." messages
- [ ] `test-api.html` returns data
- [ ] Dashboard displays "No products found" or actual products
- [ ] Dashboard displays "No content found" or actual content

## Next Steps

1. Open `test-api.html` first to verify backend connectivity
2. If backend has data but dashboard shows empty → Check browser console for errors
3. If backend is empty → Add sample data using dashboard forms
4. Check console logs for detailed error messages

## Files Modified
- `assets/js/admin-dashboard.js` - Fixed endpoints and added logging
- `test-api.html` - New API testing tool
