// Admin Dashboard JavaScript with Full Backend Integration

// API Configuration
const API_BASE_URL = window.API_CONFIG?.BASE_URL || '/api';
const LOW_STOCK_THRESHOLD = 5;

// Temporary testing toggle: set to false after testing.
const LOGIN_BYPASS_ENABLED = true;


/**
 * Normalize image URL from backend to full HTTP URL
 * Handles various backend response formats and fixes malformed paths
 */
function normalizeImageUrl(url) {
    if (!url) return '';
    
    // Already a full URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    const BACKEND_URL = API_BASE_URL.replace('/api', '');
    
    // Standard format: /images/category/file.jpg (check this FIRST!)
    if (url.startsWith('/images/')) {
        return `${BACKEND_URL}${url}`;
    }
    
    // Missing leading slash: images/category/file.jpg
    if (url.startsWith('images/') && url.includes('/')) {
        return `${BACKEND_URL}/${url}`;
    }
    
    // Fix malformed paths from backend (e.g., "uploadsimagesloge53430a.jpg")
    // This should ONLY run for truly malformed URLs without proper slashes
    if (url.includes('images') && !url.includes('/')) {
        // Extract the path after "images"
        const imagesIndex = url.indexOf('images');
        if (imagesIndex !== -1) {
            // Extract category and filename
            const afterImages = url.substring(imagesIndex + 6); // Skip "images"
            
            // Find the category (blog, popup, content, logo, etc.)
            const pathMatch = afterImages.match(/([a-z]+)([a-f0-9-]+\.(?:jpg|jpeg|png|gif|webp))/i);
            if (pathMatch) {
                const category = pathMatch[1]; // e.g., "log" or "blog"
                const filename = pathMatch[2]; // e.g., "e53430a-5527-4231.jpeg"
                
                console.log('?? Fixing malformed URL:', url);
                console.log('   - Category:', category, '?', category);
                console.log('   - Filename:', filename);
                
                // Fix common category abbreviations
                let fixedCategory = category;
                if (category === 'log' || category === 'logo') fixedCategory = 'logo';
                else if (category === 'pop' || category === 'popup') fixedCategory = 'popup';
                else if (category === 'cont' || category === 'content') fixedCategory = 'content';
                else if (category === 'blog') fixedCategory = 'blog';
                
                return `${BACKEND_URL}/images/${fixedCategory}/${filename}`;
            }
        }
    }
    
    // Fallback for any path starting with /
    if (url.startsWith('/')) {
        return `${BACKEND_URL}${url}`;
    }
    
    // Fallback: assume it's a relative path
    return `${BACKEND_URL}/${url}`;
}

// Placeholder Images
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';

// Authentication State
let authToken = localStorage.getItem('adminToken');
let currentUser = localStorage.getItem('adminUsername');
let currentPage = 0;
const pageSize = 10;

// Current Editing IDs
let currentEditId = null;
let currentEditType = null;
let currentEditingProduct = null;

// ==================== Authentication ====================

// Check authentication on load
document.addEventListener('DOMContentLoaded', () => {
    if (LOGIN_BYPASS_ENABLED) {
        initializeBypassSession();
    } else if (authToken) {
        validateToken();
    } else {
        showLoginModal();
    }
    
    // Initialize drag and drop for all upload zones after DOM is ready
    initializeAllDragDropZones();
});

// Show login modal
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('dashboardContainer').classList.add('dashboard-hidden');
}

// Hide login modal
function hideLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('dashboardContainer').classList.remove('dashboard-hidden');
}

function initializeBypassSession() {
    authToken = authToken || 'bypass-testing-token';
    currentUser = currentUser || 'Testing Admin';
    document.getElementById('adminUsername').textContent = currentUser;
    hideLoginModal();
    initializeDashboard();
}

// Validate token
async function validateToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/validate`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.valid) {
                currentUser = data.username;
                document.getElementById('adminUsername').textContent = currentUser;
                hideLoginModal();
                initializeDashboard();
                return;
            }
        }
    } catch (error) {
        console.error('Token validation error:', error);
    }
    
    // If validation fails, show login
    authToken = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    showLoginModal();
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usernameOrEmail: username,
                password: password
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            currentUser = data.username;
            localStorage.setItem('adminToken', authToken);
            localStorage.setItem('adminUsername', currentUser);
            
            document.getElementById('adminUsername').textContent = currentUser;
            hideLoginModal();
            initializeDashboard();
        } else {
            const error = await response.text();
            errorDiv.textContent = error || 'Login failed. Please check your credentials.';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Connection error. Please try again.';
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    authToken = null;
    currentUser = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');

    if (LOGIN_BYPASS_ENABLED) {
        initializeBypassSession();
        return;
    }

    showLoginModal();
});

// Handle unauthorized access (401 errors)
function handleUnauthorized() {
    if (LOGIN_BYPASS_ENABLED) {
        console.warn('Unauthorized response ignored because login bypass is enabled.');
        return;
    }

    console.warn('Unauthorized access detected - clearing session');
    authToken = null;
    currentUser = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    showLoginModal();
    
    // Show error message in the login modal
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = 'Your session has expired. Please log in again.';
    }
}

// ==================== API Helper Functions ====================

async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        ...defaultOptions,
        headers: defaultOptions.headers
    });
    
    if (response.status === 401) {
        if (!LOGIN_BYPASS_ENABLED) {
            // Token expired, redirect to login
            authToken = null;
            localStorage.removeItem('adminToken');
            showLoginModal();
        }
        throw new Error('Unauthorized');
    }
    
    // Check if response is successful
    if (!response.ok) {
        let errorBody = '';
        try {
            errorBody = await response.text();
        } catch (e) {
            // Ignore parse/read errors and fall back to status text only
        }

        const message = errorBody
            ? `HTTP ${response.status}: ${errorBody}`
            : `HTTP ${response.status}: ${response.statusText}`;

        const error = new Error(message);
        error.response = response;
        throw error;
    }
    
    return response;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== Drag & Drop Image Upload Functionality ====================

/**
 * Initialize drag and drop for an upload zone
 * @param {string} uploadZoneId - ID of the upload zone element
 * @param {string} endpoint - API endpoint for upload (e.g., '/blog-posts/upload-image')
 * @param {string} targetInputId - ID of the input field to populate with the uploaded image URL
 * @param {string} previewContainerId - ID of the preview container element
 */
function initDragAndDrop(uploadZoneId, endpoint, targetInputId, previewContainerId) {
    const uploadZone = document.getElementById(uploadZoneId);
    const fileInput = uploadZone.querySelector('input[type="file"]');
    const targetInput = document.getElementById(targetInputId);
    const previewContainer = document.getElementById(previewContainerId);
    
    if (!uploadZone || !fileInput || !targetInput) {
        console.error('Drag and drop initialization failed - missing elements');
        return;
    }
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.add('drag-active');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.remove('drag-active');
        }, false);
    });
    
    // Handle dropped files
    uploadZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleImageUpload(files[0], endpoint, targetInput, previewContainer, uploadZone);
        }
    }, false);
    
    // Handle file input change (click to upload)
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0], endpoint, targetInput, previewContainer, uploadZone);
        }
    });
    
    // Make the label clickable
    const label = uploadZone.querySelector('.upload-zone-label');
    if (label) {
        label.addEventListener('click', () => {
            fileInput.click();
        });
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Handle image upload to backend
 * @param {File} file - The file to upload
 * @param {string} endpoint - API endpoint for upload
 * @param {HTMLInputElement} targetInput - Input field to populate with URL
 * @param {HTMLElement} previewContainer - Container for image preview
 * @param {HTMLElement} uploadZone - Upload zone element for UI feedback
 */
async function handleImageUpload(file, endpoint, targetInput, previewContainer, uploadZone) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showUploadError(uploadZone, 'Please upload an image file (JPG, PNG, GIF, WebP)');
        return;
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showUploadError(uploadZone, 'File size must be less than 10MB');
        return;
    }
    
    // Show uploading state
    uploadZone.classList.add('uploading');
    const uploadText = uploadZone.querySelector('.upload-text');
    const originalText = uploadText.textContent;
    uploadText.textContent = 'Uploading...';
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Upload failed');
        }
        
        const imageUrl = await response.text();
        const normalizedUrl = normalizeImageUrl(imageUrl);
        
        console.log('? Upload successful!');
        console.log('?? Raw URL from backend:', imageUrl);
        console.log('?? Normalized URL:', normalizedUrl);
        console.log('?? Backend URL:', API_BASE_URL.replace('/api', ''));
        
        // Update the target input field with original URL (for backend)
        targetInput.value = imageUrl;
        
        // Delay to ensure backend has finished writing the file and static handler is ready
        console.log('? Waiting 1 second for file to be ready...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show preview with normalized URL
        showImagePreview(normalizedUrl, previewContainer, targetInput);
        
        // Hide upload zone (optional - you can keep it visible)
        uploadZone.style.display = 'none';
        
        // Success feedback
        uploadText.textContent = originalText;
        uploadZone.classList.remove('uploading');
        
        console.log('? Image uploaded successfully:', imageUrl);
        
    } catch (error) {
        console.error('Upload error:', error);
        showUploadError(uploadZone, error.message || 'Upload failed. Please try again.');
        uploadText.textContent = originalText;
        uploadZone.classList.remove('uploading');
    }
}

/**
 * Show image preview with remove button
 * @param {string} imageUrl - Already normalized full URL
 * @param {HTMLElement} previewContainer - Container element
 * @param {HTMLInputElement} targetInput - Associated input field
 */
function showImagePreview(imageUrl, previewContainer, targetInput) {
    if (!previewContainer) return;
    
    // imageUrl should already be normalized to full URL
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : normalizeImageUrl(imageUrl);
    
    console.log('??? Showing image preview:');
    console.log('   - URL:', fullImageUrl);
    console.log('   - Container:', previewContainer.id);
    
    // Clear previous content
    previewContainer.innerHTML = '';
    
    // Create container div
    const container = document.createElement('div');
    container.className = 'image-preview-container';
    
    // Create image element
    const img = document.createElement('img');
    img.src = fullImageUrl;
    img.alt = 'Uploaded image';
    
    let retryCount = 0;
    const maxRetries = 3;
    
    // Add error handler with retry logic
    img.addEventListener('error', (e) => {
        if (retryCount < maxRetries) {
            retryCount++;
            console.warn(`?? Image load failed, retrying (${retryCount}/${maxRetries})...`);
            
            // Wait a bit and retry
            setTimeout(() => {
                img.src = '';  // Clear src
                img.src = fullImageUrl + '?retry=' + retryCount;  // Add cache buster
            }, 500 * retryCount);  // Exponential backoff
        } else {
            console.error('? Failed to load image after', maxRetries, 'retries:', fullImageUrl);
            img.style.border = '2px solid #dc3545';
            img.style.padding = '10px';
            img.title = 'Failed to load image. Check backend is serving files from /images/';
            
            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 5px;';
            errorMsg.textContent = '?? Image failed to load. File may not be accessible.';
            container.appendChild(errorMsg);
        }
    });
    
    // Add load handler
    img.addEventListener('load', (e) => {
        console.log('? Image loaded successfully:', fullImageUrl);
        img.style.border = '';  // Clear any error styling
        retryCount = maxRetries;  // Stop any pending retries
    });
    
    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'image-preview-remove';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => {
        removeImagePreview(previewContainer.id, targetInput.id);
    });
    
    // Assemble the preview
    container.appendChild(img);
    container.appendChild(removeBtn);
    previewContainer.appendChild(container);
    previewContainer.style.display = 'block';
}

/**
 * Remove image preview and clear input
 */
function removeImagePreview(previewContainerId, targetInputId) {
    const previewContainer = document.getElementById(previewContainerId);
    const targetInput = document.getElementById(targetInputId);
    const uploadZone = previewContainer.previousElementSibling;
    
    if (previewContainer) {
        previewContainer.innerHTML = '';
        previewContainer.style.display = 'none';
    }
    
    if (targetInput) {
        targetInput.value = '';
    }
    
    if (uploadZone && uploadZone.classList.contains('upload-zone')) {
        uploadZone.style.display = 'block';
    }
}

/**
 * Show upload error message
 */
function showUploadError(uploadZone, message) {
    let errorDiv = uploadZone.querySelector('.upload-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'upload-error';
        uploadZone.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.classList.add('visible');
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.classList.remove('visible');
    }, 5000);
}

// ==================== Drag & Drop Initialization ====================

/**
 * Initialize all drag-and-drop zones after DOM is loaded
 */
function initializeAllDragDropZones() {
    console.log('?? Initializing drag-and-drop zones...');
    
    // Blog image upload
    const blogUploadZone = document.getElementById('blogImageUploadZone');
    if (blogUploadZone) {
        console.log('? Initializing blog image drag-and-drop');
        initDragAndDrop('blogImageUploadZone', '/blog-posts/upload-image', 'blogImage', 'blogImagePreview');
        
        // Handle manual URL input for blog image
        const blogImageURL = document.getElementById('blogImageURL');
        if (blogImageURL) {
            blogImageURL.addEventListener('input', (e) => {
                const url = e.target.value.trim();
                const blogImageInput = document.getElementById('blogImage');
                const uploadZone = document.getElementById('blogImageUploadZone');
                const previewContainer = document.getElementById('blogImagePreview');
                
                if (url) {
                    blogImageInput.value = url;
                    uploadZone.style.display = 'none';
                    showImagePreview(url, previewContainer, blogImageInput);
                } else {
                    blogImageInput.value = '';
                    previewContainer.innerHTML = '';
                    previewContainer.style.display = 'none';
                    uploadZone.style.display = 'block';
                }
            });
        }
    } else {
        console.log('?? Blog upload zone not found');
    }
    
    // Popup and content are initialized in their respective section loaders
    console.log('? Drag-and-drop initialization complete');
}

// ==================== Dashboard Initialization ====================

async function initializeDashboard() {
    setupNavigation();
    setupModals();
    loadDashboardStats();
    loadSection('overview');
}

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            loadSection(section);
        });
    });
    
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('collapsed');
    });
}

// Setup modals
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modals.forEach(modal => modal.style.display = 'none');
            resetForms();
        });
    });
    
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
                resetForms();
            }
        });
    });
}

function resetForms() {
    document.querySelectorAll('form').forEach(form => form.reset());
    currentEditId = null;
    currentEditType = null;
}

// Load section
function loadSection(section) {
    console.log('?? Switching to section:', section);
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Convert section name to camelCase for ID (e.g., 'home-content' -> 'homeContent')
    const sectionId = section.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    
    // Show selected section
    const sectionElement = document.getElementById(`${sectionId}Section`);
    console.log('?? Section element:', sectionElement, 'ID:', `${sectionId}Section`);
    
    if (sectionElement) {
        sectionElement.classList.add('active');
        console.log('? Added active class to section');
        
        // Update page title
        const titles = {
            'overview': 'Dashboard Overview',
            'messages': 'Contact Messages',
            'blog': 'Blog Posts Management',
            'home-content': 'Home Content Management',
            'featured-products': 'Featured Products Management',
            'products': 'Product Management',
            'reviews': 'Reviews & Comments',
            'orders': 'Order Management',
            'categories': 'Category Management',
            'announcements': 'Announcement Popup'
        };
        document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
        
        // Load section data
        switch(section) {
            case 'overview':
                loadDashboardStats();
                break;
            case 'messages':
                loadMessages();
                break;
            case 'blog':
                loadBlogPosts();
                break;
            case 'home-content':
                console.log('?? Loading home content section');
                loadHomeContent();
                break;
            case 'featured-products':
                console.log('? Loading featured products section');
                loadFeaturedProductsSection();
                break;
            case 'products':
                loadProducts();
                break;
            case 'reviews':
                loadReviews();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'categories':
                loadCategoriesSection();
                break;
            case 'announcements':
                loadPopupsSection();
                break;
        }
    } else {
        console.error('? Section element not found:', `${sectionId}Section`);
    }
}

// ==================== Promotional Popups Management ====================

var currentPopupId = null;
var popupCurrentPage = 0;
var popupCurrentFilter = 'all';
var popupCurrentType = 'all';
var _popupUIInited = false;

async function loadPopupsSection() {
    await loadPopups(0, popupCurrentFilter, popupCurrentType);
    initPopupEventListeners();
}

function initPopupEventListeners() {
    if (_popupUIInited) return;
    _popupUIInited = true;
    
    // Add popup button
    const addBtn = document.getElementById('addPopupBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            console.log('Add New Popup clicked');
            currentPopupId = null;
            document.getElementById('popupModalTitle').textContent = 'Add New Popup';
            document.getElementById('popupForm').reset();
            document.getElementById('popupActive').checked = true;
            // Clear date fields explicitly
            document.getElementById('popupStartDate').value = '';
            document.getElementById('popupEndDate').value = '';
            // Reset image upload zone
            document.getElementById('popupImagePreview').innerHTML = '';
            document.getElementById('popupImagePreview').style.display = 'none';
            document.getElementById('popupImageUploadZone').style.display = 'block';
            document.getElementById('popupImage').value = '';
            document.getElementById('popupImageURL').value = '';
            document.getElementById('popupModal').style.display = 'flex';
        });
    } else {
        console.error('addPopupBtn not found!');
    }
    
    // Initialize popup image drag and drop (now that elements exist)
    if (document.getElementById('popupImageUploadZone')) {
        initDragAndDrop('popupImageUploadZone', '/promotional-popups/upload-image', 'popupImage', 'popupImagePreview');
    }
    
    // Handle manual URL input for popup image
    document.getElementById('popupImageURL').addEventListener('input', (e) => {
        const url = e.target.value.trim();
        const popupImageInput = document.getElementById('popupImage');
        const uploadZone = document.getElementById('popupImageUploadZone');
        const previewContainer = document.getElementById('popupImagePreview');
        
        if (url) {
            popupImageInput.value = url;
            uploadZone.style.display = 'none';
            showImagePreview(url, previewContainer, popupImageInput);
        } else {
            popupImageInput.value = '';
            previewContainer.innerHTML = '';
            previewContainer.style.display = 'none';
            uploadZone.style.display = 'block';
        }
    });

    // Filter buttons
    document.querySelectorAll('#announcementsSection .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#announcementsSection .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            popupCurrentFilter = this.dataset.filter;
            loadPopups(0, popupCurrentFilter, popupCurrentType);
        });
    });

    // Type filter
    const typeFilter = document.getElementById('popupTypeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', function() {
            popupCurrentType = this.value;
            loadPopups(0, popupCurrentFilter, popupCurrentType);
        });
    }

    // Form submit
    const popupForm = document.getElementById('popupForm');
    if (popupForm) {
        popupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await savePopup();
        });
    }
}

async function loadPopups(page = 0, filter = 'all', type = 'all') {
    try {
        popupCurrentPage = page;
        let endpoint = '/promotional-popups';
        
        if (filter === 'active') endpoint = '/promotional-popups/active';
        else if (filter === 'scheduled') endpoint = '/promotional-popups/scheduled';
        else if (filter === 'expired') endpoint = '/promotional-popups/expired';
        
        const params = new URLSearchParams({ page, size: 10, sort: 'id,desc' });
        const response = await apiRequest(`${endpoint}?${params}`);
        const data = await response.json();
        
        let popups = data.content || data;
        
        // Filter by type if specified
        if (type !== 'all') {
            popups = popups.filter(p => p.type === type);
        }
        
        renderPopupsTable(popups);
        renderPopupsPagination(data.totalPages || 1, page);
    } catch (error) {
        console.error('Error loading popups:', error);
        alert('Failed to load popups. Please try again.');
    }
}

function renderPopupsTable(popups) {
    const tbody = document.getElementById('popupsTableBody');
    if (!tbody) return;
    
    if (popups.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No popups found</td></tr>';
        return;
    }
    
    tbody.innerHTML = popups.map(popup => {
        const status = getPopupStatus(popup);
        const statusClass = status.toLowerCase().replace(' ', '-');
        const startDate = popup.startDate ? new Date(popup.startDate).toLocaleDateString() : 'Immediate';
        const endDate = popup.endDate ? new Date(popup.endDate).toLocaleDateString() : 'No Expiration';
        
        return `
            <tr>
                <td><strong>${escapeHtml(popup.title)}</strong></td>
                <td><span class="badge badge-${popup.type.toLowerCase()}">${popup.type}</span></td>
                <td><span class="badge badge-${statusClass}">${status}</span></td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td class="actions">
                    <label class="toggle-switch" title="Toggle Active Status">
                        <input type="checkbox" ${popup.isActive ? 'checked' : ''} 
                               onchange="togglePopupStatus(${popup.id})">
                        <span class="toggle-slider"></span>
                    </label>
                    <button class="btn-icon" onclick="editPopup(${popup.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deletePopup(${popup.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function getPopupStatus(popup) {
    if (!popup.isActive) return 'Inactive';
    
    const now = new Date();
    const startDate = popup.startDate ? new Date(popup.startDate) : null;
    const endDate = popup.endDate ? new Date(popup.endDate) : null;
    
    if (startDate && startDate > now) return 'Scheduled';
    if (endDate && endDate < now) return 'Expired';
    if (popup.isActive) return 'Active';
    
    return 'Inactive';
}

