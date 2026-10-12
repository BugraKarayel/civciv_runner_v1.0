import { CONFIG } from './config.js';
import { GROUND_PALETTE } from './palette.js';

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  return [c, g];
}

function buildSprite(rows, palette, px = CONFIG.PX) {
  const R = rows.length;
  const C = Math.max(...rows.map(r => r.length));
  const [c, g] = makeCanvas((C + 2) * px, (R + 2) * px);

  const solid = (r, col) => {
    if (r < 0 || r >= R || col < 0 || col >= rows[r].length) return false;
    const ch = rows[r][col];
    return ch !== '.' && ch !== ' ' && !!palette[ch];
  };

  const outline = palette['.'];
  if (outline) {
    g.fillStyle = outline;
    for (let r = -1; r <= R; r++) {
      for (let col = -1; col <= C; col++) {
        if (solid(r, col)) continue;
        if (solid(r - 1, col) || solid(r + 1, col) || solid(r, col - 1) || solid(r, col + 1)) {
          g.fillRect((col + 1) * px, (r + 1) * px, px, px);
        }
      }
    }
  }

  for (let r = 0; r < R; r++) {
    for (let col = 0; col < rows[r].length; col++) {
      if (!solid(r, col)) continue;
      g.fillStyle = palette[rows[r][col]];
      g.fillRect((col + 1) * px, (r + 1) * px, px, px);
    }
  }
  return c;
}

export function drawSprite(ctx, sprite, x, y, px = CONFIG.PX) {
  ctx.drawImage(sprite, x - px, y - px);
}

const CHICK_PALETTE = {
  '.': '#3b2108',
  'Y': '#fec629', 'L': '#ffe57f', 'S': '#d97706',
  'W': '#f59e0b', 'w': '#fde047',
  'B': '#ea580c', 'b': '#fb923c',
  'C': '#2563eb', 'c': '#60a5fa',
  'E': '#18181b', 'H': '#ffffff', 'K': '#fb7185',
  'F': '#ea580c', 'x': '#b91c1c',
};

const CHICK_ROWS = {
  run1: ["......CC........","....ccccCC......","...LLLLLL.......","..LLLLLLLL..b...","..LLLLLEELE.BB..","..LLLLHEELEBBB..","..YYYYKKYY.BBB..",".YYYYYYYYYY.....",".WWWWYYYYYYSS...","WWWWWWYYYYYSSS..",".WWWWSSSSSSSSS..","..SSSSSSSSSSS...","...F.....F......","..FFF...FFF....."],
  run2: ["......CC........","....ccccCC......","...LLLLLL.......","..LLLLLLLL..b...","..LLLLLEELE.BB..","..LLLLHEELEBBB..","..YYYYKKYY.BBB..",".YYYYYYYYYY.....",".WWWWYYYYYYSS...",".wWWWWYYYYYSSS..","..WWWSSSSSSSSS..","..SSSSSSSSSSS...","....F...F.......","...FFF.FFF......"],
  flapUp: ["....wWW.CC......","...WWWWcccCC....","..WWWWLLLLLL....",".wWW.LLLLLL..b..",".....LLLLEELE.BB",".....LLLHEELEBBB",".....YYYKKYY.BBB","....YYYYYYYYY...","....YYYYYYYYSS..",".....YYYYYYSSS..",".....SSSSSSSSS..","......SSSSSSS...",".......FF.......","......FFFF......"],
  flapDown: ["......CC........","....ccccCC......","...LLLLLL.......","..LLLLLLLL..b...","..LLLLLEELE.BB..","..LLLLHEELEBBB..","..YYYYKKYY.BBB..",".WWWWYYYYYY.....","WWWWWWYYYYYSS...",".WWWW.YYYYYSSS..","..wW.SSSSSSSSS..","..SSSSSSSSSSS...",".......FF.......","......FFFF......"],
  dead: ["......CC........","....ccccCC......","...LLLLLL.......","..LLLLLLLL..b...","..LLLLLxxLE.BB..","..LLLLxxLE.BBB..","..YYYYKKYY.BBB..",".YYYYYYYYYY.....",".WWWWYYYYYYSS...",".wWWWWYYYYYSSS..","..WWWSSSSSSSSS..","..SSSSSSSSSSS...","....F...F.......","...FFF.FFF......"],
};

const ROCK_PALETTE = { '.': '#1c1917', 'L': '#9ca3af', 'M': '#6b7280', 'D': '#374151', 'G': GROUND_PALETTE.grassLight, 'g': GROUND_PALETTE.grassDark };
const ROCK_ROWS = ["....GG......","...GgGg.....","..LLLLLM....",".LLLLLLMM...",".LLLLMMMMM..","LLMMMMMMMDD.","LMMDMMMMDDDD","LMMMDMMMDDDD",".MMMDDDDDDD."];

