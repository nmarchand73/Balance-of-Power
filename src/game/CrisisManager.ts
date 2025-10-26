import { GameState, PolicyType } from './GameState.js';
import { COUNTRY_BY_ID } from '../data/countries.js';

// Crisis types
export enum CrisisType {
  MINOR_COUNTRY = 'minor_country',
  SUPERPOWER_CONFLICT = 'superpower_conflict',
  NUCLEAR_ESCALATION = 'nuclear_escalation'
}

// Crisis response options
export enum CrisisResponse {
  BACK_DOWN = 'back_down',
  NEGOTIATE = 'negotiate',
  REFUSE_NEGOTIATE = 'refuse_negotiate',
  THREATEN_WAR = 'threaten_war'
}

// Crisis interface
export interface Crisis {
  id: number;
  type: CrisisType;
  subject: number;        // Country causing the crisis
  object: number;         // Country affected by the crisis
  verb: PolicyType;       // Type of action that triggered the crisis
  oldValue: number;       // Previous value
  newValue: number;       // New value that triggered crisis
  crisisLevel: number;    // Escalation level (1-9, where 1 = nuclear war)
  prestigeAtRisk: number; // Prestige points at risk
  usaInterest: number;    // USA interest level (0-7)
  ussrInterest: number;   // USSR interest level (0-7)
  isActive: boolean;      // Whether crisis is currently active
}

// Crisis manager class
export class CrisisManager {
  private gameState: GameState;
  private activeCrises: Map<number, Crisis> = new Map();
  private crisisCounter: number = 0;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  // Check for potential crises after policy changes
  public checkForCrises(subject: number, verb: PolicyType, object: number, oldValue: number, newValue: number): Crisis | null {
    // Skip if it's the same superpower
    if (subject === object) return null;

    // Calculate crisis probability based on action type and values
    const crisisProbability = this.calculateCrisisProbability(subject, verb, object, oldValue, newValue);
    
    if (crisisProbability > 0.3) { // 30% base chance
      return this.createCrisis(subject, verb, object, oldValue, newValue);
    }

    return null;
  }

  // Calculate probability of crisis based on action
  private calculateCrisisProbability(subject: number, verb: PolicyType, object: number, oldValue: number, newValue: number): number {
    let probability = 0.1; // Base 10% chance

    // Increase probability based on action type
    switch (verb) {
      case PolicyType.MILTRY:
        probability += 0.2; // Military aid is provocative
        break;
      case PolicyType.INT_GOV:
        probability += 0.3; // Government intervention is very provocative
        break;
      case PolicyType.INT_REB:
        probability += 0.4; // Rebel intervention is extremely provocative
        break;
      case PolicyType.INSG:
        probability += 0.25; // Insurgency aid is provocative
        break;
      case PolicyType.PRESSUR:
        probability += 0.15; // Pressure can cause tensions
        break;
      case PolicyType.ECON:
        probability += 0.05; // Economic aid is less provocative
        break;
      case PolicyType.TREATO:
        probability += 0.1; // Treaties can cause tensions
        break;
    }

    // Increase probability based on value change
    const valueChange = Math.abs(newValue - oldValue);
    probability += valueChange * 0.05; // Each level adds 5%

    // Increase probability if countries are hostile
    const relations = this.gameState.diplomaticAffinity[object][subject] || 0;
    if (relations < -50) {
      probability += 0.2; // Hostile relations increase crisis chance
    }

    // Increase probability based on game nastiness
    probability += (this.gameState.nastiness / 100) * 0.1;

    // Random factor
    probability += (Math.random() - 0.5) * 0.2;

    return Math.max(0, Math.min(1, probability));
  }

  // Create a new crisis
  private createCrisis(subject: number, verb: PolicyType, object: number, oldValue: number, newValue: number): Crisis {
    const crisisId = ++this.crisisCounter;
    
    const crisis: Crisis = {
      id: crisisId,
      type: this.determineCrisisType(subject, verb, object),
      subject,
      object,
      verb,
      oldValue,
      newValue,
      crisisLevel: 9, // Start at highest level
      prestigeAtRisk: this.calculatePrestigeAtRisk(subject, object),
      usaInterest: this.calculateInterest(1, subject, object), // USA interest
      ussrInterest: this.calculateInterest(2, subject, object), // USSR interest
      isActive: true
    };

    this.activeCrises.set(crisisId, crisis);
    return crisis;
  }

