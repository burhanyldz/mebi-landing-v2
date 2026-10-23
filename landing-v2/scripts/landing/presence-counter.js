import { onReady } from '../shared/ready.js';

onReady(() => {
  const fieldWrap = document.querySelector('.presence-field-wrap');
  const canvas = fieldWrap?.querySelector('[data-presence-field]');
  const countElement = document.querySelector('[data-presence-count]');
  const counterElement = document.querySelector('.presence-counter');
  const statusElement = counterElement?.querySelector('.presence-status');

  if (!fieldWrap || !canvas || !countElement || !counterElement || !statusElement) return;

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const numberFormat = new Intl.NumberFormat('tr-TR');
  const raster = document.createElement('canvas');
  const rasterContext = raster.getContext('2d', { willReadFrequently: true });
  if (!rasterContext) return;

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let animationFrame = 0;
  let lastFrameTime = 0;
  let isVisible = false;
  let nodes = [];
  let headerBottom = 0;
  let headerTextWidth = 0;
  let elapsed = 0;
  let activity = 0.5;
  let targetActivity = 0.5;
  let activeCount = 400000;
  let stencilStartedAt = 0;
  let simulationTimer = 0;
  let simulationEnabled = true;

  const hash = (column, row, seed = 0) => {
    const value = Math.sin((column + 19.19) * 127.1 + (row + 3.71) * 311.7 + seed * 74.7) * 43758.5453;
    return value - Math.floor(value);
  };

  const smoothstep = (low, high, value) => {
    const progress = Math.max(0, Math.min(1, (value - low) / (high - low)));
    return progress * progress * (3 - 2 * progress);
  };

  const fieldColor = (u, v) => {
    const mix = smoothstep(-0.9, 0.92, u + v * 0.12);
    const stops = mix < 0.5
      ? [[42, 83, 180], [89, 100, 192], mix * 2]
      : [[89, 100, 192], [20, 143, 157], (mix - 0.5) * 2];
    const [start, end, amount] = stops;
    return `rgb(${start.map((channel, index) => Math.round(channel + (end[index] - channel) * amount)).join(', ')})`;
  };

  const sampleInk = (node, time) => {
    if (reducedMotion.matches) return node.ink;
    const progress = smoothstep(0, 560, time - stencilStartedAt - node.delay);
    return node.fromInk + (node.ink - node.fromInk) * progress;
  };

  // The displayed value is sampled onto the same vertices as the terrain.
  const updateParticleCount = (reset = false) => {
    const text = numberFormat.format(activeCount);
    const size = Math.min(width < 640 ? 48 : 56, (width - 48) / (text.length * 0.65));
    rasterContext.font = `600 ${size}px Rubik, sans-serif`;
    raster.width = Math.ceil(rasterContext.measureText(text).width + 20);
    raster.height = Math.ceil(size * 1.5);
    rasterContext.font = `600 ${size}px Rubik, sans-serif`;
    rasterContext.textAlign = 'center';
    rasterContext.textBaseline = 'middle';
    rasterContext.fillStyle = '#000';
    rasterContext.fillText(text, raster.width * 0.5, raster.height * 0.5);
    const pixels = rasterContext.getImageData(0, 0, raster.width, raster.height).data;
    const radiusX = Math.min(width * (width < 640 ? 0.61 : 0.43), 740);

    for (const node of nodes) {
      const previousInk = sampleInk(node, elapsed);
      const x = Math.round(node.u * radiusX * 0.86 + raster.width * 0.5);
      const y = Math.round((node.v - 0.04) * height * 0.24 + raster.height * 0.5);
      const ink = x >= 0 && x < raster.width && y >= 0 && y < raster.height
        ? pixels[(y * raster.width + x) * 4 + 3] / 255 : 0;
      node.fromInk = reset ? ink : previousInk;
      node.ink = ink;
      node.delay = Math.max(0, Math.min(1, x / raster.width)) * 90;
    }

    stencilStartedAt = elapsed;
    if (reducedMotion.matches) draw(elapsed);
  };

  const draw = (time) => {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    const mobile = width < 640;
    const phase = reducedMotion.matches ? 0 : time * 0.001;
    const radiusX = Math.min(width * (mobile ? 0.61 : 0.43), 740);
    const amplitude = Math.min(height * 0.075, mobile ? 20 : 30);
    const project = (node, output) => {
      const { u, v, edge, front } = node;
      const swell = Math.sin(u * 2.8 + v * 1.6 - phase * 0.38) * 0.65
        + Math.sin(v * 3.2 - u * 1.3 + phase * 0.23) * 0.35;
      const driftX = Math.sin(phase * 0.13 + node.phase) * node.drift;
      const driftY = Math.cos(phase * 0.11 + node.phase) * node.drift * 0.65;
      output.x = width * 0.5 + u * radiusX * (0.72 + front * 0.28)
        + Math.sin(v * 3 + phase * 0.24) * edge * (mobile ? 3 : 6) + driftX;
      output.y = height * 0.65 + v * height * 0.24 - swell * edge * amplitude + driftY;
    };

    const position = { x: 0, y: 0 };
    for (const node of nodes) {
      project(node, position);
      const { x, y } = position;
      const headingClearance = Math.max(
        smoothstep(headerTextWidth * 0.5, headerTextWidth * 0.5 + 45, Math.abs(x - width * 0.5)),
        smoothstep(headerBottom - 4, headerBottom + 26, y),
      );
      const viewportFade = smoothstep(0, 28, x) * smoothstep(0, 28, width - x)
        * smoothstep(0, 24, y) * smoothstep(0, 24, height - y);
      const visibility = node.edgeFade * headingClearance * viewportFade;
      if (visibility < 0.015) continue;

      const ink = sampleInk(node, time);
      const shimmer = node.accent && !reducedMotion.matches
        ? 0.88 + Math.sin(phase * 0.42 + node.phase) * 0.12 : 1;
      const opacity = (node.opacity * shimmer + (0.95 - node.opacity * shimmer) * ink) * visibility;
      if (opacity < 0.025) continue;
      const size = node.size + (1.34 - node.size) * ink;
      context.globalAlpha = opacity;
      context.fillStyle = node.color;
      context.beginPath();
      if (node.kind === 'ring' && ink < 0.15) {
        context.strokeStyle = node.color;
        context.lineWidth = 0.7;
        context.arc(x, y, size, 0, Math.PI * 2);
        context.stroke();
      } else if (node.kind === 'diamond' && ink < 0.15) {
        context.moveTo(x, y - size);
        context.lineTo(x + size * 0.8, y);
        context.lineTo(x, y + size);
        context.lineTo(x - size * 0.8, y);
        context.closePath();
        context.fill();
      } else {
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
      }
    }

    context.globalAlpha = 1;
    context.globalAlpha = 1;
  };

  const resize = () => {
    const bounds = fieldWrap.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const description = document.querySelector('.presence-description').getBoundingClientRect();
    const title = document.querySelector('.presence-header .section-title').getBoundingClientRect();
    headerBottom = description.bottom - bounds.top;
    headerTextWidth = Math.max(title.width, description.width);

    const columns = Math.min(320, Math.max(88, Math.round(width / 4.2)));
    const rows = mobileRows(width);
    nodes = [];
    for (let row = 0; row < rows; row += 1) {
      const v = row / (rows - 1) * 2 - 1;
      for (let column = 0; column < columns; column += 1) {
        const u = column / (columns - 1) * 2 - 1;
        const edge = 1 - u * u - v * v;
        if (edge <= 0) continue;
        const front = (v + 1) * 0.5;
        const variation = hash(column, row);
        const scale = hash(column, row, 3);
        const backStream = Math.exp(-(((v + 0.12 - Math.sin(u * 2.4) * 0.2) / 0.48) ** 2));
        const frontStream = Math.exp(-(((v - 0.56 + Math.cos(u * 3) * 0.12) / 0.25) ** 2));
        const density = backStream * 0.65 + frontStream * 0.35;
        const visibility = smoothstep(0.75, 0.95, variation + density * 0.2);
        const kind = scale > 0.9975 ? 'ring' : scale > 0.9945 ? 'diamond' : 'dot';
        const accent = scale > 0.975;
        nodes.push({
          u: u + (hash(column, row, 1) - 0.5) * 0.8 / columns,
          v: v + (hash(column, row, 2) - 0.5) * 0.8 / rows,
          edge, edgeFade: smoothstep(0, 0.42, edge), front,
          drift: 0.25 + hash(column, row, 4) * 0.9,
          phase: hash(column, row, 5) * Math.PI * 2,
          color: fieldColor(u, v), kind, accent,
          opacity: (0.4 + front * 0.16 + scale * 0.12) * visibility,
          size: kind === 'ring' ? 1.55 + front * 0.6
            : kind === 'diamond' ? 1.05 + front * 0.5
              : accent ? 1.1 + front * 0.65 : 0.52 + scale * 0.46 + front * 0.2,
          ink: 0, fromInk: 0, delay: 0,
        });
      }
    }

    const scatterCount = width < 640 ? 520 : 1600;
    for (let index = 0; index < scatterCount; index += 1) {
      const angle = hash(index, 101, 1) * Math.PI * 2;
      const radius = 0.72 + hash(index, 101, 2) ** 0.8 * 0.98;
      const u = Math.cos(angle) * radius * (1 + Math.sin(angle * 3) * 0.12);
      const v = Math.sin(angle) * radius;
      const front = Math.max(0, Math.min(1, (v + 1) * 0.5));
      const variation = hash(index, 101, 3);
      nodes.push({
        u, v, front, edge: Math.max(0.08, 1 - u * u - v * v),
        edgeFade: 1 - smoothstep(0.95, 1.9, radius) * 0.8,
        color: fieldColor(u, v), kind: variation > 0.994 ? 'ring' : 'dot',
        accent: variation > 0.9,
        opacity: 0.16 + variation * 0.27,
        size: 0.45 + variation * 0.65 + front * 0.15,
        drift: 2 + variation * (width < 640 ? 4 : 8),
        phase: hash(index, 101, 4) * Math.PI * 2,
        ink: 0, fromInk: 0, delay: 0,
      });
    }

    updateParticleCount(true);
    draw(elapsed);
  };

  function mobileRows(viewWidth) {
    return viewWidth < 640 ? 64 : 76;
  }

  const stopAnimation = () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const animate = (time) => {
    animationFrame = 0;
    if (!isVisible || document.hidden || reducedMotion.matches) return;
    const delta = Math.min(64, Math.max(0, time - lastFrameTime));
    if (time - lastFrameTime >= 1000 / 30) {
      activity += (targetActivity - activity) * (1 - Math.exp(-delta / 4000));
      elapsed += delta * (0.8 + activity * 0.4);
      draw(elapsed);
      lastFrameTime = time;
    }
    animationFrame = window.requestAnimationFrame(animate);
  };

  const updateAnimation = () => {
    stopAnimation();
    lastFrameTime = performance.now();
    draw(elapsed);
    if (isVisible && !document.hidden && !reducedMotion.matches) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  };

  const renderCount = (value) => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return;
    const count = Number(value);
    if (!Number.isSafeInteger(count) || count < 0 || count === activeCount) return;
    targetActivity = 0.5 + 0.5 * Math.tanh((count - 400000) / 40000);
    activeCount = count;
    countElement.textContent = numberFormat.format(count);
    updateParticleCount();
  };

  const setCount = (value) => {
    if (typeof value !== 'number' && typeof value !== 'string') return;
    if (typeof value === 'string' && value.trim() === '') return;
    const count = Number(value);
    if (!Number.isSafeInteger(count) || count < 0) return;
    simulationEnabled = false;
    window.clearTimeout(simulationTimer);
    simulationTimer = 0;
    renderCount(count);
  };

  const updateDemoCount = () => {
    if (!simulationEnabled) return;
    if (!document.hidden) {
      const lowerLimit = 390000;
      const upperLimit = 410000;
      const scale = Math.random();
      const change = scale < 0.6 ? 1 + Math.floor(Math.random() * 12)
        : scale < 0.88 ? (1 + Math.floor(Math.random() * 9)) * 100
          : (1 + Math.floor(Math.random() * 3)) * 1000;
      let direction = Math.random() < 0.5 ? -1 : 1;
      if (activeCount + direction * change < lowerLimit || activeCount + direction * change > upperLimit) direction *= -1;
      renderCount(activeCount + direction * change);
    }
    simulationTimer = window.setTimeout(updateDemoCount, 1400 + Math.random() * 1500);
  };

  countElement.textContent = numberFormat.format(activeCount);
  window.mebiActiveUsers = Object.freeze({ setCount });
  simulationTimer = window.setTimeout(updateDemoCount, 1500);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      updateAnimation();
    }, { threshold: 0.01 });
    observer.observe(fieldWrap);
  } else {
    isVisible = true;
  }

  window.addEventListener('resize', resize, { passive: true });
  document.fonts?.ready.then(resize);
  document.addEventListener('visibilitychange', updateAnimation);
  reducedMotion.addEventListener?.('change', updateAnimation);

  resize();
  updateAnimation();
});
