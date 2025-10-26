import { GameState, PolicyType } from './GameState.js';
import { COUNTRY_BY_ID } from '../data/countries.js';

// AI personality traits
export interface AIPersonality {
  pugnacity: number;    // Aggressiveness (0-255)
  integrity: number;    // Honesty/trustworthiness (0-255)
  adventure: number;    // Risk-taking (0-255)
}

// AI decision context
export interface AIDecisionContext {
  countryId: number;
  importance: number;
  availableResources: number;
  currentRelations: number;
  threatLevel: number;
  opportunityLevel: number;
}

// AI Engine class
export class AIEngine {
  private gameState: GameState;
  private personality: AIPersonality;
  private level: number;

  constructor(gameState: GameState, level: number = 1) {
    this.gameState = gameState;
    this.level = level;
    this.personality = this.initializePersonality(level);
  }

  // Initialize AI personality based on difficulty level
  private initializePersonality(level: number): AIPersonality {
    const basePugnacity = 32 + (4 * level);
    const baseIntegrity = 128 - (8 * level);
    const baseAdventure = 64 + (16 * level);

    return {
      pugnacity: Math.min(255, Math.max(0, basePugnacity + (Math.random() - 0.5) * 32)),
      integrity: Math.min(255, Math.max(0, baseIntegrity + (Math.random() - 0.5) * 16)),
      adventure: Math.min(255, Math.max(0, baseAdventure + (Math.random() - 0.5) * 24))
    };
  }

  // Main AI decision making process
  public makeMove(): void {
    console.log(`AI making move for level ${this.level}`);
    
    // Calculate country importance for all countries
    const countryImportance = this.calculateCountryImportance();
    
    // Sort countries by importance
    const sortedCountries = Object.entries(countryImportance)
      .map(([countryId, importance]) => ({ 
        countryId: parseInt(countryId), 
        importance 
      }))
      .sort((a, b) => b.importance - a.importance);

    // Process decisions for top countries
    const maxCountries = Math.min(10, sortedCountries.length);
    for (let i = 0; i < maxCountries; i++) {
      const { countryId, importance } = sortedCountries[i];
      
      if (countryId === this.gameState.humanPlayer) continue; // Skip human player
      
      const context: AIDecisionContext = {
        countryId,
        importance,
        availableResources: this.calculateAvailableResources(),
        currentRelations: this.gameState.diplomaticAffinity[countryId][this.gameState.computerPlayer] || 0,
        threatLevel: this.calculateThreatLevel(countryId),
        opportunityLevel: this.calculateOpportunityLevel(countryId)
      };

      this.makeCountryDecision(context);
    }
  }

  // Calculate importance of each country for AI decision making
  private calculateCountryImportance(): Record<number, number> {
    const importance: Record<number, number> = {};
    
    for (let countryId = 1; countryId <= 80; countryId++) {
      const country = COUNTRY_BY_ID.get(countryId);
      if (!country) continue;

      // Base importance from country data
      let countryImportance = country.prestigeValue || 0;
      
      // Adjust based on current relations
      const currentRelations = this.gameState.diplomaticAffinity[countryId][this.gameState.computerPlayer] || 0;
      const humanRelations = this.gameState.diplomaticAffinity[countryId][this.gameState.humanPlayer] || 0;
      
      // Higher importance for contested countries
      if (Math.abs(currentRelations - humanRelations) > 50) {
        countryImportance *= 1.5;
      }
      
      // Higher importance for countries with high prestige
      if (country.prestigeValue > 1000) {
        countryImportance *= 1.3;
      }
      
      // Lower importance for countries already strongly aligned
      if (Math.abs(currentRelations) > 100) {
        countryImportance *= 0.7;
      }

      importance[countryId] = countryImportance;
    }

    return importance;
  }

  // Calculate available resources for AI actions
  private calculateAvailableResources(): number {
    // Simplified resource calculation based on game state
    const baseResources = 1000;
    const levelMultiplier = 1 + (this.level * 0.2);
    return Math.floor(baseResources * levelMultiplier);
  }

  // Calculate threat level from human player
  private calculateThreatLevel(countryId: number): number {
    const humanRelations = this.gameState.diplomaticAffinity[countryId][this.gameState.humanPlayer] || 0;
    const computerRelations = this.gameState.diplomaticAffinity[countryId][this.gameState.computerPlayer] || 0;
    
    // Threat is higher when human has better relations
    return Math.max(0, humanRelations - computerRelations);
  }

  // Calculate opportunity level for AI actions
  private calculateOpportunityLevel(countryId: number): number {
    const computerRelations = this.gameState.diplomaticAffinity[countryId][this.gameState.computerPlayer] || 0;
    const humanRelations = this.gameState.diplomaticAffinity[countryId][this.gameState.humanPlayer] || 0;
    
    // Opportunity is higher when computer has better relations or neutral ground
    return Math.max(0, computerRelations - humanRelations + 50);
  }

