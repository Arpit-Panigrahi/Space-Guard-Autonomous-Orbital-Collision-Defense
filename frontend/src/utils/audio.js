// Web Audio API Grand Synthesizer & Ambient Space Soundscape Generator
// Offline, zero-latency, multi-oscillator continuous generative synthesis

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.ambientGain = null;
    this.ambientNodes = [];
    this.isAmbientPlaying = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ── 1. CONTINUOUS GENERATIVE AMBIENT SPACE SOUNDSCAPE ──
  startAmbientDrone() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.isAmbientPlaying) return;

    try {
      const now = this.ctx.currentTime;

      // Master Ambient Gain Node (Smooth 2-second fade-in)
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.0001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.05, now + 2.0);
      this.ambientGain.connect(this.ctx.destination);

      // Low-pass Filter with Organic LFO "Breathing"
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);

      const filterLfo = this.ctx.createOscillator();
      const filterLfoGain = this.ctx.createGain();
      filterLfo.type = 'sine';
      filterLfo.frequency.setValueAtTime(0.06, now); // 16-second breathing cycle
      filterLfoGain.gain.setValueAtTime(90, now);
      filterLfo.connect(filter.frequency);
      filterLfo.start(now);

      filter.connect(this.ambientGain);

      // A. Deep Sub-Bass Root Drone (36.7 Hz - D1)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(36.71, now);
      subGain.gain.setValueAtTime(0.35, now);
      subOsc.connect(subGain);
      subGain.connect(filter);
      subOsc.start(now);

      // B. Harmonic Octave Drone (73.4 Hz - D2) with subtle beating
      const octOsc = this.ctx.createOscillator();
      const octGain = this.ctx.createGain();
      octOsc.type = 'triangle';
      octOsc.frequency.setValueAtTime(73.42, now);
      octGain.gain.setValueAtTime(0.18, now);
      octOsc.connect(octGain);
      octGain.connect(filter);
      octOsc.start(now);

      // C. Celestial 5th Pad Tone (110.0 Hz - A2)
      const padOsc1 = this.ctx.createOscillator();
      const padGain1 = this.ctx.createGain();
      padOsc1.type = 'sine';
      padOsc1.frequency.setValueAtTime(110.00, now);
      padGain1.gain.setValueAtTime(0.12, now);
      padOsc1.connect(padGain1);
      padGain1.connect(filter);
      padOsc1.start(now);

      // D. Minor 9th Ambient Shimmer Tone (220.0 Hz - A3) with stereo panning
      const padOsc2 = this.ctx.createOscillator();
      const padGain2 = this.ctx.createGain();
      padOsc2.type = 'sine';
      padOsc2.frequency.setValueAtTime(220.00, now);
      padGain2.gain.setValueAtTime(0.06, now);
      padOsc2.connect(padGain2);
      padGain2.connect(this.ambientGain);
      padOsc2.start(now);

      // E. Soft Cosmic Solar Wind Static Generator (Pink Noise approximation)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.04;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(450, now);
      noiseFilter.Q.setValueAtTime(1.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.03, now);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ambientGain);
      noiseSource.start(now);

      this.ambientNodes = [
        subOsc, octOsc, padOsc1, padOsc2,
        filterLfo, noiseSource
      ];
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Ambient soundscape error:', e);
    }
  }

  stopAmbientDrone() {
    if (!this.isAmbientPlaying || !this.ambientGain || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

      setTimeout(() => {
        this.ambientNodes.forEach(node => {
          try {
            node.stop();
            node.disconnect();
          } catch (e) {}
        });
        this.ambientNodes = [];
        if (this.ambientGain) {
          try { this.ambientGain.disconnect(); } catch (e) {}
        }
        this.isAmbientPlaying = false;
      }, 1050);
    } catch (e) {
      this.isAmbientPlaying = false;
    }
  }

  // ── 2. GRAND CINEMATIC ACTIVATION (Played when enabling sound in Navbar) ──
  playGrandActivation() {
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Sub-Bass Resonant Swell (55Hz -> 110Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      const subFilter = this.ctx.createBiquadFilter();

      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(55, now);
      subOsc.frequency.exponentialRampToValueAtTime(110, now + 1.2);

      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(80, now);
      subFilter.frequency.exponentialRampToValueAtTime(280, now + 1.2);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.22, now + 0.4);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 2.5);

      // Celestial Harmonic Chord Cascade (D minor 9: D3, A3, F4, C5, E5, A5)
      const chordFrequencies = [146.83, 220.00, 349.23, 523.25, 659.25, 880.00];
      chordFrequencies.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.001, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 2.2);

        if (pan) {
          pan.pan.setValueAtTime((i / (chordFrequencies.length - 1)) * 1.2 - 0.6, now);
          osc.connect(gain);
          gain.connect(pan);
          pan.connect(this.ctx.destination);
        } else {
          osc.connect(gain);
          gain.connect(this.ctx.destination);
        }

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 2.2);
      });

      // Shimmering High Harmonic Chime
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(1760, now + 0.5);
      chimeOsc.frequency.exponentialRampToValueAtTime(880, now + 1.8);
      chimeGain.gain.setValueAtTime(0.001, now + 0.5);
      chimeGain.gain.linearRampToValueAtTime(0.06, now + 0.6);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);
      chimeOsc.start(now + 0.5);
      chimeOsc.stop(now + 2.4);

    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }

  // ── 3. CRISP HOLOGRAPHIC CLICK ──
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  // ── 4. GRAND DEEP-SPACE RADAR SONAR PULSE ──
  playRadarPing() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1244.5, now);
      osc.frequency.exponentialRampToValueAtTime(622.25, now + 0.6);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);

      setTimeout(() => {
        if (!this.ctx) return;
        const echoTime = this.ctx.currentTime;
        const echoOsc = this.ctx.createOscillator();
        const echoGain = this.ctx.createGain();
        echoOsc.type = 'sine';
        echoOsc.frequency.setValueAtTime(622.25, echoTime);
        echoGain.gain.setValueAtTime(0.05, echoTime);
        echoGain.gain.exponentialRampToValueAtTime(0.001, echoTime + 0.4);
        echoOsc.connect(echoGain);
        echoGain.connect(this.ctx.destination);
        echoOsc.start(echoTime);
        echoOsc.stop(echoTime + 0.4);
      }, 140);
    } catch (e) {}
  }

  // ── 5. ROCKET THRUSTER IGNITION ──
  playThrusterIgnition() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const rumble = this.ctx.createOscillator();
      const rumbleGain = this.ctx.createGain();
      rumble.type = 'sawtooth';
      rumble.frequency.setValueAtTime(80, now);
      rumble.frequency.exponentialRampToValueAtTime(35, now + 0.8);
      rumbleGain.gain.setValueAtTime(0.2, now);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      rumble.connect(rumbleGain);
      rumbleGain.connect(this.ctx.destination);
      rumble.start(now);
      rumble.stop(now + 0.8);

      const jet = this.ctx.createOscillator();
      const jetGain = this.ctx.createGain();
      jet.type = 'triangle';
      jet.frequency.setValueAtTime(600, now);
      jet.frequency.exponentialRampToValueAtTime(150, now + 0.6);
      jetGain.gain.setValueAtTime(0.12, now);
      jetGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      jet.connect(jetGain);
      jetGain.connect(this.ctx.destination);
      jet.start(now);
      jet.stop(now + 0.6);
    } catch (e) {}
  }

  // ── 6. CRITICAL ORBITAL ALERT BEACON ──
  playAlertCritical() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.12, 0.24, 0.36].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(idx % 2 === 0 ? 880 : 1046.5, now + offset);
        gain.gain.setValueAtTime(0.14, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.09);
      });
    } catch (e) {}
  }

  // ── 7. CELESTIAL SUCCESS TRIUMPH CHORD ──
  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [698.46, 880.00, 1046.50, 1318.51, 1567.98];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.1, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.45);
      });
    } catch (e) {}
  }
}

export const sound = new SoundSystem();
