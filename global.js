// Sticky navbar on scroll
window.addEventListener('scroll', function() {
  const header = document.querySelector('.site-header-wrapper');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

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

  // Video card click handlers - Play video in place (supports MP4 and embed URLs)
  function cleanupPlayingCard() {
    const prev = document.querySelector('.video-card.playing');
    if (!prev) return;
    const prevThumb = prev.querySelector('.video-thumbnail');
    if (prevThumb) {
      // If there's a playing HTML5 video, pause it first
      const playingVideo = prevThumb.querySelector('video');
      if (playingVideo && !playingVideo.paused) {
        try { playingVideo.pause(); } catch (e) {}
      }
      // If there's an iframe (YouTube), send pause command if possible
      const iframeEl = prevThumb.querySelector('iframe');
      if (iframeEl && iframeEl.src && iframeEl.src.includes('youtube.com/embed')) {
        try {
          iframeEl.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
        } catch (e) {}
        prev.removeAttribute('data-yt-paused');
      }

      // Restore the exact original thumbnail HTML if we saved it earlier
      const originalHtml = prev.getAttribute('data-original-html');
      if (originalHtml) {
        prevThumb.innerHTML = originalHtml;
        // clean saved attributes
        prev.removeAttribute('data-original-html');
        prev.removeAttribute('data-original-src');
        prev.removeAttribute('data-original-alt');
      } else {
        // fallback: try to restore original img if present on markup
        const originalImg = prevThumb.getAttribute('data-original-src');
        const originalAlt = prevThumb.getAttribute('data-original-alt') || prev.querySelector('.video-info h3')?.innerText || 'thumbnail';
        prevThumb.innerHTML = '';
        if (originalImg) {
          const img = document.createElement('img');
          img.src = originalImg;
          img.alt = originalAlt;
          prevThumb.appendChild(img);
        } else {
          // fallback image used in markup
          const img = document.createElement('img');
          img.src = 'https://mebi.eba.gov.tr/content/img/tanitim.jpg';
          img.alt = originalAlt;
          prevThumb.appendChild(img);
        }
      }
    }
    prev.classList.remove('playing');
  }
  
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
    // stop any playing video
    if (typeof cleanupPlayingCard === 'function') {
      try { cleanupPlayingCard(); } catch (e) { console.warn('cleanupPlayingCard failed', e); }
    }
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
      // When switching tabs, stop any playing video
      cleanupPlayingCard();
      discoverVideoGrids.forEach(grid => {
        grid.style.display = 'none';
      });
      
      // Show grid matching the selected category
      const matchingGrid = document.querySelector(`.discover-video-grid[data-category="${category}"]`);
      if (matchingGrid) {
        matchingGrid.style.display = 'grid';
      }
    });
  
  // end discoverNavItems.forEach

  function handleVideoCardClick(card, e) {
    if (!card) return;
    const url = card.getAttribute('data-video-url');
    if (!url) return;
    const thumb = card.querySelector('.video-thumbnail');
    if (!thumb) return;

    // If there's already a player in this card, toggle play/pause for video
    if (card.classList.contains('playing')) {
      const videoEl = thumb.querySelector('video');
      if (videoEl) {
        if (videoEl.paused) {
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
        return;
      }

      // For youtube iframe, attempt JS API control via postMessage toggle
      const iframeEl = thumb.querySelector('iframe');
      if (iframeEl && iframeEl.src && iframeEl.src.includes('youtube.com/embed')) {
        // Use a simple data attribute to track paused state
        const wasPaused = card.getAttribute('data-yt-paused') === 'true';
        try {
          if (wasPaused) {
            iframeEl.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
            card.setAttribute('data-yt-paused', 'false');
          } else {
            iframeEl.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
            card.setAttribute('data-yt-paused', 'true');
          }
        } catch (e) {}
        // toggle overlay visibility for iframe players
        const overlay = thumb.querySelector('.video-play-overlay');
        if (overlay) {
          overlay.style.opacity = (card.getAttribute('data-yt-paused') === 'true') ? '0' : '1';
        }
      }
      return;
    }

    // cleanup any other playing card
    cleanupPlayingCard();

    // Preserve the full original thumbnail HTML for exact restoration
    thumb.setAttribute('data-original-html-temp', thumb.innerHTML);
    card.setAttribute('data-original-html', thumb.innerHTML);
    // Also keep the src/alt for legacy fallback
    const imgEl = thumb.querySelector('img');
    if (imgEl) {
      thumb.setAttribute('data-original-src', imgEl.src);
      thumb.setAttribute('data-original-alt', imgEl.alt || 'thumbnail');
    }

    // clear the thumbnail area and insert the player
    thumb.innerHTML = '';

    if (/\.mp4(\?|$)/i.test(url)) {
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.className = 'video-player-iframe';

      // keep 'playing' class even when paused so the player remains in place
      // create a visible overlay so the play icon shows while paused
      const overlay = document.createElement('div');
      overlay.className = 'video-play-overlay';
      overlay.style.pointerEvents = 'none';
      overlay.innerHTML = '<svg width="64" height="64" viewBox="0 0 64 64" fill="white">\n                <circle cx="32" cy="32" r="32" fill="rgba(0,0,0,0.7)"/>\n                <path d="M26 20L44 32L26 44V20Z" fill="white"/>\n              </svg>';

      video.addEventListener('play', () => {
        try { overlay.style.opacity = '0'; } catch (e) {}
      });
      video.addEventListener('pause', () => {
        try { overlay.style.opacity = '1'; } catch (e) {}
      });
      video.addEventListener('ended', () => cleanupPlayingCard());

      thumb.appendChild(video);
      thumb.appendChild(overlay);

      // try play (may be blocked by browser). If blocked, try muted autoplay as a fallback.
      const p = video.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {
          try {
            video.muted = true;
            const p2 = video.play();
            if (p2 && typeof p2.then === 'function') {
              p2.then(() => {
                // once playing muted, unmute after a short delay to avoid autoplay blocks
                setTimeout(() => { try { video.muted = false; } catch (e) {} }, 300);
              }).catch(() => {});
            }
          } catch (e) {}
        });
      }

    } else {
      // embed via iframe for youtube/vimeo
      let src = url;
      // ensure YouTube embeds allow JS API control
      if (src.includes('youtube.com/embed') && !src.includes('enablejsapi=1')) {
        const sep = src.includes('?') ? '&' : '?';
        src = src + sep + 'enablejsapi=1&origin=' + encodeURIComponent(window.location.origin);
      }
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', src);
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.className = 'video-player-iframe';
      // create overlay for iframe players as well
      const overlayEl = document.createElement('div');
      overlayEl.className = 'video-play-overlay';
      overlayEl.style.pointerEvents = 'none';
      overlayEl.innerHTML = '<svg width="64" height="64" viewBox="0 0 64 64" fill="white">\n                <circle cx="32" cy="32" r="32" fill="rgba(0,0,0,0.7)"/>\n                <path d="M26 20L44 32L26 44V20Z" fill="white"/>\n              </svg>';
      thumb.appendChild(iframe);
      thumb.appendChild(overlayEl);
      // mark iframe as playing state (we clicked to start) and hide overlay immediately
      card.setAttribute('data-yt-paused', 'false');
      try { overlayEl.style.opacity = '0'; } catch (e) {}
      // Try to send a play command after load — some embeds only accept commands after the iframe is ready
      iframe.addEventListener('load', function () {
        try {
          iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
        } catch (e) {}
      });
    }

    card.classList.add('playing');
  }

  // Attach click listeners to video cards (delegation safe for dynamic grids)
  document.body.addEventListener('click', function (e) {
    // Don't interfere with native video controls or iframe content
    if (e.target.tagName === 'VIDEO' || e.target.tagName === 'IFRAME') {
      return;
    }
    
    const card = e.target.closest && e.target.closest('.video-card');
    if (card && card.closest('.discover-video-grid')) {
      e.preventDefault();
      e.stopPropagation();
      handleVideoCardClick(card, e);
    }
  });

  // Preview buttons removed; material downloads use the <a> links (open in new tab)
  });
});
