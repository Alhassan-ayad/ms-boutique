/**
 * YASSO Product Reviews Handler
 * 
 * This file handles loading and submitting product reviews on shop-details.html
 * Integrates with backend API for reviews and ratings.
 */

// ===========================
// Configuration
// ===========================
const REVIEWS_API_BASE_URL = window.YASSO_CONFIG?.API_BASE_URL || '/api';
let currentProductId = null;
let selectedRating = 0;

// ===========================
// Initialize Reviews
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  currentProductId = getProductIdFromUrl();
  
  if (currentProductId) {
    initializeReviewForm();
    loadProductReviews(currentProductId);
  }
});

/**
 * Get product ID from URL
 */
function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  return id ? parseInt(id, 10) : null;
}

/**
 * Initialize review form
 */
function initializeReviewForm() {
  setupRatingStars();
  setupReviewSubmit();
}

/**
 * Setup rating stars
 */
function setupRatingStars() {
  const ratingStars = document.querySelectorAll('.rating-select .stars a');
  
  ratingStars.forEach((star, index) => {
    star.addEventListener('click', (e) => {
      e.preventDefault();
      selectedRating = index + 1;
      
      // Update visual state
      ratingStars.forEach((s, i) => {
        if (i < selectedRating) {
          s.style.color = '#D3A334';
        } else {
          s.style.color = '#ddd';
        }
      });
      
      console.log('Rating selected:', selectedRating);
    });
    
    // Hover effect
    star.addEventListener('mouseenter', () => {
      ratingStars.forEach((s, i) => {
        if (i <= index) {
          s.style.color = '#D3A334';
        } else {
          s.style.color = '#ddd';
        }
      });
    });
  });
  
  // Reset on mouse leave
  const ratingContainer = document.querySelector('.rating-select .stars');
  if (ratingContainer) {
    ratingContainer.addEventListener('mouseleave', () => {
      ratingStars.forEach((s, i) => {
        if (i < selectedRating) {
          s.style.color = '#D3A334';
        } else {
          s.style.color = '#ddd';
        }
      });
    });
  }
}

/**
 * Setup review form submit
 */
function setupReviewSubmit() {
  const submitBtn = document.querySelector('.review-form .vs-btn');
  const reviewTextarea = document.querySelector('.review-form textarea');
  const nameInput = document.querySelector('.review-form input[type="text"]');
  const emailInput = document.querySelector('.review-form input[type="email"]');
  
  console.log('Review form elements:', {
    submitBtn: !!submitBtn,
    reviewTextarea: !!reviewTextarea,
    nameInput: !!nameInput,
    emailInput: !!emailInput
  });
  
  if (submitBtn) {
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      console.log('Review submit clicked - Current rating:', selectedRating);
      console.log('Review submit clicked - Product ID:', currentProductId);
      
      // Validate inputs
      if (!validateReviewForm(reviewTextarea, nameInput, emailInput)) {
        return;
      }
      
      // Prepare review data
      const reviewData = {
        productId: currentProductId,
        rating: selectedRating,
        customerName: nameInput.value.trim(),
        customerEmail: emailInput.value.trim(),
        isVisible: true
      };
      
      // Only include reviewText if provided (supports rating-only reviews)
      const reviewText = reviewTextarea.value.trim();
      if (reviewText) {
        reviewData.reviewText = reviewText;
      }
      
      // Submit review
      await submitReview(reviewData);
    });
  } else {
    console.error('Review submit button not found!');
  }
}

/**
 * Validate review form
 */
function validateReviewForm(reviewTextarea, nameInput, emailInput) {
  if (selectedRating === 0) {
    showNotification('Please select a rating', 'warning');
    return false;
  }
  
  // Note: reviewText is optional - customers can submit rating-only reviews
  
  if (!nameInput.value.trim()) {
    showNotification('Please enter your name', 'warning');
    nameInput.focus();
    return false;
  }
  
  if (!emailInput.value.trim()) {
    showNotification('Please enter your email', 'warning');
    emailInput.focus();
    return false;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value.trim())) {
    showNotification('Please enter a valid email address', 'warning');
    emailInput.focus();
    return false;
  }
  
  return true;
}

/**
 * Submit review to backend
 */
