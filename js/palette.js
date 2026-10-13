// 4 Renk Paleti ve Zemin Renk Yönetimi
// Görsel 1: Klasik Gökkuşağı (7 Ton)
// Görsel 2: Canlı Pop Gökkuşağı (5 Ton)
// Görsel 3: Neon Cyber Gökkuşağı (5 Ton)
// Görsel 4: Pastel Coolors Gökkuşağı (7 Ton) + Zemin/Çimen/Toprak (3 Ton)

export const PALETTES = {
  1: {
    id: 1,
    name: 'Görsel 1 (Klasik Canlı)',
    shortName: 'Klasik Gökkuşağı',
    // Kırmızı, Turuncu, Pembe, Yeşil, Mavi, Mor, Leylak
    rainbow: ['#FC030C', '#FB9B03', '#FEB2DD', '#05BE03', '#0689E6', '#9E02FD', '#DF8BE5'],
    sparks: ['#FC030C', '#FB9B03', '#05BE03', '#0689E6', '#9E02FD', '#FEB2DD'],
    highlight: '#FB9B03'
  },
  2: {
    id: 2,
    name: 'Görsel 2 (Canlı Pop)',
    shortName: 'Pop Gökkuşağı',
    // Yeşil, Pembe, Altın Sarı, Camgöbeği, Turuncu
    rainbow: ['#50B547', '#E965A6', '#FDC70A', '#0CB6E3', '#F26626'],
    sparks: ['#E965A6', '#FDC70A', '#0CB6E3', '#50B547', '#F26626'],
    highlight: '#FDC70A'
  },
  3: {
    id: 3,
    name: 'Görsel 3 (Neon Cyber)',
    shortName: 'Neon Gökkuşağı',
    // Neon Nane, Mor, Fuşya/Macenta, Sarı, Turkuaz
    rainbow: ['#02FF94', '#9D28AF', '#FE026B', '#FFEA00', '#06BBD3'],
    sparks: ['#FE026B', '#FFEA00', '#02FF94', '#06BBD3', '#9D28AF'],
    highlight: '#FFEA00'
  },
  4: {
    id: 4,
    name: 'Görsel 4 (Pastel Coolors)',
    shortName: 'Pastel Coolors',
    // D89DF2 dahil ve solundakiler: Gül Pembe, Şeftali, Açık Sarı, Nane Yeşili, Bebek Mavisi, Periwinkle, Lila
    rainbow: ['#F0809F', '#FCB18B', '#F7EE8A', '#88EBB8', '#7DD1F7', '#ABA8EE', '#D89DF2'],
    sparks: ['#F0809F', '#FCB18B', '#F7EE8A', '#88EBB8', '#7DD1F7', '#D89DF2'],
    highlight: '#F7EE8A'
  }
};

// Görsel 1-3 Standart Oyun Zemin Tonları
export const CLASSIC_GROUND_PALETTE = {
  grassLight: '#84cc16',    // Canlı açık çim
  grassMain: '#65a30d',     // Standart çim yeşili
  grassDark: '#365314',     // Koyu çim gölgesi
  flowerPetal: '#f43f5e',   // Canlı pembe çiçek
  flowerCenter: '#fde047',  // Sarı çiçek göbeği
  dirtLight: '#78350f',     // Sıcak toprak
  dirtMid: '#5c2a0b',       // Orta toprak
  dirtDark: '#451a03'       // Derin toprak tabakası
};

// Görsel 4'ün D89DF2 sağındaki çimen & toprak tonları (Pastel Modu):
export const GROUND_PALETTE = {
  grassLight: '#9EE78F',    // 9EE78F: Açık çimen yeşili (üst çizgi ve çim püskülleri)
  grassMain: '#58BA5D',     // 58BA5D: Canlı çimen yeşili (ana çimen gövdesi)
  grassDark: '#0C7D45',     // 0C7D45: Derin zümrüt çimen gölgesi
  flowerPetal: '#F0809F',   // Görsel 4 pembe çiçek detayı
  flowerCenter: '#F7EE8A',  // Görsel 4 sarı çiçek göbeği
  dirtLight: '#78350f',     // Sıcak toprak
  dirtMid: '#5c2a0b',       // Orta toprak
  dirtDark: '#451a03'       // Derin toprak tabakası
};
export const PASTEL_GROUND_PALETTE = GROUND_PALETTE;

export const PaletteManager = {
  currentId: 1, // Varsayılan olarak Palet 1 (Klasik Canlı)
  toastTimer: 0,

  get isPastel() {
    return this.currentId === 4;
  },

  get groundPalette() {
    return this.isPastel ? PASTEL_GROUND_PALETTE : CLASSIC_GROUND_PALETTE;
  },

  get current() {
    return PALETTES[this.currentId] || PALETTES[1];
  },

  get rainbow() {
    return this.current.rainbow;
  },

  get sparks() {
    return this.current.sparks;
  },

  setPalette(id) {
    if (PALETTES[id]) {
      this.currentId = id;
      this.toastTimer = 2200; // 2.2 saniye göster
    }
  },

  nextPalette() {
    let next = this.currentId + 1;
    if (next > 4) next = 1;
    this.setPalette(next);
    return this.current;
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
    const p = this.current;
    const isPastel = p.id === 4;
    const text = isPastel ? `PALET 4/4: ${p.shortName} (Tüm Oyun Pastel!)` : `PALET ${p.id}/4: ${p.shortName}`;
    ctx.font = '11px "Press Start 2P", monospace';
    const tw = ctx.measureText(text).width;
    const pad = 16;
    const bx = Math.round((w - (tw + pad * 2)) / 2);
    const by = 20;
    const bh = 34;

    // Arka plan paneli
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(bx, by, tw + pad * 2, bh);
    ctx.strokeStyle = p.rainbow[0];
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, tw + pad * 2, bh);

    // Renk kartelası önizleme şeridi
    const dotW = Math.round((tw + pad) / p.rainbow.length) - 2;
    const startX = bx + pad / 2;
    for (let i = 0; i < p.rainbow.length; i++) {
      ctx.fillStyle = p.rainbow[i];
      ctx.fillRect(startX + i * (dotW + 2), by + bh - 6, dotW, 4);
    }

    // Başlık
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, by + 14);
    ctx.restore();
  }
};