function renderPopupsPagination(totalPages, currentPage) {
    // Similar to other pagination functions
    const pagination = document.getElementById('popupsPagination');
    if (!pagination || totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    for (let i = 0; i < totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="loadPopups(${i}, '${popupCurrentFilter}', '${popupCurrentType}')">${i + 1}</button>`;
    }
    pagination.innerHTML = html;
}

async function savePopup() {
    try {
        const startDateVal = document.getElementById('popupStartDate').value;
        const endDateVal = document.getElementById('popupEndDate').value;
        
        // Get image URL from either uploaded image or manual URL input
        const imageUrl = document.getElementById('popupImage').value || document.getElementById('popupImageURL').value || null;
        
        const data = {
            title: document.getElementById('popupTitle').value,
            titleAr: document.getElementById('popupTitleAr').value || null,
            message: document.getElementById('popupMessage').value || null,
            messageAr: document.getElementById('popupMessageAr').value || null,
            image: imageUrl,
            ctaButtonText: document.getElementById('popupCtaText').value || null,
            ctaButtonTextAr: document.getElementById('popupCtaTextAr').value || null,
            ctaLink: document.getElementById('popupCtaLink').value || null,
            type: document.getElementById('popupType').value,
            isActive: document.getElementById('popupActive').checked,
            startDate: startDateVal ? new Date(startDateVal).toISOString() : null,
            endDate: endDateVal ? new Date(endDateVal).toISOString() : null
        };
        
        if (currentPopupId) {
            await apiRequest(`/promotional-popups/${currentPopupId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            alert('Popup updated successfully!');
        } else {
            await apiRequest('/promotional-popups', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            alert('Popup created successfully!');
        }
        
        document.getElementById('popupModal').style.display = 'none';
        loadPopups(popupCurrentPage, popupCurrentFilter, popupCurrentType);
    } catch (error) {
        console.error('Error saving popup:', error);
        alert('Failed to save popup. Please try again.');
    }
}

async function editPopup(id) {
    try {
        currentPopupId = id;
        const response = await apiRequest(`/promotional-popups/${id}`);
        const popup = await response.json();
        
        document.getElementById('popupModalTitle').textContent = 'Edit Popup';
        document.getElementById('popupTitle').value = popup.title || '';
        document.getElementById('popupTitleAr').value = popup.titleAr || '';
        document.getElementById('popupMessage').value = popup.message || '';
        document.getElementById('popupMessageAr').value = popup.messageAr || '';
        document.getElementById('popupImage').value = popup.image || '';
        document.getElementById('popupImageURL').value = '';
        document.getElementById('popupCtaText').value = popup.ctaButtonText || '';
        document.getElementById('popupCtaTextAr').value = popup.ctaButtonTextAr || '';
        document.getElementById('popupCtaLink').value = popup.ctaLink || '';
        document.getElementById('popupType').value = popup.type;
        document.getElementById('popupActive').checked = popup.isActive;
        
        if (popup.startDate) {
            document.getElementById('popupStartDate').value = formatDateTimeLocal(popup.startDate);
        }
        if (popup.endDate) {
            document.getElementById('popupEndDate').value = formatDateTimeLocal(popup.endDate);
        }
        
        // Show image preview if exists
        if (popup.image) {
            const previewContainer = document.getElementById('popupImagePreview');
            const popupImageInput = document.getElementById('popupImage');
            showImagePreview(popup.image, previewContainer, popupImageInput);
            document.getElementById('popupImageUploadZone').style.display = 'none';
        } else {
            document.getElementById('popupImagePreview').innerHTML = '';
            document.getElementById('popupImagePreview').style.display = 'none';
            document.getElementById('popupImageUploadZone').style.display = 'block';
        }
        
        document.getElementById('popupModal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading popup:', error);
        alert('Failed to load popup details. Please try again.');
    }
}

async function togglePopupStatus(id) {
    try {
        await apiRequest(`/promotional-popups/${id}/status`, { method: 'PATCH' });
        alert('Popup status updated successfully!');
        loadPopups(popupCurrentPage, popupCurrentFilter, popupCurrentType);
    } catch (error) {
        console.error('Error toggling popup status:', error);
        alert('Failed to update popup status. Please try again.');
        // Reload to reset toggle
        loadPopups(popupCurrentPage, popupCurrentFilter, popupCurrentType);
    }
}

async function deletePopup(id) {
    if (!confirm('Are you sure you want to delete this popup?')) return;
    
    try {
        await apiRequest(`/promotional-popups/${id}`, { method: 'DELETE' });
        alert('Popup deleted successfully!');
        loadPopups(popupCurrentPage, popupCurrentFilter, popupCurrentType);
    } catch (error) {
        console.error('Error deleting popup:', error);
        alert('Failed to delete popup. Please try again.');
    }
}

function formatDateTimeLocal(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// ==================== Dashboard Stats ====================

async function loadDashboardStats() {
    try {
        // Show loading state
        showLoadingState('overview');
        
        // Load total products
        const productsResponse = await apiRequest('/products/count/active');
        const totalProducts = await productsResponse.text();
        document.getElementById('totalProducts').textContent = totalProducts;
        
        // Load total orders
        const ordersResponse = await apiRequest('/orders');
        const ordersData = await ordersResponse.json();
        document.getElementById('totalOrders').textContent = ordersData.totalElements || 0;
        
        // Load unread messages
        const messagesResponse = await apiRequest('/contact-messages/count/unread');
        const unreadMessages = await messagesResponse.text();
        document.getElementById('unreadMessages').textContent = unreadMessages;
        document.getElementById('unreadBadge').textContent = unreadMessages;
        
        // Load pending reviews
        const reviewsResponse = await apiRequest('/product-reviews/count/pending');
        const pendingReviews = await reviewsResponse.text();
        document.getElementById('pendingReviews').textContent = pendingReviews;
        document.getElementById('pendingReviewsBadge').textContent = pendingReviews;
        
        // Load recent orders
        const recentOrdersResponse = await apiRequest('/orders/recent?limit=5');
        const recentOrders = await recentOrdersResponse.json();
        displayRecentOrders(recentOrders);
        
        // Load active products and compute low-stock by color variant (stock < threshold).
        const inventoryResponse = await apiRequest('/products/active?page=0&size=500');
        const inventoryData = await inventoryResponse.json();
        const inventoryProducts = Array.isArray(inventoryData)
            ? inventoryData
            : (inventoryData.content || []);
        displayLowStock(inventoryProducts);
        
        hideLoadingState('overview');
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        hideLoadingState('overview');
        showError('Failed to load dashboard statistics. Please refresh the page.');
    }
}

function displayRecentOrders(orders) {
    const container = document.getElementById('recentOrdersList');
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="no-data">No recent orders</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="list-item">
            <div class="list-item-info">
                <strong>#${order.id} - ${order.customerName}</strong>
                <span>$${order.totalAmount?.toFixed(2)}</span>
            </div>
            <span class="badge badge-${order.orderStatus?.toLowerCase()}">${order.orderStatus}</span>
        </div>
    `).join('');
}

function displayLowStock(products) {
    const container = document.getElementById('lowStockList');
    const lowStockItems = extractLowStockVariants(products, LOW_STOCK_THRESHOLD);

    if (lowStockItems.length === 0) {
        container.innerHTML = '<p class="no-data">All products in stock</p>';
        return;
    }

    container.innerHTML = lowStockItems.map(item => {
        return `
        <div class="list-item">
            <div class="list-item-info">
                <strong>${escapeHtml(item.productName)}</strong>
                <span>Color: ${escapeHtml(item.color)} | Stock: ${item.stock}</span>
            </div>
            <span class="badge badge-warning">Low</span>
        </div>
        `;
    }).join('');
}

function extractLowStockVariants(products, threshold = LOW_STOCK_THRESHOLD) {
    if (!Array.isArray(products)) {
        return [];
    }

    const safeThreshold = Number.isFinite(Number(threshold)) ? Number(threshold) : LOW_STOCK_THRESHOLD;

    return products.flatMap(product => {
        const productName = product?.name || `Product #${product?.id ?? ''}`;
        const variants = Array.isArray(product?.colorVariants) ? product.colorVariants : [];

        if (variants.length > 0) {
            return variants
                .map(variant => {
                    const parsedStock = Number(variant?.stockQuantity);
                    return {
                        productName,
                        color: variant?.color || 'Default',
                        stock: Number.isFinite(parsedStock) ? parsedStock : 0
                    };
                })
                .filter(item => item.stock < safeThreshold);
        }

        const legacyStockValue = Number(product?.stockQuantity ?? product?.totalStock ?? 0);
        const legacyStock = Number.isFinite(legacyStockValue) ? legacyStockValue : 0;

        if (legacyStock < safeThreshold) {
            return [{
                productName,
                color: product?.color || 'Default',
                stock: legacyStock
            }];
        }

        return [];
    }).sort((a, b) => {
        if (a.stock !== b.stock) {
            return a.stock - b.stock;
        }
        return a.productName.localeCompare(b.productName);
    });
}

// ==================== Contact Messages Management ====================

let currentMessageFilter = 'all';

async function loadMessages(page = 0) {
    try {
        showLoadingState('messages');
        let endpoint = '/contact-messages';
        
        if (currentMessageFilter === 'unread') {
            endpoint = '/contact-messages/unread';
        } else if (currentMessageFilter === 'read') {
            endpoint = '/contact-messages/read';
        }
        
        // Try different possible date field names for sorting
        // Remove sort if it causes errors - let backend handle default sorting
        const possibleDateFields = ['createdAt', 'createdDate', 'sentDate', 'date', 'id'];
        endpoint += `?page=${page}&size=${pageSize}`;
        // Try sorting by createdAt or id (most common in Spring Boot entities)
        // endpoint += `&sort=createdAt,desc`; // Uncomment and adjust field name if needed
        
        const response = await apiRequest(endpoint);
        const data = await response.json();
        
        console.log('Messages API Response:', data); // Debug log
        
        // Handle both paginated (data.content) and array responses
        let messages = [];
        if (Array.isArray(data)) {
            messages = data;
        } else if (data.content && Array.isArray(data.content)) {
            messages = data.content;
        } else if (data.data && Array.isArray(data.data)) {
            messages = data.data;
        }
        
        displayMessages(messages);
        setupPagination('messages', data);
        hideLoadingState('messages');
        
    } catch (error) {
        console.error('Error loading messages:', error);
        hideLoadingState('messages');
        showError('Failed to load messages. Please try again.');
    }
}

function displayMessages(messages) {
    const tbody = document.getElementById('messagesTableBody');
    
    console.log('Displaying messages:', messages); // Debug log
    
    if (!messages || messages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No messages found</td></tr>';
        return;
    }
    
    tbody.innerHTML = messages.map(msg => `
        <tr>
            <td>${formatDate(msg.receivedDate || msg.createdAt || msg.date)}</td>
            <td>${msg.name || 'N/A'}</td>
            <td>${msg.email || 'N/A'}</td>
            <td class="message-preview">${(msg.message || msg.content || '')?.substring(0, 50)}...</td>
            <td><span class="badge badge-${msg.isRead || msg.read ? 'success' : 'warning'}">${msg.isRead || msg.read ? 'Read' : 'Unread'}</span></td>
            <td>
                <button class="btn-icon" onclick="viewMessage(${msg.id})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="toggleMessageRead(${msg.id}, ${!(msg.isRead || msg.read)})" title="${msg.isRead || msg.read ? 'Mark Unread' : 'Mark Read'}">
                    <i class="fas fa-${msg.isRead || msg.read ? 'envelope' : 'envelope-open'}"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteMessage(${msg.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function viewMessage(id) {
    try {
        const response = await apiRequest(`/contact-messages/${id}`);
        const message = await response.json();
        
        const modal = document.getElementById('messageModal');
        const content = document.getElementById('messageDetailContent');
        
        content.innerHTML = `
            <div class="detail-group">
                <label>From:</label>
                <p>${message.name} (${message.email})</p>
            </div>
            <div class="detail-group">
                <label>Phone:</label>
                <p>${message.phone || 'N/A'}</p>
            </div>
            <div class="detail-group">
                <label>Subject:</label>
                <p>${message.subject || 'N/A'}</p>
            </div>
            <div class="detail-group">
                <label>Date:</label>
                <p>${formatDate(message.receivedDate || message.createdAt || message.createdDate || message.date || message.timestamp)}</p>
            </div>
            <div class="detail-group">
                <label>Message:</label>
                <p>${message.message || message.content || 'N/A'}</p>
            </div>
            ${message.adminResponse ? `
                <div class="detail-group">
                    <label>Admin Response:</label>
                    <p>${message.adminResponse}</p>
                </div>
            ` : ''}
        `;
        
        modal.style.display = 'flex';
        
        // Mark as read
        if (!message.isRead) {
            await toggleMessageRead(id, true);
        }
        
    } catch (error) {
        console.error('Error viewing message:', error);
        alert('Error loading message details');
    }
}

async function toggleMessageRead(id, markAsRead) {
    try {
        const endpoint = markAsRead ? 
            `/contact-messages/${id}/mark-read` : 
            `/contact-messages/${id}/mark-unread`;
        
        await apiRequest(endpoint, { method: 'PATCH' });
        loadMessages(currentPage);
        loadDashboardStats();
    } catch (error) {
        console.error('Error updating message:', error);
    }
}

async function deleteMessage(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
        await apiRequest(`/contact-messages/${id}`, { method: 'DELETE' });
        loadMessages(currentPage);
        loadDashboardStats();
    } catch (error) {
        console.error('Error deleting message:', error);
        alert('Error deleting message');
    }
}

// Message filters
document.querySelectorAll('#messagesSection .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#messagesSection .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMessageFilter = btn.getAttribute('data-filter');
        loadMessages(0);
    });
});

// Message search
document.getElementById('messageSearchBtn').addEventListener('click', async () => {
    const keyword = document.getElementById('messageSearch').value;
    if (!keyword) {
        loadMessages(0);
        return;
    }
    
    try {
        const response = await apiRequest(`/contact-messages/search?keyword=${encodeURIComponent(keyword)}&page=0&size=${pageSize}`);
        const data = await response.json();
        displayMessages(data.content || []);
        setupPagination('messages', data);
    } catch (error) {
        console.error('Error searching messages:', error);
    }
});

// ==================== Blog Posts Management ====================

let currentBlogFilter = 'all';

async function loadBlogPosts(page = 0) {
    try {
        showLoadingState('blog');
        let endpoint = '/blog-posts';
        
        if (currentBlogFilter === 'published') {
            endpoint = '/blog-posts/published';
        } else if (currentBlogFilter === 'draft') {
            endpoint = '/blog-posts/drafts';
        }
        
        endpoint += `?page=${page}&size=${pageSize}&sort=createdDate,desc`;
        
        const response = await apiRequest(endpoint);
        const data = await response.json();
        
        displayBlogPosts(data.content || []);
        setupPagination('blog', data);
        hideLoadingState('blog');
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        hideLoadingState('blog');
        showError('Failed to load blog posts. Please try again.');
    }
}

function displayBlogPosts(posts) {
    const tbody = document.getElementById('blogTableBody');
    
    if (!posts || posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No blog posts found</td></tr>';
        return;
    }
    
    tbody.innerHTML = posts.map(post => `
        <tr>
            <td><img src="${post.featuredImage || PLACEHOLDER_IMAGE}" alt="${post.title}" class="table-img"></td>
            <td>${post.title}</td>
            <td>${post.category || 'N/A'}</td>
            <td>${formatDate(post.publishedDate || post.createdDate)}</td>
            <td><span class="badge badge-${post.isPublished ? 'success' : 'warning'}">${post.isPublished ? 'Published' : 'Draft'}</span></td>
            <td>${post.isFeatured ? `<span class="badge badge-info">Yes (${post.featuredOrder})</span>` : '<span class="badge badge-secondary">No</span>'}</td>
            <td>
                <button class="btn-icon" onclick="editBlogPost(${post.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="toggleBlogPublish(${post.id}, ${!post.isPublished})" title="${post.isPublished ? 'Unpublish' : 'Publish'}">
                    <i class="fas fa-${post.isPublished ? 'eye-slash' : 'eye'}"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteBlogPost(${post.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('addBlogBtn').addEventListener('click', () => {
    currentEditId = null;
    document.getElementById('blogModalTitle').textContent = 'Add New Blog Post';
    document.getElementById('blogForm').reset();
    document.getElementById('blogImagePreview').innerHTML = '';
    document.getElementById('blogImagePreview').style.display = 'none';
    document.getElementById('blogImageUploadZone').style.display = 'block';
    document.getElementById('blogImage').value = '';
    document.getElementById('blogImageURL').value = '';
    document.getElementById('blogModal').style.display = 'flex';
});

document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tagsInput = document.getElementById('blogTags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag)
        .join(','); // Backend expects comma-separated string, not array
    
    // Get image URL from either uploaded image or manual URL input
    const imageUrl = document.getElementById('blogImage').value || document.getElementById('blogImageURL').value || '';
    
    const blogData = {
        title: document.getElementById('blogTitle').value,
        titleAr: document.getElementById('blogTitleAr').value || null,
        slug: document.getElementById('blogSlug').value,
        content: document.getElementById('blogContent').value,
        contentAr: document.getElementById('blogContentAr').value || null,
        excerpt: document.getElementById('blogExcerpt').value,
        excerptAr: null, // Add if needed later
        category: document.getElementById('blogCategory').value,
        categoryAr: document.getElementById('blogCategoryAr').value || null,
        featuredImage: imageUrl,
        tags: tagsInput,
        isPublished: document.getElementById('blogPublished').checked,
        isFeatured: document.getElementById('blogFeatured').checked,
        featuredOrder: parseInt(document.getElementById('blogFeaturedOrder').value) || 0,
        authorId: 1 // Default admin author
    };
    
    try {
        if (currentEditId) {
            const response = await apiRequest(`/blog-posts/${currentEditId}`, {
                method: 'PUT',
                body: JSON.stringify(blogData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update blog post: ${errorText}`);
            }
        } else {
            const response = await apiRequest('/blog-posts', {
                method: 'POST',
                body: JSON.stringify(blogData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create blog post: ${errorText}`);
            }
        }
        
        document.getElementById('blogModal').style.display = 'none';
        resetForms();
        loadBlogPosts(currentPage);
    } catch (error) {
        console.error('Error saving blog post:', error);
        alert(`Error saving blog post: ${error.message}`);
    }
});

async function editBlogPost(id) {
    try {
        const response = await apiRequest(`/blog-posts/${id}`);
        const post = await response.json();
        
        currentEditId = id;
        document.getElementById('blogModalTitle').textContent = 'Edit Blog Post';
        document.getElementById('blogTitle').value = post.title;
        document.getElementById('blogTitleAr').value = post.titleAr || '';
        document.getElementById('blogSlug').value = post.slug;
        document.getElementById('blogContent').value = post.content;
        document.getElementById('blogContentAr').value = post.contentAr || '';
        document.getElementById('blogExcerpt').value = post.excerpt || '';
        document.getElementById('blogCategory').value = post.category || '';
        document.getElementById('blogCategoryAr').value = post.categoryAr || '';
        document.getElementById('blogImage').value = post.featuredImage || '';
        document.getElementById('blogImageURL').value = '';
        document.getElementById('blogTags').value = post.tags || ''; // Backend returns comma-separated string
        document.getElementById('blogPublished').checked = post.isPublished;
        document.getElementById('blogFeatured').checked = post.isFeatured || false;
        document.getElementById('blogFeaturedOrder').value = post.featuredOrder || 0;
        
        // Show image preview if exists
        if (post.featuredImage) {
            const previewContainer = document.getElementById('blogImagePreview');
            const blogImageInput = document.getElementById('blogImage');
            showImagePreview(post.featuredImage, previewContainer, blogImageInput);
            document.getElementById('blogImageUploadZone').style.display = 'none';
        } else {
            document.getElementById('blogImagePreview').innerHTML = '';
            document.getElementById('blogImagePreview').style.display = 'none';
            document.getElementById('blogImageUploadZone').style.display = 'block';
        }
        
        document.getElementById('blogModal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading blog post:', error);
        alert('Error loading blog post for editing');
    }
}

async function toggleBlogPublish(id, publish) {
    try {
        const endpoint = publish ? 
            `/blog-posts/${id}/publish` : 
            `/blog-posts/${id}/unpublish`;
        
        await apiRequest(endpoint, { method: 'PATCH' });
        loadBlogPosts(currentPage);
    } catch (error) {
        console.error('Error updating blog post:', error);
    }
}

async function deleteBlogPost(id) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
        await apiRequest(`/blog-posts/${id}`, { method: 'DELETE' });
        loadBlogPosts(currentPage);
    } catch (error) {
        console.error('Error deleting blog post:', error);
        alert('Error deleting blog post');
    }
}

// Blog filters
document.querySelectorAll('#blogSection .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#blogSection .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentBlogFilter = btn.getAttribute('data-filter');
        loadBlogPosts(0);
    });
});

