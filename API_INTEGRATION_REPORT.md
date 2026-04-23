# MS Boutique Backend API Integration Report

Last updated: 2026-04-23
Backend app: Spring Boot (port `8081`)
Base URL: `http://localhost:8081`

## 1) Quick Start For Frontend

- Use `Authorization: Bearer <token>` for protected endpoints.
- Obtain token from `POST /api/auth/login`.
- Refresh token via `POST /api/auth/refresh`.
- Public static image URLs are served under `/images/**`.
- Paginated endpoints use Spring pageable params: `page`, `size`, `sort`.

Example:

```http
GET /api/products?page=0&size=12&sort=createdDate,desc
```

## 2) Authentication Flow

### Login

`POST /api/auth/login`

Request (`LoginRequestDTO`):

```json
{
  "usernameOrEmail": "admin",
  "password": "your_password"
}
```

Response (`LoginResponseDTO`):

```json
{
  "token": "<jwt_access_token>",
  "refreshToken": "<jwt_refresh_token>",
  "type": "Bearer",
  "username": "admin",
  "email": "admin@example.com"
}
```

### Refresh

`POST /api/auth/refresh`

Request (`RefreshTokenRequestDTO`):

```json
{
  "refreshToken": "<jwt_refresh_token>"
}
```

Response:

```json
{
  "token": "<new_access_token>",
  "refreshToken": "<new_refresh_token>",
  "type": "Bearer"
}
```

### Token Validation

`GET /api/auth/validate`

Header required:

```http
Authorization: Bearer <token>
```

## 3) Access Rules (As Implemented)

From current security configuration:

Public endpoints:
- `/images/**`
- `/api/website-content/**`
- `/api/public/**`
- `/api/auth/**`
- `GET /api/blog-posts/**`
- `GET /api/products/**`
- `GET /api/product-categories/**`
- `GET /api/product-reviews/**`
- `GET /api/policies/**`
- `GET /api/promotional-popups/**`
- `/api/contact-messages/**` (all methods)
- `/api/newsletters/**` (all methods)
- `/api/orders/**` (all methods)
- `POST /api/product-reviews/**`

Protected endpoints:
- `/api/admin/**`
- `/api/products/**` (non-GET effectively)
- `/api/blog-posts/**` (non-GET effectively)
- `/api/product-categories/**` (non-GET effectively)
- `/api/product-images/**`
- `/api/promotional-popups/**` (non-GET effectively)
- `/api/policies/**` (non-GET effectively)
- `/api/users/**`
- `/api/settings/**`
- everything else by default

Important mismatch to fix:
- Controller path is `/api/newsletter` (singular)
- Security permits `/api/newsletters/**` (plural)
- Result: newsletter endpoints may require auth unexpectedly.

## 4) Common Response Shapes

### Pageable response

Many list endpoints return Spring `Page<T>`:

```json
{
  "content": [ ... ],
  "pageable": { ... },
  "totalPages": 0,
  "totalElements": 0,
  "last": true,
  "size": 20,
  "number": 0,
  "sort": { ... },
  "first": true,
  "numberOfElements": 0,
  "empty": true
}
```

### Validation error (400)

```json
{
  "timestamp": "2026-04-23T12:00:00",
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "fieldName": "validation message"
  },
  "path": "/api/..."
}
```

### Generic API error

```json
{
  "timestamp": "2026-04-23T12:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "...",
  "path": "/api/..."
}
```

### Unauthorized from JWT entry point

```json
{
  "timestamp": "2026-04-23T12:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required to access this resource",
  "path": "/api/..."
}
```

## 5) Endpoint Catalog

## Auth (`/api/auth`)

- `POST /register` -> body `UserRequestDTO`
- `POST /login` -> body `LoginRequestDTO`, returns `LoginResponseDTO`
- `POST /refresh` -> body `RefreshTokenRequestDTO`
- `POST /logout`
- `GET /validate`

## Blog Posts (`/api/blog-posts`)

