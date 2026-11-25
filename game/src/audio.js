export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    try {
      if (!this.ctx) {
        const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (AudioContext) this.ctx = new AudioContext();
      }
      if (this.ctx?.state === 'suspended') {
        this.ctx.resume()?.catch(() => {});
      }
    } catch {}
  }

  setMuted(m) {
    this.muted = Boolean(m);
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  beep(freq, dur, type, vol, when = 0) {
    const ctx = this.ctx;
    if (this.muted || !ctx || ctx.state !== 'running') return;

    try {
      const start = ctx.currentTime + Math.max(0, when);
      const end = start + dur;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + Math.min(0.008, dur / 2));
      gain.gain.linearRampToValueAtTime(0, end);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(start);
      osc.stop(end);
    } catch {}
  }

  click() { this.beep(400, 0.045, 'triangle', 0.055); }
  good() { this.beep(660, 0.075, 'sine', 0.09); }
  bad() { this.beep(135, 0.17, 'sawtooth', 0.065); }
  tick() { this.beep(920, 0.035, 'sine', 0.055); }

  serve() {
    this.beep(523, 0.12, 'triangle', 0.09);
    this.beep(784, 0.18, 'triangle', 0.09, 0.08);
  }

  expire() {
    this.beep(330, 0.12, 'triangle', 0.08);
    this.beep(220, 0.18, 'triangle', 0.08, 0.09);
  }

  win() {
    this.beep(523, 0.14, 'triangle', 0.09);
    this.beep(659, 0.14, 'triangle', 0.09, 0.10);
    this.beep(1047, 0.25, 'triangle', 0.09, 0.20);
  }

  over() {
    this.beep(392, 0.16, 'sine', 0.10);
    this.beep(294, 0.18, 'sine', 0.10, 0.12);
    this.beep(196, 0.30, 'sine', 0.10, 0.24);
  }

  playEvent(name) {
    switch (name) {
      case 'click': this.click(); break;
      case 'good': this.good(); break;
      case 'bad': this.bad(); break;
      case 'serve': this.serve(); break;
      case 'expire': this.expire(); break;
      case 'tick': this.tick(); break;
      case 'nosoup': this.beep(260, 0.09, 'triangle', 0.06); break;
      case 'over': this.over(); break;
      case 'win': this.win(); break;
    }
  }
}
