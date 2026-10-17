/**
 * KINESIS ANALOG SYNTHESIZER & TAPE ECHO ENGINE
 * Pure Web Audio API physical sound architecture
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;

    // Master nodes
    this.masterGain = null;
    this.masterLimiter = null;
    this.analyser = null;
    this.tapeEchoDelay = null;
    this.tapeEchoFeedback = null;
    this.tapeEchoFilter = null;
    this.tapeSaturation = null;
    this.reverbNode = null;
    this.reverbGain = null;
    this.dryGain = null;

    // Recorder
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;

    // Voices & Polyphony
    this.maxPolyphony = 8;
    this.activeVoices = new Map(); // noteNumber -> Voice
    this.voicePool = [];
    this.glideTime = 0.04;
    this.isMonophonic = false;
    this.lastMonoNote = null;

    // Synth Parameters
    this.params = {
      // Osc 1
      osc1Wave: 'sawtooth',
      osc1Octave: 0,
      osc1Detune: -4,
      osc1Gain: 0.75,

      // Osc 2
      osc2Wave: 'square',
      osc2Octave: -1,
      osc2Detune: 7,
      osc2Gain: 0.55,

      // Sub Osc & Noise
      subWave: 'sine',
      subGain: 0.4,
      noiseGain: 0.08,
      noiseColor: 'pink', // 'white' or 'pink'

      // Filter
      filterCutoff: 1800,
      filterResonance: 4.5,
      filterEnvAmount: 2400,
      filterTracking: 0.5,

      // Filter Envelope
      filterAttack: 0.02,
      filterDecay: 0.35,
      filterSustain: 0.4,
      filterRelease: 0.6,

      // Amp Envelope
      ampAttack: 0.01,
      ampDecay: 0.25,
      ampSustain: 0.7,
      ampRelease: 0.45,

      // LFO
      lfoWave: 'triangle',
      lfoRate: 3.5,
      lfoPitchDepth: 0.05,
      lfoFilterDepth: 600,

      // Tape Echo
      echoTime: 0.32,
      echoFeedback: 0.48,
      echoTone: 2400,
      echoMix: 0.35,
      tapeFlutter: 0.003,
      tapeSaturationAmount: 0.4,

      // Reverb Space
      reverbMix: 0.25,
      reverbDecay: 2.8,

      // Master
      masterVolume: 0.85
    };

    // Tape wow/flutter oscillator
    this.flutterOsc = null;
    this.flutterGain = null;

    // Noise buffer
    this.pinkNoiseBuffer = null;
    this.whiteNoiseBuffer = null;
  }

  async init() {
    if (this.isInitialized) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass({ latencyHint: 'interactive' });

    // Generate noise buffers
    this.generateNoiseBuffers();

    // Master chain setup
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.params.masterVolume, this.ctx.currentTime);

    this.masterLimiter = this.ctx.createDynamicsCompressor();
    this.masterLimiter.threshold.setValueAtTime(-2.0, this.ctx.currentTime);
    this.masterLimiter.knee.setValueAtTime(6.0, this.ctx.currentTime);
    this.masterLimiter.ratio.setValueAtTime(14.0, this.ctx.currentTime);
    this.masterLimiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.masterLimiter.release.setValueAtTime(0.15, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.82;

    // Direct dry path
    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Tape Echo path
    this.setupTapeEcho();

    // Vintage Reverb Space
    await this.setupReverb();

    // Master bus mixing
    this.dryGain.connect(this.masterLimiter);
    this.tapeEchoMixer = this.ctx.createGain();
    this.tapeEchoMixer.gain.setValueAtTime(this.params.echoMix, this.ctx.currentTime);
    this.tapeEchoFilter.connect(this.tapeEchoMixer);
    this.tapeEchoMixer.connect(this.masterLimiter);

    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.setValueAtTime(this.params.reverbMix, this.ctx.currentTime);
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.masterLimiter);

    // Limiter -> Master Gain -> Analyser -> Destination
    this.masterLimiter.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Recorder node destination
    this.recorderDest = this.ctx.createMediaStreamDestination();
    this.analyser.connect(this.recorderDest);

    // Global LFO for voice modulation
    this.setupGlobalLfo();

    this.isInitialized = true;
  }

  ensureContext() {
    if (!this.ctx) return this.init();
    if (this.ctx.state === 'suspended') {
      return this.ctx.resume();
    }
    return Promise.resolve();
  }

  setupTapeEcho() {
    this.tapeEchoDelay = this.ctx.createDelay(5.0);
    this.tapeEchoDelay.delayTime.setValueAtTime(this.params.echoTime, this.ctx.currentTime);

    this.tapeEchoFeedback = this.ctx.createGain();
    this.tapeEchoFeedback.gain.setValueAtTime(this.params.echoFeedback, this.ctx.currentTime);

    // High cut filter in feedback loop to emulate magnetic tape absorption
    this.tapeEchoFilter = this.ctx.createBiquadFilter();
    this.tapeEchoFilter.type = 'lowpass';
    this.tapeEchoFilter.frequency.setValueAtTime(this.params.echoTone, this.ctx.currentTime);
    this.tapeEchoFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    // Tape saturation curve
    this.tapeSaturation = this.ctx.createWaveShaper();
    this.tapeSaturation.curve = this.createTapeSaturationCurve(this.params.tapeSaturationAmount);
    this.tapeSaturation.oversample = '2x';

    // Wow and flutter modulation on tape delay time
    this.flutterOsc = this.ctx.createOscillator();
    this.flutterOsc.frequency.setValueAtTime(0.85, this.ctx.currentTime); // slow wow
    this.flutterGain = this.ctx.createGain();
    this.flutterGain.gain.setValueAtTime(this.params.tapeFlutter, this.ctx.currentTime);
    this.flutterOsc.connect(this.flutterGain);
    this.flutterGain.connect(this.tapeEchoDelay.delayTime);
    this.flutterOsc.start();

    // Connect feedback loop: delay -> tape saturation -> filter -> feedback gain -> delay
    this.tapeEchoDelay.connect(this.tapeSaturation);
    this.tapeSaturation.connect(this.tapeEchoFilter);
    this.tapeEchoFilter.connect(this.tapeEchoFeedback);
    this.tapeEchoFeedback.connect(this.tapeEchoDelay);
  }

  createTapeSaturationCurve(amount = 0.4) {
    const k = amount * 12;
    const n = 4096;
    const curve = new Float32Array(n);
    const deg = Math.PI / 180;
    for (let i = 0; i < n; ++i) {
      const x = (i * 2) / n - 1;
      // Soft saturation with asymmetric warm even-harmonic tape compression
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x)) * 0.45;
    }
    return curve;
  }

  async setupReverb() {
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this.createSyntheticImpulse(this.params.reverbDecay);
  }

  createSyntheticImpulse(duration = 2.5, decay = 2.0) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / length;
      const envelope = Math.exp(-t * decay);
      // Diffuse noise with early reflection micro-clusters
      const noiseL = (Math.random() * 2 - 1) * envelope;
      const noiseR = (Math.random() * 2 - 1) * envelope;
      left[i] = noiseL;
      right[i] = noiseR;
    }
    return impulse;
  }

  setupGlobalLfo() {
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = this.params.lfoWave;
    this.lfo.frequency.setValueAtTime(this.params.lfoRate, this.ctx.currentTime);

    this.lfoFilterGain = this.ctx.createGain();
    this.lfoFilterGain.gain.setValueAtTime(this.params.lfoFilterDepth, this.ctx.currentTime);

    this.lfoPitchGain = this.ctx.createGain();
    this.lfoPitchGain.gain.setValueAtTime(this.params.lfoPitchDepth * 100, this.ctx.currentTime);

    this.lfo.connect(this.lfoFilterGain);
    this.lfo.connect(this.lfoPitchGain);
    this.lfo.start();
  }

  generateNoiseBuffers() {
    const bufferSize = this.ctx ? this.ctx.sampleRate * 2 : 44100 * 2;
    // White noise
    this.whiteNoiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const whiteData = this.whiteNoiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      whiteData[i] = Math.random() * 2 - 1;
    }

    // Pink noise (Paul Kellet's filtered white noise method)
    this.pinkNoiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const pinkData = this.pinkNoiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pinkData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }

  midiToFreq(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  // --- Voice Triggering ---
  triggerNoteOn(midiNote, velocity = 0.8) {
    if (!this.isInitialized) return;

    if (this.isMonophonic && this.activeVoices.size > 0) {
      // Portamento glide into existing mono voice
      const existingVoice = this.activeVoices.values().next().value;
      const targetFreq = this.midiToFreq(midiNote);
      existingVoice.glideTo(targetFreq, this.glideTime);
      this.lastMonoNote = midiNote;
      return existingVoice;
    }

    if (this.activeVoices.has(midiNote)) {
      this.triggerNoteOff(midiNote);
    }

    // Allocate Voice
    const voice = new SynthVoice(this, midiNote, velocity);
    this.activeVoices.set(midiNote, voice);
    voice.start();
    return voice;
  }

  triggerNoteOff(midiNote) {
    if (!this.isInitialized) return;
    const voice = this.activeVoices.get(midiNote);
    if (voice) {
      voice.release();
      this.activeVoices.delete(midiNote);
    }
  }

  releaseAll() {
    this.activeVoices.forEach((voice) => voice.release());
    this.activeVoices.clear();
  }

  // Parameter Updaters
  setParam(name, value) {
    this.params[name] = value;
    if (!this.isInitialized) return;

    const now = this.ctx.currentTime;
    switch (name) {
      case 'masterVolume':
        this.masterGain.gain.setTargetAtTime(value, now, 0.015);
        break;
      case 'filterCutoff':
        this.activeVoices.forEach(v => v.updateFilter());
        break;
      case 'filterResonance':
        this.activeVoices.forEach(v => v.updateFilter());
        break;
      case 'lfoRate':
        this.lfo.frequency.setTargetAtTime(value, now, 0.02);
        break;
      case 'lfoFilterDepth':
        this.lfoFilterGain.gain.setTargetAtTime(value, now, 0.02);
        break;
      case 'lfoPitchDepth':
        this.lfoPitchGain.gain.setTargetAtTime(value * 100, now, 0.02);
        break;
      case 'echoTime':
        this.tapeEchoDelay.delayTime.setTargetAtTime(value, now, 0.05);
        break;
      case 'echoFeedback':
        this.tapeEchoFeedback.gain.setTargetAtTime(Math.min(value, 0.95), now, 0.02);
        break;
      case 'echoTone':
        this.tapeEchoFilter.frequency.setTargetAtTime(value, now, 0.02);
        break;
      case 'echoMix':
        this.tapeEchoMixer.gain.setTargetAtTime(value, now, 0.02);
        break;
      case 'tapeFlutter':
        this.flutterGain.gain.setTargetAtTime(value, now, 0.02);
        break;
      case 'tapeSaturationAmount':
        this.tapeSaturation.curve = this.createTapeSaturationCurve(value);
        break;
      case 'reverbMix':
        this.reverbGain.gain.setTargetAtTime(value, now, 0.02);
        break;
      case 'reverbDecay':
        this.reverbNode.buffer = this.createSyntheticImpulse(value);
        break;
    }
  }

  // Session WAV Recorder
  startRecording() {
    if (!this.recorderDest) return false;
    this.recordedChunks = [];
    const stream = this.recorderDest.stream;
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(200);
    this.isRecording = true;
    return true;
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.isRecording = false;
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }
}

/**
 * Individual Synthesizer Voice
 */