- `GET /{id}`
- `GET /slug/{slug}`
- `GET /`
- `GET /published`
- `GET /drafts`
- `GET /author/{authorId}`
- `GET /category/{category}`
- `GET /tag/{tag}`
- `GET /search?keyword=`
- `GET /recent?limit=`
- `GET /featured?limit=`
- `POST /` -> `BlogPostRequestDTO`
- `PUT /{id}` -> `BlogPostRequestDTO`
- `PATCH /{id}/publish`
- `PATCH /{id}/unpublish`
- `POST /upload-image` (multipart field name: `file`) -> returns image URL string
- `DELETE /{id}`
- `GET /count/published`
- `GET /count/category/{category}`

## Contact Messages (`/api/contact-messages`)

- `GET /{id}`
- `GET /`
- `GET /unread`
- `GET /read`
- `GET /recent`
- `GET /email/{email}`
- `GET /search?keyword=`
- `GET /date-range?startDate=<ISO>&endDate=<ISO>`
- `GET /with-response`
- `POST /` -> `ContactMessageRequestDTO`
- `PATCH /{id}/mark-read`
- `PATCH /{id}/mark-unread`
- `PATCH /{id}/response` -> body `{ "response": "..." }`
- `DELETE /{id}`
- `GET /count/unread`

## Newsletter (`/api/newsletter`)

- `GET /{id}`
- `GET /email/{email}`
- `GET /`
- `GET /active`
- `GET /inactive`
- `GET /date-range?startDate=<ISO>&endDate=<ISO>`
- `POST /` -> `NewsletterRequestDTO`
- `PATCH /unsubscribe/{email}`
- `PATCH /{id}/reactivate`
- `DELETE /{id}`
- `GET /count/active`
- `GET /count/total`

## Orders (`/api/orders`)

- `GET /{id}`
- `GET /`
- `GET /status/{status}` where status in `PENDING|PROCESSING|SHIPPED|DELIVERED|CANCELLED`
- `GET /customer/{customerName}`
- `GET /customer/email/{email}`
- `GET /date-range?startDate=<ISO>&endDate=<ISO>`
- `GET /recent?limit=10`
- `POST /` -> `OrderRequestDTO`
- `PUT /{id}` -> `OrderRequestDTO`
- `PATCH /{id}/status?status=`
- `PATCH /{id}/cancel`
- `DELETE /{id}`
- `GET /count/status/{status}`
- `GET /revenue/status/{status}`
- `GET /revenue/total`

## Order Items (`/api/order-items`)

- `GET /{id}`
- `GET /order/{orderId}`
- `GET /product/{productId}`
- `POST /order/{orderId}` -> `OrderItemRequestDTO`
- `PUT /{id}` -> `OrderItemRequestDTO`
- `DELETE /{id}`
- `GET /order/{orderId}/count`
- `GET /order/{orderId}/total`

## Policies (`/api/policies`)

- `GET /{id}`
- `GET /type/{type}` where type in `PRIVACY|TERMS|RETURN|SHIPPING`
- `GET /type/{type}/active`
- `GET /`
- `GET /active`
- `GET /all-active`
- `POST /` -> `PolicyRequestDTO`
- `PUT /{id}` -> `PolicyRequestDTO`
- `PATCH /{id}/status`
- `DELETE /{id}`
- `GET /count/active`

## Product Categories (`/api/product-categories`)

- `GET /{id}`
- `GET /name/{name}`
- `GET /`
- `GET /active`
- `GET /all-active`
- `GET /top-level`
- `GET /{parentId}/subcategories`
- `GET /with-products`
- `GET /search?name=`
- `POST /` -> `ProductCategoryRequestDTO`
- `PUT /{id}` -> `ProductCategoryRequestDTO`
- `PATCH /{id}/status`
- `DELETE /{id}`
- `GET /count/active`
- `GET /count/top-level`

## Products (`/api/products`)

