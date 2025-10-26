import { GameState, PolicyType } from './GameState.js';
import { GameMechanics } from './GameMechanics.js';

// Policy management system based on original game mechanics
export class PolicyManager {
  private gameState: GameState;
  private gameMechanics: GameMechanics;

  constructor(gameState: GameState, gameMechanics: GameMechanics) {
    this.gameState = gameState;
    this.gameMechanics = gameMechanics;
  }

  // Apply a policy change
  public applyPolicy(superpower: number, countryId: number, policyType: PolicyType, value: number): boolean {
    console.log(`📋 Policy: ${superpower === 1 ? 'USA' : 'USSR'} -> ${countryId}, Type: ${PolicyType[policyType]}, Value: ${value}`);
    
    // Validate policy
    if (!this.validatePolicy(superpower, countryId, policyType, value)) {
      return false;
    }

    // Check resource constraints
    if (!this.checkResourceConstraints(superpower, policyType, value)) {
      console.log('❌ Insufficient resources');
      return false;
    }

    // Apply the policy
    this.gameMechanics.applyPolicy(superpower, countryId, policyType, value);

    // Update diplomatic effects
    this.updateDiplomaticEffects(superpower, countryId, policyType, value);

    // Generate news item
    this.generatePolicyNews(superpower, countryId, policyType, value);

    return true;
  }

  // Validate policy parameters
  private validatePolicy(superpower: number, countryId: number, policyType: PolicyType, value: number): boolean {
    // Check superpower validity
    if (superpower !== 1 && superpower !== 2) {
      console.log('❌ Invalid superpower');
      return false;
    }

    // Check country validity
    if (countryId < 1 || countryId > 80) {
      console.log('❌ Invalid country ID');
      return false;
    }

    // Check value range
    if (value < 0 || value > 7) {
      console.log('❌ Invalid policy value');
      return false;
    }

    // Check if country exists
    const country = this.gameState.countries.find(c => c.id === countryId);
    if (!country) {
      console.log('❌ Country not found');
      return false;
    }

    return true;
  }

  // Check resource constraints
  private checkResourceConstraints(superpower: number, policyType: PolicyType, value: number): boolean {
    // Calculate resource cost
    const cost = this.calculatePolicyCost(policyType, value);
    
    // Check available resources (simplified)
    const availableResources = this.getAvailableResources(superpower);
    
    return cost <= availableResources;
  }

  // Calculate policy cost
  private calculatePolicyCost(policyType: PolicyType, value: number): number {
    const baseCosts = {
      [PolicyType.ECON]: 1,
      [PolicyType.MILTRY]: 2,
      [PolicyType.INSG]: 3,
      [PolicyType.INT_GOV]: 4,
      [PolicyType.INT_REB]: 4,
      [PolicyType.PRESSUR]: 1,
      [PolicyType.TREATO]: 2,
      [PolicyType.DESTABL]: 2,
      [PolicyType.TRADO]: 1
    };

    const baseCost = baseCosts[policyType] || 1;
    return baseCost * value;
  }

  // Get available resources for superpower
  private getAvailableResources(superpower: number): number {
    // Simplified resource calculation
    const baseResources = 100;
    const diplomaticBonus = Math.max(0, this.gameState.diplomaticAffinity[superpower][superpower === 1 ? 2 : 1] + 127) / 2;
    return baseResources + diplomaticBonus;
  }

