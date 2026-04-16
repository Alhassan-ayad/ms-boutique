/**
 * YASSO Products Dynamic Data Handler
 * 
 * This file manages product data and rendering for the shop page.
 * Products are fetched from the backend API.
 * 
 * Backend API endpoints used:
 * - GET /api/products/active - Get paginated products
 * - GET /api/products/filter - Filter by color and price
 * - GET /api/products/category/{categoryId} - Filter by category
 * - GET /api/products/search - Search products
 */

// ===========================
// API Configuration
// ===========================
const API_BASE_URL = window.API_CONFIG?.BASE_URL || window.YASSO_CONFIG?.API_BASE_URL || '/api';
const DEFAULT_PAGE_SIZE = 12;

// Helper function to normalize image URLs - handles malformed backend responses
function normalizeImageUrl(url) {
  if (!url) return '';
  
  // If it's already a full URL (http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a base64 image, return as is
  if (url.startsWith('data:image/')) {
    return url;
  }
  
  // If it's a local asset, return as is
  if (url.startsWith('assets/')) {
    return url;
  }
  
  const BACKEND_URL = (window.API_CONFIG?.BASE_URL || '/api').replace('/api', '');
  
  // Standard format: /images/category/file.jpg (check FIRST!)
  if (url.startsWith('/images/')) {
    return BACKEND_URL + url;
  }
  
  // Missing leading slash but properly formatted
  if (url.startsWith('images/') && url.includes('/')) {
    return `${BACKEND_URL}/${url}`;
  }
  
  // Fix malformed paths ONLY if no slashes (e.g., "uploadsimagesloge53430a.jpg")
  if (url.includes('images') && !url.includes('/')) {
    const imagesIndex = url.indexOf('images');
    if (imagesIndex !== -1) {
      const afterImages = url.substring(imagesIndex + 6);
      
      const pathMatch = afterImages.match(/([a-z]+)([a-f0-9-]+\.(?:jpg|jpeg|png|gif|webp))/i);
      if (pathMatch) {
        const category = pathMatch[1];
        const filename = pathMatch[2];
        
        let fixedCategory = category;
        if (category === 'log' || category === 'logo') fixedCategory = 'logo';
        else if (category === 'pop' || category === 'popup') fixedCategory = 'popup';
        else if (category === 'cont' || category === 'content') fixedCategory = 'content';
        else if (category === 'blog') fixedCategory = 'blog';
        
        return `${BACKEND_URL}/images/${fixedCategory}/${filename}`;
      }
    }
  }
  
  // For any other path starting with /, prepend backend URL
  if (url.startsWith('/')) {
    return BACKEND_URL + url;
  }
  
  // Otherwise return as is
  return url;
}

// Global state
let currentPage = 0;
let lastLoadedProducts = []; // cache for re-render on language change
let lastLoadedTotal = 0;
let currentFilters = {
  colors: [],
  minPrice: null,
  maxPrice: null,
  categoryId: null,
  searchKeyword: null,
  sortBy: 'name',
  sortDirection: 'asc'
};
let totalElements = 0;
let totalPages = 0;

// ===========================
// API Functions
// ===========================

/**
 * Fetch products from backend API
 * @param {number} page - Page number (0-based)
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} - API response with products
 */
