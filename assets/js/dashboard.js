/**
 * YASSO Admin Dashboard - Comprehensive Management System
 * 
 * Features:
 * - Product Management with drag & drop images
 * - Blog Posts Management
 * -  & Reviews Management
 * - Contact Messages Management
 * - Home Page Images Management
 * - Advanced filtering for all sections
 */

// Storage keys
const STORAGE_KEYS = {
  products: 'yasso_products',
  blogs: 'yasso_blogs',
  reviews: 'yasso_reviews',
  messages: 'yasso_messages',
  homeImages: 'yasso_home_images',
  auth: 'yasso_admin_auth'
};

// Global variables
let uploadedProductImages = [];
let draggedImageIndex = null;

/**
 * Initialize dashboard
 */
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  initializeData();
  loadAllData();
  updateAllStatistics();
  setupEventListeners();
});

/**
 * Check authentication
 */
function checkAuth() {
  const isAuthenticated = localStorage.getItem(STORAGE_KEYS.auth);
  if (!isAuthenticated) {
    localStorage.setItem(STORAGE_KEYS.auth, 'true');
  }
}

/**
 * Logout function
 */
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem(STORAGE_KEYS.auth);
    window.location.href = 'index.html';
  }
}

/**
 * Initialize sample data if storage is empty
 */
function initializeData() {
  // Initialize products
  if (!localStorage.getItem(STORAGE_KEYS.products)) {
    const sampleProducts = [
      {
        id: 1,
        name: "Triumph Leather Bag",
        price: 755.00,
        type: "Bag",
        color: "Brown",
        image: "assets/img/product5/p-s-1-1.png",
        images: ["assets/img/product5/p-s-1-1.png"],
        description: "Crafted from finest leather for modern icons.",
        sku: "TB-001",
        isNew: false,
        isBestseller: true,
        inStock: true
      },
      {
        id: 2,
        name: "Golden Line Watch",
        price: 955.00,
        type: "Watch",
        color: "Gold",
        image: "assets/img/product5/p-s-1-2.png",
        images: ["assets/img/product5/p-s-1-2.png"],
        description: "Premium watch with golden accents.",
        sku: "GL-002",
        isNew: true,
        isBestseller: true,
        inStock: true
      },
      {
        id: 3,
        name: "Round Dial Semi",
        price: 555.00,
        type: "Watch",
        color: "Beige",
        image: "assets/img/product5/p-s-1-3.png",
        images: ["assets/img/product5/p-s-1-3.png"],
        description: "Elegant design with practical functionality.",
        sku: "RD-003",
        isNew: false,
        isBestseller: false,
        inStock: true
      }
    ];
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(sampleProducts));
  }

  // Initialize blogs
  if (!localStorage.getItem(STORAGE_KEYS.blogs)) {
    const sampleBlogs = [
      {
        id: 1,
        title: "2024 Fashion Trends You Need to Know",
        category: "Fashion",
        author: "Sarah Johnson",
        image: "assets/img/blog/blog-s-1-1.png",
        content: "Discover the hottest fashion trends of 2024...",
        date: "2024-02-15",
        status: "published"
      },
      {
        id: 2,
        title: "How to Choose the Perfect Leather Bag",
        category: "Tips",
        author: "Michael Chen",
        image: "assets/img/blog/blog-s-1-2.png",
        content: "Learn the secrets to selecting quality leather bags...",
        date: "2024-02-10",
        status: "published"
      }
    ];
    localStorage.setItem(STORAGE_KEYS.blogs, JSON.stringify(sampleBlogs));
  }

  // Initialize reviews
  if (!localStorage.getItem(STORAGE_KEYS.reviews)) {
    const sampleReviews = [
      {
        id: 1,
        productId: 1,
        productName: "Triumph Leather Bag",
        customerName: "Emma Wilson",
        rating: 5,
        comment: "Absolutely love this bag! Quality is outstanding.",
        date: "2024-02-14",
        status: "approved"
      },
      {
        id: 2,
        productId: 2,
        productName: "Golden Line Watch",
        customerName: "James Brown",
        rating: 4,
        comment: "Great watch, but delivery took a bit long.",
        date: "2024-02-12",
        status: "pending"
      }
    ];
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(sampleReviews));
  }

  // Initialize messages
  if (!localStorage.getItem(STORAGE_KEYS.messages)) {
    const sampleMessages = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        subject: "Product Question",
        message: "Do you ship internationally?",
        date: "2024-02-16",
        status: "unread"
      },
      {
        id: 2,
        name: "Alice Smith",
        email: "alice@example.com",
        subject: "General Inquiry",
        message: "What are your store hours?",
        date: "2024-02-15",
        status: "read"
      }
    ];
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(sampleMessages));
  }

  // Initialize home images
  if (!localStorage.getItem(STORAGE_KEYS.homeImages)) {
    const sampleHomeImages = [
      {
        id: 1,
        section: "hero",
        title: "Welcome to YASSO",
        image: "assets/img/hero/hero-1-1.jpg",
        link: "shop-sidebar.html",
        order: 1,
        active: true
      },
      {
        id: 2,
        section: "banner",
        title: "Spring Collection",
        image: "assets/img/banner/banner-1-1.jpg",
        link: "shop-sidebar.html",
        order: 1,
        active: true
      }
    ];
    localStorage.setItem(STORAGE_KEYS.homeImages, JSON.stringify(sampleHomeImages));
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Product form
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }

  // Blog form
  const blogForm = document.getElementById('blogForm');
  if (blogForm) {
    blogForm.addEventListener('submit', handleBlogSubmit);
  }

  // Home image form
  const homeImageForm = document.getElementById('homeImageForm');
  if (homeImageForm) {
    homeImageForm.addEventListener('submit', handleHomeImageSubmit);
  }

  // Setup image uploads
  setupProductImageUpload();
  setupBlogImageUpload();
  setupHomeImageUpload();

  // Close modals on outside click
  window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
    }
  };
}

