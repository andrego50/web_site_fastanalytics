/* ========== FASTANALYTICS - MAIN JS ========== */

(function () {
  'use strict';

  // ========== LANGUAGE TOGGLE ==========
  const langToggle = document.getElementById('langToggle');
  const langOptions = langToggle.querySelectorAll('.lang-option');
  let currentLang = 'es';

  function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    // Update toggle buttons
    langOptions.forEach(function (opt) {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    // Update all translatable elements
    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (text) {
        el.innerHTML = text;
      }
    });

    // Update page title
    var titles = {
      es: 'FastAnalytics | IA espaciotemporal para decisiones predictivas',
      en: 'FastAnalytics | Spatiotemporal AI for Predictive Decisions',
      fr: 'FastAnalytics | IA spatiotemporelle pour des décisions prédictives'
    };
    document.title = titles[lang] || titles.es;
  }

  var langCycle = ['es', 'en', 'fr'];

  langToggle.addEventListener('click', function (e) {
    var option = e.target.closest('.lang-option');
    if (option) {
      setLanguage(option.dataset.lang);
    } else {
      // Cycle through languages
      var idx = langCycle.indexOf(currentLang);
      setLanguage(langCycle[(idx + 1) % langCycle.length]);
    }
  });

  // ========== NAVBAR SCROLL ==========
  var navbar = document.getElementById('navbar');
  var lastScroll = 0;

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 20);
    lastScroll = scrollY;
  }, { passive: true });

  // ========== MOBILE MENU ==========
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ========== SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        var navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ========== SCROLL ANIMATIONS ==========
  var animatedElements = document.querySelectorAll('.animate-on-scroll');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  animatedElements.forEach(function (el) {
    observer.observe(el);
  });

  // ========== ACTIVE NAV LINK ON SCROLL ==========
  var sections = document.querySelectorAll('section[id]');

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        navLinks.querySelectorAll('a').forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // ========== LIGHTBOX ==========
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lightboxImage = document.getElementById('lightboxImage');
    var lightboxClose = document.getElementById('lightboxClose');
    var lightboxPrev = document.getElementById('lightboxPrev');
    var lightboxNext = document.getElementById('lightboxNext');
    var lightboxCounter = document.getElementById('lightboxCounter');

    var currentGallery = [];
    var currentIndex = 0;

    function updateLightbox() {
      var img = currentGallery[currentIndex];
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt || '';
      lightboxCounter.textContent = (currentIndex + 1) + ' / ' + currentGallery.length;
      var multiple = currentGallery.length > 1;
      lightboxPrev.style.display = multiple ? 'flex' : 'none';
      lightboxNext.style.display = multiple ? 'flex' : 'none';
      lightboxCounter.style.display = multiple ? 'block' : 'none';
    }

    function openLightbox(gallery, index) {
      currentGallery = gallery;
      currentIndex = index;
      updateLightbox();
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function prevImage() {
      currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
      updateLightbox();
    }

    function nextImage() {
      currentIndex = (currentIndex + 1) % currentGallery.length;
      updateLightbox();
    }

    var gallerySelectors = ['.alejo-screenshots', '.vigia-screenshots', '.tavodebate-screenshots'];
    gallerySelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (gallery) {
        var images = Array.prototype.slice.call(gallery.querySelectorAll('img'));
        images.forEach(function (img, idx) {
          img.addEventListener('click', function () {
            openLightbox(images, idx);
          });
        });
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevImage);
    lightboxNext.addEventListener('click', nextImage);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') prevImage();
      else if (e.key === 'ArrowRight') nextImage();
    });
  }

})();
