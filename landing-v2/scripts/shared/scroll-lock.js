/**
 * Global Scroll Lock & Layout-Shift Prevention Utility
 * Prevents navbar and page content from shifting when scrollbar disappears on modal open.
 */

let lockCount = 0;
let cachedScrollbarWidth = null;

/**
 * Calculates the exact physical scrollbar width of the browser/OS.
 */
export function getScrollbarWidth() {
  if (cachedScrollbarWidth !== null && cachedScrollbarWidth > 0) {
    return cachedScrollbarWidth;
  }

  if (typeof document === 'undefined') return 0;

  const scrollDiv = document.createElement('div');
  scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px; visibility: hidden;';
  document.body.appendChild(scrollDiv);
  const width = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);

  if (width > 0) {
    cachedScrollbarWidth = width;
  }

  return width || 0;
}

/**
 * Checks whether the root page currently has a vertical scrollbar.
 */
export function isPageScrollable() {
  return document.documentElement.scrollHeight > window.innerHeight;
}

/**
 * Locks background scrolling without causing layout shift.
 */
export function lockScroll() {
  if (lockCount === 0) {
    // Measure current scrollbar width if page is scrollable
    const scrollbarWidth = isPageScrollable()
      ? (window.innerWidth - document.documentElement.clientWidth || getScrollbarWidth())
      : 0;

    if (scrollbarWidth > 0) {
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    } else {
      document.documentElement.style.setProperty('--scrollbar-width', '0px');
    }

    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
  }
  lockCount++;
}

/**
 * Unlocks background scrolling and restores layout state.
 */
export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.documentElement.style.removeProperty('--scrollbar-width');
  }
}

// ── Automatic MutationObserver safety net ──
// Catches any modal toggling 'modal-open' directly and prevents layout shift
if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
  const syncScrollbarVar = () => {
    const isModalOpen = document.documentElement.classList.contains('modal-open') ||
                        document.body?.classList.contains('modal-open');

    if (isModalOpen) {
      if (!document.documentElement.style.getPropertyValue('--scrollbar-width')) {
        const width = getScrollbarWidth();
        if (width > 0) {
          document.documentElement.style.setProperty('--scrollbar-width', `${width}px`);
        }
      }
    } else if (lockCount === 0) {
      document.documentElement.style.removeProperty('--scrollbar-width');
    }
  };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        syncScrollbarVar();
        break;
      }
    }
  });

  if (document.documentElement) {
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  const observeBody = () => {
    if (document.body) {
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
  };

  if (document.body) {
    observeBody();
  } else {
    document.addEventListener('DOMContentLoaded', observeBody);
  }

  // Handle window resize while modal is open
  window.addEventListener('resize', () => {
    cachedScrollbarWidth = null;
    const isModalOpen = document.documentElement.classList.contains('modal-open') ||
                        document.body?.classList.contains('modal-open');
    if (isModalOpen) {
      const width = getScrollbarWidth();
      document.documentElement.style.setProperty('--scrollbar-width', `${width}px`);
    }
  }, { passive: true });
}
