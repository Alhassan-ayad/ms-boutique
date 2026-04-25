/**
 * YASSO Home Page Dynamic Content Loader
 * 
 * Loads content from WebsiteContent API and renders sections dynamically
 * Supports both English and Arabic languages
 */

console.log('🚀 Home Content Loader script loaded!');

// API Configuration
const API_BASE_URL = window.API_CONFIG?.BASE_URL || '/api';
const apiRequest = window.YASSO_CONFIG?.apiRequest?.bind(window.YASSO_CONFIG);
const BACKEND_URL = API_BASE_URL.replace('/api', ''); // Remove /api for image paths
console.log('📡 API Base URL:', API_BASE_URL);
console.log('🖼️ Backend URL for images:', BACKEND_URL);

// Helper function to normalize image URLs - handles malformed backend responses
function normalizeImageUrl(url) {
  if (!url) return '';
  
  // If it's already a full URL (http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a local asset, return as is
  if (url.startsWith('assets/')) {
    return url;
  }
  
  // Standard format: /images/category/file.jpg (check FIRST!)
  if (url.startsWith('/images/')) {
    return BACKEND_URL + url;
  }
  
  // Missing leading slash but properly formatted
  if (url.startsWith('images/') && url.includes('/')) {
    return `${BACKEND_URL}/${url}`;
  }
  
  // Fix malformed paths ONLY if no slashes (e.g., "uploadsimagesloge53430a.jpg")
  if (url.includes('images') && !url.includes('/')) {
    const imagesIndex = url.indexOf('images');
    if (imagesIndex !== -1) {
      const afterImages = url.substring(imagesIndex + 6);
      
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
  
  // For any other path starting with /, prepend backend URL
  if (url.startsWith('/')) {
    return BACKEND_URL + url;
  }
  
  // Fallback
  return url;
}

function normalizeProductsResponse(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.content)) {
    return payload.content;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload && Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
}

function getProductImageUrl(product) {
  if (!product) return 'assets/img/products/product-1-1.jpg';

  const candidates = [
    product.primaryImageUrl,
    product.featuredImage,
    product.featuredImageUrl,
    product.imageUrl,
    product.image,
    product.thumbnail
  ];

  if (Array.isArray(product.images)) {
    product.images.forEach((image) => {
      if (typeof image === 'string') {
        candidates.push(image);
        return;
      }

      candidates.push(image?.imageUrl, image?.url, image?.src);
    });
  }

  if (Array.isArray(product.colorVariants)) {
    product.colorVariants.forEach((variant) => {
      if (typeof variant === 'string') {
        candidates.push(variant);
        return;
      }

      candidates.push(
        variant?.imageUrl,
        variant?.primaryImageUrl,
        variant?.featuredImage,
        variant?.featuredImageUrl
      );
    });
  }

  for (const candidate of candidates) {
    const normalized = normalizeImageUrl(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return 'assets/img/products/product-1-1.jpg';
}

// Get current language from YassoI18n or localStorage
function getCurrentLanguage() {
  if (window.YassoI18n && typeof window.YassoI18n.currentLang === 'function') {
    return window.YassoI18n.currentLang();
  }
  return localStorage.getItem('yasso_lang') || 'en';
}

// Current language (from i18n.js)
let currentLanguage = getCurrentLanguage();

// Cache for loaded content
let contentCache = {};

/**
 * Initialize home content loader
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏠 DOMContentLoaded - Initializing home content loader');
  console.log('🌍 Current language:', currentLanguage);
  
  // Listen for language changes
  window.addEventListener('languageChanged', (event) => {
    console.log('🔄 Language changed to:', event.detail.language);
    currentLanguage = getCurrentLanguage();
    loadHomeContent();
  });
  
  // Load content on page load
  console.log('⏳ Starting to load home content...');
  loadHomeContent();
});

/**
 * Load all home page content from backend
 */
async function loadHomeContent() {
  try {
    console.log('🔍 Loading home page content for language:', currentLanguage);
    
    // Use unified section names - contentValueAr will be used automatically for Arabic
    const sections = ['Hero', 'Featured', 'About', 'Features', 'Story', 'Blog'];
    
    console.log('📦 Sections to load:', sections);
    
    // Fetch all sections concurrently
    const [heroContent, featuredContent, aboutContent, featuresContent, storyContent, blogContent] = await Promise.all([
      fetchSectionContentWithFallbacks(['Hero', 'hero']),
      fetchSectionContentWithFallbacks(['Featured', 'featured']),
      fetchSectionContentWithFallbacks(['About', 'about']),
      fetchSectionContentWithFallbacks(['Features', 'features']),
      fetchSectionContentWithFallbacks(['Story', 'story']),
      fetchSectionContentWithFallbacks(['Blog', 'blog'])
    ]);
    
    console.log('✅ Content loaded:', {
      hero: heroContent?.length || 0,
      featured: featuredContent?.length || 0,
      about: aboutContent?.length || 0,
      features: featuresContent?.length || 0,
      story: storyContent?.length || 0,
      blog: blogContent?.length || 0
    });
    
    // Render sections
    if (heroContent && heroContent.length > 0) {
      console.log('🎨 Rendering hero section...');
      renderHeroSection(heroContent);
    } else {
      console.warn('⚠️ No hero content to render');
    }
    
    console.log('🎨 Rendering featured section...');
    if (!featuredContent || featuredContent.length === 0) {
      console.warn('⚠️ No featured CMS content found; loading featured products with default section headings');
    }
    renderFeaturedSection(featuredContent || []);
    
    if (aboutContent && aboutContent.length > 0) {
      console.log('🎨 Rendering about section...');
      renderAboutSection(aboutContent);
    } else {
      console.warn('⚠️ No about content to render');
    }
    
    if (featuresContent && featuresContent.length > 0) {
      console.log('🎨 Rendering features section...');
      renderFeaturesSection(featuresContent);
    } else {
      console.warn('⚠️ No features content to render');
    }

    if (storyContent && storyContent.length > 0) {
      console.log('🎨 Rendering story section...');
      renderStorySection(storyContent);
    } else {
      console.log('ℹ️ No story content from API — static fallback text will display');
    }
    
    // Load and render blog section
    console.log('🎨 Loading blog section...');
    await renderBlogSection(blogContent);
    
  } catch (error) {
    console.error('❌ Error loading home content:', error);
  }
}

/**
 * Fetch content for a specific section from backend
 */
async function fetchSectionContent(sectionName) {
  try {
    const url = `${API_BASE_URL}/website-content/section/${sectionName}/all`;
    console.log('🌐 Fetching:', url);

    if (apiRequest) {
      const content = await apiRequest(url);
      const filtered = content
        .filter(item => item.isActive)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      console.log('✅ Filtered & sorted:', filtered);
      return filtered;
    }
    
    const response = await fetch(url);
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`⚠️ No content found for section: ${sectionName}`);
        return [];
      }
      throw new Error(`Failed to fetch content: ${response.status}`);
    }
    
    const content = await response.json();
    console.log('📦 Received content:', content);
    
    // Filter active content and sort by display order
    const filtered = content
      .filter(item => item.isActive)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    
    console.log('✅ Filtered & sorted:', filtered);
    return filtered;
    
  } catch (error) {
    console.error(`❌ Error fetching section ${sectionName}:`, error);
    return [];
  }
}

