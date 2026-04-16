# Website (Public Store) API Documentation

## Base URL
`/api`

---

## 🛍️ Public Store Overview

**The store is completely public and requires NO authentication or login.**

Customers can:
- ✅ Browse all products and categories
- ✅ Search and filter products by color and price
- ✅ View product details, images, and reviews
- ✅ Submit product reviews
- ✅ Place orders with guest checkout
- ✅ Track orders using order ID
- ✅ Read blog posts
- ✅ Submit contact forms
- ✅ Subscribe to newsletter
- ✅ View all website content (About, Policies, etc.)

**There is NO login page or user accounts for customers.** The store operates entirely as a guest experience.

**Note:** The `/auth/login` endpoint exists only for the Admin Dashboard (separate application). The public store does not use authentication.

---

## Products Catalog

### GET /products/active
**Description:** Browse active products with pagination  
**Query Params:** 
- `page` - Page number (0-based)
- `size` - Items per page
- `sort` - Sort criteria (e.g., `price,asc` or `name,desc`)

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Leather Tote Bag",
      "nameAr": "حقيبة يد جلدية",
      "description": "Premium leather tote bag",
      "descriptionAr": "حقيبة يد جلدية فاخرة",
      "price": 149.99,
      "category": { ... },
      "sku": "BAG-001",
      "totalStock": 33,
      "averageRating": 4.5,
      "totalReviewsCount": 12,
      "images": [ ... ],
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
        },
        {
          "id": 3,
          "color": "Beige",
          "stockQuantity": 8,
          "colorCode": "#F5F5DC"
        }
      ]
    }
  ],
  "totalPages": 5,
  "totalElements": 50,
  "number": 0
}
```

**Note:** Products now support multiple color variants. Each variant has its own stock quantity. The `totalStock` field shows the sum of all color variants' stock.

### GET /products/{id}
**Description:** Get single product details

### GET /products/category/{categoryId}
**Description:** Browse products by category  
**Query Params:** `page`, `size`, `sort`

### GET /products/search
**Description:** Search products by name or description  
**Query Params:** `keyword`, `page`, `size`, `sort`  
**Example:** `/products/search?keyword=leather&page=0&size=12`

### GET /products/filter
**Description:** Filter products by color and/or price range  
**Query Params:**
- `colors` (optional) - Filter by one or multiple colors (e.g., "black", "brown"). Can be specified multiple times for OR logic
- `minPrice` (optional) - Minimum price
- `maxPrice` (optional) - Maximum price
- `page`, `size`, `sort` - Pagination

**Examples:**
- `/products/filter?colors=black&page=0&size=12` - Single color
- `/products/filter?colors=black&colors=gray&page=0&size=12` - Multiple colors (Black OR Gray)
- `/products/filter?minPrice=50&maxPrice=200&page=0`
- `/products/filter?colors=brown&minPrice=100&maxPrice=300&sort=price,asc`

### GET /products/price-range
**Description:** Get products within a specific price range  
**Query Params:** `minPrice`, `maxPrice`, `page`, `size`, `sort`

### GET /products/top-rated
**Description:** Browse top-rated products  
**Query Params:** `page`, `size`, `sort`

### GET /products/featured
**Description:** Get featured products for homepage/promotional displays  
**Returns:** List of products marked as featured, ordered by featured order

**Response:**
```json
[
  {
    "id": 1,
    "name": "Premium Leather Bag",
    "nameAr": "حقيبة جلدية فاخرة",
    "price": 299.99,
    "isFeatured": true,
    "featuredOrder": 1,
    "images": [...],
    "colorVariants": [...]
  }
]
```

---

## Product Categories

### GET /product-categories/all-active
**Description:** Get all active categories for navigation menu

**Response:**
```json
[
  {
    "id": 1,
    "name": "Tote Bags",
    "description": "Spacious tote bags",
    "displayOrder": 1,
    "parentCategoryId": null
  },
  {
    "id": 2,
    "name": "Crossbody Bags",
    "description": "Compact crossbody bags",
    "displayOrder": 2,
    "parentCategoryId": null
  }
]
```

### GET /product-categories/top-level
**Description:** Get main categories

### GET /product-categories/{parentId}/subcategories
**Description:** Get subcategories for a parent category

### GET /product-categories/with-products
**Description:** Get categories that have products in stock

---

## Product Reviews

### GET /product-reviews/product/{productId}/approved
**Description:** Get approved reviews for a product  
**Query Params:** `page`, `size`, `sort`

### GET /product-reviews/product/{productId}/visible
**Description:** Get visible reviews for a product (for display on product page)

**Response:**
```json
[
  {
    "id": 1,
    "customerName": "John Doe",
    "rating": 5,
    "title": "Excellent quality!",
    "comment": "Love this bag, great quality leather.",
    "reviewDate": "2026-02-10T14:30:00",
    "isApproved": true
  }
]
```

### POST /product-reviews
**Description:** Submit a product review (guests can submit reviews)  
**Request Body:**
```json
{
  "productId": 1,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "rating": 5,
  "title": "Great product!",
  "comment": "Really happy with this purchase."
}
```

### GET /product-reviews/product/{productId}/average-rating
**Description:** Get average rating for a product

---

## Orders

**Guest Checkout:** All orders are placed as guests. Customers provide their email for order confirmation and tracking.

### POST /orders
**Description:** Place a new order (guest checkout)  
**Request Body:**
```json
{
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "+1234567890",
  "city": "Cairo",
  "streetName": "El-Tahrir Street",
  "buildingNumber": "42",
  "floor": "3",
  "apartmentNumber": "5A",
  "whatsappNumber": "+1234567890",
  "notes": "Please ring doorbell",
  "orderItems": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 149.99,
      "selectedColor": "Black"
    },
    {
      "productId": 2,
      "quantity": 1,
      "price": 89.99,
      "selectedColor": "Brown"
    }
  ]
}
```

**Response:**
```json
{
  "id": 123,
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "+1234567890",
  "city": "Cairo",
  "streetName": "El-Tahrir Street",
  "buildingNumber": "42",
  "floor": "3",
  "apartmentNumber": "5A",
  "orderStatus": "PENDING",
  "totalAmount": 389.97,
  "orderDate": "2026-02-14T10:30:00",
  "orderItems": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Leather Tote Bag",
      "productNameAr": "حقيبة يد جلدية",
      "selectedColor": "Black",
      "quantity": 2,
      "unitPrice": 149.99,
      "subtotal": 299.98
    },
    {
      "id": 2,
      "productId": 2,
      "productName": "Crossbody Bag",
      "productNameAr": "حقيبة كتف",
      "selectedColor": "Brown",
      "quantity": 1,
      "unitPrice": 89.99,
      "subtotal": 89.99
    }
  ]
}
```

**Important Notes:**
- **No `orderId` in request**: Order ID is auto-generated, don't include it in orderItems
- **`price` field required**: Specify the unit price for each item (allows for promotions/discounts)
- **`selectedColor` required**: Must specify which color variant the customer selected
- **`whatsappNumber` optional**: If not provided, defaults to customerPhone
- **Stock Validation**: The system validates stock at the color variant level
  - Each color variant has its own stock quantity
  - If `selectedColor` is specified, stock is checked and deducted from that specific color
  - Error message will indicate which color lacks sufficient stock

### GET /orders/{id}
**Description:** Track order status using order ID  
**Note:** Customers receive order ID after checkout and can use it to track their order

---

## Contact Form

### POST /contact-messages
**Description:** Submit contact form  
**Request Body:****
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I have a question about the leather bags..."
}
```