// Blog search
document.getElementById('blogSearchBtn').addEventListener('click', async () => {
    const keyword = document.getElementById('blogSearch').value;
    if (!keyword) {
        loadBlogPosts(0);
        return;
    }
    
    try {
        const response = await apiRequest(`/blog-posts/search?keyword=${encodeURIComponent(keyword)}&page=0&size=${pageSize}`);
        const data = await response.json();
        displayBlogPosts(data.content || []);
        setupPagination('blog', data);
    } catch (error) {
        console.error('Error searching blog posts:', error);
    }
});

// Auto-generate slug from title
document.getElementById('blogTitle').addEventListener('input', (e) => {
    if (!currentEditId) {
        const slug = e.target.value.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        document.getElementById('blogSlug').value = slug;
    }
});

// ==================== Home Content Management ====================

async function loadHomeContent(page = 0) {
    console.log('?? loadHomeContent called - page:', page);
    try {
        showLoadingState('home-content');
        const section = document.getElementById('homeContentSectionFilter')?.value || 'all';
        const type = document.getElementById('homeContentTypeFilter')?.value || 'all';
        
        console.log('Loading home content...', { section, type, page, apiUrl: API_BASE_URL });
        
        let endpoint = '/website-content';
        let data;
        
        // Use /section/{section}/all for section filtering (returns List)
        if (section !== 'all' && type === 'all') {
            endpoint = `/website-content/section/${section}/all`;
            console.log('Fetching by section:', endpoint);
            const response = await apiRequest(endpoint);
            data = await response.json();
            console.log('Section response:', data);
            // Convert List to Page-like structure for consistency
            data = { content: data, totalPages: 1, totalElements: data.length, number: 0 };
        } 
        // Use /type/{type} for type filtering (returns List)
        else if (type !== 'all' && section === 'all') {
            endpoint = `/website-content/type/${type}`;
            console.log('Fetching by type:', endpoint);
            const response = await apiRequest(endpoint);
            data = await response.json();
            console.log('Type response:', data);
            // Convert List to Page-like structure for consistency
            data = { content: data, totalPages: 1, totalElements: data.length, number: 0 };
        }
        // For both filters, fetch all and filter client-side
        else if (section !== 'all' && type !== 'all') {
            endpoint = `/website-content/section/${section}/all`;
            console.log('Fetching by section and filtering by type:', endpoint);
            const response = await apiRequest(endpoint);
            let contents = await response.json();
            console.log('Combined filter response:', contents);
            // Filter by type client-side
            contents = contents.filter(c => c.contentType === type.toUpperCase());
            data = { content: contents, totalPages: 1, totalElements: contents.length, number: 0 };
        }
        // Default: fetch all with pagination
        else {
            endpoint += `?page=${page}&size=${pageSize}&sort=sectionName,asc&sort=displayOrder,asc`;
            console.log('Fetching all content:', endpoint);
            const response = await apiRequest(endpoint);
            data = await response.json();
            console.log('All content response:', data);
        }
        
        console.log('? Home content loaded successfully:', data);
        
        displayHomeContent(data.content || data || []);
        
        // Setup pagination (wrapped in try-catch to not break display)
        try {
            setupPagination('homeContent', data);
        } catch (paginationError) {
            console.warn('?? Pagination setup failed:', paginationError);
        }
        
        hideLoadingState('home-content');
        
    } catch (error) {
        console.error('? Error loading home content:', error);
        hideLoadingState('home-content');
        
        // Show empty state with helpful message
        const container = document.getElementById('homeContentList');
        if (container) {
            container.innerHTML = `
                <div class="no-data-state">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #c9a34d; margin-bottom: 15px;"></i>
                    <p style="font-size: 18px; margin-bottom: 10px;">Failed to load content</p>
                    <p style="color: #888; margin-bottom: 20px;">${error.message || 'Please check if the backend server is running'}</p>
                    <p style="color: #888; font-size: 14px;">Expected endpoint: ${API_BASE_URL}/website-content</p>
                    <button class="btn-primary" onclick="loadHomeContent()" style="margin-top: 15px;">
                        <i class="fas fa-refresh"></i> Retry
                    </button>
                </div>
            `;
        }
        showError('Failed to load home content. Please check the console for details.');
    }
}

