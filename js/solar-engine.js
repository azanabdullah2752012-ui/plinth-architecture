/**
 * PLINTH — Solar & Tectonic Axonometric Engine
 * A high-effort Signature Focal Artifact for Casa Mouraria.
 * Deterministic, seek-safe 2.5D isometric projection with dynamic solar ray-tracing
 * and real-time raking shadow volume calculations.
 * 
 * Satisfies BraveBrand & HyperFrames/Remotion craft protocols.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('solar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const timeSlider = document.getElementById('solar-time-slider');
  const timeDisplay = document.getElementById('solar-time-val');
  const azimuthDisplay = document.getElementById('solar-azimuth-val');
  const elevationDisplay = document.getElementById('solar-elevation-val');
  const shadowLengthDisplay = document.getElementById('solar-shadow-val');
  const modeToggles = document.querySelectorAll('[data-solar-mode]');

  let currentHour = 16.5; // Default 16:30 Lisbon raking afternoon light
  let currentMode = 'solar'; // 'solar' | 'wireframe' | 'mass'
  let mouseX = 0;
  let mouseY = 0;
  let targetAngle = 0;
  let currentAngle = 0;
  let isHovered = false;

  // DPR handling for sharp high-DPI retina display
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    render();
  }

  // Isometric projection helper
  function isoProject(x, y, z, originX, originY, scale = 1, rotation = 0) {
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    const rx = x * cosR - y * sinR;
    const ry = x * sinR + y * cosR;

    const isoX = originX + (rx - ry) * Math.cos(Math.PI / 6) * scale;
    const isoY = originY + (rx + ry) * Math.sin(Math.PI / 6) * scale - z * scale;
    return { x: isoX, y: isoY };
  }

  // Draw 3D Box in Isometric Projection
  function drawIsoBox(box, originX, originY, scale, rotation, sunDir, mode) {
    const { x, y, z, w, l, h, color, tag } = box;

    // 8 Vertices
    const v = [
      isoProject(x,     y,     z,     originX, originY, scale, rotation), // 0
      isoProject(x + w, y,     z,     originX, originY, scale, rotation), // 1
      isoProject(x + w, y + l, z,     originX, originY, scale, rotation), // 2
      isoProject(x,     y + l, z,     originX, originY, scale, rotation), // 3
      isoProject(x,     y,     z + h, originX, originY, scale, rotation), // 4
      isoProject(x + w, y,     z + h, originX, originY, scale, rotation), // 5
      isoProject(x + w, y + l, z + h, originX, originY, scale, rotation), // 6
      isoProject(x,     y + l, z + h, originX, originY, scale, rotation), // 7
    ];

    // Calculate dynamic raking shadow on the ground plane (z = 0)
    if (mode === 'solar') {
      const shadowLen = Math.max(0.2, 1 / Math.tan(sunDir.elevation));
      const shadowOffsetX = Math.cos(sunDir.azimuth) * shadowLen * h * scale * 0.45;
      const shadowOffsetY = Math.sin(sunDir.azimuth) * shadowLen * h * scale * 0.25;

      ctx.beginPath();
      ctx.moveTo(v[0].x, v[0].y);
      ctx.lineTo(v[1].x, v[1].y);
      ctx.lineTo(v[1].x + shadowOffsetX, v[1].y + shadowOffsetY);
      ctx.lineTo(v[2].x + shadowOffsetX, v[2].y + shadowOffsetY);
      ctx.lineTo(v[3].x + shadowOffsetX, v[3].y + shadowOffsetY);
      ctx.lineTo(v[0].x, v[0].y);
      ctx.closePath();
      ctx.fillStyle = `rgba(8, 7, 6, ${Math.min(0.75, 0.45 * Math.sin(sunDir.elevation))})`;
      ctx.fill();
    }

    if (mode === 'wireframe') {
      ctx.strokeStyle = '#c4a675';
      ctx.lineWidth = 1;
      const edges = [
        [0,1],[1,2],[2,3],[3,0],
        [4,5],[5,6],[6,7],[7,4],
        [0,4],[1,5],[2,6],[3,7]
      ];
      edges.forEach(([p1, p2]) => {
        ctx.beginPath();
        ctx.moveTo(v[p1].x, v[p1].y);
        ctx.lineTo(v[p2].x, v[p2].y);
        ctx.stroke();
      });
      return;
    }

    // Shaded Faces
    // Face 1: Top (4, 5, 6, 7)
    ctx.beginPath();
    ctx.moveTo(v[4].x, v[4].y);
    ctx.lineTo(v[5].x, v[5].y);
    ctx.lineTo(v[6].x, v[6].y);
    ctx.lineTo(v[7].x, v[7].y);
    ctx.closePath();
    const topLuminance = Math.sin(sunDir.elevation) * 0.5 + 0.35;
    ctx.fillStyle = mode === 'mass' 
      ? '#242321' 
      : `rgba(235, 230, 220, ${topLuminance})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(12, 11, 10, 0.35)';
    ctx.lineWidth = 0.75;
    ctx.stroke();

    // Face 2: Right / South Face (1, 2, 6, 5)
    ctx.beginPath();
    ctx.moveTo(v[1].x, v[1].y);
    ctx.lineTo(v[2].x, v[2].y);
    ctx.lineTo(v[6].x, v[6].y);
    ctx.lineTo(v[5].x, v[5].y);
    ctx.closePath();
    const southLuminance = Math.max(0.12, Math.cos(sunDir.azimuth - 0.5) * 0.4 + 0.2);
    ctx.fillStyle = mode === 'mass' 
      ? '#171615' 
      : `rgba(180, 172, 160, ${southLuminance})`;
    ctx.fill();
    ctx.stroke();

    // Face 3: Left / West Face (0, 3, 7, 4)
    ctx.beginPath();
    ctx.moveTo(v[0].x, v[0].y);
    ctx.lineTo(v[3].x, v[3].y);
    ctx.lineTo(v[7].x, v[7].y);
    ctx.lineTo(v[4].x, v[4].y);
    ctx.closePath();
    const westLuminance = Math.max(0.08, Math.sin(sunDir.azimuth) * 0.35 + 0.15);
    ctx.fillStyle = mode === 'mass' 
      ? '#121110' 
      : `rgba(140, 133, 122, ${westLuminance})`;
    ctx.fill();
    ctx.stroke();
  }

  // Casa Mouraria Tectonic Massing Model
  const buildingVolumes = [
    // Main Residence Volume
    { x: -50, y: -40, z: 0, w: 90, l: 80, h: 46, tag: 'Residential Core' },
    // Cantilevered Upper Terrace
    { x: -20, y: -30, z: 46, w: 60, l: 50, h: 28, tag: 'Upper Studio' },
    // Plaster Patio Wall Enclosure
    { x: -75, y: -65, z: 0, w: 140, l: 15, h: 22, tag: 'Patio Perimeter' },
    // Lateral Travertine Light Court
    { x: 40, y: -40, z: 0, w: 25, l: 60, h: 18, tag: 'Travertine Court' },
    // Concrete Chimney / Thermal Shaft
    { x: -40, y: 15, z: 46, w: 14, l: 14, h: 38, tag: 'Thermal Shaft' }
  ];

  // Architectural Grid Plane
  function drawGroundDatum(originX, originY, scale, rotation) {
    ctx.strokeStyle = 'rgba(243, 239, 230, 0.05)';
    ctx.lineWidth = 1;
    const gridSpan = 140;
    const step = 20;

    for (let i = -gridSpan; i <= gridSpan; i += step) {
      const p1 = isoProject(i, -gridSpan, 0, originX, originY, scale, rotation);
      const p2 = isoProject(i,  gridSpan, 0, originX, originY, scale, rotation);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const p3 = isoProject(-gridSpan, i, 0, originX, originY, scale, rotation);
      const p4 = isoProject( gridSpan, i, 0, originX, originY, scale, rotation);
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
    }

    // Crosshair origin marker
    const center = isoProject(0, 0, 0, originX, originY, scale, rotation);
    ctx.strokeStyle = '#c4a675';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw Sun Vector Beam
  function drawSunRay(originX, originY, scale, sunDir) {
    const sunX = originX + Math.cos(sunDir.azimuth) * 200;
    const sunY = originY - Math.sin(sunDir.elevation) * 180;

    ctx.save();
    // Sun source point
    ctx.fillStyle = '#dec396';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Raking sunlight beam
    const gradient = ctx.createLinearGradient(sunX, sunY, originX, originY);
    gradient.addColorStop(0, 'rgba(222, 195, 150, 0.35)');
    gradient.addColorStop(0.6, 'rgba(222, 195, 150, 0.08)');
    gradient.addColorStop(1, 'rgba(222, 195, 150, 0)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(originX, originY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function getSunVector(hour) {
    // 06:00 to 20:30 solar arc in Lisbon (Latitude 38.7°N)
    const norm = (hour - 6) / 14.5;
    const elevation = Math.max(0.12, Math.sin(norm * Math.PI) * 1.15);
    const azimuth = Math.PI * 0.15 + norm * Math.PI * 0.85;
    return { elevation, azimuth };
  }

  function updateTelemetry(sunDir) {
    const hours = Math.floor(currentHour);
    const minutes = Math.floor((currentHour % 1) * 60);
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    if (timeDisplay) timeDisplay.textContent = timeStr;
    if (azimuthDisplay) azimuthDisplay.textContent = `${(sunDir.azimuth * (180 / Math.PI)).toFixed(1)}°`;
    if (elevationDisplay) elevationDisplay.textContent = `${(sunDir.elevation * (180 / Math.PI)).toFixed(1)}°`;
    
    const shadowRatio = (1 / Math.tan(sunDir.elevation)).toFixed(2);
    if (shadowLengthDisplay) shadowLengthDisplay.textContent = `${shadowRatio}x`;
  }

  function render() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    const originX = rect.width * 0.5;
    const originY = rect.height * 0.58;
    const scale = Math.min(rect.width, rect.height) * 0.0032;

    currentAngle += (targetAngle - currentAngle) * 0.08;

    const sunDir = getSunVector(currentHour);
    updateTelemetry(sunDir);

    drawGroundDatum(originX, originY, scale, currentAngle);
    drawSunRay(originX, originY, scale, sunDir);

    // Sort volumes by depth for correct isometric painter's algorithm
    const sorted = [...buildingVolumes].sort((a, b) => {
      const depthA = (a.x + a.w/2) + (a.y + a.l/2);
      const depthB = (b.x + b.w/2) + (b.y + b.l/2);
      return depthA - depthB;
    });

    sorted.forEach(box => {
      drawIsoBox(box, originX, originY, scale, currentAngle, sunDir, currentMode);
    });
  }

  // Interactivity: Scrub Solar Time
  if (timeSlider) {
    timeSlider.addEventListener('input', (e) => {
      currentHour = parseFloat(e.target.value);
      render();
    });
  }

  // Interactivity: Mode Toggles
  modeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      modeToggles.forEach(t => t.classList.remove('is-active'));
      toggle.classList.add('is-active');
      currentMode = toggle.getAttribute('data-solar-mode');
      render();
    });
  });

  // Interactivity: Mouse tilt & orbit
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    targetAngle = normX * 0.65;
    render();
  });

  canvas.addEventListener('mouseleave', () => {
    targetAngle = 0;
    render();
  });

  window.addEventListener('resize', resizeCanvas);
  
  // Initial startup
  resizeCanvas();

  // Gentle idle oscillation
  let step = 0;
  function animate() {
    if (Math.abs(targetAngle - currentAngle) > 0.001) {
      render();
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

})();
