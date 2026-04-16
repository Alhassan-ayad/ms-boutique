/**
 * YASSO Global Cart Counter
 * 
 * This lightweight script updates the cart count badge on all pages.
 * Include this script in all pages to maintain cart count across the website.
 * 
 * Usage: <script src="assets/js/global-cart-counter.js"></script>
 */

(function() {
  'use strict';
  
  const CART_STORAGE_KEY = 'yasso_cart';
  
  /**
   * Update cart count badge in header
   */
  function updateGlobalCartCount() {
    try {
      const cartData = localStorage.getItem(CART_STORAGE_KEY);
      
      if (cartData) {
        const cart = JSON.parse(cartData);
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update all cart count badges on the page
        const cartBadges = document.querySelectorAll('.cart-count, .wc-link .badge-qty, .cart-badge');
        cartBadges.forEach(badge => {
          badge.textContent = totalItems;
          badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
        });
        
        // Also update mini-cart if present
        updateMiniCart(cart, totalItems);
      } else {
        // No cart data, show 0
        const cartBadges = document.querySelectorAll('.cart-count, .wc-link .badge-qty, .cart-badge');
        cartBadges.forEach(badge => {
          badge.textContent = '0';
          badge.style.display = 'none';
        });
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }
  
  /**
   * Update mini cart dropdown if present
   * @param {Array} cart - Cart items array
   * @param {number} totalItems - Total number of items
   */
  function updateMiniCart(cart, totalItems) {
    const miniCartContainer = document.querySelector('.mini-cart, .header-cart-dropdown');
    if (!miniCartContainer) return;
    
    // This is a placeholder for mini cart functionality
    // Implement if you have a dropdown mini cart in the header
    console.log('Mini cart update:', { cart, totalItems });
  }
  
  /**
   * Listen for storage events to update cart count when changed in another tab
   */
  window.addEventListener('storage', function(e) {
    if (e.key === CART_STORAGE_KEY) {
      updateGlobalCartCount();
    }
  });
  
  /**
   * Listen for custom cart update event
   */
  window.addEventListener('cartUpdated', function() {
    updateGlobalCartCount();
  });
  
  // Initialize cart count when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateGlobalCartCount);
  } else {
    updateGlobalCartCount();
  }
  
  // Make function globally available
  window.updateGlobalCartCount = updateGlobalCartCount;
  
})();
