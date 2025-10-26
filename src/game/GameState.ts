import { CountryData, COUNTRIES } from '../data/countries.js';
import { createDiplomaticMatrix } from '../data/relations.js';
import { GAME_CONSTANTS } from '../data/constants.js';

// Policy types
export enum PolicyType {
  DESTABL = 0,
  ECON = 1,
  MILTRY = 2,
  INSG = 3,
  INT_GOV = 4,
  INT_REB = 5,
  PRESSUR = 6,
  TREATO = 7,
  TRADO = 8
}

// News item structure
export interface NewsItem {
  id: number;
  subject: number;      // Country performing action
  verb: PolicyType;    // Type of action
  object: number;       // Target country
  oldValue: number;    // Previous policy level
  newValue: number;    // New policy level
  host: number;        // Country where event occurs
  crisisValue: boolean; // Is this a crisis?
  newsWorth: number;   // Importance score
  headline: string;    // Generated headline
  isCrisis?: boolean;  // Additional crisis flag
}

// Game state interface
export interface GameState {
  // Game settings
  level: number;           // Difficulty level (1-4)
  humanPlayer: number;     // 1 = USA, 2 = USSR
  computerPlayer: number;  // Opposite of human
  twoPlayerFlag: boolean;  // Hot-seat mode
  year: number;           // Current year (1989-1997) - CORRECTED FROM ORIGINAL
  
  // Game status
  quitFlag: boolean;      // Game over flag
  winFlag: boolean;       // Victory condition
  replayFlag: boolean;    // Replay mode
  
  // Scores
  usaScore: number;
  ussrScore: number;
  initialUsaScore: number;
  initialUssrScore: number;
  oldUsaScore: number;
  oldUssrScore: number;
  
  // Superpower attributes
  pugnacity: number[];    // [USA, USSR] - aggression level
  integrity: number[];    // [USA, USSR] - reliability
  adventure: number[];   // [USA, USSR] - risk-taking
  nastiness: number;     // Global tension level
  
  // Country data
  countries: CountryData[];
  
  // Diplomatic relations (80x80 matrix)
  diplomaticAffinity: number[][];
  
  // Policy matrices (superpower x country)
  economicAid: number[][];      // [superpower][country]
  militaryAid: number[][];      // [superpower][country]
  insurgencyAid: number[][];    // [superpower][country]
  governmentIntervention: number[][]; // [superpower][country]
  rebelIntervention: number[][]; // [superpower][country]
  pressure: number[][];         // [superpower][country]
  treaties: number[][];        // [superpower][country]
  trade: number[][];           // [superpower][country]
  destabilization: number[][];  // [superpower][country]
  
  // Resource tracking
  governmentAid: number[];      // Available aid per country
  totalIntervention: number[];  // Total intervention per superpower
  
  // News system
  newsQueue: NewsItem[];
  newsCounter: number;
  lastNews: number;
  adviseFlag: boolean;
  
  // Country selection
  hitCountry: number;          // Currently selected country
  oldHit: number;              // Previously selected country
  
  // Map display
  countryColors: number[];     // Color index for each country
  oldVHigh: number;           // Previous view mode
  goingOut: boolean;          // Display mode flag
  
  // Historical data
  usaScoreHistory: number[];  // Yearly USA scores
  ussrScoreHistory: number[]; // Yearly USSR scores
  history: any[];             // Game history for tracking
  
  // Crisis management
  cullFlag: boolean;          // News culling flag
  noUndoFlag: boolean;       // Undo prevention flag
  twoPlayerActiveFlag: boolean; // Two-player active flag
  
  // Additional original game state (from Globals.p)
  prestigeValues: number[];     // PrestVal[i] - prestige value for each country
  governmentStrength: number[]; // GovtStrg[i] - government strength
  insurgencyStrength: number[]; // InsgStrg[i] - insurgency strength
  governmentWing: number[];     // GovtWing[i] - political orientation (-128 to 127)
  insurgencyWing: number[];     // InsgWing[i] - insurgent orientation
  leftPower: boolean[];        // LeftPowr[i] - whether country is left-wing
  governmentPopularity: number[]; // GPopular[i] - government popularity
  militaryPower: number[];      // MilPowr[i] - military power
  insurgencyPower: number[];    // InsgPowr[i] - insurgency power
  strengthRatio: number[];     // StrngRat[i] - government/insurgency strength ratio
  finlandizationFlag: boolean[]; // FinlFlag[i] - finlandization status
  coupFlag: boolean[];         // CoupFlag[i] - coup d'etat status
  revolutionFlag: boolean[];   // RebWinFlag[i] - revolution status
  finlandizationProbability: number[][]; // FinlProb[superpower][country]
  militaryPressure: number[];   // MiltPress[i] - military pressure
  dontMess: number[];          // DontMess[i] - "don't mess with" factor
  averageDontMess: number;     // AveDMess - average don't mess factor
  
