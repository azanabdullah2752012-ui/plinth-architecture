/**
 * ══════════════════════════════════════════════════════════════════════════
 * PLINTH — Cinematic 3D Architectural Animation Engine (Three.js WebGL)
 * Real Tectonic Construction, Solar Scrubbing, Volumetric God-Rays,
 * and Procedural Material Shaders (Concrete, Travertine, Marine Brass)
 * 120fps GPU Rendering · Zero-Lag Exponential Decay Smoothing
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // Ensure Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.error('[PLINTH 3D] Three.js library not detected.');
    return;
  }

  const canvas = document.getElementById('architectural-3d-canvas');
  const track = document.getElementById('spatial-flight-track');
  if (!canvas || !track) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. PROCEDURAL ARCHITECTURAL TEXTURE GENERATORS ─────────
  // Creates high-resolution organic textures in memory (0 network latency)
  function createConcreteTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 1024;
    const ctx = cvs.getContext('2d');

    // Base warm charcoal concrete
    ctx.fillStyle = '#1C1B19';
    ctx.fillRect(0, 0, 1024, 1024);

    // Board-formed horizontal timber grain bands
    const plankHeight = 96;
    for (let y = 0; y < 1024; y += plankHeight) {
      const plankTone = 24 + Math.floor(Math.random() * 8);
      ctx.fillStyle = `rgb(${plankTone}, ${plankTone - 2}, ${plankTone - 4})`;
      ctx.fillRect(0, y, 1024, plankHeight);

      // Plank seam joint line
      ctx.fillStyle = 'rgba(10, 9, 8, 0.65)';
      ctx.fillRect(0, y, 1024, 3);
      ctx.fillStyle = 'rgba(243, 239, 230, 0.04)';
      ctx.fillRect(0, y + 3, 1024, 1);
    }

    // Micro-aggregate mineral speckles
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

    // Honed warm limestone
    ctx.fillStyle = '#262421';
    ctx.fillRect(0, 0, 1024, 1024);

    // Sedimentary calcitic veining
    for (let i = 0; i < 40; i++) {
      const y = Math.random() * 1024;
      const h = 8 + Math.random() * 24;
      ctx.fillStyle = `rgba(${196 + Math.random() * 30}, ${166 + Math.random() * 30}, ${117 + Math.random() * 20}, ${0.03 + Math.random() * 0.05})`;
      ctx.fillRect(0, y, 1024, h);
    }

    // Mineral pores
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

  // ── 2. WEBGL SCENE, CAMERA & RENDERER SETUP ────────────────
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0C0B0A, 0.014); // Gentle atmospheric haze with expansive depth

  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 3.2, 18.0);

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

  // ── 3. ARCHITECTURAL PBR MATERIALS ─────────────────────────
  // Board-Formed In-Situ Concrete
  const concreteMat = new THREE.MeshStandardMaterial({
    map: concreteTex,
    color: 0xE0DBD2,
    roughness: 0.88,
    metalness: 0.08,
    bumpMap: concreteTex,
    bumpScale: 0.035
  });

  // Honed Travertine / Limestone
  const travertineMat = new THREE.MeshStandardMaterial({
    map: travertineTex,
    color: 0xF3EFE6,
    roughness: 0.65,
    metalness: 0.05,
    bumpMap: travertineTex,
    bumpScale: 0.02
  });

  // Weathered Marine Architectural Brass
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xC4A675,
    roughness: 0.35,
    metalness: 0.85
  });

  // Deep Basalt Bedrock Ground
  const basaltMat = new THREE.MeshStandardMaterial({
    color: 0x11100F,
    roughness: 0.95,
    metalness: 0.1
  });

  // CAD Blueprint Vector Line Highlight Material
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

  // ── 4. KINETIC ARCHITECTURAL STRUCTURE (THE PLINTH) ─────────
  const architectureRoot = new THREE.Group();
  scene.add(architectureRoot);

  // 4a. Basalt Bedrock Foundation Slab
  const bedrockGeo = new THREE.BoxGeometry(18, 0.5, 18);
  const bedrockMesh = new THREE.Mesh(bedrockGeo, basaltMat);
  bedrockMesh.position.set(0, -1.85, 0);
  bedrockMesh.receiveShadow = true;
  architectureRoot.add(bedrockMesh);

  // 4b. Laser CAD Coordinate Datum Grid
  const gridHelper = new THREE.GridHelper(16, 32, 0xC4A675, 0x262320);
  gridHelper.position.set(0, -1.58, 0);
  architectureRoot.add(gridHelper);

  // 4c. Stepped Monolithic Plinth (Excavation Group)
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

  // 4d. Left Monolithic Concrete Shear Wall (with Deep Portal Cutout)
  const wallLeftGroup = new THREE.Group();
  const wallLeftMain = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 4.4), concreteMat);
  wallLeftMain.position.set(0, 0.75, 0);
  wallLeftMain.castShadow = true;
  wallLeftMain.receiveShadow = true;
  addEdges(wallLeftMain);
  wallLeftGroup.add(wallLeftMain);
  architectureRoot.add(wallLeftGroup);

  // 4e. Right Monolithic Concrete Shear Wall
  const wallRightGroup = new THREE.Group();
  const wallRightMain = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 3.6), concreteMat);
  wallRightMain.position.set(0, 0.75, 0);
  wallRightMain.castShadow = true;
  wallRightMain.receiveShadow = true;
  addEdges(wallRightMain);
  wallRightGroup.add(wallRightMain);
  architectureRoot.add(wallRightGroup);

  // 4f. Rear Monolith with Clerestory Light Slit
  const wallRearGroup = new THREE.Group();
  const wallRearMain = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, 0.45), concreteMat);
  wallRearMain.position.set(0, 0.75, 0);
  wallRearMain.castShadow = true;
  wallRearMain.receiveShadow = true;
  addEdges(wallRearMain);
  wallRearGroup.add(wallRearMain);
  architectureRoot.add(wallRearGroup);

  // 4g. Slender Marine Brass Column
  const columnGroup = new THREE.Group();
  const columnCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 32), brassMat);
  columnCylinder.position.set(0, 0.75, 0);
  columnCylinder.castShadow = true;
  columnGroup.add(columnCylinder);

  const columnBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.3), brassMat);
  columnBase.position.set(0, -0.85, 0);
  columnGroup.add(columnBase);
  architectureRoot.add(columnGroup);

  // 4h. Monumental Post-Tensioned Cantilever Roof Slab
  const roofGroup = new THREE.Group();
  const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.32, 5.2), concreteMat);
  roofMesh.position.set(0, 0, 0);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  addEdges(roofMesh, cadLaserMat);
  roofGroup.add(roofMesh);
  architectureRoot.add(roofGroup);

  // 4i. Interior Travertine Altar / Reading Bench
  const benchGroup = new THREE.Group();
  const benchMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 0.75), travertineMat);
  benchMesh.position.set(-0.6, -0.7, -0.5);
  benchMesh.castShadow = true;
  benchMesh.receiveShadow = true;
  addEdges(benchMesh);
  benchGroup.add(benchMesh);
  architectureRoot.add(benchGroup);

  // 4j. Volumetric Sunlight Cone (God-Ray)
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

  // 4k. Floating Golden Dust Motes in the Sunbeam
  const particleCount = 2000;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  for (let i = 0; i < particleCount; i++) {
    const px = (Math.random() - 0.5) * 4.5;
    const py = (Math.random() - 0.5) * 4.0 + 0.5;
    const pz = (Math.random() - 0.5) * 4.5;
    particlePositions[i * 3]     = px;
    particlePositions[i * 3 + 1] = py;
    particlePositions[i * 3 + 2] = pz;
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

  // ── 5. DIRECTIONAL VOLUMETRIC LIGHTING ─────────────────────
  const ambientLight = new THREE.AmbientLight(0x0C0B0A, 1.2);
  scene.add(ambientLight);

  // Primary Raking Sunlight (Dynamic Portuguese Azimuth)
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

  // Rim Fill Light on Brass & Concrete chamfers
  const rimLight = new THREE.DirectionalLight(0xC4A675, 1.4);
  rimLight.position.set(-6, 3, -4);
  scene.add(rimLight);

  // ── 6. SCROLL INTERPOLATION & MOTION PHYSICS ───────────────
  let targetProgress = 0;
  let currentProgress = 0;
  let lastTime = performance.now();

  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  function updateScroll() {
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
    updateScroll();
  });

  window.addEventListener('mousemove', (e) => {
    if (prefersReduced) return;
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── 7. HUD TELEMETRY CONTROLLER ────────────────────────────
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

  const phaseStages = [
    {
      range: [0.0, 0.22],
      code: '[ PHASE 01 / EXCAVATION ]',
      sub: 'BEDROCK BASALT DATUM ±0.00M',
      title: 'Excavating<br><em>the bedrock.</em>',
      desc: 'Every commission begins with geological excavation. The stepped stone plinth anchors directly into coastal basalt bedrock.',
      sun: '65.0° N',
      span: '14.80 m',
      load: 'Bedrock Datum ±0.00m',
      mat: 'Basalt & Travertine',
      link: 'projects/casa-mouraria.html',
      linkText: 'Explore Casa Mouraria Folio [PL-01] →'
    },
    {
      range: [0.22, 0.48],
      code: '[ PHASE 02 / ASSEMBLY ]',
      sub: 'IN-SITU CONCRETE SHEAR WALLS',
      title: 'Tectonic mass<br><em>locks into place.</em>',
      desc: 'Board-formed in-situ concrete walls slide into precision structural tracks. Thick mineral mass designed to breathe with Atlantic humidity.',
      sun: '54.2° W',
      span: '14.80 m',
      load: 'Compression 45.0 MPa',
      mat: 'Pozzolanic Concrete',
      link: 'projects/biblioteca-central.html',
      linkText: 'Explore Biblioteca Central Folio [PL-02] →'
    },
    {
      range: [0.48, 0.72],
      code: '[ PHASE 03 / CANTILEVER ]',
      sub: '14.8M POST-TENSIONED CANOPY',
      title: 'The canopy descends<br><em>into silence.</em>',
      desc: 'The monolithic concrete roof descends from high altitude, docking onto the shear walls and slender brass column to define the central light court.',
      sun: '42.0° SW',
      span: '14.80 m Cantilever',
      load: 'Hydraulic Tension Balanced',
      mat: 'Post-Tensioned Slab',
      link: 'projects/patio-flores.html',
      linkText: 'Explore Pátio das Flores Folio [PL-03] →'
    },
    {
      range: [0.72, 0.90],
      code: '[ PHASE 04 / SOLAR MECHANICS ]',
      sub: 'VOLUMETRIC AFTERNOON LIGHT BEAM',
      title: 'Carved by<br><em>afternoon light.</em>',
      desc: 'Low Portuguese sunlight rakes across the clerestory slit at 28° azimuth, igniting suspended golden dust particles and casting 8-meter shadows.',
      sun: '28.4° Low Sun (242°)',
      span: 'Internal Light Void',
      load: 'Thermal Mass Activated',
      mat: 'Honed Estremoz Travertine',
      link: 'projects/edificio-vento.html',
      linkText: 'Explore Edifício Vento Folio [PL-04] →'
    },
    {
      range: [0.90, 1.00],
      code: '[ PHASE 05 / AXONOMETRIC ]',
      sub: 'EXPLODED STRUCTURAL TECTONICS',
      title: 'Structural truth<br><em>unfolded.</em>',
      desc: 'The finished architectural monument lifts into an exploded axonometric diagram, displaying internal spatial mechanics before docking into the atelier.',
      sun: 'Solstice Calibrated',
      span: 'Integrated System',
      load: 'Perpetual Gravity Rigor',
      mat: 'Basalt · Concrete · Brass',
      link: 'projects/pavilhao-sereno.html',
      linkText: 'Explore Pavilhão Sereno Folio [PL-05] →'
    }
  ];

  let currentStageIdx = -1;

  function updateHUD(p) {
    if (hudProgressFill) hudProgressFill.style.width = `${(p * 100).toFixed(1)}%`;
    if (hudProgressText) hudProgressText.textContent = `${String(Math.round(p * 100)).padStart(2, '0')}%`;

    // Find active phase
    let activeIdx = phaseStages.findIndex(s => p >= s.range[0] && p <= s.range[1]);
    if (activeIdx === -1) activeIdx = p >= 1 ? phaseStages.length - 1 : 0;

    if (activeIdx !== currentStageIdx) {
      currentStageIdx = activeIdx;
      const stage = phaseStages[activeIdx];

      if (hudPhaseCode) hudPhaseCode.textContent = stage.code;
      if (hudPhaseSub) hudPhaseSub.textContent = stage.sub;
      if (hudStageTitle) hudStageTitle.innerHTML = stage.title;
      if (hudStageDesc) hudStageDesc.textContent = stage.desc;
      if (hudValSun) hudValSun.textContent = stage.sun;
      if (hudValSpan) hudValSpan.textContent = stage.span;
      if (hudValLoad) hudValLoad.textContent = stage.load;
      if (hudValMat) hudValMat.textContent = stage.mat;
      if (hudPortalLink) {
        hudPortalLink.setAttribute('href', stage.link);
        hudPortalLink.innerHTML = `<span>${stage.linkText}</span>`;
      }

      phaseDots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === activeIdx);
      });
    }
  }

  // Interactive Phase Click Buttons
  phaseDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetP = parseFloat(dot.getAttribute('data-phase') || '0');
      const rect = track.getBoundingClientRect();
      const totalDist = rect.height - window.innerHeight;
      const targetScroll = track.offsetTop + targetP * totalDist;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  });

  // ── 8. MAIN 120fps ANIMATION LOOP (CHOREOGRAPHY) ───────────
  function tick(now) {
    requestAnimationFrame(tick);

    const dt = Math.min((now - lastTime) / 1000, 0.08);
    lastTime = now;

    // Frame-rate independent exponential decay smoothing
    const decay = prefersReduced ? 30.0 : 9.5;
    const lerpAlpha = 1 - Math.exp(-decay * dt);

    const prevP = currentProgress;
    currentProgress += (targetProgress - currentProgress) * lerpAlpha;

    // Inertia tilt from scroll velocity
    const velocity = (currentProgress - prevP) / (dt || 0.016);
    const dynamicPitch = Math.max(-6, Math.min(6, velocity * -1.8));

    // Mouse parallax lerp
    currentMouseX += (targetMouseX - currentMouseX) * (1 - Math.exp(-8 * dt));
    currentMouseY += (targetMouseY - currentMouseY) * (1 - Math.exp(-8 * dt));

    const p = currentProgress;

    // ── KINETIC ARCHITECTURAL CHOREOGRAPHY ─────────────────────

    // 1. Foundation Emergence (p: 0.0 -> 0.22)
    const plinthRise = Math.min(1, Math.max(0, p / 0.22));
    plinthGroup.position.y = -2.2 + (plinthRise * 2.2);

    // 2. Wall & Column Assembly (p: 0.20 -> 0.50)
    const wallAssemble = Math.min(1, Math.max(0, (p - 0.20) / 0.28));
    // Left wall slides from x = -5.2 to x = -2.1
    wallLeftGroup.position.x = -5.2 + (wallAssemble * 3.1);
    wallLeftGroup.position.z = -0.1;
    // Right wall slides from x = 5.2 to x = 2.1
    wallRightGroup.position.x = 5.2 - (wallAssemble * 3.1);
    wallRightGroup.position.z = 0.3;
    // Rear wall slides from z = -4.5 to z = -2.0
    wallRearGroup.position.z = -4.5 + (wallAssemble * 2.5);
    // Column rises from ground
    columnGroup.position.set(1.9, -3.2 + (wallAssemble * 3.2), 1.9);

    // 3. Post-Tensioned Roof Descent (p: 0.45 -> 0.72)
    const roofDescent = Math.min(1, Math.max(0, (p - 0.45) / 0.25));
    // Roof descends smoothly from y = 7.5 to y = 2.35
    roofGroup.position.y = 7.5 - (roofDescent * 5.15);
    roofGroup.position.set(0.05, roofGroup.position.y, 0.05);

    // 4. Volumetric Sunbeam & Dust Motes (p: 0.65 -> 0.92)
    let beamOpacity = 0;
    if (p >= 0.60 && p <= 0.95) {
      if (p < 0.75) {
        beamOpacity = (p - 0.60) / 0.15 * 0.32;
      } else if (p > 0.88) {
        beamOpacity = (0.95 - p) / 0.07 * 0.32;
      } else {
        beamOpacity = 0.32;
      }
    }
    beamMat.opacity = beamOpacity;
    particleMat.opacity = beamOpacity * 2.4;

    // Animate golden dust motes drift
    const positions = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const vel = particleVelocities[i];
      positions[i * 3 + 1] -= vel.vy; // Drift gently downward
      positions[i * 3]     += Math.sin(now * 0.001 + i) * 0.001; // Gentle swirl
      if (positions[i * 3 + 1] < -1.4) {
        positions[i * 3 + 1] = 2.8; // Recycle to top
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    // 5. Dynamic Portuguese Solar Azimuth Movement
    // Sun position arcs across the sky from morning raking to low Lisbon golden hour
    const sunAngle = 0.85 - (p * 0.65);
    sunLight.position.x = Math.cos(sunAngle * Math.PI) * 9;
    sunLight.position.y = 4.5 + Math.sin(sunAngle * Math.PI) * 3.5;
    sunLight.position.z = 4.2 - (p * 2.8);

    // 6. Exploded Axonometric Mode (p: 0.88 -> 1.00)
    if (p > 0.88) {
      const explode = (p - 0.88) / 0.12;
      roofGroup.position.y += explode * 1.6;
      wallLeftGroup.position.x -= explode * 0.9;
      wallRightGroup.position.x += explode * 0.9;
      wallRearGroup.position.z -= explode * 0.9;
      columnGroup.position.x += explode * 0.4;
      columnGroup.position.z += explode * 0.4;
    }

    // ── 7. CINEMATIC CAMERA CHOREOGRAPHY (EXPANSIVE BREATHING ROOM) ──
    // Architecture offset: balance right on desktop so HUD on left never overlaps
    const targetOffsetX = window.innerWidth > 960 ? 1.4 : 0.0;
    architectureRoot.position.x = targetOffsetX;
    architectureRoot.position.y = -0.3;

    // Camera stays pulled back at a comfortable architectural viewing distance (~16m - 18.5m)
    // Never suffocates or crops the structure; framed with generous negative space
    let camX, camY, camZ, lookX, lookY, lookZ;

    if (p < 0.25) {
      // Stage 1: Expansive establishing perspective of the bedrock foundation
      const t = p / 0.25;
      camX = targetOffsetX + (currentMouseX * 0.7);
      camY = 2.8 + (t * 0.8) - (currentMouseY * 0.4);
      camZ = 18.5 - (t * 1.5);
      lookX = targetOffsetX;
      lookY = 0.4;
      lookZ = 0;
    } else if (p < 0.50) {
      // Stage 2: Smooth architectural crane orbit as walls & column assemble
      const t = (p - 0.25) / 0.25;
      const angle = t * 0.65; // Elegant 35-degree sweeping arc
      camX = targetOffsetX + Math.sin(angle) * 8.5 + (currentMouseX * 0.7);
      camY = 3.6 + (Math.sin(t * Math.PI) * 0.8) - (currentMouseY * 0.4);
      camZ = Math.cos(angle) * 17.2;
      lookX = targetOffsetX;
      lookY = 0.6;
      lookZ = 0;
    } else if (p < 0.72) {
      // Stage 3: Elevated perspective framing the roof canopy descending from above
      const t = (p - 0.50) / 0.22;
      camX = targetOffsetX + 5.2 - (t * 2.0) + (currentMouseX * 0.6);
      camY = 4.8 + (t * 0.6) - (currentMouseY * 0.4);
      camZ = 16.5;
      lookX = targetOffsetX;
      lookY = 0.8;
      lookZ = 0;
    } else if (p < 0.88) {
      // Stage 4: Three-quarter profile capturing the full volumetric sunbeam and floor shadow
      const t = (p - 0.72) / 0.16;
      camX = targetOffsetX - 6.2 + (t * 1.5) + (currentMouseX * 0.6);
      camY = 3.2 + (t * 0.5) - (currentMouseY * 0.4);
      camZ = 16.2;
      lookX = targetOffsetX + 0.3;
      lookY = 0.5;
      lookZ = 0;
    } else {
      // Stage 5: Textbook 35° isometric axonometric view of the exploded structure
      const t = (p - 0.88) / 0.12;
      camX = targetOffsetX + 10.5 + (t * 1.5) + (currentMouseX * 0.6);
      camY = 8.5 + (t * 2.0) - (currentMouseY * 0.4);
      camZ = 15.5 + (t * 1.2);
      lookX = targetOffsetX;
      lookY = 0.8;
      lookZ = 0;
    }

    camera.position.set(camX, camY + dynamicPitch * 0.04, camZ);
    camera.lookAt(lookX, lookY, lookZ);

    // Update HUD telemetry
    updateHUD(p);

    // Render WebGL frame
    renderer.render(scene, camera);
  }

  // Initial setup
  updateScroll();
  currentProgress = targetProgress;
  updateHUD(currentProgress);
  requestAnimationFrame(tick);

  console.log('[PLINTH 3D] Real-time WebGL architectural animation engine active.');
})();
