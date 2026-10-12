import { CONFIG } from './config.js';

// Net Skor = (Mesafe + Tohum x SEED_VALUE) x Hız Çarpanı
// Çarpan, kazanım anındaki hıza göre 1.0x (başlangıç hızı) - 2.0x (maksimum hız) arasındadır.
export const Score = {
  distance: 0,   // ham piksel
  seeds: 0,
  time: 0,       // ms (oyun süresi)
  multiplier: 1,
  distPts: 0,
  seedPts: 0,

  get meters() {
    return Math.floor(this.distance / 10);
  },

  get distanceScore() {
    return Math.floor(this.distPts);
  },

  get seedScore() {
    return Math.round(this.seedPts);
  },

  get value() {
    return this.distanceScore + this.seedScore;
  },

  get timeSeconds() {
    return Math.floor(this.time / 1000);
  },

  reset() {
    this.distance = 0;
    this.seeds = 0;
    this.time = 0;
    this.multiplier = 1;
    this.distPts = 0;
    this.seedPts = 0;
  },

  setSpeed(speed) {
    const range = (CONFIG.MAX_SPEED - CONFIG.INITIAL_SPEED) || 1;
    const t = Math.max(0, Math.min(1, (speed - CONFIG.INITIAL_SPEED) / range));
    this.multiplier = 1 + t;
  },

  addDistance(px, isFly) {
    const add = isFly ? (px * 1.5) : px;
    this.distance += add;
    this.distPts += (add / 10) * this.multiplier;
  },

  addSeed(customValue) {
    this.seeds++;
    const base = customValue !== undefined ? customValue : (CONFIG.SEED_VALUE || 15);
    this.seedPts += base * this.multiplier;
  },

  addTime(ms) {
    this.time += ms;
  },

  formatTime() {
    const s = this.timeSeconds;
    const m = Math.floor(s / 60);
    return String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
};
