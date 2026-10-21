/**
 * ══════════════════════════════════════════════════════════════════════════
 * PLINTH — 120fps Hardware-Accelerated 3D Spatial Flight Controller
 * Continuous GPU Matrix Compositing + Exponential Decay Smoothing
 * Zero-Lag, Sub-Pixel Accurate, Delta-Time Decoupled
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  const track = document.getElementById('spatial-flight-track');
  const world = document.getElementById('spatial-world');
  const progressFill = document.getElementById('flight-progress-fill');
  const progressText = document.getElementById('flight-progress-text');
  if (!track || !world) return;

  const plates = Array.from(document.querySelectorAll('.spatial-plate'));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Spatial Z positions for each architectural scene
  // Plate 1: Casa Mouraria (0)
  // Plate 2: The Spatial Light Void (-1300)
  // Plate 3: Biblioteca Central (-2600)
  // Plate 4: Pátio das Flores (-3900)
  // Plate 5: Tectonic Installations (-5200)
  const plateConfigs = [
    { z: 0,     x: 0,    y: 0,   rotY: 0 },
    { z: -1300, x: 80,   y: -30, rotY: 6 },
    { z: -2600, x: -110, y: 35,  rotY: -7 },
    { z: -3900, x: 95,   y: -25, rotY: 5 },
    { z: -5200, x: 0,    y: 0,   rotY: 0 }
  ];

  let targetProgress = 0;
  let currentProgress = 0;
  let lastTime = performance.now();

  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  // ── Scroll Progress Computation ──────────────────────────────
  function updateScroll() {
    const rect = track.getBoundingClientRect();
    const totalDist = rect.height - window.innerHeight;
    if (totalDist <= 0) return;

    const scrolled = -rect.top;
    targetProgress = Math.min(1, Math.max(0, scrolled / totalDist));
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll);

  // Mouse Parallax
  window.addEventListener('mousemove', (e) => {
    if (prefersReduced) return;
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── 120fps Delta-Time Decoupled Render Loop ──────────────────
  function loop(now) {
    requestAnimationFrame(loop);

    const dt = Math.min((now - lastTime) / 1000, 0.08);
    lastTime = now;

    // Exponential Decay Smoothing (Frame-rate independent: 60Hz, 120Hz ProMotion, 144Hz)
    const decay = prefersReduced ? 25.0 : 9.5;
    const lerpAlpha = 1 - Math.exp(-decay * dt);

    const prevProgress = currentProgress;
    currentProgress += (targetProgress - currentProgress) * lerpAlpha;

    // Velocity-based inertia tilt
    const velocity = (currentProgress - prevProgress) / (dt || 0.016);
    const dynamicPitch = Math.max(-8, Math.min(8, velocity * -2.2));

    // Mouse smoothing
    currentMouseX += (targetMouseX - currentMouseX) * (1 - Math.exp(-8 * dt));
    currentMouseY += (targetMouseY - currentMouseY) * (1 - Math.exp(-8 * dt));

    const p = currentProgress;

    // ── 3D Camera Flight Coordinates ───────────────────────────
    const maxZ = 5200;
    const camZ = p * maxZ;
    // Elegant sweeping S-curve camera flight
    const camX = Math.sin(p * Math.PI * 2.2) * 140 - (currentMouseX * 38);
    const camY = Math.cos(p * Math.PI * 1.8) * 55 + (currentMouseY * 28);
    const camRotY = Math.sin(p * Math.PI * 2.2) * 6 - (currentMouseX * 4);
    const camRotX = dynamicPitch + (currentMouseY * 3);

    // Apply 3D Matrix directly to the World Stage (Single GPU Layer)
    world.style.transform = `translate3d(${-camX.toFixed(2)}px, ${-camY.toFixed(2)}px, ${camZ.toFixed(2)}px) rotateX(${camRotX.toFixed(2)}deg) rotateY(${camRotY.toFixed(2)}deg)`;

    // ── Update Each Architectural Plate Position & Fog Fade ─────
    plates.forEach((plate, i) => {
      const config = plateConfigs[i] || { z: -i * 1300, x: 0, y: 0, rotY: 0 };
      
      // Distance from camera in Z-space
      // positive = behind camera (past), negative = ahead of camera (in front)
      const distFromCam = config.z + camZ;

      let opacity = 1;
      let pointerEvents = 'auto';

      if (distFromCam > 450) {
        // Swept past camera behind viewer
        opacity = 0;
        pointerEvents = 'none';
      } else if (distFromCam > 50) {
        // Active exit dissolve as camera flies through
        opacity = Math.max(0, 1 - (distFromCam - 50) / 400);
      } else if (distFromCam < -2800) {
        // Distant in atmospheric fog
        opacity = 0;
        pointerEvents = 'none';
      } else if (distFromCam < -1600) {
        // Atmospheric approach fade-in
        opacity = Math.max(0, 1 - (-distFromCam - 1600) / 1200);
      }

      // Hardware 3D position
      plate.style.transform = `translate3d(${config.x}px, ${config.y}px, ${config.z}px) rotateY(${config.rotY}deg)`;
      plate.style.opacity = opacity.toFixed(3);
      plate.style.pointerEvents = pointerEvents;
    });

    // ── Update Telemetry HUD ───────────────────────────────────
    if (progressFill) {
      progressFill.style.width = `${(p * 100).toFixed(1)}%`;
    }
    if (progressText) {
      const pct = Math.round(p * 100);
      progressText.textContent = `${String(pct).padStart(2, '0')}%`;
    }
  }

  // Initial paint
  updateScroll();
  currentProgress = targetProgress;
  requestAnimationFrame(loop);

  console.log('[PLINTH 3D] 120fps hardware-accelerated spatial flight active.');
})();
