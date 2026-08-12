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

  // ========== HERO ROTATING WORD ==========
  var heroRotate = document.getElementById('heroRotate');
  if (heroRotate) {
    var rotateWords = {
      es: ['riesgos', 'delitos', 'fraudes', 'atentados'],
      en: ['risks', 'crimes', 'fraud', 'attacks'],
      fr: ['risques', 'délits', 'fraudes', 'attentats']
    };
    var rotateIndex = 0;

    function currentRotateLang() {
      var lang = document.documentElement.lang;
      return rotateWords[lang] ? lang : 'es';
    }

    function setRotateWord() {
      heroRotate.textContent = rotateWords[currentRotateLang()][rotateIndex % rotateWords[currentRotateLang()].length];
    }

    setInterval(function () {
      rotateIndex++;
      heroRotate.classList.add('swap');
      setTimeout(function () {
        setRotateWord();
        heroRotate.classList.remove('swap');
      }, 350);
    }, 2800);

    // Si el usuario cambia de idioma, mostrar la palabra en ese idioma
    new MutationObserver(function () { setRotateWord(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

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
    if (anchor.getAttribute('href') === '#agenda') return; // lo maneja el modal de agenda
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

  // ========== AGENDA MODAL (solicitud de demo) ==========
  var agendaModal = document.getElementById('agendaModal');
  if (agendaModal) {
    // En producción usa api.fastanalytics.co; en previews locales usa el mismo host :8787
    var AGENDA_API = /(^|\.)fastanalytics\.co$/.test(location.hostname)
      ? 'https://api.fastanalytics.co/demo-request'
      : 'http://' + location.hostname + ':8787/demo-request';
    var agendaForm = document.getElementById('agendaForm');
    var agendaStatus = document.getElementById('agendaStatus');
    var agendaSubmit = document.getElementById('agendaSubmit');

    var agendaI18n = {
      es: { sending: 'Enviando...', ok: '¡Listo! Revisa tu correo, te escribiremos pronto.', error: 'No pudimos enviar. Escríbenos a hola@fastanalytics.co', invalid: 'Escribe tu nombre y un correo válido.' },
      en: { sending: 'Sending...', ok: 'Done! Check your inbox, we will write back soon.', error: 'Could not send. Write to us at hola@fastanalytics.co', invalid: 'Please enter your name and a valid email.' },
      fr: { sending: 'Envoi...', ok: 'C\'est fait ! Vérifiez votre boîte mail.', error: 'Envoi impossible. Écrivez à hola@fastanalytics.co', invalid: 'Indiquez votre nom et un e-mail valide.' }
    };

    function agendaLang() {
      var l = document.documentElement.lang;
      return agendaI18n[l] ? l : 'es';
    }

    function openAgenda() {
      agendaModal.classList.add('active');
      agendaModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var first = document.getElementById('agNombre');
      if (first) setTimeout(function () { first.focus(); }, 100);
    }

    function closeAgenda() {
      agendaModal.classList.remove('active');
      agendaModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('a[href="#agenda"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openAgenda();
      });
    });

    document.getElementById('agendaClose').addEventListener('click', closeAgenda);
    document.getElementById('agendaBackdrop').addEventListener('click', closeAgenda);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && agendaModal.classList.contains('active')) closeAgenda();
    });

    // Abrir directo si llega con #agenda (p. ej. desde la demo)
    if (location.hash === '#agenda') openAgenda();

    agendaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = agendaI18n[agendaLang()];
      var data = {
        nombre: agendaForm.nombre.value.trim(),
        email: agendaForm.email.value.trim(),
        entidad: agendaForm.entidad.value.trim(),
        cargo: agendaForm.cargo.value.trim(),
        ciudad: agendaForm.ciudad.value.trim(),
        mensaje: agendaForm.mensaje.value.trim(),
        website: agendaForm.website.value // honeypot
      };
      agendaStatus.className = 'agenda-status';
      if (!data.nombre || !/^\S+@\S+\.\S+$/.test(data.email)) {
        agendaStatus.textContent = t.invalid;
        agendaStatus.classList.add('error');
        return;
      }
      agendaSubmit.disabled = true;
      agendaStatus.textContent = t.sending;
      fetch(AGENDA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.ok) {
            agendaStatus.textContent = t.ok;
            agendaStatus.classList.add('ok');
            agendaForm.reset();
            setTimeout(closeAgenda, 2500);
          } else {
            agendaStatus.textContent = res.error || t.error;
            agendaStatus.classList.add('error');
          }
        })
        .catch(function () {
          agendaStatus.textContent = t.error;
          agendaStatus.classList.add('error');
        })
        .finally(function () {
          agendaSubmit.disabled = false;
        });
    });
  }

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

    var gallerySelectors = ['.alejo-screenshots', '.predice-screenshots', '.tavodebate-screenshots'];
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


  // ========== VIDEO MODAL (AlejoSeguro) ==========
  var videoModal = document.getElementById('videoModal');
  if (videoModal) {
    var videoPlayer = document.getElementById('videoPlayer');

    function openVideo() {
      videoModal.classList.add('active');
      videoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      videoPlayer.currentTime = 0;
      var pr = videoPlayer.play();
      if (pr && pr.catch) pr.catch(function () {});
    }

    function closeVideo() {
      videoPlayer.pause();
      videoModal.classList.remove('active');
      videoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('a[href="#video-alejoseguro"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openVideo();
      });
    });

    document.getElementById('videoClose').addEventListener('click', closeVideo);
    document.getElementById('videoBackdrop').addEventListener('click', closeVideo);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && videoModal.classList.contains('active')) closeVideo();
    });
  }

})();
