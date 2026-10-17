# KINESIS // SYS-84 Analog Synthesizer & Tape Echo Station

A tactile, physical-modeled analog synthesizer and magnetic tape delay workstation running in the browser via the Web Audio API and HTML5 Canvas.

Designed under the **Anti-Slop Design Guidelines**: bespoke industrial hardware console aesthetic, calibrated vector CRT phosphor oscilloscope, zero generic presets, and 100% functional mechanical controls.

---

## Features

### 1. Sound Architecture (Physical Web Audio API)
- **Dual Analog-Modelled VCOs**: Sawtooth, Square, Triangle, and Sine waveforms with octave shift (-2 to +2), independent detune (-25 to +25 cents), and level mixing.
- **Sub-Oscillator & Analog Noise Generator**: Sine/Square sub-oscillator and authentic pink/tape noise generator for dusty vintage warmth.
- **24dB Resonant Moog-Style Ladder Lowpass Filter**: Frequency cutoff (40Hz – 12kHz), resonance/Q, and bipolar envelope modulation amount.
- **Dual ADSR Envelopes**: Independent Amp (VCA) and Filter (VCF) envelopes with exponential decay/release curves.
- **Global LFO**: Triangle, Sine, and Square modulators mapped to pitch vibrato and filter sweep.
- **Magnetic Tape Echo & Saturation**: Bucket-brigade tape loop with variable delay time, feedback gain, high-frequency tape absorption filter, soft-clipping saturation transfer curve, and wow/flutter pitch drift.
- **Stereo Space Convolver**: Synthetic impulse room & plate reverberation.

### 2. Signature Phosphor Vector CRT Display
- **Vector / Lissajous Mode**: X/Y trajectory correlation comparing dry synth signal with tape-delayed feedback.
- **Dual-Beam Oscilloscope Trace**: Zero-crossing stabilized dual phosphor beam showing live and delayed waveforms.
- **Spectral Waterfall / RTA**: Stepped frequency bar analyzer with real-time peak-hold physics.
- **CRT Glass Physics**: Phosphor decay persistence trail, spherical vignette, horizontal scanlines, and optical reflection glare.

### 3. Tactile 16-Step Analog Sequencer
- Lookahead clock scheduling with high-precision `AudioContext.currentTime` timing.
- Per-step Active/Mute toggle and Accent switches.
- Per-step pitch offset adjustable via mouse wheel.
- Swing / Groove micro-timing engine.
- Musical Scale Quantizer (Minor Pentatonic, Dorian, Phrygian, Japanese Hirajoshi, Chromatic).
- Algorithmic generative pattern randomizer.
- Synchronized spinning tape reels reflecting tape transport physics.

### 4. Playability & Hardware Controls
- **Playable 2-Octave Keyboard**: Click or touch keys directly.
- **Computer QWERTY Keyboard**:
  - White keys: `[A]`, `[S]`, `[D]`, `[F]`, `[G]`, `[H]`, `[J]`, `[K]`, `[L]`, `[;]`
  - Black keys: `[W]`, `[E]`, `[T]`, `[Y]`, `[U]`, `[O]`, `[P]`
  - Octave Shift: `[Z]` (Down), `[X]` (Up)
  - Spacebar: `[SPACE]` Toggle sequencer play/stop
- **Web MIDI Controller**: Plug in any USB MIDI keyboard or hardware controller — velocity sensitivity supported automatically.
- **Built-in Session Audio Recorder**: Record your performances directly to downloadable audio files.
- **Factory Presets**:
  - `01 // Vangelis CS-80 Brass`
  - `02 // Kyoto Ambient Tape Cloud`
  - `03 // Tokyo 303 Resonant Acid`
  - `04 // Boards of Canada Tape Bleed`
  - `05 // Deep Space Pulsar Radar`

---

## Quickstart

Run a local server:
```bash
python3 -m http.server 4173
```
Open [http://localhost:4173](http://localhost:4173) in your browser.
Click anywhere to engage the audio bus, turn the rotary dials (drag up/down or use your mouse wheel), and play!
