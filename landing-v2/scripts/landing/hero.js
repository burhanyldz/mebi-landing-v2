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
  const text = document.querySelector('.hero-text');
  const mobileTextSource = document.querySelector('.hero-text-picture source');
  const textDescriptions = {
    1: text?.alt || '',
    2: 'YKS yolculuğunda her adımda yanında. MEBİ, ortaöğretim öğrencilerinin ve mezunlarının YKS’ye hazırlık sürecini ders anlatım videoları, çözümlü sorular ve bireysel çalışma planlarıyla destekleyen, ücretsiz bir bireysel öğrenme platformudur.',
    3: 'Hayalindeki liseye ilk adım MEBİ ile. MEBİ, ortaokul öğrencilerinin okul derslerini desteklemek ve LGS’ye hazırlık süreçlerine katkı sağlamak amacıyla ders anlatım videoları, çözümlü sorular ve bireysel çalışma planları sunan ücretsiz bir öğrenme platformudur.'
  };
  textDescriptions[4] = textDescriptions[3];
  const desktopTextIndex = index => index === 4 ? 3 : index;
  const textPath = index => `landing-v2/images/${mobile.matches ? 'mobil-' : ''}hero-text-${mobile.matches ? index : desktopTextIndex(index)}.png`;
  const series = {
    desktop: { base: 'landing-v2/images/hero-final', index: 1, last: 1, urls: new Map([[1, 'landing-v2/images/hero-final-1.png']]), entries: [1] }
  };
  let paused = reducedMotion.matches;
  let timer;
  let version = 0;
  let activeTransition;
  let zoom;
  let preparing = false;
  const decoded = new Map();
  const easeOut = getComputedStyle(picture).getPropertyValue('--ease-out').trim();
  const holdDuration = 6000;
  const fadeDuration = 1800;
  const zoomAmount = 0.02;
  const stem = (state, index) => `${state.base}${index === 1 ? '' : `-${index}`}`;
  const path = (state, index) => state.urls.get(index) || `${stem(state, index)}.webp`;
  const current = () => series.desktop;
  const running = () => !paused && !document.hidden;
  const startZoom = () => {
    zoom?.cancel();
    zoom = undefined;
    if (reducedMotion.matches || !picture.animate || current().entries.length < 2) return;
    zoom = picture.animate([
      { transform: 'scale(1)' },
      { transform: `scale(${1 + zoomAmount})` }
    ], { duration: holdDuration + fadeDuration, easing: 'linear', fill: 'both' });
    if (!running()) zoom.pause();
  };
  const nextIndex = state => state.entries[(state.entries.indexOf(state.index) + 1) % state.entries.length];
  const load = url => {
    if (!decoded.has(url)) {
      const candidate = new Image();
      candidate.src = url;
      decoded.set(url, candidate.decode().then(() => {
        if (!candidate.naturalWidth) throw new Error('Empty hero image');
        return candidate;
      }).catch(error => {
        decoded.delete(url);
        throw error;
      }));
    }
    return decoded.get(url);
  };
  const prepare = (state, index) => Promise.all([
    load(path(state, index)),
    ...(text ? [load(textPath(index))] : [])
  ]);
  const warmNext = () => {
    const state = current();
    if (running() && state.entries.length > 1) prepare(state, nextIndex(state)).catch(() => {});
  };
  const render = () => {
    const focus = [1, 3, 4].includes(current().index) ? '78%' : '70%';
    picture.style.setProperty('--hero-focus', focus);
    image.style.setProperty('--hero-focus', focus);
    sources.forEach(source => { source.srcset = path(current(), current().index); });
    sources.forEach(source => {
      source.type = source.srcset.endsWith('.png') ? 'image/png' : 'image/webp';
    });
    image.src = path(series.desktop, series.desktop.index);
    if (text) {
      const index = current().index;
      text.style.setProperty('--hero-text-lift', [1, 3].includes(index) ? '28px' : '0px');
      if (mobileTextSource) mobileTextSource.srcset = `landing-v2/images/mobil-hero-text-${index}.png`;
      text.src = textPath(index);
      text.alt = textDescriptions[index] || textDescriptions[1];
    }
  };
  const transition = async previousUrl => {
    if (reducedMotion.matches || !picture.animate || !previousUrl) {
      render();
      return;
    }
    // Keep one complete old frame above the new background while it decodes.
    const outgoing = document.createElement('div');
    outgoing.className = 'hero-outgoing-frame';
    outgoing.setAttribute('aria-hidden', 'true');
    const background = image.cloneNode();
    background.className = 'hero-outgoing';
    background.src = previousUrl;
    background.alt = '';
    const previousScale = new DOMMatrixReadOnly(getComputedStyle(picture).transform).a;
    background.style.transform = `scale(${previousScale})`;
    outgoing.append(background);
    const outgoingText = text?.cloneNode();
    if (outgoingText) {
      outgoingText.alt = '';
      outgoing.append(outgoingText);
      text.style.opacity = '0';
    }
    picture.after(outgoing);
    const session = {
      animations: [],
      cleanup() {
        session.animations.forEach(animation => animation.cancel());
        outgoing.remove();
        text?.style.removeProperty('opacity');
        if (activeTransition === session) activeTransition = undefined;
      }
    };
    activeTransition = session;
    render();
    try { await Promise.all([image.decode(), text?.decode()]); } catch { /* Preloaded assets remain the fallback. */ }
    if (activeTransition !== session) return;
    startZoom();
    const animate = (element, keyframes, options) => {
      session.animations.push(element.animate(keyframes, {
        easing: easeOut, fill: 'both', ...options
      }));
    };
    // Continue the old camera movement through the dissolve; the new one starts gently.
    animate(background, [
      { opacity: 1, transform: `scale(${previousScale})` },
      { opacity: 0, transform: `scale(${previousScale + zoomAmount * fadeDuration / (holdDuration + fadeDuration)})` }
    ], { duration: fadeDuration, easing: 'linear' });
    if (text) {
      animate(outgoingText, [
        { opacity: 1 },
        { opacity: 0 }
      ], { duration: 240 });
      animate(text, [
        { opacity: 0, transform: 'translateY(8px)', filter: 'blur(3px)' },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
      ], { duration: 700, delay: 320 });
    }
    if (!running()) session.animations.forEach(animation => animation.pause());
    await Promise.all(session.animations.map(animation => animation.finished.catch(() => {})));
    if (activeTransition === session) session.cleanup();
  };
  const label = () => {
    playback.innerHTML = paused
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
    playback.setAttribute('aria-label', paused ? 'Kapak görsellerini oynat' : 'Kapak görsellerini duraklat');
  };
  const schedule = () => {
    clearTimeout(timer);
    if (running() && !activeTransition && !preparing && current().entries.length > 1) {
      warmNext();
      timer = setTimeout(advance, holdDuration);
    }
  };
  const advance = async () => {
    if (!running() || preparing || activeTransition) return;
    const state = current();
    const requestVersion = version;
    const next = nextIndex(state);
    if (next === state.index) return;
    preparing = true;
    try {
      await prepare(state, next);
      if (requestVersion !== version || !running()) return;
      const previousUrl = image.currentSrc || image.src;
      state.index = next;
      await transition(previousUrl);
    } catch { /* Retain the current pair if either asset fails to load. */ }
    finally {
      preparing = false;
      schedule();
    }
  };
  const syncPlayback = () => {
    clearTimeout(timer);
    if (zoom && zoom.playState !== 'finished') {
      if (running()) zoom.play();
      else zoom.pause();
    }
    activeTransition?.animations.forEach(animation => {
      if (running()) animation.play();
      else animation.pause();
    });
    label();
    schedule();
  };
  playback.addEventListener('click', () => {
    paused = !paused;
    syncPlayback();
  });
  const restart = () => {
    version += 1;
    activeTransition?.cleanup();
    render();
    startZoom();
    playback.hidden = current().entries.length < 2 && !reducedMotion.matches;
    syncPlayback();
  };
  mobile.addEventListener('change', restart);
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', () => {
    paused = reducedMotion.matches;
    restart();
  });
  if (reducedMotion.matches) playback.hidden = false;
  const refreshCatalog = async () => {
    try {
      const response = await fetch('landing-v2/images/hero-images.json', { cache: 'no-store' });
      if (!response.ok) return;
      const catalog = await response.json();
      for (const key of ['desktop']) {
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
        if (!urls.has(state.index)) {
          // Retain the visible pair until the next validated transition.
          urls.set(state.index, path(state, state.index));
        }
        state.urls = urls;
        state.entries = [...urls.keys()].sort((a, b) => a - b);
        state.last = state.entries.length;
      }
      playback.hidden = current().entries.length < 2 && !reducedMotion.matches;
      warmNext();
    } catch { /* The original cover stays usable if the catalog is unavailable. */ }
  };
  render();
  label();
  refreshCatalog().then(async () => {
    render();
    try { await image.decode(); } catch { /* Keep the original cover available. */ }
    startZoom();
  }).finally(schedule);
  setInterval(refreshCatalog, 60000);
});
