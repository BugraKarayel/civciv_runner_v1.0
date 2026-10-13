import { CONFIG } from './config.js';
import { SPRITES, TOWER_TILE, TOWER_W, RAMP_W, RAMP_H, RAMP_SPRITE, LABELS, drawSprite, makeCanvas } from './sprites.js';
import { StateMachine, States } from './state.js';
import { Score } from './score.js';
import { sounds } from './audio.js';
import { PaletteManager } from './palette.js';
import { GodMode } from './godmode.js';

export function checkAABB(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

export class Obstacle {
  constructor(x, type) {
    this.x = x;
    this.type = type;
    this.markedForDeletion = false;
    this.passed = false;
    
    if (type === 'GROUND_ROCK') {
      this.width = 36;
      this.height = 27;
      this.y = CONFIG.GROUND_Y - this.height;
      this.sprite = SPRITES.rock;
      this.hit = { ox: 2, oy: 6, w: 32, h: 21 };
    } else if (type === 'GROUND_CACTUS') {
      this.width = 36;
      this.height = 45;
      this.y = CONFIG.GROUND_Y - this.height;
      this.sprite = SPRITES.cactus;
      this.hit = { ox: 5, oy: 3, w: 24, h: 42 };
    } else { // SKY_PIPE
      this.width = TOWER_W;
      this.gap = 175;
      this.gapY = 90 + Math.random() * 210;
      this.topHeight = this.gapY;
      this.bottomY = this.gapY + this.gap;
      this.bottomHeight = CONFIG.CANVAS_HEIGHT - this.bottomY;
    }
  }

  update(dist) {
    this.x -= dist;
    if (this.x + this.width < -50) this.markedForDeletion = true;
  }

  draw(ctx) {
    if (this.type === 'SKY_PIPE') {
      this.drawTower(ctx, this.x, 0, this.topHeight, true);
      this.drawTower(ctx, this.x, this.bottomY, this.bottomHeight, false);
    } else if (this.type === 'GROUND_ROCK') {
      drawSprite(ctx, SPRITES.rock, Math.round(this.x), this.y);
    } else if (this.type === 'GROUND_CACTUS') {
      drawSprite(ctx, SPRITES.cactus, Math.round(this.x), this.y);
    } else {
      drawSprite(ctx, this.sprite, Math.round(this.x), this.y);
    }
  }

  drawTower(ctx, x, y, h, isTop) {
    if (h <= 0) return;
    const rx = Math.round(x);
    ctx.drawImage(TOWER_TILE, 0, 0, TOWER_W, h, rx, y, TOWER_W, h);
    const bandY = isTop ? y + h - 24 : y + 9;
    ctx.fillStyle = '#1e293b'; ctx.fillRect(rx - 3, bandY, TOWER_W + 6, 12);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(rx + 3, bandY + 3, 3, 3); ctx.fillRect(rx + TOWER_W - 6, bandY + 3, 3, 3); ctx.fillRect(rx + 27, bandY + 3, 3, 3);
    const capY = isTop ? y + h - 9 : y;
    ctx.fillStyle = '#29170a'; ctx.fillRect(rx - 6, capY, TOWER_W + 12, 9);
    ctx.fillStyle = isTop ? '#2563eb' : '#dc2626'; ctx.fillRect(rx - 3, capY + 3, TOWER_W + 6, 3);
    if (h > 70) {
      if (isTop) ctx.drawImage(LABELS.gdg, rx + 15, y + h - 44);
      else ctx.drawImage(LABELS.aibu, rx + 11, y + 28);
    }
  }

  collidesWith(box) {
    const bx = box.x, by = box.y, bw = box.width, bh = box.height;
    if (this.type === 'SKY_PIPE') {
      // Top tower
      if (bx < this.x + this.width && bx + bw > this.x && by < this.topHeight && by + bh > 0) return true;
      // Bottom tower: oynanabilir alanın (CANVAS_HEIGHT) en altına kadar uzanır
      if (bx < this.x + this.width && bx + bw > this.x && by < CONFIG.CANVAS_HEIGHT && by + bh > this.bottomY) return true;
      return false;
    }
    const ox = this.x + this.hit.ox;
    const oy = this.y + this.hit.oy;
    return bx < ox + this.hit.w && bx + bw > ox && by < oy + this.hit.h && by + bh > oy;
  }
}

export class Ramp {
  constructor(x) {
    this.x = x;
    this.width = RAMP_W;
    this.height = RAMP_H;
    this.y = CONFIG.GROUND_Y - RAMP_H;
    this.markedForDeletion = false;
    this.triggered = false;
  }

  update(dist) {
    this.x -= dist;
    if (this.x + this.width < -50) this.markedForDeletion = true;
  }

  draw(ctx) {
    const rx = Math.round(this.x);
    ctx.drawImage(RAMP_SPRITE, rx, this.y);
    ctx.drawImage(LABELS.up, rx + 14, this.y - 30);
  }

  checkTrigger(box) {
    if (this.triggered) return false;
    if (box.x + box.width >= this.x + 10 && box.x <= this.x + this.width && box.y + box.height >= this.y) {
      this.triggered = true;
      return true;
    }
    return false;
  }
}

export class Seed {
  constructor(x, y, isHigh = false) {
    this.x = x;
    this.y = y;
    this.isHigh = isHigh;
    this.scale = isHigh ? 1.45 : 1.0;
    this.radius = isHigh ? 18 : 12;
    this.markedForDeletion = false;
    this.floatOffset = Math.random() * Math.PI * 2;
  }
  update(dist, dt) {
    this.x -= dist;
    this.floatOffset += (this.isHigh ? 0.09 : 0.08) * dt;
    if (this.x + this.radius < -20) this.markedForDeletion = true;
  }
  draw(ctx, tick) {
    const bob = Math.sin(this.floatOffset) * (this.isHigh ? 3 : 2) * CONFIG.PX;
    const drawY = Math.round(this.y + bob);
    const rx = Math.round(this.x);

    if (this.isHigh) {
      // Çift zıplama ödülü: Büyütülmüş altın tohum
      ctx.save();
      ctx.translate(rx, drawY);
      ctx.scale(this.scale, this.scale);
      drawSprite(ctx, SPRITES.seed, -12, -12);
      ctx.restore();

      // Dönen altın ve beyaz pırıltılar
      const a1 = tick * 0.14;
      const a2 = a1 + Math.PI;
      ctx.fillStyle = '#fde047';
      ctx.fillRect(Math.round(rx + Math.cos(a1) * 20), Math.round(drawY + Math.sin(a1) * 20), 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(rx + Math.cos(a2) * 20), Math.round(drawY + Math.sin(a2) * 20), 3, 3);

      // Hafif altın ışıltı halkası
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rx, drawY, 18 + Math.sin(tick * 0.1) * 3, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      drawSprite(ctx, SPRITES.seed, rx - 12, drawY - 12);
      const a = tick * 0.12;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(rx + Math.cos(a) * 16), Math.round(drawY + Math.sin(a) * 16), 3, 3);
    }
  }
  checkCollect(box) {
    const closeX = Math.max(box.x, Math.min(this.x, box.x + box.width));
    const closeY = Math.max(box.y, Math.min(this.y, box.y + box.height));
    const dx = this.x - closeX;
    const dy = this.y - closeY;
    return dx * dx + dy * dy < (this.radius + 4) ** 2;
  }
}