/**
 * Tab switching
 */
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Remove active from all buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  const selectedTab = document.getElementById(tabName + '-tab');
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // Activate button
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(btn => {
    if (btn.textContent.toLowerCase().includes(tabName.replace('-', ' '))) {
      btn.classList.add('active');
    }
  });
}

/**
 * Load all data
 */
function loadAllData() {
  loadProducts();
  loadBlogs();
  loadReviews();
  loadMessages();
  loadHomeImages();
}

/**
 * Update all statistics
 */
function updateAllStatistics() {
  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || '[]');
  const blogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.blogs) || '[]');
  const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.reviews) || '[]');
  const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.messages) || '[]');
  const homeImages = JSON.parse(localStorage.getItem(STORAGE_KEYS.homeImages) || '[]');

  document.getElementById('totalProducts').textContent = products.length;
  document.getElementById('totalBlogs').textContent = blogs.length;
  document.getElementById('totalReviews').textContent = reviews.length;
  document.getElementById('totalMessages').textContent = messages.filter(m => m.status === 'unread').length;
  document.getElementById('totalHomeImages').textContent = homeImages.length;
  
  const totalValue = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
  document.getElementById('totalValue').textContent = totalValue.toFixed(0);
}

// ============================================================================
// PRODUCT MANAGEMENT
// ============================================================================

/**
 * Load products into table
 */
function loadProducts(filteredProducts = null) {
  const products = filteredProducts || JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || '[]');
  const tbody = document.getElementById('productsTableBody');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #D3A334;">No products found</td></tr>';
    return;
  }
  
  products.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.id}</td>
      <td>
        <img src="${product.image}" alt="${product.name}" class="product-image-small">
      </td>
      <td>${product.name}</td>
      <td>EGP ${product.price.toFixed(2)}</td>
      <td><span class="badge badge-stock">${product.type || 'N/A'}</span></td>
      <td><span class="badge badge-stock">${product.color}</span></td>
      <td>${product.inStock ? '<span class="badge badge-stock">In Stock</span>' : '<span class="badge-danger">Out</span>'}</td>
      <td>
        ${product.isNew ? '<span class="badge badge-new">NEW</span>' : ''}
        ${product.isBestseller ? '<span class="badge badge-bestseller">BEST</span>' : ''}
      </td>
      <td>
        <button class="btn-success-dashboard" onclick="editProduct(${product.id})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-danger-dashboard" onclick="deleteProduct(${product.id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Product filters
 */
