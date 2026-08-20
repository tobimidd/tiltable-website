/**
 * Tiltable — shared site behavior (all pages).
 * Loaded after the page body. Handles: brand name constant, nav scroll
 * state, mobile menu, footer year, and scroll-reveal animations.
 */

// Single JS-side source of truth for the product name. HTML copy still
// says "Tiltable" directly (swap it with a find-and-replace across the repo);
// this constant is only for text that JS itself generates.
const PRODUCT_NAME = "Tiltable";
window.Tiltable = window.Tiltable || {};
window.Tiltable.PRODUCT_NAME = PRODUCT_NAME;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.Tiltable.prefersReducedMotion = prefersReducedMotion;

document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  initMobileMenu();
  initFooterYear();
  initScrollReveal();
});

/* Nav gains a blurred white backdrop once the page scrolls past the hero. */
function initNavScroll() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const setState = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  setState();
  window.addEventListener('scroll', setState, { passive: true });
}

/* Mobile burger menu: toggle panel, swap aria-expanded, close on link tap or Escape. */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
  };
  const open = () => {
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('open');
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? close() : open();
  });

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* Fade + slight rise on scroll into view. Skips straight to visible when
   the visitor has requested reduced motion. */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  targets.forEach((el) => observer.observe(el));
}