async function fetchProducts(page = 0, filters = {}) {
  try {
    let url = `${API_BASE_URL}/products/active?page=${page}&size=${DEFAULT_PAGE_SIZE}`;
    
    // Build sort parameter
    if (filters.sortBy) {
      const sortDir = filters.sortDirection || 'asc';
      url += `&sort=${filters.sortBy},${sortDir}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Cache the data for offline mode (non-fatal if storage quota is full)
    try {
      localStorage.setItem('yasso_products_cache', JSON.stringify(data.content));
    } catch (cacheError) {}
    
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Return cached data if API fails
    const cachedProducts = getFallbackProducts();
    return {
      content: cachedProducts,
      totalElements: cachedProducts.length,
      totalPages: Math.ceil(cachedProducts.length / DEFAULT_PAGE_SIZE),
      number: 0,
      size: DEFAULT_PAGE_SIZE
    };
  }
}

/**
 * Fetch filtered products from backend API
 * @param {number} page - Page number (0-based)
 * @param {Object} filters - Filter parameters (colors, minPrice, maxPrice)
 * @returns {Promise<Object>} - API response with filtered products
 */
async function fetchFilteredProducts(page = 0, filters = {}) {
  try {
    let url = `${API_BASE_URL}/products/filter?page=${page}&size=${DEFAULT_PAGE_SIZE}`;
    
    // Add color filters (multiple colors as separate parameters)
    if (filters.colors && filters.colors.length > 0) {
      filters.colors.forEach(color => {
        url += `&colors=${encodeURIComponent(color)}`;
      });
    }
    
    // Add price range filters
    if (filters.minPrice !== null && filters.minPrice !== undefined) {
      url += `&minPrice=${filters.minPrice}`;
    }
    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
      url += `&maxPrice=${filters.maxPrice}`;
    }
    
    // Add sort parameter
    if (filters.sortBy) {
      const sortDir = filters.sortDirection || 'asc';
      url += `&sort=${filters.sortBy},${sortDir}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching filtered products:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0
    };
  }
}

/**
 * Fetch products by category
 * @param {number} categoryId - Category ID
 * @param {number} page - Page number (0-based)
 * @returns {Promise<Object>} - API response with products
 */
async function fetchProductsByCategory(categoryId, page = 0) {
  try {
    const url = `${API_BASE_URL}/products/category/${categoryId}?page=${page}&size=${DEFAULT_PAGE_SIZE}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0
    };
  }
}

/**
 * Search products by keyword
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number (0-based)
 * @returns {Promise<Object>} - API response with products
 */
async function searchProducts(keyword, page = 0) {
  try {
    const url = `${API_BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${DEFAULT_PAGE_SIZE}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching products:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0
    };
  }
}

/**
 * Get fallback products for offline mode
 * @returns {Array} - Array of sample products
 */
function getFallbackProducts() {
  const cached = localStorage.getItem('yasso_products_cache');
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Sample data for development/offline mode
  return [
    {
      id: 1,
      name: "Triumph Bag",
      price: 755.00,
      images: [{imageUrl: "assets/img/product5/p-s-1-1.png", displayOrder: 1}],
      color: "Brown",
      description: "Crafted from finest leather for modern icons.",
      sku: "TB-001",
      stockQuantity: 10,
      averageRating: 4.5,
      totalReviewsCount: 12
    },
    {
      id: 2,
      name: "Classic Urban",
      price: 655.00,
      images: [{imageUrl: "assets/img/product5/p-s-1-2.png", displayOrder: 1}],
      color: "Gold",
      description: "Sophisticated style with modern comfort.",
      sku: "CU-002",
      stockQuantity: 5,
      averageRating: 4.8,
      totalReviewsCount: 8
    }
  ];
}

// ===========================
// Rendering Functions
// ===========================

/**
 * Get product main image URL
 * @param {Object} product - Product object
 * @returns {string} - Image URL
 */
function getProductImage(product) {
  // Handle different data structures
  if (product.images && product.images.length > 0) {
    // Sort by displayOrder and get first image
    const sortedImages = [...product.images].sort((a, b) => 
      (a.displayOrder || 0) - (b.displayOrder || 0)
    );
    const imageUrl = sortedImages[0].imageUrl || sortedImages[0].url;
    
    // Normalize and return the image URL
    if (imageUrl) {
      return normalizeImageUrl(imageUrl);
    }
  } else if (product.image) {
    // Check for single image property
    return normalizeImageUrl(product.image);
  }
  
  // Fallback to default product image
  return 'assets/img/products/product-1-1.jpg';
}

/**
 * Check if product is new (optional field from backend)
 * @param {Object} product - Product object
 * @returns {boolean}
 */
