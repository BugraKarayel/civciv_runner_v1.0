// Mock DOM for Node environment before importing modules
global.document = {
  createElement: () => ({
    width: 0,
    height: 0,
    getContext: () => ({
      imageSmoothingEnabled: false,
      fillStyle: '',
      font: '',
      fillRect() {},
      drawImage() {},
      fillText() {}
    })
  }),
  fonts: { ready: Promise.resolve() }
};

const { CONFIG } = await import('../js/config.js');
const { Seed, ObstacleManager } = await import('../js/obstacles.js');
const { Score } = await import('../js/score.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('--- Civciv Runner Double Jump & High Seed Tests ---');

// 1. Config Değerleri
assert(typeof CONFIG.DOUBLE_JUMP_VELOCITY === 'number', 'CONFIG.DOUBLE_JUMP_VELOCITY tanımlı');
assert(CONFIG.DOUBLE_JUMP_VELOCITY < 0, 'DOUBLE_JUMP_VELOCITY negatif ivme (yukarı)');
assert(CONFIG.HIGH_SEED_VALUE === 25, 'HIGH_SEED_VALUE = 25 tanımlı');

// 2. Mock Player Nesnesi ile Double Jump Döngüsü
class MockPlayer {
  constructor() {
    this.scale = 0.85;
    this.width = 48 * this.scale;
    this.height = 42 * this.scale;
    this.reset();
  }
  reset() {
    this.x = 120;
    this.y = CONFIG.GROUND_Y - this.height;
    this.vy = 0;
    this.isGrounded = true;
    this.jumpsRemaining = 2;
  }
  jump() {
    if (this.isGrounded) {
      this.vy = CONFIG.JUMP_VELOCITY;
      this.isGrounded = false;
      this.jumpsRemaining = 1;
      return 'FIRST_JUMP';
    } else if (this.jumpsRemaining > 0) {
      this.vy = CONFIG.DOUBLE_JUMP_VELOCITY;
      this.jumpsRemaining = 0;
      return 'DOUBLE_JUMP';
    }
    return 'NO_JUMP';
  }
  land() {
    this.y = CONFIG.GROUND_Y - this.height;
    this.vy = 0;
    this.isGrounded = true;
    this.jumpsRemaining = 2;
  }
}

const player = new MockPlayer();
assert(player.isGrounded === true, 'Başlangıçta oyuncu yerde');
assert(player.jumpsRemaining === 2, 'Başlangıçta 2 zıplama hakkı var');

// İlk zıplama
const jump1 = player.jump();
assert(jump1 === 'FIRST_JUMP', 'Yerdeyken 1. zıplama yapıldı');
assert(player.isGrounded === false, 'Oyuncu artık havada');
assert(player.vy === CONFIG.JUMP_VELOCITY, `1. zıplama ivmesi JUMP_VELOCITY (${CONFIG.JUMP_VELOCITY})`);
assert(player.jumpsRemaining === 1, 'Havada 1 zıplama hakkı kaldı');

// Havada ikinci zıplama (Double Jump)
const jump2 = player.jump();
assert(jump2 === 'DOUBLE_JUMP', 'Havadayken 2. zıplama (Double Jump) yapıldı');
assert(player.vy === CONFIG.DOUBLE_JUMP_VELOCITY, `2. zıplama ivmesi DOUBLE_JUMP_VELOCITY (${CONFIG.DOUBLE_JUMP_VELOCITY})`);
assert(player.jumpsRemaining === 0, 'Zıplama hakları tükendi (0 kaldı)');

// Havada 3. zıplama denemesi (engellenmeli)
const jump3 = player.jump();
assert(jump3 === 'NO_JUMP', 'Havada 3. zıplamaya izin verilmedi');
assert(player.jumpsRemaining === 0, 'Haklar hala 0');

// Yere iniş
player.land();
assert(player.isGrounded === true, 'Oyuncu yere indi');
assert(player.jumpsRemaining === 2, 'Yere inince 2 zıplama hakkı tazelendi');

// 3. Fiziksel Ulaşılabilirlik Testi (Tek Zıplama vs Çift Zıplama)
const singleJumpPeak = (CONFIG.JUMP_VELOCITY ** 2) / (2 * CONFIG.GRAVITY_RUN);
const highSeedHeightFromGround = 215;

assert(singleJumpPeak < highSeedHeightFromGround, `Tek zıplama (${singleJumpPeak.toFixed(1)}px), yüksek tohuma (${highSeedHeightFromGround}px) TEK BAŞINA ULAŞAMAZ`);

const doubleJumpPeak = singleJumpPeak + (CONFIG.DOUBLE_JUMP_VELOCITY ** 2) / (2 * CONFIG.GRAVITY_RUN);
assert(doubleJumpPeak > highSeedHeightFromGround, `Çift zıplama ile ulaşılan yükseklik (${doubleJumpPeak.toFixed(1)}px), yüksek tohumu (${highSeedHeightFromGround}px) RAHATÇA ALIR`);

// 4. Seed Sınıfı ve Yüksek Tohum Özellikleri
const normalSeed = new Seed(500, CONFIG.GROUND_Y - 105, false);
const highSeed = new Seed(500, CONFIG.GROUND_Y - 215, true);

assert(normalSeed.isHigh === false, 'Normal tohum isHigh = false');
assert(normalSeed.radius === 12, 'Normal tohum yarıçapı = 12');
assert(normalSeed.scale === 1.0, 'Normal tohum ölçeği = 1.0');

assert(highSeed.isHigh === true, 'Yüksek tohum isHigh = true');
assert(highSeed.radius === 18, 'Yüksek tohum yarıçapı = 18 (büyütülmüş)');
assert(highSeed.scale === 1.45, 'Yüksek tohum ölçeği = 1.45 (büyütülmüş)');
assert(highSeed.radius > normalSeed.radius, 'Yüksek tohum normal tohumdan belirgin şekilde daha büyük');

// 5. Çarpışma Kutusu (Collect Check)
const highBox = {
  x: 490,
  y: CONFIG.GROUND_Y - 215 - 10,
  width: 40,
  height: 35
};
assert(highSeed.checkCollect(highBox) === true, 'Double jump ile yükselen civciv yüksek tohumu toplar');

const singleJumpMaxBox = {
  x: 490,
  y: CONFIG.GROUND_Y - 128 - 35,
  width: 40,
  height: 35
};
assert(highSeed.checkCollect(singleJumpMaxBox) === false, 'Tek zıplamadaki civciv yüksek tohuma DOKUNAMAZ');

// 6. Skor Entegrasyonu
Score.reset();
Score.setSpeed(CONFIG.INITIAL_SPEED);
Score.addSeed(CONFIG.SEED_VALUE);
assert(Score.seeds === 1, '1 tohum toplandı');
assert(Score.seedScore === 15, 'Normal tohum 15 puan verdi');

Score.addSeed(CONFIG.HIGH_SEED_VALUE);
assert(Score.seeds === 2, '2 tohum toplandı');
assert(Score.seedScore === 40, 'Yüksek tohum +25 puan verdi (toplam 40)');

// 7. clearSkyPhase Yüksek Yer Tohumlarını Koruma Testi
ObstacleManager.init();
ObstacleManager.seeds.push(new Seed(400, CONFIG.GROUND_Y - 105, false)); // normal yer tohumu
ObstacleManager.seeds.push(new Seed(600, CONFIG.GROUND_Y - 215, true));  // yüksek yer tohumu (double jump)
ObstacleManager.seeds.push(new Seed(800, 100, false));                  // gökyüzü boru tohumu (erişilemez)
assert(ObstacleManager.seeds.length === 3, 'Uçuş bitişi öncesi 3 tohum var');

ObstacleManager.clearSkyPhase();
assert(ObstacleManager.seeds.length === 2, 'clearSkyPhase sonrası erişilemez gökyüzü tohumu temizlendi, 2 yer tohumu kaldı');
assert(ObstacleManager.seeds.some(s => s.isHigh === true), 'Yüksek yer tohumu (double jump) silinmedi, korundu');

console.log(`\nResult: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
