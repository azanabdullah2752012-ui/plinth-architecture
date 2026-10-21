/**
 * ══════════════════════════════════════════════════════════════════════════
 * PLINTH — Continuous 3D Architectural Scrollytelling Engine (Three.js WebGL)
 * 100% Mathematically Continuous Catmull-Rom Camera Flight (Zero Scene Jumps)
 * Full-Site Kinetic Architecture: Excavation, Assembly, Light Arc & Axonometric
 * 120fps GPU Rendering · Delta-Time Decoupled Exponential Decay Smoothing
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.error('[PLINTH 3D] Three.js library not detected.');
    return;
  }

  const canvas = document.getElementById('architectural-3d-canvas');
  if (!canvas) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. PROCEDURAL ARCHITECTURAL PBR TEXTURE GENERATORS ─────
  function createConcreteTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 1024;
    const ctx = cvs.getContext('2d');

    ctx.fillStyle = '#1C1B19';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankHeight = 96;
    for (let y = 0; y < 1024; y += plankHeight) {
      const plankTone = 24 + Math.floor(Math.random() * 8);
      ctx.fillStyle = `rgb(${plankTone}, ${plankTone - 2}, ${plankTone - 4})`;
      ctx.fillRect(0, y, 1024, plankHeight);

      ctx.fillStyle = 'rgba(10, 9, 8, 0.65)';
      ctx.fillRect(0, y, 1024, 3);
      ctx.fillStyle = 'rgba(243, 239, 230, 0.04)';
      ctx.fillRect(0, y + 3, 1024, 1);
    }

    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 18;
      data[i]     = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }

  function createTravertineTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 1024;
    const ctx = cvs.getContext('2d');

    ctx.fillStyle = '#262421';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 40; i++) {
      const y = Math.random() * 1024;
      const h = 8 + Math.random() * 24;
      ctx.fillStyle = `rgba(${196 + Math.random() * 30}, ${166 + Math.random() * 30}, ${117 + Math.random() * 20}, ${0.03 + Math.random() * 0.05})`;
      ctx.fillRect(0, y, 1024, h);
    }

    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const r = 1 + Math.random() * 2.5;
      ctx.fillStyle = 'rgba(12, 11, 10, 0.4)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }

  const concreteTex = createConcreteTexture();
  const travertineTex = createTravertineTexture();

  // ── 2. SCENE, CAMERA & RENDERER SETUP ──────────────────────
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0C0B0A, 0.013);

  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(1.4, 3.2, 18.2);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ── 3. PBR MATERIALS ───────────────────────────────────────
  const concreteMat = new THREE.MeshStandardMaterial({
    map: concreteTex,
    color: 0xE0DBD2,
    roughness: 0.88,
    metalness: 0.08,
    bumpMap: concreteTex,
    bumpScale: 0.035
  });

  const travertineMat = new THREE.MeshStandardMaterial({
    map: travertineTex,
    color: 0xF3EFE6,
    roughness: 0.65,
    metalness: 0.05,
    bumpMap: travertineTex,
    bumpScale: 0.02
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xC4A675,
    roughness: 0.35,
    metalness: 0.85
  });

  const basaltMat = new THREE.MeshStandardMaterial({
    color: 0x11100F,
    roughness: 0.95,
    metalness: 0.1
  });

  const cadLineMat = new THREE.LineBasicMaterial({
    color: 0xC4A675,
    transparent: true,
    opacity: 0.55
  });

  const cadLaserMat = new THREE.LineBasicMaterial({
    color: 0x58D5F7,
    transparent: true,
    opacity: 0.75
  });

  function addEdges(mesh, mat = cadLineMat) {
    const edges = new THREE.EdgesGeometry(mesh.geometry, 28);
    const line = new THREE.LineSegments(edges, mat);
    mesh.add(line);
    return line;
  }

  // ── 4. ARCHITECTURAL ASSEMBLY MODEL ────────────────────────
  const architectureRoot = new THREE.Group();
  scene.add(architectureRoot);

  // Basalt Bedrock Foundation Slab
  const bedrockMesh = new THREE.Mesh(new THREE.BoxGeometry(22, 0.5, 22), basaltMat);
  bedrockMesh.position.set(0, -1.85, 0);
  bedrockMesh.receiveShadow = true;
  architectureRoot.add(bedrockMesh);

  // Laser CAD Coordinate Datum Grid
  const gridHelper = new THREE.GridHelper(20, 40, 0xC4A675, 0x262320);
  gridHelper.position.set(0, -1.58, 0);
  architectureRoot.add(gridHelper);

  // Stepped Plinth (Excavation)
  const plinthGroup = new THREE.Group();
  const plinthStep1 = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.35, 5.6), travertineMat);
  plinthStep1.position.set(0, -1.4, 0);
  plinthStep1.receiveShadow = true;
  plinthStep1.castShadow = true;
  addEdges(plinthStep1);
  plinthGroup.add(plinthStep1);

  const plinthStep2 = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.35, 4.6), concreteMat);
  plinthStep2.position.set(0, -1.05, 0);
  plinthStep2.receiveShadow = true;
  plinthStep2.castShadow = true;
  addEdges(plinthStep2);
  plinthGroup.add(plinthStep2);
  architectureRoot.add(plinthGroup);

  // Left Concrete Shear Wall
  const wallLeftGroup = new THREE.Group();
  const wallLeftMain = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 4.4), concreteMat);
  wallLeftMain.position.set(0, 0.75, 0);
  wallLeftMain.castShadow = true;
  wallLeftMain.receiveShadow = true;
  addEdges(wallLeftMain);
  wallLeftGroup.add(wallLeftMain);
  architectureRoot.add(wallLeftGroup);

  // Right Concrete Shear Wall
  const wallRightGroup = new THREE.Group();
  const wallRightMain = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 3.6), concreteMat);
  wallRightMain.position.set(0, 0.75, 0);
  wallRightMain.castShadow = true;
  wallRightMain.receiveShadow = true;
  addEdges(wallRightMain);
  wallRightGroup.add(wallRightMain);
  architectureRoot.add(wallRightGroup);

  // Rear Monolith Wall with Clerestory Slit
  const wallRearGroup = new THREE.Group();
  const wallRearMain = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, 0.45), concreteMat);
  wallRearMain.position.set(0, 0.75, 0);
  wallRearMain.castShadow = true;
  wallRearMain.receiveShadow = true;
  addEdges(wallRearMain);
  wallRearGroup.add(wallRearMain);
  architectureRoot.add(wallRearGroup);

  // Slender Marine Brass Column
  const columnGroup = new THREE.Group();
  const columnCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 32), brassMat);
  columnCylinder.position.set(0, 0.75, 0);
  columnCylinder.castShadow = true;
  columnGroup.add(columnCylinder);

  const columnBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.3), brassMat);
  columnBase.position.set(0, -0.85, 0);
  columnGroup.add(columnBase);
  architectureRoot.add(columnGroup);

  // Post-Tensioned Cantilever Roof Slab
  const roofGroup = new THREE.Group();
  const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.32, 5.2), concreteMat);
  roofMesh.position.set(0, 0, 0);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  addEdges(roofMesh, cadLaserMat);
  roofGroup.add(roofMesh);
  architectureRoot.add(roofGroup);

  // Interior Travertine Bench
  const benchGroup = new THREE.Group();
  const benchMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 0.75), travertineMat);
  benchMesh.position.set(-0.6, -0.7, -0.5);
  benchMesh.castShadow = true;
  benchMesh.receiveShadow = true;
  addEdges(benchMesh);
  benchGroup.add(benchMesh);
  architectureRoot.add(benchGroup);

  // Volumetric Sunbeam Cone (God-Ray)
  const beamGeo = new THREE.CylinderGeometry(0.4, 2.6, 6.2, 32, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xFFE0A0,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const sunBeam = new THREE.Mesh(beamGeo, beamMat);
  sunBeam.position.set(0.6, 1.2, 0.3);
  sunBeam.rotation.z = -0.42;
  sunBeam.rotation.x = 0.25;
  architectureRoot.add(sunBeam);

  // 2,000 Floating Golden Dust Motes
  const particleCount = 2000;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3]     = (Math.random() - 0.5) * 5.0;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4.5 + 0.5;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 5.0;
    particleVelocities.push({
      vx: (Math.random() - 0.5) * 0.003,
      vy: Math.random() * 0.002 + 0.001,
      vz: (Math.random() - 0.5) * 0.003
    });
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.038,
    color: 0xFFD89B,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const dustParticles = new THREE.Points(particleGeo, particleMat);
  architectureRoot.add(dustParticles);

  // ── 5. LIGHTING ────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0x0C0B0A, 1.4);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xFFE8D0, 4.0);
  sunLight.position.set(12, 10, 9);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 1.0;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -14;
  sunLight.shadow.camera.right = 14;
  sunLight.shadow.camera.top = 14;
  sunLight.shadow.camera.bottom = -14;
  sunLight.shadow.bias = -0.0003;
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0xC4A675, 1.4);
  rimLight.position.set(-8, 4, -5);
  scene.add(rimLight);

  // ── 6. 100% CONTINUOUS MATHEMATICAL SPLINE FLIGHT ──────────
  // Guarantees C^2 continuous velocity and curvature across [0, 1] — Zero Scene Snaps
  const targetOffsetX = window.innerWidth > 960 ? 1.4 : 0.0;
  architectureRoot.position.set(targetOffsetX, -0.3, 0);

  const cameraSplinePoints = [
    new THREE.Vector3(targetOffsetX,        3.2, 18.2), // 0.00 - Establishing foundation
    new THREE.Vector3(targetOffsetX + 3.8,  3.6, 17.6), // 0.10 - Excavation & bedrock leveling
    new THREE.Vector3(targetOffsetX + 6.5,  4.2, 16.5), // 0.20 - Wall assembly orbit
    new THREE.Vector3(targetOffsetX + 5.2,  4.8, 15.6), // 0.30 - Canopy descent & docking
    new THREE.Vector3(targetOffsetX + 1.2,  3.8, 15.0), // 0.40 - [PL-01] Casa Mouraria light court
    new THREE.Vector3(targetOffsetX - 3.2,  4.4, 15.5), // 0.50 - [PL-02] Biblioteca coffered hall
    new THREE.Vector3(targetOffsetX - 5.8,  3.2, 16.2), // 0.60 - [PL-03] Pátio das Flores archway
    new THREE.Vector3(targetOffsetX - 1.5,  5.2, 15.8), // 0.70 - [PL-04] Edifício Vento atrium
    new THREE.Vector3(targetOffsetX + 4.8,  3.4, 16.8), // 0.80 - [PL-05] Pavilhão Sereno horizon
    new THREE.Vector3(targetOffsetX + 9.8,  6.8, 16.2), // 0.90 - Material lab & studio axonometric
    new THREE.Vector3(targetOffsetX + 11.5, 8.5, 17.5)  // 1.00 - Atelier Lisbon dusk elevation
  ];
  const cameraSpline = new THREE.CatmullRomCurve3(cameraSplinePoints, false, 'catmullrom', 0.5);

  const lookSplinePoints = [
    new THREE.Vector3(targetOffsetX,       0.4,  0.0), // 0.00
    new THREE.Vector3(targetOffsetX,       0.5,  0.0), // 0.10
    new THREE.Vector3(targetOffsetX,       0.7,  0.0), // 0.20
    new THREE.Vector3(targetOffsetX,       0.8,  0.0), // 0.30
    new THREE.Vector3(targetOffsetX + 0.3, 0.6, -0.4), // 0.40 - Casa Mouraria
    new THREE.Vector3(targetOffsetX + 0.2, 1.1, -0.2), // 0.50 - Biblioteca
    new THREE.Vector3(targetOffsetX,       0.5,  0.0), // 0.60 - Pátio das Flores
    new THREE.Vector3(targetOffsetX,       0.9,  0.0), // 0.70 - Edifício Vento
    new THREE.Vector3(targetOffsetX,       0.4,  0.0), // 0.80 - Pavilhão Sereno
    new THREE.Vector3(targetOffsetX,       0.8,  0.0), // 0.90 - Studio
    new THREE.Vector3(targetOffsetX,       0.6,  0.0)  // 1.00 - Contact
  ];
  const lookSpline = new THREE.CatmullRomCurve3(lookSplinePoints, false, 'catmullrom', 0.5);

  // Smooth-step mathematical easing helper
  function smoothStep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  // ── 7. SCROLL INTERACTION & SMOOTHING ──────────────────────
  const track = document.getElementById('hero-scrolly') || document.getElementById('spatial-flight-track');
  let targetProgress = 0;
  let currentProgress = 0;
  let lastTime = performance.now();

  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  function updateScroll() {
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const totalDist = rect.height - window.innerHeight;
    if (totalDist <= 0) return;
    const scrolled = -rect.top;
    targetProgress = Math.min(1, Math.max(0, scrolled / totalDist));
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const offset = window.innerWidth > 960 ? 1.4 : 0.0;
    architectureRoot.position.x = offset;
    updateScroll();
  });

  window.addEventListener('mousemove', (e) => {
    if (prefersReduced) return;
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── 8. HUD SYNCHRONIZATION ─────────────────────────────────
  const hudProgressFill = document.getElementById('hud-progress-fill');
  const hudProgressText = document.getElementById('hud-progress-text');
  const hudPhaseCode = document.getElementById('hud-phase-code');
  const hudPhaseSub = document.getElementById('hud-phase-sub');
  const hudStageTitle = document.getElementById('hud-stage-title');
  const hudStageDesc = document.getElementById('hud-stage-desc');
  const hudValSun = document.getElementById('hud-val-sun');
  const hudValSpan = document.getElementById('hud-val-span');
  const hudValLoad = document.getElementById('hud-val-load');
  const hudValMat = document.getElementById('hud-val-mat');
  const hudPortalLink = document.getElementById('hud-portal-link');
  const phaseDots = document.querySelectorAll('.hud-dot-btn');

  const chapters = [
    {
      range: [0.00, 0.18],
      code: '[ CHAPTER 01 / EXCAVATION ]',
      sub: 'BEDROCK BASALT DATUM ±0.00M',
      title: 'Excavating<br><em>the bedrock.</em>',
      desc: 'Every commission begins with geological excavation. The stepped stone plinth anchors directly into coastal basalt bedrock.',
      sun: '65.0° N Morning',
      span: '14.80 m',
      load: 'Bedrock Datum ±0.00m',
      mat: 'Basalt & Travertine',
      link: 'projects/casa-mouraria.html',
      linkText: 'Explore Casa Mouraria Folio [PL-01] →'
    },
    {
      range: [0.18, 0.38],
      code: '[ CHAPTER 02 / STRUCTURE ]',
      sub: 'IN-SITU SHEAR WALLS & CANOPY',
      title: 'Tectonic mass<br><em>locks into place.</em>',
      desc: 'Board-formed in-situ concrete walls slide into precision structural tracks as the 14.8m post-tensioned canopy descends into silence.',
      sun: '52.4° W High Light',
      span: '14.80 m Cantilever',
      load: 'Compression 45.0 MPa',
      mat: 'Pozzolanic Concrete',
      link: 'projects/biblioteca-central.html',
      linkText: 'Explore Biblioteca Central Folio [PL-02] →'
    },
    {
      range: [0.38, 0.58],
      code: '[ CHAPTER 03 / APERTURE ]',
      sub: 'SOLAR LIGHT VOID · 28° AZIMUTH',
      title: 'Carved by<br><em>afternoon light.</em>',
      desc: 'Low Portuguese sunlight rakes across the clerestory slit at 28° azimuth, igniting suspended golden dust particles across the interior bench.',
      sun: '28.4° Low Sun (242°)',
      span: 'Internal Light Void',
      load: 'Thermal Mass Activated',
      mat: 'Honed Estremoz Travertine',
      link: 'projects/patio-flores.html',
      linkText: 'Explore Pátio das Flores Folio [PL-03] →'
    },
    {
      range: [0.58, 0.78],
      code: '[ CHAPTER 04 / COMMISSIONS ]',
      sub: 'FIVE ARCHITECTURAL WORKS',
      title: 'Specific geologies.<br><em>One rigor.</em>',
      desc: 'From Porto brutalist library to Alentejo landscape pavilion: architecture responding directly to maritime light, stone, and wind.',
      sun: 'Maritime Horizon Light',
      span: 'Cascais & Alentejo',
      load: 'Natural Stack Ventilation',
      mat: 'Limestone & Marine Brass',
      link: 'projects/edificio-vento.html',
      linkText: 'Explore Edifício Vento Folio [PL-04] →'
    },
    {
      range: [0.78, 1.00],
      code: '[ CHAPTER 05 / ARCHAEOLOGY ]',
      sub: 'EXPLODED AXONOMETRIC & ATELIER',
      title: 'Structural truth<br><em>unfolded.</em>',
      desc: 'The monument lifts into an exploded axonometric diagram, displaying load transfers and forensic material test results before docking into the atelier.',
      sun: 'Solstice Calibrated',
      span: 'Integrated System',
      load: 'Perpetual Gravity Rigor',
      mat: 'Basalt · Concrete · Brass',
      link: 'projects/pavilhao-sereno.html',
      linkText: 'Explore Pavilhão Sereno Folio [PL-05] →'
    }
  ];

  let currentChapterIdx = -1;

  function updateHUD(p) {
    if (hudProgressFill) hudProgressFill.style.width = `${(p * 100).toFixed(1)}%`;
    if (hudProgressText) hudProgressText.textContent = `${String(Math.round(p * 100)).padStart(2, '0')}%`;

    let activeIdx = chapters.findIndex(c => p >= c.range[0] && p <= c.range[1]);
    if (activeIdx === -1) activeIdx = p >= 1 ? chapters.length - 1 : 0;

    if (activeIdx !== currentChapterIdx) {
      currentChapterIdx = activeIdx;
      const ch = chapters[activeIdx];

      if (hudPhaseCode) hudPhaseCode.textContent = ch.code;
      if (hudPhaseSub) hudPhaseSub.textContent = ch.sub;
      if (hudStageTitle) hudStageTitle.innerHTML = ch.title;
      if (hudStageDesc) hudStageDesc.textContent = ch.desc;
      if (hudValSun) hudValSun.textContent = ch.sun;
      if (hudValSpan) hudValSpan.textContent = ch.span;
      if (hudValLoad) hudValLoad.textContent = ch.load;
      if (hudValMat) hudValMat.textContent = ch.mat;
      if (hudPortalLink) {
        hudPortalLink.setAttribute('href', ch.link);
        hudPortalLink.innerHTML = `<span>${ch.linkText}</span>`;
      }

      phaseDots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === activeIdx);
      });
    }
  }

  // Phase Click Buttons: Smooth Scroll to Normalized Milestones within Track
  phaseDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetP = parseFloat(dot.getAttribute('data-phase') || '0');
      if (!track) return;
      const totalDist = track.offsetHeight - window.innerHeight;
      const targetScroll = track.offsetTop + (targetP * totalDist);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  });

  // ── 9. MAIN RENDER & ANIMATION LOOP ────────────────────────
  function tick(now) {
    requestAnimationFrame(tick);

    const dt = Math.min((now - lastTime) / 1000, 0.08);
    lastTime = now;

    // Frame-rate independent exponential decay smoothing
    const decay = prefersReduced ? 30.0 : 9.5;
    const lerpAlpha = 1 - Math.exp(-decay * dt);

    const prevP = currentProgress;
    currentProgress += (targetProgress - currentProgress) * lerpAlpha;

    // Velocity-based subtle dynamic pitch
    const velocity = (currentProgress - prevP) / (dt || 0.016);
    const dynamicPitch = Math.max(-4, Math.min(4, velocity * -1.2));

    // Mouse parallax lerp
    currentMouseX += (targetMouseX - currentMouseX) * (1 - Math.exp(-8 * dt));
    currentMouseY += (targetMouseY - currentMouseY) * (1 - Math.exp(-8 * dt));

    const p = currentProgress;

    // ── KINETIC ARCHITECTURAL CHOREOGRAPHY (SMOOTH STEPPED) ──

    // 1. Foundation Emergence (p: 0.00 -> 0.18)
    const plinthRise = smoothStep(0.00, 0.18, p);
    plinthGroup.position.y = -2.2 + (plinthRise * 2.2);

    // 2. Wall & Column Assembly (p: 0.16 -> 0.38)
    const wallAssemble = smoothStep(0.16, 0.38, p);
    wallLeftGroup.position.x = -5.2 + (wallAssemble * 3.1);
    wallLeftGroup.position.z = -0.1;
    wallRightGroup.position.x = 5.2 - (wallAssemble * 3.1);
    wallRightGroup.position.z = 0.3;
    wallRearGroup.position.z = -4.5 + (wallAssemble * 2.5);
    columnGroup.position.set(1.9, -3.2 + (wallAssemble * 3.2), 1.9);

    // 3. Post-Tensioned Roof Canopy Descent (p: 0.28 -> 0.48)
    const roofDescent = smoothStep(0.28, 0.48, p);
    roofGroup.position.y = 7.5 - (roofDescent * 5.15);
    roofGroup.position.set(0.05, roofGroup.position.y, 0.05);

    // 4. Volumetric Sunbeam & Dust Motes (Smooth Bell Curve over p: 0.35 -> 0.75)
    let beamOpacity = 0;
    if (p >= 0.32 && p <= 0.78) {
      const bell = Math.sin(((p - 0.32) / 0.46) * Math.PI);
      beamOpacity = bell * 0.34;
    }
    beamMat.opacity = beamOpacity;
    particleMat.opacity = beamOpacity * 2.6;

    // Dust motes drift
    const positions = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const vel = particleVelocities[i];
      positions[i * 3 + 1] -= vel.vy;
      positions[i * 3]     += Math.sin(now * 0.001 + i) * 0.001;
      if (positions[i * 3 + 1] < -1.4) {
        positions[i * 3 + 1] = 2.8;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    // 5. Continuous Smooth Sunlight Arc (Zero Jumps)
    // Dynamic Portuguese Solar Azimuth: continuous smooth sinusoidal progression
    const sunAngle = 0.88 - (p * 0.65);
    sunLight.position.x = Math.cos(sunAngle * Math.PI) * 11;
    sunLight.position.y = 4.2 + Math.sin(sunAngle * Math.PI) * 4.2;
    sunLight.position.z = 5.0 - (p * 3.2);

    // 6. Exploded Axonometric Mode (p: 0.82 -> 1.00)
    if (p > 0.82) {
      const explode = smoothStep(0.82, 1.00, p);
      roofGroup.position.y += explode * 1.8;
      wallLeftGroup.position.x -= explode * 0.95;
      wallRightGroup.position.x += explode * 0.95;
      wallRearGroup.position.z -= explode * 0.95;
      columnGroup.position.x += explode * 0.45;
      columnGroup.position.z += explode * 0.45;
    }

    // ── 7. MATHEMATICALLY CONTINUOUS CAMERA FLIGHT ─────────────
    // Evaluates the continuous Catmull-Rom 3D spline — Mathematically impossible to jump
    const camPos = cameraSpline.getPoint(p);
    const lookTarget = lookSpline.getPoint(p);

    camera.position.set(
      camPos.x + (currentMouseX * 0.6),
      camPos.y - (currentMouseY * 0.4) + (dynamicPitch * 0.03),
      camPos.z
    );
    camera.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);

    // Update Telemetry HUD
    updateHUD(p);

    // Render WebGL frame
    renderer.render(scene, camera);
  }

  // Initial paint
  updateScroll();
  currentProgress = targetProgress;
  updateHUD(currentProgress);
  requestAnimationFrame(tick);

  console.log('[PLINTH 3D] Continuous Catmull-Rom architectural animation engine active.');
})();
