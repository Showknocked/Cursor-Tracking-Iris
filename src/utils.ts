import { PresetStyle } from './types';

// Web Audio Synth for crisp tactile sound effects
class AudioSynth {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Play a beautiful cute pop sound when adding an eye
  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Play a squishy blink chirp sound when poking an eye
  playSquish() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.14);
  }

  // Play a clockwork ticking sound
  playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  // Play a cute "wink" chirp
  playWink() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.frequency.setValueAtTime(330, this.ctx.currentTime); // E4
    osc1.frequency.setValueAtTime(440, this.ctx.currentTime + 0.06); // A4
    osc2.frequency.setValueAtTime(660, this.ctx.currentTime); // E5
    osc2.frequency.setValueAtTime(880, this.ctx.currentTime + 0.06); // A5

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.18);
    osc2.stop(this.ctx.currentTime + 0.18);
  }

  // Sound for clearing/resetting
  playSweep() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.35);

    // Filter to sweeten the synth wave
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }
}

export const synth = new AudioSynth();

// Highly polished, distinctive Eyeball Style Presets
export const EYE_PRESETS: PresetStyle[] = [
  {
    id: 'classic',
    name: 'Minimal Classic',
    description: 'Clean, elegant, mathematical vector contrast layers.',
    defaultIrisColor: '#000000',
    defaultPupilColor: '#ffffff',
    colors: ['#000000', '#2563EB', '#059669', '#DC2626', '#D97706', '#7C3AED']
  },
  {
    id: 'cybernet',
    name: 'Cyberpunk Gaze',
    description: 'Glowing circuitry paths, digital target ticks, neon irises.',
    defaultIrisColor: '#06b6d4', // Cyan
    defaultPupilColor: '#000000',
    colors: ['#06b6d4', '#ec4899', '#a855f7', '#10b981', '#f59e0b', '#ef4444']
  },
  {
    id: 'reptile',
    name: 'Beast Slit',
    description: 'Feral split pupil, organic texture rings, glowing sclera.',
    defaultIrisColor: '#84cc16', // Lime green
    defaultPupilColor: '#0a0f0d',
    colors: ['#84cc16', '#eab308', '#ea580c', '#14b8a6', '#6366f1', '#6b7280']
  },
  {
    id: 'anime',
    name: 'Shojo Sparkle',
    description: 'Dazzling sparkles, custom refraction dots, soft gradients.',
    defaultIrisColor: '#ec4899', // Pink
    defaultPupilColor: '#1e1b4b',
    colors: ['#ec4899', '#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#14b8a6']
  },
  {
    id: 'clockwork',
    name: 'Brass Chrono',
    description: 'Ornate mechanical clock gears spinning as tracking angle vectors shift.',
    defaultIrisColor: '#d97706', // Golden brown brass
    defaultPupilColor: '#27272a',
    colors: ['#d97706', '#b45309', '#ca8a04', '#4b5563', '#0f172a', '#78716c']
  }
];

// Human-friendly eye nicknames/emojis to decorate or customize eyes
export const CUTE_LABELS = [
  'Voyeur', 'Watcher', 'Seeker', 'Peeker', 'Stargazer', 'Oracle', 'Synthetix',
  'Cyclops', 'Argus', 'Peeper', 'Sentinel', 'Sentry', 'Sleuth', 'Loomer', 'Oculon'
];

export const getRandomLabel = () => {
  return CUTE_LABELS[Math.floor(Math.random() * CUTE_LABELS.length)];
};