  // Make decision for a specific country
  private makeCountryDecision(context: AIDecisionContext): void {
    const { importance, availableResources } = context;
    
    // Skip if not enough importance or resources
    if (importance < 100 || availableResources < 50) return;

    // Determine action type based on context and personality
    const actionType = this.determineActionType(context);
    
    if (actionType === PolicyType.ECON) {
      this.executeEconomicAid(context);
    } else if (actionType === PolicyType.MILTRY) {
      this.executeMilitaryAid(context);
    } else if (actionType === PolicyType.INSG) {
      this.executeInsurgencyAid(context);
    } else if (actionType === PolicyType.INT_GOV) {
      this.executeGovernmentIntervention(context);
    } else if (actionType === PolicyType.INT_REB) {
      this.executeRebelIntervention(context);
    } else if (actionType === PolicyType.PRESSUR) {
      this.executePressure(context);
    } else if (actionType === PolicyType.TREATO) {
      this.executeTreaty(context);
    }
  }

  // Determine what type of action to take
  private determineActionType(context: AIDecisionContext): PolicyType {
    const { currentRelations, threatLevel, opportunityLevel } = context;
    
    // Use personality traits to influence decision
    const aggressionFactor = this.personality.pugnacity / 255;
    const riskFactor = this.personality.adventure / 255;
    const integrityFactor = this.personality.integrity / 255;

    // Calculate probabilities for each action type
    const probabilities: Record<PolicyType, number> = {
      [PolicyType.DESTABL]: 0.05,
      [PolicyType.ECON]: 0.3,
      [PolicyType.MILTRY]: 0.2,
      [PolicyType.INSG]: 0.1,
      [PolicyType.INT_GOV]: 0.15,
      [PolicyType.INT_REB]: 0.1,
      [PolicyType.PRESSUR]: 0.1,
      [PolicyType.TREATO]: 0.05,
      [PolicyType.TRADO]: 0.05
    };

    // Adjust probabilities based on context
    if (threatLevel > 50) {
      probabilities[PolicyType.MILTRY] += 0.2;
      probabilities[PolicyType.INT_GOV] += 0.1;
    }

    if (opportunityLevel > 50) {
      probabilities[PolicyType.ECON] += 0.2;
      probabilities[PolicyType.TREATO] += 0.1;
    }

    if (currentRelations < -50) {
      probabilities[PolicyType.INSG] += 0.2;
      probabilities[PolicyType.INT_REB] += 0.1;
    }

    // Adjust based on personality
    if (aggressionFactor > 0.7) {
      probabilities[PolicyType.MILTRY] += 0.1;
      probabilities[PolicyType.INT_GOV] += 0.1;
    }

    if (riskFactor > 0.7) {
      probabilities[PolicyType.INSG] += 0.1;
      probabilities[PolicyType.INT_REB] += 0.1;
    }

    if (integrityFactor > 0.7) {
      probabilities[PolicyType.TREATO] += 0.1;
      probabilities[PolicyType.ECON] += 0.1;
    }

    // Select action based on probabilities
    return this.selectActionByProbability(probabilities);
  }

  // Select action based on weighted probabilities
  private selectActionByProbability(probabilities: Record<PolicyType, number>): PolicyType {
    const total = Object.values(probabilities).reduce((sum, prob) => sum + prob, 0);
    let random = Math.random() * total;
    
    for (const [action, prob] of Object.entries(probabilities)) {
      random -= prob;
      if (random <= 0) {
        return parseInt(action) as PolicyType;
      }
    }
    
    return PolicyType.ECON; // Fallback
  }

  // Execute economic aid
  private executeEconomicAid(context: AIDecisionContext): void {
    const { countryId, availableResources } = context;
    const maxLevel = this.calculateMaxEconomicAid(context);
    const level = Math.min(maxLevel, Math.floor(availableResources / 200));
    
    if (level > 0) {
      this.gameState.economicAid[this.gameState.computerPlayer][countryId] = level;
      console.log(`AI: Economic Aid level ${level} to country ${countryId}`);
    }
  }

  // Execute military aid
  private executeMilitaryAid(context: AIDecisionContext): void {
    const { countryId, availableResources } = context;
    const maxLevel = this.calculateMaxMilitaryAid(context);
    const level = Math.min(maxLevel, Math.floor(availableResources / 300));
    
    if (level > 0) {
      this.gameState.militaryAid[this.gameState.computerPlayer][countryId] = level;
      console.log(`AI: Military Aid level ${level} to country ${countryId}`);
    }
  }

