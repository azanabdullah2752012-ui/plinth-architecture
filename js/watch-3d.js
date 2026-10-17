/**
 * KÖNIG & SÖHNE // 3D Caliber KS-042 WebGL Horological Studio
 * Real 3D mechanical watch with PBR metals, sapphire refraction, harmonic balance, and exploded view
 */

class WatchStudio3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(36, this.container.clientWidth / this.container.clientHeight, 0.1, 50);
    this.camera.position.set(0, 0.2, 4.4);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    this.container.appendChild(this.renderer.domElement);

    // Watch State
    this.currentMaterial = 'rose_gold'; // 'rose_gold', 'titanium', 'obsidian', 'steel'
    this.isExploded = false;
    this.explodeFactor = 0;
    this.targetExplode = 0;
    this.powerReserve = 68.4;
    this.deadBeat = false;

    // Mouse Navigation
    this.isDragging = false;
    this.prevX = 0;
    this.prevY = 0;
    this.targetRotY = 0.35;
    this.targetRotX = 0.22;
    this.mouseX = 0;
    this.mouseY = 0;

    this.components = [];
    this.setupStudioLighting();
    this.build3DWatchModel();
    this.setupEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupStudioLighting() {
    // Diffuse ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    // Key studio light (high specular glint on beveled lugs)
    this.keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    this.keyLight.position.set(3, 4, 3);
    this.keyLight.castShadow = true;
    this.scene.add(this.keyLight);

    // Cool rim light from left
    const fillLight = new THREE.DirectionalLight(0xdfe6f2, 1.4);
    fillLight.position.set(-3, 2, 2);
    this.scene.add(fillLight);

    // Bottom bounce light
    const bounceLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    bounceLight.position.set(0, -3, 1);
    this.scene.add(bounceLight);

    // Soft contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.5;
    shadowMesh.receiveShadow = true;
    this.scene.add(shadowMesh);
  }

  getMaterialConfig(mat) {
    switch (mat) {
      case 'titanium':
        return {
          caseColor: 0x767d8d,
          roughness: 0.32,
          metalness: 0.85,
          bezelColor: 0x939ba8,
          handsColor: 0xe6e9ef,
          dialColor: 0x111317,
          strapColor: 0x1f232b,
          accentGold: 0xc4af93
        };
      case 'obsidian':
        return {
          caseColor: 0x18191d,
          roughness: 0.35,
          metalness: 0.8,
          bezelColor: 0x22242a,
          handsColor: 0xd9b37a,
          dialColor: 0x090a0d,
          strapColor: 0x141416,
          accentGold: 0xd9b37a
        };
      case 'steel':
        return {
          caseColor: 0xcfd4dc,
          roughness: 0.2,
          metalness: 0.92,
          bezelColor: 0xe5eaf2,
          handsColor: 0x2a5ea8, // Flame-blued steel hands
          dialColor: 0x14161c,
          strapColor: 0x241d19,
          accentGold: 0xc4af93
        };
      case 'rose_gold':
      default:
        return {
          caseColor: 0xd99573,
          roughness: 0.22,
          metalness: 0.9,
          bezelColor: 0xebaa8a,
          handsColor: 0xf3d6c8,
          dialColor: 0x121110,
          strapColor: 0x2a1914, // Dark cognac alligator
          accentGold: 0xd99573
        };
    }
  }

  build3DWatchModel() {
    this.watchRoot = new THREE.Group();
    this.scene.add(this.watchRoot);

    const cfg = this.getMaterialConfig(this.currentMaterial);

    this.caseMaterial = new THREE.MeshStandardMaterial({
      color: cfg.caseColor,
      roughness: cfg.roughness,
      metalness: cfg.metalness
    });

    this.bezelMaterial = new THREE.MeshStandardMaterial({
      color: cfg.bezelColor,
      roughness: 0.15,
      metalness: 0.95
    });

    this.dialMaterial = new THREE.MeshStandardMaterial({
      color: cfg.dialColor,
      roughness: 0.5,
      metalness: 0.3
    });

    this.handsMaterial = new THREE.MeshStandardMaterial({
      color: cfg.handsColor,
      roughness: 0.18,
      metalness: 0.92
    });

    this.strapMaterial = new THREE.MeshStandardMaterial({
      color: cfg.strapColor,
      roughness: 0.75,
      metalness: 0.1
    });

    this.goldMaterial = new THREE.MeshStandardMaterial({
      color: cfg.accentGold,
      roughness: 0.25,
      metalness: 0.9
    });

    this.rubyMaterial = new THREE.MeshStandardMaterial({
      color: 0xe63968,
      roughness: 0.1,
      metalness: 0.2
    });

    // 1. EXHIBITION CASEBACK (Back)
    const casebackGroup = new THREE.Group();
    const casebackGeo = new THREE.CylinderGeometry(1.28, 1.28, 0.08, 48);
    const casebackMesh = new THREE.Mesh(casebackGeo, this.caseMaterial);
    casebackMesh.rotation.x = Math.PI / 2;
    casebackGroup.add(casebackMesh);

    // Sapphire display window on caseback
    const backGlassGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.09, 36);
    const backGlassMat = new THREE.MeshPhysicalMaterial({
      transmission: 0.85,
      opacity: 0.3,
      transparent: true,
      roughness: 0.05,
      ior: 1.76 // Real sapphire refractive index
    });
    const backGlass = new THREE.Mesh(backGlassGeo, backGlassMat);
    backGlass.rotation.x = Math.PI / 2;
    casebackGroup.add(backGlass);

    casebackGroup.position.set(0, 0, -0.22);
    this.components.push({
      mesh: casebackGroup,
      basePos: new THREE.Vector3(0, 0, -0.22),
      explodeDelta: new THREE.Vector3(0, 0, -0.8)
    });
    this.watchRoot.add(casebackGroup);

    // 2. MAIN 39.5MM CASE BODY WITH SCULPTURED LUGS
    const caseGroup = new THREE.Group();
    const caseGeo = new THREE.CylinderGeometry(1.32, 1.32, 0.24, 64);
    const caseMesh = new THREE.Mesh(caseGeo, this.caseMaterial);
    caseMesh.rotation.x = Math.PI / 2;
    caseMesh.castShadow = true;
    caseGroup.add(caseMesh);

    // 4 Curved Lugs
    const lugPositions = [
      [-0.72, 1.38], [0.72, 1.38],   // Top
      [-0.72, -1.38], [0.72, -1.38]  // Bottom
    ];

    lugPositions.forEach(([lx, ly]) => {
      const lugGeo = new THREE.BoxGeometry(0.18, 0.55, 0.22);
      const lugMesh = new THREE.Mesh(lugGeo, this.caseMaterial);
      lugMesh.position.set(lx, ly, -0.02);
      lugMesh.rotation.z = Math.sign(lx) * -0.15;
      caseGroup.add(lugMesh);
    });

    // Fluted Winding Crown at 3 o'clock
    const crownGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.22, 32);
    this.crownMesh = new THREE.Mesh(crownGeo, this.bezelMaterial);
    this.crownMesh.position.set(1.42, 0, 0);
    this.crownMesh.rotation.z = Math.PI / 2;
    caseGroup.add(this.crownMesh);

    caseGroup.position.set(0, 0, 0);
    this.components.push({
      mesh: caseGroup,
      basePos: new THREE.Vector3(0, 0, 0),
      explodeDelta: new THREE.Vector3(0, 0, 0)
    });
    this.watchRoot.add(caseGroup);

    // 3. CALIBER KS-042 MOVEMENT PLATFORM
    const movementGroup = new THREE.Group();
    const plateGeo = new THREE.CylinderGeometry(1.22, 1.22, 0.1, 48);
    const plateMesh = new THREE.Mesh(plateGeo, this.goldMaterial);
    plateMesh.rotation.x = Math.PI / 2;
    movementGroup.add(plateMesh);

    // Open-Heart Balance Wheel at 6 o'clock
    this.balanceWheelGroup = new THREE.Group();
    const balanceRimGeo = new THREE.TorusGeometry(0.28, 0.022, 16, 32);
    const balanceRim = new THREE.Mesh(balanceRimGeo, this.goldMaterial);
    this.balanceWheelGroup.add(balanceRim);

    // Balance Spoke
    const spokeGeo = new THREE.BoxGeometry(0.56, 0.02, 0.02);
    const spokeMesh = new THREE.Mesh(spokeGeo, this.goldMaterial);
    this.balanceWheelGroup.add(spokeMesh);

    // Incabloc Ruby Jewel in center
    const jewelGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16);
    const jewelMesh = new THREE.Mesh(jewelGeo, this.rubyMaterial);
    jewelMesh.rotation.x = Math.PI / 2;
    this.balanceWheelGroup.add(jewelMesh);

    this.balanceWheelGroup.position.set(0, -0.48, 0.06);
    movementGroup.add(this.balanceWheelGroup);

    movementGroup.position.set(0, 0, 0.06);
    this.components.push({
      mesh: movementGroup,
      basePos: new THREE.Vector3(0, 0, 0.06),
      explodeDelta: new THREE.Vector3(0, 0, 0.45)
    });
    this.watchRoot.add(movementGroup);

    // 4. DIAL FACE WITH APPLIED HOUR INDICES
    const dialGroup = new THREE.Group();
    const dialGeo = new THREE.CylinderGeometry(1.24, 1.24, 0.04, 64);
    const dialMesh = new THREE.Mesh(dialGeo, this.dialMaterial);
    dialMesh.rotation.x = Math.PI / 2;
    dialGroup.add(dialMesh);

    // 12 Faceted Hour Markers
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const markerR = 1.05;
      const mx = Math.sin(angle) * markerR;
      const my = Math.cos(angle) * markerR;

      const isQuarter = i % 3 === 0;
      const markerGeo = new THREE.BoxGeometry(isQuarter ? 0.07 : 0.04, 0.16, 0.03);
      const markerMesh = new THREE.Mesh(markerGeo, this.bezelMaterial);
      markerMesh.position.set(mx, my, 0.035);
      markerMesh.rotation.z = -angle;
      dialGroup.add(markerMesh);
    }

    dialGroup.position.set(0, 0, 0.14);
    this.components.push({
      mesh: dialGroup,
      basePos: new THREE.Vector3(0, 0, 0.14),
      explodeDelta: new THREE.Vector3(0, 0, 0.85)
    });
    this.watchRoot.add(dialGroup);

    // 5. MOVING HANDS (Hour, Minute, Seconds)
    const handsGroup = new THREE.Group();

    // Hour Hand (Faceted Lancette)
    const hrGeo = new THREE.BoxGeometry(0.06, 0.55, 0.02);
    this.hourHand = new THREE.Mesh(hrGeo, this.handsMaterial);
    this.hourHand.position.set(0, 0.22, 0.02);
    this.hourHandGroup = new THREE.Group();
    this.hourHandGroup.add(this.hourHand);
    handsGroup.add(this.hourHandGroup);

    // Minute Hand
    const minGeo = new THREE.BoxGeometry(0.045, 0.85, 0.02);
    this.minHand = new THREE.Mesh(minGeo, this.handsMaterial);
    this.minHand.position.set(0, 0.36, 0.04);
    this.minHandGroup = new THREE.Group();
    this.minHandGroup.add(this.minHand);
    handsGroup.add(this.minHandGroup);

    // Central Sweeping Second Hand
    const secGeo = new THREE.BoxGeometry(0.02, 1.05, 0.015);
    this.secHand = new THREE.Mesh(secGeo, this.handsMaterial);
    this.secHand.position.set(0, 0.38, 0.06);
    this.secHandGroup = new THREE.Group();
    this.secHandGroup.add(this.secHand);
    handsGroup.add(this.secHandGroup);

    handsGroup.position.set(0, 0, 0.18);
    this.components.push({
      mesh: handsGroup,
      basePos: new THREE.Vector3(0, 0, 0.18),
      explodeDelta: new THREE.Vector3(0, 0, 1.2)
    });
    this.watchRoot.add(handsGroup);

    // 6. BEZEL RING (Step Bezel)
    const bezelGroup = new THREE.Group();
    const bezelGeo = new THREE.TorusGeometry(1.28, 0.06, 16, 64);
    const bezelMesh = new THREE.Mesh(bezelGeo, this.bezelMaterial);
    bezelGroup.add(bezelMesh);

    bezelGroup.position.set(0, 0, 0.2);
    this.components.push({
      mesh: bezelGroup,
      basePos: new THREE.Vector3(0, 0, 0.2),
      explodeDelta: new THREE.Vector3(0, 0, 1.5)
    });
    this.watchRoot.add(bezelGroup);

    // 7. SAPPHIRE DOUBLE-DOMED CRYSTAL (Front Glass with Refraction)
    const crystalGroup = new THREE.Group();
    const crystalGeo = new THREE.CylinderGeometry(1.24, 1.24, 0.06, 64);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      transmission: 0.94,
      opacity: 0.35,
      transparent: true,
      roughness: 0.02,
      ior: 1.768, // True Corundum / Sapphire
      reflectivity: 0.8
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.rotation.x = Math.PI / 2;
    crystalGroup.add(crystalMesh);

    crystalGroup.position.set(0, 0, 0.24);
    this.components.push({
      mesh: crystalGroup,
      basePos: new THREE.Vector3(0, 0, 0.24),
      explodeDelta: new THREE.Vector3(0, 0, 1.85)
    });
    this.watchRoot.add(crystalGroup);

    // 8. LUXURY LEATHER STRAP (Curved Upper & Lower)
    const strapTopGeo = new THREE.BoxGeometry(0.9, 1.4, 0.08);
    const strapTop = new THREE.Mesh(strapTopGeo, this.strapMaterial);
    strapTop.position.set(0, 1.9, -0.04);
    this.watchRoot.add(strapTop);

    const strapBottomGeo = new THREE.BoxGeometry(0.9, 1.4, 0.08);
    const strapBottom = new THREE.Mesh(strapBottomGeo, this.strapMaterial);
    strapBottom.position.set(0, -1.9, -0.04);
    this.watchRoot.add(strapBottom);
  }

  setMaterial(mat) {
    this.currentMaterial = mat;
    const cfg = this.getMaterialConfig(mat);

    this.caseMaterial.color.setHex(cfg.caseColor);
    this.caseMaterial.roughness = cfg.roughness;
    this.caseMaterial.metalness = cfg.metalness;

    this.bezelMaterial.color.setHex(cfg.bezelColor);
    this.dialMaterial.color.setHex(cfg.dialColor);
    this.handsMaterial.color.setHex(cfg.handsColor);
    this.strapMaterial.color.setHex(cfg.strapColor);
    this.goldMaterial.color.setHex(cfg.accentGold);
  }

  toggleExploded() {
    this.isExploded = !this.isExploded;
    this.targetExplode = this.isExploded ? 1.0 : 0.0;
    return this.isExploded;
  }

  windCrown(amount = 14) {
    this.powerReserve = Math.min(72, this.powerReserve + amount);
    if (this.crownMesh) {
      this.crownMesh.rotation.x += 1.2;
    }
    const readout = document.getElementById('stat-power-reserve');
    if (readout) readout.textContent = `${this.powerReserve.toFixed(1)}h / 72h`;
    const bar = document.getElementById('reserve-bar-gauge');
    if (bar) bar.style.width = `${(this.powerReserve / 72) * 100}%`;
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      if (!this.container) return;
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });

    this.container.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.prevX = e.clientX;
      this.prevY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      this.mouseY = (e.clientY - rect.top) / rect.height - 0.5;

      if (this.isDragging) {
        const dx = e.clientX - this.prevX;
        const dy = e.clientY - this.prevY;
        this.targetRotY += dx * 0.008;
        this.targetRotX += dy * 0.008;
        this.prevX = e.clientX;
        this.prevY = e.clientY;
      }
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Smooth Explode Lerp
    this.explodeFactor += (this.targetExplode - this.explodeFactor) * 0.07;
    for (let comp of this.components) {
      comp.mesh.position.z = comp.basePos.z + comp.explodeDelta.z * this.explodeFactor;
    }

    const time = performance.now() * 0.001;

    // Harmonic Balance Wheel oscillation at 4.0 Hz
    if (this.balanceWheelGroup) {
      const harmonicAngle = Math.sin(time * 25.13) * 1.4; // 4Hz = 2*PI*4 ≈ 25.13 rad/s
      this.balanceWheelGroup.rotation.z = harmonicAngle;
    }

    // Moving Hands
    if (this.secHandGroup) {
      // 10:10:35 time simulation
      const baseSecAngle = (time * (Math.PI / 30)) % (Math.PI * 2);
      this.secHandGroup.rotation.z = -baseSecAngle;
    }
    if (this.minHandGroup) {
      this.minHandGroup.rotation.z = -1.25 + (time * 0.002);
    }
    if (this.hourHandGroup) {
      this.hourHandGroup.rotation.z = 2.1;
    }

    // Idle floating & smooth camera rotation damping
    const idleY = Math.sin(time * 0.7) * 0.03;
    const idleRotY = Math.sin(time * 0.4) * 0.04;

    this.watchRoot.rotation.y += (this.targetRotY + idleRotY + this.mouseX * 0.3 - this.watchRoot.rotation.y) * 0.05;
    this.watchRoot.rotation.x += (this.targetRotX + this.mouseY * 0.2 - this.watchRoot.rotation.x) * 0.05;
    this.watchRoot.position.y += (idleY - this.watchRoot.position.y) * 0.05;

    // Specular light follows cursor
    this.keyLight.position.x = 3 + this.mouseX * 3;
    this.keyLight.position.y = 4 - this.mouseY * 2;

    this.renderer.render(this.scene, this.camera);
  }
}

window.WatchStudio3D = WatchStudio3D;
