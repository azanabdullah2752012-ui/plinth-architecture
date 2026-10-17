/**
 * KINESIS CRT VECTOR OSCILLOSCOPE & LISSAJOUS DISPLAY
 * High-performance Phosphor CRT simulation with persistence decay and optical glare
 */

class CrtVisualizer {
  constructor(canvas, audioEngine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = audioEngine;

    this.mode = 'lissajous'; // 'lissajous', 'dual_trace', 'spectrum'
    this.beamColor = '#39ff8a'; // Vintage P31 phosphor green
    this.beamColorAlt = '#e2973f'; // Warm phosphor amber
    this.phosphorDecay = 0.88; // CRT persistence trail

    this.timeData = new Uint8Array(2048);
    this.freqData = new Uint8Array(256);
    this.peakBars = new Float32Array(32);

    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;

    // Simulated secondary channel for X/Y Lissajous
    this.historyBuffer = new Float32Array(2048);
    this.historyIndex = 0;

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

  setMode(mode) {
    this.mode = mode;
  }

  animate() {
    requestAnimationFrame(this.animate);

    if (!this.width || !this.height) return;

    // Phosphor decay fading
    this.ctx.save();
    this.ctx.fillStyle = `rgba(13, 15, 17, ${1 - this.phosphorDecay})`;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw CRT graticule grid
    this.drawGraticule();

    // Check if audio engine is alive
    if (this.engine && this.engine.analyser) {
      this.engine.analyser.getByteTimeDomainData(this.timeData);
      this.engine.analyser.getByteFrequencyData(this.freqData);

      // Store in circular history for Lissajous X/Y phase correlation
      for (let i = 0; i < this.timeData.length; i++) {
        this.historyBuffer[i] = (this.timeData[i] - 128) / 128.0;
      }

      if (this.mode === 'lissajous') {
        this.drawLissajous();
      } else if (this.mode === 'dual_trace') {
        this.drawDualTrace();
      } else if (this.mode === 'spectrum') {
        this.drawSpectrum();
      }
    } else {
      // Idle CRT beam baseline hum
      this.drawIdleBeam();
    }

    // Glass glare, bezel vignette, and scanline overlay
    this.drawCrtGlassOverlay();
    this.ctx.restore();
  }

  drawGraticule() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const stepX = this.width / 10;
    const stepY = this.height / 8;

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(42, 60, 50, 0.45)';
    this.ctx.lineWidth = 1;

    // Grid lines
    this.ctx.beginPath();
    for (let x = stepX; x < this.width; x += stepX) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }
    for (let y = stepY; y < this.height; y += stepY) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    this.ctx.stroke();

    // Center crosshair with micro tick marks
    this.ctx.strokeStyle = 'rgba(70, 110, 85, 0.7)';
    this.ctx.beginPath();
    this.ctx.moveTo(cx, 0);
    this.ctx.lineTo(cx, this.height);
    this.ctx.moveTo(0, cy);
    this.ctx.lineTo(this.width, cy);

    // Micro sub-divisions along axes
    const tickLen = 3;
    for (let x = 0; x < this.width; x += stepX / 5) {
      this.ctx.moveTo(x, cy - tickLen);
      this.ctx.lineTo(x, cy + tickLen);
    }
    for (let y = 0; y < this.height; y += stepY / 5) {
      this.ctx.moveTo(cx - tickLen, y);
      this.ctx.lineTo(cx + tickLen, y);
    }
    this.ctx.stroke();

