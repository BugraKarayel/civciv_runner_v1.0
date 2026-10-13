// Civciv Runner - Kostüm / Skin & Pastel Palet Testleri

// Mock DOM & Storage for Node environment
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  clear() { this.store = {}; }
};

global.document = {
  createElement: () => ({
    width: 0,
    height: 0,
    getContext: () => ({
      imageSmoothingEnabled: false,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillRect() {},
      strokeRect() {},
      drawImage() {},
      fillText() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      stroke() {},
      ellipse() {},
      fill() {},
      save() {},
      restore() {}
    })
  }),
  fonts: { ready: Promise.resolve() }
};

global.performance = { now: () => 1000 };
global.window = { addEventListener() {}, removeEventListener() {} };

const { SKINS, SkinManager } = await import('../js/skins.js');
const { SPRITES } = await import('../js/sprites.js');
const { UI } = await import('../js/ui.js');
const { StateMachine, States } = await import('../js/state.js');

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

console.log('--- Civciv Runner Skin & Costume System Tests ---');

// 1. Skin Tanımları
assert(!!SKINS.classic, 'Klasik civciv tanımlı');
assert(!!SKINS.detective, 'Dedektif civciv tanımlı');
assert(!!SKINS.footballer, 'Milli takım futbolcu civciv tanımlı');
assert(SKINS.classic.name === 'Klasik Civciv', 'Klasik civciv ismi doğru');
assert(SKINS.detective.name === 'Dedektif Civciv', 'Dedektif civciv ismi doğru');
assert(SKINS.footballer.name === 'Milli Takım Civciv', 'Milli takım futbolcu civciv ismi doğru');
assert(SKINS.detective.subtitle.includes('Gözlüklü'), 'Dedektif civciv alt başlığında Gözlüklü yer alıyor');
assert(SKINS.footballer.badge.includes('TÜRKİYE'), 'Milli takım civciv rozeti TÜRKİYE içeriyor');

// 2. SkinManager Başlangıç ve Liste
assert(SkinManager.list.length === 3, 'SkinManager 3 farklı kostüm içeriyor');
assert(SkinManager.list.includes('classic'), 'classic listede var');
assert(SkinManager.list.includes('detective'), 'detective listede var');
assert(SkinManager.list.includes('footballer'), 'footballer listede var');

// 3. Döngüsel Geçişler (nextSkin / prevSkin)
SkinManager.setSkin('classic');
assert(SkinManager.current === 'classic', 'setSkin classic aktif etti');
assert(SkinManager.info.name === 'Klasik Civciv', 'SkinManager.info klasik bilgisi döndü');

SkinManager.nextSkin();
assert(SkinManager.current === 'detective', 'nextSkin() -> detective');
assert(SkinManager.info.name === 'Dedektif Civciv', 'SkinManager.info dedektif bilgisi döndü');

SkinManager.nextSkin();
assert(SkinManager.current === 'footballer', 'nextSkin() -> footballer');
assert(SkinManager.info.name === 'Milli Takım Civciv', 'SkinManager.info futbolcu bilgisi döndü');

SkinManager.nextSkin();
assert(SkinManager.current === 'classic', 'nextSkin() dairesel olarak tekrar classic e döndü');

SkinManager.prevSkin();
assert(SkinManager.current === 'footballer', 'prevSkin() geriye doğru footballer a döndü');

SkinManager.prevSkin();
assert(SkinManager.current === 'detective', 'prevSkin() geriye doğru detective e döndü');

SkinManager.prevSkin();
assert(SkinManager.current === 'classic', 'prevSkin() geriye doğru classic e döndü');

// 4. Kalıcılık (localStorage)
SkinManager.setSkin('footballer');
assert(global.localStorage.getItem('civciv_selected_skin') === 'footballer', 'Seçilen skin localStorage a kaydedildi');
SkinManager.init();
assert(SkinManager.current === 'footballer', 'SkinManager.init() kaydedilen skini yükledi');

// 5. Sprite Entegrasyonu & Dinamik Getter
SkinManager.setSkin('classic');
assert(!!SPRITES.skins.classic.run1, 'Klasik skin run1 sprite ı hazır');
assert(!!SPRITES.skins.classic.flapUp, 'Klasik skin flapUp sprite ı hazır');
assert(SPRITES.chick === SPRITES.skins.classic, 'SPRITES.chick klasik sprite ı veriyor');

SkinManager.setSkin('detective');
assert(!!SPRITES.skins.detective.run1, 'Dedektif skin run1 sprite ı hazır');
assert(!!SPRITES.skins.detective.dead, 'Dedektif skin dead sprite ı hazır');
assert(SPRITES.chick === SPRITES.skins.detective, 'SPRITES.chick dedektif sprite ı veriyor');

SkinManager.setSkin('footballer');
assert(!!SPRITES.skins.footballer.run1, 'Milli takım skin run1 sprite ı hazır');
assert(!!SPRITES.skins.footballer.dead, 'Milli takım skin dead sprite ı hazır');
assert(SPRITES.chick === SPRITES.skins.footballer, 'SPRITES.chick futbolcu sprite ı veriyor');

// 6. UI Kart Koordinatları ve Tıklama Mantığı
assert(UI.skinCardBounds.length === 3, 'UI 3 kostüm kart sınırı tanımladı');
StateMachine.change(States.IDLE);

// Klasik kartına tıkla: x: 550, y: 260
const clickedClassic = UI.handleSkinClick(550, 260);
assert(clickedClassic === true, 'Klasik kartına tıklama algılandı');
assert(SkinManager.current === 'classic', 'Klasik kartına tıklanınca skin classic oldu');

// Dedektif kartına tıkla: x: 550, y: 310
const clickedDetective = UI.handleSkinClick(550, 310);
assert(clickedDetective === true, 'Dedektif kartına tıklama algılandı');
assert(SkinManager.current === 'detective', 'Dedektif kartına tıklanınca skin detective oldu');

// Futbolcu kartına tıkla: x: 550, y: 355
const clickedFootballer = UI.handleSkinClick(550, 355);
assert(clickedFootballer === true, 'Milli Takım kartına tıklama algılandı');
assert(SkinManager.current === 'footballer', 'Futbolcu kartına tıklanınca skin footballer oldu');

// Kartların dışına tıkla: x: 100, y: 100
const clickedOutside = UI.handleSkinClick(100, 100);
assert(clickedOutside === false, 'Kart dışına tıklama kostüm değiştirmedi (oyun başlamaya hazır)');

// IDLE dışında tıklandığında kostüm değiştirilmemeli
StateMachine.change(States.RUN);
const clickedInRun = UI.handleSkinClick(550, 310);
assert(clickedInRun === false, 'Koşarken (RUN state) UI tıklaması kostümü değiştirmez');

console.log(`\nResult: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