  // Update diplomatic effects of policy
  private updateDiplomaticEffects(superpower: number, countryId: number, policyType: PolicyType, value: number): void {
    const otherSuperpower = superpower === 1 ? 2 : 1;
    
    // Different policies have different diplomatic impacts
    switch (policyType) {
      case PolicyType.ECON:
        // Economic aid improves relations with target, slightly worsens with opponent
        this.changeDiplomaticAffinity(superpower, countryId, value * 2);
        this.changeDiplomaticAffinity(superpower, otherSuperpower, -value);
        break;
        
      case PolicyType.MILTRY:
        // Military aid significantly improves relations with target, worsens with opponent
        this.changeDiplomaticAffinity(superpower, countryId, value * 3);
        this.changeDiplomaticAffinity(superpower, otherSuperpower, -value * 2);
        break;
        
      case PolicyType.INSG:
        // Insurgency aid worsens relations with target government, improves with rebels
        this.changeDiplomaticAffinity(superpower, countryId, -value * 2);
        this.changeDiplomaticAffinity(superpower, otherSuperpower, -value);
        break;
        
      case PolicyType.INT_GOV:
        // Government intervention significantly worsens relations
        this.changeDiplomaticAffinity(superpower, countryId, -value * 4);
        this.changeDiplomaticAffinity(superpower, otherSuperpower, -value * 3);
        break;
        
      case PolicyType.INT_REB:
        // Rebel intervention severely worsens relations
        this.changeDiplomaticAffinity(superpower, countryId, -value * 5);
        this.changeDiplomaticAffinity(superpower, otherSuperpower, -value * 4);
        break;
        
      case PolicyType.PRESSUR:
        // Pressure worsens relations moderately
        this.changeDiplomaticAffinity(superpower, countryId, -value * 2);
        this.changeDiplomaticAffinity(superpower, otherSuperpower, -value);
        break;
        
      case PolicyType.TREATO:
        // Treaties improve relations significantly
        this.changeDiplomaticAffinity(superpower, countryId, value * 4);
        this.changeDiplomaticAffinity(superpower, otherSuperpower, -value * 2);
        break;
        
      case PolicyType.DESTABL:
        // Destabilization worsens relations severely
        this.changeDiplomaticAffinity(superpower, countryId, -value * 3);
        this.changeDiplomaticAffinity(superpower, otherSuperpower, -value * 2);
        break;
    }
  }

  // Change diplomatic affinity
  private changeDiplomaticAffinity(from: number, to: number, delta: number): void {
    const current = this.gameState.diplomaticAffinity[from][to] || 0;
    const newValue = Math.max(-127, Math.min(127, current + delta));
    this.gameState.diplomaticAffinity[from][to] = newValue;
    this.gameState.diplomaticAffinity[to][from] = newValue; // Symmetric
  }

  // Generate news item for policy change
  private generatePolicyNews(superpower: number, countryId: number, policyType: PolicyType, value: number): void {
    const superpowerName = superpower === 1 ? 'USA' : 'USSR';
    const country = this.gameState.countries.find(c => c.id === countryId);
    const countryName = country ? country.name : `Country ${countryId}`;
    
    const policyNames = {
      [PolicyType.ECON]: 'Economic Aid',
      [PolicyType.MILTRY]: 'Military Aid',
      [PolicyType.INSG]: 'Insurgency Aid',
      [PolicyType.INT_GOV]: 'Government Intervention',
      [PolicyType.INT_REB]: 'Rebel Intervention',
      [PolicyType.PRESSUR]: 'Pressure',
      [PolicyType.TREATO]: 'Treaty',
      [PolicyType.DESTABL]: 'Destabilization',
      [PolicyType.TRADO]: 'Trade'
    };

    const policyName = policyNames[policyType];
    const headline = `${superpowerName} increases ${policyName} to ${countryName} (Level ${value})`;
    
    console.log(`📰 News: ${headline}`);
    
    // Add to news queue
    this.gameState.newsQueue.push({
      id: this.gameState.newsCounter++,
      subject: superpower,
      verb: policyType,
      object: countryId,
      oldValue: 0, // Would need to track previous value
      newValue: value,
      host: countryId,
      crisisValue: false,
      newsWorth: this.calculateNewsWorth(policyType, value),
      headline: headline
    });
  }

  // Calculate news worthiness
  private calculateNewsWorth(policyType: PolicyType, value: number): number {
    const baseWorth = {
      [PolicyType.ECON]: 1,
      [PolicyType.MILTRY]: 2,
      [PolicyType.INSG]: 3,
      [PolicyType.INT_GOV]: 4,
      [PolicyType.INT_REB]: 5,
      [PolicyType.PRESSUR]: 2,
      [PolicyType.TREATO]: 3,
      [PolicyType.DESTABL]: 4,
      [PolicyType.TRADO]: 1
    };

    return (baseWorth[policyType] || 1) * value;
  }