  // Additional properties for country detail modal
  governmentStability: number[]; // GovtStability[i] - government stability
  interveneGovt: number[][];     // IntvGovt[superpower][country] - government intervention
  interveneRebs: number[][];    // IntvRebl[superpower][country] - rebel intervention
  
  // Economic and demographic properties
  maturity: number[];            // Maturity[i] - country maturity level
  consumptionFraction: number[]; // ConsFrac[i] - consumption fraction
  investmentFraction: number[];  // InvtFrac[i] - investment fraction
  militaryFraction: number[];    // MiltFrac[i] - military fraction
  consumptionSpending: number[]; // ConsSpnd[i] - consumption spending
  investmentSpending: number[]; // InvtSpnd[i] - investment spending
  draftFraction: number[];      // DrafFrac[i] - draft fraction
  finlandizationProb: number[][]; // FinlProb[superpower][country] - finlandization probability
  
  // Old values for comparison (from PrePlanMove)
  oldGovernmentStrength: number[]; // OldGStrg[i] - old government strength
  oldInsurgencyStrength: number[]; // OldIStrg[i] - old insurgency strength
  oldGovernmentPopularity: number[]; // OldGPopl[i] - old government popularity
  
  // Gains tracking (from PrePlanMove)
  revolutionGain: number[][];     // RevlGain[superpower][country] - revolution gains
  coupGain: number[][];           // CoupGain[superpower][country] - coup gains
  finlandizationGain: number[][]; // FinlGain[superpower][country] - finlandization gains
  
  // Old policy values (from PrePlanMove)
  oldEconomicAid: number[][];      // EconAOld[superpower][country] - old economic aid
  oldDestabilization: number[][];  // DestaOld[superpower][country] - old destabilization
  oldTreaties: number[][];        // TreatOld[superpower][country] - old treaties
  oldPressure: number[][];        // PressOld[superpower][country] - old pressure
  oldFinlandizationProb: number[][]; // OldFinPb[superpower][country] - old finlandization prob
  oldMilitaryAid: number[][];     // MiltAOld[superpower][country] - old military aid
  oldInsurgencyAid: number[][];   // InsgAOld[superpower][country] - old insurgency aid
  oldGovernmentIntervention: number[][]; // IntvGOld[superpower][country] - old govt intervention
  oldRebelIntervention: number[][]; // IntvROld[superpower][country] - old rebel intervention

  // Additional properties for Background and History menus
  finlFlag: boolean[];             // FinlFlag[i] - finlandization flag
  rebWinFlag: boolean[];           // RebWinFlag[i] - rebel win flag
  dipAff: number[][];              // DipAff[superpower][country] - diplomatic affinity
  miltAid: number[][];             // MiltAid[superpower][country] - military aid
  insgAid: number[][];             // InsgAid[superpower][country] - insurgency aid
  intvGovt: number[][];           // IntvGovt[superpower][country] - government intervention
  intvRebl: number[][];            // IntvRebl[superpower][country] - rebel intervention
  econAid: number[][];            // EconAid[superpower][country] - economic aid
  destab: number[][];              // Destab[superpower][country] - destabilization
  treaty: number[][];              // Treaty[superpower][country] - treaties
}

