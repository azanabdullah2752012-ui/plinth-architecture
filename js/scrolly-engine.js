/**
 * ══════════════════════════════════════════════════════════════════════════
 * PLINTH — Apple-Style Canvas Sequence Scrollytelling Engine
 * 72-Frame Photorealistic Architectural Camera Dolly & Sunlight Sweep
 * Pinned Sticky Viewport + Lerped Frame Interpolation (60/120fps)
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  const canvas = document.getElementById('product-canvas');
  const track = document.getElementById('product-hero');
  if (!canvas || !track) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  const hudLayers = document.querySelectorAll('.hud-stage');

  const FRAME_COUNT = 72;
  const frames = [];
  let loadedCount = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let isTicking = false;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lerpFactor = prefersReduced ? 1.0 : 0.12;

  // Frame URL pattern
  const getFrameUrl = (idx) => `frames/frame_${String(idx).padStart(4, '0')}.jpg`;

  // ── Preload Frames ───────────────────────────────────────────
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);
    img.onload = () => {
      loadedCount++;
      if (loadedCount === 1) {
        // Immediate First-Frame Paint (Law 1: Content visible by default)
        renderFrame(0);
      }
    };
    frames.push(img);
  }

  // ── Resize / Retina Scaling ──────────────────────────────────
  let canvasW = 0;
  let canvasH = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasW = window.innerWidth;
    canvasH = window.innerHeight;
    canvas.width = Math.floor(canvasW * dpr);
    canvas.height = Math.floor(canvasH * dpr);
    ctx.scale(dpr, dpr);

    renderFrame(currentProgress);
  }

  // ── Frame Painter (Optical Cover Math) ───────────────────────
  function renderFrame(progress) {
    const frameIndex = Math.min(
      FRAME_COUNT - 1,
      Math.max(0, Math.floor(progress * (FRAME_COUNT - 1)))
    );

    const img = frames[frameIndex] || frames[0];
    if (!img || !img.complete) return;

    // Optical cover calculation: fills the viewport while preserving aspect ratio
    const imgRatio = img.width / img.height;
    const viewRatio = canvasW / canvasH;
    let drawW, drawH, drawX, drawY;

    if (viewRatio > imgRatio) {
      drawW = canvasW;
      drawH = canvasW / imgRatio;
    } else {
      drawH = canvasH;
      drawW = canvasH * imgRatio;
    }

    drawX = (canvasW - drawW) / 2;
    drawY = (canvasH - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // ── Synchronize HUD Overlays ───────────────────────────────
    hudLayers.forEach((layer) => {
      const start = parseFloat(layer.getAttribute('data-start') || '0');
      const end = parseFloat(layer.getAttribute('data-end') || '1');
      const fadeIn = start + 0.05;
      const fadeOut = end - 0.05;

      let opacity = 0;
      let translateY = 12;

      if (progress >= start && progress <= end) {
        if (progress < fadeIn) {
          const t = (progress - start) / (fadeIn - start);
          opacity = t;
          translateY = (1 - t) * 12;
        } else if (progress > fadeOut) {
          const t = (end - progress) / (end - fadeOut);
          opacity = t;
          translateY = (1 - t) * -12;
        } else {
          opacity = 1;
          translateY = 0;
        }
      }

      layer.style.opacity = opacity.toFixed(3);
      layer.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      layer.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
    });
  }

  // ── Scroll Progress Computation ──────────────────────────────
  function onScroll() {
    const rect = track.getBoundingClientRect();
    const totalDist = rect.height - window.innerHeight;
    if (totalDist <= 0) return;

    const scrolled = -rect.top;
    targetProgress = Math.min(1, Math.max(0, scrolled / totalDist));

    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(loop);
    }
  }

  // ── Butter-Smooth 60/120fps Lerp Loop ────────────────────────
  function loop() {
    const diff = targetProgress - currentProgress;

    if (Math.abs(diff) > 0.0003) {
      currentProgress += diff * lerpFactor;
      renderFrame(currentProgress);
      requestAnimationFrame(loop);
    } else {
      currentProgress = targetProgress;
      renderFrame(currentProgress);
      isTicking = false;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize);

  // Initialize
  resize();
  onScroll();
  console.log('[PLINTH Scrollytelling] 72-frame Apple-style canvas engine active.');
})();
