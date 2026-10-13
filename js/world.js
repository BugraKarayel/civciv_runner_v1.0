import { CONFIG } from './config.js';
import { getSkyGround, getSkyFlight, getGroundStrip, GROUND_TOP, GROUND_TILE, CLOUD_SPRITES } from './sprites.js';
import { StateMachine, States } from './state.js';
import { ObstacleManager } from './obstacles.js';
import { PaletteManager } from './palette.js';

class Cloud {
  constructor() {
    this.respawn(Math.random() * CONFIG.CANVAS_WIDTH);
  }
  respawn(x) {
    this.x = x;
    this.y = 25 + Math.random() * 160;
    this.speed = 0.4 + Math.random() * 0.6;
    this.sprite = CLOUD_SPRITES[(Math.random() * CLOUD_SPRITES.length) | 0];
  }
  update(dt) {
    this.x -= this.speed * dt;
    if (this.x < -this.sprite.width) {
      this.respawn(CONFIG.CANVAS_WIDTH + 20 + Math.random() * 120);
    }
  }
  draw(ctx) {
    ctx.drawImage(this.sprite, Math.round(this.x), Math.round(this.y));
  }
}

export const World = {
  clouds: [],
  groundScroll: 0,
  landingGroundX: null,
  takeoffGroundEndX: null,
  flyTransition: 0,
  
  init() {
    this.clouds = [];
    for (let i = 0; i < 6; i++) this.clouds.push(new Cloud());
    this.groundScroll = 0;
    this.landingGroundX = null;
    this.takeoffGroundEndX = null;
    this.flyTransition = 0;
  },

  update(dt, gameSpeed) {
    for (const c of this.clouds) c.update(dt);
    if (StateMachine.current === States.RUN || StateMachine.current === States.FLY || StateMachine.current === States.TUTORIAL) {
      this.groundScroll += gameSpeed * dt;
    }

    // Uçuş modu gökyüzü yumuşak geçişi
    if (StateMachine.current === States.FLY) {
      this.flyTransition = Math.min(1, this.flyTransition + 0.035 * dt);
    } else {
      this.flyTransition = Math.max(0, this.flyTransition - 0.045 * dt);
    }

    // Kalkışta arkada kalan zemin sola kayarak ekrandan çıkar
    if (this.takeoffGroundEndX !== null) {
      this.takeoffGroundEndX -= gameSpeed * dt;
      if (this.takeoffGroundEndX <= 0) {
        this.takeoffGroundEndX = null;
      }
    }
  },

  draw(ctx) {
    const isFly = StateMachine.current === States.FLY;
    const skyGround = getSkyGround();
    const skyFlight = getSkyFlight();
    const groundStrip = getGroundStrip();

    // Gökyüzü: gündüz ile uçuş gecesi arasında yumuşak geçiş
    ctx.drawImage(skyGround, 0, 0);
    if (this.flyTransition > 0) {
      ctx.save();
      ctx.globalAlpha = this.flyTransition;
      ctx.drawImage(skyFlight, 0, 0);
      ctx.restore();
    }

    for (const c of this.clouds) c.draw(ctx);

    const off = Math.round(this.groundScroll) % GROUND_TILE;
    const stripH = CONFIG.CANVAS_HEIGHT - GROUND_TOP;

    // Hava modunda (flappy) zemin:
    if (isFly) {
      // 1. Kalkış fazı: Arkada kalan zemin sola kayarak ekrandan çıkar (clip yerine 0-maliyetli drawImage slice)
      if (this.takeoffGroundEndX !== null && this.takeoffGroundEndX > 0) {
        const gx = Math.min(CONFIG.CANVAS_WIDTH, Math.round(this.takeoffGroundEndX));
        ctx.drawImage(groundStrip, off, 0, gx, stripH, 0, GROUND_TOP, gx, stripH);
        // Uçurumun sağ kenarına dikey hat
        ctx.fillStyle = '#29170a';
        ctx.fillRect(gx - 3, GROUND_TOP, 3, stripH);
      }

      // 2. İniş fazı: Uçuş biterken zemin sağdan kayarak gelip karaya bağlar
      if (this.landingGroundX !== null && this.landingGroundX < CONFIG.CANVAS_WIDTH) {
        const gx = Math.round(Math.max(0, this.landingGroundX));
        const gw = CONFIG.CANVAS_WIDTH - gx;
        if (gw > 0) {
          ctx.drawImage(groundStrip, off + gx, 0, gw, stripH, gx, GROUND_TOP, gw, stripH);
          // İniş zemininin kenarına dikey sınır çizgisi ve çim detayı
          ctx.fillStyle = '#29170a';
          ctx.fillRect(gx, GROUND_TOP, 4, stripH);
          ctx.fillStyle = PaletteManager.groundPalette.grassMain;
          ctx.fillRect(gx, GROUND_TOP, 4, 6);
        }
      }
      return;
    }

    // RUN / GAMEOVER modunda zemin:
    if (ObstacleManager.missedRamp && ObstacleManager.ramps.length === 0) {
      // Rampa es geçildi ve ekrandan çıktı: zemin tamamen yok, tam uçurum / gökyüzü!
      return;
    }

    if (ObstacleManager.ramps.length > 0) {
      const r = ObstacleManager.ramps[0];
      const groundEnd = Math.round(r.x + r.width);

      if (groundEnd > 0) {
        const gw = Math.min(CONFIG.CANVAS_WIDTH, groundEnd);
        ctx.drawImage(groundStrip, off, 0, gw, stripH, 0, GROUND_TOP, gw, stripH);
        // Uçurumun sağ kenarına dikey hat
        ctx.fillStyle = '#29170a';
        ctx.fillRect(gw - 3, GROUND_TOP, 3, stripH);
      }
    } else {
      ctx.drawImage(groundStrip, -off, GROUND_TOP);
    }
  }
};
