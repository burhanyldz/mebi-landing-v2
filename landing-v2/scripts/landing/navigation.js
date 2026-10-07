import { onReady } from '../shared/ready.js';

// Smooth scroll for navigation links
onReady(() => {
  const smoothScrollTo = (targetId) => {
    const targetSection = document.querySelector(targetId);
    if (!targetSection) return;

    const header = document.querySelector('.site-header-wrapper');
    const headerHeight = header ? header.offsetHeight : 80;
    const targetPosition = Math.max(0, targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20);

    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  };

  // Desktop nav links
  const navLinks = document.querySelectorAll('.main-nav-links a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      smoothScrollTo(this.getAttribute('href'));
    });
  });

  // Mobile menu links — also smooth scroll
  const mobileLinks = document.querySelectorAll('.mobile-menu-link[href^="#"]');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      // Small delay to let the menu close animation finish
      setTimeout(() => smoothScrollTo(href), 60);
    });
  });
});