const CACTUS_PALETTE = { '.': '#143615', 'L': GROUND_PALETTE.grassLight, 'M': GROUND_PALETTE.grassMain, 'D': GROUND_PALETTE.grassDark, 'R': GROUND_PALETTE.flowerPetal, 'Y': GROUND_PALETTE.flowerCenter };
const CACTUS_ROWS = ["....RYR.....","....RRR.....","....MMM.....","....LMM.....","..L.LMM.....",".LL.LMM.LL..",".LL.LMM.LM..",".LM.LMM.MM..","..MMLMMMM...","...LLMMM....","...LLMMD....","...LLMMD....","...LLMMD....","...LLMMD....","...DDDDD....","............"];

const SEED_PALETTE = { '.': '#713f12', 'Y': '#fde047', 'L': '#fef08a', 'O': '#f59e0b', 'S': '#d97706' };
const SEED_ROWS = ["...LL...","..LYYL..",".LYYYYO.","LYYYYYOO","LYYYYOOO",".OYYOOO.","..OOOO..","...SS..."];

export const SPRITES = {
  chick: {
    run1: buildSprite(CHICK_ROWS.run1, CHICK_PALETTE),
    run2: buildSprite(CHICK_ROWS.run2, CHICK_PALETTE),
    flapUp: buildSprite(CHICK_ROWS.flapUp, CHICK_PALETTE),
    flapDown: buildSprite(CHICK_ROWS.flapDown, CHICK_PALETTE),
    dead: buildSprite(CHICK_ROWS.dead, CHICK_PALETTE),
  },
  rock: buildSprite(ROCK_ROWS, ROCK_PALETTE),
  cactus: buildSprite(CACTUS_ROWS, CACTUS_PALETTE),
  seed: buildSprite(SEED_ROWS, SEED_PALETTE),
};

function buildSky(colors) {
  const [c, g] = makeCanvas(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  const bandH = Math.ceil(CONFIG.CANVAS_HEIGHT / colors.length);
  colors.forEach((col, i) => {
    g.fillStyle = col;
    g.fillRect(0, i * bandH, CONFIG.CANVAS_WIDTH, bandH + 1);
  });
  for (let i = 1; i < colors.length; i++) {
    const y = i * bandH;
    g.fillStyle = colors[i];
    for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += 6) {
      g.fillRect(x, y - 3, 3, 3);
    }
  }
  return c;
}

export const SKY_GROUND = buildSky(['#5b9cf0', '#6eaaf2', '#86baf4', '#a3cdf6', '#c3e0f8', '#e2efd0', '#f7f1b5']);
export const SKY_FLIGHT = buildSky(['#3b6fd6', '#5a7fd0', '#8a8ac0', '#c98f8a', '#ee9a5c', '#f7b877', '#fcd9a8']);

export const GROUND_TILE = 64;
export const GROUND_TOP = CONFIG.GROUND_Y - 6;
export const GROUND_STRIP = (() => {
  const [c, g] = makeCanvas(CONFIG.CANVAS_WIDTH + GROUND_TILE, CONFIG.CANVAS_HEIGHT - GROUND_TOP);
  const oy = CONFIG.GROUND_Y - GROUND_TOP; 
  const W = c.width;
  g.fillStyle = GROUND_PALETTE.grassMain; g.fillRect(0, oy, W, 8);
  g.fillStyle = GROUND_PALETTE.grassLight; g.fillRect(0, oy, W, 3);
  g.fillStyle = GROUND_PALETTE.grassDark; g.fillRect(0, oy + 8, W, 3);
  g.fillStyle = GROUND_PALETTE.dirtLight; g.fillRect(0, oy + 11, W, c.height);
  g.fillStyle = GROUND_PALETTE.dirtMid; g.fillRect(0, oy + 36, W, 3);
  g.fillStyle = GROUND_PALETTE.dirtDark; g.fillRect(0, oy + 39, W, c.height);
  for (let x = 0; x < W; x += 16) {
    g.fillStyle = GROUND_PALETTE.grassLight; g.fillRect(x + 2, oy - 3, 3, 3); g.fillRect(x + 11, oy - 6, 3, 6);
    g.fillStyle = GROUND_PALETTE.grassMain; g.fillRect(x + 8, oy - 3, 3, 3);
  }
  for (let x = 0; x < W; x += 32) {
    g.fillStyle = '#9ca3af'; g.fillRect(x + 6, oy + 18, 6, 3);
    g.fillStyle = '#4b5563'; g.fillRect(x + 9, oy + 21, 6, 3);
    g.fillStyle = GROUND_PALETTE.dirtMid; g.fillRect(x + 22, oy + 27, 6, 3);
    g.fillStyle = '#2f1203'; g.fillRect(x + 14, oy + 51, 9, 3);
  }
  for (let x = 0; x < W; x += GROUND_TILE) {
    g.fillStyle = GROUND_PALETTE.flowerPetal; g.fillRect(x + 40, oy - 6, 3, 3);
    g.fillStyle = GROUND_PALETTE.flowerCenter; g.fillRect(x + 40, oy - 3, 3, 3);
  }
  return c;
})();

