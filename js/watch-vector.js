/**
 * KÖNIG & SÖHNE // Caliber KS-042 Interactive Vector Horological Schematic
 * Crisp SVG vector mechanics, animated balance oscillator, layer decomposition, and component inspector
 */

class VectorWatchSchematic {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.powerReserve = 68.4;
    this.currentMaterial = 'rose_gold';
    this.activeLayer = 'all'; // 'all', 'movement', 'dial', 'escapement'
    this.activeInspection = null;

    this.palette = {
      rose_gold: {
        primaryGradStart: '#df9c76',
        primaryGradEnd: '#a66847',
        caseStroke: '#cda66f',
        plateFill: '#171922',
        dialFill: '#121318',
        handsFill: '#f1d1c0',
        screwFill: '#2a5ea8',
        jewelFill: '#e63968'
      },
      titanium: {
        primaryGradStart: '#9aa2b5',
        primaryGradEnd: '#555b68',
        caseStroke: '#7a8396',
        plateFill: '#14161c',
        dialFill: '#0f1115',
        handsFill: '#e5e9f2',
        screwFill: '#396bb0',
        jewelFill: '#e63968'
      },
      obsidian: {
        primaryGradStart: '#303440',
        primaryGradEnd: '#14151a',
        caseStroke: '#484e5e',
        plateFill: '#0c0d10',
        dialFill: '#07080a',
        handsFill: '#cfa76e',
        screwFill: '#555e74',
        jewelFill: '#ff4d6d'
      },
      steel: {
        primaryGradStart: '#e2e7f0',
        primaryGradEnd: '#8b94a5',
        caseStroke: '#b8c1d1',
        plateFill: '#15171e',
        dialFill: '#101217',
        handsFill: '#2a5ea8', // Heat-blued hands
        screwFill: '#2a5ea8',
        jewelFill: '#e63968'
      }
    };

