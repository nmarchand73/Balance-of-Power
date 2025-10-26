import { GameState } from './GameState.js';
import { COUNTRY_BY_ID } from '../data/countries.js';

// Score calculation functions based on original Balance of Power
export class ScoreCalculator {
  
  // Calculate scores based on original CalcScores function
  static calculateScores(gameState: GameState): { usaScore: number, ussrScore: number } {
    let usaScore = 0;
    let ussrScore = 0;
    
    // CORRECTED: Use original formula from GAME_RULES.md
    // Score = Σ(DiplomaticAffinity[country,superpower] × PrestigeValue[country]) ÷ 1024
    for (let countryId = 3; countryId <= 80; countryId++) { // Only minor countries (3-80)
      const prestigeValue = gameState.prestigeValues[countryId] || 0;
      
      // Get diplomatic affinity directly (not calculated influence)
      const usaDiplomaticAffinity = gameState.diplomaticAffinity[countryId]?.[1] || 0;
      const ussrDiplomaticAffinity = gameState.diplomaticAffinity[countryId]?.[2] || 0;
      
      // Original formula: Sum += DiplomaticAffinity × PrestigeValue
      usaScore += usaDiplomaticAffinity * prestigeValue;
      ussrScore += ussrDiplomaticAffinity * prestigeValue;
    }
    
    // Divide by 1024 as per original formula
    usaScore = Math.floor(usaScore / 1024);
    ussrScore = Math.floor(ussrScore / 1024);
    
    return { usaScore, ussrScore };
  }
  
  // Calculate influence for a superpower in a country (from original Influence function)
  static calculateInfluence(gameState: GameState, superpower: number, countryId: number): number {
    if (!gameState || countryId < 1 || countryId > 80) return 0;
    
    // CORRECTED: Use exact formula from GAME_RULES.md
    // x := Treaty + EconAid + MiltAid + 2*IntvGovt - 2*Destab - 2*InsgAid - 4*IntvRebl
    const treaties = gameState.treaties[superpower][countryId] || 0;
    const economicAid = gameState.economicAid[superpower][countryId] || 0;
    const militaryAid = gameState.militaryAid[superpower][countryId] || 0;
    const governmentIntervention = gameState.governmentIntervention[superpower][countryId] || 0;
    const destabilization = gameState.destabilization[superpower][countryId] || 0;
    const insurgencyAid = gameState.insurgencyAid[superpower][countryId] || 0;
    const rebelIntervention = gameState.rebelIntervention[superpower][countryId] || 0;
    
    // Original formula exactly as specified
    let influence = treaties + economicAid + militaryAid 
                  + 2 * governmentIntervention 
                  - 2 * destabilization 
                  - 2 * insurgencyAid 
                  - 4 * rebelIntervention;
    
    // IF x < 0 THEN x := 0;
    return Math.max(0, influence);
  }
  
  // Calculate finlandization probability (from original DoFinliz function)
  static calculateFinlandizationProbability(gameState: GameState, superpower: number, countryId: number): number {
    if (!gameState || countryId < 1 || countryId > 80) return 0;
    
    const country = COUNTRY_BY_ID.get(countryId);
    if (!country) return 0;
    
    // Calculate projected power
    const intervention = gameState.governmentIntervention[superpower][countryId] || 0;
    const projectedPower = Math.floor((intervention * gameState.militaryPower[superpower]) / gameState.militaryPower[superpower]);
    
    // Calculate self power
    const treaty = gameState.treaties[3 - superpower][countryId] || 0;
    const selfPower = gameState.militaryPower[countryId] - gameState.insurgencyPower[countryId];
    const treatyPower = Math.floor((treaty * gameState.militaryPower[3 - superpower]) / 128);
    const totalSelfPower = selfPower + Math.floor((treatyPower * gameState.integrity[3 - superpower]) / 128);
    
    // Calculate finlandization probability
    const adventure = gameState.adventure[superpower];
    const diplomaticAffinity = gameState.diplomaticAffinity[superpower][countryId] || 0;
    const pressure = gameState.pressure[superpower][countryId] || 0;
    
    let probability = Math.floor(((adventure - diplomaticAffinity) * projectedPower * (pressure + 4)) / Math.max(totalSelfPower, 1));
    
    if (probability < 0) probability = 0;
    if (probability > 2048) probability = 2048;
    
    return Math.floor(probability / 8);
  }
  
  // Check for coup d'etat (from original DevelopC function)
  static checkCoupDetat(gameState: GameState, countryId: number): boolean {
    if (!gameState || countryId < 1 || countryId > 80) return false;
    
    const governmentPopularity = gameState.governmentPopularity[countryId] || 0;
    const destabilization = (gameState.destabilization[1][countryId] || 0) + (gameState.destabilization[2][countryId] || 0);
    
    return governmentPopularity <= destabilization && gameState.level > 1;
  }
  
  // Check for revolution (from original Revolution function)
  static checkRevolution(gameState: GameState, countryId: number): boolean {
    if (!gameState || countryId < 1 || countryId > 80) return false;
    
    const strengthRatio = gameState.strengthRatio[countryId] || 0;
    return strengthRatio < 1;
  }
  
  // Calculate country color based on original game mechanics
  static getCountryColor(gameState: GameState, countryId: number): string {
    if (!gameState || countryId < 1 || countryId > 80) return '#ffffff';
    
    // Calculate influence for each superpower
    const usaInfluence = this.calculateInfluence(gameState, 1, countryId);
    const ussrInfluence = this.calculateInfluence(gameState, 2, countryId);
    
    // Check for special conditions
    if (gameState.revolutionFlag[countryId]) {
      return '#ff0000'; // Red for revolution
    }
    
    if (gameState.coupFlag[countryId]) {
      return '#ff0000'; // Red for coup d'etat
    }
    
    if (gameState.finlandizationFlag[countryId]) {
      if (usaInfluence > ussrInfluence) {
        return '#00ffff'; // Cyan for USA finlandization
      } else {
        return '#00ff00'; // Green for USSR finlandization
      }
    }
    
    // Normal influence-based coloring
    if (usaInfluence > ussrInfluence && usaInfluence > 50) {
      return '#00ffff'; // Cyan for USA influence
    } else if (ussrInfluence > usaInfluence && ussrInfluence > 50) {
      return '#00ff00'; // Green for USSR influence
    } else if (gameState.nastiness > 7 && (usaInfluence > 30 || ussrInfluence > 30)) {
      return '#ff0000'; // Red for high tension
    } else {
      return '#ffffff'; // White for neutral
    }
  }
}