class SynthVoice {
  constructor(engine, midiNote, velocity) {
    this.engine = engine;
    this.ctx = engine.ctx;
    this.midiNote = midiNote;
    this.velocity = Math.max(0.1, Math.min(1.0, velocity));
    this.baseFreq = engine.midiToFreq(midiNote);

    const now = this.ctx.currentTime;

    // Voice Voice Gain (VCA)
    this.vca = this.ctx.createGain();
    this.vca.gain.setValueAtTime(0, now);

    // Voice Filter (VCF)
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.Q.setValueAtTime(engine.params.filterResonance, now);

    // Osc 1
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = engine.params.osc1Wave;
    const osc1Freq = this.baseFreq * Math.pow(2, engine.params.osc1Octave);
    this.osc1.frequency.setValueAtTime(osc1Freq, now);
    this.osc1.detune.setValueAtTime(engine.params.osc1Detune, now);
    this.osc1Gain = this.ctx.createGain();
    this.osc1Gain.gain.setValueAtTime(engine.params.osc1Gain, now);
    this.osc1.connect(this.osc1Gain);

    // Osc 2
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = engine.params.osc2Wave;
    const osc2Freq = this.baseFreq * Math.pow(2, engine.params.osc2Octave);
    this.osc2.frequency.setValueAtTime(osc2Freq, now);
    this.osc2.detune.setValueAtTime(engine.params.osc2Detune, now);
    this.osc2Gain = this.ctx.createGain();
    this.osc2Gain.gain.setValueAtTime(engine.params.osc2Gain, now);
    this.osc2.connect(this.osc2Gain);

    // Sub Oscillator
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = engine.params.subWave;
    this.subOsc.frequency.setValueAtTime(this.baseFreq * 0.5, now);
    this.subGain = this.ctx.createGain();
    this.subGain.gain.setValueAtTime(engine.params.subGain, now);
    this.subOsc.connect(this.subGain);

    // Noise Generator
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = engine.params.noiseColor === 'pink' 
      ? engine.pinkNoiseBuffer 
      : engine.whiteNoiseBuffer;
    this.noiseSource.loop = true;
    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(engine.params.noiseGain, now);
    this.noiseSource.connect(this.noiseGain);

    // Mix oscillators into Filter
    this.osc1Gain.connect(this.filter);
    this.osc2Gain.connect(this.filter);
    this.subGain.connect(this.filter);
    this.noiseGain.connect(this.filter);

    // Filter into VCA
    this.filter.connect(this.vca);

    // LFO Modulation connections
    engine.lfoPitchGain.connect(this.osc1.detune);
    engine.lfoPitchGain.connect(this.osc2.detune);
    engine.lfoFilterGain.connect(this.filter.frequency);

    // VCA fanout into Dry, Tape Delay, and Reverb
    this.vca.connect(engine.dryGain);
    this.vca.connect(engine.tapeEchoDelay);
    this.vca.connect(engine.reverbNode);
  }

