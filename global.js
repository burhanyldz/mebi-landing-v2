// Sticky navbar on scroll
window.addEventListener('scroll', function() {
  const header = document.querySelector('.site-header-wrapper');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Intersection Observer for scroll animations
document.addEventListener('DOMContentLoaded', function() {
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

// Scroll to top button
window.addEventListener('scroll', function() {
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (window.scrollY > 300) {
    scrollToTopBtn.classList.add('visible');
  } else {
    scrollToTopBtn.classList.remove('visible');
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const scrollToTopBtn = document.getElementById('scrollToTop');
  
  scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.main-nav-links a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const header = document.querySelector('.site-header-wrapper');
        const headerHeight = header.offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
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

  // Attach click listeners to video thumbnails only (single click)
  document.body.addEventListener('click', function (e) {
    // Don't interfere with native video controls or iframe content
    if (e.target.tagName === 'VIDEO' || e.target.tagName === 'IFRAME') {
      return;
    }
    
    // Check if click is on thumbnail or its children (but not on download button)
    const thumbnail = e.target.closest && e.target.closest('.video-thumbnail');
    const isDownloadBtn = e.target.closest && e.target.closest('.video-download-btn');
    
    if (thumbnail && !isDownloadBtn) {
      const card = thumbnail.closest('.video-card');
      if (card && card.closest('.discover-video-grid')) {
        e.preventDefault();
        e.stopPropagation();
        handleVideoCardClick(card, e);
      }
    }
  });

  // Preview buttons removed; material downloads use the <a> links (open in new tab)
  });
});

// Add download buttons to all video cards automatically
document.addEventListener('DOMContentLoaded', function() {
  // Function to handle download with fetch
  function handleVideoDownload(e, downloadUrl, filename) {
    e.preventDefault();
    e.stopPropagation();
    
    const downloadBtn = e.currentTarget;
    const originalHTML = downloadBtn.innerHTML;
    
    // Show loading state
    downloadBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 12L3 7h3V1h4v6h3l-5 5z"/>
        <path d="M1 14h14v2H1z"/>
      </svg>
      İndiriliyor...
    `;
    downloadBtn.style.opacity = '0.7';
    downloadBtn.style.pointerEvents = 'none';
    
    // Fetch and download
    fetch(downloadUrl)
      .then(response => {
        if (!response.ok) throw new Error('Download failed');
        return response.blob();
      })
      .then(blob => {
        // Create blob URL and trigger download
        const blobUrl = window.URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.download = filename;
        tempLink.style.display = 'none';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        
        // Clean up blob URL after a delay
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        
        // Restore button state
        downloadBtn.innerHTML = originalHTML;
        downloadBtn.style.opacity = '1';
        downloadBtn.style.pointerEvents = 'auto';
      })
      .catch(error => {
        console.error('Download error:', error);
        // If fetch fails, fallback to direct link (opens in new tab)
        window.open(downloadUrl, '_blank');
        
        // Restore button state
        downloadBtn.innerHTML = originalHTML;
        downloadBtn.style.opacity = '1';
        downloadBtn.style.pointerEvents = 'auto';
      });
  }

  // Special download URLs for the first two videos
  const specialDownloads = {
    'https://www.youtube.com/embed/mbZrZ-LN3sg?autoplay=1': 'https://ogm-large-cdn.eba.gov.tr/mebi/content/mebi-sunum/mebi-sunum.pdf',
    'https://www.youtube.com/embed/qkL6ErVTNOA?autoplay=1': 'https://ogm-large-cdn.eba.gov.tr/mebi/content/video/mebi-ogrenci-tanitim.mp4'
  };

  // Get all video cards
  const videoCards = document.querySelectorAll('.video-card');
  
  videoCards.forEach(card => {
    // Check if download button already exists
    const existingBtn = card.querySelector('.video-download-btn');
    if (existingBtn) {
      // Add download handler to existing button
      const downloadUrl = existingBtn.href;
      const urlParts = downloadUrl.split('/');
      const filename = urlParts[urlParts.length - 1] || 'video';
      
      existingBtn.addEventListener('click', function(e) {
        handleVideoDownload(e, downloadUrl, filename);
      });
      return; // Skip creating new button
    }

    const videoUrl = card.getAttribute('data-video-url');
    if (!videoUrl) return;

    // Determine download URL
    let downloadUrl;
    if (specialDownloads[videoUrl]) {
      downloadUrl = specialDownloads[videoUrl];
    } else {
      // Extract the direct video URL from data-video-url
      // For mp4 files, use the same URL
      downloadUrl = videoUrl;
    }

    // Create download button
    const videoInfo = card.querySelector('.video-info');
    if (videoInfo && downloadUrl) {
      // Create actions container if it doesn't exist
      let actionsDiv = videoInfo.querySelector('.video-actions');
      if (!actionsDiv) {
        actionsDiv = document.createElement('div');
        actionsDiv.className = 'video-actions';
        videoInfo.appendChild(actionsDiv);
      }

      // Create download button
      const downloadBtn = document.createElement('a');
      downloadBtn.className = 'video-download-btn';
      downloadBtn.href = downloadUrl;
      downloadBtn.rel = 'noopener';
      
      // Extract filename from URL
      const urlParts = downloadUrl.split('/');
      const filename = urlParts[urlParts.length - 1] || 'video';
      downloadBtn.download = filename;
      
      downloadBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 12L3 7h3V1h4v6h3l-5 5z"/>
          <path d="M1 14h14v2H1z"/>
        </svg>
        Videoyu İndir
      `;
      
      // Add download handler
      downloadBtn.addEventListener('click', function(e) {
        handleVideoDownload(e, downloadUrl, filename);
      });

      actionsDiv.appendChild(downloadBtn);
    }
  });
});