function isProductNew(product) {
  // Products created in last 30 days are considered "new"
  if (product.createdDate) {
    const createdDate = new Date(product.createdDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  }
  return product.isNew || false;
}

/**
 * Generate HTML for a single product card
 * @param {Object} product - Product data object
 * @returns {string} HTML string for product card
 */
function generateProductHTML(product) {
  const isNew = isProductNew(product);
  const newTag = isNew ? '<a href="#new" class="product-tag">new</a>' : '';
  const detailsUrl = `shop-details.html?id=${product.id}`;
  const imageUrl = getProductImage(product);
  
  // Get localized product name and description
  const productName = window.YassoI18n ? window.YassoI18n.getLocalizedField(product, 'name') : product.name;
  const productDesc = window.YassoI18n ? window.YassoI18n.getLocalizedField(product, 'description') : product.description;
  const isRTL = window.YassoI18n ? window.YassoI18n.isRTL() : false;
  
  // Check stock availability - support for color variants
  let inStock = false;
  if (product.colorVariants && product.colorVariants.length > 0) {
    // Check if any color variant has stock
    inStock = product.colorVariants.some(variant => variant.stockQuantity > 0);
  } else {
    // Fallback to totalStock or stockQuantity
    const totalStock = product.totalStock || product.stockQuantity || 0;
    inStock = totalStock > 0;
  }
  
  const outOfStockTag = !inStock ? '<span class="product-tag out-of-stock">Out of Stock</span>' : '';
  
  // Check if product has multiple color variants
  const hasColorVariants = product.colorVariants && product.colorVariants.length > 0;
  
  return `
    <div class="col-xl-4 col-lg-6 col-md-6">
      <div class="product-style2 version3" data-product-id="${product.id}" data-has-color-variants="${hasColorVariants}" onclick="window.location.href='${detailsUrl}'" style="cursor: pointer;" dir="${isRTL ? 'rtl' : 'ltr'}">
        <div class="product-action">
          <button class="product-action__btn" tabindex="0" onclick="event.stopPropagation(); quickView(${product.id})" title="Quick View">
            <svg width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.5273 6.363C17.8445 4.86967 15.1666 0 9.33323 0C3.4999 0 0.822011 4.86967 0.139122 6.363C0.0474519 6.56312 0 6.78066 0 7.00078C0 7.2209 0.0474519 7.43843 0.139122 7.63856C0.822011 9.13033 3.4999 14 9.33323 14C15.1666 14 17.8445 9.13033 18.5273 7.637C18.6188 7.4371 18.6662 7.21984 18.6662 7C18.6662 6.78016 18.6188 6.5629 18.5273 6.363ZM9.33323 12.4444C4.42779 12.4444 2.13879 8.27089 1.55546 7.00856C2.13879 5.72911 4.42779 1.55556 9.33323 1.55556C14.227 1.55556 16.5168 5.71122 17.111 7C16.5168 8.28878 14.227 12.4444 9.33323 12.4444Z" fill="#6D747B"></path>
              <path d="M9.33323 3.11145C8.56408 3.11145 7.8122 3.33953 7.17268 3.76685C6.53315 4.19416 6.0347 4.80152 5.74036 5.51213C5.44602 6.22273 5.36901 7.00465 5.51906 7.75902C5.66912 8.51339 6.0395 9.20633 6.58337 9.7502C7.12724 10.2941 7.82017 10.6645 8.57454 10.8145C9.32891 10.9646 10.1108 10.8875 10.8214 10.5932C11.532 10.2989 12.1394 9.80042 12.5667 9.16089C12.994 8.52137 13.2221 7.76949 13.2221 7.00034C13.2209 5.96932 12.8108 4.98088 12.0817 4.25184C11.3527 3.5228 10.3642 3.11269 9.33323 3.11145ZM9.33323 9.33367C8.87174 9.33367 8.42061 9.19683 8.0369 8.94044C7.65318 8.68405 7.35411 8.31963 7.17751 7.89327C7.0009 7.46691 6.9547 6.99775 7.04473 6.54513C7.13476 6.09251 7.35699 5.67675 7.68331 5.35042C8.00963 5.0241 8.42539 4.80187 8.87802 4.71184C9.33064 4.62181 9.79979 4.66802 10.2262 4.84462C10.6525 5.02122 11.0169 5.32029 11.2733 5.70401C11.5297 6.08772 11.6666 6.53885 11.6666 7.00034C11.6666 7.61918 11.4207 8.21267 10.9831 8.65026C10.5456 9.08784 9.95207 9.33367 9.33323 9.33367Z" fill="#6D747B"></path>
            </svg>
          </button>
        </div>
        ${newTag}
        ${outOfStockTag}
        <div class="product-img">
          <img class="img" src="${imageUrl}" alt="${productName}" onerror="this.src='assets/img/products/product-1-1.jpg'">
        </div>
        <div class="product-body">
        <h3 class="product-title">
          <a href="${detailsUrl}" onclick="event.stopPropagation();">${productName}</a>
        </h3>
        <span class="product-price">
          <span class="product-price__number">EGP ${product.price.toFixed(2)}</span>
          <button class="product-cart" tabindex="0" onclick="event.stopPropagation(); ${hasColorVariants ? `window.location.href='${detailsUrl}'` : `addToCart(${product.id})`}" ${!inStock ? 'disabled' : ''}>
            ${!inStock ? 'out of stock' : hasColorVariants ? 'select options' : 'add to cart'}
          </button>
        </span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render products to the page
 * @param {Array} products - Array of product objects
 */
function renderProducts(products) {
  const productsContainer = document.getElementById('productsContainer');
  
  
  if (!productsContainer) {
    console.error('Products container not found');
    return;
  }
  
  // Cache products for language-switch re-render
  lastLoadedProducts = products;

  // Clear existing products
  productsContainer.innerHTML = '';
  
  // Show loading state
  if (products.length === 0) {
    productsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <p class="fs-5 text-muted">No products found matching your filters.</p>
        <button class="vs-btn style4 mt-3" onclick="resetFilters()">Clear Filters</button>
      </div>
    `;
    return;
  }
  
  // Generate and insert product cards
  products.forEach(product => {
    productsContainer.innerHTML += generateProductHTML(product);
  });
  
}

