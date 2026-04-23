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
    BLOG_PUBLISHED: '/blog-posts/published',
    BLOG_POST_BY_SLUG: '/blog-posts/slug',
    BLOG_RECENT: '/blog-posts/recent',
    BLOG_FEATURED: '/blog-posts/featured',
    
    // Policies
    POLICIES_ALL: '/policies/all-active',
    POLICIES_BY_TYPE: '/policies/type',
    
    // Website Content
    CONTENT_BY_KEY: '/website-content/key',
    CONTENT_BY_SECTION: '/website-content/section',
    
    // Promotional Popups
    POPUPS_CURRENT: '/promotional-popups/current',

    // Auth
    AUTH_LOGIN: '/auth/login',
    AUTH_REFRESH: '/auth/refresh',
    AUTH_VALIDATE: '/auth/validate'
  },

  // Auth storage keys
  AUTH_STORAGE: {
    ACCESS_TOKEN_KEY: 'yasso_access_token',
    REFRESH_TOKEN_KEY: 'yasso_refresh_token'
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
 * Build endpoint URL with query params.
 * @param {string} endpoint - API endpoint path
 * @param {Object} params - Query params object
 * @returns {string}
 */
window.YASSO_CONFIG.buildUrl = function(endpoint, params = {}) {
  const base = this.getApiUrl(endpoint);
  const url = new URL(base, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;

    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item !== null && item !== undefined && item !== '') {
          url.searchParams.append(key, item);
        }
      });
      return;
    }

    url.searchParams.append(key, value);
  });

  return url.toString();
};

window.YASSO_CONFIG.getAccessToken = function() {
  return localStorage.getItem(this.AUTH_STORAGE.ACCESS_TOKEN_KEY);
};

window.YASSO_CONFIG.getRefreshToken = function() {
  return localStorage.getItem(this.AUTH_STORAGE.REFRESH_TOKEN_KEY);
};

window.YASSO_CONFIG.setTokens = function(accessToken, refreshToken) {
  if (accessToken) {
    localStorage.setItem(this.AUTH_STORAGE.ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(this.AUTH_STORAGE.REFRESH_TOKEN_KEY, refreshToken);
  }
};

window.YASSO_CONFIG.clearTokens = function() {
  localStorage.removeItem(this.AUTH_STORAGE.ACCESS_TOKEN_KEY);
  localStorage.removeItem(this.AUTH_STORAGE.REFRESH_TOKEN_KEY);
};

window.YASSO_CONFIG.extractApiErrorMessage = function(errorPayload, fallbackMessage) {
  if (!errorPayload) return fallbackMessage;

  if (typeof errorPayload === 'string') {
    return errorPayload || fallbackMessage;
  }

  if (errorPayload.message) {
    return errorPayload.message;
  }

  if (errorPayload.error && typeof errorPayload.error === 'string') {
    return errorPayload.error;
  }

  if (errorPayload.errors && typeof errorPayload.errors === 'object') {
    const firstEntry = Object.entries(errorPayload.errors)[0];
    if (firstEntry && firstEntry[1]) {
      return `${firstEntry[0]}: ${firstEntry[1]}`;
    }
  }

  return fallbackMessage;
};

window.YASSO_CONFIG.refreshAccessToken = async function() {
  const refreshToken = this.getRefreshToken();
  if (!refreshToken) return null;

  const refreshUrl = this.getApiUrl(this.ENDPOINTS.AUTH_REFRESH);
  const response = await fetch(refreshUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    this.clearTokens();
    return null;
  }

  const payload = await response.json();
  if (payload?.token) {
    this.setTokens(payload.token, payload.refreshToken || refreshToken);
    return payload.token;
  }

  return null;
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
  const isFormData = options.body instanceof FormData || options.data instanceof FormData;
  const method = (options.method || 'GET').toUpperCase();
  const shouldRetryOn401 = options.retryOn401 !== false;

  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  if (!isFormData && !('Content-Type' in headers) && !('content-type' in headers) && method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  let requestBody = options.body;
  if (requestBody === undefined && options.data !== undefined) {
    requestBody = isFormData ? options.data : JSON.stringify(options.data);
  }

  if (options.requireAuth) {
    const token = this.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      method,
      headers,
      body: requestBody
    });

    if (response.status === 401 && shouldRetryOn401 && options.requireAuth) {
      const refreshedToken = await this.refreshAccessToken();
      if (refreshedToken) {
        return this.apiRequest(url, {
          ...options,
          retryOn401: false,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${refreshedToken}`
          }
        });
      }
    }
    
    if (!response.ok) {
      let errorPayload = null;
      try {
        const contentType = response.headers.get('content-type') || '';
        errorPayload = contentType.includes('application/json')
          ? await response.json()
          : await response.text();
      } catch (parseError) {}

      if (response.status === 404) {
        throw new Error(this.extractApiErrorMessage(errorPayload, this.ERROR_MESSAGES.NOT_FOUND));
      } else if (response.status >= 500) {
        throw new Error(this.extractApiErrorMessage(errorPayload, this.ERROR_MESSAGES.SERVER_ERROR));
      } else if (response.status >= 400) {
        throw new Error(this.extractApiErrorMessage(errorPayload, this.ERROR_MESSAGES.VALIDATION_ERROR));
      }
      throw new Error(this.ERROR_MESSAGES.GENERIC_ERROR);
    }

    if (response.status === 204 || method === 'HEAD') {
      return null;
    }

    const parseMode = options.parseAs || 'auto';
    if (parseMode === 'raw') {
      return response;
    }
    if (parseMode === 'text') {
      return await response.text();
    }

    const contentType = response.headers.get('content-type') || '';
    if (parseMode === 'json' || contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
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
