import { onReady } from '../shared/ready.js';

onReady(async () => {
  const graphic = document.querySelector('.modules-graphic');
  const track = graphic?.closest('.modules-scroll-track');
  const fallback = graphic?.querySelector('img');
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!track || !fallback) return;

  try {
    const response = await fetch(fallback.src);
    if (!response.ok) return;

    const documentSvg = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
    if (documentSvg.querySelector('parsererror')) return;

    const svg = document.importNode(documentSvg.documentElement, true);
    const pulses = [...svg.querySelectorAll('.module-route-pulse')];
    if (svg.localName !== 'svg' || pulses.length !== 8) return;

    const desktopView = ['viewBox', 'width', 'height'].map(name => [name, svg.getAttribute(name)]);
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

    let routesComplete = false;
    let disposeDesktop = () => {};

    const configureMotion = () => {
      disposeDesktop();
      svg.classList.remove('module-scroll-controlled');
      svg.style.removeProperty('--module-entry-scale');
      const isMobile = mobileQuery.matches;
      const view = isMobile
        ? [['viewBox', '900 480 950 620'], ['width', '950'], ['height', '620']]
        : desktopView;
      view.forEach(([name, value]) => svg.setAttribute(name, value));
      if (isMobile || reducedMotionQuery.matches) return;

      svg.classList.add('module-scroll-controlled');
      // A completed illustration stays in normal flow, including after resize.
      if (routesComplete) return;

      track.classList.add('modules-scroll-active');
      let frame = 0;
      let releaseTimer = 0;
      let releaseRequested = false;
      let disposed = false;
      let hasReachedCenter = false;
      let lastScrollY = window.scrollY;
      let stickyTop = 0;
      let pinDistance = 1;
      let measuredWidth = 0;
      let measuredHeight = 0;

      const measure = () => {
        graphic.classList.remove('is-pinned');
        graphic.style.setProperty('--module-pin-offset', '0px');
        track.style.removeProperty('height');

        const trackRect = track.getBoundingClientRect();
        measuredWidth = graphic.offsetWidth;
        measuredHeight = graphic.offsetHeight;
        stickyTop = (window.innerHeight - measuredHeight) / 2;
        pinDistance = parseFloat(getComputedStyle(track).paddingBottom) || 1;
        track.style.height = `${measuredHeight + pinDistance}px`;
        graphic.style.setProperty('--module-sticky-top', `${stickyTop}px`);
        graphic.style.setProperty('--module-fixed-left', `${trackRect.left + (trackRect.width - measuredWidth) / 2}px`);
        graphic.style.setProperty('--module-fixed-width', `${measuredWidth}px`);
      };

      const releaseSpace = () => {
        const previousScrollY = window.scrollY;
        const releasedDistance = pinDistance;
        disposeDesktop();

        // Removing both the spacer and the graphic's offset moves everything
        // below the track by the same distance. Move the viewport with it so
        // reversing the scroll never makes the illustration or next section jump.
        const root = document.documentElement;
        const previousScrollBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, Math.max(0, previousScrollY - releasedDistance));
        root.style.scrollBehavior = previousScrollBehavior;
      };

      const queueRelease = () => {
        releaseRequested = true;
        clearTimeout(releaseTimer);
        // Let smooth anchor navigation and trackpad momentum finish before
        // compensating the scroll position; scrollTo would interrupt them.
        releaseTimer = window.setTimeout(releaseSpace, 160);
      };

      const update = () => {
        frame = 0;
        if (disposed) return;
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;
        const trackTop = track.getBoundingClientRect().top;
        if (routesComplete) {
          graphic.classList.remove('is-pinned');
          graphic.style.setProperty('--module-pin-offset', `${pinDistance}px`);
          const graphicBottom = trackTop + pinDistance + measuredHeight;
          if (releaseRequested || scrollDelta < 0 || graphicBottom <= 0) queueRelease();
          return;
        }

        const approach = Math.max(0, Math.min(1, (window.innerHeight - trackTop) / (window.innerHeight - stickyTop)));
        if (approach >= 1) hasReachedCenter = true;
        svg.style.setProperty('--module-entry-scale', `${hasReachedCenter ? 1 : 0.88 + approach * 0.12}`);

        const pinOffset = Math.max(0, Math.min(pinDistance, stickyTop - trackTop));
        graphic.classList.toggle('is-pinned', trackTop <= stickyTop && pinOffset < pinDistance);
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
          // Anchor links and restored scroll positions can skip the whole track.
          if (trackTop + pinDistance + measuredHeight <= 0) queueRelease();
        }
      };

      const schedule = () => {
        if (releaseRequested) clearTimeout(releaseTimer);
        if (!frame && !disposed) frame = requestAnimationFrame(update);
      };
      const onNavigate = event => {
        if (routesComplete && event.target.closest('a[href^="#"], #scrollToTop')) releaseSpace();
      };
      const onResize = () => {
        if (disposed || mobileQuery.matches || reducedMotionQuery.matches) return;
        measure();
        update();
      };
      const resizeObserver = new ResizeObserver(() => {
        if (graphic.offsetWidth !== measuredWidth || graphic.offsetHeight !== measuredHeight) onResize();
      });
      disposeDesktop = () => {
        disposed = true;
        cancelAnimationFrame(frame);
        clearTimeout(releaseTimer);
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('click', onNavigate, true);
        resizeObserver.disconnect();
        graphic.classList.remove('is-pinned');
        ['--module-pin-offset', '--module-sticky-top', '--module-fixed-left', '--module-fixed-width']
          .forEach(name => graphic.style.removeProperty(name));
        track.classList.remove('modules-scroll-active');
        track.style.removeProperty('height');
      };

      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', onResize);
      // Compact the track before navigation calculates its destination.
      document.addEventListener('click', onNavigate, true);
      resizeObserver.observe(graphic);
      document.fonts?.ready.then(() => { if (!disposed) onResize(); });
      measure();
      update();
    };

    mobileQuery.addEventListener('change', configureMotion);
    reducedMotionQuery.addEventListener('change', configureMotion);
    configureMotion();
  } catch {
    // The original image remains visible if the SVG cannot be loaded inline.
  }
});
