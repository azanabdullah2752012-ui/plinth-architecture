/**
 * MONOLITH // Acoustic Dispersion & Wavefront Field Simulator
 * Real-time 2D wave equation solving acoustic propagation and room reflection
 */

class AcousticFieldSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.frequency = 80; // Hz
    this.damping = 0.985;
    this.wallReflection = 0.75;

    this.gridW = 120;
    this.gridH = 70;
    this.currentBuffer = new Float32Array(this.gridW * this.gridH);
    this.previousBuffer = new Float32Array(this.gridW * this.gridH);

    this.dpr = window.devicePixelRatio || 1;
    this.setupCanvas();
    window.addEventListener('resize', () => this.setupCanvas());

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

  setFrequency(hz) {
    this.frequency = hz;
  }

  setWallReflection(val) {
    this.wallReflection = val;
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Wave equation propagation: u(t+1) = 2*u(t) - u(t-1) + c^2 * laplacian(u)
    const w = this.gridW;
    const h = this.gridH;
    const cur = this.currentBuffer;
    const prev = this.previousBuffer;
    const c2 = 0.45; // wave speed squared

    // Inject oscillator source from speaker center (left wall: x=12, y=h/2)
    const time = performance.now() * 0.001;
    const srcIdx = Math.floor(h / 2) * w + 12;
    cur[srcIdx] = Math.sin(time * (this.frequency * 0.25)) * 1.5;

    // Fast discrete wave step
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        const laplacian = cur[idx - 1] + cur[idx + 1] + cur[idx - w] + cur[idx + w] - 4 * cur[idx];
        let nextVal = 2 * cur[idx] - prev[idx] + c2 * laplacian;
        nextVal *= this.damping;
        prev[idx] = nextVal;
      }
    }

    // Swap buffers
    const temp = this.currentBuffer;
    this.currentBuffer = this.previousBuffer;
    this.previousBuffer = temp;

    this.render();
  }

  render() {
    const ctx = this.ctx;
    const cellW = this.width / this.gridW;
    const cellH = this.height / this.gridH;
    const buf = this.currentBuffer;

    ctx.fillStyle = '#0a0b0e';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw acoustic pressure heat map
    for (let y = 0; y < this.gridH; y += 2) {
      for (let x = 0; x < this.gridW; x += 2) {
        const val = buf[y * this.gridW + x];
        if (Math.abs(val) > 0.04) {
          const intensity = Math.min(1, Math.abs(val));
          if (val > 0) {
            // Positive pressure: Crisp Warm Titanium White
            ctx.fillStyle = `rgba(235, 240, 250, ${intensity * 0.75})`;
          } else {
            // Negative rarefaction: Deep Acoustic Amber
            ctx.fillStyle = `rgba(205, 155, 95, ${intensity * 0.6})`;
          }
          ctx.fillRect(x * cellW, y * cellH, cellW * 2, cellH * 2);
        }
      }
    }

    // Draw Speaker Icon on Left
    ctx.fillStyle = '#1e2129';
    ctx.strokeStyle = '#4a5265';
    ctx.lineWidth = 1.5;
    ctx.fillRect(8 * cellW, (this.gridH * 0.3) * cellH, 6 * cellW, (this.gridH * 0.4) * cellH);
    ctx.strokeRect(8 * cellW, (this.gridH * 0.3) * cellH, 6 * cellW, (this.gridH * 0.4) * cellH);

    // Wave dispersion reticle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
  }
}

window.AcousticFieldSimulator = AcousticFieldSimulator;
