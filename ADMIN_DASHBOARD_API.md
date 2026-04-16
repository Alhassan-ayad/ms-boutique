# Admin Dashboard API Documentation

## Base URL
`http://localhost:8081/api`

---

## 🔒 Authentication Required

**All admin dashboard endpoints require authentication.** Only admins can login and access the dashboard. All authenticated users have full management access.

**Note:** The admin dashboard is separate from the public store. The public store requires no authentication - customers browse and checkout as guests.

---

## Authentication

### POST /auth/register
**Description:** Register a new admin user  
**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string"
}
```
**Response:**
```json
{
  "message": "Admin user registered successfully",
  "username": "string",
  "email": "string"
}
```

### POST /auth/login
**Description:** Admin login to access the dashboard  
**Request Body:**
```json
{
  "usernameOrEmail": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "token": "string",
  "refreshToken": "string",
  "username": "string",
  "email": "string"
}
```

### POST /auth/refresh
**Description:** Refresh access token  
**Request Body:**
```json
{
  "refreshToken": "string"
}
```

### POST /auth/logout
**Description:** Logout admin user

### GET /auth/validate
**Description:** Validate current token  
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "valid": true,
  "username": "admin"
}
```

---

## 🔑 Using Authentication

After logging in, include the token in all subsequent requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Request:**
```javascript
GET /api/users
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

---

## User Management

### GET /users
**Description:** Get all users with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /users/{id}
**Description:** Get user by ID

### GET /users/username/{username}
**Description:** Get user by username

### GET /users/email/{email}
**Description:** Get user by email

### GET /users/active
**Description:** Get all active users  
**Query Params:** `page`, `size`, `sort`

### GET /users/search
**Description:** Search users by keyword  
**Query Params:** `keyword`, `page`, `size`, `sort`

### GET /users/inactive
**Description:** Get inactive users  
**Query Params:** `days` (default: 30)

### POST /users
**Description:** Create new admin user  
**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "isActive": true
}
```

### PUT /users/{id}
**Description:** Update user information

### PATCH /users/{id}/password
**Description:** Change user password  
**Request Body:**
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

### PATCH /users/{id}/status
**Description:** Toggle user active/inactive status

### PATCH /users/{id}/last-login
**Description:** Update last login timestamp

### DELETE /users/{id}
**Description:** Delete user

### GET /users/count/active
**Description:** Count active users

---

## Product Management

### GET /products
**Description:** Get all products with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /products/{id}
**Description:** Get product by ID

### GET /products/active
**Description:** Get active products  
**Query Params:** `page`, `size`, `sort`

### GET /products/category/{categoryId}
**Description:** Get products by category  
**Query Params:** `page`, `size`, `sort`

### GET /products/search
**Description:** Search products  
**Query Params:** `keyword`, `page`, `size`, `sort`

### GET /products/price-range
**Description:** Get products by price range  
**Query Params:** `minPrice`, `maxPrice`, `page`, `size`, `sort`

### GET /products/filter
**Description:** Filter products by color and price  
**Query Params:** `colors` (optional, can specify multiple), `minPrice` (optional), `maxPrice` (optional), `page`, `size`, `sort`

### GET /products/low-stock
**Description:** Get low stock products  
**Query Params:** `threshold`

### GET /products/top-rated
**Description:** Get top rated products  
**Query Params:** `page`, `size`, `sort`

### GET /products/featured
**Description:** Get featured products  
**Returns:** List of products marked as featured, ordered by featured order

### POST /products
**Description:** Create new product  
**Request Body:**
```json
{
  "name": "string",
  "nameAr": "string",
  "description": "string",
  "descriptionAr": "string",
  "price": 0.00,
  "categoryId": 0,
  "sku": "string",
  "isActive": true,
  "isFeatured": false,
  "featuredOrder": 0,
  "colorVariants": [
    {
      "color": "Black",
      "stockQuantity": 15,
      "colorCode": "#000000"
    },
    {
      "color": "Brown",
      "stockQuantity": 10,
      "colorCode": "#8B4513"
    },
    {
      "color": "Beige",
      "stockQuantity": 8,
      "colorCode": "#F5F5DC"
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Leather Tote Bag",
  "nameAr": "حقيبة يد جلدية",
  "description": "Premium leather tote bag",
  "descriptionAr": "حقيبة يد جلدية فاخرة",
  "price": 149.99,
  "categoryId": 2,
  "sku": "BAG-001",
  "isActive": true,
  "isFeatured": false,
  "featuredOrder": null,
  "totalStock": 33,
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
```