/**
 * Load products main function
 * @param {number} page - Page number (0-based)
 * @param {Object} filters - Filter parameters
 */
async function loadProducts(page = 0, filters = null) {
  showLoadingState();
  
  // Use current filters if not provided
  const activeFilters = filters || currentFilters;
  currentPage = page;
  
  try {
    let data;
    
    // Check if we have any active filters
    const hasColorFilters = activeFilters.colors && activeFilters.colors.length > 0;
    const hasPriceFilters = activeFilters.minPrice !== null || activeFilters.maxPrice !== null;
    const hasSearch = activeFilters.searchKeyword;
    const hasCategory = activeFilters.categoryId;
    
    if (hasSearch) {
      // Search products
      data = await searchProducts(activeFilters.searchKeyword, page);
    } else if (hasCategory) {
      // Filter by category
      data = await fetchProductsByCategory(activeFilters.categoryId, page);
    } else if (hasColorFilters || hasPriceFilters) {
      // Apply filters
      data = await fetchFilteredProducts(page, activeFilters);
    } else {
      // Get all active products
      data = await fetchProducts(page, activeFilters);
    }
    
    // Update global state
    totalElements = data.totalElements || 0;
    totalPages = data.totalPages || 0;
    
    // Render products
    renderProducts(data.content || []);
    updateResultsCount(data.content?.length || 0, totalElements, page);
    updatePagination(page, totalPages);
    
  } catch (error) {
    console.error('Error loading products:', error);
    showErrorState();
  }
}

/**
 * Show loading state
 */
function showLoadingState() {
  const productsContainer = document.getElementById('productsContainer');
  if (productsContainer) {
    productsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading products...</p>
      </div>
    `;
  }
}

/**
 * Show error state
 */
function showErrorState() {
  const productsContainer = document.getElementById('productsContainer');
  if (productsContainer) {
    productsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <p class="fs-5 text-danger">Error loading products. Please try again.</p>
        <button class="vs-btn style4 mt-3" onclick="loadProducts()">Retry</button>
      </div>
    `;
  }
}

