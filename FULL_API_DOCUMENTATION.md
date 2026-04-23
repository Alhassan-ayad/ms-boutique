# MS Boutique Full API Documentation

Last updated: 2026-04-23
Server base URL: http://localhost:8081

## Authentication and Headers

- Protected endpoints require header:

```http
Authorization: Bearer <access_token>
```

- Content type for JSON APIs:

```http
Content-Type: application/json
```

- File upload endpoints use:

```http
Content-Type: multipart/form-data
```

## Common Query Parameters for Pagination

For endpoints returning Page<T>, use:
- page: zero-based page index, example: 0
- size: page size, example: 10
- sort: field,direction, example: createdDate,desc

Example:

```http
GET /api/products?page=0&size=12&sort=createdDate,desc
```

## Common Error Response Shapes

Validation error (400):

```json
{
  "timestamp": "2026-04-23T14:10:00",
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "fieldName": "message"
  },
  "path": "/api/products"
}
```

Generic error:

```json
{
  "timestamp": "2026-04-23T14:10:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found",
  "path": "/api/products/999"
}
```

Unauthorized error:

```json
{
  "timestamp": "2026-04-23T14:10:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required to access this resource",
  "path": "/api/settings"
}
```

---

## 1. Blog Post APIs

Base path: /api/blog-posts

### Endpoints

- GET /{id}
- GET /slug/{slug}
- GET /
- GET /published
- GET /drafts
- GET /author/{authorId}
- GET /category/{category}
- GET /tag/{tag}
- GET /search?keyword=
- GET /recent?limit=5
- GET /featured?limit=3
- POST /
- PUT /{id}
- PATCH /{id}/publish
- PATCH /{id}/unpublish
- POST /upload-image
- DELETE /{id}
- GET /count/published
- GET /count/category/{category}

### Create/Update Payload (BlogPostRequestDTO)

```json
{
  "title": "Summer Collection 2026",
  "titleAr": "تشكيلة صيف 2026",
  "slug": "summer-collection-2026",
  "content": "Full blog content...",
  "contentAr": "محتوى المقال...",
  "excerpt": "Short preview text",
  "excerptAr": "ملخص قصير",
  "authorId": 1,
  "featuredImage": "/images/blog/abc123.jpg",
  "isPublished": false,
  "isFeatured": false,
  "featuredOrder": 1,
  "category": "Fashion",
  "categoryAr": "موضة",
  "tags": "summer,new,trending"
}
```

### Field Rules

- title: required, max 255
- content: required
- authorId: required
- titleAr: max 255
- slug: max 255
- excerpt, excerptAr: max 1000
- featuredImage: max 500
- category, categoryAr: max 100
- tags: max 500

### Response Shape (BlogPostResponseDTO)

```json
{
  "id": 11,
  "title": "Summer Collection 2026",
  "titleAr": "تشكيلة صيف 2026",
  "slug": "summer-collection-2026",
  "content": "Full blog content...",
  "contentAr": "محتوى المقال...",
  "excerpt": "Short preview text",
  "excerptAr": "ملخص قصير",
  "authorId": 1,
  "authorName": "Admin",
  "featuredImage": "/images/blog/abc123.jpg",
  "isPublished": true,
  "isFeatured": true,
  "featuredOrder": 1,
  "publishedDate": "2026-04-23T13:00:00",
  "createdDate": "2026-04-20T10:00:00",
  "updatedDate": "2026-04-23T13:00:00",
  "category": "Fashion",
  "categoryAr": "موضة",
  "tags": "summer,new,trending"
}
```

### Upload Image

- Endpoint: POST /upload-image
- Body: multipart/form-data
- Form key: file
- Response: string URL, example:

```text
/images/blog/6a54f8d4-7cb0-4ddf-9acd-f9f6dd7f7fcd.jpg
```

---

## 2. Product APIs

Base path: /api/products

### Endpoints