async function fetchSectionContentWithFallbacks(sectionNames) {
  const tried = [];

  for (const sectionName of sectionNames) {
    tried.push(sectionName);
    const content = await fetchSectionContent(sectionName);
    if (content && content.length > 0) {
      if (tried.length > 1) {
        console.log(`✅ Loaded content from fallback section name: ${sectionName}`);
      }
      return content;
    }
  }

  return [];
}

/**
 * Render Hero/Banner Section
 * Hero content expected in this order:
 * 1 - Title word 1 (TEXT)
 * 2 - Title word 2 (TEXT)
 * 3 - Subtitle (HTML)
 * 4 - Button text (TEXT)
 * 5 - Button URL (URL)
 * 6 - Hero image (IMAGE)
 */
function renderHeroSection(heroContent) {
  if (!heroContent || heroContent.length === 0) {
    console.log('No hero content to render');
    return;
  }
  
  console.log('🎨 Rendering hero section with', heroContent.length, 'items');
  console.log('📦 Hero content:', heroContent);
  
  // Find hero elements
  const heroTitle1 = document.querySelector('[data-content="hero-title1"]') || 
                     document.querySelector('.hero-title .highlight.htext1');
  const heroTitle2 = document.querySelector('[data-content="hero-title2"]') || 
                     document.querySelector('.hero-title .htext2');
  const heroSubtitle = document.querySelector('[data-content="hero-subtitle"]') || 
                       document.querySelector('.hero-subtitle .htext3');
  const heroButton = document.querySelector('[data-content="hero-button"]') || 
                     document.querySelector('.hero-content .vs-btn');
  const heroImage = document.querySelector('[data-content="hero-image"]') || 
                    document.querySelector('.hero-img3');
  
  console.log('🔍 Found elements:', {
    heroTitle1: !!heroTitle1,
    heroTitle2: !!heroTitle2,
    heroSubtitle: !!heroSubtitle,
    heroButton: !!heroButton,
    heroImage: !!heroImage
  });
  
  // Map content by display order
  const contentByOrder = {};
  heroContent.forEach(item => {
    contentByOrder[item.displayOrder] = item;
  });
  
  console.log('📋 Content mapped by order:', contentByOrder);
  
  // Render each item based on display order
  // Order 1: First title word
  if (contentByOrder[1] && heroTitle1) {
    heroTitle1.textContent = getContentValue(contentByOrder[1]);
    console.log('✅ Set hero title 1:', getContentValue(contentByOrder[1]));
  }
  
  // Order 2: Second title word
  if (contentByOrder[2] && heroTitle2) {
    heroTitle2.textContent = getContentValue(contentByOrder[2]);
    console.log('✅ Set hero title 2:', getContentValue(contentByOrder[2]));
  }
  
  // Order 3: Subtitle
  if (contentByOrder[3] && heroSubtitle) {
    if (contentByOrder[3].contentType === 'HTML') {
      heroSubtitle.innerHTML = getContentValue(contentByOrder[3]);
    } else {
      heroSubtitle.textContent = getContentValue(contentByOrder[3]);
    }
    console.log('✅ Set hero subtitle');
  }
  
  // Order 4: Button text
  if (contentByOrder[4] && heroButton) {
    const buttonText = heroButton.querySelector('.btn-text') || heroButton;
    buttonText.textContent = getContentValue(contentByOrder[4]);
    console.log('✅ Set hero button text:', getContentValue(contentByOrder[4]));
  }
  
  // Order 5: Button URL
  if (contentByOrder[5] && heroButton) {
    heroButton.href = getContentValue(contentByOrder[5]);
    console.log('✅ Set hero button URL:', getContentValue(contentByOrder[5]));
  }
  
  // Order 6: Hero image
  if (contentByOrder[6] && heroImage) {
    const imageUrl = normalizeImageUrl(getContentValue(contentByOrder[6]));
    heroImage.src = imageUrl;
    heroImage.alt = `Hero ${currentLanguage}`;
    console.log('✅ Set hero image:', imageUrl);
  }
  
  console.log('🎉 Hero section rendering complete!');
}