- `GET /{id}`
- `GET /`
- `GET /active`
- `GET /category/{categoryId}`
- `GET /search?keyword=`
- `GET /price-range?minPrice=&maxPrice=`
- `GET /filter?colors=RED&colors=BLUE&minPrice=&maxPrice=`
- `GET /low-stock?threshold=`
- `GET /top-rated`
- `GET /featured`
- `POST /` -> `ProductRequestDTO`
- `PUT /{id}` -> `ProductRequestDTO`
- `PATCH /{id}/status`
- `PATCH /{id}/stock?quantity=`
- `PUT /{id}/category?categoryId=`
- `DELETE /{id}`
- `GET /count/category/{categoryId}`
- `GET /count/active`

## Product Images (`/api/product-images`)

- `GET /{id}`
- `GET /product/{productId}`
- `GET /`
- `GET /product/{productId}/primary`
- `POST /` -> `ProductImageRequestDTO`
- `PUT /{id}` -> `ProductImageRequestDTO`
- `PATCH /{id}/set-primary`
- `PATCH /{id}/display-order?order=`
- `DELETE /{id}`
- `DELETE /product/{productId}`
- `GET /count/product/{productId}`

## Product Reviews (`/api/product-reviews`)

- `GET /{id}`
- `GET /`
- `GET /product/{productId}`
- `GET /product/{productId}/approved`
- `GET /product/{productId}/visible`
- `GET /pending`
- `GET /rating/{rating}?productId=`
- `GET /customer/name/{customerName}`
- `GET /customer/email/{email}`
- `POST /` -> `ProductReviewRequestDTO`
- `PUT /{id}` -> `ProductReviewRequestDTO`
- `PATCH /{id}/approve`
- `PATCH /{id}/reject`
- `PATCH /{id}/visibility`
- `DELETE /{id}`
- `GET /product/{productId}/average-rating`
- `GET /count/product/{productId}`
- `GET /count/pending`

## Promotional Popups (`/api/promotional-popups`)

- `GET /{id}`
- `GET /`
- `GET /active`
- `GET /type/{type}` where type in `ENTRY|NEWSLETTER|PROMOTIONAL`
- `GET /current`
- `GET /current/type/{type}`
- `GET /expired`
- `GET /scheduled`
- `POST /` -> `PromotionalPopupRequestDTO`
- `PUT /{id}` -> `PromotionalPopupRequestDTO`
- `PATCH /{id}/status`
- `POST /upload-image` (multipart field: `file`) -> returns image URL string
- `DELETE /{id}`
- `GET /count/type/{type}/active`

## Settings (`/api/settings`)

- `GET /{id}`
- `GET /key/{key}`
- `GET /`
- `GET /search?keyword=`
- `GET /prefix/{prefix}`
- `POST /` -> `SettingsRequestDTO`
- `PUT /{id}` -> `SettingsRequestDTO`
- `PATCH /key/{key}` -> body `{ "value": "..." }`
- `DELETE /{id}`

## Users (`/api/users`)

- `GET /{id}`
- `GET /username/{username}`
- `GET /email/{email}`
- `GET /`
- `GET /active`
- `GET /search?keyword=`
- `GET /inactive?days=30`
- `POST /` -> `UserRequestDTO`
- `PUT /{id}` -> `UserRequestDTO`
- `PATCH /{id}/password` -> body `{ "oldPassword": "...", "newPassword": "..." }`
- `PATCH /{id}/status`
- `PATCH /{id}/last-login`
- `DELETE /{id}`
- `GET /count/active`

## Website Content (`/api/website-content`)

- `GET /{id}`
- `GET /key/{key}`
- `GET /section/{section}`
- `GET /`
- `GET /active`
- `GET /section/{section}/all`
- `GET /type/{type}` where type in `TEXT|IMAGE|HTML|VIDEO|URL`
- `GET /search?keyword=`
- `POST /` -> `WebsiteContentRequestDTO`
- `PUT /{id}` -> `WebsiteContentRequestDTO`
- `PUT /key/{key}` -> `WebsiteContentRequestDTO`
- `PATCH /{id}/status`
- `POST /upload-image` (multipart field: `file`) -> returns image URL string
- `DELETE /{id}`
- `GET /count/section/{section}`
- `GET /count/type/{type}`

