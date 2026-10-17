/**
 * MONOLITH // 3D Procedural Studio Engine (Three.js WebGL)
 * Real-time PBR metal shaders, dynamic studio lighting, exploded architecture, and mouse parallax
 */

class Monolith3D {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 0.4, 5.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    this.container.appendChild(this.renderer.domElement);

    // State
    this.currentFinish = 'silver'; // 'silver', 'obsidian', 'champagne'
    this.isExploded = false;
    this.explodeFactor = 0; // 0 to 1 lerp
    this.targetExplodeFactor = 0;

    // Mouse Interaction
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationY = 0.2;
    this.targetRotationX = 0.05;
    this.isDragging = false;
    this.previousMouseX = 0;
    this.previousMouseY = 0;

    this.components = [];
    this.setupLighting();
    this.buildMonolithModel();
    this.setupEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Soft studio ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Key Spotlight (crisp specular glint on chamfered edges)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(4, 5, 4);
    this.keyLight.castShadow = true;
    this.scene.add(this.keyLight);

    // Fill Light (soft cool tone from left)
    const fillLight = new THREE.DirectionalLight(0xdce5f5, 1.2);
    fillLight.position.set(-4, 2, 2);
    this.scene.add(fillLight);

    // Rim / Backlight (high-contrast silhouette highlight)
    this.rimLight = new THREE.DirectionalLight(0xfff8ee, 1.8);
    this.rimLight.position.set(0, 3, -4);
    this.scene.add(this.rimLight);