/**
 * Render About Section
 * About content expected in this order:
 * 1 - Title/Heading (TEXT)
 * 2 - Description/Text (HTML or TEXT)
 * 3 - Image (IMAGE)
 */
function renderAboutSection(aboutContent) {
  if (!aboutContent || aboutContent.length === 0) {
    console.log('No about content to render');
    return;
  }
  
  console.log('🎨 Rendering about section with', aboutContent.length, 'items');
  
  // Find about section elements
  const aboutSection = document.querySelector('.about-layout1, .about-section');
  if (!aboutSection) {
    console.log('⚠️ About section not found in DOM');
    return;
  }
  
  const aboutTitle = aboutSection.querySelector('[data-content="about-title"]') || 
                     aboutSection.querySelector('.sec-title');
  const aboutText = aboutSection.querySelector('[data-content="about-text"]') || 
                    aboutSection.querySelector('.about-text, .sec-text');
  const aboutImage = aboutSection.querySelector('[data-content="about-image"]') || 
                     aboutSection.querySelector('.about-img img');
  
  console.log('🔍 Found about elements:', {
    aboutTitle: !!aboutTitle,
    aboutText: !!aboutText,
    aboutImage: !!aboutImage
  });
  
  // Map content by display order
  const contentByOrder = {};
  aboutContent.forEach(item => {
    contentByOrder[item.displayOrder] = item;
  });
  
  // Order 1: Title
  if (contentByOrder[1] && aboutTitle) {
    aboutTitle.textContent = getContentValue(contentByOrder[1]);
    console.log('✅ Set about title:', getContentValue(contentByOrder[1]));
  }
  
  // Order 2: Description text
  if (contentByOrder[2] && aboutText) {
    if (contentByOrder[2].contentType === 'HTML') {
      aboutText.innerHTML = getContentValue(contentByOrder[2]);
    } else {
      aboutText.textContent = getContentValue(contentByOrder[2]);
    }
    console.log('✅ Set about text');
  }
  
  // Order 3: Image
  if (contentByOrder[3] && aboutImage) {
    const imageUrl = normalizeImageUrl(getContentValue(contentByOrder[3]));
    aboutImage.src = imageUrl;
    aboutImage.alt = `About ${currentLanguage}`;
    console.log('✅ Set about image:', imageUrl);
  }
  
  console.log('🎉 About section rendering complete!');
}

