/**
 * YASSO Checkout Handler
 * 
 * Manages the checkout process including:
 * - Loading cart items
 * - Displaying order summary
 * - Collecting customer information
 * - Submitting orders to backend API
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
let orderTotal = 0;

// ===========================
// Initialize Checkout Page
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Checkout page initialized');
  loadCheckoutPage();
  setupEventListeners();
});

// ===========================
// Load Checkout Page
// ===========================
async function loadCheckoutPage() {
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
    
    console.log('Products cache after fetch:', productsCache);
    
    // Render order summary
    renderOrderSummary();
    calculateTotals();
    hideLoading();
    
  } catch (error) {
    console.error('Error loading checkout page:', error);
    hideLoading();
    showNotification('Failed to load checkout page. Please try again.', 'error');
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
// Render Order Summary
// ===========================
function renderOrderSummary() {
  const tbody = document.querySelector('.checkout-ordertable').previousElementSibling;
  
  if (!tbody) {
    console.error('Order summary tbody not found');
    return;
  }
  
  // Clear existing items
  tbody.innerHTML = '';
  
  // Render each cart item
  cartItems.forEach((item) => {
    const product = productsCache[item.productId];
    
    if (!product) {
      console.warn(`Product ${item.productId} not found in cache`);
      return;
    }
    
    const row = createOrderSummaryRow(item, product);
    tbody.appendChild(row);
  });
}

// ===========================
// Create Order Summary Row
// ===========================
function createOrderSummaryRow(item, product) {
  const row = document.createElement('tr');
  row.classList.add('cart_item');
  
  // Get product image
  const productImage = product.images && product.images.length > 0 
    ? product.images[0].imageUrl 
    : 'assets/img/products/product-1-1.jpg';
  
  // Calculate item total
  const itemTotal = (product.price * item.quantity).toFixed(2);
  
  // Display color if selected
  const colorDisplay = item.selectedColor 
    ? `<br><small style="color: #D3A334; font-weight: 500;">${item.selectedColor}</small>` 
    : '';
  
  row.innerHTML = `
    <td data-title="Product">
      <a class="cart-productimage" href="shop-details.html?id=${product.id}">
        <img width="91" height="91" src="${productImage}" alt="${product.name}">
      </a>
    </td>
    <td data-title="Name">
      <a class="cart-productname" href="shop-details.html?id=${product.id}">
        ${product.name}
      </a>
      ${colorDisplay}
    </td>
    <td data-title="Price">
      <span class="amount">
        <bdi><span>${CURRENCY}</span>${product.price.toFixed(2)}</bdi>
      </span>
    </td>
    <td data-title="Quantity">
      <strong class="product-quantity">${String(item.quantity).padStart(2, '0')}</strong>
    </td>
    <td data-title="Total">
      <span class="amount">
        <bdi><span>${CURRENCY}</span>${itemTotal}</bdi>
      </span>
    </td>
  `;
  
  return row;
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
  
  const shipping = 0; // Free shipping or calculate based on location
  orderTotal = subtotal + shipping;
  
  // Update subtotal
  const subtotalElement = document.querySelector('.cart-subtotal td .woocommerce-Price-amount');
  if (subtotalElement) {
    subtotalElement.innerHTML = `<bdi><span class="woocommerce-Price-currencySymbol">${CURRENCY}</span>${subtotal.toFixed(2)}</bdi>`;
  }
  
  // Update total
  const totalElement = document.querySelector('.order-total td .woocommerce-Price-amount');
  if (totalElement) {
    totalElement.innerHTML = `<bdi><span class="woocommerce-Price-currencySymbol">${CURRENCY}</span>${orderTotal.toFixed(2)}</bdi>`;
  }
}

// ===========================
// Setup Event Listeners
// ===========================
function setupEventListeners() {
  // Place order button
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', handlePlaceOrder);
  }
  
  // Update header cart count
  updateHeaderCartCount();
}

// ===========================
// Handle Place Order
// ===========================
async function handlePlaceOrder(e) {
  e.preventDefault();
  
  // Validate form
  if (!validateCheckoutForm()) {
    return;
  }
  
  // Collect customer information
  const customerData = collectCustomerData();
  
  // Prepare order items
  const orderItems = prepareOrderItems();
  
  // Create order object
  const orderData = {
    ...customerData,
    orderItems: orderItems
  };
  
  console.log('Submitting order:', orderData);
  console.log('Order data JSON:', JSON.stringify(orderData, null, 2));
  
  try {
    showLoading();

    if (apiRequest) {
      const order = await apiRequest(`${API_BASE_URL}/orders`, {
        method: 'POST',
        data: orderData
      });

      console.log('Order placed successfully:', order);

      localStorage.removeItem(CART_STORAGE_KEY);
      window.dispatchEvent(new Event('cartUpdated'));

      hideLoading();
      showOrderSuccess(order);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to place order';
      try {
        const errorData = await response.json();
        console.error('Error response:', errorData);

        if (errorData.errors) {
          console.error('Validation errors:', errorData.errors);
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          console.error('Detailed errors:\n', errorMessages);
        }

        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const order = await response.json();
    console.log('Order placed successfully:', order);
    
    // Clear cart
    localStorage.removeItem(CART_STORAGE_KEY);
    
    // Update cart count
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success message
    hideLoading();
    showOrderSuccess(order);
    
  } catch (error) {
    console.error('Error placing order:', error);
    hideLoading();
    showNotification(error.message || 'Failed to place order. Please try again.', 'error');
  }
}

// ===========================
// Validate Checkout Form
// ===========================
function validateCheckoutForm() {
  const customerName = document.getElementById('customerName').value.trim();
  const customerEmail = document.getElementById('customerEmail').value.trim();
  const customerPhone = document.getElementById('customerPhone').value.trim();
  const city = document.getElementById('city').value.trim();
  const streetName = document.getElementById('streetName').value.trim();
  const buildingNumber = document.getElementById('buildingNumber').value.trim();
  
  if (!customerName) {
    showNotification('Please enter your name', 'warning');
    document.getElementById('customerName').focus();
    return false;
  }
  
  if (!customerEmail || !isValidEmail(customerEmail)) {
    showNotification('Please enter a valid email address', 'warning');
    document.getElementById('customerEmail').focus();
    return false;
  }
  
  if (!customerPhone) {
    showNotification('Please enter your phone number', 'warning');
    document.getElementById('customerPhone').focus();
    return false;
  }
  
  if (!city) {
    showNotification('Please enter your city', 'warning');
    document.getElementById('city').focus();
    return false;
  }
  
  if (!streetName) {
    showNotification('Please enter your street name', 'warning');
    document.getElementById('streetName').focus();
    return false;
  }
  
  if (!buildingNumber) {
    showNotification('Please enter your building number', 'warning');
    document.getElementById('buildingNumber').focus();
    return false;
  }
  
  return true;
}

// ===========================
// Collect Customer Data
// ===========================
function collectCustomerData() {
  return {
    customerName: document.getElementById('customerName').value.trim(),
    customerEmail: document.getElementById('customerEmail').value.trim(),
    customerPhone: document.getElementById('customerPhone').value.trim(),
    city: document.getElementById('city').value.trim(),
    streetName: document.getElementById('streetName').value.trim(),
    buildingNumber: document.getElementById('buildingNumber').value.trim(),
    floor: document.getElementById('floor').value.trim() || '',
    apartmentNumber: document.getElementById('apartmentNumber').value.trim() || '',
    whatsappNumber: document.getElementById('whatsappNumber').value.trim() || document.getElementById('customerPhone').value.trim(),
    notes: document.getElementById('orderNotes').value.trim() || ''
  };
}

// ===========================
// Prepare Order Items
// ===========================
function prepareOrderItems() {
  return cartItems.map(item => {
    const product = productsCache[item.productId];
    
    if (!product) {
      console.error(`Product ${item.productId} not found in cache`);
      throw new Error(`Product information is missing. Please try again.`);
    }
    
    if (!product.price) {
      console.error(`Product ${item.productId} has no price`, product);
      throw new Error(`Product price is missing. Please try again.`);
    }
    
    const orderItem = {
      productId: item.productId,
      quantity: item.quantity,
      price: product.price
    };
    
    // Add selected color if available
    if (item.selectedColor) {
      orderItem.selectedColor = item.selectedColor;
    }
    
    // DO NOT include orderId - it's generated by the backend
    
    console.log('Order item prepared:', orderItem);
    return orderItem;
  });
}

// ===========================
// Show Order Success
// ===========================
function showOrderSuccess(order) {
  const container = document.querySelector('.woocommerce-checkout');
  if (!container) return;
  
  container.innerHTML = `
    <div class="order-success-container" style="text-align: center; padding: 60px 20px;">
      <div style="background: #28a745; color: white; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; font-size: 40px;">
        ?
      </div>
      <h2 style="color: #28a745; margin-bottom: 20px;">Order Placed Successfully!</h2>
      <p style="font-size: 18px; margin-bottom: 10px;">Thank you for your order, <strong>${order.customerName}</strong>!</p>
      <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
        Your Order ID: <strong style="color: #D3A334; font-size: 20px;">#${order.id}</strong>
      </p>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto;">
        <h3 style="margin-bottom: 20px;">Order Details</h3>
        <div style="text-align: left;">
          <p><strong>Total Amount:</strong> ${CURRENCY} ${order.totalAmount.toFixed(2)}</p>
          <p><strong>Status:</strong> <span style="color: #ffc107;">${order.orderStatus}</span></p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
          <p><strong>Delivery Address:</strong><br>
            ${order.buildingNumber} ${order.streetName}, Floor ${order.floor || 'N/A'}, Apt ${order.apartmentNumber || 'N/A'}<br>
            ${order.city}
          </p>
        </div>
      </div>
      <p style="color: #666; margin-bottom: 30px;">
        We'll send you an email confirmation shortly.<br>
        You can track your order using the Order ID above.
      </p>
      <div style="display: flex; gap: 15px; justify-content: center;">
        <a href="shop-sidebar.html" class="vs-btn">Continue Shopping</a>
        <a href="index.html" class="vs-btn style2">Go to Home</a>
      </div>
    </div>
  `;
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===========================
// Display Empty Cart
// ===========================
function displayEmptyCart() {
  const container = document.querySelector('.woocommerce-checkout');
  if (!container) return;

  const isAr = window.YassoI18n && window.YassoI18n.currentLang() === 'ar';
  const title   = isAr ? '???? ?????' : 'Your cart is empty';
  const message = isAr ? '??? ??? ???????? ??? ???? ??? ????? ??????' : 'Add some products to your cart before checkout';
  const btn     = isAr ? '???? ????????' : 'Browse Products';

  container.innerHTML = `
    <div class="empty-cart-container" style="text-align: center; padding: 60px 20px;">
      <div style="font-size: 80px; color: #ddd; margin-bottom: 20px;">??</div>
      <h2>${title}</h2>
      <p style="color: #666; margin-bottom: 30px;">${message}</p>
      <a href="shop-sidebar.html" class="vs-btn">${btn}</a>
    </div>
  `;

  hideLoading();
}

// ===========================
// Utility Functions
// ===========================

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function updateHeaderCartCount() {
  const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Update cart count badges
  document.querySelectorAll('.cart-count').forEach(badge => {
    badge.textContent = totalItems;
  });
}

function showLoading() {
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'checkoutLoading';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  loadingOverlay.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
      <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #D3A334; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
      <p style="color: #333; font-size: 16px; margin: 0;">Processing your order...</p>
    </div>
  `;
  document.body.appendChild(loadingOverlay);
  
  // Add spinner animation
  if (!document.getElementById('spinner-styles')) {
    const style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

function hideLoading() {
  const loadingOverlay = document.getElementById('checkoutLoading');
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `checkout-notification checkout-notification-${type}`;
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
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Add notification animations
if (!document.getElementById('notification-animations')) {
  const style = document.createElement('style');
  style.id = 'notification-animations';
  style.textContent = `
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
  `;
  document.head.appendChild(style);
}
