# Drag & Drop Image Upload Implementation

## Overview
Successfully implemented drag-and-drop file upload functionality for the admin dashboard, allowing administrators to easily upload images for blog posts, promotional popups, and website content.

## Features Implemented

### 1. **Blog Posts - Featured Images**
- Drag-and-drop upload zone for blog post featured images
- Manual URL input as an alternative
- Image preview with remove button
- Automatic integration with backend endpoint: `POST /api/blog-posts/upload-image`

### 2. **Promotional Popups - Images**
- Drag-and-drop upload zone for popup images
- Manual URL input as an alternative
- Image preview with remove button
- Automatic integration with backend endpoint: `POST /api/promotional-popups/upload-image`

### 3. **Website Content - Content Images**
- Smart upload zone that appears only when content type is "IMAGE"
- Drag-and-drop upload functionality
- Image preview with remove button
- Automatic integration with backend endpoint: `POST /api/website-content/upload-image`

## File Validations

### Supported Image Formats
- JPG/JPEG
- PNG
- GIF
- WebP

### Size Limits
- **Max File Size**: 10MB per image
- Files exceeding this limit will be rejected with an error message

## User Interface

### Upload Zone Features
1. **Visual Feedback**:
   - Hover effect on the upload zone
   - Active state when dragging files over the zone
   - Uploading state with visual indicator
   - Error messages for invalid files

2. **Interaction Methods**:
   - Drag and drop files directly onto the upload zone
   - Click the upload zone to browse files
   - Manually enter image URLs (for blog posts and popups)

3. **Image Preview**:
   - Displays uploaded/selected image
   - Shows remove button (X) in top-right corner
   - Clicking remove clears the image and shows upload zone again

## Implementation Details

### CSS Classes Added
- `.upload-zone` - Main upload area styling
- `.upload-zone:hover` - Hover state
- `.upload-zone.drag-active` - Active dragging state
- `.upload-zone.uploading` - Uploading state
- `.upload-zone-label` - Label container styling
- `.image-preview-container` - Image preview wrapper
- `.image-preview-remove` - Remove button styling
- `.upload-error` - Error message styling

### JavaScript Functions Added

#### Core Functions
1. **`initDragAndDrop(uploadZoneId, endpoint, targetInputId, previewContainerId)`**
   - Initializes drag-and-drop functionality for a specific upload zone
   - Parameters:
     - `uploadZoneId`: ID of the upload zone element
     - `endpoint`: API endpoint for upload (e.g., '/blog-posts/upload-image')
     - `targetInputId`: ID of the input field to populate with the uploaded image URL
     - `previewContainerId`: ID of the preview container element

2. **`handleImageUpload(file, endpoint, targetInput, previewContainer, uploadZone)`**
   - Handles the actual file upload to the backend
   - Validates file type and size
   - Shows uploading state
   - Updates target input with returned URL
   - Displays preview on success

3. **`showImagePreview(imageUrl, previewContainer, targetInput)`**
   - Creates and displays image preview with remove button
   - Handles both relative and absolute URLs

4. **`removeImagePreview(previewContainerId, targetInputId)`**
   - Removes image preview
   - Clears input values
   - Shows upload zone again

5. **`showUploadError(uploadZone, message)`**
   - Displays error messages within the upload zone
   - Auto-hides after 5 seconds

### HTML Structure Added

#### Blog Post Form
```html
<div id="blogImageUploadZone" class="upload-zone">
  <input type="file" accept="image/*" id="blogImageFile">
  <div class="upload-zone-label">
    <i class="fas fa-cloud-upload-alt"></i>
    <span class="upload-text">Drag & drop image here or click to browse</span>
    <span class="upload-hint">JPG, PNG, GIF, WebP (Max 10MB)</span>
  </div>
</div>
<div id="blogImagePreview" style="display:none;"></div>
<input type="text" id="blogImage" style="display:none;">
```

#### Promotional Popup Form
```html
<div id="popupImageUploadZone" class="upload-zone">
  <input type="file" accept="image/*" id="popupImageFile">
  <div class="upload-zone-label">
    <i class="fas fa-cloud-upload-alt"></i>
    <span class="upload-text">Drag & drop image here or click to browse</span>
    <span class="upload-hint">JPG, PNG, GIF, WebP (Max 10MB)</span>
  </div>
</div>
<div id="popupImagePreview" style="display:none;"></div>
<input type="text" id="popupImage" style="display:none;">
```

#### Website Content Form
```html
<div id="contentImageUploadContainer" class="form-group" style="display:none;">
  <label>Upload Image</label>
  <div id="contentImageUploadZone" class="upload-zone">
    <input type="file" accept="image/*" id="contentImageFile">
    <div class="upload-zone-label">
      <i class="fas fa-cloud-upload-alt"></i>
      <span class="upload-text">Drag & drop image here or click to browse</span>
      <span class="upload-hint">JPG, PNG, GIF, WebP (Max 10MB)</span>
    </div>
  </div>
  <div id="contentImagePreview" style="display:none;"></div>
</div>
```

## Usage Instructions

### For Blog Posts
1. Click "Add New Blog Post" button
2. Fill in the blog post details
3. Scroll to the "Featured Image" section
4. Either:
   - Drag and drop an image onto the upload zone, OR
   - Click the upload zone to browse for a file, OR
   - Enter a manual URL in the text field below