- GET /{id}
- GET /
- GET /active
- GET /category/{categoryId}
- GET /search?keyword=
- GET /price-range?minPrice=&maxPrice=
- GET /filter?colors=RED&colors=BLUE&minPrice=&maxPrice=
- GET /low-stock?threshold=
- GET /top-rated
- GET /featured
- POST /
- PUT /{id}
- PATCH /{id}/status
- PATCH /{id}/stock?quantity=
- PUT /{id}/category?categoryId=
- DELETE /{id}
- GET /count/category/{categoryId}
- GET /count/active

### Create/Update Payload (ProductRequestDTO)

```json
{
  "name": "Linen Shirt",
  "nameAr": "قميص كتان",
  "description": "Premium breathable linen shirt",
  "descriptionAr": "قميص كتان عالي الجودة",
  "price": 79.99,
  "color": "Deprecated",
  "categoryId": 2,
  "sku": "LINEN-SHIRT-001",
  "stockQuantity": 0,
  "isActive": true,
  "isFeatured": true,
  "featuredOrder": 2,
  "colorVariants": [
    {
      "color": "Black",
      "stockQuantity": 12,
      "colorCode": "#000000"
    },
    {
      "color": "White",
      "stockQuantity": 8,
      "colorCode": "#FFFFFF"
    }
  ]
}
```

### Field Rules

- name: required, max 255
- price: required, > 0, decimal format
- colorVariants: required, minimum 1 item
- colorVariants[].color: required, max 50
- colorVariants[].stockQuantity: required, min 0
- colorVariants[].colorCode: max 100
- nameAr: max 255
- description, descriptionAr: max 5000
- sku: max 100
- featuredOrder: min 0
- color and stockQuantity are deprecated in favor of colorVariants

### Product Response (ProductResponseDTO)

```json
{
  "id": 31,
  "name": "Linen Shirt",
  "nameAr": "قميص كتان",
  "description": "Premium breathable linen shirt",
  "descriptionAr": "قميص كتان عالي الجودة",
  "price": 79.99,
  "color": "Deprecated",
  "category": {
    "id": 2,
    "name": "Shirts",
    "description": "All shirts",
    "parentCategoryId": null,
    "parentCategoryName": null,
    "isActive": true,
    "subCategories": []
  },
  "sku": "LINEN-SHIRT-001",
  "stockQuantity": 20,
  "isActive": true,
  "isFeatured": true,
  "featuredOrder": 2,
  "createdDate": "2026-04-22T12:00:00",
  "updatedDate": "2026-04-23T09:00:00",
  "averageRating": 4.6,
  "totalReviewsCount": 15,
  "images": [],
  "reviews": [],
  "colorVariants": [
    {
      "id": 1,
      "color": "Black",
      "stockQuantity": 12,
      "colorCode": "#000000"
    },
    {
      "id": 2,
      "color": "White",
      "stockQuantity": 8,
      "colorCode": "#FFFFFF"
    }
  ],
  "totalStock": 20
}
```

### Notes for Filter Endpoint

- colors can be repeated in query string:

```http
GET /api/products/filter?colors=Black&colors=White&minPrice=50&maxPrice=120
```

---

## 3. Color Variant API Contract

There is no standalone color-variant controller in current backend.
Color variants are managed inside product create/update payloads.

### Color Variant Request Object (nested)

```json
{
  "color": "Black",
  "stockQuantity": 12,
  "colorCode": "#000000"
}
```

### Color Variant Response Object (nested)

```json
{
  "id": 1,
  "color": "Black",
  "stockQuantity": 12,
  "colorCode": "#000000"
}
```

---

## 4. Product Review APIs

Base path: /api/product-reviews

### Endpoints

- GET /{id}
- GET /
- GET /product/{productId}
- GET /product/{productId}/approved
- GET /product/{productId}/visible
- GET /pending
- GET /rating/{rating}?productId=
- GET /customer/name/{customerName}
- GET /customer/email/{email}
- POST /
- PUT /{id}
- PATCH /{id}/approve
- PATCH /{id}/reject
- PATCH /{id}/visibility
- DELETE /{id}
- GET /product/{productId}/average-rating
- GET /count/product/{productId}
- GET /count/pending

### Create/Update Payload (ProductReviewRequestDTO)

```json
{
  "productId": 31,
  "customerName": "Sara Ali",
  "customerEmail": "sara@example.com",
  "rating": 5,
  "reviewText": "Great quality and fit",
  "isVisible": true
}
```

