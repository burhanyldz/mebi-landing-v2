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

  // Discover Modal functionality
  const discoverModal = document.getElementById('discoverModal');
  const discoverButtons = document.querySelectorAll('.btn-hero-secondary');
  const discoverModalClose = document.querySelector('.discover-modal-close');
  const discoverModalOverlay = document.querySelector('.discover-modal-overlay');
  const discoverNavItems = document.querySelectorAll('.discover-nav-item');
  const discoverVideoGrids = document.querySelectorAll('.discover-video-grid');
  
  // Open discover modal
  discoverButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      discoverModal.classList.add('active');
      document.body.classList.add('modal-open');
    });
  });
  
  // Close discover modal function
  function closeDiscoverModal() {
    discoverModal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
  
  // Close on X button click
  if (discoverModalClose) {
    discoverModalClose.addEventListener('click', closeDiscoverModal);
  }
  
  // Close on overlay click
  if (discoverModalOverlay) {
    discoverModalOverlay.addEventListener('click', closeDiscoverModal);
  }
  
  // Close on ESC key (update the existing ESC handler)
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (loginModal && loginModal.classList.contains('active')) {
        closeModal();
      }
      if (discoverModal && discoverModal.classList.contains('active')) {
        closeDiscoverModal();
      }
    }
  });
  
  // Discover tabs functionality
  discoverNavItems.forEach(navItem => {
    navItem.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      
      // Remove active class from all nav items
      discoverNavItems.forEach(item => item.classList.remove('active'));
      
      // Add active class to clicked item
      this.classList.add('active');
      
      // Hide all video grids
      discoverVideoGrids.forEach(grid => {
        grid.style.display = 'none';
      });
      
      // Show grid matching the selected category
      const matchingGrid = document.querySelector(`.discover-video-grid[data-category="${category}"]`);
      if (matchingGrid) {
        matchingGrid.style.display = 'grid';
      }
    });
  
  // Video card click handlers - Play video in place (supports MP4 and embed URLs)
  function cleanupPlayingCard() {
    const prev = document.querySelector('.video-card.playing');
    if (!prev) return;
    const prevThumb = prev.querySelector('.video-thumbnail');
    if (prevThumb) {
      // try to restore original img if present on markup
      const originalImg = prevThumb.getAttribute('data-original-src');
      prevThumb.innerHTML = '';
      if (originalImg) {
        const img = document.createElement('img');
        img.src = originalImg;
        img.alt = prev.querySelector('.video-info h3')?.innerText || 'thumbnail';
        prevThumb.appendChild(img);
      } else {
        // fallback image used in markup
        const img = document.createElement('img');
        img.src = 'https://mebi.eba.gov.tr/content/img/tanitim.jpg';
        img.alt = prev.querySelector('.video-info h3')?.innerText || 'thumbnail';
        prevThumb.appendChild(img);
      }
    }
    prev.classList.remove('playing');
  }

  function handleVideoCardClick(card) {
    if (!card) return;
    const url = card.getAttribute('data-video-url');
    if (!url) return;

    // if this card is already playing, do nothing
    if (card.classList.contains('playing')) return;

    // cleanup any other playing card
    cleanupPlayingCard();

    const thumb = card.querySelector('.video-thumbnail');
    if (!thumb) return;
    thumb.innerHTML = '';

    if (/\.mp4(\?|$)/i.test(url)) {
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.className = 'video-player-iframe';

      // add basic cleanup when ended or paused
      const removePlaying = () => card.classList.remove('playing');
      video.addEventListener('ended', removePlaying);
      video.addEventListener('pause', removePlaying);

      thumb.appendChild(video);
      // try play (may be blocked by browser)
      const p = video.play();
      if (p && typeof p.then === 'function') p.catch(() => {});
    } else {
      // embed via iframe for youtube/vimeo
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', url);
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.className = 'video-player-iframe';
      thumb.appendChild(iframe);
    }

    card.classList.add('playing');
  }

  // Attach click listeners to video cards (delegation safe for dynamic grids)
  document.body.addEventListener('click', function (e) {
    const card = e.target.closest && e.target.closest('.video-card');
    if (card && card.closest('.discover-video-grid')) {
      handleVideoCardClick(card);
    }
  });

  // Preview buttons removed; material downloads use the <a> links (open in new tab)
  });
});