  // Get policy value
  public getPolicyValue(superpower: number, countryId: number, policyType: PolicyType): number {
    switch (policyType) {
      case PolicyType.ECON:
        return this.gameState.economicAid[superpower][countryId];
      case PolicyType.MILTRY:
        return this.gameState.militaryAid[superpower][countryId];
      case PolicyType.INSG:
        return this.gameState.insurgencyAid[superpower][countryId];
      case PolicyType.INT_GOV:
        return this.gameState.governmentIntervention[superpower][countryId];
      case PolicyType.INT_REB:
        return this.gameState.rebelIntervention[superpower][countryId];
      case PolicyType.PRESSUR:
        return this.gameState.pressure[superpower][countryId];
      case PolicyType.TREATO:
        return this.gameState.treaties[superpower][countryId];
      case PolicyType.DESTABL:
        return this.gameState.destabilization[superpower][countryId];
      default:
        return 0;
    }
  }

  // Get all policies for a country
  public getCountryPolicies(countryId: number): { [key: string]: { usa: number, ussr: number } } {
    return {
      economicAid: {
        usa: this.gameState.economicAid[1][countryId],
        ussr: this.gameState.economicAid[2][countryId]
      },
      militaryAid: {
        usa: this.gameState.militaryAid[1][countryId],
        ussr: this.gameState.militaryAid[2][countryId]
      },
      insurgencyAid: {
        usa: this.gameState.insurgencyAid[1][countryId],
        ussr: this.gameState.insurgencyAid[2][countryId]
      },
      governmentIntervention: {
        usa: this.gameState.governmentIntervention[1][countryId],
        ussr: this.gameState.governmentIntervention[2][countryId]
      },
      rebelIntervention: {
        usa: this.gameState.rebelIntervention[1][countryId],
        ussr: this.gameState.rebelIntervention[2][countryId]
      },
      pressure: {
        usa: this.gameState.pressure[1][countryId],
        ussr: this.gameState.pressure[2][countryId]
      },
      treaties: {
        usa: this.gameState.treaties[1][countryId],
        ussr: this.gameState.treaties[2][countryId]
      },
      destabilization: {
        usa: this.gameState.destabilization[1][countryId],
        ussr: this.gameState.destabilization[2][countryId]
      }
    };
  }

  // Calculate total influence for a superpower in a country
  public calculateTotalInfluence(superpower: number, countryId: number): number {
    const policies = this.getCountryPolicies(countryId);
    const superpowerKey = superpower === 1 ? 'usa' : 'ussr';
    
    let total = 0;
    for (const policyName in policies) {
      total += policies[policyName][superpowerKey];
    }
    
    return total;
  }

  // Get policy recommendations for AI
  public getPolicyRecommendations(superpower: number, countryId: number): PolicyType[] {
    const recommendations: PolicyType[] = [];
    const currentInfluence = this.calculateTotalInfluence(superpower, countryId);
    const otherSuperpower = superpower === 1 ? 2 : 1;
    const otherInfluence = this.calculateTotalInfluence(otherSuperpower, countryId);
    
    // If we're behind in influence, recommend aggressive policies
    if (currentInfluence < otherInfluence) {
      recommendations.push(PolicyType.ECON);
      recommendations.push(PolicyType.MILTRY);
      recommendations.push(PolicyType.TREATO);
    }
    
    // If we're ahead, recommend defensive policies
    if (currentInfluence > otherInfluence) {
      recommendations.push(PolicyType.PRESSUR);
      recommendations.push(PolicyType.DESTABL);
    }
    
    // Always consider intervention if tensions are high
    if (this.gameState.nastiness > 50) {
      recommendations.push(PolicyType.INT_GOV);
      recommendations.push(PolicyType.INT_REB);
    }
    
    return recommendations;
  }
}
