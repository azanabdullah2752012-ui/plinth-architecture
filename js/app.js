/**
 * KINESIS CONSOLE APP COORDINATOR
 * QWERTY keyboard mapping, Web MIDI integration, Session WAV recording, and UI binding
 */

document.addEventListener('DOMContentLoaded', async () => {
  const engine = new AudioEngine();
  const visualizerCanvas = document.getElementById('crt-screen');
  const visualizer = new CrtVisualizer(visualizerCanvas, engine);
  const knobController = new KnobController(engine);
  const sequencer = new StepSequencer(engine);
  sequencer.init();

  let currentOctave = 3; // C3
  const activeKeys = new Set();

  // Unlock Web Audio on first user interaction anywhere
  const unlockAudio = async () => {
    await engine.ensureContext();
    document.getElementById('audio-unlock-banner')?.classList.add('is-hidden');
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  // --- Keyboard UI Generation ---
  const keyboardContainer = document.getElementById('piano-keys');
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  function buildKeyboard() {
    keyboardContainer.innerHTML = '';
    let whiteCount = 0;
    const totalWhiteKeys = 14;
    const blackKeyOffsets = {
      'C#': 1,
      'D#': 2,
      'F#': 4,
      'G#': 5,
      'A#': 6
    };

    // First render all white keys so they flex naturally
    for (let oct = currentOctave; oct < currentOctave + 2; oct++) {
      notes.forEach((noteName, noteIndex) => {
        if (!noteName.includes('#')) {
          const midi = oct * 12 + noteIndex + 12;
          const keyEl = document.createElement('div');
          keyEl.className = 'piano-key white-key';
          keyEl.dataset.midi = midi;
          keyEl.dataset.note = `${noteName}${oct}`;

          const keyLabel = document.createElement('span');
          keyLabel.className = 'key-label';
          keyLabel.textContent = `${noteName}${oct}`;
          keyEl.appendChild(keyLabel);

          setupKeyEvents(keyEl, midi);
          keyboardContainer.appendChild(keyEl);
        }
      });
    }

    // Now render black keys positioned over the boundary of white keys
    for (let octIndex = 0; octIndex < 2; octIndex++) {
      const oct = currentOctave + octIndex;
      Object.entries(blackKeyOffsets).forEach(([sharpNote, localWhiteIndex]) => {
        const noteIndex = notes.indexOf(sharpNote);
        const midi = oct * 12 + noteIndex + 12;
        const globalWhiteCount = octIndex * 7 + localWhiteIndex;

        const keyEl = document.createElement('div');
        keyEl.className = 'piano-key black-key';
        keyEl.dataset.midi = midi;
        keyEl.dataset.note = `${sharpNote}${oct}`;

        // Optically centered directly over the boundary
        const centerPercent = (globalWhiteCount / totalWhiteKeys) * 100;
        keyEl.style.left = `calc(${centerPercent}% - 1.9%)`;
        keyEl.style.width = '3.8%';

        const keyLabel = document.createElement('span');
        keyLabel.className = 'key-label';
        keyLabel.textContent = `${sharpNote}${oct}`;
        keyEl.appendChild(keyLabel);

        setupKeyEvents(keyEl, midi);
        keyboardContainer.appendChild(keyEl);
      });
    }
  }

  function setupKeyEvents(keyEl, midi) {
    keyEl.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      keyEl.setPointerCapture(e.pointerId);
      unlockAudio();
      engine.triggerNoteOn(midi, 0.85);
      keyEl.classList.add('is-pressed');
    });

    const releaseKey = () => {
      engine.triggerNoteOff(midi);
      keyEl.classList.remove('is-pressed');
    };

    keyEl.addEventListener('pointerup', releaseKey);
    keyEl.addEventListener('pointercancel', releaseKey);
  }

  buildKeyboard();

  // Octave Shift Buttons
  document.getElementById('octave-down')?.addEventListener('click', () => {
    if (currentOctave > 1) {
      currentOctave--;
      document.getElementById('octave-display').textContent = `OCT ${currentOctave}`;
      buildKeyboard();
      knobController.playMechanicalClick(1600, 0.006);
    }
  });

  document.getElementById('octave-up')?.addEventListener('click', () => {
    if (currentOctave < 6) {
      currentOctave++;
      document.getElementById('octave-display').textContent = `OCT ${currentOctave}`;
      buildKeyboard();
      knobController.playMechanicalClick(2000, 0.006);
    }
  });

  // --- Computer QWERTY Keyboard Mapping ---
  const keyMap = {
    // Octave 1
    'KeyA': 0,  // C
    'KeyW': 1,  // C#
    'KeyS': 2,  // D
    'KeyE': 3,  // D#
    'KeyD': 4,  // E
    'KeyF': 5,  // F
    'KeyT': 6,  // F#
    'KeyG': 7,  // G
    'KeyY': 8,  // G#
    'KeyH': 9,  // A
    'KeyU': 10, // A#
    'KeyJ': 11, // B
    // Octave 2
    'KeyK': 12, // C
    'KeyO': 13, // C#
    'KeyL': 14, // D
    'KeyP': 15, // D#
    'Semicolon': 16 // E
  };

  window.addEventListener('keydown', (e) => {
    if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      const isPlaying = sequencer.toggle();
      updatePlayButton(isPlaying);
      return;
    }

    if (e.code === 'KeyZ') {
      document.getElementById('octave-down')?.click();
      return;
    }
    if (e.code === 'KeyX') {
      document.getElementById('octave-up')?.click();
      return;
    }

    const offset = keyMap[e.code];
    if (offset !== undefined) {
      e.preventDefault();
      unlockAudio();
      const midi = (currentOctave * 12 + 12) + offset;
      if (!activeKeys.has(e.code)) {
        activeKeys.add(e.code);
        engine.triggerNoteOn(midi, 0.85);
        const keyEl = document.querySelector(`.piano-key[data-midi="${midi}"]`);
        keyEl?.classList.add('is-pressed');
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    const offset = keyMap[e.code];
    if (offset !== undefined) {
      activeKeys.delete(e.code);
      const midi = (currentOctave * 12 + 12) + offset;
      engine.triggerNoteOff(midi);
      const keyEl = document.querySelector(`.piano-key[data-midi="${midi}"]`);
      keyEl?.classList.remove('is-pressed');
    }
  });

  // --- Web MIDI Controller Support ---
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then((midiAccess) => {
      const inputs = midiAccess.inputs.values();
      for (let input of inputs) {
        input.onmidimessage = (msg) => {
          const [status, note, velocity] = msg.data;
          const command = status >> 4;
          if (command === 9 && velocity > 0) {
            // Note On
            unlockAudio();
            engine.triggerNoteOn(note, velocity / 127);
            document.querySelector(`.piano-key[data-midi="${note}"]`)?.classList.add('is-pressed');
          } else if (command === 8 || (command === 9 && velocity === 0)) {
            // Note Off
            engine.triggerNoteOff(note);
            document.querySelector(`.piano-key[data-midi="${note}"]`)?.classList.remove('is-pressed');
          }
        };
      }
    }).catch(() => {
      // MIDI access optional or denied
    });
  }

  // --- Sequencer UI Controls ---
  const playBtn = document.getElementById('btn-seq-play');
  const updatePlayButton = (isPlaying) => {
    if (playBtn) {
      playBtn.classList.toggle('is-active', isPlaying);
      playBtn.querySelector('.btn-label').textContent = isPlaying ? 'STOP SEQ' : 'START SEQ';
    }
  };

  playBtn?.addEventListener('click', () => {
    unlockAudio();
    const isPlaying = sequencer.toggle();
    updatePlayButton(isPlaying);
    knobController.playMechanicalClick(2100, 0.01);
  });

  document.getElementById('btn-seq-random')?.addEventListener('click', () => {
    sequencer.randomizePattern();
    knobController.playMechanicalClick(2600, 0.008);
  });

  document.getElementById('scale-select')?.addEventListener('change', (e) => {
    sequencer.setScale(e.target.value);
    knobController.playMechanicalClick(1400, 0.005);
  });

  // Visualizer Mode Selector
  document.querySelectorAll('.scope-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.scope-mode-btn').forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      visualizer.setMode(btn.dataset.mode);
      knobController.playMechanicalClick(1800, 0.006);
    });
  });

  // --- Preset Loader ---
  const presetSelect = document.getElementById('preset-select');
  function loadPreset(presetKey) {
    const preset = SYNTH_PRESETS[presetKey];
    if (!preset) return;

    // Apply all audio parameters
    Object.entries(preset.params).forEach(([param, value]) => {
      engine.setParam(param, value);
      knobController.setKnobValue(param, value);

      // Also update any toggle button groups if applicable
      if (param === 'osc1Wave') {
        document.querySelectorAll('.toggle-btn[data-param="osc1Wave"]').forEach(btn => {
          btn.classList.toggle('is-selected', btn.dataset.val === value);
        });
      } else if (param === 'osc2Wave') {
        document.querySelectorAll('.toggle-btn[data-param="osc2Wave"]').forEach(btn => {
          btn.classList.toggle('is-selected', btn.dataset.val === value);
        });
      }
    });

    // Update sequencer
    if (preset.bpm) {
      sequencer.setBpm(preset.bpm);
      const bpmKnob = document.querySelector('.knob-dial[data-param="bpm"]');
      if (bpmKnob) {
        bpmKnob.dataset.val = preset.bpm;
        knobController.updateKnobVisual(bpmKnob, preset.bpm, 40, 240);
        knobController.updateValueDisplay(bpmKnob, preset.bpm);
      }
    }
    if (preset.scale) {
      sequencer.setScale(preset.scale);
      const scaleEl = document.getElementById('scale-select');
      if (scaleEl) scaleEl.value = preset.scale;
    }
    if (preset.rootNote) {
      sequencer.setRootNote(preset.rootNote);
    }

    const descEl = document.getElementById('preset-desc');
    if (descEl) descEl.textContent = preset.description;
  }

  presetSelect?.addEventListener('change', (e) => {
    loadPreset(e.target.value);
    knobController.playMechanicalClick(1500, 0.008);
  });

  // Load initial preset
  loadPreset('blade_runner');

  // --- Session WAV Recorder ---
  const recordBtn = document.getElementById('btn-record');
  const recordLed = document.getElementById('record-led');
  const recTimeDisplay = document.getElementById('record-time');
  let recTimer = null;
  let recStartTime = 0;

  recordBtn?.addEventListener('click', async () => {
    await unlockAudio();
    if (!engine.isRecording) {
      const ok = engine.startRecording();
      if (ok) {
        recordBtn.classList.add('is-recording');
        recordLed?.classList.add('is-active');
        recordBtn.querySelector('.btn-label').textContent = 'STOP REC';
        recStartTime = Date.now();
        recTimer = setInterval(() => {
          const elapsed = Math.floor((Date.now() - recStartTime) / 1000);
          const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
          const secs = (elapsed % 60).toString().padStart(2, '0');
          if (recTimeDisplay) recTimeDisplay.textContent = `${mins}:${secs}`;
        }, 500);
      }
    } else {
      clearInterval(recTimer);
      const blob = await engine.stopRecording();
      recordBtn.classList.remove('is-recording');
      recordLed?.classList.remove('is-active');
      recordBtn.querySelector('.btn-label').textContent = 'REC AUDIO';
      if (recTimeDisplay) recTimeDisplay.textContent = '00:00';

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kinesis-session-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    }
  });

  // Panic button (Kill all notes)
  document.getElementById('btn-panic')?.addEventListener('click', () => {
    engine.releaseAll();
    sequencer.stop();
    updatePlayButton(false);
    document.querySelectorAll('.piano-key').forEach(k => k.classList.remove('is-pressed'));
    knobController.playMechanicalClick(800, 0.015);
  });
});