function displayHomeContent(contents) {
    const container = document.getElementById('homeContentList');
    
    console.log('?? Displaying home content:', contents?.length || 0, 'items');
    console.log('?? Container element:', container);
    console.log('?? First item:', contents?.[0]);
    
    if (!container) {
        console.error('? Container element #homeContentList not found!');
        return;
    }
    
    if (!contents || contents.length === 0) {
        container.innerHTML = `
            <div class="no-data-state" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-home" style="font-size: 64px; color: #c9a34d; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3 style="color: var(--text-muted); margin-bottom: 10px;">No Home Content Yet</h3>
                <p style="color: var(--text-muted); margin-bottom: 25px;">
                    Get started by adding your first piece of content for the home page.
                </p>
                <button class="btn-primary" onclick="document.getElementById('addHomeContentBtn').click()">
                    <i class="fas fa-plus"></i> Add Your First Content
                </button>
                <div style="margin-top: 30px; padding: 20px; background: rgba(201, 162, 77, 0.1); border-radius: 8px; text-align: left; max-width: 500px; margin-left: auto; margin-right: auto;">
                    <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 10px;">
                        <strong>?? Quick Tip:</strong> To create a complete Hero section:
                    </p>
                    <ol style="font-size: 13px; color: var(--text-muted); margin-left: 20px;">
                        <li>Add 6 content items with Section = "Hero_EN"</li>
                        <li>Set Display Order: 1, 2, 3, 4, 5, 6</li>
                        <li>Types: TEXT, TEXT, HTML, TEXT, URL, IMAGE</li>
                        <li>Repeat for "Hero_AR" for Arabic content</li>
                    </ol>
                </div>
            </div>
        `;
        return;
    }
    
    const htmlContent = contents.map(content => `
        <div class="content-card">
            ${content.contentType === 'IMAGE' ? `
                <img src="${content.contentValue}" alt="${content.sectionName}" class="content-img" onerror="this.src='${PLACEHOLDER_IMAGE}'">
            ` : ''}
            <div class="content-info">
                <h4>${content.pageName} - ${content.sectionName}</h4>
                <p class="content-section-tag">Section: ${content.sectionName}</p>
                <p class="content-type-tag">${content.contentType}</p>
                <p class="content-order-tag">Order: ${content.displayOrder || 1}</p>
                ${content.contentType !== 'IMAGE' ? `
                    <p class="content-preview">${(content.contentValue || '').substring(0, 100)}${(content.contentValue || '').length > 100 ? '...' : ''}</p>
                ` : ''}
                <div class="content-actions">
                    <button class="btn-icon" onclick="editHomeContent(${content.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="toggleContentStatus(${content.id})" title="${content.isActive ? 'Deactivate' : 'Activate'}">
                        <i class="fas fa-${content.isActive ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteHomeContent(${content.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <span class="badge badge-${content.isActive ? 'success' : 'secondary'}">${content.isActive ? 'Active' : 'Inactive'}</span>
        </div>
    `).join('');
    
    console.log('?? Generated HTML length:', htmlContent.length);
    console.log('?? First 200 chars:', htmlContent.substring(0, 200));
    container.innerHTML = htmlContent;
    console.log('? HTML set to container. Container display:', window.getComputedStyle(container).display);
    console.log('? Container visibility:', window.getComputedStyle(container).visibility);
    console.log('? Container children count:', container.children.length);
}

document.getElementById('addHomeContentBtn').addEventListener('click', () => {
    currentEditId = null;
    document.getElementById('homeContentModalTitle').textContent = 'Add Home Content';
    document.getElementById('homeContentForm').reset();
    document.getElementById('contentPageName').value = 'Home';
    document.getElementById('contentSectionName').value = 'Hero';
    document.getElementById('contentType').value = 'TEXT';
    document.getElementById('contentDisplayOrder').value = 1;
    document.getElementById('contentActive').checked = true;
    // Reset image upload zone
    document.getElementById('contentImagePreview').innerHTML = '';
    document.getElementById('contentImagePreview').style.display = 'none';
    document.getElementById('contentImageUploadZone').style.display = 'block';
    document.getElementById('contentImageUploadContainer').style.display = 'none';
    document.getElementById('contentValueContainer').style.display = 'block';
    document.getElementById('homeContentModal').style.display = 'flex';
});

// Initialize content image drag and drop (now that elements exist)
if (document.getElementById('contentImageUploadZone')) {
    initDragAndDrop('contentImageUploadZone', '/website-content/upload-image', 'contentValue', 'contentImagePreview');
}

// Handle content type change to show/hide upload zone
document.getElementById('contentType').addEventListener('change', (e) => {
    const contentType = e.target.value;
    const uploadContainer = document.getElementById('contentImageUploadContainer');
    const valueContainer = document.getElementById('contentValueContainer');
    
    if (contentType === 'IMAGE') {
        uploadContainer.style.display = 'block';
        valueContainer.style.display = 'none';
    } else {
        uploadContainer.style.display = 'none';
        valueContainer.style.display = 'block';
    }
});

