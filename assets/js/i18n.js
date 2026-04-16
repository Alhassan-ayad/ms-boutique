/**
 * YASSO — Bilingual AR / EN Engine
 * Switches every visible text, placeholder, title-attr, dir and lang on the fly.
 * Language is persisted in localStorage ('yasso_lang'). Default: 'en'.
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     TRANSLATION DICTIONARY  (key = canonical English string)
  ═══════════════════════════════════════════════════════════ */
  var DICT = {
    /* ── Navigation ── */
    'Home'              : 'الرئيسية',
    'Products'          : 'المنتجات',
    'About'             : 'من نحن',
    'Newsletter'        : 'النشرة البريدية',
    'Contact'           : 'اتصل بنا',
    'bag'               : 'حقيبتي',
    'BAG'               : 'حقيبتي',
    'SEARCH'            : 'بحث',
    'search'            : 'بحث',
    'Search'            : 'بحث',

    /* ── Preloader ── */
    'upgrade your browser' : 'يرجى ترقية المتصفح',
    'Cancel Preloader'     : 'إلغاء التحميل',

    /* ── Hero – index ── */
    'Leather'                 : 'جلدية',
    'BAGS'                    : 'حقائب',
    'for Modern Icons'        : 'للأيقونات العصرية',
    'Crafted from Finest Leather' : 'مصنوعة من أجود أنواع الجلد',
    'Shop Now'                : 'تسوق الآن',

    /* ── Products section – index ── */
    'Find the perfect'        : 'اعثر على المثالي',
    'High Class Bags'         : 'حقائب فاخرة',
    'add to cart'             : 'أضف إلى السلة',
    'Add to Cart'             : 'أضف إلى السلة',
    'exclusive collection'    : 'مجموعة حصرية',
    'SHOP BY CATEGORY'        : 'تسوق حسب الفئة',
    'top Trending Products'   : 'المنتجات الأكثر رواجاً',
    'Multi Stone Set'         : 'طقم الأحجار المتعددة',
    'Designer Chain'          : 'سلسلة مصممة',
    'Flower Pendant'          : 'قلادة زهرة',
    'Diamond Gold'            : 'ذهب الماس',
    'Black Pendant'           : 'قلادة سوداء',
    'wedding ring'            : 'خاتم الزواج',

    /* ── Newsletter popup – index ── */
    'subscribe'               : 'اشترك',
    'Subscribe'               : 'اشترك',
    'Subscribe to our newsletter and we will ship\u00a020% discount code\u00a0today'
                              : 'اشترك في نشرتنا البريدية وسنرسل كود خصم 20% اليوم',
    'Submit'                  : 'إرسال',
    'No thanks'               : 'لا شكراً',

    /* ── Testimonials ── */
    'CLIENT TESTIMONIALS'     : 'آراء العملاء',
    'Our Happy Clients'       : 'عملاؤنا السعداء',

    /* ── Features / promises ── */
    'Free Shipping'           : 'شحن مجاني',
    'online Support'          : 'دعم على الإنترنت',
    'Money Back'              : 'ضمان استرداد المال',
    'Return Product'          : 'إرجاع المنتج',
    'Our Promise'             : 'وعدنا',
    'within 30 days for an exchange' : 'خلال 30 يوماً للاستبدال',
    'Fact that a reader will distracted' : 'حقيقة أن القارئ سيشتت انتباهه',

    /* ── YASSO Story section ── */
    'our story'               : 'قصتنا',
    'Our Story'               : 'قصتنا',
    'OUR STORY'               : 'قصتنا',
    'Born fourteen years ago from a true love story, YASSO was created where craftsmanship met devotion — a brand defined by passion and timeless elegance. More than a handbag, each piece is thoughtfully designed to complement your lifestyle and accompany you beautifully for years. With refined silhouettes, intelligent interiors, premium leather, and meticulous craftsmanship, every detail reflects our commitment to exceptional quality and sophisticated style.'
                              : 'وُلدت قصة ياسو قبل أربعة عشر عاماً من قصة حب حقيقية، حيث التقى الإتقان بالعاطفة — علامة تجارية يُحدّد ملامحها الشغف والأناقة الخالدة. إلى جانب كونها حقيبة يد، فإن كل قطعة مصمَّمة بعناية لتلائم أسلوب حياتك وترافقك بجمال لسنوات. بخطوط راقية وتصميم داخلي ذكي وجلد فاخر وحرفية دقيقة، تعكس كل تفاصيلنا التزامنا بالجودة الاستثنائية والأسلوب الرفيع.',

    /* ── About page ── */
    'About Us'                : 'من نحن',
    'about us'                : 'من نحن',
    'Online Booking'          : 'الحجز عبر الإنترنت',
    'Amazing Deals'           : 'عروض مذهلة',
    'contact us'              : 'تواصل معنا',
    'Contact Us'              : 'تواصل معنا',
    'call for us'             : 'اتصل بنا',
    'Where Elegance Lives'    : 'حيث يسكن الأناقة',

    /* ── Shop sidebar ── */
    'our products'            : 'منتجاتنا',
    'Our Products'            : 'منتجاتنا',
    'our Shop'                : 'متجرنا',
    'our shop'                : 'متجرنا',
    'Filter By'               : 'تصفية حسب',
    'Filter'                  : 'تصفية',
    'Colors'                  : 'الألوان',
    'Latest Products'         : 'أحدث المنتجات',
    'Price'                   : 'السعر',
    'Price Range'             : 'نطاق السعر',
    'clear all'               : 'حذف الكل',
    'Sort By Top Rating'      : 'ترتيب حسب التقييم',
    'sort by top rating'      : 'ترتيب حسب التقييم',
    'Sort by popularity'      : 'ترتيب حسب الشهرة',
    'Sort by average rating'  : 'ترتيب حسب متوسط التقييم',
    'Sort by latest'          : 'ترتيب حسب الأحدث',
    'Sort by price: low to high' : 'ترتيب حسب السعر: من الأقل إلى الأعلى',
    'Sort by price: high to low' : 'ترتيب حسب السعر: من الأعلى إلى الأقل',
    'Brown'                   : 'بني',
    'Gold'                    : 'ذهبي',
    'Beige'                   : 'بيج',
    'Black'                   : 'أسود',
    'Burgundy'                : 'عنابي',
    'Blue'                    : 'أزرق',
    'Red'                     : 'أحمر',
    'White'                   : 'أبيض',
    'Gray'                    : 'رمادي',
    'Navy'                    : 'كحلي',
    'Cream'                   : 'كريمي',
    'Silver'                  : 'فضي',

    /* ── Shop details ── */
    'products details'        : 'تفاصيل المنتج',
    'product details'         : 'تفاصيل المنتج',
    'in stock'                : 'متوفر',
    'out of stock'            : 'غير متوفر',
    'review (0)'              : 'التقييمات (0)',
    'Why choose product?'     : 'لماذا تختار هذا المنتج؟',
    'Weight'                  : 'الوزن',
    'Dimensions'              : 'الأبعاد',
    'Add a review'            : 'أضف تقييماً',
    'Leave a Reply'           : 'اترك تعليقاً',
    'Your email address will not be published. Required fields are marked *'
                              : 'عنوان بريدك الإلكتروني لن يُنشر. الحقول الإلزامية علامتها *',
    'Your email address will not be published.\u00a0Required fields are marked\u00a0*'
                              : 'عنوان بريدك الإلكتروني لن يُنشر. الحقول الإلزامية علامتها *',
    'Your Rating\u00a0*'      : 'تقييمك *',
    'submit'                  : 'إرسال',
    'review for dound Dial bag' : 'تقييم الحقيبة الدائرية',

    /* ── Cart ── */
    'Cart'                    : 'سلة التسوق',
    'Image'                   : 'الصورة',
    'Product Name'            : 'اسم المنتج',
    'Price'                   : 'السعر',
    'Quantity'                : 'الكمية',
    'Total'                   : 'الإجمالي',
    'Remove'                  : 'حذف',
    'Loading...'              : 'جارٍ التحميل...',
    'Loading your cart...'    : 'جارٍ تحميل سلة التسوق...',
    'Apply Coupon'            : 'تطبيق الكوبون',
    'Update cart'             : 'تحديث السلة',
    'Continue Shopping'       : 'مواصلة التسوق',
    'Cart Totals'             : 'إجمالي السلة',
    'Shipping and Handling'   : 'الشحن والمناولة',
    'Shipping costs will be calculated during checkout.'
                              : 'سيتم احتساب تكاليف الشحن عند الدفع.',
    'Proceed to Checkout'     : 'إتمام الشراء',

    /* ── Checkout ── */
    'Returning customer?'     : 'عميل عائد؟',
    'Click here to login'     : 'اضغط هنا لتسجيل الدخول',
    'Username or email'       : 'اسم المستخدم أو البريد الإلكتروني',
    'Password'                : 'كلمة المرور',
    'Remember Me'             : 'تذكرني',
    'Login'                   : 'تسجيل الدخول',
    'Lost your password?'     : 'نسيت كلمة المرور؟',
    'Have a coupon?'          : 'لديك كوبون؟',
    'Click here to enter your code' : 'اضغط هنا لإدخال الكود',
    'Write your coupon code'  : 'اكتب كود الكوبون',
    'Apply coupon'            : 'تطبيق الكوبون',
    'Billing Details'         : 'تفاصيل الفاتورة',
    'Phone Number *'          : 'رقم الهاتف *',
    'WhatsApp Number (optional)' : 'رقم الواتساب (اختياري)',
    'City *'                  : 'المدينة *',
    'Street Name *'           : 'اسم الشارع *',
    'Building Number *'       : 'رقم المبنى *',
    'Floor (optional)'        : 'الطابق (اختياري)',
    'Apartment Number (optional)' : 'رقم الشقة (اختياري)',
    'Order Notes'             : 'ملاحظات الطلب',
    'Notes about your order, e.g. special notes for delivery, preferred delivery time, etc.'
                              : 'ملاحظات حول طلبك، مثل ملاحظات خاصة للتوصيل، الوقت المفضل للاستلام، إلخ.',
    'Your Order'              : 'طلبك',
    'Image'                   : 'الصورة',
    'Product Name'            : 'اسم المنتج',
    'Price'                   : 'السعر',
    'Quantity'                : 'الكمية',
    'Total'                   : 'الإجمالي',
    'Subtotal'                : 'المجموع الجزئي',
    'Shipping'                : 'الشحن',
    'Enter your address to view shipping options.' : 'أدخل عنوانك لعرض خيارات الشحن.',
    'Place order'             : 'إتمام الطلب',
    'Cart'                    : 'السلة',
    'First Name'              : 'الاسم الأول',
    'Last Name'               : 'اسم العائلة',
    'Country'                 : 'الدولة',
    'Street Address'          : 'عنوان الشارع',
    'Town / City'             : 'المدينة',
    'State / County'          : 'المنطقة',
    'Postcode / ZIP'          : 'الرمز البريدي',
    'Phone'                   : 'الهاتف',
    'Email Address'           : 'البريد الإلكتروني',
    'Order notes'             : 'ملاحظات الطلب',

    /* ── Contact ── */
    'contact info'            : 'معلومات التواصل',
    'get in touch'            : 'ابقَ على تواصل',
    'Submit Now'              : 'إرسال الآن',
    'Address:'                : 'العنوان:',

    /* ── Blog ── */
    'our blog'                : 'مدونتنا',
    'Our Blog'                : 'مدونتنا',
    'blog details'            : 'تفاصيل المقال',
    'category'                : 'الفئة',
    'Recent Post'             : 'أحدث المقالات',
    'Tags'                    : 'الوسوم',
    'Read More'               : 'اقرأ المزيد',

    /* ── 404 ── */
    "Oops! That page can't be found." : 'عذراً! الصفحة غير موجودة.',

    /* ── Footer ── */
    'Address :'               : 'العنوان:',
    'Shopping'                : 'التسوق',
    'Shop'                    : 'المتجر',
    'Checkout'                : 'الدفع',
    'Blog'                    : 'المدونة',
    'Home'                    : 'الرئيسية',
    'About Us'                : 'من نحن',
    'Contact Us'              : 'تواصل معنا',
    'Gift card'               : 'بطاقة هدية',
    'terms & conditions'      : 'الشروط والأحكام',
    'privacy policy'          : 'سياسة الخصوصية',
    'Privacy Policy'          : 'سياسة الخصوصية',
    'delivery'                : 'التوصيل',
    'About Store'             : 'عن المتجر',
    'Order Tracking'          : 'تتبع الطلب',
    'Help'                    : 'المساعدة',
    'newsletter'              : 'النشرة البريدية',
    'follow'                  : 'تابعنا',
    'Get News & Updates'      : 'احصل على الأخبار والتحديثات',
    'Copyright © 2026 YASSO All Rights Reserved' : 'جميع الحقوق محفوظة © 2026 ياسو',
    'Designed by Alt Mate'    : 'تصميم Alt Mate',

    /* ── Placeholders ── */
    'search'                  : 'بحث',
    'Search'                  : 'بحث',
    'What are you looking for' : 'عمَّ تبحث؟',
    'Your Name'               : 'اسمك',
    'Your Email'              : 'بريدك الإلكتروني',
    'Your Message'            : 'رسالتك',
    'Enter your email'        : 'أدخل بريدك الإلكتروني',
    'Enter coupon code here'  : 'أدخل كود الكوبون هنا',
    'Notes about your order, e.g. special notes for delivery.'
                              : 'ملاحظات حول طلبك، مثل ملاحظات خاصة للتوصيل.',
    'Get News & Updates'      : 'احصل على الأخبار والتحديثات',

    /* ── Blog section ── */
    'our news & blog'           : 'أخبارنا والمدونة',
    'Latest News update'        : 'آخر الأخبار',
    'title shape'               : 'شكل العنوان',
    'july 2, 2024'              : '2 يوليو 2024',
    'frank lee'                 : 'فرانك لي',
    'French historian Vincent'  : 'المؤرخ الفرنسي فانسان',
    "world's first diamonds"    : 'أول الماس في العالم',
    'Each setting is designed'  : 'كل تصميم مصنوع بعناية',
    'Read More'                 : 'اقرأ المزيد',
    'read more'                 : 'اقرأ المزيد',
    'blog'                      : 'مدونة',
    'Blog'                      : 'مدونة',

    /* ── Category names ── */
    'Woman Earring'             : 'أقراط نسائية',
    'Diamond Pendant'           : 'قلادة ألماس',
    'Wedding Ring'              : 'خاتم الزواج',
    'Necklace'                  : 'عقد',
    'Bracelet'                  : 'سوار',
    'Ring'                      : 'خاتم',
    'Earring'                   : 'حلق',
    'Pendant'                   : 'قلادة',

    /* ── Quote / CTA section ── */
    'get free quote'            : 'احصل على عرض مجاني',
    'shop now'                  : 'تسوق الآن',
    'Shop Now'                  : 'تسوق الآن',
    'quote vector'              : 'رمز الاقتباس',
    'vs-icon'                   : 'أيقونة',
    'make a call'               : 'اتصل بنا',

    /* ── Newsletter section ── */
    'our newsletter'            : 'نشرتنا البريدية',
    'Get Our Latest Update'     : 'ابقَ على اطلاع دائم',
    'Sign up to our newsletter for information on sales'
                                : 'سجّل في نشرتنا البريدية للحصول على أحدث العروض والمستجدات',

    /* ── Contact form placeholders ── */
    'Full Name *'               : 'الاسم الكامل *',
    'Email Address *'           : 'البريد الإلكتروني *',
    'Subject'                   : 'الموضوع',
    'Type Your Message *'       : 'اكتب رسالتك *',
    '* Full Name'               : '* الاسم الكامل',
    '* Email Address'           : '* البريد الإلكتروني',
    '* Type Your Message'       : '* اكتب رسالتك',

    /* ── Cart dynamic strings ── */
    'Your cart is empty'        : 'سلتك فارغة',
    'Continue Shopping'         : 'مواصلة التسوق',
    'Shipping costs updated.'   : 'تم تحديث تكاليف الشحن.',
    'Shipping Costs Updated'    : 'تم تحديث تكاليف الشحن',

    /* ── Checkout page ── */
    /* ── Footer ── */
    'Subscribe for'             : 'اشترك في',
    'SUBSCRIBE FOR'             : 'اشترك في',

    /* ── About page second paragraph ── */
    'Luxury Should Be Accessible Without Compromise. By Offering Direct-From-Factory Pricing, We Provide Exceptional Value While Maintaining The Highest Standards Of Craftsmanship. At YASSO, Elegance Is Not An Option. It Is Our Mission. Your Sophistication Is Our Purpose'
      : 'يجب أن تكون الفخامة في متناول الجميع دون تنازلات. من خلال تقديم أسعار مباشرة من المصنع، نوفر قيمة استثنائية مع الحفاظ على أعلى معايير الحرفية. في ياسو، الأناقة ليست خياراً. إنها مهمتنا. رقيّك هو غايتنا.',

    /* ── Customer service / careers contact ── */
    'CUSTOMER SERVICE'          : 'خدمة العملاء',
    'CAREERS'                   : 'وظائف',

    /* ── Email / newsletter placeholders ── */
    'Enter your Email...'       : 'أدخل بريدك الإلكتروني...',
    'Enter Your Email...'       : 'أدخل بريدك الإلكتروني...',
    'enter your email...'       : 'أدخل بريدك الإلكتروني...',
    'Enter your email...'       : 'أدخل بريدك الإلكتروني...',
    'Enter your email'          : 'أدخل بريدك الإلكتروني',

    /* ── Shop details – dynamic strings ── */
    'in stock'                  : 'متوفر',
    'out of stock'              : 'غير متوفر',
    'Out of Stock'              : 'غير متوفر',
    'Add to Cart'               : 'أضف إلى السلة',
    'Select Color:'             : 'اختر اللون:',
    'Select Color: '            : 'اختر اللون: ',
    'Category :'                : 'الفئة :',
    'SKU :'                     : 'كود المنتج :',
    'Tags :'                    : 'الوسوم :',
    'share :'                   : 'مشاركة :',
    'product details'           : 'تفاصيل المنتج',
    'additional information'    : 'معلومات إضافية',
    'additional\n                information' : 'معلومات إضافية',
    'Product Not Found'         : 'المنتج غير موجود',
    "Sorry, the product you're looking for doesn't exist."
                                : 'عذراً، المنتج الذي تبحث عنه غير موجود.',
    'Back to Shop'              : 'العودة إلى المتجر',
    'Your review (optional - you can submit rating only)'
                                : 'تقييمك (اختياري - يمكنك إرسال التقييم فقط)',
    'Your Name *'               : 'اسمك *',
    'Your email *'              : 'بريدك الإلكتروني *',
    'reviews'                   : 'تقييمات',
    'review'                    : 'تقييم',
    'Shop details'              : 'تفاصيل المنتج'
  };

  /* Build reverse (AR → EN) map */
  var DICT_AR = {};
  Object.keys(DICT).forEach(function (k) { DICT_AR[DICT[k]] = k; });

  /* ═══════════════════════════════════════════════════════════
     CORE TRANSLATION ENGINE
  ═══════════════════════════════════════════════════════════ */

  var SKIP_TAGS = { SCRIPT:1, STYLE:1, NOSCRIPT:1, IFRAME:1, SVG:1, PATH:1, IMG:1, INPUT:1, TEXTAREA:1 };

  function translateTextNodes(node, dict) {
    if (node.nodeType === 3) { // text node
      var orig = node.textContent;
      var trimmed = orig.trim();
      /* Normalize internal whitespace (e.g. "Shop\n  Now" -> "Shop Now") */
      var normalized = trimmed.replace(/\s+/g, ' ');
      /* Normalize curly/smart apostrophes and quotes to straight equivalents */
      var straightTrimmed   = trimmed.replace(/[\u2018\u2019\u02BC]/g, "'").replace(/[\u201C\u201D]/g, '"');
      var straightNormalized = normalized.replace(/[\u2018\u2019\u02BC]/g, "'").replace(/[\u201C\u201D]/g, '"');
      if (trimmed && dict[trimmed] !== undefined) {
        node.textContent = orig.replace(trimmed, dict[trimmed]);
      } else if (normalized && dict[normalized] !== undefined) {
        node.textContent = dict[normalized];
      } else if (straightTrimmed && dict[straightTrimmed] !== undefined) {
        node.textContent = orig.replace(trimmed, dict[straightTrimmed]);
      } else if (straightNormalized && dict[straightNormalized] !== undefined) {
        node.textContent = dict[straightNormalized];
      }
    } else if (node.nodeType === 1 && !SKIP_TAGS[node.tagName]) {
      for (var i = 0; i < node.childNodes.length; i++) {
        translateTextNodes(node.childNodes[i], dict);
      }
    }
  }

  function translateAttributes(dict) {
    /* placeholder */
    document.querySelectorAll('[placeholder]').forEach(function (el) {
      var v = el.getAttribute('placeholder');
      if (dict[v] !== undefined) el.setAttribute('placeholder', dict[v]);
    });
    /* aria-label */
    document.querySelectorAll('[aria-label]').forEach(function (el) {
      var v = el.getAttribute('aria-label');
      if (dict[v] !== undefined) el.setAttribute('aria-label', dict[v]);
    });
    /* title */
    document.querySelectorAll('[title]').forEach(function (el) {
      var v = el.getAttribute('title');
      if (dict[v] !== undefined) el.setAttribute('title', dict[v]);
    });
  }

  function applyLanguage(lang) {
    var dict = lang === 'ar' ? DICT : DICT_AR;
    translateTextNodes(document.body, dict);
    translateAttributes(dict);

    /* Dir + lang */
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-ar', lang === 'ar');
    document.body.classList.toggle('lang-en', lang === 'en');

    /* Update switcher button state */
    var btnEn = document.querySelector('.lang-btn-en');
    var btnAr = document.querySelector('.lang-btn-ar');
    if (btnEn) btnEn.classList.toggle('active', lang === 'en');
    if (btnAr) btnAr.classList.toggle('active', lang === 'ar');

    localStorage.setItem('yasso_lang', lang);
    
    // Dispatch language change event for other scripts
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: lang }
    }));
  }

  /* ═══════════════════════════════════════════════════════════
     PUBLIC API  (exposed so dynamically rendered content
     like cart rows can be translated after injection)
  ═══════════════════════════════════════════════════════════ */
  window.YassoI18n = {
    translate: function (el) {
      var lang = localStorage.getItem('yasso_lang') || 'en';
      if (lang === 'ar') translateTextNodes(el || document.body, DICT);
    },
    /**
     * Translate a single string using the dictionary.
     * Returns the Arabic translation when in AR mode, otherwise the original string.
     */
    t: function (str) {
      var lang = localStorage.getItem('yasso_lang') || 'en';
      if (lang === 'ar') return DICT[str] || str;
      return str;
    },
    currentLang: function () {
      return localStorage.getItem('yasso_lang') || 'en';
    },
    /**
     * Get localized content from API response
     * @param {Object} obj - Object with English and Arabic fields
     * @param {string} fieldName - Base field name (e.g., 'name', 'title', 'description')
     * @returns {string} - Localized content based on current language
     */
    getLocalizedField: function (obj, fieldName) {
      var lang = localStorage.getItem('yasso_lang') || 'en';
      if (!obj) return '';
      
      if (lang === 'ar') {
        var arField = fieldName + 'Ar';
        // Return Arabic if available and not empty, otherwise fallback to English
        return obj[arField] && obj[arField].trim() !== '' ? obj[arField] : obj[fieldName];
      }
      return obj[fieldName] || '';
    },
    /**
     * Check if current language is RTL
     * @returns {boolean}
     */
    isRTL: function () {
      return (localStorage.getItem('yasso_lang') || 'en') === 'ar';
    }
  };

  /* ═══════════════════════════════════════════════════════════
     SWITCHER CLICK HANDLER
  ═══════════════════════════════════════════════════════════ */
  function initSwitcher() {
    document.querySelectorAll('.lang-btn-en, .lang-btn-ar').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.classList.contains('lang-btn-ar') ? 'ar' : 'en';
        var current = localStorage.getItem('yasso_lang') || 'en';
        if (lang === current) return;
        applyLanguage(lang);
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INIT ON PAGE LOAD
  ═══════════════════════════════════════════════════════════ */
  function init() {
    initSwitcher();
    var saved = localStorage.getItem('yasso_lang') || 'en';
    if (saved === 'ar') applyLanguage('ar');
    else {
      /* still set correct button state for EN */
      var btnEn = document.querySelector('.lang-btn-en');
      var btnAr = document.querySelector('.lang-btn-ar');
      if (btnEn) btnEn.classList.add('active');
      if (btnAr) btnAr.classList.remove('active');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