## 6) DTO Contract Reference

Main DTO source files:

- `src/main/java/com/msboutique/msboutique/dto/LoginRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/LoginResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/RefreshTokenRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/UserRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/UserResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/ProductRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/ProductResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/ProductCategoryRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/ProductCategoryResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/ProductImageRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/ProductImageResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/ProductReviewRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/ProductReviewResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/OrderRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/OrderResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/OrderItemRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/OrderItemResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/BlogPostRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/BlogPostResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/WebsiteContentRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/WebsiteContentResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/PolicyRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/PolicyResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/NewsletterRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/NewsletterResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/PromotionalPopupRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/PromotionalPopupResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/ContactMessageRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/ContactMessageResponseDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/SettingsRequestDTO.java`
- `src/main/java/com/msboutique/msboutique/dto/SettingsResponseDTO.java`

## 7) Frontend Integration Recommendations

- Centralize API client with automatic Bearer token injection.
- Add a 401 interceptor to trigger token refresh flow.
- Normalize pageable responses to a frontend-friendly shape.
- Use ISO datetime strings for all `date-range` queries.
- For upload endpoints, send `multipart/form-data` with key `file`.
- Handle both error payload styles:
  - `ErrorResponse` shape
  - validation shape with `errors` map

## 8) Source Of Truth (Backend Files)

- Controllers: `src/main/java/com/msboutique/msboutique/controller/`
- Security: `src/main/java/com/msboutique/msboutique/security/SecurityConfig.java`
- JWT entrypoint: `src/main/java/com/msboutique/msboutique/security/JwtAuthenticationEntryPoint.java`
- Exception handling: `src/main/java/com/msboutique/msboutique/exception/GlobalExceptionHandler.java`
- App config: `src/main/resources/application.properties`

## 9) Full API Documentation For Frontend Integration

This section provides full endpoint documentation for:
- Blog
- Product
- Website Content
- Orders
- Promotional Popup
- Color Variants
- Product Reviews
- Newsletter

### 9.1 Blog APIs (`/api/blog-posts`)

#### DTO: BlogPostRequestDTO

Required fields:
- `title` (string, max 255)
- `content` (string)
- `authorId` (number)

Optional fields:
- `titleAr` (string, max 255)
- `slug` (string, max 255, auto-generated if omitted)
- `contentAr` (string)
- `excerpt` (string, max 1000)
- `excerptAr` (string, max 1000)
- `featuredImage` (string URL/path, max 500)
- `isPublished` (boolean, default false)
- `isFeatured` (boolean, default false)
- `featuredOrder` (number)
- `category` (string, max 100)
- `categoryAr` (string, max 100)
- `tags` (string, max 500)

Create/Update payload example:

```json
{
  "title": "Summer Collection Launch",
  "titleAr": "إطلاق مجموعة الصيف",
  "slug": "summer-collection-launch",
  "content": "Long-form content for blog post...",
  "contentAr": "المحتوى العربي...",
  "excerpt": "Short summary",
  "excerptAr": "ملخص قصير",
  "authorId": 1,
  "featuredImage": "/images/blog/abc123.jpg",
  "isPublished": false,
  "isFeatured": true,
  "featuredOrder": 1,
  "category": "Trends",
  "categoryAr": "الموضة",
  "tags": "summer,collection,fashion"
}
```

#### Endpoints

1. `GET /api/blog-posts/{id}`
- Path params: `id` (Long)
- Request body: none
- Response: `BlogPostResponseDTO`

2. `GET /api/blog-posts/slug/{slug}`
- Path params: `slug` (String)
- Response: `BlogPostResponseDTO`

3. `GET /api/blog-posts`
- Query: `page`, `size`, `sort`
- Response: `Page<BlogPostResponseDTO>`

4. `GET /api/blog-posts/published`
- Query: `page`, `size`, `sort`
- Response: `Page<BlogPostResponseDTO>`

