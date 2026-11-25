import { onReady } from './ready.js';
import { lockScroll, unlockScroll } from './scroll-lock.js';

// Conditionally load Popover polyfill only when native support is missing
if (typeof HTMLElement !== 'undefined' && !Object.hasOwn(HTMLElement.prototype, 'popover')) {
  import('https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js')
    .catch(err => console.warn('Popover polyfill failed to load:', err));
}

onReady(() => {
  const loginModal = document.getElementById('loginModal');
  const modalClose = document.querySelector('.login-modal-close');
  const modalOverlay = document.querySelector('.login-modal-overlay');
  const helpLink = loginModal?.querySelector('.login-modal-help');
  const appPanel = loginModal?.querySelector('.login-app-panel');
  const webPanel = loginModal?.querySelector('.login-web-panel');
  const webContinue = loginModal?.querySelector('.login-web-continue');

  const tabletTouch = window.matchMedia('(pointer: coarse) and (max-width: 1366px)');
  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) || tabletTouch.matches;

  let lastTrigger = null;
  let openMenuForTrigger = null;

  function showPanel(app) {
    if (!loginModal || !appPanel || !webPanel) return;
    appPanel.hidden = !app;
    webPanel.hidden = app;
    loginModal.classList.toggle('is-app-gate', app);
    loginModal.setAttribute('aria-labelledby', app ? 'loginAppTitle' : 'loginModalTitle');
    loginModal.scrollTop = 0;
  }

  webContinue?.addEventListener('click', () => {
    const trigger = lastTrigger;
    closeModal({ restoreFocus: false });
    requestAnimationFrame(() => {
      openMenuForTrigger?.(trigger);
    });
  });

  function openModal(e) {
    if (!loginModal) return;
    if (e) e.preventDefault();
    if (loginModal.classList.contains('active')) return;
    lastTrigger = e?.currentTarget instanceof HTMLElement ? e.currentTarget : document.activeElement;
    showPanel(isMobile());
    loginModal.classList.add('active');
    loginModal.setAttribute('aria-hidden', 'false');
    lockScroll();
    requestAnimationFrame(() => {
      modalClose?.focus();
    });
  }

  function closeModal({ restoreFocus = true } = {}) {
    if (!loginModal || !loginModal.classList.contains('active')) return;
    loginModal.classList.remove('active');
    loginModal.setAttribute('aria-hidden', 'true');
    unlockScroll();
    if (restoreFocus && lastTrigger instanceof HTMLElement) {
      lastTrigger.focus();
    }
    lastTrigger = null;
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => closeModal());
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', () => closeModal());
    modalOverlay.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
    modalOverlay.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  if (helpLink) {
    helpLink.addEventListener('click', function (e) {
      e.preventDefault();
      closeModal({ restoreFocus: false });

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
    if (!loginModal || !loginModal.classList.contains('active')) return;

    if (event.key === 'Escape') {
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = [...loginModal.querySelectorAll(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )].filter(element => element.offsetParent !== null);
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });

  /* =====================================================
     LOGIN DROPDOWN POPOVER MENUS
     ===================================================== */
  const triggers = [...document.querySelectorAll('button[commandfor][command="toggle-popover"].nav-login-button, button[commandfor][command="toggle-popover"].btn-hero-primary')];
  if (!triggers.length) return;

  const supportsInvokers = 'commandForElement' in HTMLButtonElement.prototype;
  const supportsAnchorPositioning = typeof CSS !== 'undefined' && CSS.supports('position-area: block-end');
  const supportsFocusGroup = 'focusGroup' in HTMLElement.prototype;
  const canHover = window.matchMedia('(hover: hover)');

  const enterOnOpen = new WeakSet();
  const allowMobileMenuOpen = new WeakSet();
  let pointerTrigger = null;

  const menuFor = (trigger) => {
    const id = trigger.getAttribute('commandfor');
    return id ? document.getElementById(id) : null;
  };

  openMenuForTrigger = (preferredTrigger) => {
    const trigger = triggers.includes(preferredTrigger) ? preferredTrigger : triggers[0];
    const menu = trigger ? menuFor(trigger) : null;
    if (!trigger || !menu) return;
    allowMobileMenuOpen.add(menu);
    try {
      menu.showPopover?.({ source: trigger });
    } catch {
      menu.showPopover?.();
    }
  };

  const isMenuOpen = (menu) => {
    if (!menu) return false;
    try {
      return menu.matches(':popover-open') || menu.classList.contains(':popover-open');
    } catch {
      return menu.classList.contains(':popover-open');
    }
  };

  const getItems = (menu) => [...menu.querySelectorAll('.login-dropdown-item')]
    .filter(item => !item.hasAttribute('disabled') && item.getAttribute('aria-disabled') !== 'true');

  const positionFallback = (trigger, menu) => {
    if (supportsAnchorPositioning || !isMenuOpen(menu)) return;
    const gap = 10;
    const margin = 12;
    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const alignEnd = menu.classList.contains('login-dropdown--nav');

    let left = alignEnd ? triggerRect.right - menuRect.width : triggerRect.left;
    left = Math.max(margin, Math.min(left, window.innerWidth - menuRect.width - margin));

    let top = triggerRect.bottom + gap;
    if (top + menuRect.height > window.innerHeight - margin && triggerRect.top - gap - menuRect.height >= margin) {
      top = triggerRect.top - gap - menuRect.height;
    }

    menu.style.left = `${Math.round(left)}px`;
    menu.style.top = `${Math.round(top)}px`;
  };

  // Fallback for browsers without native focusgroup
  if (!supportsFocusGroup) {
    triggers.forEach(trigger => {
      const menu = menuFor(trigger);
      const group = menu?.querySelector('[focusgroup~="menu"]');
      if (!group) return;

      group.setAttribute('role', 'menu');
      group.querySelectorAll('a:not([role]), button:not([role])').forEach(item => {
        item.setAttribute('role', 'menuitem');
      });

      group.addEventListener('keydown', event => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        const items = getItems(menu);
        const current = items.indexOf(document.activeElement);
        if (current < 0) return;

        const next = event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? items.length - 1
            : (current + (event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;

        event.preventDefault();
        event.stopImmediatePropagation();
        items[next].focus({ preventScroll: true });
      }, true);
    });
  }

  triggers.forEach(trigger => {
    const menu = menuFor(trigger);
    if (!menu) return;

    // Invoker fallback for browsers without commandfor support
    if (!supportsInvokers) {
      trigger.setAttribute('popovertarget', menu.id);
    }

    trigger.addEventListener('pointerdown', () => {
      pointerTrigger = trigger;
    });

    trigger.addEventListener('click', (event) => {
      // Preserve mobile/tablet app gate modal
      if (isMobile()) {
        event.preventDefault();
        pointerTrigger = null;
        if (isMenuOpen(menu)) menu.hidePopover?.();
        openModal(event);
        return;
      }

      if (pointerTrigger !== trigger && !isMenuOpen(menu)) {
        enterOnOpen.add(menu);
      }
      pointerTrigger = null;
    });

    trigger.addEventListener('keydown', (event) => {
      if (isMobile()) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (isMenuOpen(menu)) {
          getItems(menu)[0]?.focus({ preventScroll: true });
        } else {
          enterOnOpen.add(menu);
          trigger.click();
        }
      }
    });

    menu.addEventListener('beforetoggle', (event) => {
      if (event.newState === 'open' && isMobile()) {
        if (allowMobileMenuOpen.has(menu)) {
          allowMobileMenuOpen.delete(menu);
          return;
        }
        event.preventDefault();
        openModal();
      }
    });

    menu.addEventListener('toggle', (event) => {
      const open = event.newState === 'open';
      trigger.setAttribute('aria-expanded', String(open));

      if (open) {
        positionFallback(trigger, menu);
        if (enterOnOpen.has(menu)) {
          enterOnOpen.delete(menu);
          getItems(menu)[0]?.focus({ preventScroll: true });
        } else {
          trigger.focus({ preventScroll: true });
        }
      } else {
        enterOnOpen.delete(menu);
      }
    });

    menu.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        menu.hidePopover?.();
      }
    });

    // Hover follows focus on pointer devices
    menu.addEventListener('pointermove', (event) => {
      if (!canHover.matches) return;
      const item = event.target instanceof Element ? event.target.closest('.login-dropdown-item') : null;
      if (!item || document.activeElement === item) return;
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      if (hit && item.contains(hit)) {
        item.focus({ preventScroll: true });
      }
    });

    // Close menu when a login option is chosen
    menu.addEventListener('click', (event) => {
      const item = event.target instanceof Element ? event.target.closest('.login-dropdown-item') : null;
      if (!item) return;
      menu.hidePopover?.();
      trigger.focus({ preventScroll: true });
    });
  });

  // Close open login dropdowns when focus moves outside
  document.addEventListener('focusin', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    triggers.forEach(trigger => {
      const menu = menuFor(trigger);
      if (!menu || !isMenuOpen(menu)) return;
      if (!menu.contains(target) && !trigger.contains(target)) {
        menu.hidePopover?.();
      }
    });
  });

  // Keep fallback-positioned popovers aligned on scroll/resize
  if (!supportsAnchorPositioning) {
    const repositionOpenMenus = () => {
      triggers.forEach(trigger => {
        const menu = menuFor(trigger);
        if (menu && isMenuOpen(menu)) positionFallback(trigger, menu);
      });
    };
    window.addEventListener('scroll', repositionOpenMenus, { passive: true });
    window.addEventListener('resize', repositionOpenMenus, { passive: true });
  }
});