function buildCloud(s) {
  const [c, g] = makeCanvas(48 * s, 20 * s);
  const ox = 4 * s;
  g.fillStyle = '#ffffff';
  g.fillRect(ox, 8 * s, 36 * s, 10 * s);
  g.fillRect(ox + 6 * s, 3 * s, 24 * s, 6 * s);
  g.fillRect(ox + 12 * s, 0, 14 * s, 4 * s);
  g.fillRect(0, 12 * s, 44 * s, 6 * s);
  g.fillStyle = '#cbd5e1'; g.fillRect(0, 16 * s, 44 * s, 2 * s);
  return c;
}
export const CLOUD_SPRITES = [buildCloud(2), buildCloud(3), buildCloud(4)];

export const TOWER_W = 56;
export const TOWER_TILE = (() => {
  const [c, g] = makeCanvas(TOWER_W, CONFIG.CANVAS_HEIGHT);
  g.fillStyle = '#854d0e'; g.fillRect(0, 0, TOWER_W, CONFIG.CANVAS_HEIGHT);
  g.fillStyle = '#a16207'; g.fillRect(3, 0, 6, CONFIG.CANVAS_HEIGHT);
  g.fillStyle = '#713f12';
  for (let x = 15; x < TOWER_W; x += 15) g.fillRect(x, 0, 3, CONFIG.CANVAS_HEIGHT);
  g.fillStyle = '#5c3310';
  for (let y = 30; y < CONFIG.CANVAS_HEIGHT; y += 57) {
    g.fillRect(21, y, 6, 3); g.fillRect(39, y + 27, 6, 3);
  }
  g.fillStyle = '#29170a'; g.fillRect(0, 0, 3, CONFIG.CANVAS_HEIGHT); g.fillRect(TOWER_W - 3, 0, 3, CONFIG.CANVAS_HEIGHT);
  return c;
})();

export const RAMP_W = 64;
export const RAMP_H = 42;
export const RAMP_SPRITE = (() => {
  const [c, g] = makeCanvas(RAMP_W, RAMP_H);
  for (let step = 0; step < RAMP_W; step += 4) {
    const h = Math.round(((step + 4) / RAMP_W) * RAMP_H);
    g.fillStyle = (Math.floor(step / 8) % 2 === 0) ? '#a16207' : '#854d0e';
    g.fillRect(step, RAMP_H - h, 4, h);
    g.fillStyle = '#d97706'; g.fillRect(step, RAMP_H - h, 4, 3);
  }
  g.fillStyle = '#29170a'; g.fillRect(0, RAMP_H - 3, RAMP_W, 3); g.fillRect(RAMP_W - 3, 0, 3, RAMP_H);
  g.fillStyle = '#fde047'; const ax = 30, ay = 24;
  g.fillRect(ax, ay, 4, 4); g.fillRect(ax + 4, ay - 4, 4, 4); g.fillRect(ax + 8, ay - 8, 4, 4);
  g.fillRect(ax + 4, ay, 4, 4); g.fillRect(ax, ay + 4, 4, 4);
  return c;
})();

export const LABELS = {};
export function buildLabels() {
  const make = (key, text, color, font = '9px') => {
    const [c, g] = makeCanvas(64, 30);
    g.font = `${font} "Press Start 2P", monospace`; 
    g.textBaseline = 'top';
    g.fillStyle = '#29170a'; 
    g.fillText(text, 2, 3);
    g.fillStyle = color; 
    g.fillText(text, 0, 1);
    LABELS[key] = c;
  };
  make('gdg', 'GDG', '#ffffff');
  make('aibu', 'AİBÜ', '#ffffff');
  make('up', 'UP!', '#fde047', '14px'); // Sarı renkli ve daha kalın (14px)
}
buildLabels();
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(buildLabels);
}