    this.renderSVG();
    this.setupEvents();

    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  renderSVG() {
    const pal = this.palette[this.currentMaterial];

    this.container.innerHTML = `
      <svg id="vector-watch-svg" viewBox="0 0 600 600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Metal Gradients -->
          <linearGradient id="metal-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${pal.primaryGradStart}" />
            <stop offset="50%" stop-color="${pal.primaryGradEnd}" />
            <stop offset="100%" stop-color="${pal.primaryGradStart}" />
          </linearGradient>

          <radialGradient id="case-bevel-glow" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stop-color="transparent" />
            <stop offset="98%" stop-color="${pal.caseStroke}" stop-opacity="0.25" />
            <stop offset="100%" stop-color="${pal.caseStroke}" stop-opacity="0.6" />
          </radialGradient>

          <!-- Heat-Blued Screw Gradient -->
          <radialGradient id="blued-screw-grad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#4a90e2" />
            <stop offset="60%" stop-color="${pal.screwFill}" />
            <stop offset="100%" stop-color="#142f56" />
          </radialGradient>

          <!-- Synthetic Ruby Chaton Gradient -->
          <radialGradient id="ruby-jewel-grad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#ff7597" />
            <stop offset="65%" stop-color="${pal.jewelFill}" />
            <stop offset="100%" stop-color="#800f2f" />
          </radialGradient>

          <!-- Geneva Stripes Pattern -->
          <pattern id="cotes-de-geneve" width="600" height="16" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="600" y2="0" stroke="rgba(255,255,255,0.025)" stroke-width="1" />
            <rect x="0" y="0" width="600" height="8" fill="rgba(255,255,255,0.015)" />
          </pattern>

          <!-- Guilloché Engine-Turn Pattern -->
          <pattern id="clous-de-paris" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 8 8 M 8 0 L 0 8" stroke="rgba(255,255,255,0.035)" stroke-width="0.8" />
          </pattern>
        </defs>

        <!-- BACKGROUND RETICLE GRID (Engineering Blueprint Reference) -->
        <g id="layer-grid" opacity="0.35">
          <circle cx="300" cy="300" r="275" fill="none" stroke="#222634" stroke-width="1" stroke-dasharray="4 4" />
          <line x1="300" y1="20" x2="300" y2="580" stroke="#1d202c" stroke-width="1" />
          <line x1="20" y1="300" x2="580" y2="300" stroke="#1d202c" stroke-width="1" />
          <text x="312" y="32" fill="#5e6678" font-family="monospace" font-size="9" letter-spacing="0.1em">AXIS-Y // 300.00MM</text>
          <text x="32" y="292" fill="#5e6678" font-family="monospace" font-size="9" letter-spacing="0.1em">AXIS-X // 000.00MM</text>
        </g>

        <!-- LAYER: CASE & SCULPTURED LUGS -->
        <g id="layer-case" class="schematic-layer">
          <!-- 4 Tapered Lugs -->
          <path d="M 195 105 L 180 20 L 220 20 L 225 90 Z" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="1.5" />
          <path d="M 405 105 L 420 20 L 380 20 L 375 90 Z" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="1.5" />
          <path d="M 195 495 L 180 580 L 220 580 L 225 510 Z" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="1.5" />
          <path d="M 405 495 L 420 580 L 380 580 L 375 510 Z" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="1.5" />

          <!-- Strap Springbars -->
          <rect x="184" y="28" width="232" height="6" rx="2" fill="#202430" stroke="#383e50" stroke-width="1" />
          <rect x="184" y="566" width="232" height="6" rx="2" fill="#202430" stroke="#383e50" stroke-width="1" />

          <!-- Outer 39.5mm Billet Case -->
          <circle cx="300" cy="300" r="215" fill="${pal.plateFill}" stroke="url(#metal-primary)" stroke-width="4" />
          <circle cx="300" cy="300" r="215" fill="url(#case-bevel-glow)" />

          <!-- Step Bezel Ring -->
          <circle cx="300" cy="300" r="198" fill="none" stroke="${pal.caseStroke}" stroke-width="2" />
          <circle cx="300" cy="300" r="192" fill="none" stroke="#2a3040" stroke-width="1" />

          <!-- Winding Crown at 3 o'clock -->
          <g id="crown-assembly" style="cursor: pointer;" transform="translate(515, 300)">
            <rect x="0" y="-24" width="22" height="48" rx="3" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="1.5" />
            <!-- Fluted Crown Ridges -->
            <line x1="5" y1="-22" x2="5" y2="22" stroke="#1a1c24" stroke-width="2" />
            <line x1="10" y1="-22" x2="10" y2="22" stroke="#1a1c24" stroke-width="2" />
            <line x1="15" y1="-22" x2="15" y2="22" stroke="#1a1c24" stroke-width="2" />
            <circle cx="22" cy="0" r="4" fill="${pal.caseStroke}" />
          </g>
        </g>

        <!-- LAYER: THREE-QUARTER PLATE & MOVEMENT GEAR TRAIN -->
        <g id="layer-movement" class="schematic-layer">
          <!-- Untreated German Silver Three-Quarter Plate -->
          <path d="M 300 110 A 190 190 0 0 1 485 340 L 390 340 A 90 90 0 0 0 300 250 A 90 90 0 0 0 210 340 L 115 340 A 190 190 0 0 1 300 110 Z" 
                fill="${pal.plateFill}" stroke="${pal.caseStroke}" stroke-width="1.5" />
          <path d="M 300 110 A 190 190 0 0 1 485 340 L 390 340 A 90 90 0 0 0 300 250 A 90 90 0 0 0 210 340 L 115 340 A 190 190 0 0 1 300 110 Z" 
                fill="url(#cotes-de-geneve)" />

          <!-- Twin-Series Mainspring Barrels (Top Left & Top Right) -->
          <g id="comp-barrel" class="inspectable" data-id="barrel" style="cursor: pointer;">
            <!-- Barrel 1 -->
            <circle cx="220" cy="205" r="54" fill="#141720" stroke="url(#metal-primary)" stroke-width="1.5" />
            <circle cx="220" cy="205" r="54" stroke="${pal.caseStroke}" stroke-width="1" stroke-dasharray="2 3" />
            <!-- Barrel 2 -->
            <circle cx="380" cy="205" r="54" fill="#141720" stroke="url(#metal-primary)" stroke-width="1.5" />
            <circle cx="380" cy="205" r="54" stroke="${pal.caseStroke}" stroke-width="1" stroke-dasharray="2 3" />
            <!-- Coupling Center Wheel -->
            <circle cx="300" cy="180" r="32" fill="#111319" stroke="${pal.caseStroke}" stroke-width="1.2" />
          </g>

          <!-- Screwed Gold Chatons with Ruby Jewels & Heat-Blued Screws -->
          <g id="comp-chatons" class="inspectable" data-id="chatons" style="cursor: pointer;">
            <!-- Chaton 1: Center Wheel -->
            <circle cx="300" cy="300" r="14" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="1" />
            <circle cx="300" cy="300" r="7" fill="url(#ruby-jewel-grad)" />
            <circle cx="300" cy="300" r="2.5" fill="#0c0e12" />
            <circle cx="300" cy="289" r="2" fill="url(#blued-screw-grad)" />
            <circle cx="310" cy="306" r="2" fill="url(#blued-screw-grad)" />
            <circle cx="290" cy="306" r="2" fill="url(#blued-screw-grad)" />

            <!-- Chaton 2: Barrel Pivot 1 -->
            <circle cx="220" cy="205" r="12" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="1" />
            <circle cx="220" cy="205" r="6" fill="url(#ruby-jewel-grad)" />
            <circle cx="220" cy="205" r="2" fill="#0c0e12" />
            <circle cx="220" cy="196" r="1.8" fill="url(#blued-screw-grad)" />
            <circle cx="228" cy="210" r="1.8" fill="url(#blued-screw-grad)" />
            <circle cx="212" cy="210" r="1.8" fill="url(#blued-screw-grad)" />

            <!-- Chaton 3: Barrel Pivot 2 -->
            <circle cx="380" cy="205" r="12" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="1" />
            <circle cx="380" cy="205" r="6" fill="url(#ruby-jewel-grad)" />
            <circle cx="380" cy="205" r="2" fill="#0c0e12" />
            <circle cx="380" cy="196" r="1.8" fill="url(#blued-screw-grad)" />
            <circle cx="388" cy="210" r="1.8" fill="url(#blued-screw-grad)" />
            <circle cx="372" cy="210" r="1.8" fill="url(#blued-screw-grad)" />

            <!-- Chaton 4: Third Wheel -->
            <circle cx="385" cy="310" r="11" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="1" />
            <circle cx="385" cy="310" r="5" fill="url(#ruby-jewel-grad)" />
            <circle cx="385" cy="310" r="1.8" fill="#0c0e12" />
            <circle cx="385" cy="302" r="1.6" fill="url(#blued-screw-grad)" />
            <circle cx="392" cy="314" r="1.6" fill="url(#blued-screw-grad)" />
            <circle cx="378" cy="314" r="1.6" fill="url(#blued-screw-grad)" />
          </g>
        </g>

        <!-- LAYER: ESCAPEMENT & VARIABLE-INERTIA BALANCE (6 O'CLOCK OPEN HEART) -->
        <g id="layer-escapement" class="schematic-layer inspectable" data-id="balance" style="cursor: pointer;">
          <!-- Hand-Engraved Balance Cock Bridge at 6 o'clock -->
          <path d="M 230 420 Q 300 370 370 420 L 355 450 Q 300 410 245 450 Z" 
                fill="${pal.plateFill}" stroke="${pal.caseStroke}" stroke-width="1.5" />
          <circle cx="240" cy="432" r="3" fill="url(#blued-screw-grad)" />
          <circle cx="360" cy="432" r="3" fill="url(#blued-screw-grad)" />

          <!-- Swiss Lever Escape Wheel (15 Teeth) -->
          <g id="vector-escape-wheel" transform="translate(355, 385)">
            <circle cx="0" cy="0" r="26" fill="none" stroke="${pal.caseStroke}" stroke-width="1" />
            <!-- 15 Club Teeth -->
            ${Array.from({ length: 15 }, (_, i) => {
              const a = (i / 15) * 360;
              return `<path d="M 26 0 L 32 -3 L 30 4 Z" fill="url(#metal-primary)" transform="rotate(${a})" />`;
            }).join('')}
            <circle cx="0" cy="0" r="4" fill="url(#ruby-jewel-grad)" />
          </g>

          <!-- Pallet Fork with Ruby Stones -->
          <g id="vector-pallet-fork" transform="translate(330, 405)">
            <line x1="-12" y1="0" x2="16" y2="0" stroke="url(#metal-primary)" stroke-width="2" />
            <!-- Entry Jewel -->
            <rect x="-14" y="-3" width="5" height="3" fill="url(#ruby-jewel-grad)" />
            <!-- Exit Jewel -->
            <rect x="12" y="-3" width="5" height="3" fill="url(#ruby-jewel-grad)" />
          </g>

          <!-- VARIABLE-INERTIA GLUCYDUR BALANCE WHEEL WITH HARMONIC OSCILLATION -->
          <g id="vector-balance-oscillator" transform="translate(300, 420)">
            <!-- Outer Gold Rim -->
            <circle cx="0" cy="0" r="62" fill="none" stroke="url(#metal-primary)" stroke-width="3" />
            
            <!-- 16 Gold Poising Screws on Rim -->
            ${Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * 360;
              return `<rect x="62" y="-2" width="5" height="4" rx="1" fill="${pal.caseStroke}" transform="rotate(${a})" />`;
            }).join('')}

            <!-- 2 Crossed Beveled Spokes -->
            <line x1="-62" y1="0" x2="62" y2="0" stroke="url(#metal-primary)" stroke-width="2.5" />
            <line x1="0" y1="-62" x2="0" y2="62" stroke="url(#metal-primary)" stroke-width="2.5" />

            <!-- BREGUET OVERCOIL HAIRSPRING (Heat-blued spring spiral) -->
            <path id="vector-hairspring" fill="none" stroke="#3a7bd5" stroke-width="1.4" />

            <!-- Center Incabloc Shock Protection Jewel -->
            <circle cx="0" cy="0" r="10" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="1" />
            <circle cx="0" cy="0" r="6" fill="url(#ruby-jewel-grad)" />
            <!-- Lyre Spring Clip -->
            <circle cx="0" cy="0" r="3" fill="none" stroke="#f0f2f5" stroke-width="1" />
          </g>
        </g>

        <!-- LAYER: DIAL FACIA & CHAPTER RING -->
        <g id="layer-dial" class="schematic-layer inspectable" data-id="dial" style="cursor: pointer;">
          <!-- Dial Base Plate with Clous de Paris Guilloché Texture -->
          <circle cx="300" cy="300" r="188" fill="${pal.dialFill}" stroke="#222634" stroke-width="1" />
          <circle cx="300" cy="300" r="188" fill="url(#clous-de-paris)" opacity="0.6" />

          <!-- Open-Heart Cutaway Aperture at 6 o'clock (reveals balance below) -->
          <circle cx="300" cy="420" r="68" fill="none" stroke="${pal.caseStroke}" stroke-width="2" />
          <circle cx="300" cy="420" r="70" fill="none" stroke="#2a3040" stroke-width="1" />

          <!-- Outer 60-Minute Chapter Ring Track -->
          <circle cx="300" cy="300" r="182" fill="none" stroke="${pal.caseStroke}" stroke-width="1" />
          <circle cx="300" cy="300" r="168" fill="none" stroke="${pal.caseStroke}" stroke-width="1" stroke-dasharray="1 3" />

          <!-- 60 Minute / Second Hash Markers -->
          ${Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * 360;
            const isFive = i % 5 === 0;
            const len = isFive ? 12 : 6;
            const strokeW = isFive ? 2 : 1;
            const color = isFive ? pal.caseStroke : '#4a5265';
            return `<line x1="300" y1="${300 - 182}" x2="300" y2="${300 - 182 + len}" stroke="${color}" stroke-width="${strokeW}" transform="rotate(${a} 300 300)" />`;
          }).join('')}

          <!-- 12 Applied Faceted Arrowhead Hour Markers -->
          ${Array.from({ length: 12 }, (_, i) => {
            if (i === 6) return ''; // Skip 6 o'clock for open heart
            const a = (i / 12) * 360;
            const isTwelve = i === 0;
            return isTwelve
              ? `<path d="M 297 122 L 300 138 L 303 122 Z M 294 122 L 297 138 L 300 122 Z" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="0.8" />`
              : `<polygon points="298,124 302,124 301,140 299,140" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="0.8" transform="rotate(${a} 300 300)" />`;
          }).join('')}

          <!-- Brand Cartouche Plaque -->
          <rect x="220" y="222" width="160" height="34" rx="2" fill="${pal.plateFill}" stroke="${pal.caseStroke}" stroke-width="1" />
          <text x="300" y="238" fill="${pal.caseStroke}" font-family="sans-serif" font-weight="700" font-size="11" letter-spacing="0.18em" text-anchor="middle">KÖNIG & SÖHNE</text>
          <text x="300" y="250" fill="#7a8396" font-family="monospace" font-size="8" letter-spacing="0.14em" text-anchor="middle">GLASHÜTTE I/SA</text>
        </g>

        <!-- LAYER: MOVING FACETED LANCETTE HANDS -->
        <g id="layer-hands" class="schematic-layer inspectable" data-id="hands" style="cursor: pointer;">
          <!-- Hour Hand (Faceted Lancette) -->
          <g id="vector-hour-hand" transform="translate(300, 300) rotate(310)">
            <polygon points="-5,14 0,18 5,14 3,-75 0,-85 -3,-75" fill="${pal.handsFill}" stroke="#141720" stroke-width="1" />
            <line x1="0" y1="16" x2="0" y2="-84" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
          </g>

          <!-- Minute Hand -->
          <g id="vector-min-hand" transform="translate(300, 300) rotate(55)">
            <polygon points="-4,16 0,20 4,16 2.5,-132 0,-144 -2.5,-132" fill="${pal.handsFill}" stroke="#141720" stroke-width="1" />
            <line x1="0" y1="18" x2="0" y2="-142" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
          </g>

          <!-- Central Sweeping Second Hand -->
          <g id="vector-sec-hand" transform="translate(300, 300)">
            <line x1="0" y1="28" x2="0" y2="-164" stroke="#e63968" stroke-width="1.6" />
            <circle cx="0" cy="18" r="4.5" fill="none" stroke="#e63968" stroke-width="1.6" />
            <circle cx="0" cy="0" r="5" fill="url(#metal-primary)" stroke="${pal.caseStroke}" stroke-width="1.2" />
          </g>
        </g>

        <!-- INTERACTIVE CALLOUT CROSSHAIR LAYER -->
        <g id="layer-callouts" opacity="0" style="transition: opacity 0.2s ease;">
          <circle id="callout-reticle" cx="300" cy="300" r="18" fill="none" stroke="#00e5ff" stroke-width="1.5" stroke-dasharray="4 2" />
          <polyline id="callout-line" points="300,300 360,260 480,260" fill="none" stroke="#00e5ff" stroke-width="1.5" />
          <rect id="callout-box" x="480" y="244" width="110" height="32" rx="2" fill="#0c0e14" stroke="#00e5ff" stroke-width="1" />
          <text id="callout-text" x="490" y="264" fill="#00e5ff" font-family="monospace" font-size="9" font-weight="700">INSPECT</text>
        </g>
      </svg>
    `;

    this.balanceOscillator = document.getElementById('vector-balance-oscillator');
    this.hairspringPath = document.getElementById('vector-hairspring');
    this.secHand = document.getElementById('vector-sec-hand');
    this.calloutLayer = document.getElementById('layer-callouts');
  }

