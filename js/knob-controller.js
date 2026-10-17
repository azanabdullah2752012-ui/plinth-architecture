/**
 * TACTILE ROTARY KNOB & SWITCH CONTROLLER
 * Precision drag-to-adjust, mechanical switch physics, and tactile micro-clicks
 */

class KnobController {
  constructor(audioEngine) {
    this.engine = audioEngine;
    this.activeKnob = null;
    this.startY = 0;
    this.startValue = 0;

    // Small click audio feedback context
    this.clickCtx = null;
    this.initKnobs();
  }

  ensureClickAudio() {
    if (!this.clickCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.clickCtx = new AudioContextClass();
    }
    if (this.clickCtx.state === 'suspended') {
      this.clickCtx.resume();
    }
  }

  playMechanicalClick(freq = 1200, duration = 0.008) {
    try {
      this.ensureClickAudio();
      const osc = this.clickCtx.createOscillator();
      const gain = this.clickCtx.createGain();
      const now = this.clickCtx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + duration);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.clickCtx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.002);
    } catch (e) {
      // Audio not yet unlocked
    }
  }

  initKnobs() {
    const knobs = document.querySelectorAll('.knob-dial');
    knobs.forEach((knob) => {
      this.setupKnob(knob);
    });

    // Global drag handlers
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', () => this.onPointerUp());

    // Setup tactile switches & radio toggles
    this.initSwitches();
  }

  setupKnob(knob) {
    const min = parseFloat(knob.dataset.min ?? 0);
    const max = parseFloat(knob.dataset.max ?? 1);
    const step = parseFloat(knob.dataset.step ?? 0.01);
    const val = parseFloat(knob.dataset.val ?? (min + (max - min) / 2));
    const param = knob.dataset.param;

    this.updateKnobVisual(knob, val, min, max);

    knob.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.activeKnob = knob;
      this.startY = e.clientY;
      this.startValue = parseFloat(knob.dataset.val);
      knob.classList.add('is-active');
      this.playMechanicalClick(2400, 0.005);
    });

    // Wheel support
    knob.addEventListener('wheel', (e) => {
      e.preventDefault();
      const curVal = parseFloat(knob.dataset.val);
      const range = max - min;
      const delta = (e.deltaY < 0 ? 1 : -1) * (step || range * 0.02);
      const nextVal = Math.min(max, Math.max(min, curVal + delta));

      knob.dataset.val = nextVal;
      this.updateKnobVisual(knob, nextVal, min, max);
      if (param && this.engine) {
        this.engine.setParam(param, nextVal);
      }
      this.updateValueDisplay(knob, nextVal);
      this.playMechanicalClick(3200, 0.003);
    }, { passive: false });

    // Double-click reset to default
    knob.addEventListener('dblclick', () => {
      const def = parseFloat(knob.dataset.default ?? min);
      knob.dataset.val = def;
      this.updateKnobVisual(knob, def, min, max);
      if (param && this.engine) {
        this.engine.setParam(param, def);
      }
      this.updateValueDisplay(knob, def);
      this.playMechanicalClick(1800, 0.008);
    });
  }

  onPointerMove(e) {
    if (!this.activeKnob) return;

    const knob = this.activeKnob;
    const min = parseFloat(knob.dataset.min ?? 0);
    const max = parseFloat(knob.dataset.max ?? 1);
    const step = parseFloat(knob.dataset.step ?? 0.01);
    const param = knob.dataset.param;

    const sensitivity = e.shiftKey ? 450 : 150; // Shift for fine-tuning
    const dy = this.startY - e.clientY;
    const range = max - min;
    let nextVal = this.startValue + (dy / sensitivity) * range;

    if (step > 0) {
      nextVal = Math.round(nextVal / step) * step;
    }
    nextVal = Math.min(max, Math.max(min, nextVal));

    if (parseFloat(knob.dataset.val) !== nextVal) {
      knob.dataset.val = nextVal;
      this.updateKnobVisual(knob, nextVal, min, max);
      if (param && this.engine) {
        this.engine.setParam(param, nextVal);
      }
      this.updateValueDisplay(knob, nextVal);
    }
  }

  onPointerUp() {
    if (this.activeKnob) {
      this.activeKnob.classList.remove('is-active');
      this.activeKnob = null;
    }
  }

  updateKnobVisual(knob, val, min, max) {
    const fraction = (val - min) / (max - min);
    // Angle span: -135deg to +135deg (270 total)
    const angle = -135 + fraction * 270;
    const indicator = knob.querySelector('.knob-pointer');
    if (indicator) {
      indicator.style.transform = `rotate(${angle}deg)`;
    }
  }

  updateValueDisplay(knob, val) {
    const readout = knob.closest('.control-unit')?.querySelector('.knob-readout');
    if (readout) {
      const unit = knob.dataset.unit || '';
      let formatted = val;
      if (val >= 1000) {
        formatted = (val / 1000).toFixed(1) + 'k';
      } else if (val < 1 && val > 0) {
        formatted = val.toFixed(2);
      } else {
        formatted = Number.isInteger(val) ? val : val.toFixed(1);
      }
      readout.textContent = `${formatted}${unit}`;
    }
  }

  initSwitches() {
    // Waveform and mode selectors
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        const param = btn.dataset.param;
        const val = btn.dataset.val;

        // Toggle active state within group
        document.querySelectorAll(`.toggle-btn[data-group="${group}"]`).forEach((b) => {
          b.classList.remove('is-selected');
        });
        btn.classList.add('is-selected');

        this.playMechanicalClick(1400, 0.012);

        if (param && this.engine) {
          this.engine.setParam(param, val);
        }
      });
    });
  }

  setKnobValue(paramName, val) {
    const knob = document.querySelector(`.knob-dial[data-param="${paramName}"]`);
    if (knob) {
      const min = parseFloat(knob.dataset.min ?? 0);
      const max = parseFloat(knob.dataset.max ?? 1);
      knob.dataset.val = val;
      this.updateKnobVisual(knob, val, min, max);
      this.updateValueDisplay(knob, val);
    }
  }
}

window.KnobController = KnobController;
