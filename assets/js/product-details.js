/**
 * YASSO Product Details Handler
 * 
 * This file handles loading and displaying individual product details
 * on the shop-details.html page based on URL parameters.
 * Products are loaded from the backend API.
 */

// API Configuration
const API_BASE_URL = window.YASSO_CONFIG?.API_BASE_URL || '/api';

// Placeholder image URL for products without images
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e0e0e0" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E';

// Cache for product data
let currentProduct = null;

/**
 * Get product ID from URL parameters
 * @returns {string|null} Product ID or null if not found
 */
function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

/**
 * Load product details from backend API
 * @param {number} productId - Product ID
 * @returns {Object|null} Product data or null
 */
async function loadProductDetails(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    
    if (!response.ok) {
      console.error('Product not found:', response.status);
      showProductNotFound();
      return null;
    }
    
    const product = await response.json();
    console.log('Loaded product from API:', product);
    currentProduct = product;
    return product;
  } catch (error) {
    console.error('Error loading product:', error);
    showProductNotFound();
    return null;
  }
}

/**
 * Update page title with product name
 * @param {Object} product - Product data object
 */
function updatePageTitle(product) {
  // Get localized product name
  const productName = window.YassoI18n ? window.YassoI18n.getLocalizedField(product, 'name') : product.name;
  const isRTL = window.YassoI18n ? window.YassoI18n.isRTL() : false;
  
  const titleElement = document.querySelector('.product-title');
  if (titleElement) {
    titleElement.textContent = productName;
    titleElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }
  
  // Update browser title
  document.title = `${productName} - YASSO`;
  
  // Update review title
  const reviewTitle = document.querySelector('.inner-title');
  if (reviewTitle) {
    reviewTitle.textContent = `review for ${productName}`;
  }
}

/**
 * Update product price and stock status
 * @param {Object} product - Product data object
 */
function updateProductPrice(product) {
  const priceElement = document.querySelector('.product-price');
  if (priceElement) {
    const t = (s) => window.YassoI18n?.t ? window.YassoI18n.t(s) : s;
    // Calculate total stock from color variants
    const totalStock = product.totalStock || product.stockQuantity || 0;
    const inStock = totalStock > 0;
    const stockText = inStock ? t('in stock') : t('out of stock');
    priceElement.innerHTML = `EGP ${product.price.toFixed(2)} <span>${stockText}</span>`;
  }
}

/**
 * Update color variants display
 * @param {Object} product - Product data object
 */