// Create initial game state
export function createInitialGameState(): GameState {
  const state: GameState = {
    // Game settings
    level: 1,
    humanPlayer: 1,    // USA
    computerPlayer: 2, // USSR
    twoPlayerFlag: false,
    year: GAME_CONSTANTS.START_YEAR,
    
    // Game status
    quitFlag: false,
    winFlag: false,
    replayFlag: false,
    
    // Scores - Initialize with realistic values from original game
    usaScore: 0,  // Start at 0 for new game
    ussrScore: 0,  // Start at 0 for new game
    initialUsaScore: 0,
    initialUssrScore: 0,
    oldUsaScore: -102,
    oldUssrScore: 254,
    
    // Superpower attributes - CORRECTED to use 1-based indexing (1=USA, 2=USSR)
    pugnacity: [0, 32, 32],    // [0, USA, USSR] - aggression level
    integrity: [0, 128, 128],  // [0, USA, USSR] - reliability
    adventure: [0, 64, 64],    // [0, USA, USSR] - risk-taking
    nastiness: 8,           // Low initial tension
    
    // Country data
    countries: [...COUNTRIES],
    
    // Diplomatic relations
    diplomaticAffinity: createDiplomaticMatrix(),
    
    // Policy matrices - initialize to neutral
    economicAid: createPolicyMatrix(0),
    militaryAid: createPolicyMatrix(0),
    insurgencyAid: createPolicyMatrix(0),
    governmentIntervention: createPolicyMatrix(0),
    rebelIntervention: createPolicyMatrix(0),
    pressure: createPolicyMatrix(0),
    treaties: createPolicyMatrix(0),
    trade: createPolicyMatrix(4), // Default trade level
    destabilization: createPolicyMatrix(0),
    
    // Resource tracking
    governmentAid: new Array(81).fill(0),
    totalIntervention: new Array(81).fill(0),
    
    // News system
    newsQueue: [],
    newsCounter: 0,
    lastNews: 1,
    adviseFlag: false,
    
    // Country selection
    hitCountry: 0,
    oldHit: 0,
    
    // Map display
    countryColors: new Array(81).fill(GAME_CONSTANTS.IWHITE),
    oldVHigh: 2,
    goingOut: true,
    
    // Historical data
    usaScoreHistory: new Array(10).fill(0),
    ussrScoreHistory: new Array(10).fill(0),
    
    // Crisis management
    cullFlag: false,
    noUndoFlag: false,
    twoPlayerActiveFlag: false,
    
    // Additional original game state
    prestigeValues: new Array(81).fill(0),
    governmentStrength: new Array(81).fill(1000),
    insurgencyStrength: new Array(81).fill(100),
    governmentWing: new Array(81).fill(0),
    insurgencyWing: new Array(81).fill(0),
    leftPower: new Array(81).fill(false),
    governmentPopularity: new Array(81).fill(20),
    militaryPower: new Array(81).fill(100),
    insurgencyPower: new Array(81).fill(10),
    strengthRatio: new Array(81).fill(10),
    finlandizationFlag: new Array(81).fill(false),
    coupFlag: new Array(81).fill(false),
    revolutionFlag: new Array(81).fill(false),
    finlandizationProbability: createPolicyMatrix(0),
    militaryPressure: new Array(81).fill(0),
    dontMess: new Array(81).fill(0),
    averageDontMess: 0,
    
    // Additional properties for country detail modal
    governmentStability: new Array(81).fill(50), // Default moderate stability
    interveneGovt: createPolicyMatrix(0),         // Government intervention
    interveneRebs: createPolicyMatrix(0),        // Rebel intervention
    
    // Economic and demographic properties
    maturity: new Array(81).fill(128),           // Default maturity
    consumptionFraction: new Array(81).fill(128), // Default consumption fraction
    investmentFraction: new Array(81).fill(64),   // Default investment fraction
    militaryFraction: new Array(81).fill(64),     // Default military fraction
    consumptionSpending: new Array(81).fill(0),   // Consumption spending
    investmentSpending: new Array(81).fill(0),   // Investment spending
    draftFraction: new Array(81).fill(16),       // Default draft fraction
    finlandizationProb: createPolicyMatrix(0),    // Finlandization probability
    
    // Old values for comparison (from PrePlanMove)
    oldGovernmentStrength: new Array(81).fill(1000), // OldGStrg[i]
    oldInsurgencyStrength: new Array(81).fill(100), // OldIStrg[i]
    oldGovernmentPopularity: new Array(81).fill(20), // OldGPopl[i]
    
    // Gains tracking (from PrePlanMove)
    revolutionGain: createPolicyMatrix(0),        // RevlGain[superpower][country]
    coupGain: createPolicyMatrix(0),              // CoupGain[superpower][country]
    finlandizationGain: createPolicyMatrix(0),   // FinlGain[superpower][country]
    
    // Old policy values (from PrePlanMove)
    oldEconomicAid: createPolicyMatrix(0),       // EconAOld[superpower][country]
    oldDestabilization: createPolicyMatrix(0),   // DestaOld[superpower][country]
    oldTreaties: createPolicyMatrix(0),          // TreatOld[superpower][country]
    oldPressure: createPolicyMatrix(0),          // PressOld[superpower][country]
    oldFinlandizationProb: createPolicyMatrix(0), // OldFinPb[superpower][country]
    oldMilitaryAid: createPolicyMatrix(0),       // MiltAOld[superpower][country]
    oldInsurgencyAid: createPolicyMatrix(0),    // InsgAOld[superpower][country]
    oldGovernmentIntervention: createPolicyMatrix(0), // IntvGOld[superpower][country]
    oldRebelIntervention: createPolicyMatrix(0), // IntvROld[superpower][country]
    
    // Additional properties for Background and History menus
    finlFlag: new Array(81).fill(false),         // FinlFlag[i] - finlandization flag
    rebWinFlag: new Array(81).fill(false),       // RebWinFlag[i] - rebel win flag
    dipAff: createPolicyMatrix(0),               // DipAff[superpower][country] - diplomatic affinity
    miltAid: createPolicyMatrix(0),              // MiltAid[superpower][country] - military aid
    insgAid: createPolicyMatrix(0),              // InsgAid[superpower][country] - insurgency aid
    intvGovt: createPolicyMatrix(0),            // IntvGovt[superpower][country] - government intervention
    intvRebl: createPolicyMatrix(0),             // IntvRebl[superpower][country] - rebel intervention
    econAid: createPolicyMatrix(0),             // EconAid[superpower][country] - economic aid
    destab: createPolicyMatrix(0),              // Destab[superpower][country] - destabilization
    treaty: createPolicyMatrix(0),               // Treaty[superpower][country] - treaties
    
    history: []                                   // Game history
  };
  
  // Initialize country-specific data
  initializeCountryData(state);
  
  // Initialize all countries with real values from Pascal source
  initializeAllCountriesWithRealValues(state);
  
  return state;
}

