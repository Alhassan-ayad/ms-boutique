# Product Reviews API Documentation

**Base URL:** `http://localhost:8081/api`

---

## 📋 Overview

The Product Reviews API allows customers to rate and review products. Reviews support two modes:

1. **⭐ Rating Only** - Customers can submit just a star rating (1-5 stars)
2. **⭐ + 💬 Rating + Comment** - Customers can submit both a rating and a written review

All reviews require **admin approval** before being displayed publicly. This helps maintain quality and prevent spam.

---

## 🔑 Key Features

- ✅ **No Authentication Required** - Guests can submit reviews
- ✅ **Flexible Review Format** - Rating only OR rating + comment
- ✅ **Admin Moderation** - Reviews require approval before going live
- ✅ **Visibility Control** - Admins can show/hide individual reviews
- ✅ **Email Tracking** - Track reviews by customer email
- ✅ **Rating Filter** - Filter reviews by star rating
- ✅ **Automatic Stats** - Average rating and review count calculated automatically

---

## 📊 Review Structure

### Review Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productId` | Long | ✅ Required | ID of the product being reviewed |
| `customerName` | String | ✅ Required | Customer's name (max 100 chars) |
| `customerEmail` | Email | ✅ Required | Customer's email (max 100 chars) |
| `rating` | Integer | ✅ Required | Star rating (1-5) |
| `reviewText` | String | ❌ Optional | Written review comment (max 2000 chars) |
| `isVisible` | Boolean | ❌ Optional | Visibility flag (default: true) |

### Review Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Review ID |
| `productId` | Long | Product ID |
| `productName` | String | Product name |
| `customerName` | String | Customer name |
| `customerEmail` | String | Customer email |
| `rating` | Integer | Star rating (1-5) |
| `reviewText` | String | Review comment (null if rating-only) |
| `isApproved` | Boolean | Approval status |
| `isVisible` | Boolean | Visibility status |
| `createdDate` | DateTime | Review submission date |

---

## 🌐 Public Endpoints (No Authentication Required)

### GET /product-reviews/product/{productId}/visible
**Description:** Get all visible and approved reviews for a product (for display on product page)  
**Authentication:** None  

**Example Request:**
```http
GET http://localhost:8081/api/product-reviews/product/1/visible
```

**Example Response:**
```json
[
  {
    "id": 1,
    "productId": 1,
    "productName": "Leather Tote Bag",
    "customerName": "Sarah Johnson",
    "customerEmail": "sarah@example.com",
    "rating": 5,
    "reviewText": "Absolutely love this bag! The quality is outstanding and it fits all my daily essentials perfectly.",
    "isApproved": true,
    "isVisible": true,
    "createdDate": "2026-02-20T14:30:00"
  },
  {
    "id": 2,
    "productId": 1,
    "productName": "Leather Tote Bag",
    "customerName": "Michael Chen",
    "customerEmail": "michael@example.com",
    "rating": 4,
    "reviewText": null,
    "isApproved": true,
    "isVisible": true,
    "createdDate": "2026-02-21T10:15:00"
  }
]
```

**Note:** This endpoint returns a list (not paginated) of all visible reviews for easy frontend display.

---

### GET /product-reviews/product/{productId}/approved
**Description:** Get approved reviews for a product with pagination  
**Authentication:** None  

**Example Request:**
```http
GET http://localhost:8081/api/product-reviews/product/1/approved?page=0&size=10&sort=createdDate,desc
```

**Query Parameters:**
- `page` - Page number (0-indexed, default: 0)
- `size` - Items per page (default: 20)
- `sort` - Sort field and direction (e.g., `createdDate,desc` or `rating,desc`)

**Example Response:**
```json
{
  "content": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Leather Tote Bag",
      "customerName": "Sarah Johnson",
      "customerEmail": "sarah@example.com",
      "rating": 5,
      "reviewText": "Absolutely love this bag!",
      "isApproved": true,
      "isVisible": true,
      "createdDate": "2026-02-20T14:30:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 15,
  "totalPages": 2,
  "last": false
}
```

---