**Response:**
```json
{
  "id": 45,
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I have a question about the leather bags...",
  "isRead": false,
  "submittedDate": "2026-02-14T10:30:00"
}
```

---

## Newsletter

### POST /newsletter
**Description:** Subscribe to newsletter  
**Request Body:****
```json
{
  "email": "customer@example.com",
  "name": "Customer Name"
}
```

**Response:**
```json
{
  "id": 123,
  "email": "customer@example.com",
  "name": "Customer Name",
  "isActive": true,
  "subscribedDate": "2026-02-14T10:30:00"
}
```

### PATCH /newsletter/unsubscribe/{email}
**Description:** Unsubscribe from newsletter

---

## Blog

### GET /blog-posts/published
**Description:** Get published blog posts  
**Query Params:** `page`, `size`, `sort`

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "How to Choose the Perfect Bag",
      "titleAr": "كيف تختار الحقيبة المثالية",
      "slug": "how-to-choose-perfect-bag",
      "excerpt": "A comprehensive guide...",
      "featuredImage": "https://...",
      "category": "Style Tips",
      "categoryAr": "نصائح الأناقة",
      "tags": ["fashion", "bags", "style"],
      "publishedDate": "2026-02-10T09:00:00",
      "author": { ... }
    }
  ]
}
```

### GET /blog-posts/slug/{slug}
**Description:** Get single blog post by slug

### GET /blog-posts/category/{category}
**Description:** Get blog posts by category  
**Query Params:** `page`, `size`, `sort`

### GET /blog-posts/tag/{tag}
**Description:** Get blog posts by tag  
**Query Params:** `page`, `size`, `sort`

### GET /blog-posts/search
**Description:** Search blog posts  
**Query Params:** `keyword`, `page`, `size`, `sort`

### GET /blog-posts/recent
**Description:** Get recent blog posts (for sidebar/footer)  
**Query Params:** `limit` (default: 5)

---

## Policies

### GET /policies/all-active
**Description:** Get all active policies

**Response:**
```json
[
  {
    "id": 1,
    "title": "Privacy Policy",
    "type": "PRIVACY",
    "content": "Our privacy policy...",
    "lastUpdated": "2026-01-15T00:00:00"
  },
  {
    "id": 2,
    "title": "Terms of Service",
    "type": "TERMS",
    "content": "Terms and conditions...",
    "lastUpdated": "2026-01-15T00:00:00"
  }
]
```

### GET /policies/type/{type}/active
**Description:** Get active policy by type  
**Types:** PRIVACY, TERMS, REFUND, SHIPPING

**Examples:**
- `/policies/type/privacy/active` - Privacy Policy
- `/policies/type/terms/active` - Terms of Service
- `/policies/type/refund/active` - Refund Policy
- `/policies/type/shipping/active` - Shipping Policy

---

## Website Content

### GET /website-content/key/{key}
**Description:** Get content by unique key

**Examples:**
- `/website-content/key/homepage-hero`
- `/website-content/key/about-us`
- `/website-content/key/footer-text`

**Response:**
```json
{
  "id": 1,
  "pageName": "Home",
  "sectionName": "Hero Section",
  "contentType": "TEXT",
  "contentValue": "Welcome to our store",
  "contentValueAr": "مرحبا بكم في متجرنا",
  "displayOrder": 1,
  "isActive": true
}
```

### GET /website-content/section/{section}
**Description:** Get content for a specific section

**Examples:**
- `/website-content/section/homepage`
- `/website-content/section/about`
- `/website-content/section/footer`

### GET /website-content/section/{section}/all
**Description:** Get all contents for a section

---

## Promotional Popups

### GET /promotional-popups/current
**Description:** Get currently active promotional popups

**Response:**
```json
[
  {
    "id": 1,
    "title": "Winter Sale!",
    "titleAr": "تخفيضات الشتاء!",
    "message": "Get 20% off all bags",
    "messageAr": "احصل على خصم 20% على جميع الحقائب",
    "image": "https://...",
    "ctaButtonText": "Shop Now",
    "ctaButtonTextAr": "تسوق الآن",
    "ctaLink": "/products/filter?category=winter-sale",
    "type": "ENTRY",
    "isActive": true,
    "startDate": "2026-02-01T00:00:00",
    "endDate": "2026-02-28T23:59:59"
  }
]
```

### GET /promotional-popups/current/type/{type}
**Description:** Get current popup by type  
**Types:** ENTRY, NEWSLETTER, PROMOTIONAL

---

## Common Response Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **204 No Content** - Request successful, no content to return
- **400 Bad Request** - Invalid request data
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## Pagination Response Structure

All paginated endpoints return:
```json
{
  "content": [ ... ],      // Array of items
  "pageable": { ... },     // Pagination metadata
  "totalPages": 10,        // Total number of pages
  "totalElements": 100,    // Total number of items
  "number": 0,             // Current page number (0-based)
  "size": 10,              // Items per page
  "first": true,           // Is first page
  "last": false,           // Is last page
  "numberOfElements": 10,  // Items in current page
  "empty": false           // Is page empty
}
```

---

## Common Query Parameters

- **page** - Page number (0-based, default: 0)
- **size** - Items per page (default: 20)
- **sort** - Sort criteria in format `field,direction`
  - Examples: `price,asc`, `name,desc`, `createdDate,desc`
  - Multiple sort criteria: `price,asc&sort=name,asc`

---

## Usage Examples

### Shopping Flow
```javascript
// 1. Browse products
GET /api/products/active?page=0&size=12

