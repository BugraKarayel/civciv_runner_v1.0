export class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.muted = false;
    this.toastTimer = 0;
    try {
      if (typeof localStorage !== 'undefined') {
        this.muted = localStorage.getItem('civciv_muted') === '1';
      }
    } catch (e) {}
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) { this.enabled = false; return; }
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      this.enabled = false;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.toastTimer = 1800;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('civciv_muted', this.muted ? '1' : '0');
      }
    } catch (e) {}
    if (!this.muted) {
      this.init();
      this.collectSeed();
    }
    return this.muted;
  }

  update(dtMs) {
    if (this.toastTimer > 0) {
      this.toastTimer = Math.max(0, this.toastTimer - dtMs);
    }
  }

  drawToast(ctx, w, h) {
    if (this.toastTimer <= 0) return;
    const alpha = Math.min(1, this.toastTimer / 350);
    ctx.save();
    ctx.globalAlpha = alpha;
    const boxW = 240;
    const boxH = 34;
    const boxX = (w - boxW) / 2;
    const boxY = h - 95;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = this.muted ? '#ef4444' : '#4ade80';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.muted ? '#fca5a5' : '#86efac';
    ctx.fillText(this.muted ? '🔇 SES KAPATILDI' : '🔊 SES AÇILDI', w / 2, boxY + boxH / 2 + 1);
    ctx.restore();
  }

  playTone(freq, type, duration, endFreq = null) {
    if (!this.enabled || this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), t + duration);
      }
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      };
      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {
      console.warn('Audio failed:', e);
    }
  }

  jump() { this.playTone(350, 'sine', 0.15, 600); }
  flap() { this.playTone(450, 'triangle', 0.12, 750); }
  rampLaunch() { this.playTone(200, 'sawtooth', 0.45, 900); }
  collectSeed() { this.playTone(800, 'square', 0.08, 1200); }
  milestone() {
    this.playTone(600, 'square', 0.08);
    setTimeout(() => this.playTone(850, 'square', 0.12), 100);
  }
  hit() { this.playTone(180, 'sawtooth', 0.35, 40); }
}

export const sounds = new SoundManager();