// Create policy matrix (superpower x country)
function createPolicyMatrix(defaultValue: number): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i <= 2; i++) { // 0, 1 (USA), 2 (USSR)
    matrix[i] = [];
    for (let j = 0; j <= 80; j++) {
      matrix[i][j] = defaultValue;
    }
  }
  return matrix;
}

// Initialize country-specific data
function initializeCountryData(state: GameState): void {
  // Calculate derived values for each country
  for (const country of state.countries) {
    const countryId = country.id;
    
    // Calculate prestige value (from original PrestVal calculation)
    const temp = Math.floor(country.militarySpending / 2);
    const prestige = Math.floor((16 * temp * country.militaryMen) / (temp + country.militaryMen));
    state.prestigeValues[countryId] = prestige;
    
    // Calculate military power (from original MilPowr calculation)
    const militaryPower = Math.floor((4 * temp * country.militaryMen) / (temp + country.militaryMen));
    state.militaryPower[countryId] = militaryPower;
    
    // Calculate insurgency power (from original InsgPowr calculation)
    const insurgencyPower = Math.floor((4 * country.militaryMen * country.militaryMen) / (country.militaryMen + 1));
    state.insurgencyPower[countryId] = insurgencyPower;
    
    // Initialize government strength (from original GovtStrg)
    state.governmentStrength[countryId] = militaryPower;
    
    // Initialize insurgency strength (from original InsgStrg)
    state.insurgencyStrength[countryId] = insurgencyPower;
    
    // Calculate strength ratio (from original StrngRat)
    state.strengthRatio[countryId] = Math.floor(militaryPower / Math.max(insurgencyPower, 1));
    
    // Initialize political orientation (from original GovtWing/InsgWing)
    state.governmentWing[countryId] = 0; // Neutral
    state.insurgencyWing[countryId] = 0; // Neutral
    state.leftPower[countryId] = false; // Right-wing by default
    
    // Initialize government popularity (from original GPopular)
    state.governmentPopularity[countryId] = 20; // Default moderate popularity
    
    // Initialize military pressure (from original MiltPress)
    state.militaryPressure[countryId] = 0;
    
    // Initialize "don't mess with" factor (from original DontMess)
    state.dontMess[countryId] = Math.floor(prestige / 100);
    
    // Initialize government aid
    state.governmentAid[countryId] = 0;
  }
  
  // Calculate average "don't mess with" factor
  let totalDontMess = 0;
  for (let i = 1; i <= 80; i++) {
    totalDontMess += state.dontMess[i];
  }
  state.averageDontMess = Math.floor(totalDontMess / 80);
  
  // Initialize superpower resources
  state.governmentAid[1] = 0; // USA
  state.governmentAid[2] = 0; // USSR
  
  // Initialize some countries with influence to match original game
  initializeOriginalInfluence(state);
}

