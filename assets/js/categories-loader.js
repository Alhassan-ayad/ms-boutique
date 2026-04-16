/**
 * YASSO Categories Loader
 * 
 * This file loads product categories from the backend API
 * and populates the category filter in the sidebar.
 */

// Use a file-scoped constant to avoid global name collisions with other scripts.
const CATEGORIES_API_BASE = window.API_CONFIG?.BASE_URL || window.YASSO_CONFIG?.API_BASE_URL || '/api';

/**
 * Fetch active categories from backend API
 * @returns {Promise<Array>} - Array of category objects
 */
async function fetchCategories() {
  try {
    const url = `${CATEGORIES_API_BASE}/product-categories/all-active`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const categories = await response.json();
    
    // Cache categories
    localStorage.setItem('yasso_categories_cache', JSON.stringify(categories));
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Return cached categories if API fails
    const cached = localStorage.getItem('yasso_categories_cache');
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Return empty array if no cache
    return [];
  }
}

/**
 * Render categories in the sidebar
 */
function renderCategoriesInSidebar() {
  // Use this top widget as the dedicated dynamic Colors container.
  const sidebar = document.querySelector('.shop-sidebar');
  if (!sidebar) {
    return;
  }
  
  // Check if categories widget already exists
  let categoriesWidget = sidebar.querySelector('.widget.categories-widget');
  
  if (!categoriesWidget) {
    const firstWidget = sidebar.querySelector('#mobileFilterBody .widget') || sidebar.querySelector('.widget');
    if (firstWidget) {
      categoriesWidget = document.createElement('div');
      categoriesWidget.className = 'widget categories-widget';
      firstWidget.parentNode.insertBefore(categoriesWidget, firstWidget);
    } else {
      return;
    }
  }

  categoriesWidget.innerHTML = `
    <h3 class="widget_title">Colors</h3>
    <div class="category-filter">
      <ul id="colorFiltersList"></ul>
    </div>
  `;
}

/**
 * Render categories in navigation menu
 * @param {Array} categories - Array of category objects
 */
function renderCategoriesInMenu(categories) {
  // Find the menu containers (header and mobile menu)
  const menuContainers = [
    document.querySelector('.vs-menu-area nav ul'),
    document.querySelector('.vs-mobile-menu ul')
  ];
  
  menuContainers.forEach(menu => {
    if (!menu) return;
    
    // Find or create the Bags menu item
    let bagsMenuItem = Array.from(menu.children).find(li => {
      const link = li.querySelector('a');
      return link && link.textContent.trim() === 'Bags';
    });
    
    if (!bagsMenuItem) return;
    
    // Check if dropdown already exists
    let dropdown = bagsMenuItem.querySelector('.mega-menu, .sub-menu');
    
    if (categories.length > 0 && !dropdown) {
      // Add dropdown class
      bagsMenuItem.classList.add('menu-item-has-children');
      
      // Create dropdown
      dropdown = document.createElement('ul');
      dropdown.className = 'sub-menu';
      
      // Add "All Bags" option
      dropdown.innerHTML = '<li><a href="shop-sidebar.html">All Bags</a></li>';
      
      // Add category links
      categories.forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="shop-sidebar.html?category=${category.id}">${category.name}</a>`;
        dropdown.appendChild(li);
      });
      
      bagsMenuItem.appendChild(dropdown);
    }
  });
  
}

/**
 * Initialize categories
 */
async function initializeCategories() {
  try {
    // Always render the top Colors widget placeholder.
    renderCategoriesInSidebar();

    const categories = await fetchCategories();
    
    if (categories && categories.length > 0) {
      renderCategoriesInMenu(categories);
      // Re-translate dynamically rendered category names
      if (window.YassoI18n && window.YassoI18n.currentLang() === 'ar') {
        var catSection = document.querySelector('.category-section, .vs-category-wrap, .category-wrap, [class*="categor"]');
        window.YassoI18n.translate(catSection || document.body);
      }
    }
    
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCategories);
} else {
  initializeCategories();
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchCategories,
    renderCategoriesInSidebar,
    renderCategoriesInMenu,
    initializeCategories
  };
}
