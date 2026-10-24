import { onReady } from '../shared/ready.js';

onReady(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  document.querySelectorAll('.testimonials-row').forEach((row) => {
    const track = row.querySelector('.testimonials-track');
    const originalGroup = track?.querySelector('.testimonials-group');
    if (!track || !originalGroup) return;

    const duplicateGroup = originalGroup.cloneNode(true);
    duplicateGroup.setAttribute('aria-hidden', 'true');
    duplicateGroup.setAttribute('inert', '');
    track.append(duplicateGroup);
  });
});