async function submitReview(reviewData) {
  try {
    console.log('Submitting review:', reviewData);
    showLoading('Submitting your review...');
    
    const response = await fetch(`${REVIEWS_API_BASE_URL}/product-reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    });
    
    console.log('Review submission response status:', response.status);
    
    hideLoading();
    
    if (response.ok) {
      const result = await response.json();
      console.log('Review submitted successfully:', result);
      
      // Show message based on whether it's rating-only or full review
      const message = reviewData.reviewText 
        ? 'Thank you for your review! It will be visible after admin approval.'
        : 'Thank you for your rating! It will be visible after admin approval.';
      
      showNotification(message, 'success');
      
      // Clear form
      clearReviewForm();
      
      // Note: Don't reload reviews immediately as the new review won't be visible until approved
    } else {
      let errorMessage = 'Failed to submit review';
      try {
        const errorData = await response.json();
        console.error('Review submission error data:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        const errorText = await response.text();
        console.error('Review submission error text:', errorText);
        errorMessage = errorText || errorMessage;
      }
      showNotification(errorMessage, 'error');
    }
  } catch (error) {
    hideLoading();
    console.error('Error submitting review:', error);
    showNotification('An error occurred while submitting your review. Please try again.', 'error');
  }
}

/**
 * Clear review form
 */
function clearReviewForm() {
  const reviewTextarea = document.querySelector('.review-form textarea');
  const nameInput = document.querySelector('.review-form input[type="text"]');
  const emailInput = document.querySelector('.review-form input[type="email"]');
  const checkbox = document.querySelector('.review-form input[type="checkbox"]');
  
  if (reviewTextarea) reviewTextarea.value = '';
  if (nameInput) nameInput.value = '';
  if (emailInput) emailInput.value = '';
  if (checkbox) checkbox.checked = false;
  
  // Reset rating
  selectedRating = 0;
  const ratingStars = document.querySelectorAll('.rating-select .stars a');
  ratingStars.forEach(star => {
    star.style.color = '#ddd';
  });
}

/**
 * Load product reviews from backend
 */
async function loadProductReviews(productId) {
  try {
    // Use /visible endpoint which returns approved and visible reviews as a plain array
    const response = await fetch(`${REVIEWS_API_BASE_URL}/product-reviews/product/${productId}/visible`);
    
    if (response.ok) {
      const reviews = await response.json();
      
      // Ensure reviews is an array
      if (Array.isArray(reviews)) {
        displayReviews(reviews);
        updateReviewCount(reviews.length);
      } else {
        console.error('Expected array but got:', reviews);
        displayNoReviews();
      }
    } else {
      console.error('Failed to load reviews');
      displayNoReviews();
    }
  } catch (error) {
    console.error('Error loading reviews:', error);
    displayNoReviews();
  }
}

/**
 * Display reviews
 */
function displayReviews(reviews) {
  const reviewsList = document.querySelector('.comment-list');
  const reviewTitle = document.querySelector('.vs-comments-wrap .inner-title');
  
  if (!reviewsList) return;
  
  if (reviews.length === 0) {
    displayNoReviews();
    return;
  }
  
  // Update title
  const productName = document.querySelector('.product-title')?.textContent || 'Product';
  if (reviewTitle) {
    reviewTitle.textContent = `Reviews for ${productName}`;
  }
  
  // Clear existing reviews
  reviewsList.innerHTML = '';
  
  // Add each review
  reviews.forEach(review => {
    const reviewHtml = createReviewHtml(review);
    reviewsList.innerHTML += reviewHtml;
  });
}

/**
 * Create review HTML
 */
function createReviewHtml(review) {
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  const date = new Date(review.createdDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Handle rating-only reviews (reviewText can be null or empty)
  const reviewTextHtml = review.reviewText 
    ? `<p class="text">${escapeHtml(review.reviewText)}</p>`
    : '<p class="text" style="color: #999; font-style: italic;">(Rating only - no comment)</p>';
  
  return `
    <li class="review vs-comment-item">
      <div class="vs-post-comment">
        <div class="comment-content">
          <div class="comment-content__header">
            <div class="star-rating" role="img" aria-label="Rated ${review.rating} out of 5" style="color: #D3A334; font-size: 16px;">
              ${stars}
            </div>
            <h4 class="name">${escapeHtml(review.customerName)}</h4>
            <span class="commented-on">${date}</span>
          </div>
          ${reviewTextHtml}
        </div>
      </div>
    </li>
  `;
}

/**
 * Display no reviews message
 */
function displayNoReviews() {
  const reviewsList = document.querySelector('.comment-list');
  const reviewTitle = document.querySelector('.vs-comments-wrap .inner-title');
  
  if (reviewsList) {
    const productName = document.querySelector('.product-title')?.textContent || 'Product';
    
    if (reviewTitle) {
      reviewTitle.textContent = `Reviews for ${productName}`;
    }
    
    reviewsList.innerHTML = `
      <li class="review vs-comment-item">
        <div class="vs-post-comment">
          <div class="comment-content">
            <p class="text" style="text-align: center; color: #999; padding: 20px;">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        </div>
      </li>
    `;
  }
}

/**
 * Update review count in tab
 */
function updateReviewCount(count) {
  const reviewTab = document.querySelector('#pills-contact-tab');
  if (reviewTab) {
    reviewTab.textContent = `review (${count})`;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `review-notification review-notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
    color: white;
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    font-size: 14px;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

/**
 * Show loading overlay
 */
function showLoading(message = 'Loading...') {
  let loader = document.getElementById('review-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'review-loader';
    loader.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
          <div class="spinner-border" role="status" style="color: #D3A334;">
            <span class="sr-only">Loading...</span>
          </div>
          <p style="margin-top: 15px; color: #333;">${message}</p>
        </div>
      </div>
    `;
    document.body.appendChild(loader);
  }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const loader = document.getElementById('review-loader');
  if (loader) {
    loader.remove();
  }
}

// Add CSS for animations
if (!document.getElementById('review-animation-styles')) {
  const style = document.createElement('style');
  style.id = 'review-animation-styles';
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