### POST /product-reviews
**Description:** Submit a product review (guest submission)  
**Authentication:** None  

#### Option 1: Rating Only Review

**Example Request:**
```http
POST http://localhost:8081/api/product-reviews
Content-Type: application/json

{
  "productId": 1,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "rating": 5
}
```

#### Option 2: Rating + Comment Review

**Example Request:**
```http
POST http://localhost:8081/api/product-reviews
Content-Type: application/json

{
  "productId": 1,
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "rating": 5,
  "reviewText": "This bag exceeded my expectations! The leather quality is superb and the craftsmanship is evident in every detail. Highly recommended!"
}
```

**Field Validation:**
- `productId` - Required (must exist)
- `customerName` - Required (1-100 characters)
- `customerEmail` - Required (valid email format, max 100 characters)
- `rating` - Required (integer between 1 and 5)
- `reviewText` - Optional (max 2000 characters)
- `isVisible` - Optional (default: true)

**Example Response:**
```json
{
  "id": 25,
  "productId": 1,
  "productName": "Leather Tote Bag",
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "rating": 5,
  "reviewText": "This bag exceeded my expectations!",
  "isApproved": false,
  "isVisible": true,
  "createdDate": "2026-02-25T10:00:00"
}
```

**Important Notes:**
- Reviews are **automatically set to `isApproved: false`**
- Admin approval is required before reviews appear publicly
- Customers will see a confirmation message but their review won't be visible until approved

---

### GET /product-reviews/product/{productId}/average-rating
**Description:** Get the average rating for a product  
**Authentication:** None  

**Example Request:**
```http
GET http://localhost:8081/api/product-reviews/product/1/average-rating
```

**Example Response:**
```json
4.7
```

**Note:** Returns only approved and visible reviews in the calculation. Returns `0.0` if no reviews exist.

---

### GET /product-reviews/count/product/{productId}
**Description:** Count total reviews for a product  
**Authentication:** None  

**Example Request:**
```http
GET http://localhost:8081/api/product-reviews/count/product/1
```

**Example Response:**
```json
24
```

---

### GET /product-reviews/customer/email/{email}
**Description:** Get all reviews by a specific customer email  
**Authentication:** None  

**Example Request:**
```http
GET http://localhost:8081/api/product-reviews/customer/email/john@example.com
```

**Example Response:**
```json
[
  {
    "id": 5,
    "productId": 1,
    "productName": "Leather Tote Bag",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "rating": 5,
    "reviewText": null,
    "isApproved": true,
    "isVisible": true,
    "createdDate": "2026-02-15T10:00:00"
  },
  {
    "id": 12,
    "productId": 3,
    "productName": "Crossbody Bag",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "rating": 4,
    "reviewText": "Great bag, very practical!",
    "isApproved": true,
    "isVisible": true,
    "createdDate": "2026-02-18T15:30:00"
  }
]
```

**Use Case:** Allow customers to see their review history

---

## 🔐 Admin Endpoints (Authentication Required)

**All admin endpoints require a valid JWT token in the Authorization header:**
```http
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

---

### GET /product-reviews
**Description:** Get all reviews (recent first) with pagination  
**Authentication:** Required (Admin)  

**Example Request:**
```http
GET http://localhost:8081/api/product-reviews?page=0&size=20&sort=createdDate,desc
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Query Parameters:**
- `page` - Page number (0-indexed)
- `size` - Items per page
- `sort` - Sort criteria

---

### GET /product-reviews/{id}
**Description:** Get a single review by ID  
**Authentication:** Required (Admin)  

**Example Request:**
```http
GET http://localhost:8081/api/product-reviews/25
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

---

### GET /product-reviews/product/{productId}
**Description:** Get all reviews for a product (including pending)  
**Authentication:** Required (Admin)  

**Example Request:**
```http
GET http://localhost:8081/api/product-reviews/product/1?page=0&size=20
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Query Parameters:**
- `page` - Page number
- `size` - Items per page
- `sort` - Sort criteria

**Note:** Unlike the public endpoint, this returns ALL reviews regardless of approval status.

---

