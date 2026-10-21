/**
 * ══════════════════════════════════════════════════════════════════════════
 * PLINTH — 5-House Cinematic 3D Architectural Scrollytelling Engine
 * Continuous Camera Flight across 5 Distinct Architectural Commissions:
 * 01. Casa Mouraria (Lisbon Residential Hillside)
 * 02. Biblioteca Central (Porto Brutalist Civic Hall)
 * 03. Pátio das Flores (Évora Heritage Cloister)
 * 04. Edifício Vento (Cascais Marine Atrium)
 * 05. Pavilhão Sereno (Alentejo Horizon Canopy)
 * 
 * ZERO CARDS — Pure 3D Assembly + Floating Kinetic Typography
 * 120fps GPU Rendering · Continuous Catmull-Rom Mathematical Spline
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.error('[PLINTH 3D] Three.js library not detected.');
    return;
  }

  const canvas = document.getElementById('architectural-3d-canvas');
  const track = document.getElementById('hero-scrolly') || document.getElementById('spatial-flight-track');
  if (!canvas || !track) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. PROCEDURAL TEXTURES (ZERO LATENCY) ─────────────────
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

    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }

  function createTerracottaTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 1024;
    const ctx = cvs.getContext('2d');

    // Warm terracotta red-orange clay
    ctx.fillStyle = '#42281E';
    ctx.fillRect(0, 0, 1024, 1024);

    // Tile grid lines
    const tileSize = 64;
    ctx.strokeStyle = 'rgba(20, 12, 10, 0.7)';
    ctx.lineWidth = 3;
    for (let x = 0; x < 1024; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y < 1024; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  const concreteTex = createConcreteTexture();
  const travertineTex = createTravertineTexture();
  const terracottaTex = createTerracottaTexture();

  // ── 2. SCENE, CAMERA & RENDERER SETUP ──────────────────────
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x09090B, 26, 85);

  // 45° architectural Leica perspective pulled back for heroic wide-angle composition
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 450);
  camera.position.set(9.0, 5.2, 16.0);

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

  // ── 3. MATERIALS ───────────────────────────────────────────
  const concreteMat = new THREE.MeshStandardMaterial({
    map: concreteTex,
    color: 0xE2DDD5,
    roughness: 0.88,
    metalness: 0.08,
    bumpMap: concreteTex,
    bumpScale: 0.03
  });

  const travertineMat = new THREE.MeshStandardMaterial({
    map: travertineTex,
    color: 0xF3EFE6,
    roughness: 0.65,
    metalness: 0.05
  });

  const terracottaMat = new THREE.MeshStandardMaterial({
    map: terracottaTex,
    color: 0xB56548,
    roughness: 0.82,
    metalness: 0.04
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

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x88CCEE,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.7,
    ior: 1.5
  });

  const cadLineMat = new THREE.LineBasicMaterial({
    color: 0xC4A675,
    transparent: true,
    opacity: 0.55
  });

  function addEdges(mesh, mat = cadLineMat) {
    const edges = new THREE.EdgesGeometry(mesh.geometry, 28);
    const line = new THREE.LineSegments(edges, mat);
    mesh.add(line);
    return line;
  }

  function smoothStep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  // ── 4. CONTINUOUS GROUND PLANE & GRIDS ─────────────────────
  // Vast basalt bedrock terrain stretching across the entire flight (Z = +25 to Z = -380)
  const groundGeo = new THREE.BoxGeometry(70, 0.4, 450);
  const groundMesh = new THREE.Mesh(groundGeo, basaltMat);
  groundMesh.position.set(0, -1.8, -160);
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  const gridHelper = new THREE.GridHelper(450, 150, 0xC4A675, 0x222120);
  gridHelper.position.set(0, -1.58, -160);
  scene.add(gridHelper);

  // ══════════════════════════════════════════════════════════
  // 5 DISTINCT ARCHITECTURAL HOUSES
  // ══════════════════════════════════════════════════════════

  // ── HOUSE 1: CASA MOURARIA (at Z = 0) ──────────────────────
  const house1 = new THREE.Group();
  house1.position.set(1.4, -0.2, 0);

  const h1_plinth1 = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.35, 5.6), travertineMat);
  h1_plinth1.position.set(0, -1.4, 0);
  h1_plinth1.receiveShadow = true;
  h1_plinth1.castShadow = true;
  addEdges(h1_plinth1);
  house1.add(h1_plinth1);

  const h1_plinth2 = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.35, 4.6), concreteMat);
  h1_plinth2.position.set(0, -1.05, 0);
  h1_plinth2.receiveShadow = true;
  addEdges(h1_plinth2);
  house1.add(h1_plinth2);

  const h1_wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 4.4), concreteMat);
  h1_wallLeft.position.set(-2.1, 0.75, 0);
  h1_wallLeft.castShadow = true;
  h1_wallLeft.receiveShadow = true;
  addEdges(h1_wallLeft);
  house1.add(h1_wallLeft);

  const h1_wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 3.6), concreteMat);
  h1_wallRight.position.set(2.1, 0.75, 0.3);
  h1_wallRight.castShadow = true;
  addEdges(h1_wallRight);
  house1.add(h1_wallRight);

  const h1_wallRear = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, 0.45), concreteMat);
  h1_wallRear.position.set(0, 0.75, -2.0);
  h1_wallRear.castShadow = true;
  addEdges(h1_wallRear);
  house1.add(h1_wallRear);

  const h1_column = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 32), brassMat);
  h1_column.position.set(1.9, 0.75, 1.9);
  h1_column.castShadow = true;
  house1.add(h1_column);

  const h1_roof = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.32, 5.2), concreteMat);
  h1_roof.position.set(0, 2.35, 0);
  h1_roof.castShadow = true;
  addEdges(h1_roof);
  house1.add(h1_roof);

  const h1_bench = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 0.75), travertineMat);
  h1_bench.position.set(-0.6, -0.7, -0.5);
  h1_bench.castShadow = true;
  addEdges(h1_bench);
  house1.add(h1_bench);

  // Volumetric Sunbeam & Dust Particles
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
  house1.add(sunBeam);

  const particleCount = 1200;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i]     = (Math.random() - 0.5) * 4.5;
    particlePositions[i + 1] = (Math.random() - 0.5) * 4.0 + 0.5;
    particlePositions[i + 2] = (Math.random() - 0.5) * 4.5;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.035,
    color: 0xFFD89B,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending
  });
  const dustMotes = new THREE.Points(particleGeo, particleMat);
  house1.add(dustMotes);

  scene.add(house1);


  // ── HOUSE 2: BIBLIOTECA CENTRAL (at Z = -80) ───────────────
  const house2 = new THREE.Group();
  house2.position.set(0, -0.2, -80);

  // Monumental Pozzolanic Concrete Base
  const h2_base = new THREE.Mesh(new THREE.BoxGeometry(11, 0.4, 9), concreteMat);
  h2_base.position.set(0, -1.2, 0);
  h2_base.receiveShadow = true;
  addEdges(h2_base);
  house2.add(h2_base);

  // Brutalist Coffered Ceiling Matrix (4 x 3 recessed square bays)
  const h2_ceilingSlab = new THREE.Mesh(new THREE.BoxGeometry(11, 0.45, 9), concreteMat);
  h2_ceilingSlab.position.set(0, 3.4, 0);
  h2_ceilingSlab.castShadow = true;
  addEdges(h2_ceilingSlab);
  house2.add(h2_ceilingSlab);

  for (let cx = -3.5; cx <= 3.5; cx += 2.4) {
    for (let cz = -2.6; cz <= 2.6; cz += 2.6) {
      const coffer = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 1.8), concreteMat);
      coffer.position.set(cx, 3.2, cz);
      addEdges(coffer);
      house2.add(coffer);
    }
  }

  // 4 Monumental Concrete Columns
  const colPositions = [
    [-4.5, -3.2], [4.5, -3.2],
    [-4.5,  3.2], [4.5,  3.2]
  ];
  const h2_cols = [];
  colPositions.forEach(([x, z]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.4, 0.7), concreteMat);
    col.position.set(x, 1.1, z);
    col.castShadow = true;
    col.receiveShadow = true;
    addEdges(col);
    house2.add(col);
    h2_cols.push(col);
  });

  // Long Dark Walnut Reading Tables
  [-2.2, 2.2].forEach(x => {
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 5.5), travertineMat);
    table.position.set(x, -0.45, 0);
    table.castShadow = true;
    addEdges(table);
    house2.add(table);

    // Brass task lamp stem
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), brassMat);
    lamp.position.set(x, -0.1, 0);
    house2.add(lamp);
  });

  scene.add(house2);


  // ── HOUSE 3: PÁTIO DAS FLORES (at Z = -160) ─────────────────
  const house3 = new THREE.Group();
  house3.position.set(0, -0.2, -160);

  // Terracotta Hexagonal Courtyard Floor
  const h3_floor = new THREE.Mesh(new THREE.BoxGeometry(11, 0.25, 11), terracottaMat);
  h3_floor.position.set(0, -1.3, 0);
  h3_floor.receiveShadow = true;
  addEdges(h3_floor);
  house3.add(h3_floor);

  // Monolithic Limestone Archway Portico (Columns + Lintels forming Romanesque cloister)
  const h3_portico = new THREE.Group();
  for (let ax = -4.0; ax <= 4.0; ax += 2.6) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.4, 0.5), travertineMat);
    pillar.position.set(ax, 0.5, -4.5);
    pillar.castShadow = true;
    addEdges(pillar);
    h3_portico.add(pillar);
  }
  const archBeam = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.45, 0.6), travertineMat);
  archBeam.position.set(0, 2.3, -4.5);
  archBeam.castShadow = true;
  addEdges(archBeam);
  h3_portico.add(archBeam);

  // Side perimeter walls
  const wallS1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.8, 9.0), travertineMat);
  wallS1.position.set(-4.5, 0.2, 0);
  wallS1.castShadow = true;
  addEdges(wallS1);
  h3_portico.add(wallS1);

  const wallS2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.8, 9.0), travertineMat);
  wallS2.position.set(4.5, 0.2, 0);
  wallS2.castShadow = true;
  addEdges(wallS2);
  h3_portico.add(wallS2);

  // Solitary Dark Bronze Planter & Fig Tree Marker
  const planter = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 0.65, 16), brassMat);
  planter.position.set(0, -0.9, 0);
  planter.castShadow = true;
  h3_portico.add(planter);

  house3.add(h3_portico);
  scene.add(house3);


  // ── HOUSE 4: EDIFÍCIO VENTO (at Z = -240) ──────────────────
  const house4 = new THREE.Group();
  house4.position.set(0, -0.2, -240);

  // Basalt Atrium Ground
  const h4_floor = new THREE.Mesh(new THREE.BoxGeometry(11, 0.3, 9), concreteMat);
  h4_floor.position.set(0, -1.2, 0);
  h4_floor.receiveShadow = true;
  addEdges(h4_floor);
  house4.add(h4_floor);

  // Double-Height Glass Curtain Facade
  const h4_glass = new THREE.Mesh(new THREE.BoxGeometry(10.5, 4.8, 0.08), glassMat);
  h4_glass.position.set(0, 1.4, -4.2);
  house4.add(h4_glass);

  // Steel Mullions
  for (let mx = -4.5; mx <= 4.5; mx += 1.8) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.8, 0.15), basaltMat);
    mullion.position.set(mx, 1.4, -4.2);
    house4.add(mullion);
  }

  // Mezzanine Walkway Bridge spanning across at y = 1.6
  const h4_bridge = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.22, 1.4), concreteMat);
  h4_bridge.position.set(0, 1.4, 0);
  h4_bridge.castShadow = true;
  addEdges(h4_bridge);
  house4.add(h4_bridge);

  // Angled Aerodynamic Louvers (Passive Stack Ventilation Fins)
  for (let lx = -4.0; lx <= 4.0; lx += 1.2) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.6, 0.6), travertineMat);
    fin.position.set(lx, 1.4, 4.2);
    fin.rotation.y = 0.55;
    fin.castShadow = true;
    house4.add(fin);
  }

  // Roof Cap
  const h4_roof = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.35, 9.4), concreteMat);
  h4_roof.position.set(0, 3.8, 0);
  addEdges(h4_roof);
  house4.add(h4_roof);

  scene.add(house4);


  // ── HOUSE 5: PAVILHÃO SERENO (at Z = -320) ─────────────────
  const house5 = new THREE.Group();
  house5.position.set(0, -0.2, -320);

  // Open Horizon Meadow Floor
  const h5_floor = new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 16), basaltMat);
  h5_floor.position.set(0, -1.3, 0);
  h5_floor.receiveShadow = true;
  house5.add(h5_floor);

  // Razor-Thin Post-Tensioned Concrete Roof Canopy
  const h5_canopy = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.16, 7.0), concreteMat);
  h5_canopy.position.set(0, 2.4, 0);
  h5_canopy.castShadow = true;
  addEdges(h5_canopy);
  house5.add(h5_canopy);

  // 4 Ultra-Slender Cylindrical Brass Columns
  const h5_cols = [
    [-3.8, -2.8], [3.8, -2.8],
    [-3.8,  2.8], [3.8,  2.8]
  ];
  h5_cols.forEach(([x, z]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.6, 32), brassMat);
    col.position.set(x, 0.6, z);
    col.castShadow = true;
    house5.add(col);
  });

  // Low Minimalist Horizon Bench
  const h5_bench = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.22, 0.7), travertineMat);
  h5_bench.position.set(0, -0.9, 0);
  h5_bench.castShadow = true;
  addEdges(h5_bench);
  house5.add(h5_bench);

  scene.add(house5);

  // ── 5. LIGHTING ────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0x0C0B0A, 1.4);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xFFE8D0, 4.2);
  sunLight.position.set(18, 14, 25);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 1.0;
  sunLight.shadow.camera.far = 450;
  sunLight.shadow.camera.left = -35;
  sunLight.shadow.camera.right = 35;
  sunLight.shadow.camera.top = 35;
  sunLight.shadow.camera.bottom = -35;
  sunLight.shadow.bias = -0.0003;
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0xC4A675, 1.2);
  rimLight.position.set(-15, 8, -120);
  scene.add(rimLight);

  // ── 6. CONTINUOUS CATMULL-ROM CAMERA FLIGHT SPLINE ─────────
  // Elevated, pulled-back wide-angle framing (18m–24m distance) across all 5 houses
  const cameraSplinePoints = [
    new THREE.Vector3(  8.5, 4.8,   17.0), // 0.00 - House 1: Wide frontal-three-quarter approach (Z = 0)
    new THREE.Vector3( 10.5, 4.4,   13.5), // 0.08 - House 1: Assembled, sunlight framing
    new THREE.Vector3(  7.5, 5.2,    6.0), // 0.16 - House 1: Elevation view
    new THREE.Vector3(  5.0, 7.5,  -35.0), // 0.22 - Flight across landscape towards House 2
    new THREE.Vector3(-12.0, 5.8,  -62.0), // 0.28 - House 2: Wide coffered ceiling and columns (Z = -80)
    new THREE.Vector3( -9.5, 4.8,  -66.0), // 0.34 - House 2: Reading tables & clerestory
    new THREE.Vector3( -4.0, 8.0, -115.0), // 0.42 - Flight across landscape towards House 3
    new THREE.Vector3( 13.0, 6.0, -142.0), // 0.48 - House 3: Terracotta cloister & limestone arches (Z = -160)
    new THREE.Vector3( 10.5, 5.0, -146.0), // 0.54 - House 3: Sun-dappled courtyard perspective
    new THREE.Vector3(  5.0, 8.2, -195.0), // 0.62 - Flight across landscape towards House 4
    new THREE.Vector3(-13.5, 6.2, -222.0), // 0.68 - House 4: Atrium bridge & glass curtain facade (Z = -240)
    new THREE.Vector3(-10.0, 5.2, -226.0), // 0.74 - House 4: Aerodynamic louvers & mezzanine
    new THREE.Vector3( -3.0, 8.5, -275.0), // 0.82 - Flight across landscape towards House 5
    new THREE.Vector3( 14.0, 5.8, -302.0), // 0.88 - House 5: Razor-thin canopy on brass columns (Z = -320)
    new THREE.Vector3( 11.0, 5.0, -306.0), // 0.94 - House 5: Horizon meadow & minimal bench
    new THREE.Vector3( 14.5, 8.5, -300.0)  // 1.00 - House 5: Heroic elevated horizon twilight view
  ];
  const cameraSpline = new THREE.CatmullRomCurve3(cameraSplinePoints, false, 'catmullrom', 0.5);

  const lookSplinePoints = [
    new THREE.Vector3( 0.8, 0.6,    0.0), // House 1
    new THREE.Vector3( 0.8, 0.8,    0.0), // House 1
    new THREE.Vector3( 0.8, 0.8,    0.0), // House 1
    new THREE.Vector3( 0.0, 1.0,  -80.0), // Transition
    new THREE.Vector3( 0.0, 1.0,  -80.0), // House 2
    new THREE.Vector3( 0.0, 1.2,  -80.0), // House 2
    new THREE.Vector3( 0.0, 1.0, -160.0), // Transition
    new THREE.Vector3( 0.0, 0.8, -160.0), // House 3
    new THREE.Vector3( 0.0, 1.0, -160.0), // House 3
    new THREE.Vector3( 0.0, 1.2, -240.0), // Transition
    new THREE.Vector3( 0.0, 1.2, -240.0), // House 4
    new THREE.Vector3( 0.0, 1.4, -240.0), // House 4
    new THREE.Vector3( 0.0, 1.0, -320.0), // Transition
    new THREE.Vector3( 0.0, 0.8, -320.0), // House 5
    new THREE.Vector3( 0.0, 1.0, -320.0), // House 5
    new THREE.Vector3( 0.0, 0.6, -320.0)  // House 5
  ];
  const lookSpline = new THREE.CatmullRomCurve3(lookSplinePoints, false, 'catmullrom', 0.5);

  // ── 7. SCROLL INTERPOLATION & MOTION PHYSICS ───────────────
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

  // ── 8. KINETIC TYPOGRAPHY OVERLAYS (ZERO CARDS) ────────────
  const titleCards = document.querySelectorAll('.house-title-card');
  const hudProgressFill = document.getElementById('hud-progress-fill');
  const hudProgressText = document.getElementById('hud-progress-text');
  const phaseDots = document.querySelectorAll('.hud-dot-btn');

  function updateTypography(p) {
    if (hudProgressFill) hudProgressFill.style.width = `${(p * 100).toFixed(1)}%`;
    if (hudProgressText) hudProgressText.textContent = `${String(Math.round(p * 100)).padStart(2, '0')}%`;

    // 5 House Ranges:
    // House 1: [0.00, 0.20]
    // House 2: [0.20, 0.40]
    // House 3: [0.40, 0.60]
    // House 4: [0.60, 0.80]
    // House 5: [0.80, 1.00]
    let activeHouse = 1;
    if (p >= 0.80) activeHouse = 5;
    else if (p >= 0.60) activeHouse = 4;
    else if (p >= 0.40) activeHouse = 3;
    else if (p >= 0.20) activeHouse = 2;
    else activeHouse = 1;

    titleCards.forEach(card => {
      const hNum = parseInt(card.getAttribute('data-house'), 10);
      card.classList.toggle('is-active', hNum === activeHouse);
    });

    phaseDots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx + 1 === activeHouse);
    });
  }

  phaseDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetP = parseFloat(dot.getAttribute('data-phase') || '0');
      const totalDist = track.offsetHeight - window.innerHeight;
      const targetScroll = track.offsetTop + (targetP * totalDist);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  });

  // ── 9. MAIN RENDER LOOP (120FPS GPU COMPOSITING) ───────────
  function tick(now) {
    requestAnimationFrame(tick);

    const dt = Math.min((now - lastTime) / 1000, 0.08);
    lastTime = now;

    const decay = prefersReduced ? 30.0 : 5.5;
    const lerpAlpha = 1 - Math.exp(-decay * dt);

    const prevP = currentProgress;
    currentProgress += (targetProgress - currentProgress) * lerpAlpha;

    const velocity = (currentProgress - prevP) / (dt || 0.016);
    const dynamicPitch = Math.max(-4, Math.min(4, velocity * -1.2));

    currentMouseX += (targetMouseX - currentMouseX) * (1 - Math.exp(-8 * dt));
    currentMouseY += (targetMouseY - currentMouseY) * (1 - Math.exp(-8 * dt));

    const p = currentProgress;

    // ── STRICT ISOLATION: NEVER RENDER ANOTHER HOUSE SIMULTANEOUSLY ──
    house1.visible = (p < 0.20);
    house2.visible = (p >= 0.18 && p < 0.40);
    house3.visible = (p >= 0.38 && p < 0.60);
    house4.visible = (p >= 0.58 && p < 0.80);
    house5.visible = (p >= 0.78);

    // ── KINETIC ASSEMBLY OF EACH HOUSE AS CAMERA APPROACHES ──

    // House 1 Assembly (p: 0.00 -> 0.12)
    const h1_rise = smoothStep(0.00, 0.10, p);
    h1_plinth1.position.y = -2.2 + (h1_rise * 0.8);
    h1_wallLeft.position.x = -4.5 + (h1_rise * 2.4);
    h1_wallRight.position.x = 4.5 - (h1_rise * 2.4);
    const h1_roofDesc = smoothStep(0.04, 0.12, p);
    h1_roof.position.y = 6.5 - (h1_roofDesc * 4.15);

    // House 1 Sunbeam (peaks around p = 0.08)
    let b1 = 0;
    if (p <= 0.18) {
      b1 = Math.sin((p / 0.18) * Math.PI) * 0.32;
    }
    beamMat.opacity = b1;
    particleMat.opacity = b1 * 2.5;

    // House 2 Assembly (p: 0.20 -> 0.32)
    const h2_grow = smoothStep(0.20, 0.30, p);
    h2_base.position.y = -2.4 + (h2_grow * 1.2);
    h2_cols.forEach(col => {
      col.scale.y = Math.max(0.01, h2_grow);
    });
    const h2_ceil = smoothStep(0.24, 0.32, p);
    h2_ceilingSlab.position.y = 6.8 - (h2_ceil * 3.4);

    // House 3 Assembly (p: 0.40 -> 0.52)
    const h3_grow = smoothStep(0.40, 0.50, p);
    h3_floor.position.y = -2.5 + (h3_grow * 1.2);
    h3_portico.position.y = -3.0 + (h3_grow * 3.0);

    // House 4 Assembly (p: 0.60 -> 0.72)
    const h4_grow = smoothStep(0.60, 0.70, p);
    h4_bridge.position.x = -6.0 + (h4_grow * 6.0);
    h4_roof.position.y = 7.2 - (h4_grow * 3.4);

    // House 5 Assembly (p: 0.80 -> 0.92)
    const h5_grow = smoothStep(0.80, 0.90, p);
    h5_canopy.position.y = 6.8 - (h5_grow * 4.4);

    // Dynamic Sunlight sweeps across the terrain as camera moves down Z
    sunLight.position.z = 25 - (p * 370);
    sunLight.position.x = 18 + Math.sin(p * Math.PI * 4) * 8;

    // ── CONTINUOUS MATHEMATICAL CAMERA FLIGHT ────────────────
    const camPos = cameraSpline.getPoint(p);
    const lookPos = lookSpline.getPoint(p);

    camera.position.set(
      camPos.x + (currentMouseX * 0.6),
      camPos.y - (currentMouseY * 0.4) + (dynamicPitch * 0.03),
      camPos.z
    );
    camera.lookAt(lookPos.x, lookPos.y, lookPos.z);

    // Update typography overlays
    updateTypography(p);

    renderer.render(scene, camera);
  }

  // Initial paint
  updateScroll();
  currentProgress = targetProgress;
  updateTypography(currentProgress);
  requestAnimationFrame(tick);

  console.log('[PLINTH 3D] 5-House continuous architectural animation active.');
})();
