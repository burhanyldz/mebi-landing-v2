import { onReady } from './ready.js';
import { lockScroll, unlockScroll } from './scroll-lock.js';

onReady(() => {
  const loginModal = document.getElementById('loginModal');
  if (!loginModal) return;

  const loginButtons = document.querySelectorAll('.nav-login-button, .btn-hero-primary');
  const modalClose = document.querySelector('.login-modal-close');
  const modalOverlay = document.querySelector('.login-modal-overlay');
  const helpLink = loginModal.querySelector('.login-modal-help');
  
  // Open modal
  function openModal(e) {
    if (e) e.preventDefault();
    if (loginModal.classList.contains('active')) return;
    loginModal.classList.add('active');
    lockScroll();
  }

  // Close modal function
  function closeModal() {
    if (!loginModal.classList.contains('active')) return;
    loginModal.classList.remove('active');
    unlockScroll();
  }

  loginButtons.forEach(button => {
    button.addEventListener('click', openModal);
  });
  
  // Close on X button click
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  // Close on overlay click
  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
    modalOverlay.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
    modalOverlay.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  // Handle "Yardıma mı ihtiyacınız var?" click
  if (helpLink) {
    helpLink.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal();

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.classList.add('animate-in');
        const header = document.querySelector('.site-header-wrapper');
        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = Math.max(0, contactSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20);

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        setTimeout(() => {
          const emailInput = document.getElementById('email');
          if (emailInput) {
            emailInput.focus({ preventScroll: true });
          }
        }, 500);
      }
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && loginModal.classList.contains('active')) {
      closeModal();
    }
  });
});
