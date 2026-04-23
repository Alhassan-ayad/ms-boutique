/**
 * YASSO Blog Data Handler
 * 
 * Handles blog posts integration with backend API
 * API endpoints: /blog-posts/published, /blog-posts/slug/{slug}, /blog-posts/recent
 */

const API_BASE_URL = window.YASSO_CONFIG?.API_BASE_URL || '/api';
const BLOG_ENDPOINTS = window.YASSO_CONFIG?.ENDPOINTS || {};
const apiRequest = window.YASSO_CONFIG?.apiRequest?.bind(window.YASSO_CONFIG);

// Helper function to normalize image URLs - handles malformed backend responses
function normalizeImageUrl(url) {
  if (!url) return '';

  const rawUrl = String(url).trim();
  if (!rawUrl || rawUrl === 'null' || rawUrl === 'undefined') return '';

  // Keep data URIs and local theme assets untouched.
  if (rawUrl.startsWith('data:image/') || rawUrl.startsWith('assets/')) {
    return rawUrl;
  }

  const BACKEND_URL = API_BASE_URL.replace('/api', '');

  // Absolute URLs from backend uploads.
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    try {
      const parsedUrl = new URL(rawUrl);
      const isLocalHost = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';

      // Stored local URLs should resolve through production backend base URL.
      if (isLocalHost && (parsedUrl.pathname.startsWith('/images/') || parsedUrl.pathname.startsWith('/uploads/'))) {
        return `${BACKEND_URL}${parsedUrl.pathname}`;
      }

      // Avoid mixed-content blocking on HTTPS pages.
      if (window.location.protocol === 'https:' && parsedUrl.protocol === 'http:') {
        return rawUrl.replace(/^http:\/\//i, 'https://');
      }
    } catch (_error) {
      // Fall through and return raw value below.
    }

    return rawUrl;
  }

  // Known upload path formats.
  if (rawUrl.startsWith('/images/') || rawUrl.startsWith('/uploads/')) {
    return `${BACKEND_URL}${rawUrl}`;
  }

  if (rawUrl.startsWith('images/') || rawUrl.startsWith('uploads/')) {
    return `${BACKEND_URL}/${rawUrl}`;
  }

  // Fix malformed paths like "uploadsimagesblogabc.jpg".
  if (rawUrl.includes('images') && !rawUrl.includes('/')) {
    const imagesIndex = rawUrl.indexOf('images');
    if (imagesIndex !== -1) {
      const afterImages = rawUrl.substring(imagesIndex + 6);
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

  // Bare filenames are treated as blog uploads.
  if (/^[a-f0-9-]+\.(?:jpg|jpeg|png|gif|webp)$/i.test(rawUrl)) {
    return `${BACKEND_URL}/images/blog/${rawUrl}`;
  }

  if (rawUrl.startsWith('/')) {
    return `${BACKEND_URL}${rawUrl}`;
  }

  return `${BACKEND_URL}/${rawUrl}`;
}

// Pagination state
let currentPage = 0;
const PAGE_SIZE = 9;

/**
 * Fetch blog posts from API
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Items per page
 * @param {string} sort - Sort criteria
 * @returns {Promise<Object>} - API response with blog posts
 */
async function fetchBlogPosts(page = 0, size = PAGE_SIZE, sort = 'publishedDate,desc') {
  try {
    const endpoint = BLOG_ENDPOINTS.BLOG_PUBLISHED || '/blog-posts/published';
    const url = `${API_BASE_URL}${endpoint}?page=${page}&size=${size}&sort=${sort}`;

    if (apiRequest) {
      return await apiRequest(url);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch single blog post by slug
 * @param {string} slug - Blog post slug
 * @returns {Promise<Object>} - Blog post data
 */
async function fetchBlogPostBySlug(slug) {
  try {
    const endpoint = BLOG_ENDPOINTS.BLOG_POST_BY_SLUG || '/blog-posts/slug';
    const url = `${API_BASE_URL}${endpoint}/${slug}`;

    if (apiRequest) {
      return await apiRequest(url);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch recent blog posts for sidebar
 * @param {number} limit - Number of posts to fetch
 * @returns {Promise<Array>} - Array of blog posts
 */
async function fetchRecentBlogPosts(limit = 5) {
  try {
    const endpoint = BLOG_ENDPOINTS.BLOG_RECENT || '/blog-posts/recent';
    const url = `${API_BASE_URL}${endpoint}?limit=${limit}`;

    if (apiRequest) {
      return await apiRequest(url);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Search blog posts
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number
 * @param {number} size - Items per page
 * @returns {Promise<Object>} - Search results
 */
async function searchBlogPosts(keyword, page = 0, size = PAGE_SIZE) {
  try {
    const url = `${API_BASE_URL}/blog-posts/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}&sort=publishedDate,desc`;

    if (apiRequest) {
      return await apiRequest(url);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Render blog posts to the page
 * @param {Array} blogPosts - Array of blog post objects
 */
function renderBlogPosts(blogPosts) {
  const container = document.getElementById('blogPostsContainer');
  
  if (!container) {
    return;
  }
  
  if (!blogPosts || blogPosts.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          <p>No blog posts found.</p>
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  blogPosts.forEach(post => {
    const blogCard = createBlogCard(post);
    container.insertAdjacentHTML('beforeend', blogCard);
  });
}

/**
 * Create blog card HTML
 * @param {Object} post - Blog post object
 * @returns {string} - HTML string
 */
function createBlogCard(post) {
  const { 
    id, 
    title, 
    titleAr,
    slug, 
    content,
    contentAr,
    excerpt,
    featuredImage, 
    category,
    categoryAr, 
    publishedDate,
    authorName
  } = post;
  
  // Get localized fields
  const displayTitle = window.YassoI18n ? window.YassoI18n.getLocalizedField(post, 'title') : title;
  const displayContent = window.YassoI18n ? window.YassoI18n.getLocalizedField(post, 'content') : content;
  const displayCategory = window.YassoI18n ? window.YassoI18n.getLocalizedField(post, 'category') : category;
  const isRTL = window.YassoI18n ? window.YassoI18n.isRTL() : false;
  
  const formattedDate = formatDate(publishedDate);
  const blogUrl = `blog-details.html?slug=${slug}`;
  const fallbackImage = 'assets/img/blog/blog-list-1-1.jpg';
  const rawImageUrl = featuredImage || post?.featuredImageUrl || post?.imageUrl || post?.image || post?.thumbnail;
  const imageUrl = normalizeImageUrl(rawImageUrl) || fallbackImage;
  const categoryName = displayCategory || 'Uncategorized';
  
  // Use excerpt if available, otherwise create from content
  let postExcerpt = excerpt || 'Read more about this post...';
  if (!excerpt && displayContent) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = displayContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    postExcerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
  }
  
  // Detect which page we're on to use correct blog style
  const currentPage = window.location.pathname;
  const isBlogListPage = currentPage.includes('blog-list');
  const isNewsletterPage = currentPage.includes('blog.html');
  const blogStyle = isBlogListPage ? 'blog-style3' : 'blog-style1';
  const pageCardClass = isNewsletterPage ? 'newsletter-blog-card' : '';
  const cardInlineStyle = isNewsletterPage ? 'style="max-width:min(100%,640px);margin:0 auto 36px;"' : '';
  const imageWrapInlineStyle = isNewsletterPage ? 'style="aspect-ratio:16/10;max-height:260px;overflow:hidden;margin-bottom:16px;"' : '';
  const imageInlineStyle = isNewsletterPage ? 'style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"' : '';
  
  // blog-style1 has content inside blog-content, blog-style3 has wrapping blog-body
  if (blogStyle === 'blog-style1') {
    return `
      <div class="vs-blog ${blogStyle} ${pageCardClass} wow animate__fadeInUp wow-animated" dir="${isRTL ? 'rtl' : 'ltr'}" ${cardInlineStyle}>
        <div class="blog-img" ${imageWrapInlineStyle}>
          <a href="${blogUrl}">
            <img class="img" src="${imageUrl}" alt="${displayTitle}" ${imageInlineStyle} onerror="this.src='${fallbackImage}'">
          </a>
        </div>
        <div class="blog-content">
          <div class="blog-meta">
            <a href="blog.html">${categoryName}</a>
            <span>${formattedDate}</span>
          </div>
          <h3 class="blog-title">
            <a href="${blogUrl}">
              ${displayTitle}
            </a>
          </h3>
          <p class="blog-text">
            ${postExcerpt}
          </p>
          <div class="blog-footer">
            <a class="blog-link" href="${blogUrl}">\n              Read More
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.707 6.04883L10.957 9.79883C10.6055 10.1797 9.99023 10.1797 9.63867 9.79883C9.25781 9.44727 9.25781 8.83203 9.63867 8.48047L11.7773 6.3125H0.9375C0.410156 6.3125 0 5.90234 0 5.375C0 4.81836 0.410156 4.4375 0.9375 4.4375H11.7773L9.63867 2.29883C9.25781 1.94727 9.25781 1.33203 9.63867 0.980469C9.99023 0.599609 10.6055 0.599609 10.957 0.980469L14.707 4.73047C15.0879 5.08203 15.0879 5.69727 14.707 6.04883Z" fill="#FF3E01" />
              </svg>
            </a>
            <div class="blog-social">
              <a href="#">IG</a>
              <a href="#">FB</a>
              <a href="#">LI</a>
            </div>
          </div>
          <img src="assets/img/shapes/dot-shape-2.svg" alt="dot" class="blog-element">
        </div>
      </div>
    `;
  } else {
    return `
      <div class="vs-blog ${blogStyle} ${pageCardClass}" ${cardInlineStyle}>
        <div class="blog-body">
          <div class="blog-img" ${imageWrapInlineStyle}>
            <a href="${blogUrl}">
              <img class="img" src="${imageUrl}" alt="${displayTitle}" ${imageInlineStyle} onerror="this.src='${fallbackImage}'">
            </a>
          </div>
          <div class="blog-content">
            <div class="blog-meta">
              <a href="blog.html">${categoryName}</a>
              <span>${formattedDate}</span>
            </div>
            <h3 class="blog-title">
              <a href="${blogUrl}">
                ${displayTitle}
              </a>
            </h3>
            <p class="blog-text">
              ${postExcerpt}
            </p>
            <div class="blog-footer">
              <a class="blog-link" href="${blogUrl}">
                Read More
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.707 6.04883L10.957 9.79883C10.6055 10.1797 9.99023 10.1797 9.63867 9.79883C9.25781 9.44727 9.25781 8.83203 9.63867 8.48047L11.7773 6.3125H0.9375C0.410156 6.3125 0 5.90234 0 5.375C0 4.81836 0.410156 4.4375 0.9375 4.4375H11.7773L9.63867 2.29883C9.25781 1.94727 9.25781 1.33203 9.63867 0.980469C9.99023 0.599609 10.6055 0.599609 10.957 0.980469L14.707 4.73047C15.0879 5.08203 15.0879 5.69727 14.707 6.04883Z" fill="#FF3E01" />
                </svg>
              </a>
              <div class="blog-social">
                <a href="#">IG</a>
                <a href="#">FB</a>
                <a href="#">LI</a>
              </div>
            </div>
          </div>
        </div>
        <img src="assets/img/shapes/dot-shape-2.svg" alt="dot" class="blog-element">
      </div>
    `;
  }
}

/**
 * Render pagination controls
 * @param {number} totalPages - Total number of pages
 * @param {number} currentPage - Current page number
 */
function renderPagination(totalPages, currentPageNum) {
  const paginationContainer = document.querySelector('.vs-pagination');
  
  if (!paginationContainer || totalPages <= 1) {
    if (paginationContainer) {
      paginationContainer.style.display = 'none';
    }
    return;
  }
  
  paginationContainer.style.display = 'flex';
  
  const paginationList = paginationContainer.querySelector('ul');
  if (!paginationList) return;
  
  paginationList.innerHTML = '';
  
  // Determine page range to show
  const maxPagesToShow = 5;
  let startPage = Math.max(0, currentPageNum - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
  
  // Adjust if at the end
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(0, endPage - maxPagesToShow + 1);
  }
  
  // Add pages
  for (let i = startPage; i <= endPage; i++) {
    const pageNumber = i + 1; // Display as 1-indexed
    const isActive = i === currentPageNum;
    
    const li = document.createElement('li');
    if (isActive) {
      li.innerHTML = `<a href="#" class="active">${pageNumber}</a>`;
    } else {
      li.innerHTML = `<a href="#" data-page="${i}">${pageNumber}</a>`;
    }
    paginationList.appendChild(li);
  }
  
  // Update prev/next buttons
  const prevBtn = paginationContainer.querySelector('.pagi-btn:first-child');
  const nextBtn = paginationContainer.querySelector('.pagi-btn:last-child');
  
  if (prevBtn) {
    prevBtn.classList.toggle('disabled', currentPageNum === 0);
    prevBtn.setAttribute('data-page', Math.max(0, currentPageNum - 1));
  }
  
  if (nextBtn) {
    nextBtn.classList.toggle('disabled', currentPageNum >= totalPages - 1);
    nextBtn.setAttribute('data-page', Math.min(totalPages - 1, currentPageNum + 1));
  }
}

/**
 * Load blog posts and render them
 * @param {number} page - Page number
 */
async function loadBlogPosts(page = 0) {
  try {
    showLoading();
    
    const response = await fetchBlogPosts(page, PAGE_SIZE);
    
    if (response.content) {
      renderBlogPosts(response.content);
      renderPagination(response.totalPages, response.number);
      currentPage = response.number;
      
      // Scroll to top of blog section
      const blogSection = document.querySelector('.space-top');
      if (blogSection) {
        blogSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    hideLoading();
  } catch (error) {
    hideLoading();
    showError('Failed to load blog posts. Please try again later.');
  }
}

/**
 * Show loading indicator
 */
function showLoading() {
  const container = document.getElementById('blogPostsContainer');
  if (container) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading blog posts...</p>
      </div>
    `;
  }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
  // Loading is replaced by content, nothing to do
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  const container = document.getElementById('blogPostsContainer');
  if (container) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center">
          <p>${message}</p>
        </div>
      </div>
    `;
  }
}

/**
 * Go to specific page
 * @param {number} page - Page number
 */
function goToPage(page) {
  if (page < 0) return;
  loadBlogPosts(page);
}

/**
 * Initialize blog listing page
 */
function initBlogListing() {
  const blogContainer = document.getElementById('blogPostsContainer');
  
  if (!blogContainer) {
    return;
  }
  
  // Load initial blog posts
  loadBlogPosts(0);
  
  // Setup pagination event listeners
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a[data-page]');
    if (target) {
      e.preventDefault();
      const page = parseInt(target.getAttribute('data-page'), 10);
      if (!isNaN(page)) {
        goToPage(page);
      }
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlogListing);
} else {
  initBlogListing();
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchBlogPosts,
    fetchBlogPostBySlug,
    fetchRecentBlogPosts,
    searchBlogPosts,
    loadBlogPosts,
    renderBlogPosts
  };
}