  setMaterial(mat) {
    this.currentMaterial = mat;
    this.renderSVG();
    this.setupEvents();
  }

  setLayer(layer) {
    this.activeLayer = layer;
    const layers = ['layer-case', 'layer-movement', 'layer-escapement', 'layer-dial', 'layer-hands'];

    layers.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (layer === 'all') {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      } else if (layer === 'movement' && (id === 'layer-movement' || id === 'layer-escapement')) {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      } else if (layer === 'dial' && (id === 'layer-dial' || id === 'layer-hands')) {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      } else if (layer === 'escapement' && id === 'layer-escapement') {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      } else {
        el.style.opacity = '0.12';
        el.style.pointerEvents = 'none';
      }
    });
  }

  windCrown(hours = 14) {
    this.powerReserve = Math.min(72, this.powerReserve + hours);

    // Rotate ratchet teeth on crown click
    const escapeWheel = document.getElementById('vector-escape-wheel');
    if (escapeWheel) {
      escapeWheel.style.transition = 'transform 0.15s ease';
      escapeWheel.setAttribute('transform', `translate(355, 385) rotate(${Math.random() * 360})`);
    }

    const readout = document.getElementById('stat-power-reserve');
    if (readout) readout.textContent = `${this.powerReserve.toFixed(1)}h / 72h`;
    const bar = document.getElementById('reserve-bar-gauge');
    if (bar) bar.style.width = `${(this.powerReserve / 72) * 100}%`;
  }

  setupEvents() {
    // Crown click winding
    document.getElementById('crown-assembly')?.addEventListener('click', () => {
      this.windCrown(14);
    });

    // Inspectable hover highlights
    const inspectables = this.container.querySelectorAll('.inspectable');
    const badge = document.getElementById('inspect-badge-text');

    const descriptions = {
      balance: 'GLUCYDUR VARIABLE-INERTIA BALANCE // 4.0 HZ (28,800 VPH) WITH MASSELOTTES SCREWS',
      barrel: 'TWIN-SERIES MAINSPRING BARRELS // 72-HOUR ISOMAGNETIC POWER RESERVE',
      chatons: 'SCREWED 18K SOLID GOLD CHATONS // HEAT-BLUED STEEL MOUNTING FASTENERS',
      dial: 'HAND-TURNED CLOUS DE PARIS GUILLOCHÉ FACIA // OPEN-HEART REGULATION APERTURE',
      hands: 'HAND-BEVELED POLISHED STEEL LANCETTE HANDS // COUNTERWEIGHTED FLAME-RED SECONDS'
    };

    inspectables.forEach((el) => {
      el.addEventListener('pointerenter', () => {
        const id = el.dataset.id;
        if (descriptions[id] && badge) {
          badge.textContent = descriptions[id];
        }
      });
    });
  }

  animate(now) {
    requestAnimationFrame(this.animate);

    const time = now * 0.001;

    // Harmonic Balance Wheel oscillation at 4.0 Hz
    if (this.balanceOscillator) {
      const harmonicAngle = Math.sin(time * 25.13) * 88; // 4Hz = 2*PI*4 ≈ 25.13 rad/s, ~88 degrees swing
      this.balanceOscillator.setAttribute('transform', `translate(300, 420) rotate(${harmonicAngle})`);

      // Coiling spiral hairspring formula
      if (this.hairspringPath) {
        let d = '';
        const coils = 5;
        const steps = 100;
        const twist = harmonicAngle * 0.008;

        for (let i = 0; i <= steps; i++) {
          const frac = i / steps;
          const a = frac * coils * Math.PI * 2 + twist;
          const r = frac * 38 + 5;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (i === 0) d += `M ${x} ${y} `;
          else d += `L ${x} ${y} `;
        }
        this.hairspringPath.setAttribute('d', d);
      }
    }

    // Sweeping Seconds Hand
    if (this.secHand) {
      const secAngle = (time * 6) % 360; // 360 deg / 60 sec = 6 deg/sec
      this.secHand.setAttribute('transform', `translate(300, 300) rotate(${secAngle})`);
    }
  }
}

window.VectorWatchSchematic = VectorWatchSchematic;
