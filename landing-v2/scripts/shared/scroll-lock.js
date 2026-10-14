/**
 * Keep the document and its native scrollbar in place while a modal is open.
 * Block background scroll input, but let scrollable modal content receive it.
 */
let lockCount = 0;
let lockedPosition = null;

function canScrollModal(target, axis) {
  if (!(target instanceof Element)) return false;
  const modal = target.closest('.login-modal.active, .discover-modal.active');
  if (!modal) return false;

  for (let element = target; element; element = element.parentElement) {
    const style = getComputedStyle(element);
    const overflow = axis === 'x' ? style.overflowX : style.overflowY;
    const size = axis === 'x' ? element.scrollWidth : element.scrollHeight;
    const visibleSize = axis === 'x' ? element.clientWidth : element.clientHeight;
    if (/^(auto|scroll)$/.test(overflow) && size > visibleSize) return true;
    if (element === modal) break;
  }
  return false;
}

function preventBackgroundWheel(event) {
  // Preserve browser zoom gestures.
  if (event.ctrlKey) return;
  const axis = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? 'x' : 'y';
  if (!canScrollModal(event.target, axis)) event.preventDefault();
}

function preventBackgroundTouch(event) {
  if (event.touches.length > 1) return;
  if (!canScrollModal(event.target, 'x') && !canScrollModal(event.target, 'y')) {
    event.preventDefault();
  }
}

function preventBackgroundKey(event) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) return;
  if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"], video')) return;
  if (event.key === ' ' && event.target instanceof Element && event.target.closest('button')) return;
  const axis = ['ArrowLeft', 'ArrowRight'].includes(event.key) ? 'x' : 'y';
  if (!canScrollModal(event.target, axis)) event.preventDefault();
}

function restoreLockedPosition() {
  if (lockedPosition && (window.scrollX !== lockedPosition.x || window.scrollY !== lockedPosition.y)) {
    window.scrollTo({ left: lockedPosition.x, top: lockedPosition.y, behavior: 'instant' });
  }
}

export function lockScroll() {
  if (lockCount === 0) {
    lockedPosition = { x: window.scrollX, y: window.scrollY };
    document.body.classList.add('modal-open');
    document.addEventListener('wheel', preventBackgroundWheel, { passive: false, capture: true });
    document.addEventListener('touchmove', preventBackgroundTouch, { passive: false, capture: true });
    document.addEventListener('keydown', preventBackgroundKey);
    window.addEventListener('scroll', restoreLockedPosition);
  }
  lockCount++;
}

export function unlockScroll() {
  if (lockCount === 0) return;
  lockCount--;
  if (lockCount === 0) {
    restoreLockedPosition();
    document.body.classList.remove('modal-open');
    document.removeEventListener('wheel', preventBackgroundWheel, { capture: true });
    document.removeEventListener('touchmove', preventBackgroundTouch, { capture: true });
    document.removeEventListener('keydown', preventBackgroundKey);
    window.removeEventListener('scroll', restoreLockedPosition);
    lockedPosition = null;
  }
}
