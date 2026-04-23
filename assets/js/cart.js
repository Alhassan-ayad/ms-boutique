/**
 * YASSO Shopping Cart Handler
 * 
 * This file manages the shopping cart page functionality.
 * Integrates with backend API to fetch product details.
 */

// ===========================
// Configuration
// ===========================
const API_BASE_URL = window.YASSO_CONFIG?.API_BASE_URL || '/api';
const apiRequest = window.YASSO_CONFIG?.apiRequest?.bind(window.YASSO_CONFIG);
const CART_STORAGE_KEY = 'yasso_cart';
const CURRENCY = window.YASSO_CONFIG?.CURRENCY?.SYMBOL || 'EGP';

// ===========================
// State Management
// ===========================
let cartItems = [];
let productsCache = {};

// ===========================
// Initialize Cart Page
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Cart page initialized');
  loadCart();
  setupEventListeners();
});

// ===========================
// Load Cart from LocalStorage
// ===========================
async function loadCart() {
  try {
    showLoading();
    
    // Get cart from localStorage
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    cartItems = cartData ? JSON.parse(cartData) : [];
    
    console.log('Cart items from localStorage:', cartItems);
    
    if (cartItems.length === 0) {
      displayEmptyCart();
      return;
    }
    
    // Fetch product details for all cart items
    await fetchProductDetails();
    
    // Render cart
    renderCart();
    calculateTotals();
    hideLoading();
    
  } catch (error) {
    console.error('Error loading cart:', error);
    hideLoading();
    showError('Failed to load cart. Please refresh the page.');
  }
}

// ===========================
// Fetch Product Details
// ===========================
async function fetchProductDetails() {
  const productIds = [...new Set(cartItems.map(item => item.productId))];
  
  for (const productId of productIds) {
    try {
      if (apiRequest) {
        const product = await apiRequest(`${API_BASE_URL}/products/${productId}`);
        productsCache[productId] = product;
        continue;
      }

      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      if (!response.ok) {
        console.error(`Failed to fetch product ${productId}`);
        continue;
      }

      const product = await response.json();
      productsCache[productId] = product;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
    }
  }
}

// ===========================
// Render Cart Items
// ===========================
function renderCart() {
  const tbody = document.querySelector('.woocommerce-cart-form tbody');
  
  if (!tbody) {
    console.error('Cart tbody not found');
    return;
  }
  
  // Clear existing items (except the actions row)
  const rows = tbody.querySelectorAll('tr');
  rows.forEach((row, index) => {
    if (!row.classList.contains('cart-actions')) {
      row.remove();
    }
  });
  
  // Get the actions row to insert before it
  const actionsRow = tbody.querySelector('.cart-actions');
  
  // Render each cart item
  cartItems.forEach((item, index) => {
    const product = productsCache[item.productId];
    
    if (!product) {
      console.warn(`Product ${item.productId} not found in cache`);
      return;
    }
    
    const row = createCartRow(item, product, index);
    
    if (actionsRow) {
      tbody.insertBefore(row, actionsRow);
    } else {
      tbody.appendChild(row);
    }
  });
  
  // Update header cart count
  updateHeaderCartCount();
}

