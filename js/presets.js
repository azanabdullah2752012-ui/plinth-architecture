/**
 * KINESIS FACTORY HARDWARE PRESETS
 * Authentically crafted analog patches
 */

const SYNTH_PRESETS = {
  'blade_runner': {
    name: '01. Vangelis CS-80 Brass',
    description: 'Slow-swelling detuned dual saw with wide tape flutter and cavernous reverb.',
    params: {
      osc1Wave: 'sawtooth', osc1Octave: 0, osc1Detune: -8, osc1Gain: 0.85,
      osc2Wave: 'sawtooth', osc2Octave: 0, osc2Detune: 9, osc2Gain: 0.75,
      subWave: 'sine', subGain: 0.45, noiseGain: 0.05,
      filterCutoff: 1200, filterResonance: 3.2, filterEnvAmount: 3200,
      filterAttack: 0.28, filterDecay: 0.8, filterSustain: 0.65, filterRelease: 1.2,
      ampAttack: 0.18, ampDecay: 0.6, ampSustain: 0.85, ampRelease: 1.4,
      lfoWave: 'triangle', lfoRate: 4.2, lfoPitchDepth: 0.06, lfoFilterDepth: 450,
      echoTime: 0.42, echoFeedback: 0.52, echoTone: 1800, echoMix: 0.4,
      tapeFlutter: 0.006, tapeSaturationAmount: 0.55,
      reverbMix: 0.48, reverbDecay: 3.5, masterVolume: 0.85
    },
    bpm: 92,
    scale: 'dorian',
    rootNote: 48
  },

  'kyoto_tape': {
    name: '02. Kyoto Ambient Tape Cloud',
    description: 'Drifting Hirajoshi meditative loops bathed in warm tape saturation.',
    params: {
      osc1Wave: 'sine', osc1Octave: 0, osc1Detune: -3, osc1Gain: 0.9,
      osc2Wave: 'triangle', osc2Octave: 1, osc2Detune: 4, osc2Gain: 0.5,
      subWave: 'sine', subGain: 0.6, noiseGain: 0.12,
      filterCutoff: 950, filterResonance: 4.8, filterEnvAmount: 1800,
      filterAttack: 0.35, filterDecay: 1.2, filterSustain: 0.4, filterRelease: 2.2,
      ampAttack: 0.22, ampDecay: 1.0, ampSustain: 0.6, ampRelease: 2.4,
      lfoWave: 'sine', lfoRate: 1.2, lfoPitchDepth: 0.04, lfoFilterDepth: 250,
      echoTime: 0.55, echoFeedback: 0.68, echoTone: 1400, echoMix: 0.55,
      tapeFlutter: 0.008, tapeSaturationAmount: 0.6,
      reverbMix: 0.55, reverbDecay: 4.2, masterVolume: 0.82
    },
    bpm: 78,
    scale: 'hirajoshi',
    rootNote: 50
  },

  'acid_303': {
    name: '03. Tokyo 303 Resonant Acid',
    description: 'Aggressive squealing filter contour with snappy envelope snaps.',
    params: {
      osc1Wave: 'sawtooth', osc1Octave: -1, osc1Detune: 0, osc1Gain: 0.95,
      osc2Wave: 'square', osc2Octave: -1, osc2Detune: 4, osc2Gain: 0.3,
      subWave: 'square', subGain: 0.5, noiseGain: 0.02,
      filterCutoff: 480, filterResonance: 12.0, filterEnvAmount: 6500,
      filterAttack: 0.005, filterDecay: 0.18, filterSustain: 0.1, filterRelease: 0.15,
      ampAttack: 0.005, ampDecay: 0.22, ampSustain: 0.2, ampRelease: 0.12,
      lfoWave: 'square', lfoRate: 7.0, lfoPitchDepth: 0.0, lfoFilterDepth: 800,
      echoTime: 0.26, echoFeedback: 0.35, echoTone: 3200, echoMix: 0.28,
      tapeFlutter: 0.002, tapeSaturationAmount: 0.75,
      reverbMix: 0.18, reverbDecay: 1.6, masterVolume: 0.88
    },
    bpm: 128,
    scale: 'phrygian',
    rootNote: 45
  },

  'boc_melancholy': {
    name: '04. Boards of Canada Tape Bleed',
    description: '1970s educational reel-to-reel wobble, dusty pink noise, and nostalgic drift.',
    params: {
      osc1Wave: 'triangle', osc1Octave: 0, osc1Detune: -11, osc1Gain: 0.75,
      osc2Wave: 'sawtooth', osc2Octave: 0, osc2Detune: 10, osc2Gain: 0.65,
      subWave: 'sine', subGain: 0.4, noiseGain: 0.16,
      filterCutoff: 1400, filterResonance: 2.4, filterEnvAmount: 2200,
      filterAttack: 0.08, filterDecay: 0.5, filterSustain: 0.55, filterRelease: 0.9,
      ampAttack: 0.05, ampDecay: 0.45, ampSustain: 0.7, ampRelease: 1.0,
      lfoWave: 'sine', lfoRate: 0.9, lfoPitchDepth: 0.12, lfoFilterDepth: 380,
      echoTime: 0.38, echoFeedback: 0.46, echoTone: 1600, echoMix: 0.42,
      tapeFlutter: 0.012, tapeSaturationAmount: 0.65,
      reverbMix: 0.32, reverbDecay: 2.8, masterVolume: 0.84
    },
    bpm: 96,
    scale: 'minor_pentatonic',
    rootNote: 48
  },

  'pulsar_telemetry': {
    name: '05. Deep Space Pulsar Radar',
    description: 'Cosmic percussive clicks and rhythmic orbital delays from a radio telescope.',
    params: {
      osc1Wave: 'sine', osc1Octave: 1, osc1Detune: 0, osc1Gain: 0.8,
      osc2Wave: 'triangle', osc2Octave: 2, osc2Detune: 14, osc2Gain: 0.6,
      subWave: 'sine', subGain: 0.2, noiseGain: 0.18,
      filterCutoff: 3400, filterResonance: 8.5, filterEnvAmount: 4800,
      filterAttack: 0.002, filterDecay: 0.08, filterSustain: 0.05, filterRelease: 0.1,
      ampAttack: 0.002, ampDecay: 0.12, ampSustain: 0.05, ampRelease: 0.15,
      lfoWave: 'sawtooth', lfoRate: 14.0, lfoPitchDepth: 0.08, lfoFilterDepth: 1200,
      echoTime: 0.36, echoFeedback: 0.72, echoTone: 4200, echoMix: 0.6,
      tapeFlutter: 0.004, tapeSaturationAmount: 0.4,
      reverbMix: 0.42, reverbDecay: 4.8, masterVolume: 0.8
    },
    bpm: 132,
    scale: 'minor_pentatonic',
    rootNote: 60
  }
};

window.SYNTH_PRESETS = SYNTH_PRESETS;