function updateColorVariants(product) {
  const swatchesContainer = document.querySelector('.product-swatches-container');
  if (!swatchesContainer) return;
  
  // Clear existing swatches
  swatchesContainer.innerHTML = '';
  
  if (product.colorVariants && product.colorVariants.length > 0) {
    // Create color selection UI
    const colorSelectorDiv = document.createElement('div');
    colorSelectorDiv.className = 'color-selector';
    const t = (s) => window.YassoI18n?.t ? window.YassoI18n.t(s) : s;
    const isRTL = window.YassoI18n ? window.YassoI18n.isRTL() : false;
    colorSelectorDiv.innerHTML = `<label dir="${isRTL ? 'rtl' : 'ltr'}">${t('Select Color:')} <span class="selected-color-name"></span></label>`;
    
    const swatchesDiv = document.createElement('div');
    swatchesDiv.className = 'color-swatches';
    
    product.colorVariants.forEach((variant, index) => {
      const swatch = document.createElement('div');
      swatch.className = `color-swatch ${index === 0 ? 'active' : ''}`;
      swatch.style.backgroundColor = variant.colorCode || '#000';
      swatch.title = `${variant.color} (${variant.stockQuantity} in stock)`;
      swatch.dataset.color = variant.color;
      swatch.dataset.colorCode = variant.colorCode;
      swatch.dataset.stock = variant.stockQuantity;
      
      // Add stock indicator
      if (variant.stockQuantity === 0) {
        swatch.classList.add('out-of-stock');
        swatch.innerHTML = '<span class="stock-badge">?</span>';
      }
      
      swatch.addEventListener('click', function() {
        if (variant.stockQuantity > 0) {
          // Remove active class from all swatches
          swatchesDiv.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
          // Add active class to clicked swatch
          this.classList.add('active');
          // Update selected color name
          const colorNameSpan = swatchesContainer.querySelector('.selected-color-name');
          if (colorNameSpan) {
            const tClick = (s) => window.YassoI18n?.t ? window.YassoI18n.t(s) : s;
            colorNameSpan.textContent = tClick(variant.color);
            colorNameSpan.style.fontWeight = 'bold';
            colorNameSpan.style.color = '#5C4033';
          }
        }
      });
      
      swatchesDiv.appendChild(swatch);
    });
    
    colorSelectorDiv.appendChild(swatchesDiv);
    swatchesContainer.appendChild(colorSelectorDiv);
    
    // Set initial selected color name
    const firstVariant = product.colorVariants[0];
    const colorNameSpan = swatchesContainer.querySelector('.selected-color-name');
    if (colorNameSpan && firstVariant) {
      const tLocal = (s) => window.YassoI18n?.t ? window.YassoI18n.t(s) : s;
      colorNameSpan.textContent = tLocal(firstVariant.color);
      colorNameSpan.style.fontWeight = 'bold';
      colorNameSpan.style.color = '#5C4033';
    }
    
    // Add CSS for color swatches if not already added
    if (!document.getElementById('color-swatch-styles')) {
      const style = document.createElement('style');
      style.id = 'color-swatch-styles';
      style.textContent = `
        .color-selector {
          margin-bottom: 20px;
        }
        .color-selector label {
          display: block;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }
        .color-swatches {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .color-swatch {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid #ddd;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .color-swatch:hover:not(.out-of-stock) {
          transform: scale(1.1);
          border-color: #D3A334;
        }
        .color-swatch.active {
          border-color: #D3A334;
          border-width: 4px;
          box-shadow: 0 0 0 2px rgba(201, 162, 77, 0.2);
        }
        .color-swatch.out-of-stock {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .color-swatch .stock-badge {
          color: #dc3545;
          font-weight: bold;
          font-size: 20px;
        }
        .selected-color-name {
          margin-left: 5px;
        }
      `;
      document.head.appendChild(style);
    }
  } else {
    // No color variants, hide the container
    swatchesContainer.style.display = 'none';
  }
}

/**
 * Update product rating display
 * @param {Object} product - Product data object
 */
function updateProductRating(product) {
  const ratingContainer = document.querySelector('.product-rating');
  if (!ratingContainer) return;
  
  const averageRating = product.averageRating || 0;
  const totalReviews = product.totalReviewsCount || 0;
  
  // Update star rating
  const starRatingDiv = ratingContainer.querySelector('.star-rating');
  if (starRatingDiv) {
    const percentage = (averageRating / 5) * 100;
    starRatingDiv.setAttribute('aria-label', `Rated ${averageRating.toFixed(2)} out of 5`);
    const span = starRatingDiv.querySelector('span');
    if (span) {
      span.style.width = `${percentage}%`;
    }
  }
  
  // Update review count
  const reviewCountSpan = ratingContainer.querySelector('.product-rating__total');
  if (reviewCountSpan) {
    reviewCountSpan.textContent = `${totalReviews} review${totalReviews !== 1 ? 's' : ''}`;
  }
}

/**
 * Update product images from API data
 * @param {Object} product - Product data object
 */