5. `GET /api/blog-posts/drafts`
- Query: `page`, `size`, `sort`
- Response: `Page<BlogPostResponseDTO>`

6. `GET /api/blog-posts/author/{authorId}`
- Path params: `authorId` (Long)
- Query: `page`, `size`, `sort`
- Response: `Page<BlogPostResponseDTO>`

7. `GET /api/blog-posts/category/{category}`
- Path params: `category` (String)
- Query: `page`, `size`, `sort`

8. `GET /api/blog-posts/tag/{tag}`
- Path params: `tag` (String)
- Query: `page`, `size`, `sort`

9. `GET /api/blog-posts/search?keyword=...`
- Query params: `keyword`, `page`, `size`, `sort`

10. `GET /api/blog-posts/recent?limit=5`
- Query params: `limit` (default 5)
- Response: `List<BlogPostResponseDTO>`

11. `GET /api/blog-posts/featured?limit=3`
- Query params: `limit` (default 3)
- Response: `List<BlogPostResponseDTO>`

12. `POST /api/blog-posts`
- Body: `BlogPostRequestDTO`
- Response: `201 Created` + `BlogPostResponseDTO`

13. `PUT /api/blog-posts/{id}`
- Path params: `id`
- Body: `BlogPostRequestDTO`
- Response: `BlogPostResponseDTO`

14. `PATCH /api/blog-posts/{id}/publish`
- Response: `BlogPostResponseDTO`

15. `PATCH /api/blog-posts/{id}/unpublish`
- Response: `BlogPostResponseDTO`

16. `POST /api/blog-posts/upload-image`
- Content-Type: `multipart/form-data`
- Form field: `file`
- Response: image URL/path string

17. `DELETE /api/blog-posts/{id}`
- Response: `204 No Content`

18. `GET /api/blog-posts/count/published`
- Response: Long

19. `GET /api/blog-posts/count/category/{category}`
- Response: Long

### 9.2 Product APIs (`/api/products`)

#### DTO: ColorVariantRequestDTO

Required fields:
- `color` (string, max 50)
- `stockQuantity` (integer >= 0)

Optional fields:
- `colorCode` (string, max 100, e.g. `#000000`)

Example:

```json
{
  "color": "Black",
  "stockQuantity": 25,
  "colorCode": "#000000"
}
```

#### DTO: ProductRequestDTO

Required fields:
- `name` (string, max 255)
- `price` (decimal > 0)
- `colorVariants` (array, min 1)

Optional fields:
- `nameAr` (string, max 255)
- `description` (string, max 5000)
- `descriptionAr` (string, max 5000)
- `categoryId` (Long)
- `sku` (string, max 100)
- `isActive` (boolean, default true)
- `isFeatured` (boolean, default false)
- `featuredOrder` (integer >= 0)

Deprecated but still present:
- `color`
- `stockQuantity`

Create/Update payload example:

```json
{
  "name": "Linen Shirt",
  "nameAr": "قميص كتان",
  "description": "Premium breathable linen shirt",
  "descriptionAr": "قميص كتان عالي الجودة",
  "price": 49.99,
  "categoryId": 3,
  "sku": "LINEN-SHIRT-001",
  "isActive": true,
  "isFeatured": true,
  "featuredOrder": 2,
  "colorVariants": [
    {
      "color": "White",
      "stockQuantity": 30,
      "colorCode": "#FFFFFF"
    },
    {
      "color": "Black",
      "stockQuantity": 22,
      "colorCode": "#000000"
    }
  ]
}
```

#### Endpoints