5. Preview the image
6. Click "X" to remove and select a different image if needed
7. Submit the form

### For Promotional Popups
1. Click "Add New Popup" button
2. Fill in the popup details
3. Scroll to the "Image" section
4. Either:
   - Drag and drop an image onto the upload zone, OR
   - Click the upload zone to browse for a file, OR
   - Enter a manual URL in the text field below
5. Preview the image
6. Click "X" to remove and select a different image if needed
7. Submit the form

### For Website Content
1. Click "Add Home Content" button
2. Select "IMAGE" from the Content Type dropdown
3. The upload zone will automatically appear
4. Either:
   - Drag and drop an image onto the upload zone, OR
   - Click the upload zone to browse for a file
5. Preview the image
6. Click "X" to remove and select a different image if needed
7. Submit the form

## Backend Integration

### API Endpoints Required
All three endpoints are already implemented on the backend:

1. **Blog Posts**: `POST /api/blog-posts/upload-image`
2. **Promotional Popups**: `POST /api/promotional-popups/upload-image`
3. **Website Content**: `POST /api/website-content/upload-image`

### Request Format
- **Content-Type**: `multipart/form-data`
- **Parameter**: `file` (MultipartFile)
- **Headers**: `Authorization: Bearer <token>`

### Response Format
- **Success**: Returns image URL path as plain text (e.g., `/images/blog/uuid.jpg`)
- **Error**: HTTP error status with error message

### Uploaded Image Access
Images are accessible via HTTP at:
- Blog: `http://localhost:8081/images/blog/{filename}`
- Popup: `http://localhost:8081/images/popup/{filename}`
- Content: `http://localhost:8081/images/content/{filename}`

## Files Modified

### 1. admin-dashboard.css
- Added drag-and-drop upload zone styles
- Added image preview styles
- Added error message styles

### 2. admin-dashboard.js
- Added `initDragAndDrop()` function
- Added `handleImageUpload()` function
- Added `showImagePreview()` function
- Added `removeImagePreview()` function
- Added `showUploadError()` function
- Modified blog post form initialization
- Modified popup form initialization
- Modified website content form initialization
- Updated `editBlogPost()` to show existing images
- Updated `editPopup()` to show existing images
- Updated `editHomeContent()` to show existing images

### 3. admin-dashboard.html
- Modified blog post form HTML
- Modified promotional popup form HTML
- Modified website content form HTML

## Error Handling

### Client-Side Validation
- File type validation (must be an image)
- File size validation (max 10MB)
- User-friendly error messages

### Server-Side Validation
- Additional file type validation
- Size limit enforcement
- Security checks

### Error Messages Displayed
- "Please upload an image file (JPG, PNG, GIF, WebP)"
- "File size must be less than 10MB"
- "Upload failed. Please try again."
- Server error messages passed through

## Security Considerations

1. **File Type Validation**: Both client and server validate MIME types
2. **Size Limits**: 10MB limit prevents DoS attacks
3. **Unique Filenames**: UUIDs prevent filename collisions and path traversal
4. **Authentication**: All uploads require valid JWT token
5. **CORS**: Properly configured for allowed origins

## Browser Compatibility

The drag-and-drop functionality is compatible with:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Testing Checklist

- [x] Drag and drop image to blog post form
- [x] Click to browse image for blog post form
- [x] Manual URL input for blog post form
- [x] Remove and re-upload image for blog post
- [x] Edit existing blog post with image
- [x] Drag and drop image to popup form
- [x] Click to browse image for popup form
- [x] Manual URL input for popup form
- [x] Remove and re-upload image for popup
- [x] Edit existing popup with image
- [x] Select IMAGE content type to show upload zone
- [x] Drag and drop image to website content form
- [x] Click to browse image for website content form
- [x] Edit existing website content with image
- [x] File size validation (over 10MB)
- [x] File type validation (non-image files)
- [x] Error message display and auto-hide

## Future Enhancements

Potential improvements for future versions:
1. Multiple image upload support
2. Image cropping/editing before upload
3. Progress bar for large uploads
4. Image compression options
5. Thumbnail generation
6. Drag-and-drop ordering for multiple images
7. Paste from clipboard support
8. Direct camera capture (mobile)

## Support & Troubleshooting

### Common Issues

**Issue**: Upload zone not responding
- **Solution**: Ensure JavaScript is enabled and admin-dashboard.js is loaded

**Issue**: Image not uploading
- **Solution**: Check browser console for errors, verify backend is running, check authentication token

**Issue**: Preview not showing
- **Solution**: Check image URL format, verify image exists on server

**Issue**: Manual URL not working
- **Solution**: Ensure URL is valid and accessible, check for CORS issues

### Debugging

To debug upload issues:
1. Open browser developer console (F12)
2. Check Network tab for failed requests
3. Check Console tab for JavaScript errors
4. Verify backend logs for server-side errors

## Credits

Implementation follows modern web development best practices and uses:
- HTML5 Drag and Drop API
- FormData API for file uploads
- Fetch API for HTTP requests
- FontAwesome icons
- CSS3 animations and transitions
