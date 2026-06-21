const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileNav = document.querySelector('[data-mobile-nav]');
const rail = document.querySelector('[data-program-rail]');

const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 40);
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  mobileNav.setAttribute('aria-hidden', String(!isOpen));
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
  });
});

const scrollProgram = (direction) => {
  if (!rail) return;
  const card = rail.querySelector('.film-card');
  const gap = 22;
  const distance = (card?.getBoundingClientRect().width || 340) + gap;
  rail.scrollBy({ left: direction * distance, behavior: 'smooth' });
};
document.querySelector('[data-scroll-prev]')?.addEventListener('click', () => scrollProgram(-1));
document.querySelector('[data-scroll-next]')?.addEventListener('click', () => scrollProgram(1));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('[data-reveal]');
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  revealItems.forEach((item) => observer.observe(item));
}
