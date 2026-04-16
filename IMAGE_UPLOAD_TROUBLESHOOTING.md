# Image Upload Troubleshooting Guide

## Problem
Images upload successfully to the backend directory but return 404 Not Found when trying to access them via HTTP.

## Root Cause
The backend needs to be configured to **serve static files** from the `uploads/` directory via HTTP.

## Solution Steps

### 1. Verify Backend Configuration

Check your `FileUploadConfig.java` file should contain:

```java
package com.yasso.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    @Value("${file.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get absolute path to upload directory
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadPathUri = uploadPath.toUri().toString();
        
        // Map /images/** URLs to serve files from uploads/images/ directory
        registry.addResourceHandler("/images/**")
                .addResourceLocations(uploadPathUri + "/images/");
    }
}
```

### 2. Verify application.properties

Your `application.properties` should have:

```properties
# File Upload Configuration
file.upload.dir=uploads

# File size limits
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=100MB
```

### 3. Check Directory Structure

Your backend should have this directory structure:

```
backend-project/
├── uploads/
│   └── images/
│       ├── blog/
│       ├── popup/
│       └── content/
├── src/
└── pom.xml
```

### 4. Verify CORS Configuration

If you have a `WebConfig.java` or CORS configuration, ensure it allows:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")  // Or specify your frontend URL
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}
```

### 5. Testing Steps

#### Step 1: Test Upload Endpoint
```bash
curl -X POST http://localhost:8081/api/blog-posts/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/test-image.jpg"
```

**Expected Response:**
```
/images/blog/abc123-def456.jpg
```

#### Step 2: Test Image Access
```bash
curl -I http://localhost:8081/images/blog/abc123-def456.jpg
```

**Expected Response:**
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 12345
```

**If you get 404:**
- Static file serving is NOT configured correctly
- Check FileUploadConfig.java

#### Step 3: Use Test Page
1. Open `test-image-upload.html` in your browser
2. Click "Test Connection" - should show ✓ CONNECTED
3. Upload an image
4. Check if the preview loads

### 6. Common Issues & Fixes

#### Issue 1: 404 Not Found
**Symptom:** Images upload but return 404 when accessing
**Fix:** Add/fix `FileUploadConfig.java` resource handler configuration

#### Issue 2: 403 Forbidden
**Symptom:** Can upload but get permission denied
**Fix:** Check file permissions on uploads directory

#### Issue 3: CORS Error
**Symptom:** "CORS policy: No 'Access-Control-Allow-Origin' header"
**Fix:** Enable CORS in backend configuration

#### Issue 4: Upload Directory Not Found
**Symptom:** Error creating file or directory not found
**Fix:** 
```bash
mkdir -p uploads/images/blog
mkdir -p uploads/images/popup
mkdir -p uploads/images/content
```

### 7. Verify Upload is Working

After upload, check:

```bash
# Check file exists
ls -la uploads/images/blog/

# Check file is readable
cat uploads/images/blog/YOUR_FILE.jpg

# Test HTTP access
curl http://localhost:8081/images/blog/YOUR_FILE.jpg --output test.jpg
```

### 8. Frontend URL Construction

The frontend constructs URLs like this:

```javascript
// If backend returns: /images/blog/abc123.jpg
// Frontend creates: http://localhost:8081/images/blog/abc123.jpg

function normalizeImageUrl(url) {
  if (url.startsWith('/images/')) {
    return 'http://localhost:8081' + url;
  }
  return url;
}
```

### 9. Quick Diagnostic

Open browser console and check:

```javascript
// Test image URL directly
fetch('http://localhost:8081/images/blog/test.jpg')
  .then(r => console.log('Status:', r.status))
  .catch(e => console.error('Error:', e));
```

**Expected:** Status: 200 (or 404 if file doesn't exist but endpoint works)
**Problem:** Network error or CORS error means backend not serving files

### 10. Backend Logs to Check

When accessing an image, you should see in backend logs:
```
2026-03-10 ... DEBUG ... Mapped to ResourceHttpRequestHandler
```

If you don't see this, the resource handler isn't configured.

## Quick Fix Checklist

- [ ] FileUploadConfig.java exists and has addResourceHandlers()
- [ ] application.properties has file.upload.dir=uploads
- [ ] uploads/images/ directory exists
- [ ] Backend is running on port 8081
- [ ] CORS is enabled for your frontend origin
- [ ] You can access http://localhost:8081/images/blog/filename.jpg in browser
- [ ] Browser console shows no CORS errors
- [ ] Image preview shows correct full URL with debugging

## Still Not Working?

1. Restart your Spring Boot backend completely
2. Clear browser cache (Ctrl+Shift+Delete)
3. Open test-image-upload.html and run all tests
4. Check backend console for any errors
5. Verify the exact URL that's failing in browser Network tab

## Expected Behavior

1. Upload image → Returns `/images/blog/uuid.jpg`
2. Frontend appends backend URL → `http://localhost:8081/images/blog/uuid.jpg`
3. Backend serves file from `uploads/images/blog/uuid.jpg`
4. Image displays correctly

If any step fails, check that specific configuration above.