  // Execute insurgency aid
  private executeInsurgencyAid(context: AIDecisionContext): void {
    const { countryId, availableResources } = context;
    const maxLevel = this.calculateMaxInsurgencyAid(context);
    const level = Math.min(maxLevel, Math.floor(availableResources / 400));
    
    if (level > 0) {
      this.gameState.insurgencyAid[this.gameState.computerPlayer][countryId] = level;
      console.log(`AI: Insurgency Aid level ${level} to country ${countryId}`);
    }
  }

  // Execute government intervention
  private executeGovernmentIntervention(context: AIDecisionContext): void {
    const { countryId, availableResources } = context;
    const maxLevel = this.calculateMaxGovernmentIntervention(context);
    const level = Math.min(maxLevel, Math.floor(availableResources / 500));
    
    if (level > 0) {
      this.gameState.governmentIntervention[this.gameState.computerPlayer][countryId] = level;
      console.log(`AI: Government Intervention level ${level} to country ${countryId}`);
    }
  }

  // Execute rebel intervention
  private executeRebelIntervention(context: AIDecisionContext): void {
    const { countryId, availableResources } = context;
    const maxLevel = this.calculateMaxRebelIntervention(context);
    const level = Math.min(maxLevel, Math.floor(availableResources / 500));
    
    if (level > 0) {
      this.gameState.rebelIntervention[this.gameState.computerPlayer][countryId] = level;
      console.log(`AI: Rebel Intervention level ${level} to country ${countryId}`);
    }
  }

  // Execute pressure
  private executePressure(context: AIDecisionContext): void {
    const { countryId, availableResources } = context;
    const maxLevel = this.calculateMaxPressure();
    const level = Math.min(maxLevel, Math.floor(availableResources / 100));
    
    if (level > 0) {
      this.gameState.pressure[this.gameState.computerPlayer][countryId] = level;
      console.log(`AI: Pressure level ${level} to country ${countryId}`);
    }
  }

  // Execute treaty
  private executeTreaty(context: AIDecisionContext): void {
    const { countryId, availableResources } = context;
    const maxLevel = this.calculateMaxTreaty(context);
    const level = Math.min(maxLevel, Math.floor(availableResources / 150));
    
    if (level > 0) {
      this.gameState.treaties[this.gameState.computerPlayer][countryId] = level;
      console.log(`AI: Treaty level ${level} to country ${countryId}`);
    }
  }

  // Calculate maximum economic aid level
  private calculateMaxEconomicAid(context: AIDecisionContext): number {
    const { currentRelations } = context;
    const baseMax = 5;
    const relationBonus = Math.max(0, currentRelations + 127) / 50;
    return Math.min(5, Math.floor(baseMax + relationBonus));
  }

  // Calculate maximum military aid level
  private calculateMaxMilitaryAid(context: AIDecisionContext): number {
    const { currentRelations } = context;
    const baseMax = 5;
    const relationBonus = Math.max(0, currentRelations + 127) / 50;
    return Math.min(5, Math.floor(baseMax + relationBonus));
  }

  // Calculate maximum insurgency aid level
  private calculateMaxInsurgencyAid(context: AIDecisionContext): number {
    const { currentRelations } = context;
    const baseMax = 5;
    const relationPenalty = Math.max(0, -currentRelations + 127) / 50;
    return Math.min(5, Math.floor(baseMax + relationPenalty));
  }

  // Calculate maximum government intervention level
  private calculateMaxGovernmentIntervention(context: AIDecisionContext): number {
    const { currentRelations } = context;
    const baseMax = 5;
    const relationBonus = Math.max(0, currentRelations + 127) / 50;
    return Math.min(5, Math.floor(baseMax + relationBonus));
  }

  // Calculate maximum rebel intervention level
  private calculateMaxRebelIntervention(context: AIDecisionContext): number {
    const { currentRelations } = context;
    const baseMax = 5;
    const relationPenalty = Math.max(0, -currentRelations + 127) / 50;
    return Math.min(5, Math.floor(baseMax + relationPenalty));
  }

  // Calculate maximum pressure level
  private calculateMaxPressure(): number {
    return 5; // Pressure is always available
  }

  // Calculate maximum treaty level
  private calculateMaxTreaty(context: AIDecisionContext): number {
    const { currentRelations } = context;
    const baseMax = 5;
    const relationBonus = Math.max(0, currentRelations + 127) / 50;
    return Math.min(5, Math.floor(baseMax + relationBonus));
  }

  // Get AI personality for debugging
  public getPersonality(): AIPersonality {
    return { ...this.personality };
  }

  // Update AI personality (for difficulty changes)
  public updatePersonality(level: number): void {
    this.level = level;
    this.personality = this.initializePersonality(level);
  }
}