export const INITIAL_SKY_DISTANCE = CONFIG.FLY_PIPE_SPACING_MIN;

// Sıfır Bellek Tahsisi (Zero-Allocation) Nesne Havuzları
const MAX_PARTICLES = 45;
const PARTICLE_POOL = Array.from({ length: MAX_PARTICLES }, () => ({
  x: 0, y: 0, vx: 0, vy: 0, size: 0, alpha: 0, color: '#ffffff'
}));

const MAX_FLOATING_TEXTS = 12;
const FLOATING_TEXT_POOL = Array.from({ length: MAX_FLOATING_TEXTS }, () => ({
  text: '', x: 0, y: 0, vy: -1.6, alpha: 0, color: '#fde047'
}));

export const ObstacleManager = {
  obstacles: [],
  ramps: [],
  seeds: [],
  particles: [],
  floatingTexts: [],
  lastDeathReason: null,
  obstaclesPassed: 0,
  gameSpeed: CONFIG.INITIAL_SPEED,
  timeSinceLastRamp: 0,
  groundGraceTimer: 0,
  skyEntryBuffer: 0,
  nextSkyDistance: CONFIG.FLY_PIPE_SPACING_MIN,
  lastMilestone: 0,
  milestoneFlashTimer: 0,
  flyPhaseCount: 0,
  missedRamp: false,
  
  isMilestoneFlashing() {
    return this.milestoneFlashTimer > 0 && Math.floor(this.milestoneFlashTimer / 140) % 2 === 0;
  },

  init() {
    this.obstacles = [];
    this.ramps = [];
    this.seeds = [];
    this.particles = [];
    this.floatingTexts = [];
    this.lastDeathReason = null;
    this.obstaclesPassed = 0;
    this.gameSpeed = CONFIG.INITIAL_SPEED;
    this.timeSinceLastRamp = 0;
    this.groundGraceTimer = 0;
    this.skyEntryBuffer = 0;
    this.nextSkyDistance = CONFIG.FLY_PIPE_SPACING_MIN;
    this.lastSkyPipe = null;
    this.lastMilestone = 0;
    this.milestoneFlashTimer = 0;
    this.flyPhaseCount = 0;
    this.nextSkyDistance = CONFIG.FLY_SPACING_START_MIN;
    this.missedRamp = false;
  },

  // Mevcut uçuş numarasına göre boru aralığı: 1. uçuş en ferah, sonrakiler kademeli sıklaşır
  rollFlySpacing() {
    const n = Math.max(0, this.flyPhaseCount - 1);
    const drop = n * CONFIG.FLY_SPACING_STEP;
    const min = Math.max(CONFIG.FLY_PIPE_SPACING_MIN, CONFIG.FLY_SPACING_START_MIN - drop);
    const max = Math.max(CONFIG.FLY_PIPE_SPACING_MAX, CONFIG.FLY_SPACING_START_MAX - drop);
    return min + Math.random() * (max - min);
  },

  startFlyPhase() {
    this.flyPhaseCount++;
    this.lastSkyPipe = null;
    this.skyEntryBuffer = CONFIG.FLY_ENTRY_BUFFER;
    this.nextSkyDistance = this.rollFlySpacing();
    this.missedRamp = false;
  },

  hasGroundAt(x) {
    // Rampa es geçildiyse arkasındaki zemin tamamen yok olmuştur!
    if (this.missedRamp) return false;
    // Ekranda rampa varsa, rampanın arkasında hiçbir zemin yoktur!
    if (this.ramps.length > 0) {
      return x <= this.ramps[0].x + this.ramps[0].width;
    }
    return true;
  },

  spawnLogic(dt, player, triggerFly, flyTimer) {
    this.timeSinceLastRamp += dt * (1000/60);
    if (this.groundGraceTimer > 0) {
      this.groundGraceTimer -= dt * (1000/60);
    }
    
    // Ramp every ~25-35 sec
    if (StateMachine.current === States.RUN && this.timeSinceLastRamp > 25000 + Math.random() * 10000) {
      if (this.ramps.length === 0 && !this.missedRamp) {
        this.ramps.push(new Ramp(CONFIG.CANVAS_WIDTH + 80));
        this.timeSinceLastRamp = 0;
      }
    }

    const lastObs = this.obstacles[this.obstacles.length - 1];
    
    if (StateMachine.current === States.RUN || StateMachine.current === States.TUTORIAL) {
      const isRampNear = this.ramps.length > 0 || this.missedRamp;
      const minDistance = Math.max(280, this.gameSpeed * 44) + (lastObs ? lastObs.gapBonus || 0 : 0);
      const canSpawn = !lastObs || (CONFIG.CANVAS_WIDTH - (lastObs.x + lastObs.width) > minDistance);

      // İnişten hemen sonra (groundGraceTimer süresince) yer engeli çıkmaz; iniş koridoru ferah kalır!
      if (!isRampNear && canSpawn && this.groundGraceTimer <= 0 && Math.random() < 0.05 * dt) {
        const type = Math.random() > 0.5 ? 'GROUND_ROCK' : 'GROUND_CACTUS';
        const obs = new Obstacle(CONFIG.CANVAS_WIDTH, type);
        obs.gapBonus = Math.random() * 120;
        this.obstacles.push(obs);

        if (Math.random() < 0.45) {
          const isHigh = Math.random() < 0.38;
          // Normal tohum zeminden ~105px yukarıda (tek zıplamayla rahat alınır)
          // Yüksek tohum yaklaşık iki katı yükseklikte (~215px, sadece double jump ile alınabilir)
          const seedY = isHigh ? (CONFIG.GROUND_Y - 215) : (CONFIG.GROUND_Y - 105);
          this.seeds.push(new Seed(CONFIG.CANVAS_WIDTH + obs.width / 2, seedY, isHigh));
        }
      }
    } else if (StateMachine.current === States.FLY) {
      // Uçuşun son 2.5 saniyesinde iniş fazına geçilir; yeni boru ve tohum çıkmaz!
      if (flyTimer === undefined || flyTimer > 2500) {
        // Kalkış koridoru: Rampadan fırladıktan sonra civciv yükselip dengelenene kadar ilk boruyu beklet
        if (this.skyEntryBuffer > 0) {
          this.skyEntryBuffer -= this.gameSpeed * dt;
          return;
        }

        const distFromLast = this.lastSkyPipe ? (CONFIG.CANVAS_WIDTH - this.lastSkyPipe.x) : 9999;
        if (distFromLast >= this.nextSkyDistance) {
          const pipe = new Obstacle(CONFIG.CANVAS_WIDTH, 'SKY_PIPE');
          this.obstacles.push(pipe);
          this.lastSkyPipe = pipe;
          this.seeds.push(new Seed(CONFIG.CANVAS_WIDTH + pipe.width / 2, pipe.gapY + pipe.gap / 2));
          
          // Aşamalı sıklık: her uçuşta borular biraz sıklaşır ama taban değerin altına inmez
          this.nextSkyDistance = this.rollFlySpacing();
        }
      }
    }
  },

  update(dt, player, triggerFly, flyTimer) {
    this.spawnLogic(dt, player, triggerFly, flyTimer);

    // Google Dino Sürekli İvmelenme Modeli (Continuous Smooth Acceleration):
    // Oyun ilerledikçe hız kademeli ve hissedilir şekilde artar
    if (this.gameSpeed < CONFIG.MAX_SPEED) {
      this.gameSpeed = Math.min(CONFIG.MAX_SPEED, this.gameSpeed + (CONFIG.ACCELERATION || 0.0018) * dt);
    }

    if (this.milestoneFlashTimer > 0) {
      this.milestoneFlashTimer = Math.max(0, this.milestoneFlashTimer - dt * (1000/60));
    }

    Score.setSpeed(this.gameSpeed);
    const dist = this.gameSpeed * dt;
    Score.addDistance(dist, StateMachine.current === States.FLY);

    // Google Dino 100m Faz / Milestone Sistemi: Her 100 metrede ses, kıvılcım ve gösterge parlaması
    const currentMilestone = Math.floor(Score.meters / 100);
    if (currentMilestone > this.lastMilestone) {
      this.lastMilestone = currentMilestone;
      this.milestoneFlashTimer = 1400;
      sounds.milestone();
      this.createSparks(player.x + 20, player.y - 15);
    }

    const pBox = player.getBounds();

    for (let i = 0; i < this.ramps.length; i++) {
      const r = this.ramps[i];
      r.update(dist);
      if (r.checkTrigger(pBox)) {
        triggerFly();
      } else if (!r.triggered && (r.x + r.width < player.x)) {
        // Rampadan uçulmadı, oyuncu rampayı es geçti!
        this.missedRamp = true;
      }
    }
    // In-place GC-free filter
    let rw = 0;
    for (let i = 0; i < this.ramps.length; i++) {
      if (!this.ramps[i].markedForDeletion) {
        this.ramps[rw++] = this.ramps[i];
      } else if (!this.ramps[i].triggered && StateMachine.current === States.RUN) {
        this.missedRamp = true;
      }
    }
    this.ramps.length = rw;

    for (let i = 0; i < this.obstacles.length; i++) {
      const o = this.obstacles[i];
      o.update(dist);
      if (o.collidesWith(pBox) && player.invulnerableTime <= 0 && !GodMode.active) {
        this.lastDeathReason = 'obstacle';
        StateMachine.change(States.GAMEOVER);
        sounds.hit();
        return;
      }
      if (!o.passed && o.x + o.width < player.x) {
        o.passed = true;
        this.obstaclesPassed++;
      }
    }
    let ow = 0;
    for (let i = 0; i < this.obstacles.length; i++) {
      if (!this.obstacles[i].markedForDeletion) this.obstacles[ow++] = this.obstacles[i];
    }
    this.obstacles.length = ow;

    for (let i = 0; i < this.seeds.length; i++) {
      const s = this.seeds[i];
      s.update(dist, dt);
      if (!s.markedForDeletion && s.checkCollect(pBox)) {
        const seedVal = s.isHigh ? (CONFIG.HIGH_SEED_VALUE || 25) : (CONFIG.SEED_VALUE || 15);
        Score.addSeed(seedVal);
        sounds.collectSeed();
        this.createSparks(s.x, s.y);
        const floatText = '+' + Math.round(seedVal * Score.multiplier) + (s.isHigh ? ' ★' : '');
        this.addFloatingText(floatText, s.x, s.y - 12, s.isHigh ? '#fbbf24' : '#fde047');
        s.markedForDeletion = true;
      }
    }
    let sw = 0;
    for (let i = 0; i < this.seeds.length; i++) {
      if (!this.seeds[i].markedForDeletion) this.seeds[sw++] = this.seeds[i];
    }
    this.seeds.length = sw;

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= 0.045 * dt;
      if (p.alpha <= 0) {
        this.particles[i] = this.particles[this.particles.length - 1];
        this.particles.pop();
      }
    }

    // Floating texts (Skor bildirimleri - ekranla birlikte kayar ve yukarı süzülür)
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.x -= dist;
      ft.y += ft.vy * dt;
      ft.alpha -= 0.028 * dt;
      if (ft.alpha <= 0 || ft.x < -100) {
        this.floatingTexts[i] = this.floatingTexts[this.floatingTexts.length - 1];
        this.floatingTexts.pop();
      }
    }
  },

  draw(ctx, tick) {
    for (const r of this.ramps) r.draw(ctx);
    for (const s of this.seeds) s.draw(ctx, tick);
    for (const o of this.obstacles) o.draw(ctx);

    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha > 0 ? p.alpha : 0;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Floating Texts (+100 Tohum puanı)
    if (this.floatingTexts.length > 0) {
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < this.floatingTexts.length; i++) {
        const ft = this.floatingTexts[i];
        if (ft.alpha <= 0) continue;
        const rx = Math.round(ft.x);
        const ry = Math.round(ft.y);
        ctx.globalAlpha = Math.max(0, Math.min(1, ft.alpha));
        // Retro piksel gölge
        ctx.fillStyle = '#0f172a';
        ctx.fillText(ft.text, rx + 2, ry + 2);
        // Ana yazı
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, rx, ry);
      }
      ctx.globalAlpha = 1;
    }
  },

  addFloatingText(text, x, y, color = '#fde047') {
    let ft;
    if (this.floatingTexts.length >= MAX_FLOATING_TEXTS) {
      ft = this.floatingTexts[0];
      for (let i = 1; i < this.floatingTexts.length; i++) {
        this.floatingTexts[i - 1] = this.floatingTexts[i];
      }
      this.floatingTexts[this.floatingTexts.length - 1] = ft;
    } else {
      ft = FLOATING_TEXT_POOL[this.floatingTexts.length];
      this.floatingTexts.push(ft);
    }
    ft.text = text;
    ft.x = Math.round(x);
    ft.y = Math.round(y);
    ft.vy = -1.6;
    ft.alpha = 1.0;
    ft.color = color;
  },

  pushParticle(x, y, vx, vy, size, color) {
    if (this.particles.length >= MAX_PARTICLES) return;
    const p = PARTICLE_POOL[this.particles.length];
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.size = size;
    p.alpha = 1;
    p.color = color;
    this.particles.push(p);
  },
  createSparks(x, y) {
    const cols = PaletteManager.sparks;
    for (let i = 0; i < 12; i++) {
      this.pushParticle(x, y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, 3, cols[(Math.random() * cols.length) | 0]);
    }
  },
  clearSkyPhase() {
    this.missedRamp = false;
    this.ramps = [];
    // Hava borularını temizle
    this.obstacles = this.obstacles.filter(o => o.type !== 'SKY_PIPE');
    this.lastSkyPipe = null;
    this.skyEntryBuffer = 0;
    
    // Karaya geçildiğinde yerden zıplayarak ulaşılamayacak (havada asılı kalan) tohumları temizle!
    const reachable = [];
    for (let i = 0; i < this.seeds.length; i++) {
      const s = this.seeds[i];
      if (s.isHigh || s.y >= CONFIG.GROUND_Y - 230) {
        reachable.push(s);
      } else {
        this.createSparks(s.x, s.y);
      }
    }
    this.seeds = reachable;
  },
  clearSkyPipes() {
    this.clearSkyPhase();
  }
};
