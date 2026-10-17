/**
 * CIPHER: PROTOCOL // Core Tactical Stealth Engine
 * Deterministic turn-based simulation, line-of-sight raycasting, and infinite state rewind
 */

class GameEngine {
  constructor() {
    this.currentLevelIndex = 0;
    this.levelData = null;
    this.state = null;
    this.history = []; // Stack of states for infinite undo
    this.status = 'PLAYING'; // 'PLAYING', 'DETECTED', 'VICTORY'
    this.turnCount = 0;
    this.detectionCause = '';

    this.listeners = new Set();
  }

  loadLevel(levelIndex, customLevel = null) {
    if (customLevel) {
      this.levelData = customLevel;
    } else {
      this.currentLevelIndex = levelIndex;
      this.levelData = window.LEVELS[levelIndex] || window.LEVELS[0];
    }

    this.turnCount = 0;
    this.history = [];
    this.status = 'PLAYING';
    this.detectionCause = '';

    // Initialize fresh state from level data
    this.state = {
      player: { x: this.levelData.player.x, y: this.levelData.player.y },
      exit: { ...this.levelData.exit },
      terminals: this.levelData.terminals.map(t => ({ ...t, hacked: false })),
      doors: this.levelData.doors.map(d => ({ ...d })),
      walls: this.levelData.walls.map(w => ({ ...w })),
      guards: this.levelData.guards.map(g => ({
        ...g,
        x: g.x,
        y: g.y,
        facing: g.facing,
        pathIndex: g.pathIndex || 0
      })),
      cameras: this.levelData.cameras.map(c => ({
        ...c,
        facing: c.facing,
        angleIndex: c.angleIndex || 0
      })),
      lasers: this.levelData.lasers.map(l => ({ ...l })),
      items: { ...this.levelData.items },
      // Active turn-limited modifiers
      smokeClouds: [], // Array<{ x, y, turnsLeft }>
      empTurnsLeft: 0,
      activeDecoy: null, // { x, y, turnsLeft }
      // Computed vision cones
      dangerTiles: new Set()
    };

    this.recomputeVision();
    this.notify();
  }

  cloneState() {
    return JSON.parse(JSON.stringify({
      state: this.state,
      turnCount: this.turnCount,
      status: this.status
    }));
  }

  saveSnapshot() {
    this.history.push(this.cloneState());
  }

  undo() {
    if (this.history.length === 0) return false;
    const snapshot = this.history.pop();
    this.state = snapshot.state;
    this.turnCount = snapshot.turnCount;
    this.status = snapshot.status;
    this.detectionCause = '';
    this.recomputeVision();
    this.notify();
    return true;
  }

  restart() {
    this.loadLevel(this.currentLevelIndex, this.levelData.id === 99 ? this.levelData : null);
  }

  // --- Player Actions ---
  movePlayer(dx, dy) {
    if (this.status !== 'PLAYING') return false;

    const targetX = this.state.player.x + dx;
    const targetY = this.state.player.y + dy;

    // Bounds check
    if (targetX < 0 || targetX >= this.levelData.width || targetY < 0 || targetY >= this.levelData.height) {
      return false;
    }

    // Wall collision
    if (this.isWall(targetX, targetY)) return false;

    // Closed Door collision
    const door = this.getDoor(targetX, targetY);
    if (door && door.locked) return false;

    // Save snapshot for Undo
    this.saveSnapshot();

    // Execute move
    this.state.player.x = targetX;
    this.state.player.y = targetY;
    this.turnCount++;

    // Process turn events
    this.resolveTurn();
    return true;
  }

  waitTurn() {
    if (this.status !== 'PLAYING') return false;
    this.saveSnapshot();
    this.turnCount++;
    this.resolveTurn();
    return true;
  }

  useEmp() {
    if (this.status !== 'PLAYING' || this.state.items.emp <= 0) return false;
    this.saveSnapshot();
    this.state.items.emp--;
    this.state.empTurnsLeft = 3; // Disables electronics for 3 turns
    this.turnCount++;
    this.resolveTurn();
    return true;
  }

