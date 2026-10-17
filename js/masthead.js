/* ══════════════════════════════════════════════════
   PLINTH — Masthead behaviour
   Handles: scroll state, mobile menu toggle
══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Scroll: add .is-scrolled to masthead ──── */
  const masthead = document.getElementById('masthead');
  if (!masthead) return;

  const SCROLL_THRESHOLD = 80; // px before masthead switches state

  function updateScrollState() {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    masthead.classList.toggle('is-scrolled', scrolled);
  }

  // Run once on load (in case page is refreshed mid-scroll)
  updateScrollState();

  // Throttled scroll listener
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateScrollState();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });


  /* ── Mobile menu toggle ──────────────────────── */
  const menuBtn    = masthead.querySelector('.masthead__menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuBtn || !mobileMenu) return;

  function openMenu() {
    mobileMenu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close navigation menu');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeMenu() {
    mobileMenu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', function () {
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close on nav link click (smooth scroll to section)
  mobileMenu.querySelectorAll('.mobile-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuBtn.focus();
    }
  });

}());
