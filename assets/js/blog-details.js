/**
 * YASSO Blog Details Handler
 * 
 * Fetches and displays single blog post by slug
 */

const API_BASE_URL = window.YASSO_CONFIG?.API_BASE_URL || '/api';
const apiRequest = window.YASSO_CONFIG?.apiRequest?.bind(window.YASSO_CONFIG);

/**
 * Normalize blog image URLs coming from backend uploads.
 * Handles absolute local URLs, relative image paths, and malformed values.
 */
function normalizeBlogImageUrl(url) {
  if (!url) return '';

  const rawUrl = String(url).trim();
  if (!rawUrl || rawUrl === 'null' || rawUrl === 'undefined') return '';

  if (rawUrl.startsWith('data:image/') || rawUrl.startsWith('assets/')) {
    return rawUrl;
  }

  const backendUrl = API_BASE_URL.replace('/api', '');

  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    try {
      const parsedUrl = new URL(rawUrl);
      const isLocalHost = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';

      if (isLocalHost && (parsedUrl.pathname.startsWith('/images/') || parsedUrl.pathname.startsWith('/uploads/'))) {
        return `${backendUrl}${parsedUrl.pathname}`;
      }

      if (window.location.protocol === 'https:' && parsedUrl.protocol === 'http:') {
        return rawUrl.replace(/^http:\/\//i, 'https://');
      }
    } catch (_error) {
      // Fall through and return raw URL below.
    }

    return rawUrl;
  }

  if (rawUrl.startsWith('/images/') || rawUrl.startsWith('/uploads/')) {
    return `${backendUrl}${rawUrl}`;
  }

  if (rawUrl.startsWith('images/') || rawUrl.startsWith('uploads/')) {
    return `${backendUrl}/${rawUrl}`;
  }

  if (/^[a-f0-9-]+\.(?:jpg|jpeg|png|gif|webp)$/i.test(rawUrl)) {
    return `${backendUrl}/images/blog/${rawUrl}`;
  }

  if (rawUrl.startsWith('/')) {
    return `${backendUrl}${rawUrl}`;
  }

  return `${backendUrl}/${rawUrl}`;
}

/**
 * Get URL parameter by name
 * @param {string} name - Parameter name
 * @returns {string|null} - Parameter value
 */
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Fetch blog post by slug
 * @param {string} slug - Blog post slug
 * @returns {Promise<Object>} - Blog post data
 */
async function fetchBlogPostBySlug(slug) {
  try {
    const url = `${API_BASE_URL}/blog-posts/slug/${slug}`;

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
 * Render blog post content
 * @param {Object} post - Blog post object
 */
function renderBlogPost(post) {
  const container = document.getElementById('blogPostContent');
  
  if (!container) {
    return;
  }
  
  const {
    id,
    title,
    titleAr,
    slug,
    content,
    contentAr,
    featuredImage,
    category,
    categoryAr,
    publishedDate,
    authorName,
    tags
  } = post;
  
  // Get localized fields
  const displayTitle = window.YassoI18n ? window.YassoI18n.getLocalizedField(post, 'title') : title;
  const displayContent = window.YassoI18n ? window.YassoI18n.getLocalizedField(post, 'content') : content;
  const displayCategory = window.YassoI18n ? window.YassoI18n.getLocalizedField(post, 'category') : category;
  const isRTL = window.YassoI18n ? window.YassoI18n.isRTL() : false;
  
  const formattedDate = formatDate(publishedDate);
  const fallbackImage = 'assets/img/blog/blog-big-1-1.jpg';
  const rawImageUrl = featuredImage || post?.featuredImageUrl || post?.imageUrl || post?.image || post?.thumbnail;
  const imageUrl = normalizeBlogImageUrl(rawImageUrl) || fallbackImage;
  const categoryName = displayCategory || 'Uncategorized';
  
  // Update page title
  document.title = `${displayTitle} - YASSO Blog`;
  
  // Render blog post
  container.innerHTML = `
    <div class="vs-blog blog-style1 blog-single" dir="${isRTL ? 'rtl' : 'ltr'}">
      <div class="blog-img">
        <img class="img" src="${imageUrl}" alt="${displayTitle}" onerror="this.src='${fallbackImage}'">
      </div>
      <div class="blog-content">
        <div class="blog-meta">
          <a href="blog.html">${categoryName}</a>
          <span>${formattedDate}</span>
        </div>
        <h3 class="blog-title">
          ${displayTitle}
        </h3>
        <div class="blog-text">
          ${displayContent}
        </div>
        ${tags ? renderTags(tags) : ''}
      </div>
    </div>
  `;
}

/**
 * Render tags
 * @param {string} tagsString - Comma-separated tags
 * @returns {string} - HTML string
 */
function renderTags(tagsString) {
  if (!tagsString) return '';
  
  const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
  
  if (tagsArray.length === 0) return '';
  
  return `
    <div class="blog-tags mt-4">
      <strong>Tags:</strong>
      ${tagsArray.map(tag => `<span class="blog-tag-item">${tag}</span>`).join('')}
    </div>
  `;
}

/**
 * Show loading indicator
 */
function showLoading() {
  const container = document.getElementById('blogPostContent');
  if (container) {
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading blog post...</p>
      </div>
    `;
  }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  const container = document.getElementById('blogPostContent');
  if (container) {
    container.innerHTML = `
      <div class="alert alert-danger text-center">
        <h4>Oops! Something went wrong</h4>
        <p>${message}</p>
        <a href="blog.html" class="vs-btn">Back to Blog</a>
      </div>
    `;
  }
}

/**
 * Load blog post from URL slug
 */
async function loadBlogPost() {
  const slug = getUrlParameter('slug');
  
  if (!slug) {
    showError('No blog post specified. Please select a blog post to read.');
    return;
  }
  
  try {
    showLoading();
    
    const post = await fetchBlogPostBySlug(slug);
    
    if (post) {
      renderBlogPost(post);
    } else {
      showError('Blog post not found.');
    }
  } catch (error) {
    if (error.message.includes('404')) {
      showError('Blog post not found. It may have been removed or the link is incorrect.');
    } else {
      showError('Failed to load blog post. Please try again later.');
    }
  }
}

/**
 * Initialize blog details page
 */
function initBlogDetails() {
  const container = document.getElementById('blogPostContent');
  
  if (!container) {
    return;
  }
  
  loadBlogPost();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlogDetails);
} else {
  initBlogDetails();
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchBlogPostBySlug,
    loadBlogPost,
    renderBlogPost
  };
}
