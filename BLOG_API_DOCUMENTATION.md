# Blog Posts API Documentation

**Base URL:** `/api`

---

## 🌐 Public Endpoints (No Authentication Required)

### GET /blog-posts
**Description:** Get all blog posts with pagination  
**Authentication:** None  

**Example Request:**
```http
GET /api/blog-posts?page=0&size=10&sort=publishedDate,desc
```

**Query Parameters:**
- `page` - Page number (0-indexed, default: 0)
- `size` - Items per page (default: 20)
- `sort` - Sort field and direction (e.g., `publishedDate,desc`)

**Example Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Welcome to Yasso",
      "slug": "welcome-to-yasso",
      "content": "<h2>Discover Quality and Style</h2><p>Welcome to Yasso...</p>",
      "authorId": 1,
      "authorName": "mohamed awad",
      "featuredImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
      "isPublished": true,
      "publishedDate": "2026-02-14T10:00:00",
      "createdDate": "2026-02-14T09:30:00",
      "updatedDate": "2026-02-14T09:30:00",
      "category": "Announcements",
      "tags": "welcome,launch,shopping,offers"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": { "sorted": true, "unsorted": false }
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "size": 10,
  "number": 0,
  "numberOfElements": 1,
  "empty": false
}
```

---

### GET /blog-posts/{id}
**Description:** Get a single blog post by ID  
**Authentication:** None  

**Example Request:**
```http
GET /api/blog-posts/1
```

**Example Response:**
```json
{
  "id": 1,
  "title": "Welcome to Yasso",
  "slug": "welcome-to-yasso",
  "content": "<h2>Discover Quality and Style</h2><p>Welcome to Yasso...</p>",
  "authorId": 1,
  "authorName": "mohamed awad",
  "featuredImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
  "isPublished": true,
  "publishedDate": "2026-02-14T10:00:00",
  "createdDate": "2026-02-14T09:30:00",
  "updatedDate": "2026-02-14T09:30:00",
  "category": "Announcements",
  "tags": "welcome,launch,shopping,offers"
}
```

---

### GET /blog-posts/slug/{slug}
**Description:** Get a blog post by its URL slug  
**Authentication:** None  

**Example Request:**
```http
GET /api/blog-posts/slug/welcome-to-yasso
```

**Example Response:** Same as GET by ID

---

### GET /blog-posts/published
**Description:** Get only published blog posts  
**Authentication:** None  

**Example Request:**
```http
GET /api/blog-posts/published?page=0&size=10
```

**Example Response:** Paginated list of published posts

---

### GET /blog-posts/recent
**Description:** Get recent published posts  
**Authentication:** None  

**Example Request:**
```http
GET /api/blog-posts/recent?limit=5
```

**Query Parameters:**
- `limit` - Number of posts to return (default: 5)

**Example Response:**
```json
[
  {
    "id": 1,
    "title": "Welcome to Yasso",
    "slug": "welcome-to-yasso",
    "content": "<p>...</p>",
    "authorId": 1,
    "authorName": "mohamed awad",
    "featuredImage": "https://...",
    "isPublished": true,
    "publishedDate": "2026-02-14T10:00:00",
    "category": "Announcements",
    "tags": "welcome,launch"
  }
]
```

---

### GET /blog-posts/category/{category}
**Description:** Get posts by category  
**Authentication:** None  

**Example Request:**
```http
GET /api/blog-posts/category/Announcements?page=0&size=10
```

---

### GET /blog-posts/search
**Description:** Search blog posts by keyword  
**Authentication:** None  

**Example Request:**
```http
GET /api/blog-posts/search?keyword=welcome&page=0&size=10
```

**Query Parameters:**
- `keyword` - Search term
- `page` - Page number
- `size` - Items per page

---

## 🔐 Admin Endpoints (Authentication Required)

**All admin endpoints require a valid JWT token in the Authorization header:**
```http
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

### How to Get a Token

**Login Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "awad",
  "password": "awad1234"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "refreshToken": "eyJhbGciOiJIUzM4NCJ9...",
  "type": "Bearer",
  "username": "awad",
  "email": "awad@gmail.com"
}
```

Use the `token` value in the Authorization header for all admin requests.

---

### POST /blog-posts
**Description:** Create a new blog post  
**Authentication:** Required (Admin only)  

**Example Request:**
```http
POST /api/blog-posts
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
Content-Type: application/json

{
  "title": "New Product Launch",
  "slug": "new-product-launch",
  "content": "<h2>Exciting News!</h2><p>We're launching new products...</p>",
  "excerpt": "Check out our latest product collection",
  "featuredImage": "https://images.unsplash.com/photo-12345?w=800",
  "category": "Products",
  "tags": "products,launch,new",
  "authorId": 1,
  "isPublished": true,
  "publishedDate": "2026-02-14T10:00:00"
}
```

**Field Descriptions:**
- `title` (string, required) - Blog post title
- `slug` (string, required, unique) - URL-friendly identifier
- `content` (string, required) - Full HTML content
- `excerpt` (string, optional) - Short summary
- `featuredImage` (string, optional) - Image URL
- `category` (string, optional) - Category name
- `tags` (string, optional) - Comma-separated tags (e.g., "tag1,tag2,tag3")
- `authorId` (number, required) - ID of the author user
- `isPublished` (boolean, required) - Publish immediately or save as draft
- `publishedDate` (ISO datetime, optional) - Publication date/time

**Example Response:**
```json
{
  "id": 2,
  "title": "New Product Launch",
  "slug": "new-product-launch",
  "content": "<h2>Exciting News!</h2><p>We're launching new products...</p>",
  "authorId": 1,
  "authorName": "mohamed awad",
  "featuredImage": "https://images.unsplash.com/photo-12345?w=800",
  "isPublished": true,
  "publishedDate": "2026-02-14T10:00:00",
  "createdDate": "2026-02-14T09:45:00",
  "updatedDate": "2026-02-14T09:45:00",
  "category": "Products",
  "tags": "products,launch,new"
}
```

---

### PUT /blog-posts/{id}
**Description:** Update an existing blog post  
**Authentication:** Required (Admin only)  

**Example Request:**
```http
PUT /api/blog-posts/1
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
Content-Type: application/json

