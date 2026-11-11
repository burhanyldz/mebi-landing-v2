import { onReady } from '../shared/ready.js';

// The generated catalog lists real files, avoiding speculative 404 requests.
onReady(() => {
  const picture = document.querySelector('.hero-picture');
  const playback = document.querySelector('.hero-playback');
  if (!picture || !playback) return;

  const mobile = window.matchMedia('(max-width: 640px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sources = picture.querySelectorAll('source');
  const image = picture.querySelector('img');
  const series = {
    desktop: { base: 'landing-v2/images/hero-final', index: 1, last: 1, urls: new Map([[1, 'landing-v2/images/hero-final-1.png']]), entries: [1] },
    mobile: { base: 'landing-v2/images/hero-section-mobile', index: 1, last: 1, urls: new Map(), entries: [1] }
  };
  let paused = reducedMotion.matches;
  let timer;
  let version = 0;
  let finishTransition = () => {};
  const stem = (state, index) => `${state.base}${index === 1 ? '' : `-${index}`}`;
  const path = (state, index) => state.urls.get(index) || `${stem(state, index)}.webp`;
  const current = () => mobile.matches ? series.mobile : series.desktop;
  const render = () => {
    sources[0].srcset = path(series.mobile, series.mobile.index);
    sources[1].srcset = path(series.desktop, series.desktop.index);
    sources.forEach(source => {
      source.type = source.srcset.endsWith('.png') ? 'image/png' : 'image/webp';
    });
    image.src = path(series.desktop, series.desktop.index);
  };
  const transition = async (previousUrl, requestVersion) => {
    finishTransition();
    if (reducedMotion.matches || !picture.animate || !previousUrl) {
      render();
      return;
    }
    const outgoing = document.createElement('img');
    outgoing.className = 'hero-outgoing';
    outgoing.src = previousUrl;
    outgoing.alt = '';
    outgoing.setAttribute('aria-hidden', 'true');
    picture.after(outgoing);
    let animations = [];
    const cleanup = () => {
      animations.forEach(animation => animation.cancel());
      outgoing.remove();
    };
    finishTransition = cleanup;
    render();
    // Keep the old frame covering the picture until the browser decodes the new one.
    try { await image.decode(); } catch { /* The candidate was already verified. */ }
    if (requestVersion !== version) {
      cleanup();
      return;
    }
    const timing = { duration: 1100, easing: 'ease-in-out', fill: 'both' };
    animations = [
      outgoing.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], timing)
    ];
    await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
    cleanup();
    if (finishTransition === cleanup) finishTransition = () => {};
  };
  const label = () => {
    playback.innerHTML = paused
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
    playback.setAttribute('aria-label', paused ? 'Kapak görsellerini oynat' : 'Kapak görsellerini duraklat');
  };
  const schedule = () => {
    clearTimeout(timer);
    if (!paused && !document.hidden) timer = setTimeout(advance, 6000);
  };
  const advance = async () => {
    const state = current();
    const requestVersion = version;
    const position = state.entries.indexOf(state.index);
    const next = state.entries[(position + 1) % state.entries.length];
    if (next === state.index) { schedule(); return; }
    const candidate = new Image();
    candidate.src = path(state, next);
    try {
      await candidate.decode();
      if (!candidate.naturalWidth) throw new Error('Empty image');
    } catch {
      // A removed or damaged catalog entry must not replace the visible image.
      schedule();
      return;
    }
    if (requestVersion !== version) return;
    const previousIndex = state.index;
    const previousUrl = image.currentSrc || image.src;
    state.index = next;
    if (state.index !== previousIndex) await transition(previousUrl, requestVersion);
    if (requestVersion !== version) return;
    playback.hidden = state.last < 2 && !reducedMotion.matches;
    schedule();
  };
  playback.addEventListener('click', () => {
    paused = !paused;
    version += 1;
    finishTransition();
    label();
    schedule();
  });
  const restart = () => {
    version += 1;
    finishTransition();
    playback.hidden = current().last < 2 && !reducedMotion.matches;
    schedule();
  };
  mobile.addEventListener('change', restart);
  document.addEventListener('visibilitychange', restart);
  reducedMotion.addEventListener('change', () => {
    paused = reducedMotion.matches;
    label();
    restart();
  });
  // Reduced-motion visitors can explicitly opt in without automatic rotation.
  if (reducedMotion.matches) playback.hidden = false;
  const refreshCatalog = async () => {
    try {
      const response = await fetch('landing-v2/images/hero-images.json', { cache: 'no-store' });
      if (!response.ok) return;
      const catalog = await response.json();
      for (const key of ['desktop', 'mobile']) {
        const state = series[key];
        const entries = catalog[key];
        if (!Array.isArray(entries)) continue;
        const urls = new Map();
        for (const entry of entries) {
          if (Number.isInteger(entry.index) && entry.index >= 1 &&
              ['webp', 'png'].includes(entry.extension)) {
            const filename = entry.filename;
            const base = state.base.split('/').pop();
            const allowed = [`${base}-${entry.index}.${entry.extension}`];
            if (entry.index === 1) allowed.push(`${base}.${entry.extension}`);
            if (allowed.includes(filename)) {
              urls.set(entry.index, `landing-v2/images/${filename}`);
            }
          }
        }
        if (!urls.size) continue;
        state.urls = urls;
        state.entries = [...urls.keys()].sort((a, b) => a - b);
        state.last = state.entries.length;
      }
      playback.hidden = current().last < 2 && !reducedMotion.matches;
    } catch { /* The original cover stays usable if the catalog is unavailable. */ }
  };
  label();
  refreshCatalog().then(render).finally(schedule);
  setInterval(refreshCatalog, 60000);
});
