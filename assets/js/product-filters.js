/**
 * YASSO Dynamic Product Filters
 * 
 * Fetches filter options (colors, price range) from backend database
 * and applies them to shop page filters
 */

const PRODUCT_FILTERS_API_BASE = window.API_CONFIG?.BASE_URL || '/api';
const apiRequest = window.YASSO_CONFIG?.apiRequest?.bind(window.YASSO_CONFIG);

// Filter state
let availableColors = [];
let priceRange = { min: 0, max: 1000 };
// Note: currentFilters is defined in products-data.js to avoid conflicts

/**
 * Initialize dynamic filters on page load
 */
async function initializeProductFilters() {
  try {
    // Fetch available colors from products
    await loadAvailableColors();
    
    // Fetch price range from products
    await loadPriceRange();
    
    // Setup filter event listeners
    setupFilterListeners();
    
  } catch (error) {
    console.error('❌ Error initializing filters:', error);
  }
}

/**
 * Fetch all unique colors from products in database
 */
async function loadAvailableColors() {
  try {
    // Fetch all active products
    const data = apiRequest
      ? await apiRequest(`${PRODUCT_FILTERS_API_BASE}/products/active?page=0&size=2000`)
      : await (await fetch(`${PRODUCT_FILTERS_API_BASE}/products/active?page=0&size=2000`)).json();
    const products = data.content || [];
    
    // Extract unique colors from direct color and color variants
    const colorsSet = new Set();
    products.forEach(product => {
      if (product.color) {
        colorsSet.add(product.color);
      }
      if (product.colorVariants && Array.isArray(product.colorVariants)) {
        product.colorVariants.forEach(variant => {
          if (variant.color && (variant.stockQuantity == null || variant.stockQuantity > 0)) {
            colorsSet.add(variant.color);
          }
        });
      }
    });
    
    availableColors = Array.from(colorsSet).sort();
    // Update color checkboxes in UI
    updateColorFilters();
    
    return availableColors;
  } catch (error) {
    console.error('❌ Error loading colors:', error);
    // Fallback to default colors
    availableColors = ['Black', 'Brown', 'Beige', 'Gold', 'Blue', 'Burgundy'];
    updateColorFilters();
    return availableColors;
  }
}

/**
 * Fetch minimum and maximum prices from products in database
 */
async function loadPriceRange() {
  try {
    // Fetch all active products to calculate min/max
    const data = apiRequest
      ? await apiRequest(`${PRODUCT_FILTERS_API_BASE}/products/active?page=0&size=1000`)
      : await (await fetch(`${PRODUCT_FILTERS_API_BASE}/products/active?page=0&size=1000`)).json();
    const products = data.content || [];
    
    if (products.length > 0) {
      const prices = products.map(p => p.price).filter(p => p != null && p > 0);
      priceRange.min = Math.floor(Math.min(...prices));
      priceRange.max = Math.ceil(Math.max(...prices));
    }
    
    // Initialize currentFilters with the full price range
    currentFilters.minPrice = priceRange.min;
    currentFilters.maxPrice = priceRange.max;
    
    // Update price range slider in UI
    updatePriceRangeFilter();
    
    return priceRange;
  } catch (error) {
    console.error('❌ Error loading price range:', error);
    // Fallback defaults
    priceRange = { min: 0, max: 1000 };
    updatePriceRangeFilter();
    return priceRange;
  }
}

/**
 * Update color filter checkboxes in the UI
 */
function updateColorFilters() {
  const colorFilterContainer = document.getElementById('colorFiltersList');
  if (!colorFilterContainer) {
    return;
  }
  
  // Clear existing checkboxes
  colorFilterContainer.innerHTML = '';
  
  // Create checkbox for each available color
  availableColors.forEach(color => {
    const li = document.createElement('li');
    const colorId = color.toLowerCase().replace(/\s+/g, '-');
    
    li.innerHTML = `
      <input type="checkbox" id="${colorId}" name="${colorId}" data-color="${color}">
      <label for="${colorId}">${color}</label>
      <span class="total">--</span>
    `;
    
    colorFilterContainer.appendChild(li);
  });
  
  // Update color counts
  updateProductColorCounts();

  // Translate color labels for the current language
  if (window.YassoI18n) {
    window.YassoI18n.translate(colorFilterContainer);
  }

  // Re-attach filter listeners now that the DOM was rebuilt
  colorFilterContainer.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      const color = this.dataset.color;
      if (this.checked) {
        if (!currentFilters.colors.includes(color)) currentFilters.colors.push(color);
      } else {
        currentFilters.colors = currentFilters.colors.filter(function (c) { return c !== color; });
      }
      applyFilters();
    });
  });

}