  // Determine crisis type based on countries involved
  private determineCrisisType(subject: number, verb: PolicyType, object: number): CrisisType {
    // If superpowers are involved, it's a superpower conflict
    if (subject <= 2 || object <= 2) {
      return CrisisType.SUPERPOWER_CONFLICT;
    }

    // Otherwise, it's a minor country crisis
    return CrisisType.MINOR_COUNTRY;
  }

  // Calculate prestige at risk
  private calculatePrestigeAtRisk(subject: number, object: number): number {
    const subjectCountry = COUNTRY_BY_ID.get(subject);
    const objectCountry = COUNTRY_BY_ID.get(object);
    
    if (!subjectCountry || !objectCountry) return 0;

    // Base prestige risk from country values
    let prestigeRisk = Math.floor((subjectCountry.prestigeValue + objectCountry.prestigeValue) / 2);
    
    // Scale by game level
    prestigeRisk = Math.floor(prestigeRisk * (1 + this.gameState.level * 0.2));
    
    return Math.max(10, prestigeRisk);
  }

  // Calculate interest level for a superpower
  private calculateInterest(superpower: number, subject: number, object: number): number {
    const subjectCountry = COUNTRY_BY_ID.get(subject);
    const objectCountry = COUNTRY_BY_ID.get(object);
    
    if (!subjectCountry || !objectCountry) return 0;

    // Base interest from prestige values
    let interest = Math.floor((subjectCountry.prestigeValue + objectCountry.prestigeValue) / 200);
    
    // Adjust based on diplomatic relations
    const subjectRelations = this.gameState.diplomaticAffinity[subject][superpower] || 0;
    const objectRelations = this.gameState.diplomaticAffinity[object][superpower] || 0;
    
    // Higher interest if countries are aligned with this superpower
    if (subjectRelations > 50 || objectRelations > 50) {
      interest += 2;
    }
    
    // Lower interest if countries are aligned with the other superpower
    if (subjectRelations < -50 || objectRelations < -50) {
      interest -= 1;
    }

    return Math.max(0, Math.min(7, interest));
  }

  // Handle crisis response
  public handleCrisisResponse(crisisId: number, response: CrisisResponse): CrisisResult {
    const crisis = this.activeCrises.get(crisisId);
    if (!crisis) {
      throw new Error(`Crisis ${crisisId} not found`);
    }

    const result: CrisisResult = {
      crisisId,
      response,
      prestigeChange: 0,
      diplomaticChange: 0,
      crisisResolved: false,
      nuclearWar: false
    };

    switch (response) {
      case CrisisResponse.BACK_DOWN:
        result.prestigeChange = -Math.floor(crisis.prestigeAtRisk * 0.5);
        result.diplomaticChange = -32;
        result.crisisResolved = true;
        break;

      case CrisisResponse.NEGOTIATE:
        result.prestigeChange = -Math.floor(crisis.prestigeAtRisk * 0.25);
        result.diplomaticChange = -16;
        crisis.crisisLevel = Math.max(1, crisis.crisisLevel - 2);
        result.crisisResolved = crisis.crisisLevel <= 3;
        break;

      case CrisisResponse.REFUSE_NEGOTIATE:
        result.prestigeChange = Math.floor(crisis.prestigeAtRisk * 0.1);
        result.diplomaticChange = 8;
        crisis.crisisLevel = Math.max(1, crisis.crisisLevel - 1);
        result.crisisResolved = crisis.crisisLevel <= 3;
        break;

      case CrisisResponse.THREATEN_WAR:
        result.prestigeChange = Math.floor(crisis.prestigeAtRisk * 0.2);
        result.diplomaticChange = 16;
        crisis.crisisLevel = Math.max(1, crisis.crisisLevel - 1);
        
        // Check for nuclear war
        if (crisis.crisisLevel === 1) {
          result.nuclearWar = true;
          result.crisisResolved = true;
        } else {
          result.crisisResolved = crisis.crisisLevel <= 3;
        }
        break;
    }

    // Apply changes to game state
    this.applyCrisisResult(result, crisis);

    // Remove resolved crises
    if (result.crisisResolved) {
      this.activeCrises.delete(crisisId);
    }

    return result;
  }