// ===========================
// Create Cart Row HTML
// ===========================
function createCartRow(item, product, index) {
  const row = document.createElement('tr');
  row.classList.add('cart_item');
  row.dataset.index = index;
  row.dataset.productId = product.id;
  
  // Get product image
  const productImage = product.images && product.images.length > 0 
    ? product.images[0].imageUrl 
    : 'assets/img/products/product-1-1.jpg';
  
  // Calculate item total
  const itemTotal = (product.price * item.quantity).toFixed(2);
  
  // Get stock quantity for selected color variant
  let stockQuantity = product.stockQuantity || 0;
  let selectedColorDisplay = '';
  
  if (item.selectedColor && product.colorVariants && product.colorVariants.length > 0) {
    const colorVariant = product.colorVariants.find(v => v.color === item.selectedColor);
    if (colorVariant) {
      stockQuantity = colorVariant.stockQuantity;
      selectedColorDisplay = `<br><small style="color: #D3A334; font-weight: 500;">Color: ${item.selectedColor}</small>`;
    }
  }
  
  // Check stock availability
  const inStock = stockQuantity >= item.quantity;
  const stockWarning = !inStock ? '<br><span class="text-danger" style="font-size: 12px;">Out of stock</span>' : '';
  
  row.innerHTML = `
    <td data-title="Product">
      <a class="cart-productimage" href="shop-details.html?id=${product.id}">
        <img width="100" height="95" src="${productImage}" alt="${product.name}">
      </a>
    </td>
    <td data-title="Name">
      <a class="cart-productname" href="shop-details.html?id=${product.id}">
        ${product.name}
      </a>
      ${selectedColorDisplay}
      ${stockWarning}
    </td>
    <td data-title="Price">
      <span class="amount">
        <bdi><span>${CURRENCY}</span>${product.price.toFixed(2)}</bdi>
      </span>
    </td>
    <td data-title="Quantity">
      <div class="quantity style2">
        <div class="quantity__field quantity-container">
          <button class="quantity-minus qty-btn" onclick="updateQuantity(${index}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
            <i class="fal fa-minus"></i>
          </button>
          <input type="number" class="qty-input" step="1" min="1" max="${stockQuantity}" 
                 value="${item.quantity}" 
                 onchange="updateQuantity(${index}, this.value)"
                 data-max="${stockQuantity}">
          <button class="quantity-plus qty-btn" onclick="updateQuantity(${index}, ${item.quantity + 1})" ${item.quantity >= stockQuantity ? 'disabled' : ''}>
            <i class="fal fa-plus"></i>
          </button>
        </div>
      </div>
    </td>
    <td data-title="Total">
      <span class="amount item-total">
        <bdi><span>${CURRENCY}</span>${itemTotal}</bdi>
      </span>
    </td>
    <td data-title="Remove">
      <a href="#" class="remove" onclick="removeItem(${index}); return false;">
        <i class="fal fa-trash-alt"></i>
      </a>
    </td>
  `;
  
  return row;
}

// ===========================
// Update Quantity
// ===========================
function updateQuantity(index, newQuantity) {
  newQuantity = parseInt(newQuantity);
  
  if (isNaN(newQuantity) || newQuantity < 1) {
    newQuantity = 1;
  }
  
  const item = cartItems[index];
  const product = productsCache[item.productId];
  
  // Check stock limit
  if (newQuantity > product.stockQuantity) {
    showNotification(`Only ${product.stockQuantity} items available in stock`, 'warning');
    newQuantity = product.stockQuantity;
  }
  
  // Update quantity
  cartItems[index].quantity = newQuantity;
  cartItems[index].addedDate = new Date().toISOString();
  
  // Save to localStorage
  saveCart();
  
  // Re-render cart
  renderCart();
  calculateTotals();
  
  showNotification('Cart updated', 'success');
}

// ===========================
// Remove Item
// ===========================
function removeItem(index) {
  const product = productsCache[cartItems[index].productId];
  
  if (confirm(`Remove "${product.name}" from cart?`)) {
    cartItems.splice(index, 1);
    saveCart();
    
    if (cartItems.length === 0) {
      displayEmptyCart();
    } else {
      renderCart();
      calculateTotals();
    }
    
    showNotification('Item removed from cart', 'success');
  }
}

// ===========================
// Calculate Totals
// ===========================
function calculateTotals() {
  let subtotal = 0;
  
  cartItems.forEach(item => {
    const product = productsCache[item.productId];
    if (product) {
      subtotal += product.price * item.quantity;
    }
  });
  
  const shipping = 0; // Free shipping or calculate based on selection
  const total = subtotal + shipping;
  
  // Update subtotal
  const subtotalElement = document.querySelector('.cart_totals tbody tr:first-child td:last-child .amount bdi');
  if (subtotalElement) {
    subtotalElement.innerHTML = `<span>${CURRENCY}</span>${subtotal.toFixed(2)}`;
  }
  
  // Update total
  const totalElement = document.querySelector('.cart_totals tfoot .order-total td:last-child .amount bdi');
  if (totalElement) {
    totalElement.innerHTML = `<span>${CURRENCY}</span>${total.toFixed(2)}`;
  }
}

