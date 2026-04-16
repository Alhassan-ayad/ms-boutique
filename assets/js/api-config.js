/**
 * YASSO API Configuration
 * 
 * Centralized API configuration for the website.
 * This file should be included before any other API-dependent scripts.
 */

// Normalize API base URL for HTTPS deployments.
function normalizeApiBaseUrl(baseUrl) {
  const fallback = '/api';
  if (!baseUrl || typeof baseUrl !== 'string') return fallback;

  const trimmed = baseUrl.trim();
  if (!trimmed) return fallback;

  // Keep relative API paths as-is.
  if (trimmed.startsWith('/')) {
    // Live/static servers on localhost:3000/3001 don't proxy /api by default.
    // In that case, point directly to Spring Boot backend on :8081.
    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isLocalDevPort = window.location.port === '3000' || window.location.port === '3001';
    if (isLocalHost && isLocalDevPort) {
      return `http://${window.location.hostname}:8081${trimmed}`;
    }
    return trimmed;
  }

  // If site is HTTPS but config still uses HTTP absolute URL, upgrade protocol.
  if (window.location.protocol === 'https:' && trimmed.startsWith('http://')) {
    return `https://${trimmed.slice('http://'.length)}`;
  }

  return trimmed;
}

// API Configuration
window.API_CONFIG = window.API_CONFIG || {};
window.API_CONFIG.BASE_URL = normalizeApiBaseUrl(window.API_CONFIG.BASE_URL || '/api');

window.YASSO_CONFIG = {
  // Base API URL - Change this to your production API URL
  API_BASE_URL: window.API_CONFIG.BASE_URL,
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 12,
  
  // Cache settings
  CACHE_ENABLED: true,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
  
  // Feature flags
  FEATURES: {
    SEARCH_ENABLED: true,
    FILTERS_ENABLED: true,
    REVIEWS_ENABLED: true,
    WISHLIST_ENABLED: false, // Not yet implemented
    GUEST_CHECKOUT: true
  },
  
  // API Endpoints
  ENDPOINTS: {
    // Products
    PRODUCTS_ACTIVE: '/products/active',
    PRODUCTS_FILTER: '/products/filter',
    PRODUCTS_CATEGORY: '/products/category',
    PRODUCTS_SEARCH: '/products/search',
    PRODUCTS_TOP_RATED: '/products/top-rated',
    PRODUCT_BY_ID: '/products',
    
    // Categories
    CATEGORIES_ALL: '/product-categories/all-active',
    CATEGORIES_TOP_LEVEL: '/product-categories/top-level',
    CATEGORIES_WITH_PRODUCTS: '/product-categories/with-products',
    
    // Reviews
    REVIEWS_BY_PRODUCT: '/product-reviews/product',
    REVIEWS_SUBMIT: '/product-reviews',
    
    // Orders
    ORDERS_CREATE: '/orders',
    ORDERS_BY_ID: '/orders',
    
    // Contact
    CONTACT_SUBMIT: '/contact-messages',
    
    // Newsletter
    NEWSLETTER_SUBSCRIBE: '/newsletter',
    NEWSLETTER_UNSUBSCRIBE: '/newsletter/unsubscribe',
    
    // Blog
    BLOG_POSTS: '/blog-posts',
    BLOG_POST_BY_SLUG: '/blog-posts/slug',
    BLOG_RECENT: '/blog-posts/recent',
    
    // Policies
    POLICIES_ALL: '/policies/all-active',
    POLICIES_BY_TYPE: '/policies/type',
    
    // Website Content
    CONTENT_BY_KEY: '/website-content/key',
    CONTENT_BY_SECTION: '/website-content/section',
    
    // Promotional Popups
    POPUPS_CURRENT: '/promotional-popups/current'
  },
  
  // Currency settings
  CURRENCY: {
    SYMBOL: 'EGP',
    CODE: 'EGP',
    POSITION: 'before' // 'before' or 'after'
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
    SERVER_ERROR: 'An error occurred on the server. Please try again later.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    PRODUCT_ADDED_TO_CART: 'Product added to cart successfully!',
    ORDER_PLACED: 'Your order has been placed successfully!',
    CONTACT_SENT: 'Your message has been sent. We\'ll get back to you soon!',
    NEWSLETTER_SUBSCRIBED: 'Thank you for subscribing to our newsletter!',
    REVIEW_SUBMITTED: 'Your review has been submitted and is pending approval.'
  }
};

/**
 * Build full API URL
 * @param {string} endpoint - Endpoint path
 * @returns {string} - Full URL
 */
window.YASSO_CONFIG.getApiUrl = function(endpoint) {
  return this.API_BASE_URL + endpoint;
};

/**
 * Format price with currency
 * @param {number} price - Price amount
 * @returns {string} - Formatted price
 */
window.YASSO_CONFIG.formatPrice = function(price) {
  const formatted = parseFloat(price).toFixed(2);
  if (this.CURRENCY.POSITION === 'before') {
    return `${this.CURRENCY.SYMBOL} ${formatted}`;
  } else {
    return `${formatted} ${this.CURRENCY.SYMBOL}`;
  }
};

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
window.YASSO_CONFIG.getCache = function(key) {
  if (!this.CACHE_ENABLED) return null;
  
  try {
    const cached = localStorage.getItem(`yasso_cache_${key}`);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const now = Date.now();
    
    if (now - data.timestamp > this.CACHE_DURATION) {
      localStorage.removeItem(`yasso_cache_${key}`);
      return null;
    }
    
    return data.value;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

/**
 * Set cached data
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 */
window.YASSO_CONFIG.setCache = function(key, value) {
  if (!this.CACHE_ENABLED) return;
  
  try {
    const data = {
      value: value,
      timestamp: Date.now()
    };
    localStorage.setItem(`yasso_cache_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
};

/**
 * Clear all cache
 */
window.YASSO_CONFIG.clearCache = function() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('yasso_cache_')) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Make API request with error handling
 * @param {string} url - API URL
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
window.YASSO_CONFIG.apiRequest = async function(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(this.ERROR_MESSAGES.NOT_FOUND);
      } else if (response.status >= 500) {
        throw new Error(this.ERROR_MESSAGES.SERVER_ERROR);
      } else if (response.status >= 400) {
        throw new Error(this.ERROR_MESSAGES.VALIDATION_ERROR);
      }
      throw new Error(this.ERROR_MESSAGES.GENERIC_ERROR);
    }
    
    return await response.json();
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error(this.ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
};

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Type: success, error, warning, info
 * @param {number} duration - Duration in milliseconds
 */
window.YASSO_CONFIG.showNotification = function(message, type = 'info', duration = 3000) {
  // Check if notification function exists
  if (typeof showNotification === 'function') {
    showNotification(message, type);
    return;
  }
  
  // Fallback: Create simple notification
  const notification = document.createElement('div');
  notification.className = `yasso-notification yasso-notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 9999;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease-out;
    max-width: 350px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, duration);
};

// Add notification CSS animations
const apiConfigStyle = document.createElement('style');
apiConfigStyle.textContent = `
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
document.head.appendChild(apiConfigStyle);

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.YASSO_CONFIG;
}
