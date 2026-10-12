import { CONFIG } from './config.js';
import { Konami } from './konami.js';
import { StateMachine, States } from './state.js';
import { Leaderboard } from './leaderboard.js';
import { Score } from './score.js';
import { Input } from './input.js';
import { ProfanityFilter } from './filter.js';
import { ObstacleManager } from './obstacles.js';
import { PaletteManager } from './palette.js';
import { GodMode } from './godmode.js';

export const UI = {
  nameInputBuffer: "",
  isProfane: false,
  hudKey: '',
  cachedTimeText: 'SURE 00:00',
  cachedMultText: 'x1.0',
  cachedNetScoreText: "NET SKOR: 0",
  cachedDistText: "MESAFE: 0m",
  cachedSeedText: "TOHUM: 0 (+0)",
  
  draw(ctx, width, height) {
    // İsim ekranından (ör. zaman aşımıyla) çıkıldıysa görünmez alan odakta kalmasın
    if (StateMachine.current !== States.ENTER_NAME && this.nameField && document.activeElement === this.nameField) {
      this.nameField.blur();
    }

    if (StateMachine.current === States.IDLE) {
      this.drawIdle(ctx, width, height);
    } else if (StateMachine.current === States.TUTORIAL) {
      this.drawTutorial(ctx, width, height);
    } else if (StateMachine.current === States.GAMEOVER) {
      this.drawGameOver(ctx, width, height);
    } else if (StateMachine.current === States.ENTER_NAME) {
      this.drawEnterName(ctx, width, height);
    } else {
      this.drawHUD(ctx, width, height);
    }

    if (StateMachine.current !== States.ENTER_NAME) {
      this.drawPaletteButton(ctx, width);
      GodMode.drawBadge(ctx, width);
    }
    PaletteManager.drawToast(ctx, width, height);
    GodMode.drawToast(ctx, width, height);
  },

  drawPaletteButton(ctx, w) {
    const pw = 156, ph = 24, px = w - pw - 12, py = 12;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = PaletteManager.current.rainbow[0];
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, py, pw, ph);

    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('P: ' + PaletteManager.current.id + '/4', px + 8, py + ph / 2);

    const cols = PaletteManager.rainbow;
    const dotW = Math.max(4, Math.floor(66 / cols.length));
    const sx = px + 80;
    for (let i = 0; i < cols.length; i++) {
      ctx.fillStyle = cols[i];
      ctx.fillRect(sx + i * (dotW + 2), py + 6, dotW, ph - 12);
    }
    ctx.restore();
  },

  isPaletteButtonClicked(canvasX, canvasY, w) {
    const pw = 156, ph = 24, px = w - pw - 12, py = 12;
    return canvasX >= px && canvasX <= px + pw && canvasY >= py && canvasY <= py + ph;
  },

  drawHUD(ctx, w, h) {
    const value = Score.value;
    const seeds = Score.seeds;
    const meters = Score.meters;
    const secs = Score.timeSeconds;
    const mult = Math.round(Score.multiplier * 10);
    const key = value + '|' + seeds + '|' + meters + '|' + secs + '|' + mult;
    if (key !== this.hudKey) {
      this.hudKey = key;
      this.cachedNetScoreText = 'NET SKOR: ' + value;
      this.cachedDistText = 'MESAFE: ' + meters + 'm';
      this.cachedSeedText = 'TOHUM: ' + seeds + ' (+' + Score.seedScore + ')';
      this.cachedTimeText = 'SÜRE ' + Score.formatTime();
      this.cachedMultText = 'HIZ ÇARPANI x' + (mult / 10).toFixed(1);
    }

    ctx.font = '13px "Press Start 2P", monospace';
    ctx.textBaseline = 'middle';
    
    // 1. NET SKOR (Sol - Altın Sarısı)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(this.cachedNetScoreText, 26, 30);
    ctx.fillStyle = '#fde047';
    ctx.fillText(this.cachedNetScoreText, 24, 28);

    // 2. MESAFE (Orta - Parlak Beyaz / Google Dino 100m Milestone Flaş Efekti)
    const isMilestoneFlash = ObstacleManager.isMilestoneFlashing();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(this.cachedDistText, w / 2 + 2, 30);
    ctx.fillStyle = isMilestoneFlash ? '#fde047' : '#ffffff';
    ctx.fillText(this.cachedDistText, w / 2, 28);

    // 3. TOHUM & BONUS (Sağ - Canlı Açık Mavi)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(this.cachedSeedText, w - 22, 30);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(this.cachedSeedText, w - 24, 28);

    // Alt satır: süre (sol) ve hız çarpanı (sağ)
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(this.cachedTimeText, 26, 54);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(this.cachedTimeText, 24, 52);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(this.cachedMultText, w - 22, 54);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(this.cachedMultText, w - 24, 52);
  },

  drawIdle(ctx, w, h) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = '#fde047';
    ctx.font = '30px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CİVCİV RUNNER', w / 2, 80);

    ctx.fillStyle = 'white';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillText('GÜNÜN TOP 10 SKORU', w / 2, 140);

    const formatted = Leaderboard.getFormattedDailyTop10();
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    if (formatted.length === 0) {
      ctx.fillText('Henüz skor yok!', w / 2 - 80, 200);
    } else {
      for (let i = 0; i < formatted.length; i++) {
        ctx.fillText(formatted[i], w / 2 - 250, 180 + i * 25);
      }
    }

    const now = performance.now();
    ctx.textAlign = 'center';
    if (Konami.isFlashing(now)) {
      const cols = PaletteManager.rainbow;
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillStyle = cols[Math.floor(now / 120) % cols.length];
      ctx.fillText(Konami.active ? '* KONAMI MODU AÇIK! *' : 'KONAMI MODU KAPALI', w / 2, h - 90);
    } else if (Konami.active) {
      const cols = PaletteManager.rainbow;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = cols[Math.floor(now / 160) % cols.length];
      ctx.fillText('* KONAMI MODU *', w / 2, h - 90);
    }

    ctx.font = '13px "Press Start 2P", monospace';
    ctx.fillStyle = Math.floor(now / 500) % 2 === 0 ? '#ff5555' : 'white';
    ctx.fillText('BAŞLAMAK İÇİN TIKLA VEYA SPACE', w / 2, h - 50);

    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('[P / 1-4] PALET • [Ctrl+G] GOD MODE', w / 2, h - 22);
  },

  drawTutorial(ctx, w, h) {
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'white';
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillText('SPACE / TIKLA = ZIPLA (HAVADA ÇİFT ZIPLA!)', w / 2, 110);

    // Puan hesaplama
    ctx.fillStyle = '#fde047';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText('PUAN NASIL HESAPLANIR?', w / 2, 190);

    ctx.fillStyle = '#ffffff';
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.fillText('NET SKOR = (MESAFE + TOHUM PUANI) x HIZ ÇARPANI', w / 2, 232);

    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Normal Tohum: +' + (CONFIG.SEED_VALUE || 15) + '  |  Yüksek Büyük Tohum: +' + (CONFIG.HIGH_SEED_VALUE || 25) + ' ★ (Çift Zıpla!)', w / 2, 272);
    ctx.fillStyle = '#4ade80';
    ctx.fillText('Hızlandıkça çarpan x1.0 > x2.0 olur: hızlı alınan puan daha değerli!', w / 2, 304);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Rampadan uçarsan Flappy moduna geçersin; düşersen oyun biter!', w / 2, 336);

    const left = Math.max(0, Math.ceil((CONFIG.TUTORIAL_DURATION - StateMachine.timeInState) / 1000));
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Başlıyor... ' + left, w / 2, 400);
  },

  drawGameOver(ctx, w, h) {
    // Koyu kırmızı atmosferik arkaplan
    ctx.fillStyle = 'rgba(120, 15, 25, 0.88)';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // GAME OVER Başlığı
    ctx.font = '34px "Press Start 2P", monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('GAME OVER', w / 2 + 3, 73);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GAME OVER', w / 2, 70);

    // Boşluğa düşüş uyarısı
    if (ObstacleManager.lastDeathReason === 'pit') {
      ctx.font = '13px "Press Start 2P", monospace';
      ctx.fillStyle = '#fde047';
      ctx.fillText('! BOŞLUĞA DÜŞTÜN !', w / 2, 110);
      ctx.fillStyle = '#fca5a5';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText('(Rampadan uçmalıydın!)', w / 2, 130);
    }

    // Skor Döküm Paneli
    const boxW = 540;
    const boxH = 190;
    const boxX = (w - boxW) / 2;
    const boxY = ObstacleManager.lastDeathReason === 'pit' ? 155 : 125;

    // Panel arka planı ve altın çerçeve
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Panel Başlığı
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('SÜRE ' + Score.formatTime() + '  |  ' + Score.meters + 'm  |  HIZ x' + Score.multiplier.toFixed(1), w / 2, boxY + 28);

    // 1. Satır: Mesafe Skoru
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('MESAFE SKORU', boxX + 32, boxY + 68);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(Score.distanceScore + ' P', boxX + boxW - 32, boxY + 68);

    // 2. Satır: Tohum Bonusu
    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('TOHUM BONUSU', boxX + 32, boxY + 104);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#67e8f9';
    ctx.fillText(Score.seeds + ' tohum = +' + Score.seedScore + ' P', boxX + boxW - 32, boxY + 104);

    // Ayırıcı çizgi
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(boxX + 24, boxY + 128);
    ctx.lineTo(boxX + boxW - 24, boxY + 128);
    ctx.stroke();

    // 3. Satır: NET SKOR
    ctx.textAlign = 'left';
    ctx.font = '15px "Press Start 2P", monospace';
    ctx.fillStyle = '#fde047';
    ctx.fillText('NET SKOR', boxX + 32, boxY + 158);
    ctx.textAlign = 'right';
    ctx.fillText(Score.value + ' PUAN', boxX + boxW - 32, boxY + 158);

    // Alt Mesajlar
    ctx.textAlign = 'center';
    const isTop = !GodMode.usedInRun && Leaderboard.isTop10(Score.value);
    const bottomY = boxY + boxH + 36;
    
    if (GodMode.usedInRun) {
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#f87171';
      ctx.fillText('⚡ GOD MODE KULLANILDI - SKOR TABLOSU DEVRE DIŞI ⚡', w / 2, bottomY - 6);
    } else if (isTop) {
      const flash = Math.floor(performance.now() / 400) % 2 === 0;
      ctx.font = '13px "Press Start 2P", monospace';
      ctx.fillStyle = flash ? '#fde047' : '#f59e0b';
      ctx.fillText('* TEBRİKLER! GÜNÜN TOP 10 REKORU! *', w / 2, bottomY);
    }

    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = Math.floor(performance.now() / 500) % 2 === 0 ? '#ffffff' : '#94a3b8';
    ctx.fillText('DEVAM ETMEK İÇİN SPACE / TIKLA', w / 2, bottomY + (isTop || GodMode.usedInRun ? 34 : 14));
  },

  drawEnterName(ctx, w, h) {
    ctx.fillStyle = 'rgba(0,0,0,0.92)';
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = '#fde047';
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('* YENİ REKOR! *', w / 2, h / 2 - 105);
    
    // Net Skor Döküm Özeti
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(`NET SKOR: ${Score.value} (Mesafe: ${Score.distanceScore} + Tohum: +${Score.seedScore})`, w / 2, h / 2 - 68);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('İSMİNİ YAZ VE ENTER\'A BAS:', w / 2, h / 2 - 25);

    const isProfane = this.isProfane;

    // Giriş kutusu (Uygunsuzluk durumunda kırmızı çerçeve)
    ctx.fillStyle = '#1e1e24';
    ctx.fillRect(w / 2 - 200, h / 2 + 5, 400, 52);
    ctx.strokeStyle = isProfane ? '#ef4444' : '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(w / 2 - 200, h / 2 + 5, 400, 52);

    // İsim metni
    ctx.fillStyle = isProfane ? '#f87171' : 'white';
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillText(this.nameInputBuffer + (Math.floor(performance.now() / 500) % 2 === 0 ? '_' : ''), w / 2, h / 2 + 35);

    // Uyarı veya bilgi mesajı
    if (isProfane) {
      ctx.fillStyle = '#ef4444';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText('UYGUNSUZ İSİM! (LÜTFEN DEĞİŞTİRİN)', w / 2, h / 2 + 85);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText('(Maksimum 20 Karakter)', w / 2, h / 2 + 85);
    }
  },
  
  // Mobilde sanal klavyeyi açabilmek için görünmez bir input kullanılır
  nameField: null,

  initNameField() {
    const field = document.createElement('input');
    field.type = 'text';
    field.maxLength = 20;
    field.autocomplete = 'off';
    field.autocapitalize = 'off';
    field.spellcheck = false;
    field.setAttribute('enterkeyhint', 'done');
    field.setAttribute('aria-label', 'Oyuncu ismi');
    field.className = 'name-field';
    document.body.appendChild(field);

    field.addEventListener('input', () => {
      if (StateMachine.current !== States.ENTER_NAME) return;
      StateMachine.registerInput();
      const filtered = (field.value.match(/[a-zA-Z0-9çğıöşüÇĞİÖŞÜ _\-]/g) || []).join('').slice(0, 20);
      if (field.value !== filtered) field.value = filtered;
      this.nameInputBuffer = filtered;
      this.isProfane = ProfanityFilter.isProfane(filtered);
    });

    // Dokunmatik cihazlarda isim ekranına dokununca klavyeyi aç (focus kullanıcı hareketi içinde olmalı)
    window.addEventListener('click', () => {
      if (StateMachine.current === States.ENTER_NAME) field.focus();
    });

    this.nameField = field;
  },

  beginNameEntry() {
    this.nameInputBuffer = '';
    this.isProfane = false;
    if (this.nameField) {
      this.nameField.value = '';
      this.nameField.focus();
    }
  },

  submitName() {
    if (GodMode.usedInRun) {
      this.nameInputBuffer = '';
      if (this.nameField) {
        this.nameField.value = '';
        this.nameField.blur();
      }
      StateMachine.change(States.IDLE);
      return;
    }

    const rawName = this.nameInputBuffer.trim();
    const cleanName = ProfanityFilter.sanitize(rawName);

    Leaderboard.addRecord(cleanName, Score.value);
    this.nameInputBuffer = '';
    this.isProfane = false;
    if (this.nameField) {
      this.nameField.value = '';
      this.nameField.blur();
    }
    StateMachine.change(States.IDLE);
  },

  handleNameInput(e) {
    if (StateMachine.current !== States.ENTER_NAME) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      this.submitName();
      return;
    }
    // Input odaktaysa yazma işini 'input' olayı yapar
    if (e.target === this.nameField) return;
    if (e.repeat && e.key !== 'Backspace') return;

    if (e.key === 'Backspace') {
      this.nameInputBuffer = this.nameInputBuffer.slice(0, -1);
      if (this.nameField) this.nameField.value = this.nameInputBuffer;
      this.isProfane = ProfanityFilter.isProfane(this.nameInputBuffer);
    } else if (e.key.length === 1 && this.nameInputBuffer.length < 20) {
      // Sadece güvenli karakterlere izin ver (Harf, rakam, alt çizgi, tire)
      if (/[a-zA-Z0-9çğıöşüÇĞİÖŞÜ _\-]/.test(e.key)) {
        this.nameInputBuffer += e.key;
        if (this.nameField) this.nameField.value = this.nameInputBuffer;
        this.isProfane = ProfanityFilter.isProfane(this.nameInputBuffer);
      }
    }
  }
};

window.addEventListener('keydown', (e) => UI.handleNameInput(e));
