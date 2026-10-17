/**
 * KINESIS 16-STEP ANALOG SEQUENCER
 * Precision lookahead audio scheduling, generative scale mapping, and swing physics
 */

class StepSequencer {
  constructor(audioEngine) {
    this.engine = audioEngine;
    this.stepsCount = 16;
    this.currentStep = 0;
    this.isPlaying = false;
    this.bpm = 118;
    this.swing = 0.15; // 0 to 0.5
    this.gateRatio = 0.65; // Gate length
    this.rootNote = 48; // C3
    this.scale = 'minor_pentatonic';

    // Scales definition (semitone intervals)
    this.scales = {
      minor_pentatonic: [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24],
      dorian: [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19, 21, 22, 24],
      phrygian: [0, 1, 3, 5, 7, 8, 10, 12, 13, 15, 17, 19, 20, 22, 24],
      hirajoshi: [0, 2, 3, 7, 8, 12, 14, 15, 19, 20, 24],
      chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    };

    // Step state: { active: boolean, noteOffset: number, velocity: number, accent: boolean }
    this.steps = Array.from({ length: this.stepsCount }, (_, i) => ({
      active: i % 4 === 0 || i % 4 === 2, // default rhythmic pattern
      noteOffset: (i * 2) % 7,
      velocity: 0.8,
      accent: i % 4 === 0
    }));

    // Lookahead scheduling
    this.lookahead = 25.0; // ms
    this.scheduleAheadTime = 0.1; // seconds
    this.nextNoteTime = 0.0;
    this.timerID = null;

    // UI elements
    this.stepElements = [];
    this.tapeReels = [];
  }

  init() {
    this.renderStepGrid();
    this.tapeReels = document.querySelectorAll('.tape-reel');
  }

  renderStepGrid() {
    const container = document.getElementById('sequencer-grid');
    if (!container) return;
    container.innerHTML = '';
    this.stepElements = [];

    this.steps.forEach((step, idx) => {
      const stepEl = document.createElement('div');
      stepEl.className = `seq-step ${step.active ? 'is-active' : ''} ${step.accent ? 'is-accent' : ''}`;
      stepEl.dataset.step = idx;

      // LED Indicator
      const led = document.createElement('div');
      led.className = 'step-led';

      // Pitch bar visual
      const pitchBar = document.createElement('div');
      pitchBar.className = 'step-pitch-indicator';
      pitchBar.style.height = `${Math.min(100, Math.max(15, (step.noteOffset + 1) * 12))}%`;

      // Step Number
      const label = document.createElement('span');
      label.className = 'step-num';
      label.textContent = (idx + 1).toString().padStart(2, '0');

      stepEl.appendChild(led);
      stepEl.appendChild(pitchBar);
      stepEl.appendChild(label);

      // Left click toggles Active / Inactive
      stepEl.addEventListener('click', (e) => {
        if (e.shiftKey) {
          // Shift click toggles accent
          step.accent = !step.accent;
          stepEl.classList.toggle('is-accent', step.accent);
        } else {
          step.active = !step.active;
          stepEl.classList.toggle('is-active', step.active);
        }
      });

      // Mouse wheel adjusts pitch offset
      stepEl.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1 : -1;
        step.noteOffset = Math.max(-12, Math.min(24, step.noteOffset + delta));
        pitchBar.style.height = `${Math.min(100, Math.max(15, (step.noteOffset + 6) * 6))}%`;
      }, { passive: false });

      container.appendChild(stepEl);
      this.stepElements.push(stepEl);
    });
  }

  start() {
    if (this.isPlaying) return;
    this.engine.ensureContext().then(() => {
      this.isPlaying = true;
      this.currentStep = 0;
      this.nextNoteTime = this.engine.ctx.currentTime + 0.05;
      this.scheduler();
      this.setReelsSpinning(true);
    });
  }

  stop() {
    this.isPlaying = false;
    clearTimeout(this.timerID);
    this.stepElements.forEach(el => el.classList.remove('is-playing'));
    this.setReelsSpinning(false);
  }

  toggle() {
    if (this.isPlaying) this.stop();
    else this.start();
    return this.isPlaying;
  }

  setReelsSpinning(isSpinning) {
    this.tapeReels.forEach(reel => {
      if (isSpinning) reel.classList.add('is-spinning');
      else reel.classList.remove('is-spinning');
    });
  }

  scheduler() {
    if (!this.isPlaying) return;

    while (this.nextNoteTime < this.engine.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.advanceStep();
    }
    this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
  }

  advanceStep() {
    const secondsPerBeat = 60.0 / this.bpm;
    const stepDuration = 0.25 * secondsPerBeat; // 16th notes

    // Swing calculation: delay odd steps
    let appliedDuration = stepDuration;
    if (this.currentStep % 2 === 0) {
      appliedDuration += stepDuration * this.swing;
    } else {
      appliedDuration -= stepDuration * this.swing;
    }

    this.nextNoteTime += appliedDuration;
    this.currentStep = (this.currentStep + 1) % this.stepsCount;
  }

  scheduleStep(stepIndex, time) {
    const step = this.steps[stepIndex];

    // Schedule UI LED flash via requestAnimationFrame closer to execution time
    const delayMs = Math.max(0, (time - this.engine.ctx.currentTime) * 1000);
    setTimeout(() => {
      if (!this.isPlaying) return;
      this.stepElements.forEach((el, idx) => {
        if (idx === stepIndex) el.classList.add('is-playing');
        else el.classList.remove('is-playing');
      });
    }, delayMs);

    // Audio trigger
    if (step.active) {
      const scaleNotes = this.scales[this.scale] || this.scales.minor_pentatonic;
      const intervalIndex = Math.abs(step.noteOffset) % scaleNotes.length;
      const octaveShift = Math.floor(step.noteOffset / scaleNotes.length) * 12;
      const midiNote = this.rootNote + scaleNotes[intervalIndex] + octaveShift;

      const secondsPerBeat = 60.0 / this.bpm;
      const stepDuration = 0.25 * secondsPerBeat;
      const gateTime = stepDuration * this.gateRatio;
      const velocity = step.accent ? 0.95 : step.velocity;

      // Trigger note on
      const voice = this.engine.triggerNoteOn(midiNote, velocity);

      // Trigger note off
      if (voice) {
        setTimeout(() => {
          this.engine.triggerNoteOff(midiNote);
        }, gateTime * 1000);
      }
    }
  }

  randomizePattern() {
    const scaleNotes = this.scales[this.scale];
    this.steps.forEach((step, idx) => {
      // Musical groove probability: beat 1, 5, 9, 13 have higher anchor chance
      const isDownbeat = idx % 4 === 0;
      step.active = isDownbeat ? Math.random() > 0.15 : Math.random() > 0.45;
      step.accent = isDownbeat && Math.random() > 0.4;
      const randomScaleDegree = Math.floor(Math.random() * Math.min(8, scaleNotes.length));
      step.noteOffset = randomScaleDegree;
    });
    this.renderStepGrid();
  }

  setBpm(bpm) {
    this.bpm = Math.max(40, Math.min(240, bpm));
  }

  setScale(scaleName) {
    if (this.scales[scaleName]) {
      this.scale = scaleName;
    }
  }

  setRootNote(note) {
    this.rootNote = note;
  }
}

window.StepSequencer = StepSequencer;
