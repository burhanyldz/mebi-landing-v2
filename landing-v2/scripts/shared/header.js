// ── Scroll → floating pill effect ──
const header = document.querySelector('.site-header-wrapper');

if (header) {
  const updateHeaderState = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();
}

// ── Interactive button cursor tracking glow ──
document.addEventListener('mousemove', (e) => {
  const btn = e.target.closest('.btn');
  if (btn) {
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    btn.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }
});