// 2. Filter by color and price
GET /api/products/filter?colors=black&minPrice=50&maxPrice=200

// 3. View product details
GET /api/products/152

// 4. View product reviews
GET /api/product-reviews/product/152/visible

// 5. Place order with detailed address
POST /api/orders
{
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "+1234567890",
  "city": "Cairo",
  "streetName": "El-Tahrir Street",
  "buildingNumber": "42",
  "floor": "3",
  "apartmentNumber": "5A",
  "whatsappNumber": "+1234567890",
  "orderItems": [
    { "productId": 152, "quantity": 1, "price": 149.99, "selectedColor": "Black" }
  ]
}

// Response includes order ID and total price for tracking
{
  "id": 789,
  "customerEmail": "jane@example.com",
  "orderStatus": "PENDING",
  "totalAmount": 149.99
}
{
  "id": 789,
  "customerEmail": "jane@example.com",
  "status": "PENDING",
  "totalAmount": 149.99
}

// 6. Track order with order ID
GET /api/orders/789
```

### Browse Products with Filters
```javascript
// Get black bags priced between $50-$200, sorted by price
GET /api/products/filter?colors=black&minPrice=50&maxPrice=200&sort=price,asc

// Get black OR gray bags
GET /api/products/filter?colors=black&colors=gray&page=0&size=12