    // Calibration label
    this.ctx.fillStyle = 'rgba(70, 120, 90, 0.6)';
    this.ctx.font = '9px monospace';
    this.ctx.fillText('CAL: 10mV/DIV', 12, this.height - 12);
    this.ctx.fillText(`MODE: ${this.mode.toUpperCase()}`, this.width - 120, this.height - 12);
    this.ctx.restore();
  }

  drawIdleBeam() {
    const cy = this.height / 2;
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(57, 255, 138, 0.4)';
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowColor = '#39ff8a';
    this.ctx.shadowBlur = 6;

    this.ctx.beginPath();
    const t = performance.now() * 0.002;
    for (let x = 0; x < this.width; x += 3) {
      const ny = cy + Math.sin(x * 0.02 + t) * 1.5 + (Math.random() - 0.5) * 0.8;
      if (x === 0) this.ctx.moveTo(x, ny);
      else this.ctx.lineTo(x, ny);
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawLissajous() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const scale = Math.min(cx, cy) * 0.82;
    const buffer = this.historyBuffer;
    const delaySamples = Math.floor(this.timeData.length * 0.12);

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.strokeStyle = this.beamColor;
    this.ctx.lineWidth = 1.6;
    this.ctx.shadowColor = '#39ff8a';
    this.ctx.shadowBlur = 10;

    this.ctx.beginPath();
    const step = 2;
    let started = false;

    for (let i = 0; i < buffer.length - delaySamples; i += step) {
      // X = direct signal, Y = time-delayed / echo phase correlation
      const xVal = buffer[i];
      const yVal = buffer[i + delaySamples];

      const px = cx + xVal * scale;
      const py = cy - yVal * scale;

      if (!started) {
        this.ctx.moveTo(px, py);
        started = true;
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.stroke();

    // Hot beam center bloom
    this.ctx.lineWidth = 0.8;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawDualTrace() {
    const cy = this.height / 2;
    const scale = this.height * 0.38;
    const sliceWidth = this.width / (this.timeData.length * 0.5);

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';

    // Primary Channel: Phosphor Green
    this.ctx.strokeStyle = this.beamColor;
    this.ctx.lineWidth = 1.8;
    this.ctx.shadowColor = '#39ff8a';
    this.ctx.shadowBlur = 8;

    this.ctx.beginPath();
    let x = 0;
    const count = Math.floor(this.timeData.length * 0.5);

    // Trigger stabilization: find zero crossing
    let startIdx = 0;
    for (let i = 0; i < 200; i++) {
      if (this.timeData[i] < 128 && this.timeData[i + 1] >= 128) {
        startIdx = i;
        break;
      }
    }

    for (let i = startIdx; i < startIdx + count && i < this.timeData.length; i++) {
      const v = (this.timeData[i] - 128) / 128.0;
      const y = cy - v * scale;

      if (i === startIdx) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
      x += sliceWidth;
    }
    this.ctx.stroke();

    // Secondary Channel (Inverted/Echo phase in Phosphor Amber)
    this.ctx.strokeStyle = this.beamColorAlt;
    this.ctx.shadowColor = '#e2973f';
    this.ctx.shadowBlur = 6;
    this.ctx.beginPath();
    x = 0;
    const offset = 64;
    for (let i = startIdx + offset; i < startIdx + offset + count && i < this.timeData.length; i++) {
      const v = (this.timeData[i] - 128) / 128.0;
      const y = cy + v * scale * 0.75;

      if (i === startIdx + offset) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
      x += sliceWidth;
    }
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawSpectrum() {
    const barCount = 32;
    const barWidth = (this.width - 40) / barCount;
    const maxHeight = this.height * 0.75;
    const bottomY = this.height - 24;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < barCount; i++) {
      const freqIdx = Math.floor(Math.pow(i / barCount, 1.8) * 128);
      const val = (this.freqData[freqIdx] || 0) / 255.0;
      const h = val * maxHeight;
      const x = 20 + i * barWidth;

      // Peak hold animation
      if (val > this.peakBars[i]) {
        this.peakBars[i] = val;
      } else {
        this.peakBars[i] = Math.max(0, this.peakBars[i] - 0.012);
      }

      // Bar gradient
      const grad = this.ctx.createLinearGradient(x, bottomY, x, bottomY - h);
      grad.addColorStop(0, 'rgba(57, 255, 138, 0.2)');
      grad.addColorStop(0.7, 'rgba(57, 255, 138, 0.8)');
      grad.addColorStop(1, 'rgba(230, 160, 60, 0.95)');

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(x + 1, bottomY - h, barWidth - 3, h);

      // Peak marker line
      const peakY = bottomY - this.peakBars[i] * maxHeight;
      this.ctx.fillStyle = '#ffdf80';
      this.ctx.fillRect(x + 1, peakY - 1.5, barWidth - 3, 2);
    }

    this.ctx.restore();
  }

  drawCrtGlassOverlay() {
    // Vignette shadowing around curved tube edges
    const grad = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.35,
      this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.72
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(6, 8, 10, 0.75)');

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Subtle CRT horizontal scanline raster
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    for (let y = 0; y < this.height; y += 3) {
      this.ctx.fillRect(0, y, this.width, 1);
    }

    // Diagonal optical reflection glare across glass tube
    const glareGrad = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    glareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    glareGrad.addColorStop(0.18, 'rgba(255, 255, 255, 0.015)');
    glareGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.0)');
    this.ctx.fillStyle = glareGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

window.CrtVisualizer = CrtVisualizer;