  start() {
    const now = this.ctx.currentTime;
    const p = this.engine.params;

    // Start oscillators
    this.osc1.start(now);
    this.osc2.start(now);
    this.subOsc.start(now);
    this.noiseSource.start(now);

    // Amp Envelope Attack -> Decay -> Sustain
    const attackTime = Math.max(0.005, p.ampAttack);
    const decayTime = Math.max(0.01, p.ampDecay);
    const peakGain = this.velocity * 0.9;
    const sustainGain = peakGain * p.ampSustain;

    this.vca.gain.cancelScheduledValues(now);
    this.vca.gain.setValueAtTime(0.0001, now);
    this.vca.gain.linearRampToValueAtTime(peakGain, now + attackTime);
    this.vca.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustainGain), now + attackTime + decayTime);

    // Filter Envelope
    const fAttack = Math.max(0.005, p.filterAttack);
    const fDecay = Math.max(0.01, p.filterDecay);
    const baseCutoff = Math.max(40, p.filterCutoff);
    const targetCutoff = Math.min(18000, baseCutoff + p.filterEnvAmount * this.velocity);
    const sustainCutoff = Math.min(18000, baseCutoff + (targetCutoff - baseCutoff) * p.filterSustain);

    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(baseCutoff, now);
    this.filter.frequency.exponentialRampToValueAtTime(Math.max(40, targetCutoff), now + fAttack);
    this.filter.frequency.exponentialRampToValueAtTime(Math.max(40, sustainCutoff), now + fAttack + fDecay);
  }

  glideTo(targetFreq, glideTime) {
    const now = this.ctx.currentTime;
    this.baseFreq = targetFreq;
    const osc1Target = targetFreq * Math.pow(2, this.engine.params.osc1Octave);
    const osc2Target = targetFreq * Math.pow(2, this.engine.params.osc2Octave);
    const subTarget = targetFreq * 0.5;

    this.osc1.frequency.setTargetAtTime(osc1Target, now, glideTime);
    this.osc2.frequency.setTargetAtTime(osc2Target, now, glideTime);
    this.subOsc.frequency.setTargetAtTime(subTarget, now, glideTime);
  }

  updateFilter() {
    const now = this.ctx.currentTime;
    this.filter.Q.setTargetAtTime(this.engine.params.filterResonance, now, 0.01);
  }

  release() {
    const now = this.ctx.currentTime;
    const p = this.engine.params;
    const releaseTime = Math.max(0.02, p.ampRelease);
    const fRelease = Math.max(0.02, p.filterRelease);

    // VCA Release
    this.vca.gain.cancelScheduledValues(now);
    this.vca.gain.setValueAtTime(Math.max(0.0001, this.vca.gain.value), now);
    this.vca.gain.exponentialRampToValueAtTime(0.00001, now + releaseTime);

    // Filter Release
    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(Math.max(40, this.filter.frequency.value), now);
    this.filter.frequency.exponentialRampToValueAtTime(Math.max(40, p.filterCutoff), now + fRelease);

    // Stop and disconnect after release finishes
    const stopTime = now + Math.max(releaseTime, fRelease) + 0.05;
    this.osc1.stop(stopTime);
    this.osc2.stop(stopTime);
    this.subOsc.stop(stopTime);
    this.noiseSource.stop(stopTime);

    setTimeout(() => {
      try {
        this.osc1.disconnect();
        this.osc2.disconnect();
        this.subOsc.disconnect();
        this.noiseSource.disconnect();
        this.filter.disconnect();
        this.vca.disconnect();
      } catch (e) {
        // already cleaned
      }
    }, (Math.max(releaseTime, fRelease) + 0.1) * 1000);
  }
}

window.AudioEngine = AudioEngine;