/**
 * Update the results count display
 * @param {number} showing - Number of products currently showing on this page
 * @param {number} total - Total number of products
 * @param {number} page - Current page number (0-based)
 */
function updateResultsCount(showing, total, page = 0) {
  lastLoadedTotal = total;
  const resultsCount = document.querySelector('.woocommerce-result-count');
  if (resultsCount) {
    const start = page * DEFAULT_PAGE_SIZE + 1;
    const end   = page * DEFAULT_PAGE_SIZE + showing;
    const isAr  = window.YassoI18n && window.YassoI18n.isRTL();
    resultsCount.innerHTML = isAr
      ? `<span>||</span> عرض ${start} - ${end} من ${total} نتيجة`
      : `<span>||</span> Showing ${start} - ${end} of ${total} results`;
  }
}

/**
 * Update pagination controls
 * @param {number} currentPageNum - Current page number (0-based)
 * @param {number} totalPagesNum - Total number of pages
 */
function updatePagination(currentPageNum, totalPagesNum) {
  const paginationContainer = document.querySelector('.vs-pagination ul');
  if (!paginationContainer) return;
  
  paginationContainer.innerHTML = '';
  
  // Show max 5 page numbers
  const maxPages = 5;
  let startPage = Math.max(0, currentPageNum - 2);
  let endPage = Math.min(totalPagesNum - 1, startPage + maxPages - 1);
  
  // Adjust if we're near the end
  if (endPage - startPage < maxPages - 1) {
    startPage = Math.max(0, endPage - maxPages + 1);
  }
  
  // Add first page if not visible
  if (startPage > 0) {
    paginationContainer.innerHTML += `<li><a href="#" onclick="goToPage(0); return false;">1</a></li>`;
    if (startPage > 1) {
      paginationContainer.innerHTML += `<li><a href="#">...</a></li>`;
    }
  }
  
  // Add page numbers
  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === currentPageNum ? 'class="active"' : '';
    paginationContainer.innerHTML += `
      <li ${activeClass}>
        <a href="#" onclick="goToPage(${i}); return false;">${i + 1}</a>
      </li>
    `;
  }
  
  // Add last page if not visible
  if (endPage < totalPagesNum - 1) {
    if (endPage < totalPagesNum - 2) {
      paginationContainer.innerHTML += `<li><a href="#">...</a></li>`;
    }
    paginationContainer.innerHTML += `
      <li>
        <a href="#" onclick="goToPage(${totalPagesNum - 1}); return false;">${totalPagesNum}</a>
      </li>
    `;
  }
  
  // Update prev/next buttons
  const prevBtn = document.querySelector('.vs-pagination .pagi-btn:first-child');
  const nextBtn = document.querySelector('.vs-pagination .pagi-btn:last-child');
  
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.preventDefault();
      if (currentPageNum > 0) {
        goToPage(currentPageNum - 1);
      }
    };
    prevBtn.style.opacity = currentPageNum === 0 ? '0.5' : '1';
    prevBtn.style.pointerEvents = currentPageNum === 0 ? 'none' : 'auto';
  }
  
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.preventDefault();
      if (currentPageNum < totalPagesNum - 1) {
        goToPage(currentPageNum + 1);
      }
    };
    nextBtn.style.opacity = currentPageNum === totalPagesNum - 1 ? '0.5' : '1';
    nextBtn.style.pointerEvents = currentPageNum === totalPagesNum - 1 ? 'none' : 'auto';
  }
}

/**
 * Go to specific page
 * @param {number} page - Page number (0-based)
 */
function goToPage(page) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadProducts(page, currentFilters);
}

// ===========================
// Filter & Sort Functions
// ===========================

/**
 * Apply filters to products
 * @param {Object} filters - Filter object with price, colors, etc.
 */
function applyFilters(filters) {
  
  // Update current filters
  currentFilters = {
    ...currentFilters,
    ...filters
  };
  
  // Reset to first page when applying filters
  loadProducts(0, currentFilters);
}