**Note:** At least one color variant is required when creating a product.

### PUT /products/{id}
**Description:** Update product

**Request Body:**
```json
{
  "name": "string",
  "nameAr": "string",
  "description": "string",
  "descriptionAr": "string",
  "price": 0.00,
  "categoryId": 0,
  "sku": "string",
  "isActive": true,
  "isFeatured": false,
  "featuredOrder": 0,
  "colorVariants": [
  "isActive": true,
  "colorVariants": [
    {
      "color": "Black",
      "stockQuantity": 20,
      "colorCode": "#000000"
    },
    {
      "color": "Navy Blue",
      "stockQuantity": 12,
      "colorCode": "#000080"
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Leather Tote Bag",
  "description": "Premium leather tote bag - updated",
  "price": 159.99,
  "categoryId": 2,
  "sku": "BAG-001",
  "isActive": true,
  "totalStock": 32,
  "colorVariants": [
    {
      "id": 4,
      "color": "Black",
      "stockQuantity": 20,
      "colorCode": "#000000"
    },
    {
      "id": 5,
      "color": "Navy Blue",
      "stockQuantity": 12,
      "colorCode": "#000080"
    }
  ]
}
```

**Note:** When updating a product, you can modify the color variants. The old variants will be replaced with the new ones.

### PATCH /products/{id}/status
**Description:** Toggle product active/inactive status

### PATCH /products/{id}/stock
**Description:** Update product stock  
**Query Params:** `quantity`

### PUT /products/{id}/category
**Description:** Assign category to product  
**Query Params:** `categoryId`

### DELETE /products/{id}
**Description:** Delete product

### GET /products/count/category/{categoryId}
**Description:** Count products by category

### GET /products/count/active
**Description:** Count active products

---

## Product Categories

### GET /product-categories
**Description:** Get all categories with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /product-categories/{id}
**Description:** Get category by ID

### GET /product-categories/name/{name}
**Description:** Get category by name

### GET /product-categories/active
**Description:** Get active categories  
**Query Params:** `page`, `size`, `sort`

### GET /product-categories/all-active
**Description:** Get all active categories (no pagination)

### GET /product-categories/top-level
**Description:** Get top-level categories

### GET /product-categories/{parentId}/subcategories
**Description:** Get subcategories by parent ID

### GET /product-categories/with-products
**Description:** Get categories that have products

### GET /product-categories/search
**Description:** Search categories  
**Query Params:** `name`, `page`, `size`, `sort`