    // Subtle ground shadow plane
    const shadowGeo = new THREE.PlaneGeometry(10, 10);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.8;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);
  }

  getMaterialConfig(finish) {
    switch (finish) {
      case 'obsidian':
        return {
          chassisColor: 0x141518,
          chassisRoughness: 0.35,
          chassisMetalness: 0.85,
          accentColor: 0x22242b,
          driverColor: 0x0d0e12,
          copperColor: 0x8c6d48
        };
      case 'champagne':
        return {
          chassisColor: 0xc4af93,
          chassisRoughness: 0.32,
          chassisMetalness: 0.78,
          accentColor: 0xddc8ad,
          driverColor: 0x221f1c,
          copperColor: 0xb87333
        };
      case 'silver':
      default:
        return {
          chassisColor: 0xd8dde6,
          chassisRoughness: 0.28,
          chassisMetalness: 0.88,
          accentColor: 0xeef2f7,
          driverColor: 0x181a20,
          copperColor: 0xb87333
        };
    }
  }

  buildMonolithModel() {
    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    const matCfg = this.getMaterialConfig(this.currentFinish);

    // Shared Materials
    this.chassisMat = new THREE.MeshStandardMaterial({
      color: matCfg.chassisColor,
      roughness: matCfg.chassisRoughness,
      metalness: matCfg.chassisMetalness
    });

    this.accentMat = new THREE.MeshStandardMaterial({
      color: matCfg.accentColor,
      roughness: 0.2,
      metalness: 0.95
    });

    this.driverMat = new THREE.MeshStandardMaterial({
      color: matCfg.driverColor,
      roughness: 0.45,
      metalness: 0.5
    });

    this.copperMat = new THREE.MeshStandardMaterial({
      color: matCfg.copperColor,
      roughness: 0.35,
      metalness: 0.9
    });

    // 1. REAR ACOUSTIC SHELL (Back Chassis)
    const rearGeo = new THREE.BoxGeometry(1.4, 2.6, 0.4);
    this.rearMesh = new THREE.Mesh(rearGeo, this.chassisMat);
    this.rearMesh.position.set(0, 0, -0.4);
    this.rearMesh.castShadow = true;
    this.components.push({
      mesh: this.rearMesh,
      basePos: new THREE.Vector3(0, 0, -0.4),
      explodeDelta: new THREE.Vector3(0, 0, -1.2)
    });
    this.rootGroup.add(this.rearMesh);

    // 2. INTERNAL ACOUSTIC RESONANCE CHAMBER & COPPER CORE
    const coreGroup = new THREE.Group();
    const coreGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.8, 32);
    const coreMesh = new THREE.Mesh(coreGeo, this.copperMat);
    coreGroup.add(coreMesh);

    // Toroidal inductor coils
    for (let i = -2; i <= 2; i++) {
      const ringGeo = new THREE.TorusGeometry(0.48, 0.035, 16, 32);
      const ringMesh = new THREE.Mesh(ringGeo, this.accentMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = i * 0.35;
      coreGroup.add(ringMesh);
    }
    coreGroup.position.set(0, 0, -0.05);
    this.components.push({
      mesh: coreGroup,
      basePos: new THREE.Vector3(0, 0, -0.05),
      explodeDelta: new THREE.Vector3(0, 0.4, -0.3)
    });
    this.rootGroup.add(coreGroup);

    // 3. MAIN UNIBODY BILLET FRAME
    const frameGeo = new THREE.BoxGeometry(1.44, 2.64, 0.5);
    this.frameMesh = new THREE.Mesh(frameGeo, this.chassisMat);
    this.frameMesh.position.set(0, 0, 0.1);
    this.frameMesh.castShadow = true;
    this.components.push({
      mesh: this.frameMesh,
      basePos: new THREE.Vector3(0, 0, 0.1),
      explodeDelta: new THREE.Vector3(0, 0, 0)
    });
    this.rootGroup.add(this.frameMesh);

    // 4. DUAL DRIVERS (Tweeter + Mid-Bass Woofer)
    const driversGroup = new THREE.Group();

    // Tweeter Horn (Top)
    const tweeterGeo = new THREE.ConeGeometry(0.24, 0.18, 32);
    const tweeterMesh = new THREE.Mesh(tweeterGeo, this.accentMat);
    tweeterMesh.rotation.x = -Math.PI / 2;
    tweeterMesh.position.set(0, 0.65, 0.42);
    driversGroup.add(tweeterMesh);

    // Woofer Cone (Bottom)
    const wooferGeo = new THREE.CylinderGeometry(0.45, 0.22, 0.22, 32);
    const wooferMesh = new THREE.Mesh(wooferGeo, this.driverMat);
    wooferMesh.rotation.x = Math.PI / 2;
    wooferMesh.position.set(0, -0.35, 0.42);
    driversGroup.add(wooferMesh);

    // Woofer Anodized Dust Cap
    const capGeo = new THREE.SphereGeometry(0.14, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const capMesh = new THREE.Mesh(capGeo, this.accentMat);
    capMesh.rotation.x = Math.PI / 2;
    capMesh.position.set(0, -0.35, 0.48);
    driversGroup.add(capMesh);

    this.components.push({
      mesh: driversGroup,
      basePos: new THREE.Vector3(0, 0, 0),
      explodeDelta: new THREE.Vector3(0, 0, 0.7)
    });
    this.rootGroup.add(driversGroup);

    // 5. FRONT PRECISION BAFFLE FACIA
    const baffleGeo = new THREE.BoxGeometry(1.42, 2.62, 0.08);
    this.baffleMesh = new THREE.Mesh(baffleGeo, this.chassisMat);
    this.baffleMesh.position.set(0, 0, 0.45);
    this.components.push({
      mesh: this.baffleMesh,
      basePos: new THREE.Vector3(0, 0, 0.45),
      explodeDelta: new THREE.Vector3(0, 0, 1.4)
    });
    this.rootGroup.add(this.baffleMesh);

    // 6. SOLID ALUMINUM DECOUPLING PLINTH (Base)
    const plinthGeo = new THREE.BoxGeometry(1.6, 0.12, 1.2);
    this.plinthMesh = new THREE.Mesh(plinthGeo, this.accentMat);
    this.plinthMesh.position.set(0, -1.4, 0);
    this.plinthMesh.receiveShadow = true;
    this.components.push({
      mesh: this.plinthMesh,
      basePos: new THREE.Vector3(0, -1.4, 0),
      explodeDelta: new THREE.Vector3(0, -0.7, 0)
    });
    this.rootGroup.add(this.plinthMesh);
  }

  setFinish(finish) {
    this.currentFinish = finish;
    const cfg = this.getMaterialConfig(finish);

    this.chassisMat.color.setHex(cfg.chassisColor);
    this.chassisMat.roughness = cfg.chassisRoughness;
    this.chassisMat.metalness = cfg.chassisMetalness;

    this.accentMat.color.setHex(cfg.accentColor);
    this.driverMat.color.setHex(cfg.driverColor);
    this.copperMat.color.setHex(cfg.copperColor);
  }

  toggleExploded() {
    this.isExploded = !this.isExploded;
    this.targetExplodeFactor = this.isExploded ? 1.0 : 0.0;
    return this.isExploded;
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      if (!this.container) return;
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });

    // Mouse drag rotation
    this.container.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.previousMouseX = e.clientX;
      this.previousMouseY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      this.mouseY = (e.clientY - rect.top) / rect.height - 0.5;

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMouseX;
        const deltaY = e.clientY - this.previousMouseY;
        this.targetRotationY += deltaX * 0.008;
        this.targetRotationX += deltaY * 0.008;
        this.previousMouseX = e.clientX;
        this.previousMouseY = e.clientY;
      }
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Smooth Explode Interpolation
    this.explodeFactor += (this.targetExplodeFactor - this.explodeFactor) * 0.08;

    for (let comp of this.components) {
      comp.mesh.position.x = comp.basePos.x + comp.explodeDelta.x * this.explodeFactor;
      comp.mesh.position.y = comp.basePos.y + comp.explodeDelta.y * this.explodeFactor;
      comp.mesh.position.z = comp.basePos.z + comp.explodeDelta.z * this.explodeFactor;
    }

    // Gentle floating breathing animation + mouse parallax
    const time = performance.now() * 0.001;
    const idleRotY = Math.sin(time * 0.5) * 0.08;
    const idleY = Math.sin(time * 1.2) * 0.03;

    // Smooth damping for rotation
    this.rootGroup.rotation.y += (this.targetRotationY + idleRotY + this.mouseX * 0.4 - this.rootGroup.rotation.y) * 0.05;
    this.rootGroup.rotation.x += (this.targetRotationX + this.mouseY * 0.2 - this.rootGroup.rotation.x) * 0.05;
    this.rootGroup.position.y += (idleY - this.rootGroup.position.y) * 0.05;

    // Key light follows cursor slightly for specular glints
    this.keyLight.position.x = 4 + this.mouseX * 3;
    this.keyLight.position.y = 5 - this.mouseY * 2;

    this.renderer.render(this.scene, this.camera);
  }
}

window.Monolith3D = Monolith3D;
