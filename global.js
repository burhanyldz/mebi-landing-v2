// Feature tabs functionality
document.addEventListener('DOMContentLoaded', function() {
  const featureNavItems = document.querySelectorAll('.feature-nav-item');
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureNavItems.forEach(navItem => {
    navItem.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      
      // Remove active class from all nav items
      featureNavItems.forEach(item => item.classList.remove('active'));
      
      // Add active class to clicked item
      this.classList.add('active');
      
      // Hide all cards
      featureCards.forEach(card => {
        card.style.display = 'none';
      });
      
      // Show cards matching the selected category
      const matchingCards = document.querySelectorAll(`.feature-card[data-category="${category}"]`);
      matchingCards.forEach(card => {
        card.style.display = 'flex';
      });
    });
  });

  // FAQ tabs functionality
  const faqNavItems = document.querySelectorAll('.faq-nav-item');
  const faqAccordionItems = document.querySelectorAll('.accordion-item');
  
  faqNavItems.forEach(navItem => {
    navItem.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      
      // Remove active class from all nav items
      faqNavItems.forEach(item => item.classList.remove('active'));
      
      // Add active class to clicked item
      this.classList.add('active');
      
      // Hide all accordion items and close them
      faqAccordionItems.forEach(item => {
        item.style.display = 'none';
        item.classList.remove('active');
      });
      
      // Show accordion items matching the selected category
      const matchingItems = document.querySelectorAll(`.accordion-item[data-category="${category}"]`);
      matchingItems.forEach(item => {
        item.style.display = 'block';
      });
    });
  });

  // FAQ accordion functionality
  faqAccordionItems.forEach(item => {
    const question = item.querySelector('.accordion-question');
    if (question) {
      question.addEventListener('click', function() {
        // Toggle active class on the clicked item
        item.classList.toggle('active');
        
        // Optional: Close other items when one is opened (uncomment if desired)
        // faqAccordionItems.forEach(otherItem => {
        //   if (otherItem !== item) {
        //     otherItem.classList.remove('active');
        //   }
        // });
      });
    }
  });

  // Login Modal functionality
  const loginModal = document.getElementById('loginModal');
  const loginButtons = document.querySelectorAll('.nav-login-button, .btn-hero-primary');
  const modalClose = document.querySelector('.login-modal-close');
  const modalOverlay = document.querySelector('.login-modal-overlay');
  
  // Open modal
  loginButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      loginModal.classList.add('active');
      document.body.classList.add('modal-open');
    });
  });
  
  // Close modal function
  function closeModal() {
    loginModal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
  
  // Close on X button click
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  // Close on overlay click
  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }
  
  // Close on ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && loginModal.classList.contains('active')) {
      closeModal();
    }
  });
});