/**
 * Render Featured Products Section
 * Featured section content expected in this order:
 * 1 - Subtitle (TEXT)
 * 2 - Main Title (TEXT)
 * 
 * Also fetches and renders featured products from the database
 */
async function renderFeaturedSection(featuredContent) {
  if (!featuredContent || featuredContent.length === 0) {
    console.log('ℹ️ No featured content to render from CMS; using static section header and loading featured products');
  } else {
    console.log('🎨 Rendering featured section with', featuredContent.length, 'items');
    console.log('📦 Featured content:', featuredContent);
  }
  
  // Find featured section elements
  const featuredSubtitle = document.querySelector('[data-content="featured-subtitle"]') || 
                           document.querySelector('.section-layout1 .sec-subtitle');
  const featuredTitle = document.querySelector('[data-content="featured-title"]') || 
                        document.querySelector('.section-layout1 .sec-title');
  
  console.log('🔍 Found featured elements:', {
    featuredSubtitle: !!featuredSubtitle,
    featuredTitle: !!featuredTitle
  });
  
  // Map content by display order
  const contentByOrder = {};
  featuredContent.forEach(item => {
    contentByOrder[item.displayOrder] = item;
  });
  
  if (featuredContent && featuredContent.length > 0) {
    console.log('📋 Featured content mapped by order:', contentByOrder);
  }
  
  // Order 1: Subtitle
  if (contentByOrder[1] && featuredSubtitle) {
    featuredSubtitle.textContent = getContentValue(contentByOrder[1]);
    console.log('✅ Set featured subtitle:', getContentValue(contentByOrder[1]));
  }
  
  // Order 2: Main Title
  if (contentByOrder[2] && featuredTitle) {
    featuredTitle.textContent = getContentValue(contentByOrder[2]);
    console.log('✅ Set featured title:', getContentValue(contentByOrder[2]));
  }
  
  // Fetch and render featured products
  await loadFeaturedProducts();
  
  console.log('🎉 Featured section rendering complete!');
}

/**
 * Fetch and render featured products from database
 */
