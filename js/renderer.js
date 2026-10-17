/**
 * CIPHER: PROTOCOL // Tactical Canvas 2D Renderer
 * Cyberpunk tactical grid, raycast vision cones, smooth movement, and high-contrast indicators
 */

class TacticalRenderer {
  constructor(canvas, engine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;

    this.tileSize = 64;
    this.offsetX = 0;
    this.offsetY = 0;
    this.dpr = window.devicePixelRatio || 1;

    // Smooth movement interpolation for player
    this.animPlayerX = 0;
    this.animPlayerY = 0;

    this.setupCanvas();
    window.addEventListener('resize', () => this.setupCanvas());

    this.engine.subscribe(() => {
      // Sync on state change
      if (this.engine.state) {
        // Snap or start lerp
      }
    });

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    if (this.engine.levelData) {
      this.recalculateLayout();
    }
  }

  recalculateLayout() {
    const lvl = this.engine.levelData;
    if (!lvl) return;

    // Calculate max tile size that fits comfortable within viewport
    const availWidth = this.width - 60;
    const availHeight = this.height - 60;
    const sizeX = Math.floor(availWidth / lvl.width);
    const sizeY = Math.floor(availHeight / lvl.height);
    this.tileSize = Math.max(48, Math.min(84, Math.min(sizeX, sizeY)));

    this.offsetX = Math.floor((this.width - lvl.width * this.tileSize) / 2);
    this.offsetY = Math.floor((this.height - lvl.height * this.tileSize) / 2);

    if (this.engine.state) {
      this.animPlayerX = this.engine.state.player.x;
      this.animPlayerY = this.engine.state.player.y;
    }
  }

  screenToGrid(screenX, screenY) {
    const gx = Math.floor((screenX - this.offsetX) / this.tileSize);
    const gy = Math.floor((screenY - this.offsetY) / this.tileSize);
    return { x: gx, y: gy };
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.render();
  }

  render() {
    if (!this.engine.state || !this.engine.levelData) return;

    const ctx = this.ctx;
    const lvl = this.engine.levelData;
    const state = this.engine.state;
    const ts = this.tileSize;
    const time = performance.now() * 0.003;

    // Lerp player smooth movement
    this.animPlayerX += (state.player.x - this.animPlayerX) * 0.25;
    this.animPlayerY += (state.player.y - this.animPlayerY) * 0.25;

    // Clear background: Dark obsidian
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#0e1015';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);

    // 1. Draw Floor Grid
    for (let x = 0; x < lvl.width; x++) {
      for (let y = 0; y < lvl.height; y++) {
        const px = x * ts;
        const py = y * ts;

        ctx.fillStyle = (x + y) % 2 === 0 ? '#13151b' : '#161920';
        ctx.fillRect(px + 1, py + 1, ts - 2, ts - 2);

        // Subtle tile boundary
        ctx.strokeStyle = '#1b1e28';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, ts - 1, ts - 1);
      }
    }

    // 2. Draw Vision Danger Cones on Floor (Glowing red / amber)
    state.dangerTiles.forEach((key) => {
      const [gx, gy] = key.split(',').map(Number);
      const px = gx * ts;
      const py = gy * ts;

      ctx.fillStyle = 'rgba(255, 51, 102, 0.18)';
      ctx.fillRect(px + 1, py + 1, ts - 2, ts - 2);

      // Warning crosshatch or border
      ctx.strokeStyle = 'rgba(255, 51, 102, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 2, py + 2, ts - 4, ts - 4);
    });

    // 3. Draw Exit Zone (Emerald Extraction)
    const exitPx = state.exit.x * ts;
    const exitPy = state.exit.y * ts;
    const allHacked = state.terminals.every(t => t.hacked);

    ctx.fillStyle = allHacked ? 'rgba(0, 255, 136, 0.25)' : 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(exitPx + 2, exitPy + 2, ts - 4, ts - 4);

    ctx.strokeStyle = allHacked ? '#00ff88' : '#4a5264';
    ctx.lineWidth = 2;
    ctx.strokeRect(exitPx + 4, exitPy + 4, ts - 8, ts - 8);

