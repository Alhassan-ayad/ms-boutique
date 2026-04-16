/**
 * Announcement Popup Manager
 *
 * Behaviour:
 *  - Fetches active popup from backend API
 *  - Shows ENTRY type popup on first page load of session
 *  - Only shows database content (no static fallback)
 *  - Supports Arabic and English languages
 *  - User closes it manually — it won't auto-open again in the same session
 *  - The header ✕ button (sideMenuToggler) manually re-opens it anytime
 */

(function () {
  'use strict';

  var API_BASE_URL = window.YASSO_CONFIG?.API_BASE_URL || '/api';
  var BACKEND_URL = API_BASE_URL.replace('/api', '');
  var SESSION_KEY = 'yasso_popup_session';
  var currentPopup = null;
  
  // Normalize image URL - handles malformed backend responses
  function normalizeImageUrl(url) {
    if (!url) return '';
    
    // Already a full URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Standard format: /images/category/file.jpg (check FIRST!)
    if (url.startsWith('/images/')) {
      return BACKEND_URL + url;
    }
    
    // Missing leading slash but properly formatted
    if (url.startsWith('images/') && url.includes('/')) {
      return BACKEND_URL + '/' + url;
    }
    
    // Fix malformed paths ONLY if no slashes (e.g., "uploadsimagesloge53430a.jpg")
    if (url.includes('images') && !url.includes('/')) {
      var imagesIndex = url.indexOf('images');
      if (imagesIndex !== -1) {
        var afterImages = url.substring(imagesIndex + 6);
        
        var pathMatch = afterImages.match(/([a-z]+)([a-f0-9-]+\.(?:jpg|jpeg|png|gif|webp))/i);
        if (pathMatch) {
          var category = pathMatch[1];
          var filename = pathMatch[2];
          
          var fixedCategory = category;
          if (category === 'log' || category === 'logo') fixedCategory = 'logo';
          else if (category === 'pop' || category === 'popup') fixedCategory = 'popup';
          else if (category === 'cont' || category === 'content') fixedCategory = 'content';
          else if (category === 'blog') fixedCategory = 'blog';
          
          return BACKEND_URL + '/images/' + fixedCategory + '/' + filename;
        }
      }
    }
    
    // Fallback for any path starting with /
    if (url.startsWith('/')) {
      return BACKEND_URL + url;
    }
    
    // Fallback
    return BACKEND_URL + '/' + url;
  }
  
  // Get current language from YassoI18n or localStorage
  function getCurrentLanguage() {
    if (window.YassoI18n && typeof window.YassoI18n.currentLang === 'function') {
      return window.YassoI18n.currentLang();
    }
    return localStorage.getItem('yasso_lang') || 'en';
  }
  
  var currentLanguage = getCurrentLanguage();

  /* ── Fetch popup from backend ────────────────────────────────── */
  async function fetchPopup() {
    try {
      const response = await fetch(`${API_BASE_URL}/promotional-popups/current/type/ENTRY`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      // No active popup is an expected state; don't log as an error.
      if (response.status === 404 || response.status === 204) {
        return null;
      }
      return null;
    } catch (error) {
      // Network/API unavailability should not break page flow.
      console.warn('Popup service unavailable');
      return null;
    }
  }

  /* ── Open / Close ────────────────────────────────────────────── */
  function openPopup() {
    var overlay = document.getElementById('announcementOverlay');
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    var overlay = document.getElementById('announcementOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ── Render with backend config ──────────────────────────────── */
  function renderConfig(popup) {
    var popupEl = document.getElementById('announcementPopup');
    if (!popupEl) return;
    popupEl.classList.remove('ann-default');

    var inner = document.getElementById('announcementInner');
    if (!inner) {
      inner = document.createElement('div');
      inner.id = 'announcementInner';
      popupEl.appendChild(inner);
    }
    inner.style.display = '';
    inner.className = 'announcement-inner layout-image-text';

    // Use Arabic content if language is Arabic, otherwise use default
    var title = currentLanguage === 'ar' && popup.titleAr ? popup.titleAr : popup.title;
    var message = currentLanguage === 'ar' && popup.messageAr ? popup.messageAr : popup.message;
    var ctaText = currentLanguage === 'ar' && popup.ctaButtonTextAr ? popup.ctaButtonTextAr : popup.ctaButtonText;

    // Normalize image URL to include backend URL
    var imageUrl = popup.image ? normalizeImageUrl(popup.image) : '';

    inner.innerHTML =
      '<div class="ann-image">' +
        (imageUrl
          ? '<img src="' + imageUrl + '" alt="' + (title || 'Announcement') + '" onerror="console.error(\'Failed to load popup image:\', this.src);">'
          : '<div class="ann-image-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>') +
      '</div>' +
      '<div class="ann-text">' +
        '<h2>' + (title || '') + '</h2>' +
        '<p>' + (message || '') + '</p>' +
        (ctaText ? '<a href="' + (popup.ctaLink || '#') + '" class="ann-cta">' + ctaText + '</a>' : '') +
      '</div>';

    var closeBtn = document.getElementById('announcementClose');
    if (closeBtn) closeBtn.style.display = '';
  }

  /* ── Render when no active popup (don't show anything) ─────────── */
  function renderDefault() {
    // No static content - only show database content
    // If there's no active popup in the database, don't show the popup at all
    var popupEl = document.getElementById('announcementPopup');
    if (popupEl) {
      popupEl.classList.add('ann-default');
    }
    
    var inner = document.getElementById('announcementInner');
    if (inner) {
      inner.style.display = 'none';
    }
    
    // Don't show the popup if there's no database content
    closePopup();
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  async function init() {
    var overlay = document.getElementById('announcementOverlay');
    if (!overlay) return;

    // Update current language on load
    currentLanguage = getCurrentLanguage();

    // Listen for language changes
    window.addEventListener('languageChanged', async function(event) {
      currentLanguage = getCurrentLanguage();
      
      // Refresh popup content with new language
      if (currentPopup && currentPopup.isActive) {
        renderConfig(currentPopup);
      }
    });

    // Fetch popup from backend
    currentPopup = await fetchPopup();

    // Render content
    if (currentPopup && currentPopup.isActive) {
      renderConfig(currentPopup);
    } else {
      renderDefault();
      return; // Don't show popup if no database content
    }

    // Wire corner close button
    var closeBtn = document.getElementById('announcementClose');
    if (closeBtn && !closeBtn._bound) {
      closeBtn._bound = true;
      closeBtn.addEventListener('click', closePopup);
    }
    if (closeBtn) closeBtn.style.display = '';

    // Click dark backdrop to close
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePopup();
    });

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePopup();
    });

    // ✕ header button — always opens popup manually
    var toggler = document.querySelector('.sideMenuToggler');
    if (toggler && !toggler._annBound) {
      toggler._annBound = true;
      if (window.jQuery) jQuery(toggler).off('click');
      toggler.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Refresh popup data
        var popup = await fetchPopup();
        if (popup && popup.isActive) { 
          currentPopup = popup;
          renderConfig(popup); 
          openPopup();
        } else { 
          renderDefault(); 
        }
      });
    }

    // ── Force open first visit of session ──
    var currentId = currentPopup ? currentPopup.id : 'default';
    var seenId = sessionStorage.getItem(SESSION_KEY);

    if (seenId === String(currentId)) return; // already shown in this session

    sessionStorage.setItem(SESSION_KEY, String(currentId));
    setTimeout(openPopup, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