  useSmoke() {
    if (this.status !== 'PLAYING' || this.state.items.smoke <= 0) return false;
    this.saveSnapshot();
    this.state.items.smoke--;
    const px = this.state.player.x;
    const py = this.state.player.y;

    // Create 3x3 smoke cloud around player
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const sx = px + ox;
        const sy = py + oy;
        if (sx >= 0 && sx < this.levelData.width && sy >= 0 && sy < this.levelData.height) {
          this.state.smokeClouds.push({ x: sx, y: sy, turnsLeft: 4 });
        }
      }
    }

    this.turnCount++;
    this.resolveTurn();
    return true;
  }

  useDecoy(targetX, targetY) {
    if (this.status !== 'PLAYING' || this.state.items.decoy <= 0) return false;
    if (this.isWall(targetX, targetY)) return false;

    this.saveSnapshot();
    this.state.items.decoy--;
    this.state.activeDecoy = { x: targetX, y: targetY, turnsLeft: 4 };
    this.turnCount++;
    this.resolveTurn();
    return true;
  }

  // --- Turn Execution Lifecycle ---
  resolveTurn() {
    // 1. Check Terminal hack at player position
    for (let term of this.state.terminals) {
      if (!term.hacked && term.x === this.state.player.x && term.y === this.state.player.y) {
        term.hacked = true;
        // Unlock doors associated with this terminal
        for (let door of this.state.doors) {
          if (door.requiredTerminal === term.id) {
            door.locked = false;
          }
        }
      }
    }

    // 2. Decrement temporary effects
    if (this.state.empTurnsLeft > 0) this.state.empTurnsLeft--;

    this.state.smokeClouds.forEach(sc => sc.turnsLeft--);
    this.state.smokeClouds = this.state.smokeClouds.filter(sc => sc.turnsLeft > 0);

    if (this.state.activeDecoy) {
      this.state.activeDecoy.turnsLeft--;
      if (this.state.activeDecoy.turnsLeft <= 0) this.state.activeDecoy = null;
    }

    // 3. Move Guards along patrol path or toward Decoy
    this.state.guards.forEach((guard) => {
      if (this.state.activeDecoy) {
        // Distracted towards decoy
        const dx = Math.sign(this.state.activeDecoy.x - guard.x);
        const dy = Math.sign(this.state.activeDecoy.y - guard.y);
        if (dx !== 0 && !this.isBlocked(guard.x + dx, guard.y)) {
          guard.x += dx;
          guard.facing = dx > 0 ? 'right' : 'left';
        } else if (dy !== 0 && !this.isBlocked(guard.x, guard.y + dy)) {
          guard.y += dy;
          guard.facing = dy > 0 ? 'down' : 'up';
        }
      } else if (guard.path && guard.path.length > 0) {
        // Normal patrol step
        guard.pathIndex = (guard.pathIndex + 1) % guard.path.length;
        const targetPoint = guard.path[guard.pathIndex];
        guard.x = targetPoint.x;
        guard.y = targetPoint.y;
        guard.facing = targetPoint.facing;
      }
    });

    // 4. Rotate Cameras (unless disabled by EMP)
    if (this.state.empTurnsLeft <= 0) {
      this.state.cameras.forEach((cam) => {
        if (cam.angles && cam.angles.length > 0) {
          cam.angleIndex = (cam.angleIndex + 1) % cam.angles.length;
          cam.facing = cam.angles[cam.angleIndex];
        }
      });
    }

    // 5. Cycle Lasers (unless disabled by EMP)
    if (this.state.empTurnsLeft <= 0) {
      this.state.lasers.forEach((laser) => {
        laser.timer = (laser.timer + 1) % laser.cycle;
        laser.active = (laser.timer === 0);
      });
    } else {
      this.state.lasers.forEach(l => l.active = false);
    }

    // 6. Recalculate Vision & Danger Cones
    this.recomputeVision();

    // 7. Check Detection
    const playerKey = `${this.state.player.x},${this.state.player.y}`;
    if (this.state.dangerTiles.has(playerKey)) {
      this.status = 'DETECTED';
      this.detectionCause = 'SURVEILLANCE ALARM TRIGGERED';
    }

    // Check direct guard collision
    for (let guard of this.state.guards) {
      if (guard.x === this.state.player.x && guard.y === this.state.player.y) {
        this.status = 'DETECTED';
        this.detectionCause = 'INTERCEPTED BY GUARD';
      }
    }

    // Check active laser collision
    for (let laser of this.state.lasers) {
      if (laser.active && laser.x === this.state.player.x && laser.y === this.state.player.y) {
        this.status = 'DETECTED';
        this.detectionCause = 'TRIPPED INFRARED LASER';
      }
    }

    // 8. Check Victory (At Exit + All Terminals Hacked)
    const allTerminalsHacked = this.state.terminals.every(t => t.hacked);
    if (
      this.status === 'PLAYING' &&
      this.state.player.x === this.state.exit.x &&
      this.state.player.y === this.state.exit.y &&
      allTerminalsHacked
    ) {
      this.status = 'VICTORY';
    }

    this.notify();
  }

  // --- Vision Cone Raycasting ---
  recomputeVision() {
    const danger = new Set();
    const isEmpActive = this.state.empTurnsLeft > 0;

    // Guard vision cones
    this.state.guards.forEach((guard) => {
      const coneTiles = this.calculateCone(guard.x, guard.y, guard.facing, 3);
      coneTiles.forEach(t => danger.add(`${t.x},${t.y}`));
    });

    // Camera vision cones
    if (!isEmpActive) {
      this.state.cameras.forEach((cam) => {
        const coneTiles = this.calculateCone(cam.x, cam.y, cam.facing, 4);
        coneTiles.forEach(t => danger.add(`${t.x},${t.y}`));
      });
    }

    // Active lasers
    if (!isEmpActive) {
      this.state.lasers.forEach((laser) => {
        if (laser.active) {
          danger.add(`${laser.x},${laser.y}`);
        }
      });
    }

    this.state.dangerTiles = danger;
  }

  calculateCone(originX, originY, facing, depth) {
    const tiles = [];
    const dirMap = {
      up: { dx: 0, dy: -1, pDx: 1, pDy: 0 },
      down: { dx: 0, dy: 1, pDx: 1, pDy: 0 },
      left: { dx: -1, dy: 0, pDx: 0, pDy: 1 },
      right: { dx: 1, dy: 0, pDx: 0, pDy: 1 }
    };

    const dir = dirMap[facing] || dirMap.down;

    for (let d = 1; d <= depth; d++) {
      const spread = d - 1;
      for (let s = -spread; s <= spread; s++) {
        const tx = originX + dir.dx * d + dir.pDx * s;
        const ty = originY + dir.dy * d + dir.pDy * s;

        // Bounds check
        if (tx < 0 || tx >= this.levelData.width || ty < 0 || ty >= this.levelData.height) {
          continue;
        }

        // Raycast line of sight check from origin to tile
        if (!this.hasLineOfSight(originX, originY, tx, ty)) {
          continue;
        }

        tiles.push({ x: tx, y: ty });
      }
    }
    return tiles;
  }

  hasLineOfSight(x0, y0, x1, y1) {
    // Bresenham line algorithm
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;

    while (cx !== x1 || cy !== y1) {
      // Check if blocked (skip origin)
      if (cx !== x0 || cy !== y0) {
        if (this.isVisionObscured(cx, cy)) {
          return false;
        }
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }

    return true;
  }

  isVisionObscured(x, y) {
    if (this.isWall(x, y)) return true;
    const door = this.getDoor(x, y);
    if (door && door.locked) return true;
    // Smoke blocks vision
    if (this.state.smokeClouds.some(sc => sc.x === x && sc.y === y)) return true;
    return false;
  }

  isBlocked(x, y) {
    if (this.isWall(x, y)) return true;
    const door = this.getDoor(x, y);
    if (door && door.locked) return true;
    return false;
  }

  isWall(x, y) {
    return this.state.walls.some(w => w.x === x && w.y === y);
  }

  getDoor(x, y) {
    return this.state.doors.find(d => d.x === x && d.y === y);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state, this.status));
  }
}

window.GameEngine = GameEngine;