/**
 * Update product count for each color filter
 */
async function updateProductColorCounts() {
  try {
    // Fetch all active products
    const data = apiRequest
      ? await apiRequest(`${PRODUCT_FILTERS_API_BASE}/products/active?page=0&size=2000`)
      : await (await fetch(`${PRODUCT_FILTERS_API_BASE}/products/active?page=0&size=2000`)).json();
    const products = data.content || [];
    
    // Count products per color
    const colorCounts = {};
    products.forEach(product => {
      if (product.color) {
        colorCounts[product.color] = (colorCounts[product.color] || 0) + 1;
      }
      if (product.colorVariants && Array.isArray(product.colorVariants)) {
        product.colorVariants.forEach(variant => {
          if (variant.color && (variant.stockQuantity == null || variant.stockQuantity > 0)) {
            colorCounts[variant.color] = (colorCounts[variant.color] || 0) + 1;
          }
        });
      }
    });
    
    // Update count badges
    colorFilterContainer.querySelectorAll('input[type="checkbox"][data-color]').forEach(checkbox => {
      const color = checkbox.dataset.color;
      const badge = checkbox.parentElement.querySelector('.total');
      if (badge) {
        const count = colorCounts[color] || 0;
        badge.textContent = count.toString().padStart(2, '0');
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating color counts:', error);
  }
}

/**
 * Update price range slider/inputs in the UI
 */
function updatePriceRangeFilter() {
  // Update jQuery UI slider (used in main.js)
  const sliderRange = $('#slider-range');
  if (sliderRange.length) {
    try {
      // Destroy existing slider
      if (sliderRange.slider('instance')) {
        sliderRange.slider('destroy');
      }
      
      // Create new slider with database values
      sliderRange.slider({
        range: true,
        min: priceRange.min,
        max: priceRange.max,
        values: [priceRange.min, priceRange.max],
        slide: function(event, ui) {
          $('#minAmount').text('EGP ' + ui.values[0]);
          $('#maxAmount').text('EGP ' + ui.values[1]);
          currentFilters.minPrice = ui.values[0];
          currentFilters.maxPrice = ui.values[1];
        },
        change: function(event, ui) {
          applyFilters();
        }
      });
      
      // Update display
      $('#minAmount').text('EGP ' + priceRange.min);
      $('#maxAmount').text('EGP ' + priceRange.max);
      
    } catch (error) {
      // Ignore slider plugin errors and let manual inputs continue working.
    }
  }
  
  // Update manual input fields if they exist
  const minPriceInput = document.getElementById('minPrice') || document.getElementById('productMinPrice');
  const maxPriceInput = document.getElementById('maxPrice') || document.getElementById('productMaxPrice');
  
  if (minPriceInput) {
    minPriceInput.setAttribute('min', priceRange.min);
    minPriceInput.setAttribute('max', priceRange.max);
    minPriceInput.setAttribute('placeholder', `Min: $${priceRange.min}`);
  }
  
  if (maxPriceInput) {
    maxPriceInput.setAttribute('min', priceRange.min);
    maxPriceInput.setAttribute('max', priceRange.max);
    maxPriceInput.setAttribute('placeholder', `Max: $${priceRange.max}`);
  }
}

/**
 * Setup event listeners for filters
 */
function setupFilterListeners() {
  // Color checkbox listeners
  const colorCheckboxes = document.querySelectorAll('#colorFiltersList input[type="checkbox"]');
  colorCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const color = this.dataset.color;
      if (this.checked) {
        if (!currentFilters.colors.includes(color)) {
          currentFilters.colors.push(color);
        }
      } else {
        currentFilters.colors = currentFilters.colors.filter(c => c !== color);
      }
      applyFilters();
    });
  });
  
  // Filter button listener
  const filterBtn = document.querySelector('.filter-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', function(e) {
      e.preventDefault();
      applyFilters();
    });
  }
  
  // Search functionality
  const searchInput = document.querySelector('.header-search input[type="text"]');
  const searchButton = document.querySelector('.header-search button[type="submit"]');
  
  if (searchInput && searchButton) {
    searchButton.addEventListener('click', function(e) {
      e.preventDefault();
      const keyword = searchInput.value.trim();
      if (keyword) {
        currentFilters.searchKeyword = keyword;
        applyFilters();
      }
    });
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const keyword = this.value.trim();
        if (keyword) {
          currentFilters.searchKeyword = keyword;
          applyFilters();
        }
      }
    });
  }
  
  // Sorting dropdown listener
  const sortDropdown = document.querySelector('.woocommerce-ordering select.orderby');
  if (sortDropdown) {
    sortDropdown.addEventListener('change', function() {
      const sortValue = this.value;
      
      // Map dropdown values to API sort parameters
      switch(sortValue) {
        case 'recent_product':
        case 'rating':
          currentFilters.sortBy = 'averageRating';
          currentFilters.sortDirection = 'desc';
          break;
        case 'popularity':
          currentFilters.sortBy = 'totalReviewsCount';
          currentFilters.sortDirection = 'desc';
          break;
        case 'date':
          currentFilters.sortBy = 'createdDate';
          currentFilters.sortDirection = 'desc';
          break;
        case 'price':
          currentFilters.sortBy = 'price';
          currentFilters.sortDirection = 'asc';
          break;
        case 'price-desc':
          currentFilters.sortBy = 'price';
          currentFilters.sortDirection = 'desc';
          break;
        default:
          currentFilters.sortBy = 'name';
          currentFilters.sortDirection = 'asc';
      }
      
      applyFilters();
    });
  }
}

