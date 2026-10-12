import { CONFIG } from './config.js';
import { SKY_GROUND, SKY_FLIGHT, GROUND_STRIP, GROUND_TOP, GROUND_TILE, CLOUD_SPRITES } from './sprites.js';
import { StateMachine, States } from './state.js';
import { ObstacleManager } from './obstacles.js';
import { GROUND_PALETTE } from './palette.js';

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
    ctx.drawImage(this.sprite, this.x, this.y);
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

    // Gökyüzü: gündüz ile uçuş gecesi arasında yumuşak geçiş
    ctx.drawImage(SKY_GROUND, 0, 0);
    if (this.flyTransition > 0) {
      ctx.save();
      ctx.globalAlpha = this.flyTransition;
      ctx.drawImage(SKY_FLIGHT, 0, 0);
      ctx.restore();
    }

    for (const c of this.clouds) c.draw(ctx);

    const off = Math.round(this.groundScroll) % GROUND_TILE;

    // Hava modunda (flappy) zemin:
    if (isFly) {
      // 1. Kalkış fazı: Arkada kalan zemin sola kayarak ekrandan çıkar (pat diye yok olmaz!)
      if (this.takeoffGroundEndX !== null && this.takeoffGroundEndX > 0) {
        const gx = Math.round(this.takeoffGroundEndX);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, GROUND_TOP, gx, CONFIG.CANVAS_HEIGHT - GROUND_TOP);
        ctx.clip();
        ctx.drawImage(GROUND_STRIP, -off, GROUND_TOP);
        // Uçurumun sağ kenarına dikey hat
        ctx.fillStyle = '#29170a';
        ctx.fillRect(gx - 3, GROUND_TOP, 3, CONFIG.CANVAS_HEIGHT - GROUND_TOP);
        ctx.restore();
      }

      // 2. İniş fazı: Uçuş biterken zemin sağdan kayarak gelip karaya bağlar
      if (this.landingGroundX !== null && this.landingGroundX < CONFIG.CANVAS_WIDTH) {
        const gx = Math.round(Math.max(0, this.landingGroundX));
        const gw = CONFIG.CANVAS_WIDTH - gx;
        if (gw > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(gx, GROUND_TOP, gw, CONFIG.CANVAS_HEIGHT - GROUND_TOP);
          ctx.clip();
          ctx.drawImage(GROUND_STRIP, -off, GROUND_TOP);
          // İniş zemininin kenarına dikey sınır çizgisi ve çim detayı
          ctx.fillStyle = '#29170a';
          ctx.fillRect(gx, GROUND_TOP, 4, CONFIG.CANVAS_HEIGHT - GROUND_TOP);
          ctx.fillStyle = GROUND_PALETTE.grassMain;
          ctx.fillRect(gx, GROUND_TOP, 4, 6);
          ctx.restore();
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
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, GROUND_TOP, groundEnd, CONFIG.CANVAS_HEIGHT - GROUND_TOP);
        ctx.clip();
        ctx.drawImage(GROUND_STRIP, -off, GROUND_TOP);
        // Uçurumun sağ kenarına dikey hat
        ctx.fillStyle = '#29170a';
        ctx.fillRect(groundEnd - 3, GROUND_TOP, 3, CONFIG.CANVAS_HEIGHT - GROUND_TOP);
        ctx.restore();
      }
    } else {
      ctx.drawImage(GROUND_STRIP, -off, GROUND_TOP);
    }
  }
};