### GET /product-reviews/pending
**Description:** Get all pending (unapproved) reviews  
**Authentication:** Required (Admin)  

**Example Request:**
```http
GET http://localhost:8081/api/product-reviews/pending?page=0&size=20
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Response:**
```json
{
  "content": [
    {
      "id": 30,
      "productId": 2,
      "productName": "Crossbody Bag",
      "customerName": "Emily Brown",
      "customerEmail": "emily@example.com",
      "rating": 5,
      "reviewText": "Perfect size for everyday use!",
      "isApproved": false,
      "isVisible": true,
      "createdDate": "2026-02-25T09:45:00"
    },
    {
      "id": 29,
      "productId": 1,
      "productName": "Leather Tote Bag",
      "customerName": "David Wilson",
      "customerEmail": "david@example.com",
      "rating": 4,
      "reviewText": null,
      "isApproved": false,
      "isVisible": true,
      "createdDate": "2026-02-25T08:30:00"
    }
  ],
  "totalElements": 2,
  "totalPages": 1
}
```

**Use Case:** Admin moderation dashboard to review and approve new submissions

---

### GET /product-reviews/count/pending
**Description:** Count pending reviews (for badge/notification)  
**Authentication:** Required (Admin)  

**Example Request:**
```http
GET http://localhost:8081/api/product-reviews/count/pending
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Response:**
```json
7
```

---

### GET /product-reviews/rating/{rating}
**Description:** Get reviews by specific rating  
**Authentication:** Required (Admin)  

**Example Request:**
```http
GET http://localhost:8081/api/product-reviews/rating/5?productId=1&page=0&size=20
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Query Parameters:**
- `productId` - Product ID (required)
- `page` - Page number
- `size` - Items per page
- `sort` - Sort criteria

**Example Response:**
```json
{
  "content": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Leather Tote Bag",
      "customerName": "Sarah Johnson",
      "customerEmail": "sarah@example.com",
      "rating": 5,
      "reviewText": "Absolutely love this bag!",
      "isApproved": true,
      "isVisible": true,
      "createdDate": "2026-02-20T14:30:00"
    }
  ]
}
```

---

### GET /product-reviews/customer/name/{customerName}
**Description:** Search reviews by customer name  
**Authentication:** Required (Admin)  

**Example Request:**
```http
GET http://localhost:8081/api/product-reviews/customer/name/John?page=0&size=20
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Note:** Performs case-insensitive partial match (e.g., "John" matches "John Doe", "Johnny Smith")

---

### PUT /product-reviews/{id}
**Description:** Update a review  
**Authentication:** Required (Admin)  

**Example Request:**
```http
PUT http://localhost:8081/api/product-reviews/25
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
Content-Type: application/json

{
  "productId": 1,
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "rating": 5,
  "reviewText": "Updated review text - This bag is amazing!",
  "isVisible": true
}
```

**Note:** All fields except `id`, `isApproved`, and `createdDate` can be updated.

---

### PATCH /product-reviews/{id}/approve
**Description:** Approve a pending review  
**Authentication:** Required (Admin)  

**Example Request:**
```http
PATCH http://localhost:8081/api/product-reviews/25/approve
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Response:**
```json
{
  "id": 25,
  "productId": 1,
  "productName": "Leather Tote Bag",
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "rating": 5,
  "reviewText": "This bag exceeded my expectations!",
  "isApproved": true,
  "isVisible": true,
  "createdDate": "2026-02-25T10:00:00"
}
```

**Effect:** Review becomes visible on the product page (if `isVisible` is also true).

---

### PATCH /product-reviews/{id}/reject
**Description:** Reject/unapprove a review  
**Authentication:** Required (Admin)  

**Example Request:**
```http
PATCH http://localhost:8081/api/product-reviews/25/reject
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Effect:** Sets `isApproved` to `false`. Review will not be visible publicly.

---

### PATCH /product-reviews/{id}/visibility
**Description:** Toggle review visibility (show/hide)  
**Authentication:** Required (Admin)  

