// ── Scroll → floating pill effect ──
const header = document.querySelector('.site-header-wrapper');

if (header) {
  const updateHeaderState = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();
}