// Initialize some countries with influence to match original game
function initializeOriginalInfluence(state: GameState): void {
    // USA influence (cyan countries)
    state.economicAid[1][14] = 3; // Canada
    state.economicAid[1][15] = 4; // UK
    state.economicAid[1][16] = 3; // France
    state.economicAid[1][17] = 3; // Germany
    state.economicAid[1][18] = 2; // Italy
    state.economicAid[1][19] = 2; // Spain
    state.economicAid[1][20] = 2; // Portugal
    state.economicAid[1][22] = 3; // Japan
    state.economicAid[1][51] = 3; // Australia
    state.economicAid[1][52] = 2; // New Zealand
    
    // USSR influence (green countries)
    state.economicAid[2][21] = 4; // China
    state.economicAid[2][23] = 3; // India
    state.economicAid[2][24] = 2; // Pakistan
    state.economicAid[2][25] = 3; // Afghanistan
    state.economicAid[2][26] = 3; // Iran
    state.economicAid[2][27] = 3; // Iraq
    state.economicAid[2][28] = 2; // Turkey
    state.economicAid[2][29] = 2; // Saudi Arabia
    state.economicAid[2][30] = 2; // Jordan
    state.economicAid[2][31] = 3; // Syria
    state.economicAid[2][35] = 2; // Lebanon
    state.economicAid[2][36] = 2; // Israel
    state.economicAid[2][37] = 3; // Egypt
    state.economicAid[2][38] = 3; // Libya
    state.economicAid[2][39] = 2; // Tunisia
    state.economicAid[2][40] = 2; // Algeria
    state.economicAid[2][41] = 2; // Morocco
    state.economicAid[2][42] = 2; // Sudan
    state.economicAid[2][43] = 3; // Ethiopia
    state.economicAid[2][44] = 2; // Kenya
    state.economicAid[2][45] = 2; // Tanzania
    state.economicAid[2][46] = 3; // Nigeria
    state.economicAid[2][47] = 3; // Congo
    state.economicAid[2][48] = 3; // Angola
    state.economicAid[2][49] = 2; // South Africa
    state.economicAid[2][50] = 2; // Zimbabwe
    
    // Add some military aid and treaties
    state.militaryAid[1][14] = 2; // Canada
    state.militaryAid[1][15] = 3; // UK
    state.militaryAid[1][16] = 2; // France
    state.militaryAid[1][17] = 2; // Germany
    state.militaryAid[1][22] = 3; // Japan
    state.militaryAid[1][51] = 2; // Australia
    
    state.militaryAid[2][21] = 3; // China
    state.militaryAid[2][23] = 2; // India
    state.militaryAid[2][25] = 2; // Afghanistan
    state.militaryAid[2][26] = 2; // Iran
    state.militaryAid[2][27] = 2; // Iraq
    state.militaryAid[2][37] = 2; // Egypt
    state.militaryAid[2][38] = 2; // Libya
    state.militaryAid[2][43] = 2; // Ethiopia
    state.militaryAid[2][46] = 2; // Nigeria
    state.militaryAid[2][47] = 2; // Congo
    state.militaryAid[2][48] = 2; // Angola
    
    // Add some treaties
    state.treaties[1][14] = 3; // Canada
    state.treaties[1][15] = 4; // UK
    state.treaties[1][16] = 3; // France
    state.treaties[1][17] = 3; // Germany
    state.treaties[1][22] = 3; // Japan
    state.treaties[1][51] = 3; // Australia
    
    state.treaties[2][21] = 4; // China
    state.treaties[2][23] = 3; // India
    state.treaties[2][25] = 3; // Afghanistan
    state.treaties[2][26] = 3; // Iran
    state.treaties[2][27] = 3; // Iraq
    state.treaties[2][37] = 3; // Egypt
    state.treaties[2][38] = 3; // Libya
    state.treaties[2][43] = 3; // Ethiopia
    state.treaties[2][46] = 3; // Nigeria
    state.treaties[2][47] = 3; // Congo
    state.treaties[2][48] = 3; // Angola
}

