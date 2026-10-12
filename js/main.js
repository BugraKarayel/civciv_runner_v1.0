import { CONFIG } from './config.js';
import { StateMachine, States } from './state.js';
import { Input } from './input.js';
import { sounds } from './audio.js';
import { Player } from './player.js';
import { World } from './world.js';
import { ObstacleManager } from './obstacles.js';
import { Score } from './score.js';
import { Leaderboard } from './leaderboard.js';
import { UI } from './ui.js';
import { Konami } from './konami.js';
import { PaletteManager } from './palette.js';
import { GodMode } from './godmode.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;

let player = new Player();
let tick = 0;
let flyTimer = 0;

Input.init();
Konami.onActivate = () => sounds.milestone();
UI.initNameField();
Leaderboard.initAdmin();
sounds.init();
World.init();
ObstacleManager.init();

// Kısayollar: Ctrl+G (God Mode), 'P' veya 1-4 (Palet)
window.addEventListener('keydown', (e) => {
  // Ctrl + G / Cmd + G: God Mode Toggle
  if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
    e.preventDefault();
    GodMode.toggle();
    sounds.milestone && sounds.milestone();
    return;
  }

  if (StateMachine.current === States.ENTER_NAME) return;
  if (e.key === 'p' || e.key === 'P') {
    PaletteManager.nextPalette();
    sounds.milestone && sounds.milestone();
  } else if (e.key >= '1' && e.key <= '4') {
    PaletteManager.setPalette(parseInt(e.key, 10));
    sounds.milestone && sounds.milestone();
  }
});

// Canvas üzerindeki palet butonuna tıklama / dokunma (zıplamayı tetiklemez)
canvas.addEventListener('pointerdown', (e) => {
  if (StateMachine.current === States.ENTER_NAME) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
  const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top) * scaleY;
  if (UI.isPaletteButtonClicked(cx, cy, CONFIG.CANVAS_WIDTH)) {
    PaletteManager.nextPalette();
    sounds.milestone && sounds.milestone();
    e.stopPropagation();
  }
}, true);

function resetGame() {
  player.reset();
  World.init();
  ObstacleManager.init();
  Score.reset();
  GodMode.resetRun();
  tick = 0;
  flyTimer = 0;
}

function triggerFly() {
  const activeRamp = ObstacleManager.ramps[0];
  const groundEnd = activeRamp ? (activeRamp.x + activeRamp.width) : (player.x + player.width + 40);
  World.takeoffGroundEndX = groundEnd;
  World.landingGroundX = null;

  StateMachine.change(States.FLY);
  player.vy = -12;
  sounds.rampLaunch();
  ObstacleManager.createSparks(player.x, player.y);
  flyTimer = CONFIG.FLY_DURATION;
  ObstacleManager.startFlyPhase();

  // Rampadan sonra havada kalabilecek zemin engellerini temizle (rampa gerisindekiler zeminle kayıp çıkar)
  ObstacleManager.obstacles = ObstacleManager.obstacles.filter(o => 
    o.type === 'SKY_PIPE' || (o.x + o.width <= groundEnd)
  );
}

function step(dt, now) {
  tick += dt;
  StateMachine.update(dt * (1000/60)); // ms
  PaletteManager.update(dt * (1000/60));
  GodMode.update(dt * (1000/60));
  
  if (StateMachine.checkIdleTimeout(now)) {
    // If it reverted to IDLE due to timeout
    return;
  }

  // --- IDLE ---
  if (StateMachine.current === States.IDLE) {
    if (Input.actionJustPressed) {
      sounds.init(); // enable audio context on first user interaction
      resetGame();
      StateMachine.change(States.TUTORIAL);
    }
  } 
  // --- TUTORIAL ---
  else if (StateMachine.current === States.TUTORIAL) {
    World.update(dt, 0);
    if (StateMachine.timeInState >= CONFIG.TUTORIAL_DURATION) {
      StateMachine.change(States.RUN);
    }
  } 
  // --- RUN ---
  else if (StateMachine.current === States.RUN) {
    if (Input.actionJustPressed) player.jump();
    player.update(dt);
    World.update(dt, ObstacleManager.gameSpeed);
    ObstacleManager.update(dt, player, triggerFly);
    Score.addTime(dt * (1000/60));
  }
  // --- FLY ---
  else if (StateMachine.current === States.FLY) {
    if (Input.actionJustPressed) player.jump();
    player.update(dt);
    World.update(dt, ObstacleManager.gameSpeed);
    ObstacleManager.update(dt, player, triggerFly, flyTimer);
    Score.addTime(dt * (1000/60));

    flyTimer -= dt * (1000/60);

    // İniş fazı: Son 2.5 saniyede zemin sağdan kayarak gelmeye başlar ve havayı karaya bağlar
    if (flyTimer <= 2500) {
      World.landingGroundX = Math.max(0, CONFIG.CANVAS_WIDTH * (flyTimer / 2500));
    } else {
      World.landingGroundX = null;
    }

    if (flyTimer <= 0) { 
      // Doğrudan karaya geçiş
      StateMachine.change(States.RUN);
      ObstacleManager.clearSkyPhase();
      World.landingGroundX = null;
      player.invulnerableTime = CONFIG.INVULNERABILITY_DURATION;
      ObstacleManager.groundGraceTimer = 1500;
    }
  }
  // --- GAMEOVER ---
  else if (StateMachine.current === States.GAMEOVER) {
    player.update(dt);
    if (StateMachine.timeInState > CONFIG.GAMEOVER_LOCK) {
      if (Input.actionJustPressed) {
        if (!GodMode.usedInRun && Leaderboard.isTop10(Score.value)) {
          StateMachine.change(States.ENTER_NAME);
          UI.beginNameEntry();
        } else {
          StateMachine.change(States.IDLE);
        }
      }
    }
  }

  Input.update();
}