document.getElementById('homeContentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const contentData = {
        pageName: document.getElementById('contentPageName').value,
        sectionName: document.getElementById('contentSectionName').value,
        contentType: document.getElementById('contentType').value,
        contentValue: document.getElementById('contentValue').value,
        contentValueAr: document.getElementById('contentValueAr').value || null,
        displayOrder: parseInt(document.getElementById('contentDisplayOrder').value) || 1,
        isActive: document.getElementById('contentActive').checked
    };
    
    console.log('Saving home content:', contentData);
    
    try {
        let response;
        if (currentEditId) {
            response = await apiRequest(`/website-content/${currentEditId}`, {
                method: 'PUT',
                body: JSON.stringify(contentData)
            });
        } else {
            response = await apiRequest('/website-content', {
                method: 'POST',
                body: JSON.stringify(contentData)
            });
        }
        
        if (response.ok) {
            document.getElementById('homeContentModal').style.display = 'none';
            showSuccess('Content saved successfully!');
            loadHomeContent(currentPage);
        } else {
            const error = await response.text();
            console.error('Error response:', error);
            alert('Error saving content: ' + error);
        }
    } catch (error) {
        console.error('Error saving content:', error);
        alert('Error saving content: ' + error.message);
    }
});

async function editHomeContent(id) {
    try {
        const response = await apiRequest(`/website-content/${id}`);
        const content = await response.json();
        
        console.log('Editing content:', content);
        
        currentEditId = id;
        document.getElementById('homeContentModalTitle').textContent = 'Edit Home Content';
        document.getElementById('contentPageName').value = content.pageName || 'Home';
        document.getElementById('contentSectionName').value = content.sectionName || '';
        document.getElementById('contentType').value = content.contentType || 'TEXT';
        document.getElementById('contentValue').value = content.contentValue || '';
        document.getElementById('contentValueAr').value = content.contentValueAr || '';
        document.getElementById('contentDisplayOrder').value = content.displayOrder || 1;
        document.getElementById('contentActive').checked = content.isActive !== false;
        
        // Handle IMAGE type - show upload zone and preview if exists
        const uploadContainer = document.getElementById('contentImageUploadContainer');
        const valueContainer = document.getElementById('contentValueContainer');
        
        if (content.contentType === 'IMAGE') {
            uploadContainer.style.display = 'block';
            valueContainer.style.display = 'none';
            
            // Show image preview if exists
            if (content.contentValue) {
                const previewContainer = document.getElementById('contentImagePreview');
                const contentValueInput = document.getElementById('contentValue');
                showImagePreview(content.contentValue, previewContainer, contentValueInput);
                document.getElementById('contentImageUploadZone').style.display = 'none';
            } else {
                document.getElementById('contentImagePreview').innerHTML = '';
                document.getElementById('contentImagePreview').style.display = 'none';
                document.getElementById('contentImageUploadZone').style.display = 'block';
            }
        } else {
            uploadContainer.style.display = 'none';
            valueContainer.style.display = 'block';
        }
        
        document.getElementById('homeContentModal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading content:', error);
        alert('Error loading content for editing');
    }
}

async function toggleContentStatus(id) {
    try {
        await apiRequest(`/website-content/${id}/status`, { method: 'PATCH' });
        showSuccess('Content status updated!');
        loadHomeContent(currentPage);
    } catch (error) {
        console.error('Error updating content status:', error);
        alert('Error updating content status');
    }
}

async function deleteHomeContent(id) {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
        const response = await apiRequest(`/website-content/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showSuccess('Content deleted successfully!');
            loadHomeContent(currentPage);
        } else {
            const error = await response.text();
            alert('Error deleting content: ' + error);
        }
    } catch (error) {
        console.error('Error deleting content:', error);
        alert('Error deleting content: ' + error.message);
    }
}

// Home content filters
document.getElementById('homeContentSectionFilter').addEventListener('change', () => loadHomeContent(0));
document.getElementById('homeContentTypeFilter').addEventListener('change', () => loadHomeContent(0));

// ==================== Product Management ====================

let productImages = [];
let draggedImage = null;

// Initialize product filter options from database
async function initializeProductFilters() {
    try {
        console.log('?? Initializing product filters from database...');
        
        // Load available colors
        await loadProductColors();
        
        // Load price range
        await loadProductPriceRange();
        
        console.log('? Product filters initialized');
    } catch (error) {
        console.error('? Error initializing product filters:', error);
    }
}

/**
 * Load all unique colors from database products
 */
async function loadProductColors() {
    try {
        const response = await apiRequest('/products/active?page=0&size=1000');
        const data = await response.json();
        const products = data.content || [];
        
        // Extract unique colors from colorVariants
        const colorsSet = new Set();
        products.forEach(product => {
            if (product.colorVariants && Array.isArray(product.colorVariants)) {
                product.colorVariants.forEach(variant => {
                    if (variant.color) {
                        colorsSet.add(variant.color);
                    }
                });
            }
        });
        
        const colors = Array.from(colorsSet).sort();
        
        // Update color filter dropdown
        const colorFilter = document.getElementById('productColorFilter');
        if (colorFilter) {
            colorFilter.innerHTML = '<option value="all">All Colors</option>';
            colors.forEach(color => {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = color;
                colorFilter.appendChild(option);
            });
        }
        
        console.log('? Loaded colors from database:', colors);
    } catch (error) {
        console.error('? Error loading colors:', error);
    }
}

/**
 * Load min/max price range from database products
 */
async function loadProductPriceRange() {
    try {
        const response = await apiRequest('/products/active?page=0&size=1000');
        const data = await response.json();
        const products = data.content || [];
        
        if (products.length > 0) {
            const prices = products.map(p => p.price).filter(p => p != null && p > 0);
            const minPrice = Math.floor(Math.min(...prices));
            const maxPrice = Math.ceil(Math.max(...prices));
            
            // Update price input placeholders
            const minInput = document.getElementById('productMinPrice');
            const maxInput = document.getElementById('productMaxPrice');
            
            if (minInput) {
                minInput.setAttribute('min', minPrice);
                minInput.setAttribute('max', maxPrice);
                minInput.setAttribute('placeholder', `Min: $${minPrice}`);
            }
            
            if (maxInput) {
                maxInput.setAttribute('min', minPrice);
                maxInput.setAttribute('max', maxPrice);
                maxInput.setAttribute('placeholder', `Max: $${maxPrice}`);
            }
            
            console.log('? Loaded price range from database: $' + minPrice + ' - $' + maxPrice);
        }
    } catch (error) {
        console.error('? Error loading price range:', error);
    }
}

async function loadProducts(page = 0) {
    try {
        showLoadingState('products');
        
        // Initialize filters on first load
        if (page === 0) {
            await initializeProductFilters();
        }
        
        console.log('Loading products from backend...', `${API_BASE_URL}/products?page=${page}&size=${pageSize}`);
        const response = await apiRequest(`/products?page=${page}&size=${pageSize}&sort=id,desc`);
        const data = await response.json();
        console.log('Products loaded:', data);
        
        displayProducts(data.content || []);
        setupPagination('products', data);
        hideLoadingState('products');
        
    } catch (error) {
        console.error('Error loading products:', error);
        hideLoadingState('products');
        showError('Failed to load products. Please try again.');
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => {
        // Calculate total stock from all color variants
        const totalStock = product.totalStock || product.stockQuantity || 0;
        const colors = product.colorVariants 
            ? product.colorVariants.map(v => v.color).join(', ')
            : (product.color || 'N/A');
        
        return `
        <tr>
            <td><img src="${product.primaryImageUrl || PLACEHOLDER_IMAGE}" alt="${product.name}" class="table-img"></td>
            <td>${product.name}</td>
            <td>$${product.price?.toFixed(2)}</td>
            <td>
                <span class="badge badge-${totalStock < LOW_STOCK_THRESHOLD ? 'warning' : 'success'}">
                    ${totalStock}
                </span>
            </td>
            <td>${colors}</td>
            <td><span class="badge badge-${product.isActive ? 'success' : 'secondary'}">${product.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="btn-icon" onclick="editProduct(${product.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="manageProductImages(${product.id})" title="Manage Images">
                    <i class="fas fa-images"></i>
                </button>
                <button class="btn-icon" onclick="toggleProductStatus(${product.id})" title="Toggle Status">
                    <i class="fas fa-toggle-${product.isActive ? 'on' : 'off'}"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteProduct(${product.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

document.getElementById('addProductBtn').addEventListener('click', async () => {
    currentEditId = null;
    currentEditingProduct = null;
    productImages = [];
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    // Explicitly clear Arabic fields
    document.getElementById('productNameAr').value = '';
    document.getElementById('productDescriptionAr').value = '';
    document.getElementById('imagePreviewContainer').innerHTML = '';
    document.getElementById('colorVariantsContainer').innerHTML = '';
    // Add one default color variant
    addColorVariant();
    // Load categories
    await loadCategoriesForProductForm();
    
    // Debug: Verify fields exist
    console.log('Modal opened. Arabic fields:', {
        nameAr: document.getElementById('productNameAr'),
        descriptionAr: document.getElementById('productDescriptionAr')
    });
    
    document.getElementById('productModal').style.display = 'flex';
});

// Color Variants Management
let colorVariants = [];
let variantIdCounter = 0;

const colorOptions = [
    { value: 'Black', code: '#000000' },
    { value: 'White', code: '#FFFFFF' },
    { value: 'Brown', code: '#8B4513' },
    { value: 'Beige', code: '#F5F5DC' },
    { value: 'Navy', code: '#000080' },
    { value: 'Gray', code: '#808080' },
    { value: 'Red', code: '#FF0000' },
    { value: 'Blue', code: '#0000FF' },
    { value: 'Green', code: '#008000' },
    { value: 'Cream', code: '#FFFDD0' },
    { value: 'Gold', code: '#FFD700' },
    { value: 'Silver', code: '#C0C0C0' }
];

function addColorVariant(variant = null) {
    const variantId = variant?.id || variantIdCounter++;
    const variantDiv = document.createElement('div');
    variantDiv.className = 'color-variant-item';
    variantDiv.dataset.variantId = variantId;
    
    const colorOptionsHtml = colorOptions.map(opt => 
        `<option value="${opt.value}" data-code="${opt.code}" ${variant?.color === opt.value ? 'selected' : ''}>${opt.value}</option>`
    ).join('');
    
    variantDiv.innerHTML = `
        <div class="color-variant-header">
            <h4>Color Variant</h4>
            <button type="button" class="remove-variant-btn" onclick="removeColorVariant(${variantId})">
                <i class="fas fa-times"></i> Remove
            </button>
        </div>
        <div class="color-variant-fields">
            <div class="form-group">
                <label>Color *</label>
                <select class="variant-color" required>
                    <option value="">Select Color</option>
                    ${colorOptionsHtml}
                </select>
            </div>
            <div class="form-group">
                <label>Stock Quantity *</label>
                <input type="number" class="variant-stock" value="${variant?.stockQuantity || ''}" min="0" required>
            </div>
            <div class="form-group">
                <label>Color Code</label>
                <input type="color" class="variant-color-code" value="${variant?.colorCode || '#000000'}">
            </div>
        </div>
    `;
    
    // Auto-update color code when color is selected
    const colorSelect = variantDiv.querySelector('.variant-color');
    const colorCodeInput = variantDiv.querySelector('.variant-color-code');
    
    colorSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const colorCode = selectedOption.dataset.code;
        if (colorCode) {
            colorCodeInput.value = colorCode;
        }
    });
    
    document.getElementById('colorVariantsContainer').appendChild(variantDiv);
}

function removeColorVariant(variantId) {
    const variantDiv = document.querySelector(`[data-variant-id="${variantId}"]`);
    if (variantDiv) {
        const container = document.getElementById('colorVariantsContainer');
        // Keep at least one variant
        if (container.children.length > 1) {
            variantDiv.remove();
        } else {
            alert('At least one color variant is required!');
        }
    }
}

function getColorVariantsFromForm() {
    const variants = [];
    const variantItems = document.querySelectorAll('.color-variant-item');
    
    variantItems.forEach(item => {
        const color = item.querySelector('.variant-color').value;
        const stockQuantity = parseInt(item.querySelector('.variant-stock').value) || 0;
        const colorCode = item.querySelector('.variant-color-code').value;
        
        if (color) {
            variants.push({
                color: color,
                stockQuantity: stockQuantity,
                colorCode: colorCode
            });
        }
    });
    
    return variants;
}

document.getElementById('addColorVariantBtn').addEventListener('click', () => {
    addColorVariant();
});

// Handle image upload with drag and drop
const imageUpload = document.getElementById('productImageUpload');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');

imageUpload.addEventListener('change', handleProductImageUpload);

function handleProductImageUpload(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            addImagePreview(event.target.result, file.name);
        };
        reader.readAsDataURL(file);
    });
}

function addImagePreview(imageUrl, fileName, dbImageId = null) {
    const imageId = Date.now() + Math.random();
    productImages.push({ 
        id: imageId, 
        url: imageUrl, 
        displayOrder: productImages.length,
        dbId: dbImageId // Store database ID if it exists
    });
    
    const imageDiv = document.createElement('div');
    imageDiv.className = 'image-preview-item';
    imageDiv.draggable = true;
    imageDiv.dataset.imageId = imageId;
    if (dbImageId) {
        imageDiv.dataset.dbImageId = dbImageId; // Store DB ID in DOM as well
    }
    
    imageDiv.innerHTML = `
        <img src="${imageUrl}" alt="${fileName}">
        <div class="image-overlay">
            <button type="button" class="btn-icon btn-danger" onclick="removeImagePreview('${imageId}')">
                <i class="fas fa-trash"></i>
            </button>
            <div class="drag-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
        </div>
        <span class="image-order">${productImages.length}</span>
    `;
    
    // Drag and drop events
    imageDiv.addEventListener('dragstart', handleDragStart);
    imageDiv.addEventListener('dragover', handleDragOver);
    imageDiv.addEventListener('drop', handleDrop);
    imageDiv.addEventListener('dragend', handleDragEnd);
    
    imagePreviewContainer.appendChild(imageDiv);
}