// Get all leather bags in Tote category
GET /api/products/category/1?search=leather&page=0&size=12
```

### Product Detail Page
```javascript
// Get product details
GET /api/products/152

// Get product reviews
GET /api/product-reviews/product/152/visible

// Get product images
GET /api/product-images/product/152
```

### Checkout Flow
```javascript
// 1. Get product details
GET /api/products/152

// 2. Place order as guest with detailed address
POST /api/orders
{
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "+1234567890",
  "city": "Cairo",
  "streetName": "El-Tahrir Street",
  "buildingNumber": "42",
  "floor": "3",
  "apartmentNumber": "5A",
  "whatsappNumber": "+1234567890",
  "notes": "Please call before delivery",
  "orderItems": [
    { "productId": 152, "quantity": 1, "price": 149.99, "selectedColor": "Black" }
  ]
}

// Response:
{
  "id": 789,
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "+1234567890",
  "city": "Cairo",
  "streetName": "El-Tahrir Street",
  "buildingNumber": "42",
  "floor": "3",
  "apartmentNumber": "5A",
  "orderStatus": "PENDING",
  "totalAmount": 149.99,
  "orderDate": "2026-02-14T10:30:00"
}

// 3. Track order with order ID
GET /api/orders/789
```

### Blog Section
```javascript
// Get latest blog posts
GET /api/blog-posts/published?page=0&size=9&sort=publishedDate,desc

// Get single post
GET /api/blog-posts/slug/how-to-choose-perfect-bag

// Search blog
GET /api/blog-posts/search?keyword=leather+care
```

---

## Notes

- **100% Public Store:** The entire store is publicly accessible. No login page, no user accounts, no authentication required.
- **Guest-Only Experience:** All customers shop and checkout as guests.
- **Order Tracking:** Customers receive an order ID after checkout to track their orders.
- **Multiple Color Variants:** Products support multiple color variants, each with individual stock quantities. Customers must specify the color when placing orders.
- **Admin Dashboard Separate:** The `/auth/login` endpoint is for the Admin Dashboard only (separate application).
- All endpoints support CORS with `origins = "*"`
- Date format: ISO 8601 (e.g., "2026-02-14T10:30:00")
- Money amounts are in decimal format (e.g., 149.99)
- Images are returned as URLs (ensure proper CDN/storage configuration)
- All prices are in the store's default currency

---

## Troubleshooting

### Error: "Insufficient stock for product X (Color: Y)"

**Cause:** The selected color variant doesn't have enough stock in the database.

**Solution:**
1. Verify product color variants in database:
   ```sql
   SELECT * FROM product_color_variants WHERE product_id = <product_id>;
   ```
2. Check the specific color's stock quantity
3. Update stock via Admin Dashboard or database:
   ```sql
   UPDATE product_color_variants 
   SET stock_quantity = <new_quantity> 
   WHERE product_id = <product_id> AND color = '<color_name>';
   ```

### Error: "Color variant not found: X for product: Y"

**Cause:** The requested color doesn't exist for the product.

**Solution:**
1. Verify available colors for the product: `GET /products/{id}`
2. Check the `colorVariants` array in the response
3. Ensure the `selectedColor` in your request exactly matches one of the available colors (case-insensitive)

### Error: "orderId is required"

**Cause:** Using old OrderItemRequestDTO structure.

**Solution:** Remove `orderId` from orderItems in the request body. The order ID is auto-generated.

### Orders Not Saving

**Cause:** Missing cascade settings on Order entity.

**Solution:** Ensure `Order.orderItems` has `cascade = CascadeType.ALL, orphanRemoval = true`

