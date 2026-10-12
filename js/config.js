export const CONFIG = {
  CANVAS_WIDTH: 960,
  CANVAS_HEIGHT: 540,
  GROUND_Y: 440,
  PX: 3,
  
  // Hız ve İvmelenme (Google Dino Phase Modeli)
  INITIAL_SPEED: 7.0,
  MAX_SPEED: 14.5,
  ACCELERATION: 0.0018,         // Chrome Dino gibi her karede sürekli ve dinamik ivmelenme
  
  // Fizik (60fps dt=1 için uyarlanmış)
  GRAVITY_RUN: 0.64,
  JUMP_VELOCITY: -12.8,
  DOUBLE_JUMP_VELOCITY: -11.6,  // Havada 2. zıplama (Double Jump)
  GRAVITY_FLY: 0.35,
  FLAP_VELOCITY: -7.0,
  
  // Süreler (ms)
  TUTORIAL_DURATION: 4500,
  FLY_DURATION: 11000,
  INVULNERABILITY_DURATION: 1500,
  GAMEOVER_LOCK: 1000,
  IDLE_TIMEOUT: 30000,

  // Skor ve Tohum Dengesi
  SEED_VALUE: 15,               // Rekabetçi & dengeli standart tohum puanı
  HIGH_SEED_VALUE: 25,          // Çift zıplamayla ulaşılan büyük tohum ödülü

  // Uçuş (Fly) Modu Boru Standartları (px)
  FLY_ENTRY_BUFFER: 460,        // Fırladıktan sonra ilk borunun çıkması için ferah kalkış koridoru
  FLY_PIPE_SPACING_MIN: 340,    // İki boru arası minimum standart mesafe (taban)
  FLY_PIPE_SPACING_MAX: 390,    // İki boru arası maksimum standart mesafe (taban)

  // Aşamalı boru sıklığı: her uçuş modunda borular biraz sıklaşır (taban değerlere kadar)
  FLY_SPACING_START_MIN: 440,   // 1. uçuşta en ferah aralık (min)
  FLY_SPACING_START_MAX: 490,   // 1. uçuşta en ferah aralık (max)
  FLY_SPACING_STEP: 25,         // Her yeni uçuşta azalan piksel miktarı
};