  // Apply crisis result to game state
  private applyCrisisResult(result: CrisisResult, crisis: Crisis): void {
    // Apply prestige changes
    if (result.prestigeChange !== 0) {
      if (this.gameState.humanPlayer === 1) {
        this.gameState.usaScore += result.prestigeChange;
      } else {
        this.gameState.ussrScore += result.prestigeChange;
      }
    }

    // Apply diplomatic changes
    if (result.diplomaticChange !== 0) {
      const humanPlayer = this.gameState.humanPlayer;
      const computerPlayer = this.gameState.computerPlayer;
      
      // Change relations between countries
      this.gameState.diplomaticAffinity[crisis.subject][crisis.object] += result.diplomaticChange;
      this.gameState.diplomaticAffinity[crisis.object][crisis.subject] += result.diplomaticChange;
      
      // Clamp to valid range
      this.gameState.diplomaticAffinity[crisis.subject][crisis.object] = Math.max(-127, 
        Math.min(127, this.gameState.diplomaticAffinity[crisis.subject][crisis.object]));
      this.gameState.diplomaticAffinity[crisis.object][crisis.subject] = Math.max(-127, 
        Math.min(127, this.gameState.diplomaticAffinity[crisis.object][crisis.subject]));
    }

    // Handle nuclear war
    if (result.nuclearWar) {
      this.gameState.quitFlag = true;
      this.gameState.winFlag = false;
    }
  }

  // Get active crises
  public getActiveCrises(): Crisis[] {
    return Array.from(this.activeCrises.values()).filter(crisis => crisis.isActive);
  }

  // Get crisis by ID
  public getCrisis(crisisId: number): Crisis | null {
    return this.activeCrises.get(crisisId) || null;
  }

  // Check if nuclear war has occurred
  public hasNuclearWar(): boolean {
    return this.gameState.quitFlag && !this.gameState.winFlag;
  }

  // Generate crisis headline
  public generateCrisisHeadline(crisis: Crisis): string {
    const subjectCountry = COUNTRY_BY_ID.get(crisis.subject);
    const objectCountry = COUNTRY_BY_ID.get(crisis.object);
    
    if (!subjectCountry || !objectCountry) return 'Crisis detected';

    const actionNames: Record<PolicyType, string> = {
      [PolicyType.DESTABL]: 'destabilization',
      [PolicyType.ECON]: 'economic aid',
      [PolicyType.MILTRY]: 'military aid',
      [PolicyType.INSG]: 'insurgency aid',
      [PolicyType.INT_GOV]: 'government intervention',
      [PolicyType.INT_REB]: 'rebel intervention',
      [PolicyType.PRESSUR]: 'pressure',
      [PolicyType.TREATO]: 'treaty',
      [PolicyType.TRADO]: 'trade'
    };

    const actionName = actionNames[crisis.verb] || 'action';
    
    return `${subjectCountry.name} ${actionName} to ${objectCountry.name} causes international crisis!`;
  }

  // Get crisis response options
  public getCrisisResponseOptions(crisis: Crisis): CrisisResponse[] {
    return [
      CrisisResponse.BACK_DOWN,
      CrisisResponse.NEGOTIATE,
      CrisisResponse.REFUSE_NEGOTIATE,
      CrisisResponse.THREATEN_WAR
    ];
  }

  // Get crisis response description
  public getCrisisResponseDescription(response: CrisisResponse): string {
    const descriptions = {
      [CrisisResponse.BACK_DOWN]: 'Back down and accept the action',
      [CrisisResponse.NEGOTIATE]: 'Offer to negotiate a compromise',
      [CrisisResponse.REFUSE_NEGOTIATE]: 'Refuse to negotiate',
      [CrisisResponse.THREATEN_WAR]: 'Threaten war if action continues'
    };

    return descriptions[response] || 'Unknown response';
  }
}

// Crisis result interface
export interface CrisisResult {
  crisisId: number;
  response: CrisisResponse;
  prestigeChange: number;
  diplomaticChange: number;
  crisisResolved: boolean;
  nuclearWar: boolean;
}