// ===========================
// Save Cart to LocalStorage
// ===========================
function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  updateHeaderCartCount();
  
  // Dispatch custom event for global cart counter
  window.dispatchEvent(new Event('cartUpdated'));
}

// ===========================
// Display Empty Cart
// ===========================
function displayEmptyCart() {
  const tbody = document.querySelector('.woocommerce-cart-form tbody');
  
  if (tbody) {
    const isAr = window.YassoI18n && window.YassoI18n.currentLang() === 'ar';
    const title = isAr ? '???? ?????' : 'Your cart is empty';
    const btn   = isAr ? '?????? ??????' : 'Continue Shopping';
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 60px 20px;">
          <i class="fal fa-shopping-cart" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
          <h3 style="color: #666; margin-bottom: 20px;">${title}</h3>
          <a href="shop-sidebar.html" class="vs-btn">${btn}</a>
        </td>
      </tr>
    `;
  }
  
  // Hide cart totals section
  const totalsSection = document.querySelector('.cart_totals');
  if (totalsSection) {
    totalsSection.closest('.row').style.display = 'none';
  }
  
  hideLoading();
  /* Re-translate dynamically rendered cart content */
  if (window.YassoI18n && window.YassoI18n.currentLang() === 'ar') {
    window.YassoI18n.translate(document.querySelector('.woocommerce-cart-form') || document.body);
    window.YassoI18n.translate(document.querySelector('.cart_totals') || document.body);
  }
}

// ===========================
// Update Header Cart Count
// ===========================
function updateHeaderCartCount() {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartLinks = document.querySelectorAll('.wc-link');
  cartLinks.forEach(link => {
    const badge = link.querySelector('.cart-count');
    if (badge) {
      badge.textContent = totalItems;
    }
  });
}

// ===========================
// Setup Event Listeners
// ===========================
function setupEventListeners() {
  // Update Cart button
  const updateCartBtn = document.querySelector('.vs-cart-coupon button[type="submit"]');
  if (updateCartBtn && updateCartBtn.textContent.includes('Update cart')) {
    updateCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loadCart(); // Reload to sync with any manual changes
      showNotification('Cart updated', 'success');
    });
  }
  
  // Continue Shopping button
  const continueShoppingBtn = document.querySelector('.vs-cart-coupon a.vs-btn');
  if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'shop-sidebar.html';
    });
  }
  
  // Proceed to Checkout button
  const checkoutBtn = document.querySelector('.wc-proceed-to-checkout a');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      if (cartItems.length === 0) {
        e.preventDefault();
        showNotification('Your cart is empty', 'warning');
      }
      // Otherwise allow navigation to checkout
    });
  }
}

// ===========================
// Loading State
// ===========================
function showLoading() {
  const tbody = document.querySelector('.woocommerce-cart-form tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 60px 20px;">
          <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p style="margin-top: 20px; color: #666;">Loading your cart...</p>
        </td>
      </tr>
    `;
  }
}

function hideLoading() {
  // Loading is replaced by content, so nothing to do here
}

// ===========================
// Notifications
// ===========================
function showNotification(message, type = 'info') {
  // Use YASSO_CONFIG notification if available
  if (window.YASSO_CONFIG && typeof window.YASSO_CONFIG.showNotification === 'function') {
    window.YASSO_CONFIG.showNotification(message, type);
    return;
  }
  
  // Fallback notification
  const notification = document.createElement('div');
  notification.className = `cart-notification cart-notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8'};
    color: white;
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showError(message) {
  showNotification(message, 'danger');
}

// ===========================
// Export Functions
// ===========================
// Make functions globally available
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
window.loadCart = loadCart;