1. `GET /api/products/{id}` -> `ProductResponseDTO`
2. `GET /api/products` -> `Page<ProductResponseDTO>`
3. `GET /api/products/active` -> `Page<ProductResponseDTO>`
4. `GET /api/products/category/{categoryId}` -> `Page<ProductResponseDTO>`
5. `GET /api/products/search?keyword=...` -> `Page<ProductResponseDTO>`
6. `GET /api/products/price-range?minPrice=&maxPrice=` -> `Page<ProductResponseDTO>`
7. `GET /api/products/filter?colors=Red&colors=Blue&minPrice=&maxPrice=` -> `Page<ProductResponseDTO>`
8. `GET /api/products/low-stock?threshold=` -> `List<ProductResponseDTO>`
9. `GET /api/products/top-rated` -> `Page<ProductResponseDTO>`
10. `GET /api/products/featured` -> `List<ProductResponseDTO>`
11. `POST /api/products` -> body `ProductRequestDTO`, response `201` + `ProductResponseDTO`
12. `PUT /api/products/{id}` -> body `ProductRequestDTO`, response `ProductResponseDTO`
13. `PATCH /api/products/{id}/status` -> `ProductResponseDTO`
14. `PATCH /api/products/{id}/stock?quantity=` -> `ProductResponseDTO`
15. `PUT /api/products/{id}/category?categoryId=` -> `ProductResponseDTO`
16. `DELETE /api/products/{id}` -> `204 No Content`
17. `GET /api/products/count/category/{categoryId}` -> Long
18. `GET /api/products/count/active` -> Long

### 9.3 Product Reviews APIs (`/api/product-reviews`)

#### DTO: ProductReviewRequestDTO

Required fields:
- `productId` (Long)
- `customerName` (string, max 100)
- `customerEmail` (valid email, max 100)
- `rating` (integer 1..5)

Optional fields:
- `reviewText` (string, max 2000)
- `isVisible` (boolean, default true)

Create/Update payload example:

```json
{
  "productId": 15,
  "customerName": "Sara Ali",
  "customerEmail": "sara@example.com",
  "rating": 5,
  "reviewText": "Great quality and fast delivery.",
  "isVisible": true
}
```

#### Endpoints

1. `GET /api/product-reviews/{id}`
2. `GET /api/product-reviews`
3. `GET /api/product-reviews/product/{productId}`
4. `GET /api/product-reviews/product/{productId}/approved`
5. `GET /api/product-reviews/product/{productId}/visible`
6. `GET /api/product-reviews/pending`
7. `GET /api/product-reviews/rating/{rating}?productId=`
8. `GET /api/product-reviews/customer/name/{customerName}`
9. `GET /api/product-reviews/customer/email/{email}`
10. `POST /api/product-reviews` -> body `ProductReviewRequestDTO`, response `201` + `ProductReviewResponseDTO`
11. `PUT /api/product-reviews/{id}` -> body `ProductReviewRequestDTO`, response `ProductReviewResponseDTO`
12. `PATCH /api/product-reviews/{id}/approve`
13. `PATCH /api/product-reviews/{id}/reject`
14. `PATCH /api/product-reviews/{id}/visibility`
15. `DELETE /api/product-reviews/{id}`
16. `GET /api/product-reviews/product/{productId}/average-rating`
17. `GET /api/product-reviews/count/product/{productId}`
18. `GET /api/product-reviews/count/pending`

### 9.4 Website Content APIs (`/api/website-content`)

#### DTO: WebsiteContentRequestDTO

Required fields:
- `pageName` (string, max 50)
- `sectionName` (string, max 100)
- `contentType` (string enum: `TEXT|IMAGE|HTML|VIDEO|URL`)
- `contentValue` (string)

Optional fields:
- `contentValueAr` (string)
- `displayOrder` (integer >= 0)
- `isActive` (boolean, default true)

Create/Update payload example:

```json
{
  "pageName": "Home",
  "sectionName": "hero",
  "contentType": "TEXT",
  "contentValue": "Discover your style",
  "contentValueAr": "اكتشف أسلوبك",
  "displayOrder": 1,
  "isActive": true
}
```

#### Endpoints