### POST /product-categories
**Description:** Create new category  
**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "parentCategoryId": 0,
  "displayOrder": 0,
  "isActive": true
}
```

### PUT /product-categories/{id}
**Description:** Update category

### PATCH /product-categories/{id}/status
**Description:** Toggle category status

### DELETE /product-categories/{id}
**Description:** Delete category

### GET /product-categories/count/active
**Description:** Count active categories

### GET /product-categories/count/top-level
**Description:** Count top-level categories

---

## Product Images

### GET /product-images
**Description:** Get all images with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /product-images/{id}
**Description:** Get image by ID

### GET /product-images/product/{productId}
**Description:** Get all images for a product

### GET /product-images/product/{productId}/primary
**Description:** Get primary image for a product

### POST /product-images
**Description:** Add product image  
**Request Body:**
```json
{
  "productId": 0,
  "imageUrl": "string",
  "altText": "string",
  "isPrimary": false,
  "displayOrder": 0
}
```

### PUT /product-images/{id}
**Description:** Update product image

### PATCH /product-images/{id}/set-primary
**Description:** Set image as primary

### PATCH /product-images/{id}/display-order
**Description:** Update display order  
**Query Params:** `order`

### DELETE /product-images/{id}
**Description:** Delete image

### DELETE /product-images/product/{productId}
**Description:** Delete all images for a product

### GET /product-images/count/product/{productId}
**Description:** Count images for a product

---

## Product Reviews

### GET /product-reviews
**Description:** Get all reviews with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /product-reviews/{id}
**Description:** Get review by ID

### GET /product-reviews/product/{productId}
**Description:** Get all reviews for a product  
**Query Params:** `page`, `size`, `sort`

### GET /product-reviews/product/{productId}/approved
**Description:** Get approved reviews for a product  
**Query Params:** `page`, `size`, `sort`

### GET /product-reviews/pending
**Description:** Get pending reviews  
**Query Params:** `page`, `size`, `sort`

### GET /product-reviews/rating/{rating}
**Description:** Get reviews by rating  
**Query Params:** `productId`, `page`, `size`, `sort`

### GET /product-reviews/customer/name/{customerName}
**Description:** Get reviews by customer name  
**Query Params:** `page`, `size`, `sort`

### GET /product-reviews/customer/email/{email}
**Description:** Get reviews by customer email

### POST /product-reviews
**Description:** Create review  
**Request Body:**
```json
{
  "productId": 0,
  "customerName": "string",
  "customerEmail": "string",
  "rating": 5,
  "title": "string",
  "comment": "string",
  "isApproved": false,
  "isVisible": true
}
```

### PUT /product-reviews/{id}
**Description:** Update review

### PATCH /product-reviews/{id}/approve
**Description:** Approve review

### PATCH /product-reviews/{id}/reject
**Description:** Reject review

### PATCH /product-reviews/{id}/visibility
**Description:** Toggle review visibility

### DELETE /product-reviews/{id}
**Description:** Delete review

### GET /product-reviews/product/{productId}/average-rating
**Description:** Get average rating for a product

### GET /product-reviews/count/product/{productId}
**Description:** Count reviews for a product

### GET /product-reviews/count/pending
**Description:** Count pending reviews

---

## Order Management

### GET /orders
**Description:** Get all orders with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /orders/{id}
**Description:** Get order by ID

### GET /orders/status/{status}
**Description:** Get orders by status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)  
**Query Params:** `page`, `size`, `sort`

### GET /orders/customer/{customerName}
**Description:** Get orders by customer name  
**Query Params:** `page`, `size`, `sort`

### GET /orders/customer/email/{email}
**Description:** Get orders by customer email  
**Query Params:** `page`, `size`, `sort`

### GET /orders/date-range
**Description:** Get orders by date range  
**Query Params:** `startDate`, `endDate`, `page`, `size`, `sort`

### GET /orders/recent
**Description:** Get recent orders  
**Query Params:** `limit` (default: 10)

### POST /orders
**Description:** Create new order  
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
  "notes": "Please call before delivery",
  "orderItems": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 149.99,
      "selectedColor": "Black"
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
  "totalAmount": 299.98,
  "orderDate": "2026-02-14T10:30:00",
  "orderItems": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Leather Tote Bag",
      "selectedColor": "Black",
      "quantity": 2,
      "unitPrice": 149.99,
      "subtotal": 299.98
    }
  ]
}
```

**Important Notes:**
- **No `orderId` in orderItems**: Order ID is auto-generated during creation
- **`price` field required**: Allows for custom pricing or promotions
- **`selectedColor` required**: Must match one of the product's available color variants
- **`whatsappNumber`**: Defaults to customerPhone if not provided
- **Color Variant Stock Management**:
  - Stock is checked at the color variant level, not the product level
  - Each color has its own independent stock quantity
  - When an order is placed, stock is deducted from the specific color variant
  - When an order is cancelled, stock is restored to the specific color variant
  - Error messages will indicate which color variant has insufficient stock

### PUT /orders/{id}
**Description:** Update order

### PATCH /orders/{id}/status
**Description:** Update order status  
**Query Params:** `status`

### PATCH /orders/{id}/cancel
**Description:** Cancel order

### DELETE /orders/{id}
**Description:** Delete order

