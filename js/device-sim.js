/**
 * GRID // 01 — Physical Device Simulator
 * Tactile key switches, rotary dials, and multi-mode E-Ink display
 */

class GridDeviceSimulator {
  constructor() {
    this.deviceEl = document.getElementById('hardware-unit');
    this.displayEl = document.getElementById('device-display');

    // Device States
    this.isPowered = true;
    this.currentMode = 'timer'; // 'timer', 'telemetry', 'macros', 'game'
    this.finish = 'silver'; // 'silver', 'obsidian', 'bone'

    // Timer Mode State
    this.timerSeconds = 25 * 60; // 25:00
    this.timerRunning = false;
    this.timerInterval = null;

    // Mini Pixel Runner Game State
    this.gameRunning = false;
    this.playerY = 0;
    this.isJumping = false;
    this.obstacleX = 140;
    this.score = 0;
    this.gameLoopId = null;

    // Dials state
    this.dialValues = [72, 128, 85, 1]; // [D1, D2, D3, Mode]

    this.init();
  }

  init() {
    this.setupHardwareKeys();
    this.setupRotaryDials();
    this.setupRockerSwitch();
    this.setupFinishPicker();
    this.renderDisplay();
  }

  setFinish(finishName) {
    this.finish = finishName;
    if (this.deviceEl) {
      this.deviceEl.setAttribute('data-finish', finishName);
    }
  }

  setupHardwareKeys() {
    const keys = document.querySelectorAll('.hw-key');
    keys.forEach((key) => {
      const keyId = key.dataset.key;

      key.addEventListener('pointerdown', () => {
        key.classList.add('is-pressed');
        this.handleKeyPress(keyId);
      });

      window.addEventListener('pointerup', () => {
        key.classList.remove('is-pressed');
      });
    });
  }

  handleKeyPress(keyId) {
    if (!this.isPowered) return;

    switch (keyId) {
      case 'k1': // Mode 1: Timer
        this.setMode('timer');
        break;
      case 'k2': // Mode 2: System Telemetry
        this.setMode('telemetry');
        break;
      case 'k3': // Mode 3: Macro Deck
        this.setMode('macros');
        break;
      case 'k4': // Mode 4: Pixel Game
        this.setMode('game');
        break;
      case 'k5': // Action A (Start/Pause or Jump)
        this.handleActionA();
        break;
      case 'k6': // Action B (Reset)
        this.handleActionB();
        break;
    }
  }

