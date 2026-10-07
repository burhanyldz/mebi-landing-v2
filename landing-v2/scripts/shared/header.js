// ── Scroll → floating pill effect ──
const header = document.querySelector('.site-header-wrapper');

if (header) {
  const updateHeaderState = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();
}

// ── Hamburger / Mobile Menu ──
const hamburgerBtn   = document.getElementById('hamburgerBtn');
const mobileMenu     = document.getElementById('mobileMenu');
const mobileBackdrop = document.getElementById('mobileMenuBackdrop');
const mobileClose    = document.getElementById('mobileMenuClose');
const mobileLinks    = document.querySelectorAll('.mobile-menu-link, .mobile-login-btn');

function openMobileMenu() {
  mobileMenu?.classList.add('open');
  mobileBackdrop?.classList.add('open');
  hamburgerBtn?.classList.add('open');
  hamburgerBtn?.setAttribute('aria-expanded', 'true');
  hamburgerBtn?.setAttribute('aria-label', 'Menüyü Kapat');
  document.body.classList.add('mobile-menu-open');
}

function closeMobileMenu() {
  mobileMenu?.classList.remove('open');
  mobileBackdrop?.classList.remove('open');
  hamburgerBtn?.classList.remove('open');
  hamburgerBtn?.setAttribute('aria-expanded', 'false');
  hamburgerBtn?.setAttribute('aria-label', 'Menüyü Aç');
  document.body.classList.remove('mobile-menu-open');
}

hamburgerBtn?.addEventListener('click', () => {
  if (mobileMenu?.classList.contains('open')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

mobileClose?.addEventListener('click', closeMobileMenu);
mobileBackdrop?.addEventListener('click', closeMobileMenu);

// Close on any menu link click
mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) {
    closeMobileMenu();
  }
});
