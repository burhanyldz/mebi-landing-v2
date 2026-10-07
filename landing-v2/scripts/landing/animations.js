import { onReady } from '../shared/ready.js';

// Intersection Observer for scroll animations
onReady(() => {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    // Create intersection observer
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px', // Trigger slightly before element is visible
      threshold: 0.1 // Trigger when 10% of element is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          // Optionally unobserve after animation
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all sections and animatable elements
    const animateElements = document.querySelectorAll('.scroll-animate, .scroll-animate-stagger');
    animateElements.forEach(el => observer.observe(el));
  } else {
    // If reduced motion is preferred, show all elements immediately
    const animateElements = document.querySelectorAll('.scroll-animate, .scroll-animate-stagger');
    animateElements.forEach(el => el.classList.add('animate-in'));
  }
});