function applyProductFilters() {
  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || '[]');
  
  const colorFilter = document.getElementById('filterProductColor').value;
  const typeFilter = document.getElementById('filterProductType').value;
  const priceFilter = document.getElementById('filterProductPrice').value;
  const stockFilter = document.getElementById('filterProductStock').value;
  const bestsellerFilter = document.getElementById('filterProductBestseller').value;
  const newFilter = document.getElementById('filterProductNew').value;
  
  let filtered = products.filter(product => {
    // Color filter
    if (colorFilter && product.color !== colorFilter) return false;
    
    // Type filter
    if (typeFilter && product.type !== typeFilter) return false;
    
    // Price filter
    if (priceFilter) {
      const price = parseFloat(product.price);
      if (priceFilter === '0-500' && (price < 0 || price > 500)) return false;
      if (priceFilter === '500-1000' && (price < 500 || price > 1000)) return false;
      if (priceFilter === '1000-2000' && (price < 1000 || price > 2000)) return false;
      if (priceFilter === '2000+' && price < 2000) return false;
    }
    
    // Stock filter
    if (stockFilter === 'inStock' && !product.inStock) return false;
    if (stockFilter === 'outOfStock' && product.inStock) return false;
    
    // Bestseller filter
    if (bestsellerFilter === 'yes' && !product.isBestseller) return false;
    if (bestsellerFilter === 'no' && product.isBestseller) return false;
    
    // New filter
    if (newFilter === 'yes' && !product.isNew) return false;
    if (newFilter === 'no' && product.isNew) return false;
    
    return true;
  });
  
  loadProducts(filtered);
}

function clearProductFilters() {
  document.getElementById('filterProductColor').value = '';
  document.getElementById('filterProductType').value = '';
  document.getElementById('filterProductPrice').value = '';
  document.getElementById('filterProductStock').value = '';
  document.getElementById('filterProductBestseller').value = '';
  document.getElementById('filterProductNew').value = '';
  loadProducts();
}

/**
 * Setup product image upload with drag & drop
 */
