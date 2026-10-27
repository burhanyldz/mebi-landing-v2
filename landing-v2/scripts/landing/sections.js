import { onReady } from '../shared/ready.js';

// Feature tabs functionality
onReady(() => {
  const featureNavItems = document.querySelectorAll('.feature-nav-item');
  const featureCards = document.querySelectorAll('.feature-card');
  let featureSwitchVersion = 0;
  let featureSwitchTimeout;
  
  featureNavItems.forEach(navItem => {
    navItem.addEventListener('click', function() {
      if (this.classList.contains('active')) return;

      const category = this.getAttribute('data-category');
      
      // Update active class and aria-pressed on all nav items
      featureNavItems.forEach(item => {
        const isActive = item === this;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });

      featureSwitchVersion += 1;
      const currentSwitch = featureSwitchVersion;
      clearTimeout(featureSwitchTimeout);
      const enteringCards = [];
      
      // Update all cards in one pass so there is no empty intermediate layout.
      featureCards.forEach(card => {
        const isVisible = card.getAttribute('data-category') === category;
        card.classList.remove('is-switching', 'is-switching-in');
        card.style.display = isVisible ? 'flex' : 'none';
        if (isVisible) {
          card.classList.add('is-switching', 'is-switching-in');
          enteringCards.push(card);
        }
        card.querySelectorAll('video').forEach(video => {
          if (isVisible) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      });

      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (currentSwitch !== featureSwitchVersion) return;
        enteringCards.forEach(card => card.classList.remove('is-switching-in'));
        featureSwitchTimeout = window.setTimeout(() => {
          if (currentSwitch !== featureSwitchVersion) return;
          enteringCards.forEach(card => card.classList.remove('is-switching'));
        }, 220);
      }));
    });
  });

  // FAQ tabs functionality
  const faqNav = document.querySelector('.faq-nav');
  const faqNavItems = document.querySelectorAll('.faq-nav-item');
  const faqAccordionItems = document.querySelectorAll('.accordion-item');
  const faqLoadMore = document.querySelector('.faq-load-more');
  const faqInitialVisibleCount = 5;
  let activeFaqCategory = 'ogrenciler';
  let isFaqExpanded = false;

  const updateFaqIndicator = () => {
    if (!faqNav) return;

    const activeItem = faqNav.querySelector('.faq-nav-item.active');
    if (!activeItem) return;

    const navRect = faqNav.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    faqNav.style.setProperty('--faq-indicator-left', `${itemRect.left - navRect.left}px`);
    faqNav.style.setProperty('--faq-indicator-width', `${itemRect.width}px`);
  };

  const refreshFaqIndicator = () => {
    updateFaqIndicator();
    requestAnimationFrame(updateFaqIndicator);
  };

  const renderFaqCategory = category => {
    activeFaqCategory = category;
    const matchingItems = Array.from(faqAccordionItems).filter(
      item => item.getAttribute('data-category') === category
    );
    const shouldLimitStudents = category === 'ogrenciler' && matchingItems.length > faqInitialVisibleCount;

    faqAccordionItems.forEach(item => {
      const itemIndex = matchingItems.indexOf(item);
      const isVisible = itemIndex !== -1 && (!shouldLimitStudents || isFaqExpanded || itemIndex < faqInitialVisibleCount);

      item.style.display = isVisible ? 'block' : 'none';
      item.classList.remove('active');
    });

    if (faqLoadMore) {
      const canLoadMore = shouldLimitStudents;
      faqLoadMore.hidden = !canLoadMore;
      faqLoadMore.setAttribute('aria-expanded', String(canLoadMore && isFaqExpanded));
      const textSpan = faqLoadMore.querySelector('.btn-text');
      const label = isFaqExpanded ? 'Daha az göster' : 'Daha fazla göster';
      if (textSpan) {
        textSpan.textContent = label;
      } else {
        faqLoadMore.textContent = label;
      }
    }

    refreshFaqIndicator();
  };
  
  faqNavItems.forEach(navItem => {
    navItem.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      
      // Update active class and aria-pressed on all nav items
      faqNavItems.forEach(item => {
        const isActive = item === this;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });

      isFaqExpanded = false;
      renderFaqCategory(category);
    });
  });

  if (faqLoadMore) {
    faqLoadMore.addEventListener('click', () => {
      isFaqExpanded = !isFaqExpanded;
      renderFaqCategory(activeFaqCategory);
    });
  }

  if (faqNav) {
    faqNav.addEventListener('scroll', updateFaqIndicator, { passive: true });
    window.addEventListener('resize', refreshFaqIndicator);
  }

  // FAQ accordion functionality
  faqAccordionItems.forEach(item => {
    const question = item.querySelector('.accordion-question');
    if (question) {
      // Add accessibility attributes
      question.setAttribute('role', 'button');
      question.setAttribute('tabindex', '0');
      question.setAttribute('aria-expanded', 'false');

      const toggleAccordion = () => {
        const isActive = item.classList.toggle('active');
        question.setAttribute('aria-expanded', String(isActive));
      };

      question.addEventListener('click', toggleAccordion);

      // Keyboard support: Enter on keydown, Space on keyup
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          toggleAccordion();
        } else if (e.key === ' ') {
          e.preventDefault();
        }
      });

      question.addEventListener('keyup', (e) => {
        if (e.key === ' ') {
          e.preventDefault();
          toggleAccordion();
        }
      });
    }
  });

  renderFaqCategory(document.querySelector('.faq-nav-item.active')?.getAttribute('data-category') || 'ogrenciler');

  // Resources section — Book stacks click/keyboard to open side-by-side & mouseout to restore
  const resourceCards = document.querySelectorAll('.resource-card');
  const setStackOpenState = (targetCard, isOpen) => {
    resourceCards.forEach(c => {
      const s = c.querySelector('.resource-image-stack');
      const open = c === targetCard && isOpen;
      c.classList.toggle('is-open', open);
      if (s) {
        s.classList.toggle('is-open', open);
        s.setAttribute('aria-expanded', String(open));
      }
    });
  };

  resourceCards.forEach(card => {
    const stack = card.querySelector('.resource-image-stack');
    if (!stack) return;

    const title = card.querySelector('.resource-info h3')?.textContent?.trim();
    stack.setAttribute('role', 'button');
    stack.setAttribute('tabindex', '0');
    stack.setAttribute('aria-expanded', 'false');
    if (title) {
      stack.setAttribute('aria-label', `${title} görsellerini aç/kapat`);
    }

    const toggleStack = (e) => {
      e.stopPropagation();
      const willOpen = !card.classList.contains('is-open');
      setStackOpenState(card, willOpen);
    };

    // Click on stack to open side-by-side / toggle
    stack.addEventListener('click', toggleStack);

    // Keyboard support: Enter on keydown, Space on keyup
    stack.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        toggleStack(e);
      } else if (e.key === ' ') {
        e.preventDefault();
      }
    });

    stack.addEventListener('keyup', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        toggleStack(e);
      }
    });

    // Mouse leaves the card area -> restore to original stacked state
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-open');
      stack.classList.remove('is-open');
      stack.setAttribute('aria-expanded', 'false');
    });
  });

  // Tap/click outside to close any open card (touch/fallback)
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.resource-card')) {
      setStackOpenState(null, false);
    }
  });
});