1. `GET /api/website-content/{id}`
2. `GET /api/website-content/key/{key}`
3. `GET /api/website-content/section/{section}`
4. `GET /api/website-content`
5. `GET /api/website-content/active`
6. `GET /api/website-content/section/{section}/all`
7. `GET /api/website-content/type/{type}`
8. `GET /api/website-content/search?keyword=`
9. `POST /api/website-content` -> body `WebsiteContentRequestDTO`, response `201` + `WebsiteContentResponseDTO`
10. `PUT /api/website-content/{id}` -> body `WebsiteContentRequestDTO`
11. `PUT /api/website-content/key/{key}` -> body `WebsiteContentRequestDTO`
12. `PATCH /api/website-content/{id}/status`
13. `POST /api/website-content/upload-image` (multipart field `file`) -> string URL/path
14. `DELETE /api/website-content/{id}`
15. `GET /api/website-content/count/section/{section}`
16. `GET /api/website-content/count/type/{type}`

### 9.5 Orders APIs (`/api/orders`)

#### DTO: OrderItemRequestDTO

Required fields:
- `productId` (Long)
- `quantity` (integer >= 1)
- `price` (decimal > 0)

Optional fields:
- `selectedColor` (string, max 50)

#### DTO: OrderRequestDTO

Required fields:
- `customerName` (string, max 100)
- `customerEmail` (email, max 100)
- `customerPhone` (string, max 20)
- `city` (string, max 100)
- `streetName` (string, max 200)
- `buildingNumber` (string, max 20)
- `orderItems` (array, min 1)

Optional fields:
- `floor` (string, max 20)
- `apartmentNumber` (string, max 20)
- `notes` (string, max 1000)
- `whatsappNumber` (string, max 20)

Create/Update payload example:

```json
{
  "customerName": "Mohamed Hassan",
  "customerEmail": "mohamed@example.com",
  "customerPhone": "+201001234567",
  "city": "Cairo",
  "streetName": "Tahrir St",
  "buildingNumber": "12",
  "floor": "4",
  "apartmentNumber": "16",
  "notes": "Call before delivery",
  "whatsappNumber": "+201001234567",
  "orderItems": [
    {
      "productId": 15,
      "quantity": 2,
      "price": 49.99,
      "selectedColor": "Black"
    },
    {
      "productId": 20,
      "quantity": 1,
      "price": 29.5,
      "selectedColor": "White"
    }
  ]
}
```

#### Endpoints

1. `GET /api/orders/{id}`
2. `GET /api/orders`
3. `GET /api/orders/status/{status}` where status is `PENDING|PROCESSING|SHIPPED|DELIVERED|CANCELLED`
4. `GET /api/orders/customer/{customerName}`
5. `GET /api/orders/customer/email/{email}`
6. `GET /api/orders/date-range?startDate=<ISO-8601>&endDate=<ISO-8601>`
7. `GET /api/orders/recent?limit=10`
8. `POST /api/orders` -> body `OrderRequestDTO`, response `201` + `OrderResponseDTO`
9. `PUT /api/orders/{id}` -> body `OrderRequestDTO`, response `OrderResponseDTO`
10. `PATCH /api/orders/{id}/status?status=`
11. `PATCH /api/orders/{id}/cancel`
12. `DELETE /api/orders/{id}`
13. `GET /api/orders/count/status/{status}`
14. `GET /api/orders/revenue/status/{status}`
15. `GET /api/orders/revenue/total`

### 9.6 Promotional Popup APIs (`/api/promotional-popups`)

#### DTO: PromotionalPopupRequestDTO

Required fields:
- `title` (string, max 255)
- `type` (string enum: `ENTRY|NEWSLETTER|PROMOTIONAL`)

Optional fields:
- `titleAr` (string, max 255)
- `message` (string, max 2000)
- `messageAr` (string, max 2000)
- `image` (string URL/path, max 500)
- `ctaButtonText` (string, max 100)
- `ctaButtonTextAr` (string, max 100)
- `ctaLink` (string, max 500)
- `isActive` (boolean, default true)
- `startDate` (ISO datetime)
- `endDate` (ISO datetime)

Create/Update payload example:

