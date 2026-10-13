// Civciv Runner - Kostüm / Skin Yönetimi
// 1. Klasik Civciv (Mavi şapkalı sevimli civciv)
// 2. Dedektif Civciv (Fötr şapkalı & trençkotlu dedektif)
// 3. Futbolcu Civciv (Türkiye Milli Takımı formalı kramponlu civciv)

export const SKINS = {
  classic: {
    id: 'classic',
    name: 'Klasik Civciv',
    subtitle: 'Mavi Şapkalı Efsane',
    badge: '🐣 KLASİK',
    color: '#38bdf8'
  },
  detective: {
    id: 'detective',
    name: 'Dedektif Civciv',
    subtitle: 'Gözlüklü Gizem Avcısı',
    badge: '🕵️ DEDEKTİF',
    color: '#f59e0b'
  },
  footballer: {
    id: 'footballer',
    name: 'Milli Takım Civciv',
    subtitle: 'Ay-Yıldızlı Şampiyon',
    badge: '⚽ TÜRKİYE 🇹🇷',
    color: '#ef4444'
  }
};

export const SkinManager = {
  list: ['classic', 'detective', 'footballer'],
  currentId: 'classic',

  get current() {
    return this.currentId;
  },

  get info() {
    return SKINS[this.currentId] || SKINS.classic;
  },

  setSkin(id) {
    if (SKINS[id]) {
      this.currentId = id;
      try {
        localStorage.setItem('civciv_selected_skin', id);
      } catch (e) {}
    }
  },

  nextSkin() {
    const idx = this.list.indexOf(this.currentId);
    const nextIdx = (idx + 1) % this.list.length;
    this.setSkin(this.list[nextIdx]);
    return this.info;
  },

  prevSkin() {
    const idx = this.list.indexOf(this.currentId);
    const prevIdx = (idx - 1 + this.list.length) % this.list.length;
    this.setSkin(this.list[prevIdx]);
    return this.info;
  },

  init() {
    try {
      const saved = localStorage.getItem('civciv_selected_skin');
      if (saved && SKINS[saved]) {
        this.currentId = saved;
      }
    } catch (e) {}
  }
};

SkinManager.init();