function updateProductImages(product) {
  // Get images from API response
  let productImages = [];
  
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    // API returns array of image objects with imageUrl property
    productImages = product.images
      .map(img => {
        // Get the image URL from different possible properties
        if (typeof img === 'string') return img;
        return img.imageUrl || img.url || null;
      })
      .filter(url => url && url !== 'null' && url !== 'undefined'); // Filter out invalid values
  } else if (product.primaryImageUrl) {
    // Fallback to primary image
    productImages = [product.primaryImageUrl];
  }
  
  // If no valid images found, use placeholder
  if (productImages.length === 0) {
    productImages = [PLACEHOLDER_IMAGE];
  }
  
  console.log('Product images:', productImages);
  
  // Destroy existing slick carousels first
  if (typeof $.fn.slick !== 'undefined') {
    try {
      $('.product-big-img').slick('unslick');
    } catch(e) {}
    try {
      $('.product-thumb-slide').slick('unslick');
    } catch(e) {}
  }
  
  // Update all main images in carousel
  const mainImagesContainer = document.querySelector('.product-big-img');
  if (mainImagesContainer) {
    mainImagesContainer.innerHTML = '';
    productImages.forEach((imgSrc, index) => {
      // Extra safety check - ensure imgSrc is valid
      const validSrc = (imgSrc && imgSrc !== 'undefined' && imgSrc !== 'null') ? imgSrc : PLACEHOLDER_IMAGE;
      
      const imgDiv = document.createElement('div');
      imgDiv.className = 'img';
      imgDiv.innerHTML = `<img src="${validSrc}" alt="${product.name} - Image ${index + 1}" onerror="this.src='${PLACEHOLDER_IMAGE}'">`;
      mainImagesContainer.appendChild(imgDiv);
    });
  }
  
  // Update thumbnail images
  const thumbContainer = document.querySelector('.product-thumb-slide');
  if (thumbContainer) {
    thumbContainer.innerHTML = '';
    productImages.forEach((imgSrc, index) => {
      // Extra safety check - ensure imgSrc is valid
      const validSrc = (imgSrc && imgSrc !== 'undefined' && imgSrc !== 'null') ? imgSrc : PLACEHOLDER_IMAGE;
      
      const thumbDiv = document.createElement('div');
      thumbDiv.innerHTML = `<div class="thumb"><img src="${validSrc}" alt="${product.name} - Thumb ${index + 1}" onerror="this.src='${PLACEHOLDER_IMAGE}'"></div>`;
      thumbContainer.appendChild(thumbDiv);
    });
  }
  
  // Reinitialize slick carousel after updating images
  setTimeout(() => {
    if (typeof $.fn.slick !== 'undefined') {
      $('.product-big-img').slick({
        slidesToShow: 1,
        fade: true,
        asNavFor: '.product-thumb-slide',
        arrows: false
      });
      
      $('.product-thumb-slide').slick({
        slidesToShow: Math.min(4, productImages.length),
        vertical: true,
        asNavFor: '.product-big-img',
        focusOnSelect: true,
        arrows: false,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              vertical: false,
              slidesToShow: Math.min(3, productImages.length)
            }
          }
        ]
      });
    }
  }, 100);
}

/**
 * Update product description
 * @param {Object} product - Product data object
 */
function updateProductDescription(product) {
  // Get localized product description
  const productDesc = window.YassoI18n ? window.YassoI18n.getLocalizedField(product, 'description') : product.description;
  const isRTL = window.YassoI18n ? window.YassoI18n.isRTL() : false;
  
  const descElement = document.querySelector('.product-desc');
  if (descElement) {
    descElement.textContent = productDesc;
    descElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }
}

/**
 * Update product metadata (SKU, color, stock)
 * @param {Object} product - Product data object
 */
function updateProductMeta(product) {
  const t = (s) => window.YassoI18n?.t ? window.YassoI18n.t(s) : s;
  const isRTL = window.YassoI18n ? window.YassoI18n.isRTL() : false;
  // Update category section with product color
  const metaSection = document.querySelector('.product_meta');
  if (metaSection) {
    metaSection.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    const categorySpan = metaSection.querySelector('span');
    if (categorySpan) {
      categorySpan.innerHTML = `${t('Category :')} <span><a href="#" rel="tag">${product.color}</a></span>`;
    }
  }
  
  // Update SKU in tags section (repurpose for SKU display)
  const tagsSpan = metaSection?.querySelectorAll('span')[1];
  if (tagsSpan) {
    tagsSpan.innerHTML = `${t('SKU :')} <span><a href="#" rel="tag">${product.sku}</a></span>`;
  }
}

/**
 * Update "Add to Cart" button with product ID
 * @param {Object} product - Product data object
 */