```json
{
  "title": "Get 20% Off",
  "titleAr": "خصم 20%",
  "message": "Limited time offer for new arrivals.",
  "messageAr": "عرض لفترة محدودة على المنتجات الجديدة.",
  "image": "/images/popup/offer.jpg",
  "ctaButtonText": "Shop Now",
  "ctaButtonTextAr": "تسوق الآن",
  "ctaLink": "/shop",
  "type": "PROMOTIONAL",
  "isActive": true,
  "startDate": "2026-05-01T00:00:00",
  "endDate": "2026-05-31T23:59:59"
}
```

#### Endpoints

1. `GET /api/promotional-popups/{id}`
2. `GET /api/promotional-popups`
3. `GET /api/promotional-popups/active`
4. `GET /api/promotional-popups/type/{type}`
5. `GET /api/promotional-popups/current`
6. `GET /api/promotional-popups/current/type/{type}`
7. `GET /api/promotional-popups/expired`
8. `GET /api/promotional-popups/scheduled`
9. `POST /api/promotional-popups` -> body `PromotionalPopupRequestDTO`, response `201` + `PromotionalPopupResponseDTO`
10. `PUT /api/promotional-popups/{id}` -> body `PromotionalPopupRequestDTO`
11. `PATCH /api/promotional-popups/{id}/status`
12. `POST /api/promotional-popups/upload-image` (multipart field `file`) -> string URL/path
13. `DELETE /api/promotional-popups/{id}`
14. `GET /api/promotional-popups/count/type/{type}/active`

### 9.7 Newsletter APIs (`/api/newsletter`)

#### DTO: NewsletterRequestDTO

Required fields:
- `email` (valid email, max 100)
- `source` (string, expected values: `ENTRY_POPUP|CORNER_POPUP|FOOTER|OTHER`)

Create payload example:

```json
{
  "email": "customer@example.com",
  "source": "FOOTER"
}
```

#### Endpoints

1. `GET /api/newsletter/{id}`
2. `GET /api/newsletter/email/{email}`
3. `GET /api/newsletter`
4. `GET /api/newsletter/active`
5. `GET /api/newsletter/inactive`
6. `GET /api/newsletter/date-range?startDate=<ISO-8601>&endDate=<ISO-8601>`
7. `POST /api/newsletter` -> body `NewsletterRequestDTO`, response `201` + `NewsletterResponseDTO`
8. `PATCH /api/newsletter/unsubscribe/{email}`
9. `PATCH /api/newsletter/{id}/reactivate`
10. `DELETE /api/newsletter/{id}`
11. `GET /api/newsletter/count/active`
12. `GET /api/newsletter/count/total`

### 9.8 Color Variants Notes

There is no dedicated color-variant controller. Color variants are managed through product payloads:

- Create product: `POST /api/products` with `colorVariants`
- Update product: `PUT /api/products/{id}` with `colorVariants`
- Read variants from `ProductResponseDTO.colorVariants`

To filter by colors, use:

- `GET /api/products/filter?colors=Black&colors=White`

### 9.9 Example ProductResponseDTO (with variants and reviews)

```json
{
  "id": 15,
  "name": "Linen Shirt",
  "nameAr": "قميص كتان",
  "description": "Premium breathable linen shirt",
  "descriptionAr": "قميص كتان عالي الجودة",
  "price": 49.99,
  "category": {
    "id": 3,
    "name": "Shirts",
    "description": "All shirts",
    "parentCategoryId": null,
    "parentCategoryName": null,
    "isActive": true,
    "subCategories": []
  },
  "sku": "LINEN-SHIRT-001",
  "isActive": true,
  "isFeatured": true,
  "featuredOrder": 2,
  "averageRating": 4.8,
  "totalReviewsCount": 42,
  "colorVariants": [
    {
      "id": 101,
      "color": "White",
      "stockQuantity": 30,
      "colorCode": "#FFFFFF"
    },
    {
      "id": 102,
      "color": "Black",
      "stockQuantity": 22,
      "colorCode": "#000000"
    }
  ],
  "totalStock": 52,
  "images": [],
  "reviews": []
}
```
