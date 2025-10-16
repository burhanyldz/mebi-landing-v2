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
});
