// ─── PLINTH main.js ───────────────────────────────

// Nav: add class on scroll for subtle background shift
const nav = document.getElementById('site-nav');
if (nav) {
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('nav--scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Project cards: keyboard accessibility (Enter / Space to activate)
document.querySelectorAll('.project-card').forEach(card => {
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.querySelector('.project-overlay')?.dispatchEvent(new MouseEvent('click'));
    }
  });
});

// Intersection Observer: fade-up on scroll for section elements
const fadeTargets = document.querySelectorAll(
  '.project-card, .value-item, .studio-bio, .press-item, .material-item'
);

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);

fadeTargets.forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)';
  fadeObserver.observe(el);
});
