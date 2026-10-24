/*
 * Shared JavaScript entry point.
 *
 * Shared behavior and landing interactions stay in separate modules while
 * this entry point keeps the page bootstrap in one place.
 */

// Sayfa genelinde sağ tık menüsünü tamamen devre dışı bırak
document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
}, { capture: true });

// Görsellere basılı tutarak sürüklemeyi (drag & drop) tamamen devre dışı bırak
document.addEventListener('dragstart', (event) => {
  if (event.target && (event.target.tagName === 'IMG' || event.target.closest('img'))) {
    event.preventDefault();
  }
}, { capture: true });

const sharedModules = [
  './scripts/shared/scroll-lock.js',
  './scripts/shared/header.js',
  './scripts/shared/scroll-to-top.js',
  './scripts/shared/login-modal.js'
];

const landingModules = [
  './scripts/landing/animations.js',
  './scripts/landing/modules-motion.js?v=20261024-module-scroll-return-v3',
  './scripts/landing/presence-counter.js?v=20261023-presence-v34',
  './scripts/landing/navigation.js',
  './scripts/landing/sections.js',
  './scripts/landing/discover-modal.js',
  './scripts/landing/video-downloads.js',
  './scripts/landing/contact-form.js',
  './scripts/landing/testimonials.js?v=20261024-testimonials-marquee-v1'
];

const modules = [...sharedModules, ...landingModules];

Promise.all(modules.map(modulePath => import(modulePath)))
  .catch(error => console.error('MEBİ modules failed to load:', error));
