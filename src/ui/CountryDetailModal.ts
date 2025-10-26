import { GameState, PolicyType } from '../game/GameState.js';
import { COUNTRY_BY_ID, COUNTRY_BY_NAME } from '../data/countries.js';
import { ScoreCalculator } from '../game/ScoreCalculator.js';

export class CountryDetailModal {
  private modal: HTMLElement | null = null;
  private gameState: GameState | null = null;
  private gameEngine: any = null;

  constructor() {
    this.createModal();
  }

  public setGameEngine(gameEngine: any): void {
    this.gameEngine = gameEngine;
  }

  private createModal(): void {
    // Create modal HTML structure
    const modalHTML = `
      <div class="country-detail-modal" id="country-detail-modal" style="display: none;">
        <div class="country-detail-header">
          <span id="country-detail-title">Closeup: Country</span>
          <button class="country-detail-close" id="country-detail-close">×</button>
        </div>
        <div class="country-detail-content">
          <table class="detail-table">
            <thead>
              <tr>
                <th></th>
                <th>USA Value</th>
                <th>USSR Value</th>
                <th>Totals</th>
              </tr>
            </thead>
            <tbody id="country-detail-tbody">
              <!-- Rows will be populated dynamically -->
            </tbody>
          </table>
          <div class="detail-info" id="country-detail-info">
            <!-- Additional info will be populated dynamically -->
          </div>
          <div class="policy-controls" id="policy-controls">
            <h3>Policy Controls</h3>
            <div class="policy-buttons">
              <button class="policy-btn" data-policy="0" data-superpower="1">USA Economic Aid</button>
              <button class="policy-btn" data-policy="1" data-superpower="1">USA Military Aid</button>
              <button class="policy-btn" data-policy="2" data-superpower="1">USA Destabilization</button>
              <button class="policy-btn" data-policy="3" data-superpower="1">USA Insurgency Aid</button>
              <button class="policy-btn" data-policy="4" data-superpower="1">USA Gov Intervention</button>
              <button class="policy-btn" data-policy="5" data-superpower="1">USA Rebel Intervention</button>
              <button class="policy-btn" data-policy="6" data-superpower="1">USA Pressure</button>
              <button class="policy-btn" data-policy="7" data-superpower="1">USA Treaty</button>
              <br>
              <button class="policy-btn" data-policy="0" data-superpower="2">USSR Economic Aid</button>
              <button class="policy-btn" data-policy="1" data-superpower="2">USSR Military Aid</button>
              <button class="policy-btn" data-policy="2" data-superpower="2">USSR Destabilization</button>
              <button class="policy-btn" data-policy="3" data-superpower="2">USSR Insurgency Aid</button>
              <button class="policy-btn" data-policy="4" data-superpower="2">USSR Gov Intervention</button>
              <button class="policy-btn" data-policy="5" data-superpower="2">USSR Rebel Intervention</button>
              <button class="policy-btn" data-policy="6" data-superpower="2">USSR Pressure</button>
              <button class="policy-btn" data-policy="7" data-superpower="2">USSR Treaty</button>
            </div>
            <div class="policy-level">
              <label>Policy Level: <span id="policy-level-display">1</span></label>
              <input type="range" id="policy-level-slider" min="0" max="4" value="1">
            </div>
            <div class="game-controls">
              <button id="next-turn-btn">Next Turn</button>
              <button id="save-game-btn">Save Game</button>
              <button id="load-game-btn">Load Game</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert modal into DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('country-detail-modal') as HTMLElement;

    // Add event listeners
    const closeButton = document.getElementById('country-detail-close');
    closeButton?.addEventListener('click', () => this.hide());

    // Policy button event listeners
    const policyButtons = document.querySelectorAll('.policy-btn');
    policyButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const policyType = parseInt(target.dataset.policy || '0');
        const superpowerId = parseInt(target.dataset.superpower || '1');
        const level = parseInt((document.getElementById('policy-level-slider') as HTMLInputElement)?.value || '1');
        
        // Toggle active state for the clicked button
        if (target.classList.contains('active')) {
          // If already active, deactivate it (set policy to 0)
          target.classList.remove('active');
          this.applyPolicy(superpowerId, policyType, 0);
        } else {
          // If not active, activate it with the selected level
          target.classList.add('active');
          this.applyPolicy(superpowerId, policyType, level);
        }
      });
    });

    // Policy level slider
    const policySlider = document.getElementById('policy-level-slider') as HTMLInputElement;
    const policyLevelDisplay = document.getElementById('policy-level-display');
    policySlider?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (policyLevelDisplay) {
        policyLevelDisplay.textContent = target.value;
      }
    });

    // Game control buttons
    const nextTurnBtn = document.getElementById('next-turn-btn');
    nextTurnBtn?.addEventListener('click', () => this.nextTurn());

    const saveGameBtn = document.getElementById('save-game-btn');
    saveGameBtn?.addEventListener('click', () => this.saveGame());

    const loadGameBtn = document.getElementById('load-game-btn');
    loadGameBtn?.addEventListener('click', () => this.loadGame());

    // Close modal when clicking outside
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
  }

  public setGameState(gameState: GameState): void {
    this.gameState = gameState;
  }

  public show(countryId: number): void {
    if (!this.gameState || !this.modal) return;

    const country = COUNTRY_BY_ID.get(countryId);
    if (!country) return;

    // Update title
    const titleElement = document.getElementById('country-detail-title');
    if (titleElement) {
      titleElement.textContent = `Closeup: ${country.name}`;
    }

    // Populate table
    this.populateTable(countryId);
    
    // Populate additional info
    this.populateInfo(countryId);

    // Update policy button states
    this.updatePolicyButtonStates(countryId);

    // Show modal
    this.modal.style.display = 'block';
  }

  public hide(): void {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }

  public isVisible(): boolean {
    return this.modal ? this.modal.style.display !== 'none' : false;
  }

  private applyPolicy(superpowerId: number, policyType: number, level: number): void {
    if (!this.gameEngine || !this.gameState) return;

    // Get current country ID from the modal title
    const titleElement = document.getElementById('country-detail-title');
    if (!titleElement) return;

    const titleText = titleElement.textContent || '';
    const countryName = titleText.replace('Closeup: ', '');
    const country = COUNTRY_BY_NAME.get(countryName);
    if (!country) return;

    // Apply policy through game engine
    const success = this.gameEngine.applyPolicy(superpowerId, country.id, policyType, level);
    
    if (success) {
      // Policy applied successfully - following Pascal DoPolicy procedure
      
      // 1. Update the button text to show current level
      this.updateButtonText(superpowerId, policyType, level);
      
      // 2. Update visual feedback immediately (like Pascal InsrtNews)
      this.showPolicyFeedback(superpowerId, country.name, policyType, level);
      
      // 3. Update the modal display with new values
      this.updateModalValues(country.id);
      
      // 4. Update policy button states
      this.updatePolicyButtonStates(country.id);
      
      // 5. Trigger news generation (like Pascal InsrtNews)
      this.triggerNewsGeneration(superpowerId, country.id, policyType, level);
      
    } else {
      console.error('Failed to apply policy');
    }
  }

  private updateButtonText(superpowerId: number, policyType: number, level: number): void {
    const policyButtons = document.querySelectorAll('.policy-btn');
    policyButtons.forEach(button => {
      const target = button as HTMLElement;
      const buttonPolicyType = parseInt(target.dataset.policy || '0');
      const buttonSuperpowerId = parseInt(target.dataset.superpower || '1');
      
      if (buttonPolicyType === policyType && buttonSuperpowerId === superpowerId) {
        // Store original text if not already stored
        if (!target.dataset.originalText) {
          target.dataset.originalText = target.textContent || '';
        }
        
        if (level > 0) {
          target.textContent = `${target.dataset.originalText} (${level})`;
        } else {
          target.textContent = target.dataset.originalText;
        }
      }
    });
  }

  private showPolicyFeedback(superpowerId: number, countryName: string, policyType: number, level: number): void {
    const policyNames = ['Economic Aid', 'Military Aid', 'Destabilization', 'Insurgency Aid', 
                        'Government Intervention', 'Rebel Intervention', 'Pressure', 'Treaty'];
    const superpowerNames = ['', 'USA', 'USSR'];
    
    const policyName = policyNames[policyType] || 'Unknown Policy';
    const superpowerName = superpowerNames[superpowerId] || 'Unknown';
    
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #c0c0c0;
      color: #000000;
      padding: 10px;
      border: 2px solid #000000;
      z-index: 10000;
      font-family: monospace;
      text-align: center;
    `;
    
    if (level > 0) {
      feedback.innerHTML = `
        <div>Policy Activated!</div>
        <div>${superpowerName} ${policyName} Level ${level}</div>
        <div>Target: ${countryName}</div>
      `;
    } else {
      feedback.innerHTML = `
        <div>Policy Deactivated!</div>
        <div>${superpowerName} ${policyName}</div>
        <div>Target: ${countryName}</div>
      `;
    }
    
    document.body.appendChild(feedback);
    
    // Remove after 2 seconds
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 2000);
  }

  private async nextTurn(): Promise<void> {
    if (!this.gameEngine) return;
    
    try {
      await this.gameEngine.processTurn();
      // Turn processed successfully
      
      // Refresh the modal if it's visible
      if (this.isVisible()) {
        const titleElement = document.getElementById('country-detail-title');
        if (titleElement) {
          const titleText = titleElement.textContent || '';
          const countryName = titleText.replace('Closeup: ', '');
          const country = COUNTRY_BY_NAME.get(countryName);
          if (country) {
            this.show(country.id);
          }
        }
      }
      
      // Show feedback
      this.showNextTurnFeedback();
    } catch (error) {
      console.error('Error processing turn:', error);
      this.showNextTurnFeedback('Error processing turn!');
    }
  }

  private saveGame(): void {
    if (!this.gameEngine) return;
    
    const slot = 1; // Default to slot 1
    this.gameEngine.saveGame(slot);
    // Game saved successfully
    
    // Show feedback
    this.showSaveLoadFeedback('Game Saved!', `Slot ${slot}`);
  }

  private loadGame(): void {
    if (!this.gameEngine) return;
    
    const slot = 1; // Default to slot 1
    const success = this.gameEngine.loadGame(slot);
    
    if (success) {
      // Game loaded successfully
      this.showSaveLoadFeedback('Game Loaded!', `Slot ${slot}`);
      
      // Refresh the modal if it's visible
      if (this.isVisible()) {
        const titleElement = document.getElementById('country-detail-title');
        if (titleElement) {
          const titleText = titleElement.textContent || '';
          const countryName = titleText.replace('Closeup: ', '');
          const country = COUNTRY_BY_NAME.get(countryName);
          if (country) {
            this.show(country.id);
          }
        }
      }
    } else {
      this.showSaveLoadFeedback('No Save Found!', `Slot ${slot}`);
    }
  }

  private showSaveLoadFeedback(title: string, message: string): void {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #c0c0c0;
      color: #000000;
      padding: 10px;
      border: 2px solid #000000;
      z-index: 10000;
      font-family: monospace;
      text-align: center;
    `;
    feedback.innerHTML = `
      <div>${title}</div>
      <div>${message}</div>
    `;
    
    document.body.appendChild(feedback);
    
    // Remove after 2 seconds
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 2000);
  }

  private showNextTurnFeedback(message?: string): void {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #c0c0c0;
      color: #000000;
      padding: 10px;
      border: 2px solid #000000;
      z-index: 10000;
      font-family: monospace;
      text-align: center;
    `;
    
    if (message) {
      feedback.innerHTML = `
        <div>${message}</div>
      `;
    } else {
      feedback.innerHTML = `
        <div>Turn Processed!</div>
        <div>Year: ${this.gameState?.year || 'Unknown'}</div>
      `;
    }
    
    document.body.appendChild(feedback);
    
    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 3000);
  }

  private updatePolicyButtonStates(countryId: number): void {
    if (!this.gameEngine) return;

    // Get current policies for this country
    const policies = this.gameEngine.getCountryPolicies(countryId);
    
    // Remove active class from all buttons and restore original text
    const policyButtons = document.querySelectorAll('.policy-btn');
    policyButtons.forEach(btn => {
      btn.classList.remove('active');
      // Restore original text if it was modified
      const originalText = (btn as HTMLElement).dataset.originalText;
      if (originalText) {
        btn.textContent = originalText;
      }
    });
    
    // Add active class to buttons with active policies
    policyButtons.forEach(button => {
      const target = button as HTMLElement;
      const policyType = parseInt(target.dataset.policy || '0');
      const superpowerId = parseInt(target.dataset.superpower || '1');
      
      const policyNames = ['ECON', 'MILTRY', 'DESTABL', 'INSG', 'INT_GOV', 'INT_REB', 'PRESSUR', 'TREATO'];
      const policyName = policyNames[policyType];
      
      if (policyName && policies[policyName]) {
        const policyValue = superpowerId === 1 ? policies[policyName].usa : policies[policyName].ussr;
        if (policyValue > 0) {
          target.classList.add('active');
          // Store original text if not already stored
          if (!target.dataset.originalText) {
            target.dataset.originalText = target.textContent || '';
          }
          // Update button text to show current level
          target.textContent = `${target.dataset.originalText} (${policyValue})`;
        }
      }
    });
  }

  private populateTable(countryId: number): void {
    if (!this.gameState) return;

    const tbody = document.getElementById('country-detail-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Define table rows based on the original game's structure
    const rows = [
      { label: 'Relationship:', getValue: (sp: number) => this.getRelationshipText(sp, countryId) },
      { label: 'Prestige Value:', getValue: (sp: number) => this.getPrestigeValue(sp, countryId) },
      { label: 'Military Aid:', getValue: (sp: number) => this.getMilitaryAid(sp, countryId) },
      { label: 'Insurgency Aid:', getValue: (sp: number) => this.getInsurgencyAid(sp, countryId) },
      { label: 'Intervene-govt:', getValue: (sp: number) => this.getInterveneGovt(sp, countryId) },
      { label: 'Intervene-rebs:', getValue: (sp: number) => this.getInterveneRebs(sp, countryId) },
      { label: 'Economic Aid:', getValue: (sp: number) => this.getEconomicAid(sp, countryId) },
      { label: 'Destabilization:', getValue: (sp: number) => this.getDestabilization(sp, countryId) },
      { label: 'Pressure:', getValue: (sp: number) => this.getPressure(sp, countryId) },
      { label: 'Treaty:', getValue: (sp: number) => this.getTreaty(sp, countryId) },
      { label: 'Finlandization?:', getValue: (sp: number) => this.getFinlandization(sp, countryId) },
      { label: 'Annual Change:', getValue: (sp: number) => this.getAnnualChange(sp, countryId) }
    ];

    rows.forEach(row => {
      const tr = document.createElement('tr');
      
      // Label cell
      const labelCell = document.createElement('td');
      labelCell.className = 'row-label';
      labelCell.textContent = row.label;
      tr.appendChild(labelCell);

      // USA Value cell
      const usaCell = document.createElement('td');
      usaCell.className = 'usa-value';
      usaCell.innerHTML = row.getValue(1);
      tr.appendChild(usaCell);

      // USSR Value cell
      const ussrCell = document.createElement('td');
      ussrCell.className = 'ussr-value';
      ussrCell.innerHTML = row.getValue(2);
      tr.appendChild(ussrCell);

      // Totals cell
      const totalsCell = document.createElement('td');
      totalsCell.className = 'totals';
      totalsCell.innerHTML = this.getTotals(row.label, countryId);
      tr.appendChild(totalsCell);

      tbody.appendChild(tr);
    });
  }

  private populateInfo(countryId: number): void {
    if (!this.gameState) return;

    const infoElement = document.getElementById('country-detail-info');
    if (!infoElement) return;

    const country = COUNTRY_BY_ID.get(countryId);
    if (!country) return;

    // Get additional country information
    const insurgency = this.getInsurgencyStatus(countryId);
    const govtPhilosophy = this.getGovtPhilosophy(countryId);
    const militaryPower = this.getMilitaryPower(countryId);
    const sphereOfInfluence = this.getSphereOfInfluence(countryId);
    const govtStability = this.getGovtStability(countryId);
    const capital = 'Unknown'; // Capital not available in current data structure

    infoElement.innerHTML = `
      <div><span class="label">Insurgency:</span> ${insurgency}</div>
      <div><span class="label">Govt Philosophy:</span> ${govtPhilosophy}</div>
      <div><span class="label">Military Power:</span> ${militaryPower}</div>
      <div><span class="label">Sphere of Influence:</span> ${sphereOfInfluence}</div>
      <div><span class="label">Govt Stability:</span> ${govtStability}</div>
      <div><span class="label">Capital:</span> ${capital}</div>
      <div><span class="label">Insurgency:</span> ${insurgency}</div>
    `;
  }

  // Helper methods to get values for each row
  private getRelationshipText(superpower: number, countryId: number): string {
    if (!this.gameState) return 'unknown';
    
    const affinity = this.gameState.diplomaticAffinity[superpower][countryId] || 0;
    
    if (affinity > 50) return 'friendly';
    if (affinity > 0) return 'warm';
    if (affinity > -50) return 'cold';
    return 'hostile';
  }

  private getPrestigeValue(superpower: number, countryId: number): string {
    if (!this.gameState) return '0';
    
    const affinity = this.gameState.diplomaticAffinity[superpower][countryId] || 0;
    const prestige = this.gameState.prestigeValues[countryId] || 0;
    const value = Math.floor((affinity * prestige) / 1024);
    
    return value.toString();
  }

  private getMilitaryAid(superpower: number, countryId: number): string {
    if (!this.gameState) return '$0 million';
    
    const aid = this.gameState.militaryAid[superpower][countryId] || 0;
    const amount = aid * 20; // Convert to millions
    
    return `$${amount} million`;
  }

  private getInsurgencyAid(superpower: number, countryId: number): string {
    if (!this.gameState) return '$0 million';
    
    const aid = this.gameState.insurgencyAid[superpower][countryId] || 0;
    const amount = aid * 20; // Convert to millions
    
    return `$${amount} million`;
  }

  private getInterveneGovt(superpower: number, countryId: number): string {
    if (!this.gameState) return '0 troops';
    
    const troops = this.gameState.interveneGovt[superpower][countryId] || 0;
    const amount = troops * 1000; // Convert to thousands
    
    return `${amount.toLocaleString()} troops`;
  }

  private getInterveneRebs(superpower: number, countryId: number): string {
    if (!this.gameState) return '0 troops';
    
    const troops = this.gameState.interveneRebs[superpower][countryId] || 0;
    const amount = troops * 1000; // Convert to thousands
    
    return `${amount.toLocaleString()} troops`;
  }

  private getEconomicAid(superpower: number, countryId: number): string {
    if (!this.gameState) return '$0 million';
    
    const aid = this.gameState.economicAid[superpower][countryId] || 0;
    const amount = aid * 20; // Convert to millions
    
    return `$${amount} million`;
  }

  private getDestabilization(superpower: number, countryId: number): string {
    if (!this.gameState) return 'No activity';
    
    const destab = this.gameState.destabilization[superpower][countryId] || 0;
    
    return destab > 0 ? `Level ${destab}` : 'No activity';
  }

  private getPressure(superpower: number, countryId: number): string {
    if (!this.gameState) return 'none';
    
    const pressure = this.gameState.pressure[superpower][countryId] || 0;
    
    return pressure > 0 ? `Level ${pressure}` : 'none';
  }

  private getTreaty(superpower: number, countryId: number): string {
    if (!this.gameState) return 'No relations';
    
    const treaty = this.gameState.treaties[superpower][countryId] || 0;
    
    return treaty > 0 ? `Level ${treaty}` : 'No relations';
  }

  private getFinlandization(superpower: number, countryId: number): string {
    if (!this.gameState) return 'Very Low';
    
    const prob = this.gameState.finlandizationProbability[superpower][countryId] || 0;
    
    if (prob > 100) return 'Very High';
    if (prob > 75) return 'High';
    if (prob > 50) return 'Medium';
    if (prob > 25) return 'Low';
    return 'Very Low';
  }

  private getAnnualChange(superpower: number, countryId: number): string {
    // This would need historical data to calculate properly
    return 'stable';
  }

  private getTotals(label: string, countryId: number): string {
    if (!this.gameState) return '';

    switch (label) {
      case 'Prestige Value:':
        const prestige = this.gameState.prestigeValues[countryId] || 0;
        return `{${Math.floor(prestige / 8)}}`;
      
      case 'Military Aid:':
        const milAid = (this.gameState.militaryAid[1][countryId] || 0) + (this.gameState.militaryAid[2][countryId] || 0);
        return `$${milAid * 20} million`;
      
      case 'Insurgency Aid:':
        const insAid = (this.gameState.insurgencyAid[1][countryId] || 0) + (this.gameState.insurgencyAid[2][countryId] || 0);
        return `$${insAid * 20} million`;
      
      case 'Intervene-govt:':
        const intvGovt = (this.gameState.interveneGovt[1][countryId] || 0) + (this.gameState.interveneGovt[2][countryId] || 0);
        return `${intvGovt * 1000} troops`;
      
      case 'Intervene-rebs:':
        const intvRebs = (this.gameState.interveneRebs[1][countryId] || 0) + (this.gameState.interveneRebs[2][countryId] || 0);
        return `${intvRebs * 1000} troops`;
      
      case 'Economic Aid:':
        const econAid = (this.gameState.economicAid[1][countryId] || 0) + (this.gameState.economicAid[2][countryId] || 0);
        return econAid > 0 ? `$${econAid * 20} million` : 'No activity';
      
      case 'Destabilization:':
        const destab = (this.gameState.destabilization[1][countryId] || 0) + (this.gameState.destabilization[2][countryId] || 0);
        return destab > 0 ? `Level ${destab}` : 'No activity';
      
      default:
        return '';
    }
  }

  // Additional info methods
  private getInsurgencyStatus(countryId: number): string {
    if (!this.gameState) return 'none';
    
    const strength = this.gameState.insurgencyStrength[countryId] || 0;
    const govtStrength = this.gameState.governmentStrength[countryId] || 1;
    const ratio = strength / govtStrength;
    
    if (ratio > 0.8) return 'major guerrilla war -- Insurgency growing';
    if (ratio > 0.5) return 'moderate insurgency';
    if (ratio > 0.2) return 'minor insurgency';
    return 'none';
  }

  private getGovtPhilosophy(countryId: number): string {
    if (!this.gameState) return 'unknown';
    
    const wing = this.gameState.governmentWing[countryId] || 0;
    
    if (wing > 50) return 'rightist';
    if (wing < -50) return 'leftist';
    return 'centrist';
  }

  private getMilitaryPower(countryId: number): string {
    if (!this.gameState) return 'Unknown';
    
    const power = this.gameState.militaryPower[countryId] || 0;
    
    if (power > 1000) return 'Overwhelming';
    if (power > 500) return 'Very Strong';
    if (power > 200) return 'Strong';
    if (power > 100) return 'Moderate';
    if (power > 50) return 'Weak';
    return 'Insignificant';
  }

  private getSphereOfInfluence(countryId: number): string {
    if (!this.gameState) return 'Neutral';
    
    const usaInfluence = ScoreCalculator.calculateInfluence(this.gameState, 1, countryId);
    const ussrInfluence = ScoreCalculator.calculateInfluence(this.gameState, 2, countryId);
    
    const diff = usaInfluence - ussrInfluence;
    
    if (diff > 50) return 'Strongly USA';
    if (diff > 20) return 'Slightly USA';
    if (diff < -50) return 'Strongly USSR';
    if (diff < -20) return 'Slightly USSR';
    return 'Neutral';
  }

  private getGovtStability(countryId: number): string {
    if (!this.gameState) return 'unknown';
    
    const stability = this.gameState.governmentStability[countryId] || 0;
    
    if (stability > 80) return 'very strong -- strengthening fast';
    if (stability > 60) return 'strong -- strengthening';
    if (stability > 40) return 'moderate -- stable';
    if (stability > 20) return 'weak -- weakening';
    return 'very weak -- weakening fast';
  }

  // New methods implementing Pascal UI mechanics
  
  /**
   * Updates modal values immediately after policy application
   * Implements the immediate UI updates from Pascal DoPolicy procedure
   */
  private updateModalValues(countryId: number): void {
    if (!this.gameState) return;

    // Update the table with new values
    this.populateTable(countryId);
    
    // Update additional info
    this.populateInfo(countryId);
    
    // Update prestige values (like Pascal CalcScores)
    this.updatePrestigeDisplay(countryId);
    
    // Update relationship colors (like Pascal FillCntry)
    this.updateRelationshipColors(countryId);
  }

  /**
   * Triggers news generation and display
   * Implements Pascal InsrtNews and Headline procedures
   */
  private triggerNewsGeneration(superpowerId: number, countryId: number, policyType: number, level: number): void {
    if (!this.gameEngine) return;

    // Generate news item (like Pascal InsrtNews)
    const newsItem = this.generateNewsItem(superpowerId, countryId, policyType, level);
    
    if (newsItem) {
      // Display news headline (like Pascal Headline)
      this.displayNewsHeadline(newsItem);
      
      // Update news queue
      this.updateNewsQueue(newsItem);
    }
  }

  /**
   * Updates prestige display based on current diplomatic affinity
   * Implements Pascal CalcScores procedure
   */
  private updatePrestigeDisplay(countryId: number): void {
    if (!this.gameState) return;

    const prestigeCells = document.querySelectorAll('.usa-value, .ussr-value');
    prestigeCells.forEach(cell => {
      const cellElement = cell as HTMLElement;
      if (cellElement.textContent?.includes('Prestige Value')) {
        // Recalculate prestige value
        const superpower = cellElement.classList.contains('usa-value') ? 1 : 2;
        const affinity = this.gameState!.diplomaticAffinity[superpower][countryId] || 0;
        const prestige = this.gameState!.prestigeValues[countryId] || 0;
        const value = Math.floor((affinity * prestige) / 1024);
        
        // Update with color coding
        cellElement.textContent = value.toString();
        cellElement.style.color = this.getPrestigeColor(value);
      }
    });
  }

  /**
   * Updates relationship colors based on diplomatic affinity
   * Implements Pascal FillCntry procedure
   */
  private updateRelationshipColors(countryId: number): void {
    if (!this.gameState) return;

    const relationshipCells = document.querySelectorAll('.usa-value, .ussr-value');
    relationshipCells.forEach(cell => {
      const cellElement = cell as HTMLElement;
      if (cellElement.textContent?.includes('friendly') || 
          cellElement.textContent?.includes('warm') || 
          cellElement.textContent?.includes('cold') || 
          cellElement.textContent?.includes('hostile')) {
        
        const superpower = cellElement.classList.contains('usa-value') ? 1 : 2;
        const affinity = this.gameState!.diplomaticAffinity[superpower][countryId] || 0;
        
        // Update relationship text and color
        const relationshipText = this.getRelationshipText(superpower, countryId);
        cellElement.textContent = relationshipText;
        cellElement.style.color = this.getRelationshipColor(affinity);
      }
    });
  }

  /**
   * Generates news item based on policy application
   * Implements Pascal InsrtNews procedure logic
   */
  private generateNewsItem(superpowerId: number, countryId: number, policyType: number, level: number): any {
    const policyNames = ['Economic Aid', 'Military Aid', 'Destabilization', 'Insurgency Aid', 
                        'Government Intervention', 'Rebel Intervention', 'Pressure', 'Treaty'];
    const superpowerNames = ['', 'USA', 'USSR'];
    
    const policyName = policyNames[policyType] || 'Unknown Policy';
    const superpowerName = superpowerNames[superpowerId] || 'Unknown';
    const country = COUNTRY_BY_ID.get(countryId);
    
    // Calculate news importance (like Pascal InsrtNews)
    const importance = this.calculateNewsImportance(superpowerId, countryId, policyType, level);
    
    return {
      subject: superpowerId,
      verb: policyType,
      object: countryId,
      oldValue: 0, // Previous level
      newValue: level,
      host: countryId,
      isCrisis: false,
      importance: importance,
      headline: `${superpowerName} applies ${policyName} Level ${level} to ${country?.name || 'Unknown'}`,
      superpowerName,
      policyName,
      countryName: country?.name || 'Unknown'
    };
  }

  /**
   * Displays news headline with visual effects
   * Implements Pascal Headline procedure
   */
  private displayNewsHeadline(newsItem: any): void {
    // Create news display element
    const newsDisplay = document.createElement('div');
    newsDisplay.className = 'news-headline';
    newsDisplay.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #c0c0c0;
      color: #000000;
      padding: 15px;
      border: 3px solid #000000;
      z-index: 10000;
      font-family: monospace;
      font-size: 14px;
      text-align: center;
      max-width: 80%;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    
    newsDisplay.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">📰 NEWS FLASH</div>
      <div>${newsItem.headline}</div>
      <div style="font-size: 12px; margin-top: 5px; color: #666;">
        Importance: ${newsItem.importance}/100
      </div>
    `;
    
    document.body.appendChild(newsDisplay);
    
    // Animate in
    newsDisplay.style.opacity = '0';
    newsDisplay.style.transform = 'translateX(-50%) translateY(-20px)';
    
    setTimeout(() => {
      newsDisplay.style.transition = 'all 0.3s ease';
      newsDisplay.style.opacity = '1';
      newsDisplay.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
      newsDisplay.style.transition = 'all 0.3s ease';
      newsDisplay.style.opacity = '0';
      newsDisplay.style.transform = 'translateX(-50%) translateY(-20px)';
      
      setTimeout(() => {
        if (document.body.contains(newsDisplay)) {
          document.body.removeChild(newsDisplay);
        }
      }, 300);
    }, 4000);
  }

  /**
   * Updates news queue (simplified version of Pascal news system)
   */
  private updateNewsQueue(newsItem: any): void {
    // This would integrate with the game's news system
    console.log('📰 News added to queue:', newsItem.headline);
  }

  /**
   * Calculates news importance based on policy type and values
   * Implements Pascal InsrtNews importance calculation
   */
  private calculateNewsImportance(superpowerId: number, countryId: number, policyType: number, level: number): number {
    if (!this.gameState) return 1;
    
    const prestige = this.gameState.prestigeValues[countryId] || 0;
    const affinity = this.gameState.diplomaticAffinity[superpowerId][countryId] || 0;
    
    // Base importance by policy type (from Pascal code)
    const baseImportance = this.getBaseImportance(policyType);
    
    // Calculate final importance (simplified version of Pascal formula)
    const importance = Math.min(100, Math.max(1, baseImportance * (1 + Math.abs(level)) * Math.sqrt(prestige / 100)));
    
    return Math.floor(importance);
  }

  /**
   * Gets base importance for policy type (from Pascal InsrtNews)
   */
  private getBaseImportance(policyType: number): number {
    const baseImportances = [3, 5, 4, 5, 10, 10, 2, 5]; // From Pascal code
    return baseImportances[policyType] || 1;
  }

  /**
   * Gets color for prestige value display
   */
  private getPrestigeColor(value: number): string {
    if (value > 50) return '#00ff00'; // Green for high prestige
    if (value > 20) return '#ffff00'; // Yellow for medium prestige
    if (value > 0) return '#ff8800';  // Orange for low prestige
    return '#ff0000'; // Red for negative prestige
  }

  /**
   * Gets color for relationship display
   */
  private getRelationshipColor(affinity: number): string {
    if (affinity > 50) return '#00ff00'; // Green for friendly
    if (affinity > 0) return '#ffff00';  // Yellow for warm
    if (affinity > -50) return '#ff8800'; // Orange for cold
    return '#ff0000'; // Red for hostile
  }
}
