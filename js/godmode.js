// God Mode (Ölümsüzlük) Modülü
// Kuş ölümsüz olur, engellerin içinden geçer.
// God mode kullanılan run'lar kesinlikle skor tablosuna (Leaderboard) yansıtılmaz.
// Kısayol: Ctrl + G

export const GodMode = {
  active: false,
  usedInRun: false,
  toastTimer: 0,

  toggle() {
    this.active = !this.active;
    if (this.active) {
      this.usedInRun = true;
    }
    this.toastTimer = 2600;
    return this.active;
  },

  resetRun() {
    // Yeni oyuna başlarken: eğer o anda God Mode açıksa bu run God Mode olarak işaretlenir
    this.usedInRun = this.active;
  },

  update(dtMs) {
    if (this.toastTimer > 0) {
      this.toastTimer = Math.max(0, this.toastTimer - dtMs);
    }
  },

  drawToast(ctx, w, h) {
    if (this.toastTimer <= 0) return;
    const alpha = Math.min(1, this.toastTimer / 400);
    ctx.save();
    ctx.globalAlpha = alpha;

    const text = this.active 
      ? '⚡ GOD MODE AKTİF (ÖLÜMSÜZ) ⚡' 
      : 'GOD MODE KAPATILDI';
    const sub = this.active 
      ? '(Engellerden geçer • Skor kaydedilmez)' 
      : '';

    ctx.font = '11px "Press Start 2P", monospace';
    const tw = ctx.measureText(text).width;
    const pad = 20;
    const bx = Math.round((w - (tw + pad * 2)) / 2);
    const by = 58;
    const bh = this.active ? 46 : 30;

    // Kutu arka planı
    ctx.fillStyle = this.active ? 'rgba(30, 20, 5, 0.96)' : 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(bx, by, tw + pad * 2, bh);
    ctx.strokeStyle = this.active ? '#facc15' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, tw + pad * 2, bh);

    // Başlık
    ctx.fillStyle = this.active ? '#facc15' : '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, by + 16);

    // Alt açıklama
    if (sub) {
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = '#fca5a5';
      ctx.fillText(sub, w / 2, by + 34);
    }
    ctx.restore();
  },

  drawBadge(ctx, w) {
    if (!this.active) return;
    ctx.save();
    const text = '⚡ GOD MODE';
    ctx.font = '9px "Press Start 2P", monospace';
    const tw = ctx.measureText(text).width;
    const px = 14;
    const py = 12;
    const pw = tw + 18;
    const ph = 24;

    ctx.fillStyle = 'rgba(234, 88, 12, 0.92)';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, py, pw, ph);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, px + pw / 2, py + ph / 2);
    ctx.restore();
  }
};