async function loadFeaturedProducts() {
  try {
    console.log('📦 Fetching featured products...');

    let products;
    if (apiRequest) {
      products = await apiRequest(`${API_BASE_URL}/products/featured`);
    } else {
      const response = await fetch(`${API_BASE_URL}/products/featured`);
      if (!response.ok) {
        console.error('❌ Failed to fetch featured products:', response.status);
        return;
      }
      products = await response.json();
    }

    products = normalizeProductsResponse(products);

    console.log('✅ Fetched', products.length, 'featured products:', products);
    
    if (!products || products.length === 0) {
      console.warn('⚠️ No featured products found');
      return;
    }
    
    // Get container
    const container = document.getElementById('featuredProductsContainer');
    if (!container) {
      console.error('❌ Featured products container not found');
      return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Render each product
    products.forEach((product, index) => {
      container.appendChild(createFeaturedProductCard(product, index, products.length));
    });
    
    console.log('🎨 Featured products rendered successfully!');
    
  } catch (error) {
    console.error('❌ Error loading featured products:', error);
  }
}

/**
 * Create a product card element for featured section
 */
function createFeaturedProductCard(product, index, total) {
  const col = document.createElement('div');
  const colClass = total === 1 ? 'col-lg-4 col-md-8 col-sm-10'
                 : total === 2 ? 'col-lg-4 col-md-6'
                 : total === 3 ? 'col-lg-4 col-md-6'
                 : 'col-lg-3 col-md-6';
  col.className = colClass + ' wow animate__fadeInUp';
  col.setAttribute('data-wow-delay', `${0.25 + (index * 0.2)}s`);

  // Get product name (with language support)
  const productName = currentLanguage === 'ar' && product.nameAr ? product.nameAr : product.name;
  const productImage = getProductImageUrl(product);

  // Show NEW badge if product is marked as new arrival
  const isNew = product.isNew || product.newArrival || false;
  const newBadge = isNew ? `<span class="fp-card__badge">NEW</span>` : '';

  const detailUrl = `shop-details.html?id=${product.id}`;

  col.innerHTML = `
    <div class="fp-card">
      <div class="fp-card__img-wrap">
        ${newBadge}
        <a href="${detailUrl}">
          <img src="${productImage}" alt="${productName}" onerror="this.src='assets/img/products/product-1-1.jpg'">
        </a>
      </div>
      <div class="fp-card__body">
        <h3 class="fp-card__name"><a href="${detailUrl}">${productName}</a></h3>
        <p class="fp-card__price">EGP ${(Number(product.price) || 0).toFixed(2)}</p>
      </div>
    </div>
  `;

  return col;
}

/**
 * Add product to cart from featured section
 */
function addToCartFromFeatured(productId) {
  console.log('Adding product to cart:', productId);
  // Implementation will use existing addToCart functionality
  if (typeof addToCart === 'function') {
    addToCart(productId);
  } else {
    console.warn('addToCart function not found, redirecting to product details');
    window.location.href = `shop-details.html?id=${productId}`;
  }
}

/**
 * Render YASSO Story Section
 * Story_EN / Story_AR content expected in this order:
 * 1 - Section subtitle  (TEXT)  e.g. "our story"
 * 2 - Heading           (TEXT)  e.g. "OUR STORY"
 * 3 - Story paragraph   (HTML or TEXT)
 */
function renderStorySection(storyContent) {
  if (!storyContent || storyContent.length === 0) return;

  const storySubtitle = document.querySelector('.yasso-story-subtitle');
  const storyHeading  = document.querySelector('.yasso-story-heading');
  const storyText     = document.getElementById('yassoStoryText');

  const contentByOrder = {};
  storyContent.forEach(function(item) {
    contentByOrder[item.displayOrder] = item;
  });

  if (contentByOrder[1] && storySubtitle) {
    storySubtitle.textContent = getContentValue(contentByOrder[1]);
  }
  if (contentByOrder[2] && storyHeading) {
    storyHeading.textContent = getContentValue(contentByOrder[2]);
  }
  if (contentByOrder[3] && storyText) {
    if (contentByOrder[3].contentType === 'HTML') {
      storyText.innerHTML = getContentValue(contentByOrder[3]);
    } else {
      storyText.textContent = getContentValue(contentByOrder[3]);
    }
  }

  // Re-translate any newly injected text if Arabic is active
  if (window.YassoI18n && window.YassoI18n.currentLang() === 'ar') {
    var section = document.querySelector('.yasso-story-section');
    if (section) window.YassoI18n.translate(section);
  }

  console.log('🎉 Story section rendered from dashboard!');
}

/**
 * Render Features Section
 */
function renderFeaturesSection(featuresContent) {
  if (!featuresContent || featuresContent.length === 0) {
    console.log('No features content to render');
    return;
  }
  
  console.log('🎨 Rendering features section with', featuresContent.length, 'items');
  
  // Implementation depends on your features HTML structure
  // This is a placeholder for features rendering
}

/**
 * Get content value based on current language and type
 */
function getContentValue(contentItem) {
  if (!contentItem) return '';
  
  // Use Arabic content if language is Arabic and contentValueAr exists
  let value = contentItem.contentValue;
  if (currentLanguage === 'ar' && contentItem.contentValueAr) {
    value = contentItem.contentValueAr;
  }
  
  switch (contentItem.contentType) {
    case 'TEXT':
    case 'HTML':
      return value;
      
    case 'IMAGE':
    case 'VIDEO':
    case 'URL':
      // If it's a URL, return as-is
      // If it's a backend path, prepend API base if needed
      if (value.startsWith('http')) {
        return value;
      } else if (value.startsWith('/uploads/')) {
        return `${API_BASE_URL}${value}`;
      } else {
        return value;
      }
      
    default:
      return value;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Render Blog Section
 * Fetches and displays recent blog posts
 */
async function renderBlogSection(blogContent) {
  try {
    console.log('🎨 Rendering blog section...');
    
    // Render blog section header if content is available
    if (blogContent && blogContent.length > 0) {
      console.log('📝 Rendering blog section header with', blogContent.length, 'items');
      
      // Find blog section elements
      const blogSubtitle = document.querySelector('[data-content="blog-subtitle"]');
      const blogTitle = document.querySelector('[data-content="blog-title"]');
      
      // Map content by display order
      const contentByOrder = {};
      blogContent.forEach(item => {
        contentByOrder[item.displayOrder] = item;
      });
      
      // Order 1: Subtitle
      if (contentByOrder[1] && blogSubtitle) {
        blogSubtitle.textContent = getContentValue(contentByOrder[1]);
        console.log('✅ Set blog subtitle:', getContentValue(contentByOrder[1]));
      }
      
      // Order 2: Main Title
      if (contentByOrder[2] && blogTitle) {
        blogTitle.textContent = getContentValue(contentByOrder[2]);
        console.log('✅ Set blog title:', getContentValue(contentByOrder[2]));
      }
    } else {
      console.log('ℹ️ No blog header content from API — static fallback text will display');
    }
    
    // Load and render blog posts
    await loadRecentBlogPosts();
    console.log('🎉 Blog section rendering complete!');
  } catch (error) {
    console.error('❌ Error rendering blog section:', error);
  }
}

/**
 * Fetch and render featured blog posts from database
 */
async function loadRecentBlogPosts() {
  try {
    console.log('📦 Fetching featured blog posts for homepage...');
    
    // Fetch featured blog posts from API (only posts marked as featured)
    let response = await fetch(`${API_BASE_URL}/blog-posts/featured?limit=3`);
    
    // Fallback to recent posts if featured endpoint doesn't exist or returns no results
    if (!response.ok) {
      console.warn('⚠️ Featured blog posts endpoint not available, falling back to recent posts');
      response = await fetch(`${API_BASE_URL}/blog-posts/recent?limit=3`);
    }
    
    if (!response.ok) {
      console.error('❌ Failed to fetch blog posts:', response.status);
      return;
    }
    
    const blogPosts = await response.json();
    console.log('✅ Fetched', blogPosts.length, 'featured blog posts:', blogPosts);
    
    if (!blogPosts || blogPosts.length === 0) {
      console.warn('⚠️ No blog posts found');
      return;
    }
    
    // Get container
    const container = document.getElementById('recentBlogPostsContainer');
    if (!container) {
      console.error('❌ Blog posts container not found');
      return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Render each blog post
    blogPosts.forEach((post, index) => {
      container.appendChild(createBlogCard(post, index));
    });
    
    console.log('🎨 Blog posts rendered successfully!');
    
  } catch (error) {
    console.error('❌ Error loading blog posts:', error);
  }
}

/**
 * Create a blog card element
 */
function createBlogCard(post, index) {
  const col = document.createElement('div');
  col.className = 'col-lg-4 wow animate__fadeInUp';
  col.setAttribute('data-wow-delay', `${0.2 + (index * 0.2)}s`);
  
  // Get blog title (with language support)
  const title = currentLanguage === 'ar' && post.titleAr ? post.titleAr : post.title;
  
  // Get excerpt/summary (if available)
  const excerpt = currentLanguage === 'ar' && post.excerptAr ? post.excerptAr : (post.excerpt || '');
  
  // Get featured image or use placeholder
  const featuredImage = normalizeImageUrl(post.featuredImage) || 'assets/img/blog/blog-img-1-1.jpg';
  
  // Format published date
  const publishedDate = post.publishedDate ? new Date(post.publishedDate).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';
  
  // Get author name or default
  const authorName = post.authorName || 'Admin';
  
  // Create blog post URL (using slug if available)
  const blogUrl = post.slug ? `blog-details.html?slug=${post.slug}` : `blog-details.html?id=${post.id}`;
  
  col.innerHTML = `
    <div class="vs-blog blog-style2">
      <div class="blog-img">
        <a href="${blogUrl}">
          <img class="img" src="${featuredImage}" alt="${escapeHtml(title)}" onerror="this.src='assets/img/blog/blog-img-1-1.jpg'">
        </a>
      </div>
      <div class="blog-body">
        <div class="blog-metas">
          <span class="blog-meta">${escapeHtml(publishedDate)}</span>
          <a href="#" class="blog-meta">${escapeHtml(authorName)}</a>
        </div>
        <h3 class="blog-title">
          <a href="${blogUrl}">${escapeHtml(title)}</a>
        </h3>
        <span class="blog-divider2"></span>
        <span class="blog-divider"></span>
        <a href="${blogUrl}" class="blog-link">${currentLanguage === 'ar' ? 'اقرأ المزيد' : 'read more'}</a>
      </div>
    </div>
  `;
  
  return col;
}

// Export for use in other scripts
window.HomeContentLoader = {
  loadHomeContent,
  fetchSectionContent,
  renderHeroSection,
  renderFeaturedSection,
  renderAboutSection,
  renderStorySection,
  renderBlogSection
};

console.log('✅ Home Content Loader initialized and ready!');