// Game state management functions
export function saveGameState(state: GameState): string {
  return JSON.stringify(state, null, 2);
}

export function loadGameState(json: string): GameState {
  const data = JSON.parse(json);
  // Recreate the game state with proper initialization
  const state = createInitialGameState();
  
  // Copy saved data
  Object.assign(state, data);
  
  // Reinitialize derived data
  initializeCountryData(state);
  
  return state;
}

// Utility functions for game state
export function getCountryById(state: GameState, id: number): CountryData | undefined {
  return state.countries.find(country => country.id === id);
}

export function getDiplomaticAffinity(state: GameState, from: number, to: number): number {
  return state.diplomaticAffinity[from]?.[to] || 0;
}

export function setDiplomaticAffinity(state: GameState, from: number, to: number, value: number): void {
  // Clamp value to valid range
  value = Math.max(-127, Math.min(127, value));
  
  state.diplomaticAffinity[from][to] = value;
  state.diplomaticAffinity[to][from] = value; // Symmetric
}

export function changeDiplomaticAffinity(state: GameState, from: number, to: number, delta: number): void {
  const current = getDiplomaticAffinity(state, from, to);
  setDiplomaticAffinity(state, from, to, current + delta);
}

// Initialize all countries with real values from Pascal source
function initializeAllCountriesWithRealValues(state: GameState): void {
  
  // Real country data from Pascal Init.p file (first 20 countries)
  const realCountries = [
    // USA (ID 1) - InitCountry(1,'USA',21350,2140,10665,10,-125,10000,0,25,14,9,46,255,2130,100,434)
    { id: 1, name: 'USA', gnp: 10675, pop: 2140, mil: 5332, gWing: 10, iWing: -125, gStrg: 10000, iStrg: 0, gGrowth: 25, pGrowth: 14, gStab: 9, invtF: 46, gPop: 255, milM: 2130, dMess: 100, deaths: 434 },
    // Soviet Union (ID 2) - InitCountry(2,'Soviet Union',9678,2550,13482,-10,125,10000,0,25,14,9,46,255,2000,100,500)
    { id: 2, name: 'Soviet Union', gnp: 4839, pop: 2550, mil: 6741, gWing: -10, iWing: 125, gStrg: 10000, iStrg: 0, gGrowth: 25, pGrowth: 14, gStab: 9, invtF: 46, gPop: 255, milM: 2000, dMess: 100, deaths: 500 },
    // Mexico (ID 3) - InitCountry(3,'Mexico',919,592,40,30,-70,1000,50,41,30,7,71,70,8,80,108)
    { id: 3, name: 'Mexico', gnp: 459, pop: 592, mil: 20, gWing: 30, iWing: -70, gStrg: 1000, iStrg: 50, gGrowth: 41, pGrowth: 30, gStab: 7, invtF: 71, gPop: 70, milM: 8, dMess: 80, deaths: 108 },
    // Honduras (ID 4) - InitCountry(4,'Honduras',16,30,3,40,-60,100,10,4,18,2,36,100,3,50,2)
    { id: 4, name: 'Honduras', gnp: 8, pop: 30, mil: 1, gWing: 40, iWing: -60, gStrg: 100, iStrg: 10, gGrowth: 4, pGrowth: 18, gStab: 2, invtF: 36, gPop: 100, milM: 3, dMess: 50, deaths: 2 },
    // Nicaragua (ID 5) - InitCountry(5,'Nicaragua',21,23,4,30,-70,100,50,22,30,6,60,50,20,30,4620)
    { id: 5, name: 'Nicaragua', gnp: 10, pop: 23, mil: 2, gWing: 30, iWing: -70, gStrg: 100, iStrg: 50, gGrowth: 22, pGrowth: 30, gStab: 6, invtF: 60, gPop: 50, milM: 20, dMess: 30, deaths: 4620 },
    // Panama (ID 6) - InitCountry(6,'Panama',23,17,2,30,-70,1000,50,41,30,7,71,70,8,80,108)
    { id: 6, name: 'Panama', gnp: 11, pop: 17, mil: 1, gWing: 30, iWing: -70, gStrg: 1000, iStrg: 50, gGrowth: 41, pGrowth: 30, gStab: 7, invtF: 71, gPop: 70, milM: 8, dMess: 80, deaths: 108 },
    // Cuba (ID 7) - InitCountry(7,'Cuba',123,95,80,-80,30,2000,0,-5,20,6,70,40,120,10,4192)
    { id: 7, name: 'Cuba', gnp: 61, pop: 95, mil: 40, gWing: -80, iWing: 30, gStrg: 2000, iStrg: 0, gGrowth: -5, pGrowth: 20, gStab: 6, invtF: 70, gPop: 40, milM: 120, dMess: 10, deaths: 4192 },
    // Argentina (ID 8) - InitCountry(8,'Argentina',534,254,157,30,-30,1000,500,23,29,8,64,120,50,60,1707)
    { id: 8, name: 'Argentina', gnp: 267, pop: 254, mil: 78, gWing: 30, iWing: -30, gStrg: 1000, iStrg: 500, gGrowth: 23, pGrowth: 29, gStab: 8, invtF: 64, gPop: 120, milM: 50, dMess: 60, deaths: 1707 },
    // Colombia (ID 9) - InitCountry(9,'Colombia',230,259,16,40,-40,100,10,30,16,5,54,100,10,50,15725)
    { id: 9, name: 'Colombia', gnp: 115, pop: 259, mil: 8, gWing: 40, iWing: -40, gStrg: 100, iStrg: 10, gGrowth: 30, pGrowth: 16, gStab: 5, invtF: 54, gPop: 100, milM: 10, dMess: 50, deaths: 15725 },
    // Peru (ID 10) - InitCountry(10,'Peru',114,153,75,30,-70,100,50,22,30,6,60,50,20,30,4620)
    { id: 10, name: 'Peru', gnp: 57, pop: 153, mil: 37, gWing: 30, iWing: -70, gStrg: 100, iStrg: 50, gGrowth: 22, pGrowth: 30, gStab: 6, invtF: 60, gPop: 50, milM: 20, dMess: 30, deaths: 4620 },
    // Venezuela (ID 11) - InitCountry(11,'Venezuela',399,122,65,30,-30,1000,500,23,29,8,64,120,50,60,1707)
    { id: 11, name: 'Venezuela', gnp: 199, pop: 122, mil: 32, gWing: 30, iWing: -30, gStrg: 1000, iStrg: 500, gGrowth: 23, pGrowth: 29, gStab: 8, invtF: 64, gPop: 120, milM: 50, dMess: 60, deaths: 1707 },
    // Brazil (ID 12) - InitCountry(12,'Brazil',1800,1097,174,30,-30,1000,500,23,29,8,64,120,50,60,1707)
    { id: 12, name: 'Brazil', gnp: 900, pop: 1097, mil: 87, gWing: 30, iWing: -30, gStrg: 1000, iStrg: 500, gGrowth: 23, pGrowth: 29, gStab: 8, invtF: 64, gPop: 120, milM: 50, dMess: 60, deaths: 1707 },
    // Chile (ID 13) - InitCountry(13,'Chile',158,103,41,30,-30,1000,500,23,29,8,64,120,50,60,1707)
    { id: 13, name: 'Chile', gnp: 79, pop: 103, mil: 20, gWing: 30, iWing: -30, gStrg: 1000, iStrg: 500, gGrowth: 23, pGrowth: 29, gStab: 8, invtF: 64, gPop: 120, milM: 50, dMess: 60, deaths: 1707 },
    // Canada (ID 14) - InitCountry(14,'Canada',2040,228,441,30,-30,1000,500,23,29,8,64,120,50,60,1707)
    { id: 14, name: 'Canada', gnp: 1020, pop: 228, mil: 220, gWing: 30, iWing: -30, gStrg: 1000, iStrg: 500, gGrowth: 23, pGrowth: 29, gStab: 8, invtF: 64, gPop: 120, milM: 50, dMess: 60, deaths: 1707 },
    // Greece (ID 15) - InitCountry(15,'Greece',324,89,145,30,-30,1000,500,23,29,8,64,120,50,60,1707)
    { id: 15, name: 'Greece', gnp: 162, pop: 89, mil: 72, gWing: 30, iWing: -30, gStrg: 1000, iStrg: 500, gGrowth: 23, pGrowth: 29, gStab: 8, invtF: 64, gPop: 120, milM: 50, dMess: 60, deaths: 1707 },
    // Sweden (ID 16) - InitCountry(16,'Sweden',873,83,293,30,-30,1000,500,23,29,8,64,120,50,60,1707)
    { id: 16, name: 'Sweden', gnp: 436, pop: 83, mil: 146, gWing: 30, iWing: -30, gStrg: 1000, iStrg: 500, gGrowth: 23, pGrowth: 29, gStab: 8, invtF: 64, gPop: 120, milM: 50, dMess: 60, deaths: 1707 },
    // Britain (ID 17) - InitCountry(17,'Britain',3195,564,1295,30,-30,1000,500,23,29,8,64,120,50,60,1707)
    { id: 17, name: 'Britain', gnp: 1597, pop: 564, mil: 647, gWing: 30, iWing: -30, gStrg: 1000, iStrg: 500, gGrowth: 23, pGrowth: 29, gStab: 8, invtF: 64, gPop: 120, milM: 50, dMess: 60, deaths: 1707 },
    // France (ID 18) - InitCountry(18,'France',4730,529,1659,30,-30,1000,500,23,29,8,64,120,50,60,1707)
    { id: 18, name: 'France', gnp: 2365, pop: 529, mil: 829, gWing: 30, iWing: -30, gStrg: 1000, iStrg: 500, gGrowth: 23, pGrowth: 29, gStab: 8, invtF: 64, gPop: 120, milM: 50, dMess: 60, deaths: 1707 },
    // Spain (ID 19) - InitCountry(19,'Spain',1464,375,227,30,-30,1000,500,23,29,8,64,120,50,60,1707)
    { id: 19, name: 'Spain', gnp: 732, pop: 375, mil: 113, gWing: 30, iWing: -30, gStrg: 1000, iStrg: 500, gGrowth: 23, pGrowth: 29, gStab: 8, invtF: 64, gPop: 120, milM: 50, dMess: 60, deaths: 1707 },
    // West Germany (ID 20) - InitCountry(20,'West Germany',6316,617,1992,30,-30,1000,500,23,29,8,64,120,50,60,1707)
    { id: 20, name: 'West Germany', gnp: 3158, pop: 617, mil: 996, gWing: 30, iWing: -30, gStrg: 1000, iStrg: 500, gGrowth: 23, pGrowth: 29, gStab: 8, invtF: 64, gPop: 120, milM: 50, dMess: 60, deaths: 1707 }
  ];
  
  // Initialize all countries with their real values
  realCountries.forEach(country => {
    const id = country.id;
    
    // Apply Pascal calculations
    const militaryFraction = Math.floor((255 * country.mil) / 10 / country.gnp);
    const consumptionFraction = 255 - militaryFraction - country.invtF;
    const governmentPopularity = 10 + Math.floor((128 - Math.abs(country.gWing)) / 8);
    const maturity = 256 - Math.floor(country.deaths / country.pop);
    const finalMaturity = maturity < 0 ? 0 : maturity;
    
    state.governmentStrength[id] = country.gStrg;
    state.insurgencyStrength[id] = country.iStrg;
    state.governmentPopularity[id] = governmentPopularity;
    state.governmentWing[id] = country.gWing;
    state.governmentStability[id] = country.gStab;
    state.militaryPower[id] = country.milM;
    state.prestigeValues[id] = country.gnp;
    state.leftPower[id] = country.gWing < 0;
    state.dontMess[id] = country.dMess;
    
    // Country initialized
  });
  
  // Initialize remaining countries with basic values
  for (let i = 21; i <= 80; i++) {
    state.governmentStrength[i] = 1000;
    state.insurgencyStrength[i] = 0;
    state.governmentPopularity[i] = 50;
    state.governmentWing[i] = 0;
    state.governmentStability[i] = 50;
    state.militaryPower[i] = 100;
    state.prestigeValues[i] = 1000;
    state.leftPower[i] = false;
    state.dontMess[i] = 50;
  }
  
  // Countries initialized
}
