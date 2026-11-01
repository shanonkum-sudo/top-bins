class RetroAudio {
  constructor() {
    this.ctx = null;
    this.isMusicPlaying = false;
    this.musicTimer = null;
    this.buttonSoundIndex = 0;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('AudioContext error:', e);
    }
    return this.ctx;
  }

  // Rotating retro arcade button clicks
  playBeep() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const type = this.buttonSoundIndex % 4;
      this.buttonSoundIndex++;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 0) {
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1760, now + 0.04);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 1) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(783.99, now + 0.05);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 2) {
        osc.type = 'square';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
    } catch (e) {
      console.warn('Beep error:', e);
    }
  }

  // High-Energy 32-Step Retro Tournament Theme (Bass + Synth Arp + 8-Bit Drums)
  toggleLobbyMusic() {
    const ctx = this.init();
    if (!ctx) return false;

    if (this.isMusicPlaying) {
      this.stopLobbyMusic();
      return false;
    }

    this.isMusicPlaying = true;

    // 4-bar chord progression: Cm -> Ab -> Bb -> Gm
    const bassline = [
      // Bar 1: C Minor
      130.81, 130.81, 130.81, 155.56, 130.81, 196.00, 130.81, 155.56,
      // Bar 2: Ab Major
      103.83, 103.83, 103.83, 130.81, 103.83, 155.56, 103.83, 130.81,
      // Bar 3: Bb Major
      116.54, 116.54, 116.54, 146.83, 116.54, 174.61, 116.54, 146.83,
      // Bar 4: G Minor / Turnaround
      98.00, 98.00, 98.00, 130.81, 146.83, 155.56, 174.61, 196.00,
    ];

    // High energy synth lead arpeggio melody
    const melody = [
      // Bar 1
      523.25, 622.25, 783.99, 622.25, 1046.50, 783.99, 622.25, 783.99,
      // Bar 2
      415.30, 523.25, 622.25, 523.25, 830.61, 622.25, 523.25, 622.25,
      // Bar 3
      466.16, 587.33, 698.46, 587.33, 932.33, 698.46, 587.33, 698.46,
      // Bar 4
      783.99, 698.46, 622.25, 587.33, 622.25, 587.33, 523.25, 466.16,
    ];

    let step = 0;
    const stepDuration = 145; // ~103 BPM double-time arcade rhythm

    const playStep = () => {
      if (!this.isMusicPlaying || !this.ctx) return;

      const now = this.ctx.currentTime;
      const stepIdx = step % 32;

      // 1. Driving Bassline
      const bFreq = bassline[stepIdx];
      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'sawtooth';
      bOsc.frequency.setValueAtTime(bFreq, now);

      // Lowpass filter to give bass warmth
      const bFilter = this.ctx.createBiquadFilter();
      bFilter.type = 'lowpass';
      bFilter.frequency.setValueAtTime(450, now);

      bGain.gain.setValueAtTime(0.25, now);
      bGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      bOsc.connect(bFilter);
      bFilter.connect(bGain);
      bGain.connect(this.ctx.destination);

      bOsc.start(now);
      bOsc.stop(now + 0.12);

      // 2. Synth Arp Melody
      const mFreq = melody[stepIdx];
      const mOsc = this.ctx.createOscillator();
      const mGain = this.ctx.createGain();
      mOsc.type = 'square';
      mOsc.frequency.setValueAtTime(mFreq, now);

      mGain.gain.setValueAtTime(0.12, now);
      mGain.gain.exponentialRampToValueAtTime(0.01, now + 0.11);

      mOsc.connect(mGain);
      mGain.connect(this.ctx.destination);

      mOsc.start(now);
      mOsc.stop(now + 0.11);

      // 3. 8-Bit Percussion
      if (stepIdx % 8 === 4) {
        this.playSynthesizedSnare(now);
      } else {
        this.playSynthesizedHiHat(now, stepIdx % 2 === 0);
      }

      step++;
      this.musicTimer = setTimeout(playStep, stepDuration);
    };

    playStep();
    return true;
  }

  // 8-bit Snare hit (filtered noise burst)
  playSynthesizedSnare(time) {
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.11);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(time);
      noise.stop(time + 0.11);
    } catch (e) {}
  }

  // 8-bit Hi-Hat
  playSynthesizedHiHat(time, isAccented = false) {
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(isAccented ? 0.08 : 0.04, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + 0.035);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(time);
      noise.stop(time + 0.035);
    } catch (e) {}
  }

  stopLobbyMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  // 16-bit bass strike thud
  playKick() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(1.0, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }

  // Granular tiered crowd cheers
  playCrowdRoar(tierKey = 'tapIn') {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const durationMap = {
        tapIn: 1.0,
        throughBall: 1.5,
        hollywoodBall: 1.9,
        worldie: 2.4,
        topBins: 3.0,
        groan: 1.4,
      };

      const gainMap = {
        tapIn: 0.25,
        throughBall: 0.4,
        hollywoodBall: 0.6,
        worldie: 0.75,
        topBins: 0.95,
        groan: 0.45,
      };

      const duration = durationMap[tierKey] || 1.4;
      const peakGain = gainMap[tierKey] || 0.4;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';

      if (tierKey === 'groan') {
        filter.frequency.setValueAtTime(500, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(180, ctx.currentTime + duration);
      } else if (tierKey === 'topBins') {
        filter.frequency.setValueAtTime(650, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.6);
      } else {
        filter.frequency.value = tierKey === 'worldie' ? 900 : tierKey === 'hollywoodBall' ? 750 : 550;
      }
      filter.Q.value = 1.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(peakGain, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + duration);

      if (tierKey === 'topBins') {
        this.playAirHorn();
      }
    } catch (e) {}
  }

  playAirHorn() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      [466.16, 587.33].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        const start = ctx.currentTime + 0.2;
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch (e) {}
  }

  playChime(isTopBins = false) {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const notes = isTopBins
        ? [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]
        : [261.63, 329.63, 392.0, 523.25];
      const duration = 0.09;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + idx * duration;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {}
  }

  playWhistle() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2200, ctx.currentTime);
      osc.frequency.setValueAtTime(1800, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(2400, ctx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // Sharp Two-Blast Referee Whistle for Cards / VAR Overturn
  playDoubleWhistle() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      [0, 0.22].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + offset;
        const dur = idx === 1 ? 0.3 : 0.15;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2400, start);
        osc.frequency.setValueAtTime(2100, start + 0.05);
        osc.frequency.setValueAtTime(2600, start + 0.1);

        gain.gain.setValueAtTime(0.28, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
    } catch (e) {}
  }

  // Low Radar Beep for VAR Check
  playVarBeep() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      [0, 0.35, 0.7].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + offset;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.15);
      });
    } catch (e) {}
  }

  playInvalidBuzz() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.setValueAtTime(90, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  // --- NEW AUDIO EFFECTS FOR PRESS CONFERENCE & CARDS ---

  // Mechanical Camera Shutter Snap (📸)
  playCameraShutter() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      
      // 1. High-frequency click burst (noise)
      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3500, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.04);

      // 2. Mechanical winding / shutter click thump
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

      oscGain.gain.setValueAtTime(0.25, now + 0.04);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now + 0.04);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  // Electronic Flashbulb Charge / Tension Click
  playFlashbulbClick() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(3200, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // Sharp warning tone for cards / hardcore transition
  playCardFlash() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.1);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
}

export const sound = new RetroAudio();