### Field Rules

- productId: required
- customerName: required, max 100
- customerEmail: required, valid email, max 100
- rating: required, 1 to 5
- reviewText: max 2000

### Response (ProductReviewResponseDTO)

```json
{
  "id": 201,
  "productId": 31,
  "productName": "Linen Shirt",
  "customerName": "Sara Ali",
  "customerEmail": "sara@example.com",
  "rating": 5,
  "reviewText": "Great quality and fit",
  "isApproved": false,
  "createdDate": "2026-04-23T15:00:00",
  "isVisible": true
}
```

---

## 5. Website Content APIs

Base path: /api/website-content

### Endpoints

- GET /{id}
- GET /key/{key}
- GET /section/{section}
- GET /
- GET /active
- GET /section/{section}/all
- GET /type/{type}
- GET /search?keyword=
- POST /
- PUT /{id}
- PUT /key/{key}
- PATCH /{id}/status
- POST /upload-image
- DELETE /{id}
- GET /count/section/{section}
- GET /count/type/{type}

Type values:
- TEXT
- IMAGE
- HTML
- VIDEO
- URL

### Create/Update Payload (WebsiteContentRequestDTO)

```json
{
  "pageName": "Home",
  "sectionName": "hero",
  "contentType": "TEXT",
  "contentValue": "Discover our new arrivals",
  "contentValueAr": "اكتشف مجموعتنا الجديدة",
  "displayOrder": 1,
  "isActive": true
}
```

### Field Rules

- pageName: required, max 50
- sectionName: required, max 100
- contentType: required
- contentValue: required
- displayOrder: min 0

### Response (WebsiteContentResponseDTO)

```json
{
  "id": 88,
  "pageName": "Home",
  "sectionName": "hero",
  "contentType": "TEXT",
  "contentValue": "Discover our new arrivals",
  "contentValueAr": "اكتشف مجموعتنا الجديدة",
  "displayOrder": 1,
  "isActive": true
}
```

### Upload Image

- Endpoint: POST /upload-image
- Body: multipart/form-data
- Form key: file
- Response: string URL path

---

## 6. Order APIs

Base path: /api/orders

### Endpoints

- GET /{id}
- GET /
- GET /status/{status}
- GET /customer/{customerName}
- GET /customer/email/{email}
- GET /date-range?startDate=<ISO>&endDate=<ISO>
- GET /recent?limit=10
- POST /
- PUT /{id}
- PATCH /{id}/status?status=
- PATCH /{id}/cancel
- DELETE /{id}
- GET /count/status/{status}
- GET /revenue/status/{status}
- GET /revenue/total

Order status values:
- PENDING
- PROCESSING
- SHIPPED
- DELIVERED
- CANCELLED

### Create/Update Payload (OrderRequestDTO)

```json
{
  "customerName": "Ahmed Hassan",
  "customerEmail": "ahmed@example.com",
  "customerPhone": "+201111111111",
  "city": "Cairo",
  "streetName": "Tahrir Street",
  "buildingNumber": "12",
  "floor": "4",
  "apartmentNumber": "12B",
  "notes": "Call before delivery",
  "whatsappNumber": "+201111111111",
  "orderItems": [
    {
      "productId": 31,
      "quantity": 2,
      "price": 79.99,
      "selectedColor": "Black"
    }
  ]
}
```

### Field Rules

- customerName: required, max 100
- customerEmail: required, valid email, max 100
- customerPhone: required, max 20
- city: required, max 100
- streetName: required, max 200
- buildingNumber: required, max 20
- floor: max 20
- apartmentNumber: max 20
- notes: max 1000
- whatsappNumber: max 20
- orderItems: required, minimum 1 item
- orderItems[].productId: required
- orderItems[].quantity: required, min 1
- orderItems[].price: required, > 0
- orderItems[].selectedColor: max 50

### Response (OrderResponseDTO)