function handleDragStart(e) {
    draggedImage = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    const target = e.target.closest('.image-preview-item');
    if (target && target !== draggedImage) {
        target.classList.add('drag-over');
    }
    
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    const target = e.target.closest('.image-preview-item');
    if (draggedImage !== target) {
        // Swap positions
        const draggedIndex = Array.from(imagePreviewContainer.children).indexOf(draggedImage);
        const targetIndex = Array.from(imagePreviewContainer.children).indexOf(target);
        
        if (draggedIndex < targetIndex) {
            target.parentNode.insertBefore(draggedImage, target.nextSibling);
        } else {
            target.parentNode.insertBefore(draggedImage, target);
        }
        
        // Update order numbers
        updateImageOrder();
    }
    
    target.classList.remove('drag-over');
    
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.image-preview-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function updateImageOrder() {
    const items = Array.from(imagePreviewContainer.children);
    items.forEach((item, index) => {
        const imageId = item.dataset.imageId;
        const image = productImages.find(img => img.id == imageId);
        if (image) {
            image.displayOrder = index;
        }
        item.querySelector('.image-order').textContent = index + 1;
    });
}

function removeImagePreview(imageId) {
    // Convert imageId to number for comparison
    const numericId = parseFloat(imageId);
    
    // Find the image to check if it has a database ID
    const imageToRemove = productImages.find(img => img.id === numericId);
    
    if (imageToRemove && imageToRemove.dbId) {
        // If image exists in database, delete it via API
        console.log('Deleting database image with dbId:', imageToRemove.dbId);
        apiRequest(`/product-images/${imageToRemove.dbId}`, { method: 'DELETE' })
            .then(() => {
                console.log('Database image deleted successfully');
            })
            .catch(error => {
                console.error('Error deleting database image:', error);
                alert('Failed to delete image from database');
            });
    }
    
    // Remove from local array
    productImages = productImages.filter(img => {
        console.log('Comparing:', img.id, 'with', numericId, 'Result:', img.id !== numericId);
        return img.id !== numericId;
    });
    
    console.log('productImages after filter:', productImages);
    
    // Remove from DOM
    const element = document.querySelector(`[data-image-id="${imageId}"]`);
    console.log('Found element to remove:', element);
    
    if (element) {
        element.remove();
    }
    updateImageOrder();
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const colorVariants = getColorVariantsFromForm();
    
    if (colorVariants.length === 0) {
        alert('At least one color variant is required!');
        return;
    }
    
    // Get Arabic field values and convert empty strings to null
    const nameArValue = document.getElementById('productNameAr').value.trim();
    const descriptionArValue = document.getElementById('productDescriptionAr').value.trim();
    
    const productData = {
        name: document.getElementById('productName').value,
        nameAr: nameArValue !== '' ? nameArValue : null,
        sku: document.getElementById('productSku').value,
        description: document.getElementById('productDescription').value,
        descriptionAr: descriptionArValue !== '' ? descriptionArValue : null,
        price: parseFloat(document.getElementById('productPrice').value),
        categoryId: parseInt(document.getElementById('productCategory').value),
        colorVariants: colorVariants,
        isActive: document.getElementById('productActive').checked
    };
    
    // Preserve featured status when editing
    if (currentEditId && currentEditingProduct) {
        productData.isFeatured = currentEditingProduct.isFeatured || false;
        productData.featuredOrder = currentEditingProduct.featuredOrder || null;
    }
    
    // Debug logging
    console.log('=== PRODUCT SUBMISSION DEBUG ===');
    console.log('Arabic Name field value:', nameArValue);
    console.log('Arabic Description field value:', descriptionArValue);
    console.log('Full product data being sent:', JSON.stringify(productData, null, 2));
    console.log('Edit mode:', currentEditId ? `Editing product ${currentEditId}` : 'Creating new product');
    
    // Show alert for debugging (remove this after testing)
    if (nameArValue !== '' || descriptionArValue !== '') {
        const debugMsg = `Arabic fields being sent:\nName: ${nameArValue || '(empty)'}\nDescription: ${descriptionArValue || '(empty)'}`;
        console.log(debugMsg);
        // Uncomment to show alert: alert(debugMsg);
    }
    
    try {
        let productId = currentEditId;
        
        if (currentEditId) {
            console.log(`Sending PUT request to /products/${currentEditId}`);
            const response = await apiRequest(`/products/${currentEditId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
            console.log('Product update response status:', response.status);
            const responseText = await response.text();
            console.log('Response:', responseText);
            // Check if response is JSON
            if (response.ok) {
                try {
                    const updatedProduct = JSON.parse(responseText);
                    console.log('Updated product received:', updatedProduct);
                    console.log('nameAr in response:', updatedProduct.nameAr);
                    console.log('descriptionAr in response:', updatedProduct.descriptionAr);
                } catch (e) {
                    console.log('Response is not JSON');
                }
            }
        } else {
            console.log('Sending POST request to /products');
            const response = await apiRequest('/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
            console.log('Product create response status:', response.status);
            const newProduct = await response.json();
            console.log('Created product:', newProduct);
            console.log('nameAr in created product:', newProduct.nameAr);
            console.log('descriptionAr in created product:', newProduct.descriptionAr);
            productId = newProduct.id;
        }
        
        // Save product images - PUT for existing, POST for new
        if (productImages.length > 0) {
            for (const [index, image] of productImages.entries()) {
                const imageData = {
                    productId: productId,
                    imageUrl: image.url,
                    altText: productData.name,
                    isPrimary: index === 0,
                    displayOrder: index
                };
                
                if (image.dbId) {
                    // Update existing image with PUT
                    console.log('Updating existing image with dbId:', image.dbId);
                    await apiRequest(`/product-images/${image.dbId}`, {
                        method: 'PUT',
                        body: JSON.stringify(imageData)
                    });
                } else {
                    // Create new image with POST
                    console.log('Creating new image:', imageData);
                    await apiRequest('/product-images', {
                        method: 'POST',
                        body: JSON.stringify(imageData)
                    });
                }
            }
        }
        
        document.getElementById('productModal').style.display = 'none';
        currentEditId = null;
        currentEditingProduct = null;
        loadProducts(currentPage);
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product');
    }
});

async function editProduct(id) {
    try {
        const response = await apiRequest(`/products/${id}`);
        const product = await response.json();
        
        currentEditId = id;
        currentEditingProduct = product;
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('productName').value = product.name;
        document.getElementById('productNameAr').value = product.nameAr || '';
        document.getElementById('productSku').value = product.sku;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productDescriptionAr').value = product.descriptionAr || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productActive').checked = product.isActive;
        
        // Load categories and set the selected one
        await loadCategoriesForProductForm();
        if (product.categoryId) {
            document.getElementById('productCategory').value = product.categoryId;
        }
        
        // Load color variants
        document.getElementById('colorVariantsContainer').innerHTML = '';
        if (product.colorVariants && product.colorVariants.length > 0) {
            product.colorVariants.forEach(variant => {
                addColorVariant(variant);
            });
        } else {
            // No variants, add one empty variant
            addColorVariant();
        }
        
        // Load existing images
        const imagesResponse = await apiRequest(`/product-images/product/${id}`);
        const images = await imagesResponse.json();
        
        productImages = [];
        imagePreviewContainer.innerHTML = '';
        
        images.forEach(image => {
            // Pass the database image ID as well
            addImagePreview(image.imageUrl, image.altText || product.name, image.id);
        });
        
        document.getElementById('productModal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

async function toggleProductStatus(id) {
    try {
        await apiRequest(`/products/${id}/status`, { method: 'PATCH' });
        loadProducts(currentPage);
    } catch (error) {
        console.error('Error updating product status:', error);
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        await apiRequest(`/products/${id}`, { method: 'DELETE' });
        loadProducts(currentPage);
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
    }
}

// Product filters
document.getElementById('applyProductFilter').addEventListener('click', applyProductFilters);
document.getElementById('resetProductFilter').addEventListener('click', () => {
    document.getElementById('productColorFilter').value = 'all';
    document.getElementById('productMinPrice').value = '';
    document.getElementById('productMaxPrice').value = '';
    document.getElementById('productStockFilter').value = 'all';
    document.getElementById('productStatusFilter').value = 'all';
    document.getElementById('productSortFilter').value = 'name-asc';
    loadProducts(0);
});

async function applyProductFilters() {
    const color = document.getElementById('productColorFilter').value;
    const minPrice = document.getElementById('productMinPrice').value;
    const maxPrice = document.getElementById('productMaxPrice').value;
    const stock = document.getElementById('productStockFilter').value;
    const status = document.getElementById('productStatusFilter').value;
    const sortValue = document.getElementById('productSortFilter').value;
    
    // Parse sort value (e.g., "price-desc" -> sortBy="price", sortDir="desc")
    const [sortBy, sortDir] = sortValue.split('-');
    
    let endpoint = '/products';
    const params = new URLSearchParams();
    params.append('page', '0');
    params.append('size', pageSize);
    params.append('sort', `${sortBy},${sortDir}`);
    
    if (status === 'active') {
        endpoint = '/products/active';
    }
    
    if (color !== 'all' || minPrice || maxPrice) {
        endpoint = '/products/filter';
        if (color !== 'all') params.append('colors', color);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
    }
    
    try {
        const response = await apiRequest(`${endpoint}?${params.toString()}`);
        const data = await response.json();
        
        let products = data.content || data || [];
        
        // Client-side filter for stock
        if (stock === 'lowStock') {
            products = products.filter(p => p.stockQuantity > 0 && p.stockQuantity < LOW_STOCK_THRESHOLD);
        } else if (stock === 'outOfStock') {
            products = products.filter(p => p.stockQuantity === 0);
        } else if (stock === 'inStock') {
            products = products.filter(p => p.stockQuantity >= LOW_STOCK_THRESHOLD);
        }
        
        displayProducts(products);
    } catch (error) {
        console.error('Error filtering products:', error);
    }
}

// Product search
document.getElementById('productSearchBtn').addEventListener('click', async () => {
    const keyword = document.getElementById('productSearch').value.trim();
    if (!keyword) {
        loadProducts(0);
        return;
    }
    
    try {
        showLoadingState('products');
        const response = await apiRequest(`/products/search?keyword=${encodeURIComponent(keyword)}&page=0&size=${pageSize}&sort=name,asc`);
        const data = await response.json();
        displayProducts(data.content || []);
        setupPagination('products', data);
        hideLoadingState('products');
    } catch (error) {
        console.error('Error searching products:', error);
        hideLoadingState('products');
        alert('Error searching products. Please try again.');
    }
});

// Product search on Enter key
document.getElementById('productSearch').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('productSearchBtn').click();
    }
});

// ==================== Reviews Management ====================

let currentReviewFilter = 'all';

async function loadReviews(page = 0) {
    try {
        showLoadingState('reviews');
        let endpoint = '/product-reviews';
        
        if (currentReviewFilter === 'pending') {
            endpoint = '/product-reviews/pending';
        } else if (currentReviewFilter === 'approved') {
            endpoint = '/product-reviews/product/0/approved'; // Will need adjustment
            // Better to filter client-side for 'all approved'
            endpoint = '/product-reviews';
        }
        
        endpoint += `?page=${page}&size=${pageSize}&sort=createdDate,desc`;
        
        console.log('Loading reviews with filter:', currentReviewFilter);
        console.log('API endpoint:', endpoint);
        console.log('Auth token present:', !!authToken);
        
        const response = await apiRequest(endpoint);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('Full API response:', data);
        
        let reviews = data.content || [];
        
        console.log('Total reviews received from API:', reviews.length);
        if (reviews.length > 0) {
            console.log('Reviews data sample:', reviews.slice(0, 3));
            
            // Count visibility status
            const visibleCount = reviews.filter(r => r.isVisible).length;
            const invisibleCount = reviews.filter(r => !r.isVisible).length;
            console.log('Visible reviews:', visibleCount, 'Invisible reviews:', invisibleCount);
        } else {
            console.warn('?? Backend returned 0 reviews. This could mean:');
            console.warn('1. No reviews exist in the database');
            console.warn('2. Backend is filtering out invisible reviews');
            console.warn('3. Authentication issue preventing access to all reviews');
        }
        
        // Client-side filter for approved and invisible
        if (currentReviewFilter === 'approved') {
            reviews = reviews.filter(r => r.isApproved);
            console.log('After approved filter:', reviews.length);
        } else if (currentReviewFilter === 'invisible') {
            reviews = reviews.filter(r => !r.isVisible);
            console.log('After invisible filter:', reviews.length, 'reviews');
        }
        
        displayReviews(reviews);
        setupPagination('reviews', data);
        hideLoadingState('reviews');
        
    } catch (error) {
        console.error('Error loading reviews:', error);
        hideLoadingState('reviews');
        showError('Failed to load reviews. Please try again.');
    }
}

function displayReviews(reviews) {
    const tbody = document.getElementById('reviewsTableBody');
    
    if (!reviews || reviews.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No reviews found</td></tr>';
        return;
    }
    
    tbody.innerHTML = reviews.map(review => {
        const reviewText = review.reviewText || review.comment || '';
        const displayText = reviewText ? (reviewText.length > 50 ? reviewText.substring(0, 50) + '...' : reviewText) : '<em style="color: #999;">(Rating only)</em>';
        
        return `
        <tr>
            <td>${formatDate(review.createdDate)}</td>
            <td>${escapeHtml(review.productName || 'Product #' + review.productId)}</td>
            <td>${escapeHtml(review.customerName)}</td>
            <td style="color: #C9A24D; font-size: 16px;">${'?'.repeat(review.rating)}${'?'.repeat(5 - review.rating)}</td>
            <td class="review-comment">${displayText}</td>
            <td><span class="badge badge-${review.isApproved ? 'success' : 'warning'}">${review.isApproved ? 'Approved' : 'Pending'}</span></td>
            <td><span class="badge badge-${review.isVisible ? 'active' : 'inactive'}">${review.isVisible ? 'Visible' : 'Hidden'}</span></td>
            <td>
                ${!review.isApproved ? `
                    <button class="btn-icon btn-success" onclick="approveReview(${review.id})" title="Approve">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-icon btn-warning" onclick="rejectReview(${review.id})" title="Reject">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
                <button class="btn-icon" onclick="toggleReviewVisibility(${review.id}, ${!review.isVisible})" title="${review.isVisible ? 'Hide' : 'Show'} Review">
                    <i class="fas fa-eye${review.isVisible ? '-slash' : ''}"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteReview(${review.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
    }).join('');
}

async function approveReview(id) {
    try {
        await apiRequest(`/product-reviews/${id}/approve`, { method: 'PATCH' });
        loadReviews(currentPage);
        loadDashboardStats();
    } catch (error) {
        console.error('Error approving review:', error);
    }
}

async function rejectReview(id) {
    try {
        await apiRequest(`/product-reviews/${id}/reject`, { method: 'PATCH' });
        loadReviews(currentPage);
        loadDashboardStats();
    } catch (error) {
        console.error('Error rejecting review:', error);
    }
}

async function toggleReviewVisibility(id, newVisibility) {
    try {
        const action = newVisibility ? 'show' : 'hide';
        if (!confirm(`Are you sure you want to ${action} this review?`)) return;
        
        await apiRequest(`/product-reviews/${id}/visibility`, { method: 'PATCH' });
        alert(`Review ${newVisibility ? 'shown' : 'hidden'} successfully`);
        loadReviews(currentPage);
    } catch (error) {
        console.error('Error updating review visibility:', error);
        alert('Failed to update review visibility');
    }
}

async function deleteReview(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
        await apiRequest(`/product-reviews/${id}`, { method: 'DELETE' });
        loadReviews(currentPage);
        loadDashboardStats();
    } catch (error) {
        console.error('Error deleting review:', error);
        alert('Error deleting review');
    }
}

// Review filters
document.querySelectorAll('#reviewsSection .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#reviewsSection .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentReviewFilter = btn.getAttribute('data-filter');
        loadReviews(0);
    });
});

// Review search and rating filter
document.getElementById('reviewSearchBtn').addEventListener('click', searchReviews);
document.getElementById('reviewRatingFilter').addEventListener('change', filterReviewsByRating);

async function searchReviews() {
    const keyword = document.getElementById('reviewSearch').value;
    if (!keyword) {
        loadReviews(0);
        return;
    }
    
    try {
        const response = await apiRequest(`/product-reviews/customer/name/${encodeURIComponent(keyword)}?page=0&size=${pageSize}`);
        const data = await response.json();
        displayReviews(data.content || []);
        setupPagination('reviews', data);
    } catch (error) {
        console.error('Error searching reviews:', error);
    }
}

async function filterReviewsByRating() {
    const rating = document.getElementById('reviewRatingFilter').value;
    if (rating === 'all') {
        loadReviews(0);
        return;
    }
    
    try {
        const response = await apiRequest(`/product-reviews/rating/${rating}?page=0&size=${pageSize}`);
        const data = await response.json();
        displayReviews(data.content || []);
        setupPagination('reviews', data);
    } catch (error) {
        console.error('Error filtering reviews:', error);
    }
}

// ==================== Orders Management ====================

let currentOrderFilter = 'all';

async function loadOrders(page = 0) {
    try {
        showLoadingState('orders');
        let endpoint = '/orders';
        
        if (currentOrderFilter !== 'all') {
            endpoint = `/orders/status/${currentOrderFilter}`;
        }
        
        endpoint += `?page=${page}&size=${pageSize}&sort=orderDate,desc`;
        
        const response = await apiRequest(endpoint);
        const data = await response.json();
        
        displayOrders(data.content || []);
        setupPagination('orders', data);
        hideLoadingState('orders');
        
    } catch (error) {
        console.error('Error loading orders:', error);
        hideLoadingState('orders');
        showError('Failed to load orders. Please try again.');
    }
}

function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${formatDate(order.orderDate)}</td>
            <td>${order.customerName}</td>
            <td>$${order.totalAmount?.toFixed(2)}</td>
            <td><span class="badge badge-${order.orderStatus?.toLowerCase()}">${order.orderStatus}</span></td>
            <td>
                <button class="btn-icon" onclick="viewOrder(${order.id})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="">Change Status</option>
                    <option value="PENDING" ${order.orderStatus === 'PENDING' ? 'selected' : ''}>Pending</option>
                    <option value="PROCESSING" ${order.orderStatus === 'PROCESSING' ? 'selected' : ''}>Processing</option>
                    <option value="SHIPPED" ${order.orderStatus === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
                    <option value="DELIVERED" ${order.orderStatus === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
                    <option value="CANCELLED" ${order.orderStatus === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                </select>
                <button class="btn-icon btn-danger" onclick="deleteOrder(${order.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function viewOrder(id) {
    try {
        const response = await apiRequest(`/orders/${id}`);
        const order = await response.json();
        
        const modal = document.getElementById('orderModal');
        const content = document.getElementById('orderDetailContent');
        
        content.innerHTML = `
            <div class="order-details">
                <div class="detail-section">
                    <h3>Order Information</h3>
                    <div class="detail-grid">
                        <div class="detail-group">
                            <label>Order ID:</label>
                            <p>#${order.id}</p>
                        </div>
                        <div class="detail-group">
                            <label>Date:</label>
                            <p>${formatDate(order.orderDate)}</p>
                        </div>
                        <div class="detail-group">
                            <label>Status:</label>
                            <p><span class="badge badge-${order.orderStatus?.toLowerCase()}">${order.orderStatus}</span></p>
                        </div>
                        <div class="detail-group">
                            <label>Total:</label>
                            <p><strong>$${order.totalAmount?.toFixed(2)}</strong></p>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Customer Information</h3>
                    <div class="detail-grid">
                        <div class="detail-group">
                            <label>Name:</label>
                            <p>${order.customerName}</p>
                        </div>
                        <div class="detail-group">
                            <label>Email:</label>
                            <p>${order.customerEmail}</p>
                        </div>
                        <div class="detail-group">
                            <label>Phone:</label>
                            <p>${order.customerPhone}</p>
                        </div>
                        <div class="detail-group">
                            <label>WhatsApp:</label>
                            <p>${order.whatsappNumber || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Delivery Address</h3>
                    <p>${order.city}, ${order.streetName}, Building ${order.buildingNumber}, Floor ${order.floor}, Apt ${order.apartmentNumber}</p>
                    ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
                </div>
                
                <div class="detail-section">
                    <h3>Order Items</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Color</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.orderItems?.map(item => `
                                <tr>
                                    <td>${item.productName || 'Product #' + item.productId}</td>
                                    <td>${item.selectedColor ? `<span style="color: #C9A24D; font-weight: 500;">${item.selectedColor}</span>` : 'N/A'}</td>
                                    <td>${item.quantity}</td>
                                    <td>$${item.price?.toFixed(2)}</td>
                                    <td>$${(item.quantity * item.price)?.toFixed(2)}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="5">No items</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error viewing order:', error);
        alert('Error loading order details');
    }
}

async function updateOrderStatus(id, status) {
    if (!status) return;
    
    try {
        console.log('Updating order status:', { orderId: id, newStatus: status });
        console.log('Request URL:', `${API_BASE_URL}/orders/${id}/status?status=${status}`);
        const response = await apiRequest(`/orders/${id}/status?status=${status}`, { method: 'PATCH' });
        console.log('Order status updated successfully');
        alert(`Order status updated to ${status}`);
        loadOrders(currentPage);
    } catch (error) {
        console.error('Error updating order status:', error);
        
        // Show detailed error message
        let errorMessage = 'Error updating order status';
        
        if (error.response) {
            try {
                const errorData = await error.response.json();
                console.error('Error response data (full):', JSON.stringify(errorData, null, 2));
                console.error('Error response data (object):', errorData);
                errorMessage = errorData.message || errorData.error || errorData.details || JSON.stringify(errorData, null, 2);
            } catch (e) {
                try {
                    const errorText = await error.response.text();
                    console.error('Error response text:', errorText);
                    errorMessage = errorText || error.message;
                } catch (e2) {
                    errorMessage = error.message;
                }
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        alert('Failed to update order status:\n' + errorMessage);
    }
}

async function deleteOrder(id) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
        await apiRequest(`/orders/${id}`, { method: 'DELETE' });
        loadOrders(currentPage);
    } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order');
    }
}

// Order filters
document.querySelectorAll('#ordersSection .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#ordersSection .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentOrderFilter = btn.getAttribute('data-filter');
        loadOrders(0);
    });
});

// Order search
document.getElementById('orderSearchBtn').addEventListener('click', async () => {
    const keyword = document.getElementById('orderSearch').value;
    if (!keyword) {
        loadOrders(0);
        return;
    }
    
    try {
        const response = await apiRequest(`/orders/customer/${encodeURIComponent(keyword)}?page=0&size=${pageSize}`);
        const data = await response.json();
        displayOrders(data.content || []);
        setupPagination('orders', data);
    } catch (error) {
        console.error('Error searching orders:', error);
    }
});

// ==================== Categories Management ====================

async function loadCategoriesSection() {
    try {
        showLoadingState('categories');
        const response = await apiRequest('/product-categories');
        const data = await response.json();
        
        displayCategories(data.content || data || []);
        hideLoadingState('categories');
        
    } catch (error) {
        console.error('Error loading categories:', error);
        hideLoadingState('categories');
        showError('Failed to load categories. Please try again.');
    }
}

function displayCategories(categories) {
    const tbody = document.getElementById('categoriesTableBody');
    
    if (!categories || categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No categories found</td></tr>';
        return;
    }
    
    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.name}</td>
            <td>${category.description || 'N/A'}</td>
            <td>${category.productCount || 0}</td>
            <td><span class="badge badge-${category.isActive ? 'success' : 'secondary'}">${category.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="btn-icon" onclick="editCategory(${category.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="toggleCategoryStatus(${category.id})" title="Toggle Status">
                    <i class="fas fa-toggle-${category.isActive ? 'on' : 'off'}"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteCategory(${category.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('addCategoryBtn').addEventListener('click', () => {
    currentEditId = null;
    document.getElementById('categoryModalTitle').textContent = 'Add Category';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryModal').style.display = 'flex';
});

document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const categoryData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value,
        displayOrder: parseInt(document.getElementById('categoryOrder').value),
        isActive: document.getElementById('categoryActive').checked
    };
    
    try {
        if (currentEditId) {
            await apiRequest(`/product-categories/${currentEditId}`, {
                method: 'PUT',
                body: JSON.stringify(categoryData)
            });
        } else {
            await apiRequest('/product-categories', {
                method: 'POST',
                body: JSON.stringify(categoryData)
            });
        }
        
        document.getElementById('categoryModal').style.display = 'none';
        loadCategoriesSection();
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Error saving category');
    }
});

async function editCategory(id) {
    try {
        const response = await apiRequest(`/product-categories/${id}`);
        const category = await response.json();
        
        currentEditId = id;
        document.getElementById('categoryModalTitle').textContent = 'Edit Category';
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('categoryOrder').value = category.displayOrder || 0;
        document.getElementById('categoryActive').checked = category.isActive;
        
        document.getElementById('categoryModal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading category:', error);
    }
}

async function toggleCategoryStatus(id) {
    try {
        await apiRequest(`/product-categories/${id}/status`, { method: 'PATCH' });
        loadCategoriesSection();
    } catch (error) {
        console.error('Error updating category status:', error);
    }
}

async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
        await apiRequest(`/product-categories/${id}`, { method: 'DELETE' });
        loadCategoriesSection();
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category. It may have products associated with it.');
    }
}

// ==================== Pagination ====================

function setupPagination(section, data) {
    const paginationDiv = document.getElementById(`${section}Pagination`);
    if (!paginationDiv) return;
    
    const totalPages = data.totalPages || 0;
    currentPage = data.number || 0;
    
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 0) {
        paginationHTML += `<button class="page-btn" onclick="loadPage('${section}', ${currentPage - 1})">Previous</button>`;
    }
    
    // Page numbers
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="loadPage('${section}', ${i})">${i + 1}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages - 1) {
        paginationHTML += `<button class="page-btn" onclick="loadPage('${section}', ${currentPage + 1})">Next</button>`;
    }
    
    paginationDiv.innerHTML = paginationHTML;
}

function loadPage(section, page) {
    currentPage = page;
    switch(section) {
        case 'messages':
            loadMessages(page);
            break;
        case 'blog':
            loadBlogPosts(page);
            break;
        case 'homeContent':
            loadHomeContent(page);
            break;
        case 'products':
            loadProducts(page);
            break;
        case 'reviews':
            loadReviews(page);
            break;
        case 'orders':
            loadOrders(page);
            break;
    }
}

// ==================== Utility Functions ====================

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Make functions global for onclick handlers
window.viewMessage = viewMessage;
window.toggleMessageRead = toggleMessageRead;
window.deleteMessage = deleteMessage;
window.editBlogPost = editBlogPost;
window.toggleBlogPublish = toggleBlogPublish;
window.deleteBlogPost = deleteBlogPost;
window.editHomeContent = editHomeContent;
window.toggleContentStatus = toggleContentStatus;
window.deleteHomeContent = deleteHomeContent;
window.editProduct = editProduct;
window.manageProductImages = editProduct; // Same as edit for now
window.toggleProductStatus = toggleProductStatus;
window.deleteProduct = deleteProduct;
window.removeImagePreview = removeImagePreview;
window.approveReview = approveReview;
window.rejectReview = rejectReview;
window.toggleReviewVisibility = toggleReviewVisibility;
window.deleteReview = deleteReview;
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.editCategory = editCategory;
window.toggleCategoryStatus = toggleCategoryStatus;
window.deleteCategory = deleteCategory;
window.loadPage = loadPage;

// ==================== Loading & Error Handling ====================

function showLoadingState(section) {
    const sectionElement = document.getElementById(`${section}Section`);
    if (!sectionElement) return;
    
    // Add loading overlay
    let loadingOverlay = sectionElement.querySelector('.loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner" role="status" aria-label="Loading"></div>
        `;
        sectionElement.style.position = 'relative';
        sectionElement.appendChild(loadingOverlay);
    }
    loadingOverlay.style.display = 'flex';
}

function hideLoadingState(section) {
    const sectionElement = document.getElementById(`${section}Section`);
    if (!sectionElement) return;
    
    const loadingOverlay = sectionElement.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button class="error-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Show notification
    setTimeout(() => errorDiv.classList.add('show'), 100);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.classList.remove('show');
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
    
    // Close button
    errorDiv.querySelector('.error-close').addEventListener('click', () => {
        errorDiv.classList.remove('show');
        setTimeout(() => errorDiv.remove(), 300);
    });
}

function showSuccess(message) {
    // Create success notification
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
            <button class="success-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Show notification
    setTimeout(() => successDiv.classList.add('show'), 100);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        successDiv.classList.remove('show');
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
    
    // Close button
    successDiv.querySelector('.success-close').addEventListener('click', () => {
        successDiv.classList.remove('show');
        setTimeout(() => successDiv.remove(), 300);
    });
}

// Refresh current section
function refreshCurrentSection() {
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav) {
        const section = activeNav.getAttribute('data-section');
        loadSection(section);
    }
}

// ==================== Featured Products Management ====================

let allProductsForFeaturing = [];
let currentFeaturedProducts = [];

async function loadFeaturedProductsSection() {
    console.log('? Loading Featured Products Section');
    
    // Load categories for filter
    await loadCategoriesForFilter();
    
    // Load all products and featured products
    await Promise.all([
        loadAllProductsForFeaturing(),
        loadCurrentFeaturedProducts()
    ]);
    
    // Setup event listeners
    setupFeaturedProductsListeners();
}

async function loadCategoriesForFilter() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/product-categories/all-active`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            handleUnauthorized();
            return;
        }
        
        if (response.ok) {
            const categories = await response.json();
            const filterSelect = document.getElementById('featuredCategoryFilter');
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                filterSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load categories for product form
async function loadCategoriesForProductForm() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/product-categories/all-active`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            handleUnauthorized();
            return;
        }
        
        if (response.ok) {
            const categories = await response.json();
            const categorySelect = document.getElementById('productCategory');
            
            // Clear existing options except the first one
            categorySelect.innerHTML = '<option value="">Select a category</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadCurrentFeaturedProducts() {
    const container = document.getElementById('currentFeaturedList');
    container.innerHTML = '<div class="loading" role="status" aria-label="Loading"></div>';
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/products/featured`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            handleUnauthorized();
            return;
        }
        
        if (!response.ok) throw new Error('Failed to load featured products');
        
        currentFeaturedProducts = await response.json();
        
        if (currentFeaturedProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-star"></i>
                    <p>No products are currently featured.<br>Select products below to feature them on the homepage.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = currentFeaturedProducts.map(product => `
            <div class="featured-product-card" data-product-id="${product.id}">
                <div class="featured-badge">Featured #${product.featuredOrder || 0}</div>
                <img src="${product.images && product.images.length > 0 ? product.images[0].imageUrl : 'assets/img/products/product-1-1.jpg'}" 
                     alt="${product.name}" 
                     class="featured-product-image" 
                     onerror="this.src='assets/img/products/product-1-1.jpg'">
                <div class="featured-product-info">
                    <h4>${product.name}</h4>
                    <p>${product.price ? '$' + product.price.toFixed(2) : 'N/A'}</p>
                </div>
                <div class="featured-order-control">
                    <label>Order:</label>
                    <input type="number" 
                           min="1" 
                           value="${product.featuredOrder || 0}" 
                           class="featured-order-input"
                           data-product-id="${product.id}">
                </div>
                <div class="featured-actions">
                    <button class="btn-small btn-save-order" onclick="updateFeaturedOrder(${product.id}, this.parentElement.parentElement.querySelector('.featured-order-input').value)">
                        <i class="fas fa-save"></i> Save
                    </button>
                    <button class="btn-small btn-remove-featured" onclick="removeFeatured(${product.id})">
                        <i class="fas fa-times"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading featured products:', error);
        container.innerHTML = '<div class="error-message">Failed to load featured products</div>';
    }
}

async function loadAllProductsForFeaturing() {
    const container = document.getElementById('allProductsList');
    container.innerHTML = '<div class="loading" role="status" aria-label="Loading"></div>';
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/products/active`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            handleUnauthorized();
            return;
        }
        
        if (!response.ok) throw new Error('Failed to load products');
        
        const data = await response.json();
        allProductsForFeaturing = data.content || data; // Handle both paginated and non-paginated responses
        
        renderProductsSelection(allProductsForFeaturing);
        
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<div class="error-message">Failed to load products</div>';
    }
}

function renderProductsSelection(products) {
    const container = document.getElementById('allProductsList');
    
    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No products found</p></div>';
        return;
    }
    
    container.innerHTML = products.map(product => {
        const isFeatured = product.isFeatured || currentFeaturedProducts.some(p => p.id === product.id);
        
        return `
            <div class="product-select-card ${isFeatured ? 'is-featured' : ''}" data-product-id="${product.id}">
                <img src="${product.images && product.images.length > 0 ? product.images[0].imageUrl : 'assets/img/products/product-1-1.jpg'}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='assets/img/products/product-1-1.jpg'">
                <h4>${product.name}</h4>
                <p>${product.price ? '$' + product.price.toFixed(2) : 'N/A'}</p>
                <button class="feature-toggle ${isFeatured ? 'remove-featured' : 'add-featured'}" 
                        onclick="toggleFeaturedStatus(${product.id}, ${!isFeatured})">
                    ${isFeatured ? '<i class="fas fa-star-half-alt"></i> Remove from Featured' : '<i class="fas fa-star"></i> Add to Featured'}
                </button>
            </div>
        `;
    }).join('');
}

async function toggleFeaturedStatus(productId, setFeatured) {
    try {
        const token = localStorage.getItem('adminToken');
        console.log('Toggle Featured - Token exists:', !!token, 'Product ID:', productId);
        
        // Fetch current product data
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Toggle Featured - GET response status:', response.status);
        
        if (response.status === 401) {
            console.error('Toggle Featured - 401 Unauthorized on GET');
            handleUnauthorized();
            return;
        }
        
        if (!response.ok) throw new Error('Failed to fetch product');
        
        const product = await response.json();
        
        // Determine featured order
        let featuredOrder = null;
        if (setFeatured) {
            // Get max featured order and add 1
            const maxOrder = currentFeaturedProducts.reduce((max, p) => 
                Math.max(max, p.featuredOrder || 0), 0);
            featuredOrder = maxOrder + 1;
        }
        
        // Update product with featured status
        console.log('Toggle Featured - Updating with:', { isFeatured: setFeatured, featuredOrder });
        
        const updateResponse = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...product,
                isFeatured: setFeatured,
                featuredOrder: featuredOrder
            })
        });
        
        console.log('Toggle Featured - PUT response status:', updateResponse.status);
        
        if (updateResponse.status === 401) {
            console.error('Toggle Featured - 401 Unauthorized on PUT');
            handleUnauthorized();
            return;
        }
        
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('Toggle Featured - PUT failed:', errorText);
            throw new Error('Failed to update product');
        }
        
        showSuccess(setFeatured ? 'Product added to featured!' : 'Product removed from featured!');
        
        // Reload both sections
        await Promise.all([
            loadCurrentFeaturedProducts(),
            loadAllProductsForFeaturing()
        ]);
        
    } catch (error) {
        console.error('Error toggling featured status:', error);
        showError('Failed to update featured status');
    }
}

async function updateFeaturedOrder(productId, newOrder) {
    try {
        const token = localStorage.getItem('adminToken');
        console.log('Update Order - Token exists:', !!token, 'Product ID:', productId, 'New Order:', newOrder);
        
        // Fetch current product data
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Update Order - GET response status:', response.status);
        
        if (response.status === 401) {
            console.error('Update Order - 401 Unauthorized on GET');
            handleUnauthorized();
            return;
        }
        
        if (!response.ok) throw new Error('Failed to fetch product');
        
        const product = await response.json();
        
        // Update product with new featured order
        console.log('Update Order - Updating featuredOrder to:', parseInt(newOrder));
        
        const updateResponse = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...product,
                featuredOrder: parseInt(newOrder)
            })
        });
        
        console.log('Update Order - PUT response status:', updateResponse.status);
        
        if (updateResponse.status === 401) {
            console.error('Update Order - 401 Unauthorized on PUT');
            handleUnauthorized();
            return;
        }
        
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('Update Order - PUT failed:', errorText);
            throw new Error('Failed to update order');
        }
        
        showSuccess('Featured order updated!');
        await loadCurrentFeaturedProducts();
        
    } catch (error) {
        console.error('Error updating featured order:', error);
        showError('Failed to update order');
    }
}

async function removeFeatured(productId) {
    if (!confirm('Remove this product from featured section?')) return;
    
    await toggleFeaturedStatus(productId, false);
}

function setupFeaturedProductsListeners() {
    // Search filter
    const searchInput = document.getElementById('featuredProductSearch');
    searchInput?.addEventListener('input', filterFeaturedProducts);
    
    // Category filter
    const categoryFilter = document.getElementById('featuredCategoryFilter');
    categoryFilter?.addEventListener('change', filterFeaturedProducts);
    
    // Status filter
    const statusFilter = document.getElementById('featuredStatusFilter');
    statusFilter?.addEventListener('change', filterFeaturedProducts);
}

function filterFeaturedProducts() {
    const searchTerm = document.getElementById('featuredProductSearch').value.toLowerCase();
    const categoryId = document.getElementById('featuredCategoryFilter').value;
    const status = document.getElementById('featuredStatusFilter').value;
    
    let filtered = [...allProductsForFeaturing];
    
    // Filter by search
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filter by category
    if (categoryId !== 'all') {
        filtered = filtered.filter(p => p.categoryId == categoryId);
    }
    
    // Filter by featured status
    if (status === 'featured') {
        filtered = filtered.filter(p => p.isFeatured || currentFeaturedProducts.some(fp => fp.id === p.id));
    } else if (status === 'not-featured') {
        filtered = filtered.filter(p => !p.isFeatured && !currentFeaturedProducts.some(fp => fp.id === p.id));
    }
    
    renderProductsSelection(filtered);
}

