import { onReady } from '../shared/ready.js';

onReady(async () => {
  const graphic = document.querySelector('.modules-graphic');
  const track = graphic?.closest('.modules-scroll-track');
  const fallback = graphic?.querySelector('img');
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!track || !fallback || (prefersReducedMotion && !isMobile)) return;

  try {
    const response = await fetch(fallback.src);
    if (!response.ok) return;

    const documentSvg = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
    if (documentSvg.querySelector('parsererror')) return;

    const svg = document.importNode(documentSvg.documentElement, true);
    const pulses = [...svg.querySelectorAll('.module-route-pulse')];
    if (svg.localName !== 'svg' || pulses.length !== 8) return;

    if (isMobile) {
      svg.setAttribute('viewBox', '900 480 950 620');
      svg.setAttribute('width', '950');
      svg.setAttribute('height', '620');
      fallback.replaceWith(svg);
      return;
    }

    if (prefersReducedMotion) return;

    svg.classList.add('module-scroll-controlled');
    const startOrder = pulses.map((_, index) => index);
    for (let index = startOrder.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [startOrder[index], startOrder[randomIndex]] = [startOrder[randomIndex], startOrder[index]];
    }

    const delays = new Map();
    const hubPointsByRoute = new Map([
      [3, [svg.querySelector('#Ellipse_5 circle')]],
      [5, [svg.querySelector('#Ellipse_8')]],
      [6, [svg.querySelector('#Ellipse_9')]],
      [7, [svg.querySelector('#Ellipse_11 circle')]],
    ]);
    hubPointsByRoute.forEach(points => points.forEach(point => point?.classList.add('module-hub-point')));
    const routes = pulses.map((pulse, index) => {
      const guide = pulse.parentElement.querySelector('path[stroke="#E3C996"]');
      const point = pulse.parentElement.querySelector('circle[fill="#FD9843"]');
      if (!guide || !point) return null;
      const growsFromEnd = !pulse.classList.contains('module-route-pulse-reverse');
      guide.classList.add('module-route-guide');
      guide.setAttribute('pathLength', '100');
      guide.style.strokeDashoffset = growsFromEnd ? '-100' : '100';
      point.classList.add('module-route-point');
      return { guide, point, hubPoints: hubPointsByRoute.get(index) || [], direction: growsFromEnd ? -1 : 1, start: index * 0.04 };
    });
    if (routes.some(route => !route)) return;

    pulses.forEach((pulse, index) => {
      const originalDelay = pulse.style.animationDelay;
      const delay = `${(startOrder[index] * 0.18 + Math.random() * 0.08).toFixed(2)}s`;
      delays.set(originalDelay, delay);
      pulse.style.animationDelay = delay;
    });
    svg.querySelectorAll('.module-endpoint-flare').forEach(flare => {
      flare.style.animationDelay = delays.get(flare.style.animationDelay) || '0s';
    });
    fallback.replaceWith(svg);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        svg.classList.add('module-motion-visible');
        observer.disconnect();
      }, { threshold: 0.1 });
      observer.observe(graphic);
    } else {
      svg.classList.add('module-motion-visible');
    }

    const section = graphic.closest('.modules-section');
    let frame = 0;
    let routesComplete = false;
    let hasReachedCenter = false;
    let spacerReleased = false;
    let completionOffsetReleased = false;
    let lastScrollY = window.scrollY;
    let stickyTop = 0;
    let pinDistance = 1;
    const measure = () => {
      const wasPinned = graphic.classList.contains('is-pinned');
      graphic.classList.remove('is-pinned');
      graphic.style.setProperty('--module-pin-offset', '0px');
      track.style.height = 'auto';

      const trackRect = track.getBoundingClientRect();
      const graphicWidth = graphic.offsetWidth;
      const graphicHeight = graphic.offsetHeight;
      const graphicLeft = window.innerWidth <= 768
        ? trackRect.left
        : trackRect.left + (trackRect.width - graphicWidth) / 2;
      stickyTop = (window.innerHeight - graphicHeight) / 2;
      const reservedDistance = parseFloat(getComputedStyle(track).paddingBottom) || 0;
      pinDistance = spacerReleased ? 0 : reservedDistance || 1;
      track.style.height = `${graphicHeight + pinDistance}px`;
      graphic.style.setProperty('--module-sticky-top', `${stickyTop}px`);
      graphic.style.setProperty('--module-fixed-left', `${graphicLeft}px`);
      graphic.style.setProperty('--module-fixed-width', `${graphicWidth}px`);
      if (wasPinned) graphic.classList.add('is-pinned');
    };
    const update = () => {
      frame = 0;
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      const trackTop = track.getBoundingClientRect().top;
      if (routesComplete) {
        graphic.classList.remove('is-pinned');
        if (scrollDelta < 0 && !completionOffsetReleased) {
          completionOffsetReleased = true;
          spacerReleased = true;
          pinDistance = 0;
          track.style.paddingBottom = '0px';
          track.style.height = `${graphic.offsetHeight}px`;
          section?.classList.add('modules-completion-released');
          window.removeEventListener('scroll', schedule);
        }
        const graphicOffset = completionOffsetReleased ? 0 : pinDistance;
        graphic.style.setProperty('--module-pin-offset', `${graphicOffset}px`);

        // After the first completed pass, let the graphic follow normal page
        // scrolling. Release the reserved animation space only after it has
        // fully left the viewport while moving down, so scrolling back up
        // never pins it at the center again.
        const graphicBottom = trackTop + graphicOffset + graphic.offsetHeight;
        if (!spacerReleased && scrollDelta > 0 && graphicBottom <= 0) {
          const releasedDistance = pinDistance;
          spacerReleased = true;
          pinDistance = 0;
          track.style.paddingBottom = '0px';
          track.style.height = `${graphic.offsetHeight}px`;
          graphic.style.setProperty('--module-pin-offset', '0px');
          window.removeEventListener('scroll', schedule);

          // The track shrinks below the viewport. Compensate the same amount
          // so the next section stays in place without a visible scroll jump.
          const previousScrollBehavior = document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = 'auto';
          window.scrollTo(0, Math.max(0, window.scrollY - releasedDistance));
          document.documentElement.style.scrollBehavior = previousScrollBehavior;
        }
        return;
      }

      const approach = Math.max(0, Math.min(1, (window.innerHeight - trackTop) / (window.innerHeight - stickyTop)));
      if (approach >= 1) hasReachedCenter = true;
      svg.style.setProperty('--module-entry-scale', `${hasReachedCenter ? 1 : 0.88 + approach * 0.12}`);

      const pinOffset = Math.max(0, Math.min(pinDistance, stickyTop - trackTop));
      const isPinned = trackTop <= stickyTop && pinOffset < pinDistance;
      graphic.classList.toggle('is-pinned', isPinned);
      graphic.style.setProperty('--module-pin-offset', `${pinOffset >= pinDistance ? pinDistance : 0}px`);
      const progress = pinOffset / pinDistance;

      routes.forEach(({ guide, point, hubPoints, direction, start }) => {
        const routeProgress = Math.max(0, Math.min(1, (progress - start) / 0.72));
        guide.style.strokeDashoffset = `${direction * 100 * (1 - routeProgress)}`;
        point.classList.toggle('is-visible', routeProgress >= 1);
        hubPoints.forEach(hubPoint => hubPoint?.classList.toggle('is-visible', routeProgress > 0));
      });
      if (progress >= 1) {
        routesComplete = true;
        svg.classList.add('module-routes-complete');
        graphic.classList.remove('is-pinned');
        graphic.style.setProperty('--module-pin-offset', `${pinDistance}px`);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      if (routesComplete) {
        graphic.classList.remove('is-pinned');
        graphic.style.setProperty('--module-pin-offset', `${completionOffsetReleased ? 0 : pinDistance}px`);
      }
      schedule();
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    section?.addEventListener('transitionend', schedule);
    measure();
    update();
  } catch {
    // The original image remains visible if the SVG cannot be loaded inline.
  }
});
