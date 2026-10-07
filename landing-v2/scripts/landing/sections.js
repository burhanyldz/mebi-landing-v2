import { onReady } from '../shared/ready.js';

// Feature tabs functionality
onReady(() => {
  const featureNavItems = document.querySelectorAll('.feature-nav-item');
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureNavItems.forEach(navItem => {
    navItem.addEventListener('click', function() {
      if (this.classList.contains('active')) return;

      const category = this.getAttribute('data-category');
      
      // Remove active class from all nav items
      featureNavItems.forEach(item => item.classList.remove('active'));
      
      // Add active class to clicked item
      this.classList.add('active');
      
      // Update all cards in one pass so there is no empty intermediate layout.
      featureCards.forEach(card => {
        const isVisible = card.getAttribute('data-category') === category;
        card.style.display = isVisible ? 'flex' : 'none';
        card.querySelectorAll('video').forEach(video => {
          if (isVisible) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      });
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
      faqLoadMore.textContent = isFaqExpanded ? 'Daha az göster' : 'Daha fazla göster';
    }

    refreshFaqIndicator();
  };
  
  faqNavItems.forEach(navItem => {
    navItem.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      
      // Remove active class from all nav items
      faqNavItems.forEach(item => item.classList.remove('active'));
      
      // Add active class to clicked item
      this.classList.add('active');

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

      // Keyboard support: Enter and Space
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAccordion();
        }
      });
    }
  });

  renderFaqCategory(document.querySelector('.faq-nav-item.active')?.getAttribute('data-category') || 'ogrenciler');

  // Resources section — Book stacks click to open side-by-side & mouseout to restore
  const resourceCards = document.querySelectorAll('.resource-card');
  resourceCards.forEach(card => {
    const stack = card.querySelector('.resource-image-stack');
    if (!stack) return;

    // Click on stack to open side-by-side / toggle
    stack.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !card.classList.contains('is-open');

      // Close other cards first for clean UX
      resourceCards.forEach(c => {
        c.classList.remove('is-open');
        c.querySelector('.resource-image-stack')?.classList.remove('is-open');
      });

      if (willOpen) {
        card.classList.add('is-open');
        stack.classList.add('is-open');
      }
    });

    // Mouse leaves the card area -> restore to original stacked state
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-open');
      stack.classList.remove('is-open');
    });
  });

  // Tap/click outside to close any open card (touch/fallback)
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.resource-card')) {
      resourceCards.forEach(card => {
        card.classList.remove('is-open');
        card.querySelector('.resource-image-stack')?.classList.remove('is-open');
      });
    }
  });
});