### GET /orders/count/status/{status}
**Description:** Count orders by status

### GET /orders/revenue/status/{status}
**Description:** Get total revenue by order status

### GET /orders/revenue/total
**Description:** Get total revenue

---

## Order Items Management

### GET /order-items/{id}
**Description:** Get order item by ID

### GET /order-items/order/{orderId}
**Description:** Get all order items for a specific order

### GET /order-items/product/{productId}
**Description:** Get all order items for a specific product

### POST /order-items/order/{orderId}
**Description:** Add an item to an existing order  
**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2,
  "price": 149.99,
  "selectedColor": "Black"
}
```

**Note:** The `orderId` is passed in the URL path, not in the request body.

### PUT /order-items/{id}
**Description:** Update an order item

### DELETE /order-items/{id}
**Description:** Delete an order item (restores stock)

### GET /order-items/order/{orderId}/count
**Description:** Count items in an order

### GET /order-items/order/{orderId}/total
**Description:** Get total amount for order items

---

## Blog Management

### GET /blog-posts
**Description:** Get all blog posts with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /blog-posts/{id}
**Description:** Get blog post by ID

### GET /blog-posts/slug/{slug}
**Description:** Get blog post by slug

### GET /blog-posts/published
**Description:** Get published posts  
**Query Params:** `page`, `size`, `sort`

### GET /blog-posts/drafts
**Description:** Get draft posts  
**Query Params:** `page`, `size`, `sort`

### GET /blog-posts/author/{authorId}
**Description:** Get posts by author  
**Query Params:** `page`, `size`, `sort`

### GET /blog-posts/category/{category}
**Description:** Get posts by category  
**Query Params:** `page`, `size`, `sort`

### GET /blog-posts/tag/{tag}
**Description:** Get posts by tag  
**Query Params:** `page`, `size`, `sort`

### GET /blog-posts/search
**Description:** Search blog posts  
**Query Params:** `keyword`, `page`, `size`, `sort`

### GET /blog-posts/recent
**Description:** Get recent published posts  
**Query Params:** `limit` (default: 5)

### POST /blog-posts
**Description:** Create blog post  
**Request Body:**
```json
{
  "title": "string",
  "titleAr": "string",
  "slug": "string",
  "content": "string",
  "contentAr": "string",
  "excerpt": "string",
  "featuredImage": "string",
  "category": "string",
  "categoryAr": "string",
  "tags": [],
  "authorId": 0,
  "isPublished": false,
  "publishedDate": "2026-02-14T00:00:00"
}
```

### PUT /blog-posts/{id}
**Description:** Update blog post

### PATCH /blog-posts/{id}/publish
**Description:** Publish blog post

### PATCH /blog-posts/{id}/unpublish
**Description:** Unpublish blog post

### DELETE /blog-posts/{id}
**Description:** Delete blog post

---

## Contact Messages

### GET /contact-messages
**Description:** Get all contact messages with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /contact-messages/{id}
**Description:** Get message by ID

### GET /contact-messages/unread
**Description:** Get unread messages  
**Query Params:** `page`, `size`, `sort`

### GET /contact-messages/read
**Description:** Get read messages  
**Query Params:** `page`, `size`, `sort`

### GET /contact-messages/recent
**Description:** Get recent messages  
**Query Params:** `page`, `size`, `sort`

### GET /contact-messages/email/{email}
**Description:** Get messages by email  
**Query Params:** `page`, `size`, `sort`

### GET /contact-messages/search
**Description:** Search messages  
**Query Params:** `keyword`, `page`, `size`, `sort`

### GET /contact-messages/date-range
**Description:** Get messages by date range  
**Query Params:** `startDate`, `endDate`, `page`, `size`, `sort`

### GET /contact-messages/with-response
**Description:** Get messages with admin response  
**Query Params:** `page`, `size`, `sort`

### PATCH /contact-messages/{id}/mark-read
**Description:** Mark message as read

### PATCH /contact-messages/{id}/mark-unread
**Description:** Mark message as unread

### PATCH /contact-messages/{id}/response
**Description:** Add admin response  
**Request Body:**
```json
{
  "response": "string"
}
```

### DELETE /contact-messages/{id}
**Description:** Delete message

### GET /contact-messages/count/unread
**Description:** Count unread messages

---

## Newsletter Management

### GET /newsletter
**Description:** Get all subscriptions with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /newsletter/{id}
**Description:** Get subscription by ID

### GET /newsletter/email/{email}
**Description:** Get subscription by email

### GET /newsletter/active
**Description:** Get active subscriptions  
**Query Params:** `page`, `size`, `sort`

### GET /newsletter/inactive
**Description:** Get inactive subscriptions  
**Query Params:** `page`, `size`, `sort`

### GET /newsletter/date-range
**Description:** Get subscriptions by date range  
**Query Params:** `startDate`, `endDate`, `page`, `size`, `sort`

### PATCH /newsletter/unsubscribe/{email}
**Description:** Unsubscribe user by email

### PATCH /newsletter/{id}/reactivate
**Description:** Reactivate subscription

### DELETE /newsletter/{id}
**Description:** Delete subscription

### GET /newsletter/count/active
**Description:** Count active subscriptions

### GET /newsletter/count/total
**Description:** Count all subscriptions

---

## Promotional Popups

### GET /promotional-popups
**Description:** Get all popups with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /promotional-popups/{id}
**Description:** Get popup by ID

### GET /promotional-popups/active
**Description:** Get active popups  
**Query Params:** `page`, `size`, `sort`

### GET /promotional-popups/type/{type}
**Description:** Get popups by type (BANNER, MODAL, CORNER)  
**Query Params:** `page`, `size`, `sort`

### GET /promotional-popups/current
**Description:** Get currently active popups

### GET /promotional-popups/current/type/{type}
**Description:** Get current popup by type

### GET /promotional-popups/expired
**Description:** Get expired popups

### GET /promotional-popups/scheduled
**Description:** Get scheduled popups

### POST /promotional-popups
**Description:** Create popup  
**Request Body:**
```json
{
  "title": "string",
  "titleAr": "string",
  "message": "string",
  "messageAr": "string",
  "image": "string",
  "ctaButtonText": "string",
  "ctaButtonTextAr": "string",
  "ctaLink": "string",
  "type": "ENTRY|NEWSLETTER|PROMOTIONAL",
  "isActive": true,
  "startDate": "2026-02-14T00:00:00",
  "endDate": "2026-02-28T23:59:59"
}
```

### PUT /promotional-popups/{id}
**Description:** Update popup

### PATCH /promotional-popups/{id}/status
**Description:** Toggle popup status

### DELETE /promotional-popups/{id}
**Description:** Delete popup

### GET /promotional-popups/count/type/{type}/active
**Description:** Count active popups by type

---

## Policies Management

### GET /policies
**Description:** Get all policies with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /policies/{id}
**Description:** Get policy by ID

### GET /policies/type/{type}
**Description:** Get policy by type (PRIVACY, TERMS, REFUND, SHIPPING)

### GET /policies/type/{type}/active
**Description:** Get active policy by type

### GET /policies/active
**Description:** Get active policies  
**Query Params:** `page`, `size`, `sort`

### GET /policies/all-active
**Description:** Get all active policies (no pagination)

### POST /policies
**Description:** Create policy  
**Request Body:**
```json
{
  "title": "string",
  "type": "PRIVACY|TERMS|REFUND|SHIPPING",
  "content": "string",
  "isActive": true
}
```

### PUT /policies/{id}
**Description:** Update policy

### PATCH /policies/{id}/status
**Description:** Toggle policy status

### DELETE /policies/{id}
**Description:** Delete policy

### GET /policies/count/active
**Description:** Count active policies

---

## Website Content Management

### GET /website-content
**Description:** Get all content with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /website-content/{id}
**Description:** Get content by ID

### GET /website-content/key/{key}
**Description:** Get content by key

### GET /website-content/section/{section}
**Description:** Get content by section

### GET /website-content/active
**Description:** Get active content  
**Query Params:** `page`, `size`, `sort`

### GET /website-content/section/{section}/all
**Description:** Get all contents by section

### GET /website-content/type/{type}
**Description:** Get content by type (TEXT, HTML, IMAGE, VIDEO)

### GET /website-content/search
**Description:** Search content  
**Query Params:** `keyword`, `page`, `size`, `sort`

### POST /website-content
**Description:** Create content  
**Request Body:**
```json
{
  "pageName": "string",
  "sectionName": "string",
  "contentType": "TEXT|IMAGE|HTML|VIDEO|URL",
  "contentValue": "string",
  "contentValueAr": "string",
  "displayOrder": 0,
  "isActive": true
}
```

### PUT /website-content/{id}
**Description:** Update content

### PUT /website-content/key/{key}
**Description:** Update content by key

### PATCH /website-content/{id}/status
**Description:** Toggle content status

### DELETE /website-content/{id}
**Description:** Delete content

### GET /website-content/count/section/{section}
**Description:** Count content by section

---

## Settings Management

### GET /settings
**Description:** Get all settings with pagination  
**Query Params:** `page`, `size`, `sort`

### GET /settings/{id}
**Description:** Get setting by ID

### GET /settings/key/{key}
**Description:** Get setting by key

### GET /settings/search
**Description:** Search settings  
**Query Params:** `keyword`, `page`, `size`, `sort`

### GET /settings/prefix/{prefix}
**Description:** Get settings by key prefix

### POST /settings
**Description:** Create setting  
**Request Body:**
```json
{
  "key": "string",
  "value": "string",
  "description": "string"
}
```

### PUT /settings/{id}
**Description:** Update setting

### PATCH /settings/key/{key}
**Description:** Update setting by key  
**Request Body:**
```json
{
  "value": "string"
}
```

### DELETE /settings/{id}
**Description:** Delete setting

---

## Notes

- **Authentication Required:** All admin dashboard endpoints require a valid Bearer token in the Authorization header
- **Admin Access Only:** Only registered admin users can login and access the dashboard - all authenticated users have full management access
- **Login First:** Use `/auth/login` to obtain a token before accessing any other admin endpoints
- **Token Expiry:** Tokens expire after a set period. Use `/auth/refresh` to get a new token
- All endpoints support CORS with `origins = "*"`
- Pagination parameters: `page` (0-based), `size` (items per page), `sort` (field,direction)
- Date format: ISO 8601 (e.g., "2026-02-14T10:30:00")
- All POST/PUT endpoints require valid request body as per the schema
- For public store access (no authentication), refer to WEBSITE_API.md

---

## Troubleshooting

### Order Creation Issues

**Error: "Insufficient stock for product X (Color: Y)"**

**Cause:** The selected color variant doesn't have enough stock.

**Solution:**
1. Check product color variants: `GET /products/{id}`
2. View the `colorVariants` array to see stock levels
3. Update stock for specific color: `PATCH /products/{id}/stock` or manage color variants
4. Query database directly:
   ```sql
   SELECT * FROM product_color_variants WHERE product_id = <id>;
   UPDATE product_color_variants SET stock_quantity = <qty> WHERE id = <variant_id>;
   ```

**Error: "Color variant not found: X for product: Y"**

**Cause:** The specified color doesn't exist for the product.

**Solution:**
1. List product's available colors: `GET /products/{id}`
2. Add missing color variant via product management
3. Ensure color name matches exactly (case-insensitive)

**Error: "orderId is required"**

**Cause:** Outdated DTO structure.

**Solution:** 
- For creating orders: Don't include `orderId` in orderItems
- For adding items to existing order: Use `POST /order-items/order/{orderId}` with orderId in URL

### Stock Management Best Practices

1. **Creating Products:** Always include at least one color variant with stock
2. **Updating Stock:** Update individual color variant stock, not the legacy product stockQuantity
3. **Order Cancellation:** Stock is automatically restored to the correct color variant
4. **Inventory Tracking:** Monitor stock at color variant level for accurate reporting

### Database Schema Reference

**Color Variants Table:**
```sql
CREATE TABLE product_color_variants (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    color VARCHAR(50) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    color_code VARCHAR(100),
    created_date TIMESTAMP,
    updated_date TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