function render() {
  if (StateMachine.current !== States.IDLE && StateMachine.current !== States.ENTER_NAME) {
    World.draw(ctx);
    ObstacleManager.draw(ctx, tick);
    player.draw(ctx, tick);
  }
  
  // UI Overlays
  UI.draw(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
}

// VSync-Quantized Delta: Windows/Chromium zamanlayıcı titremesini (timer jitter) sıfırlar.
// 60Hz monitörlerde Windows DWM zamanlayıcı sapması (~±2.5ms) geniş toleransla tam 16.67ms'ye kilitlenir.
const VSYNC_CONFIGS = [
  { interval: 1000 / 240, tol: 0.9, doubleTol: 1.5 }, // 240 Hz (~4.17 ms)
  { interval: 1000 / 165, tol: 0.75, doubleTol: 1.4 }, // 165 Hz (~6.06 ms)
  { interval: 1000 / 144, tol: 0.75, doubleTol: 1.4 }, // 144 Hz (~6.94 ms)
  { interval: 1000 / 120, tol: 1.1, doubleTol: 2.0 }, // 120 Hz (~8.33 ms)
  { interval: 1000 / 90,  tol: 1.5, doubleTol: 2.5 }, // 90 Hz  (~11.11 ms)
  { interval: 1000 / 75,  tol: 1.8, doubleTol: 3.0 }, // 75 Hz  (~13.33 ms)
  { interval: 1000 / 60,  tol: 2.8, doubleTol: 4.5 }, // 60 Hz  (~16.67 ms) - 13.8ms-19.5ms arası tam kilit!
  { interval: 1000 / 50,  tol: 2.5, doubleTol: 4.0 }, // 50 Hz  (~20.00 ms)
];

let lastTime = 0;
let smoothDelta = 1000 / 60;

function getQuantizedDelta(rawDelta) {
  // Aşırı gecikmeleri (sekme arkada kaldıysa) sınırla
  if (rawDelta > 100) return 1000 / 60;
  if (rawDelta < 2) return VSYNC_CONFIGS[0].interval;

  smoothDelta = smoothDelta * 0.85 + rawDelta * 0.15;

  // 1. VSync Snapping: Donanım yenileme hızına milisaniyelik kilitlenme
  for (let i = 0; i < VSYNC_CONFIGS.length; i++) {
    const entry = VSYNC_CONFIGS[i];
    const v = entry.interval;
    if (Math.abs(rawDelta - v) <= entry.tol) {
      return v;
    }
    // 1 kare gecikmesi (2x VSync periyodu)
    if (Math.abs(rawDelta - (v * 2)) <= entry.doubleTol) {
      return v * 2;
    }
  }

  // 2. Standart dışı bir süre geldiyse ani zıplamayı önleyen hareketli ortalama
  return smoothDelta;
}

function loop(now) {
  requestAnimationFrame(loop);

  if (!lastTime) {
    lastTime = now;
    return;
  }

  const rawDelta = now - lastTime;
  lastTime = now;

  const delta = getQuantizedDelta(rawDelta);
  const dt = delta / (1000 / 60);
  
  step(dt, now);
  render();
}

// Start
requestAnimationFrame(loop);
