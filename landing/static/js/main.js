/* ============================================================
   MITAKA WORK & LIFE — interactions
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Floating menu --- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  function onScrollNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  function closeMenu() {
    navMenu.hidden = true;
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', function () {
    var open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    navMenu.hidden = open;
  });

  navMenu.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024) closeMenu();
  });

  /* --- Staggered-lift reveal --- */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* --- Timeline of barriers: the centred card turns from grey to moss --- */
  var track = document.getElementById('barrierTrack');
  var hint = document.getElementById('barrierHint');

  if (track) {
    var cards = Array.prototype.slice.call(track.querySelectorAll('.barrier'));
    var ticking = false;

    function highlightCentreCard() {
      ticking = false;
      var centre = track.scrollLeft + track.clientWidth / 2;
      var best = null;
      var bestDistance = Infinity;
      cards.forEach(function (card) {
        var distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - centre);
        if (distance < bestDistance) { bestDistance = distance; best = card; }
      });
      cards.forEach(function (card) { card.classList.toggle('is-active', card === best); });
    }

    track.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(highlightCentreCard); }
      if (hint) hint.classList.add('is-used');
    }, { passive: true });

    window.addEventListener('resize', highlightCentreCard);
    highlightCentreCard();
  }

  /* --- Ownership matrix: re-order the grid with a fluid motion --- */
  var planGrid = document.getElementById('planGrid');
  var planSwitch = document.getElementById('planSwitch');
  var ORDERS = {
    mobility: ['mobility', 'van', 'housing'],
    housing: ['housing', 'van', 'mobility']
  };

  function reorderPlans(focus) {
    var order = ORDERS[focus] || ORDERS.mobility;
    var items = Array.prototype.slice.call(planGrid.children);
    var before = items.map(function (el) { return el.getBoundingClientRect(); });

    order.forEach(function (cat) {
      var card = planGrid.querySelector('[data-cat="' + cat + '"]');
      if (card) planGrid.appendChild(card);
    });

    items.forEach(function (el, i) {
      var after = el.getBoundingClientRect();
      el.classList.toggle('is-focus', el.getAttribute('data-cat') === focus);
      if (reduce) return;
      var dx = before[i].left - after.left;
      var dy = before[i].top - after.top;
      if (!dx && !dy) return;
      el.style.transition = 'none';
      el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      window.requestAnimationFrame(function () {
        el.style.transition = 'transform 0.62s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = '';
        window.setTimeout(function () { el.style.transition = ''; }, 700);
      });
    });
  }

  if (planGrid && planSwitch) {
    var switchButtons = Array.prototype.slice.call(planSwitch.querySelectorAll('.plan-switch-btn'));
    planSwitch.addEventListener('click', function (e) {
      var button = e.target.closest('.plan-switch-btn');
      if (!button || button.classList.contains('is-on')) return;
      switchButtons.forEach(function (btn) {
        var on = btn === button;
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-checked', String(on));
      });
      reorderPlans(button.getAttribute('data-focus'));
    });
    reorderPlans('mobility');
  }

  /* --- Hero: gentle parallax on the image only --- */
  var heroImage = document.querySelector('.hero-media img');
  if (heroImage && !reduce) {
    var parallaxTicking = false;
    window.addEventListener('scroll', function () {
      if (parallaxTicking) return;
      parallaxTicking = true;
      window.requestAnimationFrame(function () {
        var offset = Math.min(window.scrollY, 700);
        heroImage.style.transform = 'translateY(' + offset * 0.06 + 'px) scale(1.06)';
        parallaxTicking = false;
      });
    }, { passive: true });
  }
})();