function setupProductImageUpload() {
  const uploadArea = document.getElementById('productImageUploadArea');
  const fileInput = document.getElementById('productImageFile');
  const placeholder = document.getElementById('productUploadPlaceholder');
  const previewContainer = document.getElementById('productImagesPreviewContainer');
  const imagesGrid = document.getElementById('productImagesGrid');
  
  if (!uploadArea || !fileInput) return;
  
  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  
  // Highlight on drag
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
      uploadArea.classList.add('drag-over');
    });
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
      uploadArea.classList.remove('drag-over');
    });
  });
  
  // Handle dropped files
  uploadArea.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    handleProductImageFiles(files);
  });
  
  // Handle file selection
  fileInput.addEventListener('change', (e) => {
    handleProductImageFiles(e.target.files);
  });
  
  function handleProductImageFiles(files) {
    if (files.length === 0) return;
    
    if (uploadedProductImages.length + files.length > 5) {
      alert('Maximum 5 images allowed per product');
      return;
    }
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload only image files');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedProductImages.push(e.target.result);
        updateProductImagesPreview();
      };
      reader.readAsDataURL(file);
    });
  }
  
  function updateProductImagesPreview() {
    if (uploadedProductImages.length === 0) {
      previewContainer.style.display = 'none';
      placeholder.style.display = 'block';
      document.getElementById('productImages').value = '';
      return;
    }
    
    placeholder.style.display = 'none';
    previewContainer.style.display = 'block';
    
    imagesGrid.innerHTML = '';
    uploadedProductImages.forEach((imgSrc, index) => {
      const imageItem = document.createElement('div');
      imageItem.className = 'image-item' + (index === 0 ? ' cover-image' : '');
      imageItem.draggable = true;
      imageItem.dataset.index = index;
      
      imageItem.innerHTML = `
        <span class="image-number">${index + 1}</span>
        <img src="${imgSrc}" alt="Product Image ${index + 1}">
        <button type="button" class="btn-remove-image" onclick="removeProductImage(${index})">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      // Drag & drop events for reordering
      imageItem.addEventListener('dragstart', handleDragStart);
      imageItem.addEventListener('dragover', handleDragOver);
      imageItem.addEventListener('drop', handleDrop);
      imageItem.addEventListener('dragend', handleDragEnd);
      
      imagesGrid.appendChild(imageItem);
    });
    
    document.getElementById('productImages').value = JSON.stringify(uploadedProductImages);
  }
  
  function handleDragStart(e) {
    draggedImageIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
  }
  
  function handleDragOver(e) {
    e.preventDefault();
  }
  
  function handleDrop(e) {
    e.preventDefault();
    const dropIndex = parseInt(this.dataset.index);
    
    if (draggedImageIndex !== null && draggedImageIndex !== dropIndex) {
      // Reorder images
      const [draggedImage] = uploadedProductImages.splice(draggedImageIndex, 1);
      uploadedProductImages.splice(dropIndex, 0, draggedImage);
      updateProductImagesPreview();
    }
  }
  
  function handleDragEnd() {
    this.classList.remove('dragging');
    draggedImageIndex = null;
  }
  
  window.updateProductImagesPreview = updateProductImagesPreview;
}

function removeProductImage(index) {
  uploadedProductImages.splice(index, 1);
  window.updateProductImagesPreview();
  document.getElementById('productImageFile').value = '';
}

function resetProductImageUpload() {
  uploadedProductImages = [];
  window.updateProductImagesPreview();
  document.getElementById('productImageFile').value = '';
}

/**
 * Product modal functions
 */
function openAddProductModal() {
  document.getElementById('productModalTitle').textContent = 'Add New Product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('productInStock').checked = true;
  resetProductImageUpload();
  document.getElementById('productModal').style.display = 'block';
}

function editProduct(productId) {
  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || '[]');
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    alert('Product not found');
    return;
  }
  
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('productId').value = product.id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productType').value = product.type || '';
  document.getElementById('productColor').value = product.color;
  document.getElementById('productDescription').value = product.description || '';
  document.getElementById('productSKU').value = product.sku || '';
  document.getElementById('productIsNew').checked = product.isNew || false;
  document.getElementById('productIsBestseller').checked = product.isBestseller || false;
  document.getElementById('productInStock').checked = product.inStock;
  
  uploadedProductImages = product.images || [product.image];
  window.updateProductImagesPreview();
  
  document.getElementById('productModal').style.display = 'block';
}

function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }
  
  let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || '[]');
  products = products.filter(p => p.id !== productId);
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  
  loadProducts();
  updateAllStatistics();
  alert('Product deleted successfully!');
}

function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
}

function handleProductSubmit(e) {
  e.preventDefault();
  
  const productId = document.getElementById('productId').value;
  const isEdit = productId !== '';
  
  if (uploadedProductImages.length === 0) {
    alert('Please upload at least one image');
    return;
  }
  
  const productData = {
    id: isEdit ? parseInt(productId) : getNextId(STORAGE_KEYS.products),
    name: document.getElementById('productName').value,
    price: parseFloat(document.getElementById('productPrice').value),
    type: document.getElementById('productType').value,
    color: document.getElementById('productColor').value,
    image: uploadedProductImages[0],
    images: uploadedProductImages,
    description: document.getElementById('productDescription').value,
    sku: document.getElementById('productSKU').value || `PRD-${Date.now()}`,
    isNew: document.getElementById('productIsNew').checked,
    isBestseller: document.getElementById('productIsBestseller').checked,
    inStock: document.getElementById('productInStock').checked
  };
  
  let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || '[]');
  
  if (isEdit) {
    const index = products.findIndex(p => p.id === productData.id);
    if (index !== -1) {
      products[index] = productData;
    }
  } else {
    products.push(productData);
  }
  
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  loadProducts();
  updateAllStatistics();
  closeProductModal();
  
  alert(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
}

// ============================================================================
// BLOG MANAGEMENT
// ============================================================================

/**
 * Load blogs into table
 */
function loadBlogs(filteredBlogs = null) {
  const blogs = filteredBlogs || JSON.parse(localStorage.getItem(STORAGE_KEYS.blogs) || '[]');
  const tbody = document.getElementById('blogsTableBody');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (blogs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #D3A334;">No blog posts found</td></tr>';
    return;
  }
  
  blogs.forEach(blog => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${blog.id}</td>
      <td>
        <img src="${blog.image}" alt="${blog.title}" class="product-image-small">
      </td>
      <td>${blog.title}</td>
      <td><span class="badge badge-stock">${blog.category}</span></td>
      <td>${blog.author}</td>
      <td>${blog.date}</td>
      <td>
        <span class="badge badge-${blog.status === 'published' ? 'published' : 'draft'}">
          ${blog.status.toUpperCase()}
        </span>
      </td>
      <td>
        <button class="btn-success-dashboard" onclick="editBlog(${blog.id})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-danger-dashboard" onclick="deleteBlog(${blog.id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Blog filters
 */
function applyBlogFilters() {
  const blogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.blogs) || '[]');
  
  const statusFilter = document.getElementById('filterBlogStatus').value;
  const categoryFilter = document.getElementById('filterBlogCategory').value;
  
  let filtered = blogs.filter(blog => {
    if (statusFilter && blog.status !== statusFilter) return false;
    if (categoryFilter && blog.category !== categoryFilter) return false;
    return true;
  });
  
  loadBlogs(filtered);
}

function clearBlogFilters() {
  document.getElementById('filterBlogStatus').value = '';
  document.getElementById('filterBlogCategory').value = '';
  loadBlogs();
}

/**
 * Setup blog image upload
 */
function setupBlogImageUpload() {
  const uploadArea = document.getElementById('blogImageUploadArea');
  const fileInput = document.getElementById('blogImageFile');
  const placeholder = document.getElementById('blogUploadPlaceholder');
  const preview = document.getElementById('blogImagePreview');
  const previewImg = document.getElementById('blogImagePreviewImg');
  
  if (!uploadArea || !fileInput) return;
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        placeholder.style.display = 'none';
        preview.style.display = 'block';
        previewImg.src = e.target.result;
        document.getElementById('blogImage').value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

function removeBlogImage() {
  document.getElementById('blogUploadPlaceholder').style.display = 'block';
  document.getElementById('blogImagePreview').style.display = 'none';
  document.getElementById('blogImageFile').value = '';
  document.getElementById('blogImage').value = '';
}

/**
 * Blog modal functions
 */
function openAddBlogModal() {
  document.getElementById('blogModalTitle').textContent = 'Add New Blog Post';
  document.getElementById('blogForm').reset();
  document.getElementById('blogId').value = '';
  removeBlogImage();
  document.getElementById('blogModal').style.display = 'block';
}

function editBlog(blogId) {
  const blogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.blogs) || '[]');
  const blog = blogs.find(b => b.id === blogId);
  
  if (!blog) {
    alert('Blog post not found');
    return;
  }
  
  document.getElementById('blogModalTitle').textContent = 'Edit Blog Post';
  document.getElementById('blogId').value = blog.id;
  document.getElementById('blogTitle').value = blog.title;
  document.getElementById('blogCategory').value = blog.category;
  document.getElementById('blogAuthor').value = blog.author;
  document.getElementById('blogContent').value = blog.content;
  document.getElementById('blogStatus').value = blog.status;
  
  if (blog.image) {
    document.getElementById('blogUploadPlaceholder').style.display = 'none';
    document.getElementById('blogImagePreview').style.display = 'block';
    document.getElementById('blogImagePreviewImg').src = blog.image;
    document.getElementById('blogImage').value = blog.image;
  }
  
  document.getElementById('blogModal').style.display = 'block';
}

function deleteBlog(blogId) {
  if (!confirm('Are you sure you want to delete this blog post?')) {
    return;
  }
  
  let blogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.blogs) || '[]');
  blogs = blogs.filter(b => b.id !== blogId);
  localStorage.setItem(STORAGE_KEYS.blogs, JSON.stringify(blogs));
  
  loadBlogs();
  updateAllStatistics();
  alert('Blog post deleted successfully!');
}

function closeBlogModal() {
  document.getElementById('blogModal').style.display = 'none';
}

function handleBlogSubmit(e) {
  e.preventDefault();
  
  const blogId = document.getElementById('blogId').value;
  const isEdit = blogId !== '';
  
  const image = document.getElementById('blogImage').value;
  if (!image) {
    alert('Please upload a featured image');
    return;
  }
  
  const blogData = {
    id: isEdit ? parseInt(blogId) : getNextId(STORAGE_KEYS.blogs),
    title: document.getElementById('blogTitle').value,
    category: document.getElementById('blogCategory').value,
    author: document.getElementById('blogAuthor').value,
    image: image,
    content: document.getElementById('blogContent').value,
    date: new Date().toISOString().split('T')[0],
    status: document.getElementById('blogStatus').value
  };
  
  let blogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.blogs) || '[]');
  
  if (isEdit) {
    const index = blogs.findIndex(b => b.id === blogData.id);
    if (index !== -1) {
      blogs[index] = blogData;
    }
  } else {
    blogs.push(blogData);
  }
  
  localStorage.setItem(STORAGE_KEYS.blogs, JSON.stringify(blogs));
  loadBlogs();
  updateAllStatistics();
  closeBlogModal();
  
  alert(isEdit ? 'Blog post updated successfully!' : 'Blog post added successfully!');
}

// ============================================================================
// REVIEWS MANAGEMENT
// ============================================================================

/**
 * Load reviews into table
 */
function loadReviews(filteredReviews = null) {
  const reviews = filteredReviews || JSON.parse(localStorage.getItem(STORAGE_KEYS.reviews) || '[]');
  const tbody = document.getElementById('reviewsTableBody');
  
  if (!tbody) return;
  
  // Populate product filter
  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || '[]');
  const productFilter = document.getElementById('filterReviewProduct');
  if (productFilter && productFilter.options.length <= 1) {
    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = product.name;
      productFilter.appendChild(option);
    });
  }
  
  tbody.innerHTML = '';
  
  if (reviews.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #D3A334;">No reviews found</td></tr>';
    return;
  }
  
  reviews.forEach(review => {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${review.id}</td>
      <td>${review.customerName}</td>
      <td>${review.productName}</td>
      <td><span class="rating-stars">${stars}</span></td>
      <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${review.comment}</td>
      <td>${review.date}</td>
      <td>
        <span class="badge badge-${review.status === 'approved' ? 'approved' : 'pending'}">
          ${review.status.toUpperCase()}
        </span>
      </td>
      <td>
        ${review.status === 'pending' ? 
          `<button class="btn-success-dashboard" onclick="approveReview(${review.id})">
            <i class="fas fa-check"></i> Approve
          </button>` : ''}
        <button class="btn-danger-dashboard" onclick="deleteReview(${review.id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Review filters
 */
function applyReviewFilters() {
  const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.reviews) || '[]');
  
  const ratingFilter = document.getElementById('filterReviewRating').value;
  const statusFilter = document.getElementById('filterReviewStatus').value;
  const productFilter = document.getElementById('filterReviewProduct').value;
  
  let filtered = reviews.filter(review => {
    if (ratingFilter && review.rating !== parseInt(ratingFilter)) return false;
    if (statusFilter && review.status !== statusFilter) return false;
    if (productFilter && review.productId !== parseInt(productFilter)) return false;
    return true;
  });
  
  loadReviews(filtered);
}

function clearReviewFilters() {
  document.getElementById('filterReviewRating').value = '';
  document.getElementById('filterReviewStatus').value = '';
  document.getElementById('filterReviewProduct').value = '';
  loadReviews();
}

function approveReview(reviewId) {
  let reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.reviews) || '[]');
  const review = reviews.find(r => r.id === reviewId);
  if (review) {
    review.status = 'approved';
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
    loadReviews();
    alert('Review approved!');
  }
}

function deleteReview(reviewId) {
  if (!confirm('Are you sure you want to delete this review?')) {
    return;
  }
  
  let reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.reviews) || '[]');
  reviews = reviews.filter(r => r.id !== reviewId);
  localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
  
  loadReviews();
  updateAllStatistics();
  alert('Review deleted successfully!');
}

// ============================================================================
// MESSAGES MANAGEMENT
// ============================================================================

/**
 * Load messages into table
 */
function loadMessages(filteredMessages = null) {
  const messages = filteredMessages || JSON.parse(localStorage.getItem(STORAGE_KEYS.messages) || '[]');
  const tbody = document.getElementById('messagesTableBody');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (messages.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #D3A334;">No messages found</td></tr>';
    return;
  }
  
  messages.forEach(message => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${message.id}</td>
      <td>${message.name}</td>
      <td>${message.email}</td>
      <td><span class="badge badge-stock">${message.subject}</span></td>
      <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${message.message}</td>
      <td>${message.date}</td>
      <td>
        <span class="badge badge-${message.status === 'unread' ? 'unread' : 'read'}">
          ${message.status.toUpperCase()}
        </span>
      </td>
      <td>
        <button class="btn-success-dashboard" onclick="viewMessage(${message.id})">
          <i class="fas fa-eye"></i> View
        </button>
        <button class="btn-danger-dashboard" onclick="deleteMessage(${message.id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Message filters
 */
function applyMessageFilters() {
  const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.messages) || '[]');
  
  const statusFilter = document.getElementById('filterMessageStatus').value;
  const subjectFilter = document.getElementById('filterMessageSubject').value;
  
  let filtered = messages.filter(message => {
    if (statusFilter && message.status !== statusFilter) return false;
    if (subjectFilter && message.subject !== subjectFilter) return false;
    return true;
  });
  
  loadMessages(filtered);
}

function clearMessageFilters() {
  document.getElementById('filterMessageStatus').value = '';
  document.getElementById('filterMessageSubject').value = '';
  loadMessages();
}

function viewMessage(messageId) {
  let messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.messages) || '[]');
  const message = messages.find(m => m.id === messageId);
  
  if (!message) {
    alert('Message not found');
    return;
  }
  
  // Mark as read
  if (message.status === 'unread') {
    message.status = 'read';
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
    updateAllStatistics();
    loadMessages();
  }
  
  const detailsDiv = document.getElementById('messageDetails');
  detailsDiv.innerHTML = `
    <p><strong style="color: #D3A334;">From:</strong> ${message.name}</p>
    <p><strong style="color: #D3A334;">Email:</strong> ${message.email}</p>
    <p><strong style="color: #D3A334;">Subject:</strong> ${message.subject}</p>
    <p><strong style="color: #D3A334;">Date:</strong> ${message.date}</p>
    <hr style="border-color: rgba(201, 162, 77, 0.3);">
    <p><strong style="color: #D3A334;">Message:</strong></p>
    <p style="background: rgba(200, 174, 120, 0.5); padding: 15px; border-radius: 5px; border-left: 3px solid #D3A334;">
      ${message.message}
    </p>
  `;
  
  document.getElementById('messageModal').style.display = 'block';
}

function closeMessageModal() {
  document.getElementById('messageModal').style.display = 'none';
}

function deleteMessage(messageId) {
  if (!confirm('Are you sure you want to delete this message?')) {
    return;
  }
  
  let messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.messages) || '[]');
  messages = messages.filter(m => m.id !== messageId);
  localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  
  loadMessages();
  updateAllStatistics();
  alert('Message deleted successfully!');
}

// ============================================================================
// HOME IMAGES MANAGEMENT
// ============================================================================

/**
 * Load home images into table
 */
function loadHomeImages(filteredImages = null) {
  const images = filteredImages || JSON.parse(localStorage.getItem(STORAGE_KEYS.homeImages) || '[]');
  const tbody = document.getElementById('homeImagesTableBody');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (images.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #D3A334;">No home images found</td></tr>';
    return;
  }
  
  images.forEach(img => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${img.id}</td>
      <td>
        <img src="${img.image}" alt="${img.title}" class="product-image-small">
      </td>
      <td><span class="badge badge-stock">${img.section}</span></td>
      <td>${img.title}</td>
      <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${img.link || 'N/A'}</td>
      <td>${img.order}</td>
      <td>
        <span class="badge badge-${img.active ? 'approved' : 'pending'}">
          ${img.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </td>
      <td>
        <button class="btn-success-dashboard" onclick="editHomeImage(${img.id})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-danger-dashboard" onclick="deleteHomeImage(${img.id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Home image filters
 */
function applyHomeImageFilters() {
  const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.homeImages) || '[]');
  
  const sectionFilter = document.getElementById('filterImageSection').value;
  const statusFilter = document.getElementById('filterImageStatus').value;
  
  let filtered = images.filter(img => {
    if (sectionFilter && img.section !== sectionFilter) return false;
    if (statusFilter === 'active' && !img.active) return false;
    if (statusFilter === 'inactive' && img.active) return false;
    return true;
  });
  
  loadHomeImages(filtered);
}

function clearHomeImageFilters() {
  document.getElementById('filterImageSection').value = '';
  document.getElementById('filterImageStatus').value = '';
  loadHomeImages();
}

/**
 * Setup home image upload
 */
function setupHomeImageUpload() {
  const fileInput = document.getElementById('homeImgFile');
  const placeholder = document.getElementById('homeImgUploadPlaceholder');
  const preview = document.getElementById('homeImgPreview');
  const previewImg = document.getElementById('homeImgPreviewImg');
  
  if (!fileInput) return;
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        placeholder.style.display = 'none';
        preview.style.display = 'block';
        previewImg.src = e.target.result;
        document.getElementById('homeImageSrc').value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

function removeHomeImg() {
  document.getElementById('homeImgUploadPlaceholder').style.display = 'block';
  document.getElementById('homeImgPreview').style.display = 'none';
  document.getElementById('homeImgFile').value = '';
  document.getElementById('homeImageSrc').value = '';
}

/**
 * Home image modal functions
 */
function openAddHomeImageModal() {
  document.getElementById('homeImageModalTitle').textContent = 'Add Home Page Image';
  document.getElementById('homeImageForm').reset();
  document.getElementById('homeImageId').value = '';
  document.getElementById('homeImageActive').checked = true;
  removeHomeImg();
  document.getElementById('homeImageModal').style.display = 'block';
}

function editHomeImage(imageId) {
  const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.homeImages) || '[]');
  const img = images.find(i => i.id === imageId);
  
  if (!img) {
    alert('Image not found');
    return;
  }
  
  document.getElementById('homeImageModalTitle').textContent = 'Edit Home Page Image';
  document.getElementById('homeImageId').value = img.id;
  document.getElementById('homeImageSection').value = img.section;
  document.getElementById('homeImageTitle').value = img.title || '';
  document.getElementById('homeImageLink').value = img.link || '';
  document.getElementById('homeImageOrder').value = img.order;
  document.getElementById('homeImageActive').checked = img.active;
  
  if (img.image) {
    document.getElementById('homeImgUploadPlaceholder').style.display = 'none';
    document.getElementById('homeImgPreview').style.display = 'block';
    document.getElementById('homeImgPreviewImg').src = img.image;
    document.getElementById('homeImageSrc').value = img.image;
  }
  
  document.getElementById('homeImageModal').style.display = 'block';
}

function deleteHomeImage(imageId) {
  if (!confirm('Are you sure you want to delete this image?')) {
    return;
  }
  
  let images = JSON.parse(localStorage.getItem(STORAGE_KEYS.homeImages) || '[]');
  images = images.filter(i => i.id !== imageId);
  localStorage.setItem(STORAGE_KEYS.homeImages, JSON.stringify(images));
  
  loadHomeImages();
  updateAllStatistics();
  alert('Image deleted successfully!');
}

function closeHomeImageModal() {
  document.getElementById('homeImageModal').style.display = 'none';
}

function handleHomeImageSubmit(e) {
  e.preventDefault();
  
  const imageId = document.getElementById('homeImageId').value;
  const isEdit = imageId !== '';
  
  const imageSrc = document.getElementById('homeImageSrc').value;
  if (!imageSrc) {
    alert('Please upload an image');
    return;
  }
  
  const imageData = {
    id: isEdit ? parseInt(imageId) : getNextId(STORAGE_KEYS.homeImages),
    section: document.getElementById('homeImageSection').value,
    title: document.getElementById('homeImageTitle').value,
    image: imageSrc,
    link: document.getElementById('homeImageLink').value,
    order: parseInt(document.getElementById('homeImageOrder').value),
    active: document.getElementById('homeImageActive').checked
  };
  
  let images = JSON.parse(localStorage.getItem(STORAGE_KEYS.homeImages) || '[]');
  
  if (isEdit) {
    const index = images.findIndex(i => i.id === imageData.id);
    if (index !== -1) {
      images[index] = imageData;
    }
  } else {
    images.push(imageData);
  }
  
  localStorage.setItem(STORAGE_KEYS.homeImages, JSON.stringify(images));
  loadHomeImages();
  updateAllStatistics();
  closeHomeImageModal();
  
  alert(isEdit ? 'Image updated successfully!' : 'Image added successfully!');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get next available ID for a storage key
 */
function getNextId(storageKey) {
  const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
}
