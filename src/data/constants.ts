// Game constants extracted from Globals.p
export const GAME_CONSTANTS = {
  // Country count
  NO_COUNTRY: 80,
  
  // Color indices
  IWHITE: 0,
  ILTGRAY: 1,
  IGRAY: 2,
  IDKGRAY: 3,
  IBLACK: 4,
  
  // Policy types
  DESTABL: 0,
  ECON: 1,
  MILTRY: 2,
  INSG: 3,
  INT_GOV: 4,
  INT_REB: 5,
  PRESSUR: 6,
  TREATO: 7,
  TRADO: 8,
  
  // Max news items
  MAX_NEWS: 128,
  
  // Game years
  START_YEAR: 1989, // CORRECTED FROM ORIGINAL
  END_YEAR: 1997,
  
  // Difficulty levels
  LEVELS: 4,
  
  // Superpowers
  USA: 1,
  USSR: 2,
  
  // Map dimensions (original Mac resolution)
  MAP_WIDTH: 512,
  MAP_HEIGHT: 342,
  UI_HEIGHT: 200
} as const;

// Policy conversion functions from Globals.p
export function econConv(value: number): number {
  switch (value) {
    case 0: return 0;
    case 1: return 1;
    case 2: return 2;
    case 3: return 5;
    case 4: return 10;
    case 5: return 20;
    default: return 0;
  }
}

export function mAidConv(value: number): number {
  switch (value) {
    case 0: return 0;
    case 1: return 1;
    case 2: return 5;
    case 3: return 20;
    case 4: return 50;
    case 5: return 100;
    default: return 0;
  }
}

export function intvConv(value: number): number {
  switch (value) {
    case 0: return 0;
    case 1: return 1;
    case 2: return 5;
    case 3: return 20;
    case 4: return 100;
    case 5: return 500;
    default: return 0;
  }
}

// Policy maximum calculation functions
export function econAMax(x: number): number {
  if (x > 20) return 5;
  if (x > 0) return 4;
  if (x > -20) return 3;
  if (x > -40) return 2;
  if (x > -60) return 1;
  return 0;
}

export function milMax(x: number): number {
  if (x > 40) return 5;
  if (x > 20) return 4;
  if (x > 0) return 3;
  if (x > -20) return 2;
  if (x > -40) return 1;
  return 0;
}

export function treatMax(x: number): number {
  if (x > 100) return 5;
  if (x > 60) return 4;
  if (x > 40) return 3;
  if (x > 0) return 2;
  if (x > -60) return 1;
  return 0;
}

// Square root function (simplified)
export function mySqrt(value: number): number {
  return Math.floor(Math.sqrt(value));
}