  setupRotaryDials() {
    const dials = document.querySelectorAll('.hw-dial');
    dials.forEach((dial, idx) => {
      let isDragging = false;
      let startY = 0;
      let startVal = 0;

      dial.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startY = e.clientY;
        startVal = this.dialValues[idx];
        dial.classList.add('is-turning');
      });

      window.addEventListener('pointermove', (e) => {
        if (!isDragging || !this.isPowered) return;
        const dy = startY - e.clientY;
        const delta = Math.round(dy * 0.8);
        const newVal = Math.max(0, Math.min(255, startVal + delta));

        if (this.dialValues[idx] !== newVal) {
          this.dialValues[idx] = newVal;
          this.updateDialRotation(dial, newVal);

          if (idx === 3) {
            // Mode dial
            const modes = ['timer', 'telemetry', 'macros', 'game'];
            const modeIdx = Math.floor((newVal / 256) * modes.length);
            this.setMode(modes[modeIdx]);
          } else {
            this.renderDisplay();
          }
        }
      });

      window.addEventListener('pointerup', () => {
        if (isDragging) {
          isDragging = false;
          dial.classList.remove('is-turning');
        }
      });

      // Wheel support
      dial.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (!this.isPowered) return;
        const delta = e.deltaY < 0 ? 6 : -6;
        const newVal = Math.max(0, Math.min(255, this.dialValues[idx] + delta));
        this.dialValues[idx] = newVal;
        this.updateDialRotation(dial, newVal);
        this.renderDisplay();
      }, { passive: false });
    });
  }

  updateDialRotation(dial, val) {
    const notch = dial.querySelector('.dial-notch');
    const angle = (val / 255) * 300 - 150; // -150 to +150 deg
    if (notch) notch.style.transform = `rotate(${angle}deg)`;
  }

  setupRockerSwitch() {
    const rocker = document.getElementById('hw-rocker-power');
    const led = document.getElementById('hw-power-led');

    rocker?.addEventListener('click', () => {
      this.isPowered = !this.isPowered;
      rocker.classList.toggle('is-off', !this.isPowered);
      if (led) led.classList.toggle('is-off', !this.isPowered);
      this.renderDisplay();
    });
  }

  setupFinishPicker() {
    const buttons = document.querySelectorAll('.finish-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.setFinish(btn.dataset.finish);
      });
    });
  }

  setMode(mode) {
    if (this.currentMode === mode) return;
    this.currentMode = mode;

    // Reset game loop if leaving game
    if (mode !== 'game' && this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameRunning = false;
    }

    this.renderDisplay();
  }

  handleActionA() {
    if (this.currentMode === 'timer') {
      this.toggleTimer();
    } else if (this.currentMode === 'game') {
      this.jumpPlayer();
    }
  }

  handleActionB() {
    if (this.currentMode === 'timer') {
      this.resetTimer();
    } else if (this.currentMode === 'game') {
      this.resetGame();
    }
  }

  // Timer logic
  toggleTimer() {
    this.timerRunning = !this.timerRunning;
    if (this.timerRunning) {
      this.timerInterval = setInterval(() => {
        if (this.timerSeconds > 0) {
          this.timerSeconds--;
          this.renderDisplay();
        } else {
          this.timerRunning = false;
          clearInterval(this.timerInterval);
          this.renderDisplay();
        }
      }, 1000);
    } else {
      clearInterval(this.timerInterval);
    }
    this.renderDisplay();
  }

  resetTimer() {
    this.timerRunning = false;
    clearInterval(this.timerInterval);
    this.timerSeconds = 25 * 60;
    this.renderDisplay();
  }

  // Mini Pixel Runner Game Logic
  jumpPlayer() {
    if (!this.gameRunning) {
      this.gameRunning = true;
      this.score = 0;
      this.obstacleX = 160;
      this.runGameLoop();
      return;
    }

    if (!this.isJumping) {
      this.isJumping = true;
      let jumpHeight = 0;
      const jumpInterval = setInterval(() => {
        if (jumpHeight < 28) {
          jumpHeight += 4;
          this.playerY = jumpHeight;
        } else {
          clearInterval(jumpInterval);
          const fallInterval = setInterval(() => {
            if (jumpHeight > 0) {
              jumpHeight -= 4;
              this.playerY = jumpHeight;
            } else {
              clearInterval(fallInterval);
              this.playerY = 0;
              this.isJumping = false;
            }
          }, 30);
        }
      }, 30);
    }
  }

  resetGame() {
    this.gameRunning = false;
    this.score = 0;
    this.playerY = 0;
    this.obstacleX = 160;
    if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
    this.renderDisplay();
  }

  runGameLoop() {
    if (!this.gameRunning || this.currentMode !== 'game') return;

    this.obstacleX -= 2.5;
    if (this.obstacleX < -10) {
      this.obstacleX = 180 + Math.random() * 40;
      this.score++;
    }

    // Collision check
    if (this.obstacleX > 20 && this.obstacleX < 38 && this.playerY < 14) {
      // Game Over
      this.gameRunning = false;
      this.renderDisplay();
      return;
    }

    this.renderDisplay();
    this.gameLoopId = requestAnimationFrame(() => this.runGameLoop());
  }

  renderDisplay() {
    if (!this.displayEl) return;

    if (!this.isPowered) {
      this.displayEl.innerHTML = `<div class="eink-off">POWER OFF</div>`;
      return;
    }

    switch (this.currentMode) {
      case 'timer':
        const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
        const secs = (this.timerSeconds % 60).toString().padStart(2, '0');
        this.displayEl.innerHTML = `
          <div class="eink-header">
            <span class="eink-tag">FOCUS TIMER</span>
            <span class="eink-val">${this.timerRunning ? 'ACTIVE' : 'IDLE'}</span>
          </div>
          <div class="eink-big-time">${mins}:${secs}</div>
          <div class="eink-footer">
            <span>[K5] ${this.timerRunning ? 'PAUSE' : 'START'}</span>
            <span>[K6] RESET</span>
          </div>
        `;
        break;

      case 'telemetry':
        const cpu = Math.round(22 + (this.dialValues[0] / 255) * 65);
        const mem = Math.round(45 + (this.dialValues[1] / 255) * 45);
        this.displayEl.innerHTML = `
          <div class="eink-header">
            <span class="eink-tag">TELEMETRY</span>
            <span class="eink-val">USB 3.2</span>
          </div>
          <div class="eink-stat-row">
            <span>CPU</span>
            <div class="eink-bar"><div class="eink-bar-fill" style="width: ${cpu}%"></div></div>
            <span class="eink-pct">${cpu}%</span>
          </div>
          <div class="eink-stat-row">
            <span>RAM</span>
            <div class="eink-bar"><div class="eink-bar-fill" style="width: ${mem}%"></div></div>
            <span class="eink-pct">${mem}%</span>
          </div>
          <div class="eink-footer">
            <span>TEMP: 42°C</span>
            <span>FAN: SILENT</span>
          </div>
        `;
        break;

      case 'macros':
        this.displayEl.innerHTML = `
          <div class="eink-header">
            <span class="eink-tag">PROFILE: FIGMA PRO</span>
            <span class="eink-val">ACTIVE</span>
          </div>
          <div class="eink-macro-grid">
            <div class="eink-macro-cell">[K1] AUTO-LAYOUT</div>
            <div class="eink-macro-cell">[K2] COMPONENT</div>
            <div class="eink-macro-cell">[K3] FRAME</div>
            <div class="eink-macro-cell">[K4] DETACH</div>
          </div>
          <div class="eink-footer">
            <span>DIAL 1: ZOOM</span>
            <span>DIAL 2: SCRUB</span>
          </div>
        `;
        break;

      case 'game':
        const pY = this.playerY;
        const oX = Math.round(this.obstacleX);
        this.displayEl.innerHTML = `
          <div class="eink-header">
            <span class="eink-tag">PIXEL RUNNER</span>
            <span class="eink-val">SCORE: ${this.score}</span>
          </div>
          <div class="eink-game-stage">
            <div class="pixel-player" style="bottom: ${pY}px;"></div>
            <div class="pixel-obstacle" style="left: ${oX}px;"></div>
            <div class="pixel-ground"></div>
          </div>
          <div class="eink-footer">
            <span>${this.gameRunning ? '[K5] JUMP' : '[K5] START'}</span>
            <span>${this.gameRunning ? '' : 'READY'}</span>
          </div>
        `;
        break;
    }
  }
}

window.GridDeviceSimulator = GridDeviceSimulator;
