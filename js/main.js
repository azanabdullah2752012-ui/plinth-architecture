// ─── PLINTH main.js ───────────────────────────────

// Nav: tint on scroll
const nav = document.getElementById('site-nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 30);
  }, { passive: true });
}

// Scroll reveal — uses data-reveal attribute + CSS transitions
const revealItems = document.querySelectorAll(
  '.work-item, .work-offset-text, .value-item, .studio-bio, .press-item, .material-item, .work-header, .studio-header'
);

revealItems.forEach(el => el.setAttribute('data-reveal', ''));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger within a batch
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.07, rootMargin: '0px 0px -30px 0px' }
);

revealItems.forEach(el => revealObserver.observe(el));

// Project cards keyboard activation
document.querySelectorAll('.work-img-link').forEach(link => {
  link.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') link.click();
  });
});
