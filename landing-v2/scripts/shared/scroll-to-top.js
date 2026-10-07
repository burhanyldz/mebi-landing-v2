import { onReady } from './ready.js';

onReady(() => {
  const scrollToTopButton = document.getElementById('scrollToTop');
  if (!scrollToTopButton) return;

  const updateVisibility = () => {
    scrollToTopButton.classList.toggle('visible', window.scrollY > 300);
  };

  window.addEventListener('scroll', updateVisibility, { passive: true });
  scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  updateVisibility();
});