/**
 * Apply current filters and reload products
 */
async function applyFilters() {
  try {
    let url = `${PRODUCT_FILTERS_API_BASE}/products`;
    const params = new URLSearchParams();
    
    // Use search endpoint if keyword exists
    if (currentFilters.searchKeyword) {
      url = `${PRODUCT_FILTERS_API_BASE}/products/search`;
      params.append('keyword', currentFilters.searchKeyword);
    }
    // Use filter endpoint if colors or price range specified
    else if (currentFilters.colors.length > 0 || 
             (currentFilters.minPrice !== null && currentFilters.minPrice !== priceRange.min) || 
             (currentFilters.maxPrice !== null && currentFilters.maxPrice !== priceRange.max)) {
      url = `${PRODUCT_FILTERS_API_BASE}/products/filter`;
      
      // Add all color filters (supports multiple colors with OR logic)
      if (currentFilters.colors.length > 0) {
        currentFilters.colors.forEach(color => {
          params.append('colors', color);
        });
      }
      
      // Add price range filters (only if different from database range)
      if (currentFilters.minPrice !== null && currentFilters.minPrice !== priceRange.min) {
        params.append('minPrice', currentFilters.minPrice);
      }
      if (currentFilters.maxPrice !== null && currentFilters.maxPrice !== priceRange.max) {
        params.append('maxPrice', currentFilters.maxPrice);
      }
    }
    // Default to active products
    else {
      url = `${PRODUCT_FILTERS_API_BASE}/products/active`;
    }
    
    // Add pagination
    params.append('page', '0');
    params.append('size', '12');
    
    // Add sorting
    const sortBy = currentFilters.sortBy || 'name';
    const sortDir = currentFilters.sortDirection || 'asc';
    params.append('sort', `${sortBy},${sortDir}`);
    
    const fullUrl = `${url}?${params.toString()}`;
    const data = apiRequest
      ? await apiRequest(fullUrl)
      : await (await fetch(fullUrl)).json();
    const products = data.content || data;
    
    // Call renderProducts if it exists (from products-data.js)
    if (typeof renderProducts === 'function') {
      renderProducts(products);
    } else if (typeof displayProducts === 'function') {
      displayProducts(products);
    }
    
    // Update color counts after filtering
    updateProductColorCounts();
    
  } catch (error) {
    console.error('❌ Error applying filters:', error);
    alert('Failed to filter products. Please try again.');
  }
}

/**
 * Clear all filters
 */
function clearFilters() {
  currentFilters = {
    colors: [],
    minPrice: null,
    maxPrice: null,
    searchKeyword: null
  };
  
  // Uncheck all color checkboxes
  const colorCheckboxes = document.querySelectorAll('#colorFiltersList input[type="checkbox"]');
  colorCheckboxes.forEach(cb => cb.checked = false);
  
  // Reset price slider
  const priceSlider = document.getElementById('price-slider');
  if (priceSlider && priceSlider.noUiSlider) {
    priceSlider.noUiSlider.set([priceRange.min, priceRange.max]);
  }
  
  // Clear search input
  const searchInput = document.querySelector('.header-search input[type="text"]');
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Reload all products
  applyFilters();
  
}

// Initialize filters when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProductFilters);
} else {
  initializeProductFilters();
}

// Re-render color filters on language switch
window.addEventListener('languageChanged', function () {
  updateColorFilters();
});

// Export functions for external use
window.ProductFilters = {
  initialize: initializeProductFilters,
  applyFilters,
  clearFilters,
  loadAvailableColors,
  loadPriceRange,
  getCurrentFilters: () => currentFilters
};