    ctx.fillStyle = allHacked ? '#00ff88' : '#8a94a6';
    ctx.font = `bold ${Math.floor(ts * 0.22)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', exitPx + ts / 2, exitPy + ts / 2);

    // 4. Draw Walls (Heavy armored blast blocks)
    state.walls.forEach((w) => {
      const wx = w.x * ts;
      const wy = w.y * ts;

      ctx.fillStyle = '#1e222c';
      ctx.fillRect(wx + 2, wy + 2, ts - 4, ts - 4);

      ctx.fillStyle = '#282e3c';
      ctx.fillRect(wx + 4, wy + 4, ts - 8, ts - 8);

      // Diagonal hazard line or inner bevel
      ctx.strokeStyle = '#394256';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wx + 4, wy + 4, ts - 8, ts - 8);
    });

    // 5. Draw Security Doors
    state.doors.forEach((door) => {
      const dx = door.x * ts;
      const dy = door.y * ts;

      if (door.locked) {
        ctx.fillStyle = '#3a1920';
        ctx.fillRect(dx + 4, dy + 4, ts - 8, ts - 8);
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 2;
        ctx.strokeRect(dx + 4, dy + 4, ts - 8, ts - 8);

        ctx.fillStyle = '#ff3366';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LOCKED', dx + ts / 2, dy + ts / 2);
      } else {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.12)';
        ctx.fillRect(dx + 4, dy + 4, ts - 8, ts - 8);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(dx + 4, dy + 4, ts - 8, ts - 8);

        ctx.fillStyle = '#00ff88';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('OPEN', dx + ts / 2, dy + ts / 2);
      }
    });

    // 6. Draw Lasers
    state.lasers.forEach((laser) => {
      const lx = laser.x * ts;
      const ly = laser.y * ts;

      if (laser.active) {
        ctx.strokeStyle = '#ff2a2a';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ff2a2a';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(lx, ly + ts / 2);
        ctx.lineTo(lx + ts, ly + ts / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Inactive dashed standby laser
        ctx.strokeStyle = 'rgba(255, 42, 42, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(lx, ly + ts / 2);
        ctx.lineTo(lx + ts, ly + ts / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 7. Draw Terminals
    state.terminals.forEach((term) => {
      const tx = term.x * ts + ts / 2;
      const ty = term.y * ts + ts / 2;
      const size = ts * 0.32;

      ctx.save();
      ctx.translate(tx, ty);

      if (term.hacked) {
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 8;
        ctx.fillRect(-size / 2, -size / 2, size, size);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10 + Math.sin(time * 3) * 4;
        ctx.fillRect(-size / 2, -size / 2, size, size);
      }

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0e1015';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(term.hacked ? '✓' : '⚡', 0, 0);
      ctx.restore();
    });

    // 8. Draw Smoke Clouds
    state.smokeClouds.forEach((sc) => {
      const sx = sc.x * ts + ts / 2;
      const sy = sc.y * ts + ts / 2;
      ctx.fillStyle = 'rgba(180, 190, 205, 0.45)';
      ctx.beginPath();
      ctx.arc(sx, sy, ts * 0.42, 0, Math.PI * 2);
      ctx.fill();
    });

    // 9. Draw Active Decoy
    if (state.activeDecoy) {
      const decX = state.activeDecoy.x * ts + ts / 2;
      const decY = state.activeDecoy.y * ts + ts / 2;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(decX, decY, (ts * 0.3) + Math.sin(time * 4) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 10. Draw Cameras
    state.cameras.forEach((cam) => {
      const cx = cam.x * ts + ts / 2;
      const cy = cam.y * ts + ts / 2;

      ctx.save();
      ctx.translate(cx, cy);

      // Rotate to camera facing angle
      const rot = cam.facing === 'up' ? -Math.PI / 2
        : cam.facing === 'down' ? Math.PI / 2
        : cam.facing === 'left' ? Math.PI : 0;
      ctx.rotate(rot);

      ctx.fillStyle = '#2f3545';
      ctx.beginPath();
      ctx.arc(0, 0, ts * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Camera lens
      ctx.fillStyle = state.empTurnsLeft > 0 ? '#5a6275' : '#ff3366';
      ctx.fillRect(ts * 0.15, -4, 8, 8);

      ctx.restore();
    });

    // 11. Draw Patrol Guards
    state.guards.forEach((guard) => {
      const gx = guard.x * ts + ts / 2;
      const gy = guard.y * ts + ts / 2;

      ctx.save();
      ctx.translate(gx, gy);

      // Rotate toward facing direction
      const rot = guard.facing === 'up' ? -Math.PI / 2
        : guard.facing === 'down' ? Math.PI / 2
        : guard.facing === 'left' ? Math.PI : 0;
      ctx.rotate(rot);

      // Guard Armor Body
      ctx.fillStyle = '#ff3366';
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, ts * 0.26, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Visor / Weapon barrel
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ts * 0.1, -3, 8, 6);

      ctx.restore();
    });

    // 12. Draw Player Operative
    const px = this.animPlayerX * ts + ts / 2;
    const py = this.animPlayerY * ts + ts / 2;

    ctx.save();
    ctx.translate(px, py);

    // Cyan Stealth Aura
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 14 + Math.sin(time * 4) * 3;

    // Diamond operative avatar
    const pSize = ts * 0.28;
    ctx.beginPath();
    ctx.moveTo(0, -pSize);
    ctx.lineTo(pSize, 0);
    ctx.lineTo(0, pSize);
    ctx.lineTo(-pSize, 0);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0a1017';
    ctx.beginPath();
    ctx.arc(0, 0, pSize * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.restore();
  }
}

window.TacticalRenderer = TacticalRenderer;
