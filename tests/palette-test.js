import { PALETTES, GROUND_PALETTE, PaletteManager } from '../js/palette.js';

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

console.log('--- Civciv Runner Palette System Tests ---');

// 1. Zemin Paleti Renk Doğrulaması (Görsel 4 Sağ Tarafı)
assert(GROUND_PALETTE.grassLight === '#9EE78F', 'grassLight is #9EE78F (Açık Çim)');
assert(GROUND_PALETTE.grassMain === '#58BA5D', 'grassMain is #58BA5D (Canlı Çim)');
assert(GROUND_PALETTE.grassDark === '#0C7D45', 'grassDark is #0C7D45 (Koyu Zümrüt Gölge)');
assert(GROUND_PALETTE.flowerPetal === '#F0809F', 'flowerPetal is #F0809F');
assert(GROUND_PALETTE.flowerCenter === '#F7EE8A', 'flowerCenter is #F7EE8A');

// 2. 4 Paletin Varlığı ve Renk Yapısı
for (let id = 1; id <= 4; id++) {
  const p = PALETTES[id];
  assert(!!p, `Palet ${id} tanımlı`);
  assert(Array.isArray(p.rainbow) && p.rainbow.length >= 5, `Palet ${id} gökkuşağı en az 5 renk içeriyor (renk sayısı: ${p.rainbow.length})`);
  assert(Array.isArray(p.sparks) && p.sparks.length >= 4, `Palet ${id} kıvılcım renkleri tanımlı`);
}

// Görsel 1: 7 renk (Kırmızıdan leylağa)
assert(PALETTES[1].rainbow.length === 7, 'Görsel 1 tam 7 renk');
assert(PALETTES[1].rainbow[0] === '#FC030C', 'Görsel 1 başlangıç rengi #FC030C (Kırmızı)');

// Görsel 2: 5 renk
assert(PALETTES[2].rainbow.length === 5, 'Görsel 2 tam 5 renk');

// Görsel 3: 5 renk (Neon Cyber)
assert(PALETTES[3].rainbow.length === 5, 'Görsel 3 tam 5 renk');
assert(PALETTES[3].rainbow[0] === '#02FF94', 'Görsel 3 ilk renk #02FF94 (Neon Nane)');

// Görsel 4: 7 renk (D89DF2 dahil ve solundakiler)
assert(PALETTES[4].rainbow.length === 7, 'Görsel 4 tam 7 gökkuşağı rengi');
assert(PALETTES[4].rainbow[0] === '#F0809F', 'Görsel 4 ilk renk #F0809F');
assert(PALETTES[4].rainbow[6] === '#D89DF2', 'Görsel 4 son gökkuşağı rengi #D89DF2');

// 3. PaletteManager Geçiş ve Döngü Testi
PaletteManager.setPalette(1);
assert(PaletteManager.currentId === 1, 'setPalette(1) aktif');
assert(PaletteManager.toastTimer > 0, 'setPalette bildirim zamanlayıcısını tetikler');

PaletteManager.nextPalette();
assert(PaletteManager.currentId === 2, 'nextPalette 1 -> 2');

PaletteManager.nextPalette();
assert(PaletteManager.currentId === 3, 'nextPalette 2 -> 3');

PaletteManager.nextPalette();
assert(PaletteManager.currentId === 4, 'nextPalette 3 -> 4');

PaletteManager.nextPalette();
assert(PaletteManager.currentId === 1, 'nextPalette 4 -> 1 döngüsü çalışıyor');

console.log(`\nResult: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
