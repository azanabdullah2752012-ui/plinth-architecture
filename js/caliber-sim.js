/**
 * KÖNIG & SÖHNE // Caliber KS-042 Mechanical Escapement Simulation
 * Real-time harmonic balance oscillator, Swiss lever escapement, and case customizer
 */

class CaliberSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Mechanical Simulation State
    this.vph = 28800; // 4 Hz (8 beats per second)
    this.freq = 4.0;
    this.powerReserve = 68.4; // Hours (max 72h)
    this.maxReserve = 72.0;
    this.isWinding = false;

    // Movement Angle & Harmonic State
    this.balanceAngle = 0; // Radians
    this.balanceVelocity = 0;
    this.escapeAngle = 0; // Radians
    this.palletState = 0; // -1 (left lock), 0 (impulse), 1 (right lock)
    this.secondsAngle = 0;

    // Complications & Visual Modes
    this.viewMode = 'skeleton'; // 'skeleton' or 'guilloche'
    this.material = 'titanium'; // 'titanium', 'rose_gold', 'obsidian', 'steel'
    this.deadBeatMode = false;
    this.chronoRunning = false;
    this.chronoSeconds = 0;

    this.dpr = window.devicePixelRatio || 1;
    this.setupCanvas();
    window.addEventListener('resize', () => this.setupCanvas());

    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  setMaterial(mat) {
    this.material = mat;
    this.updateMaterialUI();
  }

  setViewMode(mode) {
    this.viewMode = mode;
  }

  toggleDeadBeat() {
    this.deadBeatMode = !this.deadBeatMode;
    return this.deadBeatMode;
  }

  toggleChronograph() {
    this.chronoRunning = !this.chronoRunning;
    return this.chronoRunning;
  }

  resetChronograph() {
    this.chronoRunning = false;
    this.chronoSeconds = 0;
  }

  windCrown(amount = 6.0) {
    this.powerReserve = Math.min(this.maxReserve, this.powerReserve + amount);
    this.updateReserveUI();
  }

  updateReserveUI() {
    const el = document.getElementById('stat-reserve');
    if (el) el.textContent = `${this.powerReserve.toFixed(1)}h / 72h`;
    const bar = document.getElementById('reserve-bar');
    if (bar) bar.style.width = `${(this.powerReserve / this.maxReserve) * 100}%`;
  }

  updateMaterialUI() {
    const label = document.getElementById('current-material-label');
    if (label) {
      const names = {
        titanium: 'GRADE 5 TITANIUM // BRUSHED SATIN',
        rose_gold: '18K 4N ROSE GOLD // MIRROR ANGLAGE',
        obsidian: 'OBSIDIAN DLC COATING // MATTE OBSIDIAN',
        steel: '904L AUSTENITIC STEEL // BEVELED LUGS'
      };
      label.textContent = names[this.material] || this.material.toUpperCase();
    }
  }

  animate(now) {
    requestAnimationFrame(this.animate);

    const dt = Math.min(0.05, (now - this.lastTime) * 0.001);
    this.lastTime = now;

    // Consume reserve slowly
    if (this.powerReserve > 0) {
      this.powerReserve = Math.max(0, this.powerReserve - dt * 0.005);
      if (Math.random() < 0.05) this.updateReserveUI();
    }

    const amplitude = this.powerReserve > 0 ? 1.6 : 0; // Max swing angle in radians (~92 degrees)
    const omega = 2 * Math.PI * this.freq;

    // Harmonic oscillator equation for balance wheel
    this.balanceAngle = amplitude * Math.sin(omega * (now * 0.001));

    // Pallet fork & escape wheel advancement at zero-crossing
    if (Math.abs(this.balanceAngle) < 0.25) {
      this.escapeAngle += dt * 1.8;
    }

    // Chrono tracking
    if (this.chronoRunning) {
      this.chronoSeconds += dt;
    }

    // Seconds hand sweep or dead-beat
    if (this.deadBeatMode) {
      this.secondsAngle = Math.floor(now * 0.001) * (Math.PI / 30);
    } else {
      this.secondsAngle = (now * 0.001) * (Math.PI / 30);
    }

    this.render();
  }

  getMaterialColors() {
    switch (this.material) {
      case 'rose_gold':
        return {
          caseBorder: '#c28966',
          caseFill: '#1a1816',
          bezelAccent: '#df9c76',
          metalPrimary: '#d89e78',
          metalSecondary: '#a67252',
          screws: '#4a3224',
          jewels: '#e63968',
          hands: '#eed8cb',
          dialBg: '#131211'
        };
      case 'obsidian':
        return {
          caseBorder: '#2e313b',
          caseFill: '#0c0d10',
          bezelAccent: '#3f4452',
          metalPrimary: '#282b35',
          metalSecondary: '#191b22',
          screws: '#5c6377',
          jewels: '#ff4d6d',
          hands: '#ffd166',
          dialBg: '#090a0d'
        };
      case 'steel':
        return {
          caseBorder: '#8e96a8',
          caseFill: '#15171d',
          bezelAccent: '#b4bccd',
          metalPrimary: '#9ba4b8',
          metalSecondary: '#626978',
          screws: '#3a69a8', // Heat-blued screws
          jewels: '#ff3366',
          hands: '#e2e7f2',
          dialBg: '#111317'
        };
      case 'titanium':
      default:
        return {
          caseBorder: '#5a6275',
          caseFill: '#13151b',
          bezelAccent: '#7e889f',
          metalPrimary: '#687287',
          metalSecondary: '#404654',
          screws: '#2a5fa5', // Blued screws
          jewels: '#ff3366',
          hands: '#f0f3f8',
          dialBg: '#0e1014'
        };
    }
  }

  render() {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const radius = Math.min(cx, cy) * 0.86;
    const colors = this.getMaterialColors();

    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(cx, cy);

    // 1. Outer Watch Case & Stepped Bezel
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.caseFill;
    ctx.fill();
    ctx.strokeStyle = colors.caseBorder;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner Rehaut ring with 60-second / minute track
    ctx.beginPath();
    ctx.arc(0, 0, radius - 14, 0, Math.PI * 2);
    ctx.strokeStyle = colors.bezelAccent;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Minute graduation hash marks
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const isFive = i % 5 === 0;
      const r1 = radius - 14;
      const r2 = isFive ? radius - 26 : radius - 20;

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.strokeStyle = isFive ? colors.bezelAccent : colors.metalSecondary;
      ctx.lineWidth = isFive ? 2 : 1;
      ctx.stroke();
    }

    if (this.viewMode === 'guilloche') {
      this.drawGuillocheDial(radius - 28, colors);
    } else {
      this.drawSkeletonMovement(radius - 28, colors);
    }

    // Hour and Minute Hands
    const hrAngle = (this.secondsAngle / 720) + (Math.PI * 0.85); // Simulated time: 10:10
    const minAngle = (this.secondsAngle / 60) + (Math.PI * 0.35);

    // Hour Hand (Breguet hollow apple or faceted lancette)
    this.drawFacetedHand(hrAngle, radius * 0.48, 6, colors.hands);

    // Minute Hand
    this.drawFacetedHand(minAngle, radius * 0.72, 4.5, colors.hands);

    // Central Seconds Hand (or Chrono Hand)
    const secAngle = this.chronoRunning 
      ? (this.chronoSeconds * (Math.PI / 30)) - (Math.PI / 2)
      : this.secondsAngle - (Math.PI / 2);

    ctx.save();
    ctx.rotate(secAngle);
    ctx.strokeStyle = this.chronoRunning ? '#ff3366' : '#3a7bd5'; // Blued steel or red chrono
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(0, -(radius - 24));
    ctx.stroke();

    // Counterbalance teardrop
    ctx.beginPath();
    ctx.arc(0, 10, 3, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    ctx.restore();

    // Center jewel cap pin
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = colors.bezelAccent;
    ctx.fill();
    ctx.strokeStyle = '#0e1015';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Top anti-reflective sapphire reflection flare
    const flareGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    flareGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
    flareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = flareGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawGuillocheDial(r, colors) {
    const ctx = this.ctx;

    // Hand-turned Clous de Paris pattern simulation
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.dialBg;
    ctx.fill();
    ctx.clip();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    const step = 8;
    for (let x = -r; x < r; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, -r);
      ctx.lineTo(x + r * 2, r);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, r);
      ctx.lineTo(x + r * 2, -r);
      ctx.stroke();
    }

    // Brand cartouche plate
    ctx.fillStyle = colors.caseFill;
    ctx.strokeStyle = colors.metalSecondary;
    ctx.lineWidth = 1;
    ctx.fillRect(-64, -r * 0.45, 128, 28);
    ctx.strokeRect(-64, -r * 0.45, 128, 28);

    ctx.fillStyle = colors.bezelAccent;
    ctx.font = '700 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.15em';
    ctx.fillText('KÖNIG & SÖHNE', 0, -r * 0.45 + 13);

    ctx.fillStyle = colors.metalSecondary;
    ctx.font = '8px monospace';
    ctx.fillText('GLASHÜTTE I/SA', 0, -r * 0.45 + 23);

    // Open aperture at 6 o'clock revealing the oscillating escapement!
    const openApertureY = r * 0.42;
    const apRadius = r * 0.34;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, openApertureY, apRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0b0e';
    ctx.fill();
    ctx.strokeStyle = colors.bezelAccent;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.clip();

    // Render balance wheel inside open aperture
    ctx.translate(0, openApertureY);
    this.drawBalanceAndHairspring(apRadius * 0.85, colors);
    ctx.restore();

    ctx.restore();
  }

  drawSkeletonMovement(r, colors) {
    const ctx = this.ctx;

    // German silver three-quarter plate with Côtes de Genève ribbing
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#101217';
    ctx.fill();
    ctx.clip();

    // Decorative Geneva stripes across bridge plates
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    for (let y = -r; y < r; y += 14) {
      if ((y / 14) % 2 === 0) {
        ctx.fillRect(-r, y, r * 2, 7);
      }
    }

    // Mainspring Barrel at 11 o'clock
    const barrelX = -r * 0.35;
    const barrelY = -r * 0.35;
    const barrelR = r * 0.32;

    ctx.save();
    ctx.translate(barrelX, barrelY);
    ctx.beginPath();
    ctx.arc(0, 0, barrelR, 0, Math.PI * 2);
    ctx.fillStyle = colors.metalSecondary;
    ctx.fill();
    ctx.strokeStyle = colors.bezelAccent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Barrel teeth
    this.drawGearTeeth(barrelR, 28, colors.bezelAccent);
    this.drawJeweledChaton(0, 0, colors);
    ctx.restore();

    // Center Wheel at origin (covered by bridge)
    this.drawJeweledChaton(0, 0, colors);

    // Third and Fourth Wheels (Intermediates)
    const wheelX = r * 0.32;
    const wheelY = -r * 0.15;
    ctx.save();
    ctx.translate(wheelX, wheelY);
    this.drawGearWheel(r * 0.28, 24, colors.bezelAccent, colors.screws);
    ctx.restore();

    // Swiss Lever Escape Wheel
    const escX = r * 0.22;
    const escY = r * 0.32;
    ctx.save();
    ctx.translate(escX, escY);
    ctx.rotate(this.escapeAngle);
    this.drawEscapeWheel(r * 0.2, colors);
    ctx.restore();

    // Balance Cock & Variable-Inertia Balance Wheel at 7 o'clock
    const balX = -r * 0.25;
    const balY = r * 0.35;
    ctx.save();
    ctx.translate(balX, balY);
    this.drawBalanceAndHairspring(r * 0.38, colors);
    ctx.restore();

    ctx.restore();
  }

  drawBalanceAndHairspring(r, colors) {
    const ctx = this.ctx;

    ctx.save();
    ctx.rotate(this.balanceAngle);

    // Outer Glucydur balance rim
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = colors.bezelAccent;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Gold poising screws on rim perimeter
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const sx = Math.cos(a) * (r + 1.5);
      const sy = Math.sin(a) * (r + 1.5);
      ctx.fillStyle = colors.bezelAccent;
      ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
    }

    // Double crossing spokes
    ctx.strokeStyle = colors.bezelAccent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.stroke();

    ctx.restore();

    // Breguet overcoil hairspring (coiling visually with balance oscillation)
    ctx.save();
    ctx.strokeStyle = '#4a90e2'; // Heat-blued spring steel
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const coils = 5;
    const points = 120;
    const springTwist = this.balanceAngle * 0.25;

    for (let i = 0; i <= points; i++) {
      const frac = i / points;
      const a = frac * coils * Math.PI * 2 + springTwist;
      const sr = (frac * r * 0.72) + 4;
      const x = Math.cos(a) * sr;
      const y = Math.sin(a) * sr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Center Incabloc shock protection jewel cap
    this.drawIncablocJewel(0, 0, colors);
    ctx.restore();
  }

  drawEscapeWheel(r, colors) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = colors.bezelAccent;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 15 club teeth
    const teeth = 15;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = colors.bezelAccent;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(r + 5, -2);
      ctx.lineTo(r + 4, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  drawGearWheel(r, teeth, color, screwColor) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    this.drawGearTeeth(r, teeth, color);

    // 4 curved cutouts
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = '#0a0c10';
      ctx.beginPath();
      ctx.arc(r * 0.5, 0, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawGearTeeth(r, count, color) {
    const ctx = this.ctx;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const tx = Math.cos(a) * r;
      const ty = Math.sin(a) * r;
      ctx.fillStyle = color;
      ctx.fillRect(tx - 1.5, ty - 1.5, 3, 3);
    }
  }

  drawJeweledChaton(x, y, colors) {
    const ctx = this.ctx;
    // Gold chaton screwed with 3 blued screws
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = colors.bezelAccent;
    ctx.fill();

    // Synthetic ruby jewel
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = colors.jewels;
    ctx.fill();

    // Center pivot hole
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
  }

  drawIncablocJewel(x, y, colors) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = colors.bezelAccent;
    ctx.fill();

    // Lyre-shaped spring
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = colors.jewels;
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawFacetedHand(angle, length, width, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.rotate(angle);

    // Lancette faceted profile
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(width / 2, -length * 0.8);
    ctx.lineTo(0, -length);
    ctx.lineTo(-width / 2, -length * 0.8);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 6;
    ctx.fill();

    // Center bevel line
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(0, -length);
    ctx.stroke();

    ctx.restore();
  }
}

window.CaliberSimulator = CaliberSimulator;
