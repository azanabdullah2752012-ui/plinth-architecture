/**
 * KNOT // Infinite Vector Canvas & Bezier Wire Engine
 * Infinite pan/zoom, dynamic cubic bezier cables, and traveling data pulses
 */

class InfiniteCanvas {
  constructor(container, graph) {
    this.container = container;
    this.graph = graph;

    // Viewport transform
    this.panX = 80;
    this.panY = 80;
    this.zoom = 1.0;
    this.minZoom = 0.25;
    this.maxZoom = 2.2;

    this.isPanning = false;
    this.startX = 0;
    this.startY = 0;

    // Wire creation drag state
    this.activeDragPort = null; // { nodeId, portId, isOutput, x, y }
    this.mouseWorldX = 0;
    this.mouseWorldY = 0;

    // Pulse animation array: { wireId, t, speed }
    this.pulses = [];

    // DOM Setup
    this.canvasLayer = document.createElement('canvas');
    this.canvasLayer.className = 'canvas-wire-layer';
    this.ctx = this.canvasLayer.getContext('2d');

    this.nodeLayer = document.createElement('div');
    this.nodeLayer.className = 'canvas-node-layer';

    this.container.appendChild(this.canvasLayer);
    this.container.appendChild(this.nodeLayer);

    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    this.setupListeners();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Listen for graph wire pulses
    this.graph.onWirePulse((wireId) => {
      this.pulses.push({ wireId, t: 0, speed: 0.035 + Math.random() * 0.015 });
    });

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resizeCanvas() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvasLayer.width = this.width * dpr;
    this.canvasLayer.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.updateTransform();
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.panX) / this.zoom,
      y: (sy - this.panY) / this.zoom
    };
  }

  worldToScreen(wx, wy) {
    return {
      x: wx * this.zoom + this.panX,
      y: wy * this.zoom + this.panY
    };
  }

  updateTransform() {
    this.nodeLayer.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    this.container.style.backgroundPosition = `${this.panX}px ${this.panY}px`;
    this.container.style.backgroundSize = `${24 * this.zoom}px ${24 * this.zoom}px`;
  }

  setupListeners() {
    // Wheel zoom
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoom * zoomFactor));

      const rect = this.container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Zoom centered on cursor
      this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
      this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
      this.zoom = newZoom;

      this.updateTransform();
    }, { passive: false });

    // Pan via middle click, Space+drag, or canvas background drag
    this.container.addEventListener('pointerdown', (e) => {
      const isMiddle = e.button === 1;
      const isSpace = e.buttons === 1 && (e.spaceKey || this.spacePressed);
      const isBackground = e.target === this.container || e.target === this.canvasLayer || e.target === this.nodeLayer;

      if (isMiddle || isSpace || (isBackground && e.button === 0)) {
        this.isPanning = true;
        this.startX = e.clientX - this.panX;
        this.startY = e.clientY - this.panY;
        this.container.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('pointermove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const world = this.screenToWorld(sx, sy);
      this.mouseWorldX = world.x;
      this.mouseWorldY = world.y;

      if (this.isPanning) {
        this.panX = e.clientX - this.startX;
        this.panY = e.clientY - this.startY;
        this.updateTransform();
      }
    });

    window.addEventListener('pointerup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        this.container.style.cursor = 'default';
      }
      if (this.activeDragPort) {
        this.activeDragPort = null;
      }
    });

    // Spacebar pan toggle
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        this.spacePressed = true;
        this.container.style.cursor = 'grab';
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.spacePressed = false;
        this.container.style.cursor = 'default';
      }
    });
  }

  startDraggingWire(nodeId, portId, isOutput, portEl) {
    const rect = portEl.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    const sx = rect.left + rect.width / 2 - containerRect.left;
    const sy = rect.top + rect.height / 2 - containerRect.top;
    const world = this.screenToWorld(sx, sy);

    this.activeDragPort = {
      nodeId,
      portId,
      isOutput,
      x: world.x,
      y: world.y
    };
  }

  getPortCoordinates(nodeId, portId, isOutput) {
    const node = this.graph.nodes.get(nodeId);
    if (!node || !node.domElement) return null;

    const selector = isOutput 
      ? `.node-port.is-output[data-port="${portId}"]` 
      : `.node-port.is-input[data-port="${portId}"]`;
    const portEl = node.domElement.querySelector(selector);
    if (!portEl) return null;

    const rect = portEl.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    const sx = rect.left + rect.width / 2 - containerRect.left;
    const sy = rect.top + rect.height / 2 - containerRect.top;
    return this.screenToWorld(sx, sy);
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.drawWires();
    this.drawMinimap();
  }

  drawWires() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw all confirmed graph wires
    for (let wire of this.graph.wires) {
      const p1 = this.getPortCoordinates(wire.fromNode, wire.fromPort, true);
      const p2 = this.getPortCoordinates(wire.toNode, wire.toPort, false);
      if (!p1 || !p2) continue;

      const s1 = this.worldToScreen(p1.x, p1.y);
      const s2 = this.worldToScreen(p2.x, p2.y);
      this.drawBezierCable(s1.x, s1.y, s2.x, s2.y, '#3b4352', 2.5);
    }

    // Draw animated data flow pulses
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const pulse = this.pulses[i];
      pulse.t += pulse.speed;

      const wire = this.graph.wires.find(w => w.id === pulse.wireId);
      if (!wire || pulse.t >= 1) {
        this.pulses.splice(i, 1);
        continue;
      }

      const p1 = this.getPortCoordinates(wire.fromNode, wire.fromPort, true);
      const p2 = this.getPortCoordinates(wire.toNode, wire.toPort, false);
      if (p1 && p2) {
        const s1 = this.worldToScreen(p1.x, p1.y);
        const s2 = this.worldToScreen(p2.x, p2.y);
        this.drawWirePulseParticle(s1.x, s1.y, s2.x, s2.y, pulse.t);
      }
    }

    // Draw active candidate wire if dragging
    if (this.activeDragPort) {
      const s1 = this.worldToScreen(this.activeDragPort.x, this.activeDragPort.y);
      const s2 = this.worldToScreen(this.mouseWorldX, this.mouseWorldY);
      if (this.activeDragPort.isOutput) {
        this.drawBezierCable(s1.x, s1.y, s2.x, s2.y, '#e59344', 3.0, true);
      } else {
        this.drawBezierCable(s2.x, s2.y, s1.x, s1.y, '#e59344', 3.0, true);
      }
    }
  }

  drawBezierCable(x1, y1, x2, y2, color, width = 2, isDraft = false) {
    const dx = Math.abs(x2 - x1) * 0.55;
    const cp1x = x1 + Math.max(40, dx);
    const cp1y = y1;
    const cp2x = x2 - Math.max(40, dx);
    const cp2y = y2;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width * this.zoom;
    this.ctx.lineCap = 'round';

    if (isDraft) {
      this.ctx.setLineDash([6, 4]);
    }
    this.ctx.stroke();

    // Inner bright core
    if (!isDraft) {
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      this.ctx.lineWidth = Math.max(1, (width - 1.2) * this.zoom);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawWirePulseParticle(x1, y1, x2, y2, t) {
    const dx = Math.abs(x2 - x1) * 0.55;
    const cp1x = x1 + Math.max(40, dx);
    const cp1y = y1;
    const cp2x = x2 - Math.max(40, dx);
    const cp2y = y2;

    // Cubic bezier formula: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const px = uuu * x1 + 3 * uu * t * cp1x + 3 * u * tt * cp2x + ttt * x2;
    const py = uuu * y1 + 3 * uu * t * cp1y + 3 * u * tt * cp2y + ttt * y2;

    this.ctx.save();
    this.ctx.fillStyle = '#39ff8a';
    this.ctx.shadowColor = '#39ff8a';
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.arc(px, py, 3.5 * this.zoom, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawMinimap() {
    if (!this.minimapCtx) return;
    const mw = this.minimapCanvas.width;
    const mh = this.minimapCanvas.height;
    const mctx = this.minimapCtx;

    mctx.clearRect(0, 0, mw, mh);
    mctx.fillStyle = '#101115';
    mctx.fillRect(0, 0, mw, mh);

    // Compute bounding box of all nodes
    const nodes = Array.from(this.graph.nodes.values());
    if (nodes.length === 0) return;

    let minX = -400, maxX = 1400, minY = -200, maxY = 1000;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x + 220);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y + 160);
    });

    const scaleX = mw / (maxX - minX + 200);
    const scaleY = mh / (maxY - minY + 200);
    const scale = Math.min(scaleX, scaleY);

    // Draw node dots on minimap
    nodes.forEach(n => {
      const mx = (n.x - minX + 100) * scale;
      const my = (n.y - minY + 100) * scale;
      mctx.fillStyle = n.accent || '#3b4352';
      mctx.fillRect(mx, my, Math.max(4, 200 * scale), Math.max(3, 100 * scale));
    });

    // Draw camera viewport box on minimap
    const v1 = this.screenToWorld(0, 0);
    const v2 = this.screenToWorld(this.width, this.height);
    const vx = (v1.x - minX + 100) * scale;
    const vy = (v1.y - minY + 100) * scale;
    const vw = (v2.x - v1.x) * scale;
    const vh = (v2.y - v1.y) * scale;

    mctx.strokeStyle = 'rgba(229, 147, 68, 0.7)';
    mctx.lineWidth = 1.5;
    mctx.strokeRect(vx, vy, vw, vh);
  }

  centerView() {
    const nodes = Array.from(this.graph.nodes.values());
    if (nodes.length === 0) {
      this.panX = 80;
      this.panY = 80;
      this.zoom = 1.0;
      this.updateTransform();
      return;
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x + 220);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y + 160);
    });

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    this.zoom = 0.95;
    this.panX = this.width / 2 - cx * this.zoom;
    this.panY = this.height / 2 - cy * this.zoom;
    this.updateTransform();
  }
}

window.InfiniteCanvas = InfiniteCanvas;