**Example Request:**
```http
PATCH http://localhost:8081/api/product-reviews/25/visibility
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Response:**
```json
{
  "id": 25,
  "productId": 1,
  "productName": "Leather Tote Bag",
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "rating": 5,
  "reviewText": "This bag exceeded my expectations!",
  "isApproved": true,
  "isVisible": false,
  "createdDate": "2026-02-25T10:00:00"
}
```

**Use Case:** Temporarily hide a review without rejecting it (e.g., for content updates).

---

### DELETE /product-reviews/{id}
**Description:** Permanently delete a review  
**Authentication:** Required (Admin)  

**Example Request:**
```http
DELETE http://localhost:8081/api/product-reviews/25
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Response:** `204 No Content`

**Warning:** This action is permanent and cannot be undone.

---

## 🎯 Frontend Implementation Guide

### 1. Display Product Reviews

```javascript
// Fetch visible reviews for a product
async function loadProductReviews(productId) {
  try {
    const response = await fetch(
      `http://localhost:8081/api/product-reviews/product/${productId}/visible`
    );
    const reviews = await response.json();
    
    // Check if reviews is an array
    if (!Array.isArray(reviews)) {
      console.error('Expected array but got:', reviews);
      return [];
    }
    
    displayReviews(reviews);
  } catch (error) {
    console.error('Error loading reviews:', error);
  }
}

function displayReviews(reviews) {
  const container = document.getElementById('reviews-container');
  
  if (reviews.length === 0) {
    container.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
    return;
  }
  
  container.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <div class="customer-info">
          <strong>${escapeHtml(review.customerName)}</strong>
          <span class="review-date">${formatDate(review.createdDate)}</span>
        </div>
        <div class="rating">
          ${renderStars(review.rating)}
        </div>
      </div>
      ${review.reviewText ? `
        <div class="review-text">
          <p>${escapeHtml(review.reviewText)}</p>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function renderStars(rating) {
  const fullStars = '★'.repeat(rating);
  const emptyStars = '☆'.repeat(5 - rating);
  return `<span class="stars">${fullStars}${emptyStars}</span>`;
}
```

### 2. Submit Review Form (Rating Only)

```html
<div class="review-form">
  <h3>Rate This Product</h3>
  
  <div class="star-rating">
    <input type="radio" id="star5" name="rating" value="5" required>
    <label for="star5">★</label>
    <input type="radio" id="star4" name="rating" value="4">
    <label for="star4">★</label>
    <input type="radio" id="star3" name="rating" value="3">
    <label for="star3">★</label>
    <input type="radio" id="star2" name="rating" value="2">
    <label for="star2">★</label>
    <input type="radio" id="star1" name="rating" value="1">
    <label for="star1">★</label>
  </div>
  
  <input type="text" id="customerName" placeholder="Your Name" required>
  <input type="email" id="customerEmail" placeholder="Your Email" required>
  
  <button onclick="submitRating()">Submit Rating</button>
</div>

<script>
async function submitRating() {
  const rating = document.querySelector('input[name="rating"]:checked')?.value;
  const customerName = document.getElementById('customerName').value;
  const customerEmail = document.getElementById('customerEmail').value;
  
  if (!rating || !customerName || !customerEmail) {
    alert('Please fill in all required fields and select a rating');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:8081/api/product-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: currentProductId,
        customerName,
        customerEmail,
        rating: parseInt(rating)
      })
    });
    
    if (response.ok) {
      alert('Thank you for your rating! It will be visible after admin approval.');
      // Reset form
      document.querySelector('form').reset();
    } else {
      alert('Failed to submit rating. Please try again.');
    }
  } catch (error) {
    console.error('Error submitting rating:', error);
    alert('An error occurred. Please try again.');
  }
}
</script>
```

### 3. Submit Review Form (Rating + Comment)

```html
<div class="review-form">
  <h3>Write a Review</h3>
  
  <div class="star-rating">
    <input type="radio" id="star5" name="rating" value="5" required>
    <label for="star5">★</label>
    <input type="radio" id="star4" name="rating" value="4">
    <label for="star4">★</label>
    <input type="radio" id="star3" name="rating" value="3">
    <label for="star3">★</label>
    <input type="radio" id="star2" name="rating" value="2">
    <label for="star2">★</label>
    <input type="radio" id="star1" name="rating" value="1">
    <label for="star1">★</label>
  </div>
  
  <input type="text" id="customerName" placeholder="Your Name" required>
  <input type="email" id="customerEmail" placeholder="Your Email" required>
  
  <textarea 
    id="reviewText" 
    placeholder="Share your experience with this product (optional)" 
    maxlength="2000"
    rows="4"
  ></textarea>
  
  <button onclick="submitReview()">Submit Review</button>
</div>

<script>
async function submitReview() {
  const rating = document.querySelector('input[name="rating"]:checked')?.value;
  const customerName = document.getElementById('customerName').value;
  const customerEmail = document.getElementById('customerEmail').value;
  const reviewText = document.getElementById('reviewText').value.trim();
  
  if (!rating || !customerName || !customerEmail) {
    alert('Please fill in all required fields and select a rating');
    return;
  }
  
  const reviewData = {
    productId: currentProductId,
    customerName,
    customerEmail,
    rating: parseInt(rating)
  };
  
  // Only include reviewText if provided
  if (reviewText) {
    reviewData.reviewText = reviewText;
  }
  
  try {
    const response = await fetch('http://localhost:8081/api/product-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    
    if (response.ok) {
      alert('Thank you for your review! It will be visible after admin approval.');
      document.querySelector('form').reset();
    } else {
      const error = await response.json();
      alert(`Failed to submit review: ${error.message || 'Please try again'}`);
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('An error occurred. Please try again.');
  }
}
</script>
```

### 4. React Component Example

```jsx
import React, { useState, useEffect } from 'react';

function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8081/api/product-reviews/product/${productId}/visible`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load reviews');
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setReviews(data);
      } else {
        console.error('Expected array but got:', data);
        setReviews([]);
      }
    } catch (err) {
      setError(err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="product-reviews">
      <h3>Customer Reviews ({reviews.length})</h3>
      
      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to review!</p>
      ) : (
        <div className="reviews-list">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="review-card">
      <div className="review-header">
        <div>
          <strong>{review.customerName}</strong>
          <span className="review-date">
            {new Date(review.createdDate).toLocaleDateString()}
          </span>
        </div>
        <div className="rating">
          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
        </div>
      </div>
      {review.reviewText && (
        <p className="review-text">{review.reviewText}</p>
      )}
    </div>
  );
}