function updateAddToCartButton(product) {
  const addToCartBtn = document.querySelector('.actions .vs-btn');
  if (!addToCartBtn) return;
  
  addToCartBtn.setAttribute('data-product-id', product.id);
  
  // Check stock availability
  let hasStock = false;
  
  if (product.colorVariants && product.colorVariants.length > 0) {
    // Check if any color variant has stock
    hasStock = product.colorVariants.some(variant => variant.stockQuantity > 0);
  } else {
    // Fallback to totalStock or stockQuantity
    const totalStock = product.totalStock || product.stockQuantity || 0;
    hasStock = totalStock > 0;
  }
  
  // Set initial button state
  const t = (s) => window.YassoI18n?.t ? window.YassoI18n.t(s) : s;
  if (hasStock) {
    addToCartBtn.style.opacity = '1';
    addToCartBtn.style.cursor = 'pointer';
    addToCartBtn.textContent = t('Add to Cart');
    addToCartBtn.onclick = (e) => {
      e.preventDefault();
      addToCart(product.id);
    };
  } else {
    addToCartBtn.style.opacity = '0.5';
    addToCartBtn.style.cursor = 'not-allowed';
    addToCartBtn.textContent = t('Out of Stock');
    addToCartBtn.onclick = (e) => {
      e.preventDefault();
      return false;
    };
  }
  
  // Listen for color selection changes to update button state
  setTimeout(() => {
    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', function() {
        const selectedStock = parseInt(this.dataset.stock) || 0;
        const tBtn = (s) => window.YassoI18n?.t ? window.YassoI18n.t(s) : s;
        if (selectedStock > 0) {
          addToCartBtn.style.opacity = '1';
          addToCartBtn.style.cursor = 'pointer';
          addToCartBtn.textContent = tBtn('Add to Cart');
          addToCartBtn.onclick = (e) => {
            e.preventDefault();
            addToCart(product.id);
          };
        } else {
          addToCartBtn.style.opacity = '0.5';
          addToCartBtn.style.cursor = 'not-allowed';
          addToCartBtn.textContent = tBtn('Out of Stock');
          addToCartBtn.onclick = (e) => {
            e.preventDefault();
            return false;
          };
        }
      });
    });
  }, 100);
}

/**
 * Show product not found message
 */