/**
 * Apply current filters based on UI state
 */
function applyCurrentFilters() {
  // Get price range values
  const minAmount = document.querySelector('#minAmount')?.textContent;
  const maxAmount = document.querySelector('#maxAmount')?.textContent;
  
  const minPrice = minAmount ? parseFloat(minAmount.replace('EGP', '').trim()) : null;
  const maxPrice = maxAmount ? parseFloat(maxAmount.replace('EGP', '').trim()) : null;
  
  // Get selected colors
  const selectedColors = [];
  document.querySelectorAll('#colorFiltersList input[type="checkbox"]:checked').forEach(checkbox => {
    selectedColors.push(checkbox.dataset.color);
  });
  
  applyFilters({
    minPrice: minPrice,
    maxPrice: maxPrice,
    colors: selectedColors
  });
}

/**
 * Reset all filters
 */
function resetFilters() {
  // Reset price slider
  const sliderRange = document.querySelector('#slider-range');
  if (sliderRange && typeof $ !== 'undefined' && $(sliderRange).slider) {
    $(sliderRange).slider('values', [0, 1000]);
  }
  
  // Uncheck all color checkboxes
  document.querySelectorAll('#colorFiltersList input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // Reset filters
  currentFilters = {
    colors: [],
    minPrice: null,
    maxPrice: null,
    categoryId: null,
    searchKeyword: null,
    sortBy: 'name',
    sortDirection: 'asc'
  };
  
  // Reload products
  loadProducts(0, currentFilters);
}

/**
 * Handle sorting
 * @param {string} sortBy - Sort criteria
 */
function handleSort(sortBy) {
  
  // Map sort options to API parameters
  const sortMap = {
    'popularity': { sortBy: 'totalReviewsCount', sortDirection: 'desc' },
    'rating': { sortBy: 'averageRating', sortDirection: 'desc' },
    'date': { sortBy: 'createdDate', sortDirection: 'desc' },
    'recent_product': { sortBy: 'averageRating', sortDirection: 'desc' },
    'price': { sortBy: 'price', sortDirection: 'asc' },
    'price-desc': { sortBy: 'price', sortDirection: 'desc' },
    'default': { sortBy: 'name', sortDirection: 'asc' }
  };
  
  const sortConfig = sortMap[sortBy] || sortMap['default'];
  
  applyFilters({
    ...currentFilters,
    ...sortConfig
  });
}

/**
 * Filter by category
 * @param {number} categoryId - Category ID
 */
function filterByCategory(categoryId) {
  currentFilters.categoryId = categoryId;
  loadProducts(0, currentFilters);
}

/**
 * Search products
 * @param {string} keyword - Search keyword
 */
function searchProductsByKeyword(keyword) {
  currentFilters.searchKeyword = keyword;
  loadProducts(0, currentFilters);
}

// ===========================
// Cart & Wishlist Functions
// ===========================

/**
 * Add product to cart
 * @param {number} productId - Product ID
 */
function addToCart(productId) {
  
  // Check if product has color variants - if so, redirect to details page
  // We need to check in our displayed products
  const productCard = document.querySelector(`[data-product-id="${productId}"]`);
  if (productCard) {
    // Get product from rendered list to check if it has color variants
    // For products with color variants, redirect to details page
    const detailsUrl = `shop-details.html?id=${productId}`;
    
    // Check if this product requires color selection (has multiple variants)
    // We'll add a data attribute to products that need color selection
    if (productCard.dataset.hasColorVariants === 'true') {
      window.location.href = detailsUrl;
      return;
    }
  }
  
  // Get current cart from localStorage
  let cart = JSON.parse(localStorage.getItem('yasso_cart') || '[]');
  
  // Check if product already in cart
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId: productId,
      quantity: 1,
      addedDate: new Date().toISOString()
    });
  }
  
  // Save cart
  localStorage.setItem('yasso_cart', JSON.stringify(cart));
  
  // Update cart count in header
  updateCartCount();
  
  // Dispatch custom event for global cart counter
  window.dispatchEvent(new Event('cartUpdated'));
  
  // Show notification
  showNotification('Product added to cart!', 'success');
}