export default ProductReviews;
```

### 5. Admin Moderation Dashboard

```jsx
function ReviewModerationDashboard() {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingReviews();
  }, []);

  const loadPendingReviews = async () => {
    try {
      const response = await fetch(
        'http://localhost:8081/api/product-reviews/pending?page=0&size=50',
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );
      const data = await response.json();
      setPendingReviews(data.content || []);
    } catch (error) {
      console.error('Error loading pending reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (reviewId) => {
    try {
      await fetch(
        `http://localhost:8081/api/product-reviews/${reviewId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );
      loadPendingReviews(); // Refresh list
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const rejectReview = async (reviewId) => {
    try {
      await fetch(
        `http://localhost:8081/api/product-reviews/${reviewId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );
      loadPendingReviews(); // Refresh list
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  return (
    <div className="moderation-dashboard">
      <h2>Pending Reviews ({pendingReviews.length})</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : pendingReviews.length === 0 ? (
        <p>No pending reviews</p>
      ) : (
        <div className="pending-reviews">
          {pendingReviews.map(review => (
            <div key={review.id} className="review-card pending">
              <div className="review-header">
                <div>
                  <strong>{review.productName}</strong>
                  <span> - {review.customerName}</span>
                </div>
                <div className="rating">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              
              {review.reviewText ? (
                <p className="review-text">{review.reviewText}</p>
              ) : (
                <p className="no-comment"><em>(Rating only - no comment)</em></p>
              )}
              
              <div className="review-meta">
                <span>{review.customerEmail}</span>
                <span>{new Date(review.createdDate).toLocaleString()}</span>
              </div>
              
              <div className="actions">
                <button 
                  className="approve-btn"
                  onClick={() => approveReview(review.id)}
                >
                  ✓ Approve
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => rejectReview(review.id)}
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Display Statistics

### Show Average Rating and Review Count

```javascript
async function loadProductStats(productId) {
  try {
    // Fetch average rating
    const ratingResponse = await fetch(
      `http://localhost:8081/api/product-reviews/product/${productId}/average-rating`
    );
    const averageRating = await ratingResponse.json();
    
    // Fetch review count
    const countResponse = await fetch(
      `http://localhost:8081/api/product-reviews/count/product/${productId}`
    );
    const reviewCount = await countResponse.json();
    
    // Display stats
    document.getElementById('average-rating').textContent = averageRating.toFixed(1);
    document.getElementById('review-count').textContent = reviewCount;
    document.getElementById('star-display').innerHTML = renderStars(Math.round(averageRating));
    
  } catch (error) {
    console.error('Error loading product stats:', error);
  }
}

// Display example
<div class="product-stats">
  <div class="rating-summary">
    <div id="star-display" class="stars"></div>
    <span id="average-rating">0.0</span>
    <span>(<span id="review-count">0</span> reviews)</span>
  </div>
</div>
```

---

## 🚨 Error Handling

### Common Errors and Solutions

**Error: "reviews.forEach is not a function"**
```javascript
// ❌ Wrong - assuming data is always an array
reviews.forEach(review => {});

// ✅ Correct - check if data is an array first
if (Array.isArray(reviews)) {
  reviews.forEach(review => {});
} else {
  console.error('Expected array but got:', reviews);
}
```

**Error: "Product not found"**
```json
{
  "error": "Product not found with id: 999"
}
```
Solution: Verify the productId exists before submitting review.

**Error: "Rating must be between 1 and 5"**
```json
{
  "error": "Rating must be between 1 and 5"
}
```
Solution: Validate rating input before submission.

**Error: "Invalid email format"**
```json
{
  "email": "Invalid email format"
}
```
Solution: Use proper email validation in the form.

---

## ✅ Validation Rules

| Field | Validation |
|-------|-----------|
| `productId` | Must exist in database |
| `customerName` | 1-100 characters, required |
| `customerEmail` | Valid email format, max 100 chars, required |
| `rating` | Integer 1-5, required |
| `reviewText` | Max 2000 characters, optional |
| `isVisible` | Boolean, optional (default: true) |

---

## 🎨 CSS Styling Example

```css
.review-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.rating .stars {
  color: #ffa41c;
  font-size: 18px;
  letter-spacing: 2px;
}

.review-text {
  color: #333;
  line-height: 1.6;
  margin: 12px 0;
}

.review-date {
  color: #666;
  font-size: 14px;
  margin-left: 8px;
}

.star-rating {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
}

.star-rating input {
  display: none;
}

.star-rating label {
  font-size: 32px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star-rating input:checked ~ label,
.star-rating label:hover,
.star-rating label:hover ~ label {
  color: #ffa41c;
}

.no-comment {
  color: #999;
  font-style: italic;
}
```

---

## 📝 Summary

### Review Types Supported:
1. ⭐ **Rating Only** - Quick star rating (1-5)
2. ⭐💬 **Full Review** - Rating + written comment

### Key Features:
- ✅ Guest submission (no login required)
- ✅ Admin approval required
- ✅ Visibility control per review
- ✅ Automatic statistics calculation
- ✅ Email-based review tracking
- ✅ Rating filter support

### Best Practices:
- Always validate that reviews is an array before using `.forEach()`
- Show user confirmation after submission
- Display approval status clearly
- Handle errors gracefully
- Implement proper form validation
- Sanitize user input before display

---

## 🔗 Related Documentation

- [Product API Documentation](WEBSITE_API.md#product-reviews)
- [Admin Dashboard API](ADMIN_DASHBOARD_API.md#product-reviews)
- [Arabic Support Guide](ARABIC_SUPPORT_API_REFERENCE.md)

---

**Base URL:** `http://localhost:8081/api`  
**Admin Authentication:** Bearer token required for admin endpoints  
**Public Endpoints:** No authentication required