function showProductNotFound() {
  const container = document.querySelector('.product-details-area');
  if (container) {
    container.innerHTML = `
      <div class="container">
        <div class="row">
          <div class="col-12 text-center py-5">
            <h2>Product Not Found</h2>
            <p>Sorry, the product you're looking for doesn't exist.</p>
            <a href="shop-sidebar.html" class="vs-btn">Back to Shop</a>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Add product to cart
 * @param {number} productId - Product ID
 */
function addToCart(productId) {
  const CART_STORAGE_KEY = 'yasso_cart';
  const quantityInput = document.querySelector('.qty-input');
  const quantity = parseInt(quantityInput?.value || 1);
  
  // Get selected color if product has color variants
  const activeColorSwatch = document.querySelector('.color-swatch.active');
  const selectedColor = activeColorSwatch ? activeColorSwatch.dataset.color : null;
  const selectedStock = activeColorSwatch ? parseInt(activeColorSwatch.dataset.stock) : null;
  
  // Check if color is required and selected
  if (document.querySelector('.color-swatches') && !selectedColor) {
    showNotification('Please select a color!', 'warning');
    return;
  }
  
  // Check stock availability
  if (selectedStock !== null && selectedStock < quantity) {
    showNotification(`Only ${selectedStock} items available in ${selectedColor}!`, 'warning');
    return;
  }
  
  // Get current cart from localStorage
  let cart = [];
  const cartData = localStorage.getItem(CART_STORAGE_KEY);
  if (cartData) {
    cart = JSON.parse(cartData);
  }
  
  // Check if product with same color already in cart
  const existingItem = cart.find(item => 
    item.productId === productId && 
    (selectedColor ? item.selectedColor === selectedColor : true)
  );
  
  if (existingItem) {
    // Update quantity
    existingItem.quantity += quantity;
    existingItem.addedDate = new Date().toISOString();
  } else {
    // Add new item
    const cartItem = {
      productId: productId,
      quantity: quantity,
      addedDate: new Date().toISOString()
    };
    
    // Add selected color if available
    if (selectedColor) {
      cartItem.selectedColor = selectedColor;
    }
    
    cart.push(cartItem);
  }
  
  // Save to localStorage
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  // Update cart count in header
  updateCartCount();
  
  // Dispatch custom event for other scripts to listen to
  window.dispatchEvent(new Event('cartUpdated'));
  
  // Show notification with color info
  const colorInfo = selectedColor ? ` (${selectedColor})` : '';
  showNotification(`Added ${quantity} item(s)${colorInfo} to cart!`, 'success');
  
  console.log('Cart updated:', cart);
}

/**
 * Update cart count badge in header
 */
function updateCartCount() {
  const CART_STORAGE_KEY = 'yasso_cart';
  const cartData = localStorage.getItem(CART_STORAGE_KEY);
  
  if (cartData) {
    const cart = JSON.parse(cartData);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update all cart count badges
    document.querySelectorAll('.cart-count').forEach(badge => {
      badge.textContent = totalItems;
    });
  }
}

/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `product-notification product-notification-${type}`;
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
  }, 3000);
}

// Add CSS animations
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
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

/**
 * Initialize product details page
 */
async function initProductDetails() {
  const productId = getProductIdFromUrl();
  console.log('Product ID from URL:', productId);
  
  if (!productId) {
    console.error('No product ID in URL');
    showProductNotFound();
    return;
  }
  
  // Show loading state
  console.log(`Loading product ${productId}...`);
  
  // Load product details
  const product = await loadProductDetails(productId);
  console.log('Loaded product data:', product);
  
  if (!product) {
    return; // Error already handled in loadProductDetails
  }
  
  // Update all product information on the page
  updatePageTitle(product);
  updateProductPrice(product);
  updateProductRating(product);
  updateColorVariants(product);
  updateProductImages(product);
  updateProductDescription(product);
  updateProductMeta(product);
  updateAddToCartButton(product);
  
  // Initialize image zoom functionality
  initImageZoom();
  
  // Update cart count from localStorage
  updateCartCount();

  // Run i18n pass over the whole product area for any static strings left
  if (window.YassoI18n) {
    window.YassoI18n.translate(document.querySelector('.vs-product-wrapper'));
    window.YassoI18n.translate(document.querySelector('.space-bottom'));
  }

  console.log('Product details loaded successfully');
}

/**
 * Initialize image zoom functionality using Magnific Popup
 */
function initImageZoom() {
  // Add click handler to product images for zoom
  $('.product-big-img .img').magnificPopup({
    delegate: 'img',
    type: 'image',
    closeOnContentClick: true,
    closeBtnInside: false,
    mainClass: 'mfp-with-zoom mfp-img-mobile',
    image: {
      verticalFit: true,
      titleSrc: function(item) {
        return item.el.attr('alt') || 'Product Image';
      }
    },
    zoom: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out',
      opener: function(element) {
        // Element is already the img when using delegate: 'img'
        // Return the img element itself for zoom animation
        return element.is('img') ? element : element.find('img');
      }
    },
    callbacks: {
      elementParse: function(item) {
        // Get the image src from the clicked img element
        const imgSrc = item.el.attr('src');
        
        // Only set the src if it's valid (not undefined/null/empty)
        if (imgSrc && imgSrc !== 'undefined' && imgSrc !== 'null' && imgSrc.trim() !== '') {
          item.src = imgSrc;
        } else {
          // Use placeholder if no valid image
          item.src = PLACEHOLDER_IMAGE;
        }
      },
      open: function() {
        // Add custom styling when zoom opens
        $('.mfp-figure').css('cursor', 'zoom-out');
      },
      beforeOpen: function() {
        // Ensure we have a valid item
        if (!this.currItem || !this.currItem.src) {
          console.error('Invalid image source for popup');
          return false;
        }
      }
    }
  });
  
  // Make images clickable with proper cursor
  $('.product-big-img .img').css('cursor', 'zoom-in');
  $('.product-big-img .img img').css('cursor', 'zoom-in');
}

// Re-render all dynamic content when language switches
window.addEventListener('languageChanged', function () {
  if (currentProduct) {
    updatePageTitle(currentProduct);
    updateProductPrice(currentProduct);
    updateColorVariants(currentProduct);
    updateProductDescription(currentProduct);
    updateProductMeta(currentProduct);
    updateAddToCartButton(currentProduct);
    // Translate any remaining static text
    if (window.YassoI18n) {
      window.YassoI18n.translate(document.querySelector('.vs-product-wrapper'));
      window.YassoI18n.translate(document.querySelector('.space-bottom'));
      window.YassoI18n.translate(document.querySelector('.breadcumb-wrapper'));
    }
  }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initProductDetails();
});

// Export functions for backend integration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadProductDetails,
    getProductIdFromUrl,
    addToCart
  };
}