{
  "title": "Welcome to Yasso - Updated",
  "slug": "welcome-to-yasso",
  "content": "<h2>Updated Content</h2><p>New content here...</p>",
  "excerpt": "Updated excerpt",
  "featuredImage": "https://images.unsplash.com/photo-updated?w=800",
  "category": "Announcements",
  "tags": "welcome,updated",
  "authorId": 1,
  "isPublished": true,
  "publishedDate": "2026-02-14T10:00:00"
}
```

**Example Response:** Updated blog post object

---

### PATCH /blog-posts/{id}/publish
**Description:** Publish a draft blog post  
**Authentication:** Required (Admin only)  

**Example Request:**
```http
PATCH /api/blog-posts/1/publish
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Response:** Updated blog post with `isPublished: true`

---

### PATCH /blog-posts/{id}/unpublish
**Description:** Unpublish a blog post (convert to draft)  
**Authentication:** Required (Admin only)  

**Example Request:**
```http
PATCH /api/blog-posts/1/unpublish
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Response:** Updated blog post with `isPublished: false`

---

### DELETE /blog-posts/{id}
**Description:** Delete a blog post  
**Authentication:** Required (Admin only)  

**Example Request:**
```http
DELETE /api/blog-posts/1
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Response:**
```http
204 No Content
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: Title is required",
  "timestamp": "2026-02-14T10:00:00"
}
```

### 401 Unauthorized
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required to access this resource",
  "timestamp": "2026-02-14T10:00:00"
}
```

### 404 Not Found
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Blog post not found with id: 999",
  "timestamp": "2026-02-14T10:00:00"
}
```

### 500 Internal Server Error
```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "2026-02-14T10:00:00"
}
```

---

## JavaScript/Fetch Examples

### Get Published Posts (Public)
```javascript
async function getPublishedPosts(page = 0, size = 10) {
  const response = await fetch(
    `/api/blog-posts/published?page=${page}&size=${size}`
  );
  const data = await response.json();
  return data;
}
```

### Get Single Post by Slug (Public)
```javascript
async function getPostBySlug(slug) {
  const response = await fetch(
    `/api/blog-posts/slug/${slug}`
  );
  const data = await response.json();
  return data;
}
```

### Create Blog Post (Admin)
```javascript
async function createBlogPost(token, postData) {
  const response = await fetch('/api/blog-posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

// Usage
const newPost = {
  title: "My Blog Post",
  slug: "my-blog-post",
  content: "<p>Content here...</p>",
  category: "News",
  tags: "news,update",
  authorId: 1,
  isPublished: true
};

createBlogPost(yourAdminToken, newPost)
  .then(post => console.log('Created:', post))
  .catch(error => console.error('Error:', error));
```

### Update Blog Post (Admin)
```javascript
async function updateBlogPost(token, postId, postData) {
  const response = await fetch(`/api/blog-posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}
```

### Delete Blog Post (Admin)
```javascript
async function deleteBlogPost(token, postId) {
  const response = await fetch(`/api/blog-posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
```

---

## Notes for Frontend Implementation

1. **CORS:** The backend is configured to accept requests from `http://localhost:3000` and `http://127.0.0.1:3000`

2. **Tags Format:** Tags are stored as comma-separated strings (e.g., "tag1,tag2,tag3"), not arrays

3. **Date Format:** All dates use ISO 8601 format (e.g., "2026-02-14T10:00:00")

4. **Token Expiration:** Access tokens expire after 24 hours. Use the refresh token endpoint to get a new token

5. **Pagination:** All list endpoints support pagination. Default page size is 20

6. **Authorization Header:** For admin operations, always include: `Authorization: Bearer YOUR_TOKEN`

7. **Content Type:** Always set `Content-Type: application/json` when sending POST/PUT requests

8. **Error Handling:** Always check response status codes and handle errors appropriately

---

## Complete Admin Workflow Example

```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    usernameOrEmail: 'awad',
    password: 'awad1234'
  })
});
const { token } = await loginResponse.json();

// 2. Create a blog post
const createResponse = await fetch('/api/blog-posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Spring Sale!",
    slug: "spring-sale-2026",
    content: "<h2>Big Discounts!</h2><p>Save up to 50% off...</p>",
    category: "Promotions",
    tags: "sale,discount,spring",
    authorId: 1,
    isPublished: true,
    publishedDate: new Date().toISOString()
  })
});
const newPost = await createResponse.json();
console.log('Created post:', newPost);

// 3. Update the post
const updateResponse = await fetch(`/api/blog-posts/${newPost.id}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ...newPost,
    title: "Spring Sale - Extended!",
    content: "<h2>Sale Extended!</h2><p>Due to popular demand...</p>"
  })
});
const updatedPost = await updateResponse.json();
console.log('Updated post:', updatedPost);

// 4. Unpublish the post
await fetch(`/api/blog-posts/${newPost.id}/unpublish`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` }
});

// 5. Delete the post
await fetch(`/api/blog-posts/${newPost.id}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```