/**
 * Update cart count in header
 */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('yasso_cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Update cart count in header
  const cartLinks = document.querySelectorAll('.wc-link');
  cartLinks.forEach(link => {
    link.textContent = `bag ${totalItems}`;
    // Keep the SVG icon
    const svg = link.querySelector('svg');
    if (svg) {
      link.innerHTML = `bag ${totalItems} ${svg.outerHTML}`;
    }
  });
}

/**
 * Add product to wishlist
 * @param {number} productId - Product ID
 */
function addToWishlist(productId) {
  // TODO: Implement wishlist functionality
  showNotification('Product added to wishlist!', 'success');
}

/**
 * Quick view product
 * @param {number} productId - Product ID
 */
function quickView(productId) {
  // Redirect to product details page for now
  window.location.href = `shop-details.html?id=${productId}`;
}

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning)
 */
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107'};
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 9999;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// ===========================
// Initialization
// ===========================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  
  // Check for URL parameters (category, search, etc.)
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('category');
  const searchKeyword = urlParams.get('search');
  
  if (categoryId) {
    currentFilters.categoryId = parseInt(categoryId);
  }
  if (searchKeyword) {
    currentFilters.searchKeyword = searchKeyword;
  }
  
  // Load products
  loadProducts(0, currentFilters);
  
  // Update cart count
  updateCartCount();
  
  // Setup filter button
  const filterBtn = document.querySelector('.filter-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', applyCurrentFilters);
  }
  
  // Setup color checkboxes
  const colorCheckboxes = document.querySelectorAll('#colorFiltersList input[type="checkbox"]');
  colorCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyCurrentFilters);
  });
  
  // Setup clear all button
  const clearBtn = document.querySelector('.reset-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', resetFilters);
  }
  
  // Setup sort dropdown
  const sortDropdown = document.querySelector('.orderby');
  if (sortDropdown) {
    sortDropdown.addEventListener('change', function() {
      handleSort(this.value);
    });
  }
  
  // Setup price slider if jQuery UI is available
  if (typeof $ !== 'undefined' && $.ui) {
    const sliderRange = $('#slider-range');
    if (sliderRange.length) {
      sliderRange.slider({
        range: true,
        min: 0,
        max: 2000,
        values: [0, 2000],
        slide: function(event, ui) {
          $('#minAmount').text('EGP ' + ui.values[0]);
          $('#maxAmount').text('EGP ' + ui.values[1]);
        }
      });
      $('#minAmount').text('EGP ' + sliderRange.slider('values', 0));
      $('#maxAmount').text('EGP ' + sliderRange.slider('values', 1));
    }
  }
  
});

// Add CSS for notifications
const productsStyle = document.createElement('style');
productsStyle.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .product-tag.out-of-stock {
    background: #dc3545;
    color: white;
    padding: 5px 10px;
    border-radius: 3px;
    font-size: 12px;
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
  }
  
  .vs-pagination ul li.active a {
    background: var(--theme-color, #C19D60);
    color: white;
    border-color: var(--theme-color, #C19D60);
  }
`;
document.head.appendChild(productsStyle);

// ===========================
// Re-render on language switch
// ===========================
window.addEventListener('languageChanged', function () {
  // Re-render product cards with the now-correct locale
  if (lastLoadedProducts.length > 0) {
    renderProducts(lastLoadedProducts);
    updateResultsCount(lastLoadedProducts.length, lastLoadedTotal, currentPage);
    // Run i18n over the freshly injected product HTML
    if (window.YassoI18n) {
      window.YassoI18n.translate(document.getElementById('productsContainer'));
    }
  }
});

// Export functions for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadProducts,
    renderProducts,
    addToCart,
    addToWishlist,
    quickView,
    applyFilters,
    handleSort,
    filterByCategory,
    searchProductsByKeyword,
    goToPage
  };
}
