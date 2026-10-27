import { onReady } from '../shared/ready.js';
import { lockScroll, unlockScroll } from '../shared/scroll-lock.js';

onReady(() => {
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

  let lastTrigger = null;

  function setModalState(isOpen) {
    if (!discoverModal || discoverModal.classList.contains('active') === isOpen) return;

    discoverModal.classList.toggle('active', isOpen);
    discoverModal.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }

  function openDiscoverModal(trigger = null) {
    if (!discoverModal) return;

    lastTrigger = trigger;
    setModalState(true);

    requestAnimationFrame(() => {
      discoverModalClose?.focus({ preventScroll: true });
    });
  }

  function closeDiscoverModal({ restoreFocus = true } = {}) {
    if (!discoverModal) return;

    cleanupPlayingCard();
    setModalState(false);

    if (restoreFocus) {
      lastTrigger?.focus({ preventScroll: true });
    }
    lastTrigger = null;
  }

  // Preserve the direct-link behavior for opening the material category.
  const redirectTo = new URLSearchParams(window.location.search).get('redirectTo');
  if (redirectTo === 'kurumsalmateryaller') {
    discoverNavItems.forEach(item => {
      const isKurumsal = item.dataset.category === 'kurumsal';
      item.classList.toggle('active', isKurumsal);
      item.setAttribute('aria-pressed', String(isKurumsal));
    });
    discoverVideoGrids.forEach(grid => {
      grid.style.display = grid.dataset.category === 'kurumsal' ? 'grid' : 'none';
    });
    openDiscoverModal();
  }

  // Open discover modal
  discoverButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      openDiscoverModal(button);
    });
  });

  // Close on X button click
  if (discoverModalClose) {
    discoverModalClose.addEventListener('click', closeDiscoverModal);
  }
  
  // Close on overlay click
  if (discoverModalOverlay) {
    discoverModalOverlay.addEventListener('click', closeDiscoverModal);
  }
  
  // Close on ESC and keep keyboard focus inside the modal
  document.addEventListener('keydown', function(e) {
    if (!discoverModal?.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeDiscoverModal();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusableElements = [...discoverModal.querySelectorAll(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )].filter(element => element.offsetParent !== null);
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  });
  
  // Discover tabs functionality
  discoverNavItems.forEach(navItem => {
    navItem.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      
      // Update active class and aria-pressed on all nav items
      discoverNavItems.forEach(item => {
        const isActive = item === this;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      
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
  });

  // Make video thumbnails keyboard focusable and accessible
  document.querySelectorAll('.discover-video-grid .video-card').forEach(card => {
    const thumb = card.querySelector('.video-thumbnail');
    const title = card.querySelector('.video-info h3')?.textContent?.trim();
    if (!thumb) return;
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('tabindex', '0');
    if (title) {
      thumb.setAttribute('aria-label', `${title} videosunu oynat`);
    }
  });

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
      overlay.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/></svg>';

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
      const videoTitle = card.querySelector('.video-info h3')?.textContent?.trim() || 'Tanıtım Videosu';
      iframe.setAttribute('src', src);
      iframe.setAttribute('title', videoTitle);
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.className = 'video-player-iframe';
      // create overlay for iframe players as well
      const overlayEl = document.createElement('div');
      overlayEl.className = 'video-play-overlay';
      overlayEl.style.pointerEvents = 'none';
      overlayEl.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/></svg>';
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

  // Attach click and keyboard listeners to video thumbnails
  document.body.addEventListener('click', function (e) {
    // Don't interfere with native video controls or iframe content
    if (e.target.tagName === 'VIDEO' || e.target.tagName === 'IFRAME') {
      return;
    }
    
    // Check if click is on thumbnail or its children (but not on download button)
    const thumbnail = e.target.closest && e.target.closest('.video-thumbnail');
    const isDownloadBtn = e.target.closest && e.target.closest('.download-btn');
    
    if (thumbnail && !isDownloadBtn) {
      const card = thumbnail.closest('.video-card');
      if (card && card.closest('.discover-video-grid')) {
        e.preventDefault();
        e.stopPropagation();
        handleVideoCardClick(card, e);
      }
    }
  });

  document.body.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'VIDEO' || e.target.tagName === 'IFRAME') return;
    const thumbnail = e.target.closest && e.target.closest('.video-thumbnail');
    if (!thumbnail) return;
    const card = thumbnail.closest('.video-card');
    if (!card || !card.closest('.discover-video-grid')) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      handleVideoCardClick(card, e);
    } else if (e.key === ' ') {
      e.preventDefault();
    }
  });

  document.body.addEventListener('keyup', function (e) {
    if (e.key !== ' ') return;
    if (e.target.tagName === 'VIDEO' || e.target.tagName === 'IFRAME') return;
    const thumbnail = e.target.closest && e.target.closest('.video-thumbnail');
    if (!thumbnail) return;
    const card = thumbnail.closest('.video-card');
    if (!card || !card.closest('.discover-video-grid')) return;

    e.preventDefault();
    handleVideoCardClick(card, e);
  });
});