```json
{
  "id": 501,
  "customerName": "Ahmed Hassan",
  "customerEmail": "ahmed@example.com",
  "customerPhone": "+201111111111",
  "city": "Cairo",
  "streetName": "Tahrir Street",
  "buildingNumber": "12",
  "floor": "4",
  "apartmentNumber": "12B",
  "orderDate": "2026-04-23T16:00:00",
  "orderStatus": "PENDING",
  "totalAmount": 159.98,
  "notes": "Call before delivery",
  "whatsappNumber": "+201111111111",
  "orderItems": [
    {
      "id": 900,
      "orderId": 501,
      "productId": 31,
      "productName": "Linen Shirt",
      "selectedColor": "Black",
      "quantity": 2,
      "unitPrice": 79.99,
      "subtotal": 159.98
    }
  ]
}
```

---

## 7. Promotional Popup APIs

Base path: /api/promotional-popups

### Endpoints

- GET /{id}
- GET /
- GET /active
- GET /type/{type}
- GET /current
- GET /current/type/{type}
- GET /expired
- GET /scheduled
- POST /
- PUT /{id}
- PATCH /{id}/status
- POST /upload-image
- DELETE /{id}
- GET /count/type/{type}/active

Type values:
- ENTRY
- NEWSLETTER
- PROMOTIONAL

### Create/Update Payload (PromotionalPopupRequestDTO)

```json
{
  "title": "10% Off First Order",
  "titleAr": "خصم 10% على أول طلب",
  "message": "Subscribe now and get discount",
  "messageAr": "اشترك الآن واحصل على خصم",
  "image": "/images/popup/promo-1.jpg",
  "ctaButtonText": "Shop Now",
  "ctaButtonTextAr": "تسوق الآن",
  "ctaLink": "/products",
  "type": "PROMOTIONAL",
  "isActive": true,
  "startDate": "2026-04-23T00:00:00",
  "endDate": "2026-05-01T00:00:00"
}
```

### Field Rules

- title: required, max 255
- type: required, valid enum value
- titleAr: max 255
- message, messageAr: max 2000
- image: max 500
- ctaButtonText, ctaButtonTextAr: max 100
- ctaLink: max 500

### Response (PromotionalPopupResponseDTO)

```json
{
  "id": 76,
  "title": "10% Off First Order",
  "titleAr": "خصم 10% على أول طلب",
  "message": "Subscribe now and get discount",
  "messageAr": "اشترك الآن واحصل على خصم",
  "image": "/images/popup/promo-1.jpg",
  "ctaButtonText": "Shop Now",
  "ctaButtonTextAr": "تسوق الآن",
  "ctaLink": "/products",
  "type": "PROMOTIONAL",
  "isActive": true,
  "startDate": "2026-04-23T00:00:00",
  "endDate": "2026-05-01T00:00:00"
}
```

### Upload Image

- Endpoint: POST /upload-image
- Body: multipart/form-data
- Form key: file
- Response: string URL path

---

## 8. Newsletter APIs

Base path: /api/newsletter

### Endpoints

- GET /{id}
- GET /email/{email}
- GET /
- GET /active
- GET /inactive
- GET /date-range?startDate=<ISO>&endDate=<ISO>
- POST /
- PATCH /unsubscribe/{email}
- PATCH /{id}/reactivate
- DELETE /{id}
- GET /count/active
- GET /count/total

### Subscribe Payload (NewsletterRequestDTO)

```json
{
  "email": "customer@example.com",
  "source": "FOOTER"
}
```

Source values used in code comments:
- ENTRY_POPUP
- CORNER_POPUP
- FOOTER
- OTHER

### Field Rules

- email: required, valid email, max 100
- source: required

### Response (NewsletterResponseDTO)

```json
{
  "id": 301,
  "email": "customer@example.com",
  "subscriptionDate": "2026-04-23T17:00:00",
  "isActive": true,
  "source": "FOOTER"
}
```

---

## 9. Integration Notes and Edge Cases

- Newsletter routing mismatch exists in security config:
  - Controller uses /api/newsletter (singular)
  - Security whitelist uses /api/newsletters/** (plural)

- Date range endpoints expect ISO date-time format:

```text
2026-04-23T12:30:00
```

- Upload responses are plain string URLs, not JSON objects.

- Product color and stockQuantity fields are marked deprecated. Use colorVariants.
