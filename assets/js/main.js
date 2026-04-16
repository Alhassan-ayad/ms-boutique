(function ($) {
  "use strict";
  /*=================================
      JS Index Here
  ==================================*/
  /*
    01. Lenis & GSAP Basic Activation
        - Registers GSAP plugins (`ScrollTrigger`, `ScrollToPlugin`).
        - Initializes `Lenis` for smooth scrolling with custom configurations.
        - Uses `gsap.ticker` for animation frame updates.
    */

  /*
    02. Back To Top Button
        - Implements "back to top" button with smooth scroll.
        - Button visibility toggles based on scroll position (`autoAlpha`, `y` properties).
        - Scroll-triggered visibility animation.
    */

  /*
    03. Preloader
        - Fades out the preloader on window load.
        - Adds animation class to hero section.
        - Handles preloader close action with click event.
    */

  /*
    04. Data Scroll Inview Animation
        - Animates elements as they come into view using `IntersectionObserver`.
        - Adds/removes `is-inview` class for visibility-based animations.
    */

  /*
    05. Data Navbar Stick
        - Sticky navbar that appears after scrolling past a certain point.
        - Uses `gsap.timeline` and `ScrollTrigger` for animations (`opacity`, `y`).
    */

  /*
    06. Reveal Image Animation
        - Animates images and containers as they come into view.
        - Uses `gsap.timeline` and `ScrollTrigger` for sliding and scaling animations.
    */

  /*
    07. Mobile Menu Activation
        - Implements mobile-responsive menu with submenu toggle.
        - Menu visibility toggled on button click.
        - Submenu items expand/collapse using `slideToggle` and `gsap`.
    */

  /*
    08. Set Background Image
        - Dynamically sets background images using the `data-bg-src` attribute.
        - Removes the attribute and adds a class after setting the background.
    */

  /*
    09. Form Validation
        - Validates form inputs before submission.
        - Ensures required fields are filled and proper formats are used (e.g., email).
    */

  /*
    10. Modal Popup
        - Implements a modal popup with custom animations.
        - Modal open/close functionality with `gsap` animations.
        - Uses event listeners to control modal visibility.
    */

  /*
    11. Scroll Animations with GSAP
        - Scroll-triggered animations for elements as user scrolls down the page.
        - Custom animation settings using `ScrollTrigger` and `gsap.timeline`.
    */

  /*
    12. Image Hover Effects
        - Implements hover effects on images using `gsap`.
        - Hover animations include scaling, rotation, and opacity change.
    */

  /*
    13. Slider Initialization
        - Initializes a custom image slider using `Slick Carousel`.
        - Configures `Slick` settings like `autoplay`, `arrows`, and `dots`.
    */

  /*
    14. Tooltip Activation
        - Activates tooltips for various elements on the page.
        - Tooltip content appears on hover with custom animation.
    */

  /*
    15. Lazy Loading Images
        - Implements lazy loading for images using `IntersectionObserver`.
        - Ensures images load only when they enter the viewport.
    */

  /*
    16. Scroll Progress Bar
        - Displays a progress bar at the top of the page that fills as the user scrolls.
        - Uses `gsap` to animate the width of the bar based on scroll position.
    */

  /*
    17. Sticky Sidebar
        - Implements a sticky sidebar that stays visible as the user scrolls.
        - Sidebar position is updated dynamically using `gsap` and `ScrollTrigger`.
    */

  /*
    18. Accordion Menu
        - Implements an accordion-style menu with expandable/collapsible items.
        - Items expand/collapse with smooth animations.
    */

  /*
    19. Countdown Timer
        - Implements a countdown timer for a specific event or sale.
        - Updates in real-time and triggers an event once it reaches zero.
    */

  /*
    20. Image Gallery Filter
        - Implements a filterable image gallery.
        - Filters images by categories using buttons or dropdown menus.
    */

  /*
    21. Dynamic Content Loading
        - Dynamically loads additional content when the user scrolls near the bottom of the page.
        - Uses `IntersectionObserver` or a scroll event to trigger loading.
    */

  /*
    22. Parallax Scrolling Effect
        - Implements a parallax scrolling effect for background images.
        - Background images move at a slower speed than the page content.
    */

  /*
    23. Scroll-based Animations
        - Animates elements based on the user’s scroll position using `gsap` and `ScrollTrigger`.
        - Custom animations for various elements like text, images, and sections.
    */

  /*
    24. Contact Form Submission
        - Handles form submission and sends the data via AJAX.
        - Provides feedback to the user (success or error messages).
    */

  /*
    25. Search Functionality
        - Implements a search bar with auto-suggestions.
        - Displays search results dynamically as the user types.
    */

  /*
    26. Toggle Dark/Light Mode
        - Allows users to toggle between dark and light themes.
        - Saves user preference using `localStorage`.
    */

  /*
    27. Animated Scroll to Section
        - Implements smooth scroll navigation to specific sections on the page.
        - Activates scroll animations when scrolling to the section.
    */

  /**************************************
   ***** 01. Lenis & Gsap Basic Activation *****
   **************************************/
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const lenis = new Lenis({
    lerp: 0.1, // animation smoothness (between 0 & 1)
    touchMultiplier: 0, // scrolling speed for touch events
    smoothWheel: false, // smooth scrolling for while events
    smoothTouch: false, // smooth scrolling for touche events
    mouseWheel: false, // smooth scrolling for mouse events
    autoResize: true,
    smooth: true,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    syncTouch: true,
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  /**************************************
   ***** 02. Back To Top *****
   **************************************/
  const btt = document.querySelector(".scrollToTop");

  // Add click functionality to scroll to the top
  btt.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior
    gsap.to(window, { duration: 1, scrollTo: 0 });
  });

  // Set initial styles
  gsap.set(btt, { autoAlpha: 0, y: 50 });

  // Animate the button visibility on scroll
  gsap.to(btt, {
    autoAlpha: 1,
    y: 0,
    scrollTrigger: {
      trigger: "body",
      start: "top -20%",
      end: "top -20%",
      toggleActions: "play none reverse none",
    },
  });

  /**************************************
   ***** 03. Preloader *****
   **************************************/
  $(window).on("load", function () {
    $(".preloader").fadeOut(); // Fade out preloader
    $(".vs-hero").addClass("animate-elements"); // Add animation class

    // Check if preloader exists and handle close event
    $(".preloader").length &&
      $(".preloaderCls").on("click", function (e) {
        e.preventDefault(); // Prevent default action
        $(".preloader").hide(); // Hide preloader
      });
  });

  /**************************************
   ***** 04. Data Scroll Inview Animation *****
   **************************************/
  const elements = document.querySelectorAll("[data-scroll]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
        } else {
          entry.target.classList.remove("is-inview");
        }
      });
    },
    {
      threshold: 0.1, // Adjusts when the element is considered "in view"
    }
  );
  elements.forEach((element) => observer.observe(element));

  /**************************************
   ***** 05. Data Navbar Stick *****
   **************************************/
  if (document.querySelector("#navbars")) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#navbars",
        start: "top+=600", // Trigger animation when scrolled 200px down
        end: "+=1",
        toggleActions: "play none none none",
        scrub: 1,
        duration: 0.2, // Duration of the animation
      },
    });
    // Initially hide the element
    gsap.set("#navbars", { opacity: 0, visibility: "hidden", y: -82 });
    // Animate to make it visible and slide down smoothly
    tl.to("#navbars", {
      opacity: 1,
      visibility: "visible",
      y: 0, // Slide down to its original position
      duration: 0.2, // Duration of the animation
      ease: "power2.out", // Smooth easing effect
    });
  }

  /**************************************
   ***** 06. Reveal Image Animation *****
   **************************************/
  if ($(".reveal").length) {
    let revealContainers = document.querySelectorAll(".reveal");
    revealContainers.forEach((container) => {
      let image = container.querySelector("img");
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          toggleActions: "play none none none",
        },
      });
      tl.set(container, { autoAlpha: 1 });
      tl.from(container, 1.5, {
        xPercent: -100,
        ease: Power2.out,
      });
      tl.from(image, 1.5, {
        xPercent: 100,
        scale: 1.3,
        delay: -1.5,
        ease: Power2.out,
      });
    });
  }

  /**************************************
   ***** 07. Mobile Menu Activation *****
   **************************************/
  $.fn.vsmobilemenu = function (options) {
    var opt = $.extend(
      {
        menuToggleBtn: ".vs-menu-toggle",
        bodyToggleClass: "vs-body-visible",
        subMenuClass: "vs-submenu",
        subMenuParent: "vs-item-has-children",
        subMenuParentToggle: "vs-active",
        meanExpandClass: "vs-mean-expand",
        appendElement: '<span class="vs-mean-expand"></span>',
        subMenuToggleClass: "vs-open",
        toggleSpeed: 400,
      },
      options
    );

    return this.each(function () {
      var menu = $(this); // Select menu

      // Menu Show & Hide
      function menuToggle() {
        menu.toggleClass(opt.bodyToggleClass);

        // collapse submenu on menu hide or show
        var subMenu = "." + opt.subMenuClass;
        $(subMenu).each(function () {
          if ($(this).hasClass(opt.subMenuToggleClass)) {
            $(this).removeClass(opt.subMenuToggleClass);
            $(this).css("display", "none");
            $(this).parent().removeClass(opt.subMenuParentToggle);
          }
        });
      }

      // Class Set Up for every submenu
      menu.find("li").each(function () {
        var submenu = $(this).find("ul");
        submenu.addClass(opt.subMenuClass);
        submenu.css("display", "none");
        submenu.parent().addClass(opt.subMenuParent);
        submenu.prev("a").append(opt.appendElement);
        submenu.next("a").append(opt.appendElement);
      });

      // Toggle Submenu
      function toggleDropDown($element) {
        if ($($element).next("ul").length > 0) {
          $($element).parent().toggleClass(opt.subMenuParentToggle);
          $($element).next("ul").slideToggle(opt.toggleSpeed);
          $($element).next("ul").toggleClass(opt.subMenuToggleClass);
        } else if ($($element).prev("ul").length > 0) {
          $($element).parent().toggleClass(opt.subMenuParentToggle);
          $($element).prev("ul").slideToggle(opt.toggleSpeed);
          $($element).prev("ul").toggleClass(opt.subMenuToggleClass);
        }
      }

      // Submenu toggle Button
      var expandToggler = "." + opt.meanExpandClass;
      $(expandToggler).each(function () {
        $(this).on("click", function (e) {
          e.preventDefault();
          toggleDropDown($(this).parent());
        });
      });

      // Menu Show & Hide On Toggle Btn click
      $(opt.menuToggleBtn).each(function () {
        $(this).on("click", function () {
          menuToggle();
        });
      });

      // Hide Menu On out side click
      menu.on("click", function (e) {
        e.stopPropagation();
        menuToggle();
      });

      // Stop Hide full menu on menu click
      menu.find("div").on("click", function (e) {
        e.stopPropagation();
      });
    });
  };
  $(".vs-menu-wrapper").vsmobilemenu();

  /**************************************
   ***** 08. Set Background Image *****
   **************************************/
  if ($("[data-bg-src]").length > 0) {
    $("[data-bg-src]").each(function () {
      var src = $(this).attr("data-bg-src");
      $(this).css("background-image", "url(" + src + ")");
      $(this).removeAttr("data-bg-src").addClass("background-image");
    });
  }

  /**************************************
   ***** 09. Global Slick Slider Activation *****
   **************************************/
  $(".vs-carousel").each(function () {
    var asSlide = $(this);
    // Collect Data
    function d(data) {
      return asSlide.data(data);
    }

    // Custom Arrow Button
    var prevButton =
        '<button type="button" class="slick-prev"><i class="' +
        d("prev-arrow") +
        '"></i></button>',
      nextButton =
        '<button type="button" class="slick-next"><i class="' +
        d("next-arrow") +
        '"></i></button>';

    // Function For Custom Arrow Btn
    $("[data-slick-next]").each(function () {
      $(this).on("click", function (e) {
        e.preventDefault();
        $($(this).data("slick-next")).slick("slickNext");
      });
    });

    $("[data-slick-prev]").each(function () {
      $(this).on("click", function (e) {
        e.preventDefault();
        $($(this).data("slick-prev")).slick("slickPrev");
      });
    });

    // Check for arrow wrapper
    if (d("arrows") == true) {
      if (!asSlide.closest(".arrow-wrap").length) {
        asSlide.closest(".container").parent().addClass("arrow-wrap");
      }
    }

    asSlide.slick({
      dots: d("dots") ? true : false,
      fade: d("fade") ? true : false,
      arrows: d("arrows") ? true : false,
      speed: d("speed") ? d("speed") : 1000,
      asNavFor: d("asnavfor") ? d("asnavfor") : false,
      autoplay: d("autoplay") == false ? false : false,
      infinite: d("infinite") == false ? false : true,
      slidesToShow: d("slide-show") ? d("slide-show") : 1,
      adaptiveHeight: d("adaptive-height") ? true : false,
      centerMode: d("center-mode") ? true : false,
      autoplaySpeed: d("autoplay-speed") ? d("autoplay-speed") : 8000,
      centerPadding: d("center-padding") ? d("center-padding") : "0",
      focusOnSelect: d("focuson-select") == false ? false : true,
      pauseOnFocus: d("pauseon-focus") ? true : false,
      pauseOnHover: d("pauseon-hover") ? true : false,
      variableWidth: d("variable-width") ? true : false,
      vertical: d("vertical") ? true : false,
      verticalSwiping: d("vertical") ? true : false,
      prevArrow: d("prev-arrow")
        ? prevButton
        : '<button type="button" class="slick-prev"><i class="far fa-chevron-left"></i></button>',
      nextArrow: d("next-arrow")
        ? nextButton
        : '<button type="button" class="slick-next"><i class="far fa-chevron-right"></i></button>',
      rtl: $("html").attr("dir") == "rtl" ? true : false,
      responsive: [
        {
          breakpoint: 1600,
          settings: {
            arrows: d("xl-arrows") ? true : false,
            dots: d("xl-dots") ? true : false,
            slidesToShow: d("xl-slide-show")
              ? d("xl-slide-show")
              : d("slide-show"),
            centerMode: d("xl-center-mode") ? true : false,
            centerPadding: 0,
          },
        },
        {
          breakpoint: 1400,
          settings: {
            arrows: d("ml-arrows") ? true : false,
            dots: d("ml-dots") ? true : false,
            slidesToShow: d("ml-slide-show")
              ? d("ml-slide-show")
              : d("slide-show"),
            centerMode: d("ml-center-mode") ? true : false,
            centerPadding: 0,
          },
        },
        {
          breakpoint: 1200,
          settings: {
            arrows: d("lg-arrows") ? true : false,
            dots: d("lg-dots") ? true : false,
            slidesToShow: d("lg-slide-show")
              ? d("lg-slide-show")
              : d("slide-show"),
            centerMode: d("lg-center-mode") ? d("lg-center-mode") : false,
            centerPadding: 0,
          },
        },
        {
          breakpoint: 992,
          settings: {
            arrows: d("md-arrows") ? true : false,
            dots: d("md-dots") ? true : false,
            slidesToShow: d("md-slide-show") ? d("md-slide-show") : 1,
            centerMode: d("md-center-mode") ? d("md-center-mode") : false,
            centerPadding: 0,
          },
        },
        {
          breakpoint: 767,
          settings: {
            arrows: d("sm-arrows") ? true : false,
            dots: d("sm-dots") ? true : false,
            slidesToShow: d("sm-slide-show") ? d("sm-slide-show") : 1,
            centerMode: d("sm-center-mode") ? d("sm-center-mode") : false,
            centerPadding: 0,
            vertical: d("sm-vertical") ? true : false, // Make sure to toggle vertical setting here
            verticalSwiping: d("sm-vertical") ? true : false, // Ensure vertical swiping is also disabled
          },
        },
        {
          breakpoint: 576,
          settings: {
            arrows: d("xs-arrows") ? true : false,
            dots: d("xs-dots") ? true : false,
            slidesToShow: d("xs-slide-show") ? d("xs-slide-show") : 1,
            centerMode: d("xs-center-mode") ? d("xs-center-mode") : false,
            centerPadding: 0,
            vertical: d("xs-vertical") ? true : false, // Make sure to toggle vertical setting here
            verticalSwiping: d("xs-vertical") ? true : false, // Ensure vertical swiping is also disabled
          },
        },
        // You can unslick at a given breakpoint now by adding:
        // settings: "unslick"
        // instead of a settings object
      ],
    });
    // Status Update Element
    var $status = $(".slick-status");

    // Update the slide status
    asSlide.on("afterChange", function (event, slick, currentSlide) {
      var totalSlides = slick.slideCount;
      var currentIndex = currentSlide + 1;
      $(".slick-status__active").text(
        currentIndex < 10 ? "0" + currentIndex : currentIndex
      );
      $(".slick-status span:last").text(
        totalSlides < 10 ? "0" + totalSlides : totalSlides
      );
    });

    // Initialize with first slide (if required)
    asSlide.on("init", function () {
      var totalSlides = asSlide.slick("getSlick").slideCount;
      $(".slick-status__active").text("01"); // Default to first slide
      $(".slick-status span:last").text(
        totalSlides < 10 ? "0" + totalSlides : totalSlides
      );
    });

    // end
  });

  // Tabe
  $(".nav-link").on("shown.bs.tab", function (e) {
    $(".vs-carousel").slick("setPosition");
  });

  /**************************************
   ***** 10. Slider Tab Connect With Slick *****
   **************************************/
  $.fn.vsTab = function (options) {
    var opt = $.extend(
      {
        sliderTab: false,
        tabButton: "button",
        indicator: false,
      },
      options
    );

    $(this).each(function () {
      var $menu = $(this);
      var $button = $menu.find(opt.tabButton);

      // On Click Button Class Remove and indecator postion set
      $button.on("click", function (e) {
        e.preventDefault();
        var cBtn = $(this);
        cBtn.addClass("active").siblings().removeClass("active");
        if (opt.sliderTab) {
          $(slider).slick("slickGoTo", cBtn.data("slide-go-to"));
        }
      });

      // Work With slider
      if (opt.sliderTab) {
        var slider = $menu.data("asnavfor"); // select slider

        // Select All button and set attribute
        var i = 0;
        $button.each(function () {
          var slideBtn = $(this);
          slideBtn.attr("data-slide-go-to", i);
          i++;

          // Active Slide On load > Actived Button
          if (slideBtn.hasClass("active")) {
            $(slider).slick("slickGoTo", slideBtn.data("slide-go-to"));
          }

          // Change Indicator On slide Change
          $(slider).on(
            "beforeChange",
            function (event, slick, currentSlide, nextSlide) {
              $menu
                .find(opt.tabButton + '[data-slide-go-to="' + nextSlide + '"]')
                .addClass("active")
                .siblings()
                .removeClass("active");
            }
          );
        });
      }
    });
  };

  // Call On Load
  if ($(".vs-slider-tab").length) {
    $(".vs-slider-tab").vsTab({
      sliderTab: true,
      tabButton: ".tab-btn",
    });
  }

  /**************************************
   ***** 11. Ajax Dynamic Post Submission Form *****
   **************************************/
  function ajaxContactForm(selectForm) {
    var form = selectForm;
    var invalidCls = "is-invalid";
    var $email = '[name="email"]';
    var $validation =
      '[name="name"],[name="email"],[name="phone"],[name="message"]'; // Remove [name="subject"]
    var formMessages = $(selectForm).next(".form-messages");

    function sendContact() {
      var formData = $(form).serialize();
      var valid;
      valid = validateContact();
      if (valid) {
        jQuery
          .ajax({
            url: $(form).attr("action"),
            data: formData,
            type: "POST",
          })
          .done(function (response) {
            // Make sure that the formMessages div has the 'success' class.
            formMessages.removeClass("error");
            formMessages.addClass("success");
            // Set the message text.
            formMessages.text(response);
            // Clear the form.
            $(form + ' input:not([type="submit"]),' + form + " textarea").val(
              ""
            );
          })
          .fail(function (data) {
            // Make sure that the formMessages div has the 'error' class.
            formMessages.removeClass("success");
            formMessages.addClass("error");
            // Set the message text.
            if (data.responseText !== "") {
              formMessages.html(data.responseText);
            } else {
              formMessages.html(
                "Oops! An error occurred and your message could not be sent."
              );
            }
          });
      }
    }

    function validateContact() {
      var valid = true;
      var formInput;
      function unvalid($validation) {
        $validation = $validation.split(",");
        for (var i = 0; i < $validation.length; i++) {
          formInput = form + " " + $validation[i];
          if (!$(formInput).val()) {
            $(formInput).addClass(invalidCls);
            valid = false;
          } else {
            $(formInput).removeClass(invalidCls);
            valid = true;
          }
        }
      }
      unvalid($validation);

      if (
        !$(form + " " + $email).val() ||
        !$(form + " " + $email)
          .val()
          .match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/)
      ) {
        $(form + " " + $email).addClass(invalidCls);
        valid = false;
      } else {
        $(form + " " + $email).removeClass(invalidCls);
        valid = true;
      }
      return valid;
    }

    $(form).on("submit", function (element) {
      element.preventDefault();
      sendContact();
    });
  }
  ajaxContactForm(".ajax-contact");

  /**************************************
   ***** 12. Popup Sidebar Canvas Menu *****
   **************************************/
  function popupSideMenu($sideMenu, $sideMunuOpen, $sideMenuCls, $toggleCls) {
    // Sidebar Popup
    $($sideMunuOpen).on("click", function (e) {
      e.preventDefault();
      $($sideMenu).addClass($toggleCls);
    });
    $($sideMenu).on("click", function (e) {
      e.stopPropagation();
      $($sideMenu).removeClass($toggleCls);
    });
    var sideMenuChild = $sideMenu + " > div";
    $(sideMenuChild).on("click", function (e) {
      e.stopPropagation();
      $($sideMenu).addClass($toggleCls);
    });
    $($sideMenuCls).on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $($sideMenu).removeClass($toggleCls);
    });
  }
  // sidemenu-wrapper replaced by announcement popup — handled by announcement-popup.js

  /**************************************
   ***** 13. Popup Search Box *****
   **************************************/
  function popupSarchBox($searchBox, $searchOpen, $searchCls, $toggleCls) {
    $($searchOpen).on("click", function (e) {
      e.preventDefault();
      $($searchBox).addClass($toggleCls);
    });
    $($searchBox).on("click", function (e) {
      e.stopPropagation();
      $($searchBox).removeClass($toggleCls);
    });
    $($searchBox)
      .find("form")
      .on("click", function (e) {
        e.stopPropagation();
        $($searchBox).addClass($toggleCls);
      });
    $($searchCls).on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $($searchBox).removeClass($toggleCls);
    });
  }
  popupSarchBox(
    ".popup-search-box",
    ".searchBoxTggler",
    ".searchClose",
    "show"
  );

  /**************************************
   ***** 14. Magnific Popup *****
   **************************************/
  $(".popup-image").magnificPopup({
    type: "image",
    gallery: {
      enabled: true,
    },
  });

  /* magnificPopup video view */
  $(".popup-video").magnificPopup({
    type: "iframe",
  });

  /**************************************
   ***** 15. WoW Js Animation *****
   **************************************/
  var wow = new WOW({
    boxClass: "wow",
    animateClass: "wow-animated",
    offset: 0,
    mobile: false,
    live: true,
    scrollContainer: null,
    resetAnimation: false,
  });
  wow.init();

  /**************************************
   ***** 16. Indicator Position *****
   **************************************/
  function setPos(element) {
    var indicator = element.siblings(".indicator"),
      btnWidth = element.css("width"),
      btnHiehgt = element.css("height"),
      btnLeft = element.position().left,
      btnTop = element.position().top;
    element.addClass("active").siblings().removeClass("active");
    indicator.css({
      left: btnLeft + "px",
      top: btnTop + "px",
      width: btnWidth,
      height: btnHiehgt,
    });
  }

  $(".login-tab a").each(function () {
    var link = $(this);
    if (link.hasClass("active")) setPos(link);
    link.on("mouseover", function () {
      setPos($(this));
    });
  });

  /**************************************
   ***** 17. Color Plate Js *****
   **************************************/
  if ($(".vs-color-plate").length) {
    var oldValue = $("#plate-color").val();
    $("#plate-color").on("change", function (e) {
      var color = e.target.value;
      $("body").css("--theme-color", color);
    });

    $("#plate-reset").on("click", function () {
      $("body").css("--theme-color", "");
      $("#plate-color").val(oldValue);
    });

    $("#plate-toggler").on("click", function () {
      $(".vs-color-plate").toggleClass("open");
    });
  }

  /**************************************
   ***** 18. Quantity Increase and Decrease *****
   **************************************/
  $(".quantity-plus").each(function () {
    $(this).on("click", function (e) {
      e.preventDefault();
      var $qty = $(this).closest(".quantity-container").find(".qty-input");
      var currentVal = parseInt($qty.val());
      if (!isNaN(currentVal)) {
        $qty.val(formatNumber(currentVal + 1));
      }
    });
  });
  $(".quantity-minus").each(function () {
    $(this).on("click", function (e) {
      e.preventDefault();
      var $qty = $(this).closest(".quantity-container").find(".qty-input");
      var currentVal = parseInt($qty.val());
      if (!isNaN(currentVal) && currentVal > 1) {
        $qty.val(formatNumber(currentVal - 1));
      }
    });
  });
  // Function to format the number with leading zeros
  function formatNumber(num) {
    return num.toString().padStart(2, "0");
  }

  /**************************************
   ***** 19. Woocommerce Toggle *****
   **************************************/
  // Ship To Different Address
  $("#ship-to-different-address-checkbox").on("change", function () {
    if ($(this).is(":checked")) {
      $("#ship-to-different-address").next(".shipping_address").slideDown();
    } else {
      $("#ship-to-different-address").next(".shipping_address").slideUp();
    }
  });

  // Login Toggle
  $(".woocommerce-form-login-toggle a").on("click", function (e) {
    e.preventDefault();
    $(".woocommerce-form-login").slideToggle();
  });

  // Coupon Toggle
  $(".woocommerce-form-coupon-toggle a").on("click", function (e) {
    e.preventDefault();
    $(".woocommerce-form-coupon").slideToggle();
  });

  // Woocommerce Shipping Method
  $(".shipping-calculator-button").on("click", function (e) {
    e.preventDefault();
    $(this).next(".shipping-calculator-form").slideToggle();
  });

  // Woocommerce Payment Toggle
  $('.wc_payment_methods input[type="radio"]:checked')
    .siblings(".payment_box")
    .show();
  $('.wc_payment_methods input[type="radio"]').each(function () {
    $(this).on("change", function () {
      $(".payment_box").slideUp();
      $(this).siblings(".payment_box").slideDown();
    });
  });

  // Woocommerce Rating Toggle
  $(".rating-select .stars a").each(function () {
    $(this).on("click", function (e) {
      e.preventDefault();
      $(this).siblings().removeClass("active");
      $(this).parent().parent().addClass("selected");
      $(this).addClass("active");
    });
  });

  /**************************************
   ***** 20. Woocommerce color Swatch *****
   **************************************/
  document.addEventListener("DOMContentLoaded", function () {
    const swatches = document.querySelectorAll(".swatch");

    // Add click event to each swatch
    swatches.forEach((swatch) => {
      swatch.addEventListener("click", function () {
        // Remove 'active' class from all swatches
        swatches.forEach((s) => s.classList.remove("active"));

        // Add 'active' class to the clicked swatch
        this.classList.add("active");
      });
    });
  });

  /**************************************
   ***** 21. Rainge Slider Price Quantity *****
   **************************************/
  $("#slider-range").slider({
    range: true,
    min: 0,
    max: 1000,
    values: [0, 1000],
    slide: function (event, ui) {
      $("#minAmount").text("EGP " + ui.values[0]);
      $("#maxAmount").text("EGP " + ui.values[1]);
    },
  });
  $("#minAmount").text("EGP " + $("#slider-range").slider("values", 0));
  $("#maxAmount").text("EGP " + $("#slider-range").slider("values", 1));

  /**************************************
   ***** 22. Countdown JS *****
   **************************************/
  $.fn.countdown = function () {
    this.each(function () {
      var $this = $(this),
        offerDate = new Date($this.data("offer-date")).getTime();

      function findElement(selector) {
        return $this.find(selector);
      }

      var interval = setInterval(function () {
        var now = new Date().getTime(),
          timeDiff = offerDate - now,
          days = Math.floor(timeDiff / 864e5),
          hours = Math.floor((timeDiff % 864e5) / 36e5),
          minutes = Math.floor((timeDiff % 36e5) / 6e4),
          seconds = Math.floor((timeDiff % 6e4) / 1e3);

        days < 10 && (days = "0" + days),
          hours < 10 && (hours = "0" + hours),
          minutes < 10 && (minutes = "0" + minutes),
          seconds < 10 && (seconds = "0" + seconds);

        if (timeDiff < 0) {
          clearInterval(interval);
          $this.addClass("expired");
          findElement(".message").css("display", "block");
        } else {
          findElement(".day").html(days);
          findElement(".hour").html(hours);
          findElement(".minute").html(minutes);
          findElement(".seconds").html(seconds);
        }
      }, 1000);
    });
  };
  $(".offer-counter").length && $(".offer-counter").countdown();

  /**************************************
   ***** 23. Newsletter Popup *****
   **************************************/
  document.addEventListener("DOMContentLoaded", function () {
    const popup = document.getElementById("popup");

    if (popup) {
      // Function to handle scroll event
      function onScroll() {
        // Only show the popup if the screen width is larger than 'lg'
        if (window.innerWidth >= 1440 && window.scrollY > 300) {
          // 1024px represents large devices (lg)
          // Show the popup when user scrolls down past the threshold
          popup.style.display = "flex";
          // Remove the scroll event listener after showing the popup (optional)
          window.removeEventListener("scroll", onScroll);
        }
      }

      // Add the scroll event listener
      window.addEventListener("scroll", onScroll);

      // Close the popup when the close button is clicked
      const closeBtn = document.getElementById("close-popup");
      if (closeBtn) {
        closeBtn.addEventListener("click", function () {
          popup.style.display = "none";
        });
      }

      // Close the popup when the "No thanks" link is clicked
      const noThanks = document.querySelector(".no-thanks");
      if (noThanks) {
        noThanks.addEventListener("click", function () {
          popup.style.display = "none";
        });
      }
    }
  });

  /**************************************
   ***** 24. Image Parallax Animation *****
   **************************************/
  gsap.utils.toArray(".vs-gsap-img-parallax").forEach(function (container) {
    let image = container.querySelector("img");

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        scrub: 0.5,
      },
    });
    tl.from(image, {
      yPercent: -30,
      ease: "none",
    }).to(image, {
      yPercent: 30,
      ease: "none",
    });
  });

  /**************************************
   ***** 25. Custom Ecommerce Category Menu *****
   **************************************/
  document.addEventListener("DOMContentLoaded", () => {
    // Select all menu wrappers
    const menuWrappers = document.querySelectorAll(".menu-wrapper");

    // Loop through each menu wrapper
    menuWrappers.forEach((wrapper) => {
      const menuToggle = wrapper.querySelector(".menu-toggle");
      const menuList = wrapper.querySelector(".menu-list");
      const menuItems = wrapper.querySelectorAll(".menu-item");

      // GSAP timeline for each menu
      const tl = gsap.timeline({ paused: true, reversed: true }); // Start in reversed state

      // Animate the menu list (fade-in and slide up)
      tl.to(menuList, {
        opacity: 1,
        visibility: "visible",
        y: "0%", // Move up to original position
        duration: 0.5,
        ease: "power2.out",
      }).to(
        menuItems,
        {
          opacity: 1,
          y: 0, // Move to original position
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.1, // Slight delay between each item
        },
        "<" // Start items animation at the same time as the menu list animation
      );

      // Toggle dropdown menu on click
      menuToggle.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent the event from bubbling up to the document
        menuToggle.classList.toggle("active"); // Toggle active state
        if (tl.reversed()) {
          tl.play(); // Play animation for opening
          tl.reversed(false); // Mark timeline as not reversed
        } else {
          tl.reverse(); // Reverse animation for closing
          tl.reversed(true); // Mark timeline as reversed
        }
      });

      // Close menu when clicking outside the menu-wrapper
      document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) {
          if (!tl.reversed()) {
            // Only reverse if menu is open
            tl.reverse(); // Close menu
            tl.reversed(true); // Mark timeline as reversed
            menuToggle.classList.remove("active"); // Remove active class
          }
        }
      });
    });
  });

  /**************************************
   ***** 26. Scroll Animation *****
   **************************************/
  // Initialize GSAP scroll-triggered animations for elements with specific attributes
  function initializeScrollAnimations() {
    // Select all elements with the "it-scroll-element" class
    const scrollElements = document.querySelectorAll(".it-scroll-element");

    // Loop through each element and configure animations based on its attributes
    scrollElements.forEach((element) => {
      // Retrieve data attributes or set default values
      const speed =
        parseFloat(element.getAttribute("data-it-scroll-speed")) || 0.8; // Animation duration (default 0.8s)
      const yMovement =
        parseInt(element.getAttribute("data-it-scroll-y"), 10) || 250; // Vertical movement distance (default 250px)

      // Apply GSAP animation with ScrollTrigger
      gsap.from(element, {
        scrollTrigger: {
          trigger: element, // Use the element itself as the scroll trigger
          toggleActions: "play none none none", // Trigger animation on scroll in
          start: "top bottom", // Animation starts when the top of the element hits the bottom of the viewport
          end: "bottom top", // Animation ends when the bottom of the element hits the top of the viewport
          scrub: 0.5, // Smoothens animation based on scroll progress
          pin: false, // Disable pinning by default for flexibility
          markers: false, // Set to true for debugging markers if needed
        },
        y: yMovement, // Vertical movement based on the data attribute
        duration: speed, // Animation speed from data attribute
        ease: "power2.out", // Smooth easing for natural animation flow
      });
    });
  }
  // Initialize animations after the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", initializeScrollAnimations);

  /**************************************
   ***** 27. Image Move Parallax *****
   **************************************/
  function initParallaxEffect() {
    // Select all elements with the "it-parallax-background" class
    const parallaxElements = document.querySelectorAll(
      ".it-parallax-background"
    );
    // Loop through each element and configure parallax effect based on data attributes
    parallaxElements.forEach((element) => {
      const parallaxSpeed =
        parseFloat(element.getAttribute("data-it-parallax-speed")) || 0.3; // Default speed is 0.3
      // Apply GSAP parallax animation with ScrollTrigger
      gsap.to(element, {
        scrollTrigger: {
          trigger: element, // Use the element itself as the scroll trigger
          start: "top bottom", // Start parallax effect as it enters the viewport
          end: "bottom top", // End when it leaves the viewport
          scrub: true, // Smooth parallax effect that follows scroll
          markers: false, // Set to true for debugging markers if needed
        },
        y: (i, target) => -(target.offsetHeight * parallaxSpeed), // Vertical movement for parallax
        ease: "none", // Linear easing for a natural parallax feel
      });
    });
  }
  // Initialize parallax effect after the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", initParallaxEffect);

  /**************************************
   ***** 28. Background Position and Overlay Scroll *****
   **************************************/
  const quoteLayout = document.querySelector(".bg-position");
  if (quoteLayout) {
    // Register GSAP ScrollTrigger
    // Animate the background position for parallax effect
    gsap.to(".bg-position", {
      backgroundPosition: "50% 100%", // Vertical scroll parallax
      ease: "none",
      scrollTrigger: {
        trigger: ".bg-position",
        start: "top bottom",
        end: "bottom top",
        scrub: true, // Smooth animation tied to scroll
      },
    });

    // Check if .overlay exists
    const overlay = document.querySelector(".bg-position .overlay");
    if (overlay) {
      // Animate the overlay color change if it exists
      gsap.to(".bg-position .overlay", {
        backgroundColor: "rgba(255, 62, 1, 0.2)", // Change to red while keeping opacity
        ease: "none",
        scrollTrigger: {
          trigger: ".bg-position",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }

  // End Script
})(jQuery);
