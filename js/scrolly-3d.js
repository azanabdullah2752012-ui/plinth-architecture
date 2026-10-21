/**
 * ══════════════════════════════════════════════════════════════════════════
 * PLINTH — Flowing 3D Scroll-Sensitive Architectural Engine
 * Pinned Sticky Viewport + Lerped Frame & Camera Interpolation
 * Inspired by Tadao Ando, Peter Zumthor & Apple Scrollytelling
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // Check WebGL and Three.js availability
  if (typeof THREE === 'undefined') {
    console.warn('[PLINTH 3D] Three.js not loaded. Falling back to static photography.');
    return;
  }

  const track = document.getElementById('hero-scrolly-track');
  const canvas = document.getElementById('scrolly-3d-canvas');
  if (!track || !canvas) return;

  // Respect user reduced-motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Scene Setup ──────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0C0B0A, 0.045);

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.4, 7.5);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ── Materials ────────────────────────────────────────────────
  // Raw Basalt & Cast Concrete
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x1A1917,
    roughness: 0.88,
    metalness: 0.12,
    flatShading: false
  });

  // Weathered Architectural Brass
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xC4A675,
    roughness: 0.32,
    metalness: 0.82
  });

  // Darkened Steel Frame
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x121110,
    roughness: 0.65,
    metalness: 0.45
  });

  // Polished Travertine / Limestone
  const travertineMat = new THREE.MeshStandardMaterial({
    color: 0x2A2724,
    roughness: 0.75,
    metalness: 0.08
  });

  // ── Monolithic Architectural Structure (The Plinth) ──────────
  const monolithGroup = new THREE.Group();

  // 1. Heavy Base Plinth
  const baseGeo = new THREE.BoxGeometry(4.2, 0.35, 3.2);
  const baseMesh = new THREE.Mesh(baseGeo, concreteMat);
  baseMesh.position.set(0, -1.2, 0);
  baseMesh.receiveShadow = true;
  baseMesh.castShadow = true;
  monolithGroup.add(baseMesh);

  // 2. Travertine Stepped Foundation
  const stepGeo = new THREE.BoxGeometry(4.6, 0.12, 3.6);
  const stepMesh = new THREE.Mesh(stepGeo, travertineMat);
  stepMesh.position.set(0, -1.4, 0);
  stepMesh.receiveShadow = true;
  monolithGroup.add(stepMesh);

  // 3. Left Massive Plaster / Concrete Shear Wall
  const wallLeftGeo = new THREE.BoxGeometry(0.35, 2.4, 2.8);
  const wallLeft = new THREE.Mesh(wallLeftGeo, concreteMat);
  wallLeft.position.set(-1.8, 0.15, 0);
  wallLeft.castShadow = true;
  wallLeft.receiveShadow = true;
  monolithGroup.add(wallLeft);

  // 4. Rear In-Situ Concrete Wall with Clerestory Void
  const wallBackGeo = new THREE.BoxGeometry(3.6, 2.4, 0.3);
  const wallBack = new THREE.Mesh(wallBackGeo, concreteMat);
  wallBack.position.set(0.1, 0.15, -1.35);
  wallBack.castShadow = true;
  wallBack.receiveShadow = true;
  monolithGroup.add(wallBack);

  // 5. Cantilevered Floating Concrete Roof Slab
  const roofGeo = new THREE.BoxGeometry(4.4, 0.22, 3.4);
  const roofMesh = new THREE.Mesh(roofGeo, concreteMat);
  roofMesh.position.set(0.15, 1.4, 0.1);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  monolithGroup.add(roofMesh);

  // 6. Slender Cylindrical Weathered Brass Column
  const columnGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.4, 32);
  const columnMesh = new THREE.Mesh(columnGeo, brassMat);
  columnMesh.position.set(1.6, 0.15, 1.1);
  columnMesh.castShadow = true;
  monolithGroup.add(columnMesh);

  // 7. Internal Travertine Low Bench
  const benchGeo = new THREE.BoxGeometry(1.6, 0.25, 0.6);
  const benchMesh = new THREE.Mesh(benchGeo, travertineMat);
  benchMesh.position.set(-0.6, -0.95, -0.4);
  benchMesh.castShadow = true;
  benchMesh.receiveShadow = true;
  monolithGroup.add(benchMesh);

  // 8. Thin Brass Horizontal Architectural Datum Line
  const datumGeo = new THREE.BoxGeometry(4.4, 0.015, 0.015);
  const datumMesh = new THREE.Mesh(datumGeo, brassMat);
  datumMesh.position.set(0.15, 1.3, 1.71);
  monolithGroup.add(datumMesh);

  scene.add(monolithGroup);

  // ── Atmospheric Lighting (Directional Low Portuguese Sunlight) ──
  const ambientLight = new THREE.AmbientLight(0x0C0B0A, 1.4);
  scene.add(ambientLight);

  // Primary Raking Sunlight (Afternoon Low Sun from Lisbon West)
  const sunLight = new THREE.DirectionalLight(0xFFE6C4, 3.2);
  sunLight.position.set(6, 4.5, 4.5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.bias = -0.0004;
  scene.add(sunLight);

  // Brass Surface Specular Rim Light
  const rimLight = new THREE.DirectionalLight(0xC4A675, 1.5);
  rimLight.position.set(-5, 2, -3);
  scene.add(rimLight);

  // ── Scroll Interpolation Math (Smooth Lerp) ───────────────────
  let targetProgress = 0;
  let currentProgress = 0;
  const lerpFactor = prefersReduced ? 1.0 : 0.075;

  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  // Trackpad / Window Scroll Handler
  function updateScroll() {
    const rect = track.getBoundingClientRect();
    const scrollDistance = track.offsetHeight - window.innerHeight;
    if (scrollDistance <= 0) return;

    const raw = -rect.top / scrollDistance;
    targetProgress = Math.max(0, Math.min(1, raw));
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateScroll();
  });

  // Subtle Mouse Parallax
  window.addEventListener('mousemove', (e) => {
    if (prefersReduced) return;
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── HUD Layer Synchronizer ───────────────────────────────────
  const hudLayers = document.querySelectorAll('.hud-stage');

  function updateHUD(progress) {
    hudLayers.forEach((layer) => {
      const start = parseFloat(layer.getAttribute('data-start') || '0');
      const end = parseFloat(layer.getAttribute('data-end') || '1');
      const fadeIn = start + 0.06;
      const fadeOut = end - 0.06;

      let opacity = 0;
      let translateY = 10;

      if (progress >= start && progress <= end) {
        if (progress < fadeIn) {
          // Easing In
          const t = (progress - start) / (fadeIn - start);
          opacity = t;
          translateY = (1 - t) * 12;
        } else if (progress > fadeOut) {
          // Easing Out
          const t = (end - progress) / (end - fadeOut);
          opacity = t;
          translateY = (1 - t) * -12;
        } else {
          // Full Vis
          opacity = 1;
          translateY = 0;
        }
      }

      layer.style.opacity = opacity.toFixed(3);
      layer.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      layer.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
    });
  }

  // ── Main 60fps / 120fps Render Loop ──────────────────────────
  function tick() {
    requestAnimationFrame(tick);

    // Lerp progress and mouse
    currentProgress += (targetProgress - currentProgress) * lerpFactor;
    currentMouseX += (targetMouseX - currentMouseX) * 0.04;
    currentMouseY += (targetMouseY - currentMouseY) * 0.04;

    const p = currentProgress;

    // ── Continuous 3D Spatial Choreography ─────────────────────
    // Stage 1 (0.00) -> Stage 2 (0.35) -> Stage 3 (0.70) -> Stage 4 (1.00)
    
    // Camera Position Lerp
    // Glide from low monumental front view -> orbit to axonometric -> interior spatial push
    const camX = Math.sin(p * Math.PI * 0.75) * 3.8 + (currentMouseX * 0.25);
    const camY = 0.4 + Math.sin(p * Math.PI) * 0.9 - (currentMouseY * 0.2);
    const camZ = 7.5 - (p * 3.2);

    camera.position.set(camX, camY, camZ);

    // Monolith Subtle Dynamic Tilt & Tectonic Opening
    monolithGroup.rotation.y = (-0.25 + p * 1.1) + (currentMouseX * 0.06);
    monolithGroup.rotation.x = (0.08 - p * 0.12) + (currentMouseY * 0.04);

    // Roof subtle cantilever breath as you move inside
    roofMesh.position.y = 1.4 + Math.sin(p * Math.PI * 2) * 0.04;
    
    // Dynamic Sunlight Path across the space
    sunLight.position.x = 6 + Math.cos(p * Math.PI) * 2;
    sunLight.position.z = 4.5 - p * 3.0;

    camera.lookAt(0.1, -0.1 + p * 0.3, 0);

    // Update HUD overlay states
    updateHUD(p);

    renderer.render(scene, camera);
  }

  // Initial paint
  updateScroll();
  currentProgress = targetProgress;
  updateHUD(currentProgress);
  tick();

  console.log('[PLINTH 3D] Flowing scroll-sensitive architectural engine active.');
})();
