/* ============================================================
   MITAKA WORK & LIFE — INTERACTIONS
   ============================================================ */
(function () {
  'use strict';

  /* --- Hero Decision Slider --- */
  function initHeroSlider() {
    var slider = document.getElementById('heroSlider');
    if (!slider) return;

    var hero = document.getElementById('hero');
    var lifePanel = hero.querySelector('.hero-life');
    var workPanel = hero.querySelector('.hero-work');
    var handle = slider.querySelector('.hero-divider-handle');
    var isDragging = false;
    var heroRect;

    function updateSlider(pct) {
      pct = Math.max(5, Math.min(95, pct));
      slider.style.left = pct + '%';
      lifePanel.style.flexGrow = (pct / 100 * 100).toString();
      workPanel.style.flexGrow = ((100 - pct) / 100 * 100).toString();

      /* Highlight panels */
      if (pct < 40) {
        lifePanel.querySelector('.hero-panel-inner').style.opacity = '0.6';
        workPanel.querySelector('.hero-panel-inner').style.opacity = '0.15';
      } else if (pct > 60) {
        lifePanel.querySelector('.hero-panel-inner').style.opacity = '0.15';
        workPanel.querySelector('.hero-panel-inner').style.opacity = '0.6';
      } else {
        lifePanel.querySelector('.hero-panel-inner').style.opacity = '0.3';
        workPanel.querySelector('.hero-panel-inner').style.opacity = '0.3';
      }

      handle.setAttribute('aria-valuenow', Math.round(pct));
    }

    function onDown(e) {
      isDragging = true;
      heroRect = hero.getBoundingClientRect();
      handle.focus();
      e.preventDefault();
    }

    function onMove(e) {
      if (!isDragging) return;
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var pct = ((clientX - heroRect.left) / heroRect.width) * 100;
      updateSlider(pct);
    }

    function onUp() { isDragging = false; }

    /* Mouse */
    handle.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    /* Touch */
    handle.addEventListener('touchstart', onDown, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);

    /* Keyboard */
    handle.addEventListener('keydown', function (e) {
      var current = parseFloat(slider.style.left) || 50;
      if (e.key === 'ArrowLeft') { updateSlider(current - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { updateSlider(current + 5); e.preventDefault(); }
    });

    /* Click on hero to move slider */
    hero.addEventListener('click', function (e) {
      if (e.target === handle || handle.contains(e.target)) return;
      if (e.target.closest('.hero-content') || e.target.closest('.btn-orbital')) return;
      heroRect = hero.getBoundingClientRect();
      var pct = ((e.clientX - heroRect.left) / heroRect.width) * 100;
      updateSlider(pct);
    });
  }

  /* --- Parallax --- */
  function initParallax() {
    var elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) return;

    var ticking = false;

    function update() {
      var scrollY = window.pageYOffset;
      elements.forEach(function (el) {
        var speed = parseFloat(el.dataset.parallax) || 0.2;
        var offset = scrollY * speed;
        el.style.transform = 'translateY(' + offset + 'px)';
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* --- Kinetic Reveal --- */
  function initReveal() {
    var reveals = document.querySelectorAll('[data-reveal]');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(function (el) { observer.observe(el); });
  }

  /* --- FAQ Accordion --- */
  function initFAQ() {
    var items = document.querySelectorAll('[data-faq]');
    items.forEach(function (item) {
      var btn = item.querySelector('.faq-q');
      var answer = item.querySelector('.faq-a');

      btn.addEventListener('click', function () {
        var isOpen = item.getAttribute('data-open') === 'true';

        /* Close all */
        items.forEach(function (other) {
          other.setAttribute('data-open', 'false');
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-a').style.maxHeight = '0';
        });

        /* Open clicked if it was closed */
        if (!isOpen) {
          item.setAttribute('data-open', 'true');
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }

  /* --- Init on DOM ready --- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initHeroSlider();
      initParallax();
      initReveal();
      initFAQ();
    });
  } else {
    initHeroSlider();
    initParallax();
    initReveal();
    initFAQ();
  }
})();
