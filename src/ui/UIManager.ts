import { GameEngine } from '../game/GameEngine.js';
import { CountryListRenderer } from './CountryListRenderer.js';
import { CountryDetailModal } from './CountryDetailModal.js';
import { PolicyType } from '../game/GameState.js';
import { COUNTRY_BY_ID } from '../data/countries.js';
import { Crisis, CrisisResponse } from '../game/CrisisManager.js';

// UI Manager class
export class UIManager {
  private gameEngine: GameEngine;
  private countryListRenderer!: CountryListRenderer;
  private countryDetailModal!: CountryDetailModal;
  
  // UI Elements
  private currentYearElement!: HTMLElement;
  private gameStatusElement!: HTMLElement;
  private selectedCountryElement!: HTMLElement;
  private usaScoreElement!: HTMLElement;
  private ussrScoreElement!: HTMLElement;
  private nastinessElement!: HTMLElement;
  private newsContentElement!: HTMLElement;
  private levelElement!: HTMLElement;
  private turnPhaseElement!: HTMLElement;
  
  // Buttons
  private nextTurnButton!: HTMLButtonElement;
  private policyButton!: HTMLButtonElement;
  private closeupButton!: HTMLButtonElement;
  private backgroundButton!: HTMLButtonElement;
  private historyButton!: HTMLButtonElement;
  private saveButton!: HTMLButtonElement;
  private loadButton!: HTMLButtonElement;
  
  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
    
    // Wait for DOM to be ready before initializing UI components
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeUI();
      });
    } else {
      this.initializeUI();
    }
  }
  
  private initializeUI(): void {
    try {
      this.countryDetailModal = new CountryDetailModal();
      this.countryDetailModal.setGameEngine(this.gameEngine);
      this.countryListRenderer = new CountryListRenderer(document.getElementById('game-canvas') as HTMLElement, this.countryDetailModal, this);
      
      this.initializeElements();
      this.setupEventListeners();
      this.updateUI();
    } catch (error) {
      console.error('Error initializing UI:', error);
      throw error;
    }
  }
  
  private initializeElements(): void {
    // Get UI elements that exist in the HTML with error checking
    const gameCanvas = document.getElementById('game-canvas');
    if (!gameCanvas) {
      throw new Error('game-canvas element not found');
    }
    
    this.currentYearElement = document.getElementById('year-display')!;
    this.usaScoreElement = document.getElementById('usa-score')!;
    this.ussrScoreElement = document.getElementById('ussr-score')!;
    this.nastinessElement = document.getElementById('nastiness-display')!;
    this.selectedCountryElement = document.getElementById('selected-country')!;
    this.levelElement = document.getElementById('level-display')!;
    this.turnPhaseElement = document.getElementById('turn-phase')!;
    
    // Check if essential elements exist
    if (!this.currentYearElement || !this.usaScoreElement || !this.ussrScoreElement) {
      console.warn('Some status bar elements not found, but continuing...');
    }
    
    // Elements that don't exist in the HTML - set to null
    this.gameStatusElement = null as any;
    this.newsContentElement = null as any;
    
    // Les boutons ne sont plus dans l'interface originale
    this.nextTurnButton = null as any;
    this.policyButton = null as any;
    this.closeupButton = null as any;
    this.backgroundButton = null as any;
    this.historyButton = null as any;
    this.saveButton = null as any;
    this.loadButton = null as any;
  }
  
  private setupEventListeners(): void {
    // Country selection is now handled by CountryListRenderer
    
    // Menu event listeners
    this.setupMenuListeners();
    
    // Les boutons n'existent plus dans l'interface originale
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
          this.nextTurn();
          break;
        case 'p':
        case 'P':
          this.showPolicyDialog();
          break;
        case 'c':
        case 'C':
          this.showCloseup();
          break;
        case 'b':
        case 'B':
          this.showBackground();
          break;
        case 'h':
        case 'H':
          this.showHistory();
          break;
        case 'Escape':
          // Close any open dialogs
          this.closeDialogs();
          break;
        case 's':
        case 'S':
          if (event.ctrlKey) {
            event.preventDefault();
            this.saveGame();
          }
          break;
        case 'l':
        case 'L':
          if (event.ctrlKey) {
            event.preventDefault();
            this.loadGame();
          }
          break;
      }
    });
  }

  private setupMenuListeners(): void {
    // Apple menu
    const appleMenu = document.querySelector('.menu-item:nth-child(1)');
    appleMenu?.addEventListener('click', () => {
      this.showAppleMenu();
    });

    // Game menu
    const gameMenu = document.querySelector('.menu-item:nth-child(2)');
    gameMenu?.addEventListener('click', () => {
      this.showGameMenu();
    });

    // Political menu
    const politicalMenu = document.querySelector('.menu-item:nth-child(3)');
    politicalMenu?.addEventListener('click', () => {
      this.showPoliticalMenu();
    });

    // Relations menu
    const relationsMenu = document.querySelector('.menu-item:nth-child(4)');
    relationsMenu?.addEventListener('click', () => {
      this.showRelationsMenu();
    });

    // Policy menu
    const policyMenu = document.querySelector('.menu-item:nth-child(5)');
    policyMenu?.addEventListener('click', () => {
      this.showPolicyMenu();
    });

    // Events menu
    const eventsMenu = document.querySelector('.menu-item:nth-child(6)');
    eventsMenu?.addEventListener('click', () => {
      this.showEventsMenu();
    });

    // Briefing menu
    const briefingMenu = document.querySelector('.menu-item:nth-child(7)');
    briefingMenu?.addEventListener('click', () => {
      this.showBriefingMenu();
    });

    // Debug menu
    const debugMenu = document.querySelector('.menu-item:nth-child(8)');
    debugMenu?.addEventListener('click', () => {
      this.showDebugMenu();
    });

    // Close button
    const closeButton = document.querySelector('.menu-close');
    closeButton?.addEventListener('click', () => {
      this.closeApplication();
    });

    // Details button
    const detailsButton = document.getElementById('details-button');
    detailsButton?.addEventListener('click', () => {
      this.openCountryDetails();
    });
  }
  
  public selectCountry(countryId: number): void {
    // Update game state with selected country
    const state = this.gameEngine.getGameState();
    state.hitCountry = countryId;
    this.updateUI();
    this.renderCountryList();
  }
  
  private async nextTurn(): Promise<void> {
    try {
      await this.gameEngine.processTurn();
      this.updateUI();
      this.renderCountryList();
    } catch (error) {
      console.error('Error processing turn:', error);
    }
  }
  
  private showPolicyDialog(): void {
    const state = this.gameEngine.getGameState();
    if (state.hitCountry === 0) return;
    
    // Create policy dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #111;
      border: 2px solid #666;
      padding: 20px;
      z-index: 1000;
      color: white;
      font-family: monospace;
    `;
    
    const country = COUNTRY_BY_ID.get(state.hitCountry);
    if (!country) return;
    
    dialog.innerHTML = `
      <h3>Policy for ${country.name}</h3>
      <div style="margin: 10px 0;">
        <label>Economic Aid: <input type="range" id="econ-aid" min="0" max="5" value="0"></label>
        <span id="econ-value">0</span>
        <div style="font-size: 0.8em; color: #888; margin-top: 2px;">Economic assistance to strengthen the country</div>
      </div>
      <div style="margin: 10px 0;">
        <label>Military Aid: <input type="range" id="mil-aid" min="0" max="5" value="0"></label>
        <span id="mil-value">0</span>
        <div style="font-size: 0.8em; color: #888; margin-top: 2px;">Military equipment and training support</div>
      </div>
      <div style="margin: 10px 0;">
        <label>Insurgency Aid: <input type="range" id="insg-aid" min="0" max="5" value="0"></label>
        <span id="insg-value">0</span>
        <div style="font-size: 0.8em; color: #888; margin-top: 2px;">Support for insurgent groups</div>
      </div>
      <div style="margin: 10px 0;">
        <label>Government Intervention: <input type="range" id="gov-intv" min="0" max="5" value="0"></label>
        <span id="gov-value">0</span>
        <div style="font-size: 0.8em; color: #888; margin-top: 2px;">Direct military intervention to support government</div>
      </div>
      <div style="margin: 10px 0;">
        <label>Rebel Intervention: <input type="range" id="reb-intv" min="0" max="5" value="0"></label>
        <span id="reb-value">0</span>
        <div style="font-size: 0.8em; color: #888; margin-top: 2px;">Direct military intervention to support rebels</div>
      </div>
      <div style="margin: 10px 0;">
        <label>Pressure: <input type="range" id="pressure" min="0" max="5" value="0"></label>
        <span id="press-value">0</span>
        <div style="font-size: 0.8em; color: #888; margin-top: 2px;">Diplomatic pressure and sanctions</div>
      </div>
      <div style="margin: 10px 0;">
        <label>Treaty: <input type="range" id="treaty" min="0" max="5" value="0"></label>
        <span id="treaty-value">0</span>
        <div style="font-size: 0.8em; color: #888; margin-top: 2px;">Formal diplomatic agreements and treaties</div>
      </div>
      <div style="margin: 20px 0;">
        <button id="apply-policy" style="margin-right: 10px;">Apply Policy</button>
        <button id="cancel-policy">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Setup slider event listeners
    const sliders = dialog.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        // Map slider IDs to value span IDs correctly
        let valueSpanId = '';
        switch (target.id) {
          case 'econ-aid': valueSpanId = 'econ-value'; break;
          case 'mil-aid': valueSpanId = 'mil-value'; break;
          case 'insg-aid': valueSpanId = 'insg-value'; break;
          case 'gov-intv': valueSpanId = 'gov-value'; break;
          case 'reb-intv': valueSpanId = 'reb-value'; break;
          case 'pressure': valueSpanId = 'pressure-value'; break;
          case 'treaty': valueSpanId = 'treaty-value'; break;
        }
        
        const valueSpan = dialog.querySelector(`#${valueSpanId}`) as HTMLElement;
        if (valueSpan) {
          valueSpan.textContent = target.value;
        }
      });
    });
    
    // Setup button event listeners
    dialog.querySelector('#apply-policy')?.addEventListener('click', () => {
      this.applyPolicy(dialog, state.hitCountry);
      document.body.removeChild(dialog);
    });
    
    dialog.querySelector('#cancel-policy')?.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }
  
  private applyPolicy(dialog: HTMLElement, countryId: number): void {
    const state = this.gameEngine.getGameState();
    const humanPlayer = state.humanPlayer;
    
    // Get policy values
    const econAid = parseInt((dialog.querySelector('#econ-aid') as HTMLInputElement).value);
    const milAid = parseInt((dialog.querySelector('#mil-aid') as HTMLInputElement).value);
    const insgAid = parseInt((dialog.querySelector('#insg-aid') as HTMLInputElement).value);
    const govIntv = parseInt((dialog.querySelector('#gov-intv') as HTMLInputElement).value);
    const rebIntv = parseInt((dialog.querySelector('#reb-intv') as HTMLInputElement).value);
    const pressure = parseInt((dialog.querySelector('#pressure') as HTMLInputElement).value);
    const treaty = parseInt((dialog.querySelector('#treaty') as HTMLInputElement).value);
    
    // Apply policies
    if (econAid > 0) {
      this.gameEngine.applyPolicy(humanPlayer, countryId, PolicyType.ECON, econAid);
    }
    if (milAid > 0) {
      this.gameEngine.applyPolicy(humanPlayer, countryId, PolicyType.MILTRY, milAid);
    }
    if (insgAid > 0) {
      this.gameEngine.applyPolicy(humanPlayer, countryId, PolicyType.INSG, insgAid);
    }
    if (govIntv > 0) {
      this.gameEngine.applyPolicy(humanPlayer, countryId, PolicyType.INT_GOV, govIntv);
    }
    if (rebIntv > 0) {
      this.gameEngine.applyPolicy(humanPlayer, countryId, PolicyType.INT_REB, rebIntv);
    }
    if (pressure > 0) {
      this.gameEngine.applyPolicy(humanPlayer, countryId, PolicyType.PRESSUR, pressure);
    }
    if (treaty > 0) {
      this.gameEngine.applyPolicy(humanPlayer, countryId, PolicyType.TREATO, treaty);
    }
    
    this.updateUI();
    this.renderCountryList();
    
    // Crisis handling removed - simplified for now
  }
  
  private showCloseup(): void {
    const state = this.gameEngine.getGameState();
    if (state.hitCountry === 0) return;
    
    const country = COUNTRY_BY_ID.get(state.hitCountry);
    if (!country) return;
    
    // Create closeup dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #111;
      border: 2px solid #666;
      padding: 20px;
      z-index: 1000;
      color: white;
      font-family: monospace;
      max-width: 500px;
    `;
    
    dialog.innerHTML = `
      <h3>${country.name} - Closeup</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>Population: ${country.population.toLocaleString()}</div>
        <div>GNP: $${country.gnp.toLocaleString()}</div>
        <div>Military Spending: $${country.militarySpending.toLocaleString()}</div>
        <div>Military Men: ${country.militaryMen.toLocaleString()}</div>
        <div>Government Wing: ${country.governmentWing}</div>
        <div>Insurgency Wing: ${country.insurgencyWing}</div>
        <div>Government Strength: ${country.governmentStrength}</div>
        <div>Insurgency Strength: ${country.insurgencyStrength}</div>
        <div>Government Growth: ${country.governmentGrowth}%</div>
        <div>Population Growth: ${country.populationGrowth}%</div>
        <div>Government Stability: ${country.governmentStability}</div>
        <div>Investment Fraction: ${country.investmentFraction}%</div>
        <div>Government Popularity: ${country.governmentPopularity}</div>
        <div>Deaths: ${country.deaths.toLocaleString()}</div>
        <div>Maturity: ${country.maturity}</div>
        <div>Prestige Value: ${country.prestigeValue}</div>
      </div>
      <div style="margin: 20px 0;">
        <button id="close-closeup">Close</button>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    dialog.querySelector('#close-closeup')?.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }
  
  private showBackground(): void {
    const state = this.gameEngine.getGameState();
    if (state.hitCountry === 0) return;
    
    const country = COUNTRY_BY_ID.get(state.hitCountry);
    if (!country) return;
    
    // Create background dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #111;
      border: 2px solid #666;
      padding: 20px;
      z-index: 1000;
      color: white;
      font-family: monospace;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    dialog.innerHTML = `
      <h3>${country.name} - Background</h3>
      <div style="line-height: 1.6;">
        <p>This is a placeholder for background information about ${country.name}.</p>
        <p>In the original game, this would contain historical context, political situation, 
        and other relevant information about the country's role in the Cold War.</p>
        <p>For now, this is just a demonstration of the UI structure.</p>
      </div>
      <div style="margin: 20px 0;">
        <button id="close-background">Close</button>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    dialog.querySelector('#close-background')?.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }
  
  private showHistory(): void {
    const state = this.gameEngine.getGameState();
    
    // Create history dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #111;
      border: 2px solid #666;
      padding: 20px;
      z-index: 1000;
      color: white;
      font-family: monospace;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    dialog.innerHTML = `
      <h3>Game History</h3>
      <div style="line-height: 1.6;">
        <p>Current Year: ${state.year}</p>
        <p>USA Score: ${state.usaScore}</p>
        <p>USSR Score: ${state.ussrScore}</p>
        <p>Nastiness Level: ${state.nastiness}</p>
        <p>News Items: ${state.newsQueue.length}</p>
      </div>
      <div style="margin: 20px 0;">
        <button id="close-history">Close</button>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    dialog.querySelector('#close-history')?.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }
  
  private closeDialogs(): void {
    // Close any open dialogs by removing them from the DOM
    const dialogs = document.querySelectorAll('div[style*="position: fixed"]');
    dialogs.forEach(dialog => {
      if (dialog.parentNode) {
        dialog.parentNode.removeChild(dialog);
      }
    });
  }
  
  private saveGame(): void {
    const state = this.gameEngine.getGameState();
    const saveData = JSON.stringify(state, null, 2);
    localStorage.setItem('balance-of-power-save', saveData);
    
    // Show confirmation
    alert('Game saved successfully!');
  }
  
  private loadGame(): void {
    const saveData = localStorage.getItem('balance-of-power-save');
    if (saveData) {
      try {
        const state = JSON.parse(saveData);
        this.gameEngine = new GameEngine();
        this.gameEngine.loadGame(0); // Load from slot 0
        this.countryListRenderer.setGameState(state);
        this.updateUI();
        this.renderCountryList();
        alert('Game loaded successfully!');
      } catch (error) {
        alert('Error loading game: ' + error);
      }
    } else {
      alert('No saved game found!');
    }
  }
  
  private updateUI(): void {
    const state = this.gameEngine.getGameState();
    const status = this.gameEngine.getGameStatus();
    
    // Update country detail modal with current game state
    this.countryDetailModal.setGameState(state);
    
    // Update status elements
    if (this.currentYearElement) {
      this.currentYearElement.textContent = state.year.toString();
    }
    if (this.gameStatusElement) {
      this.gameStatusElement.textContent = state.winFlag ? 'Game Over' : 'Ready';
    }
    if (this.usaScoreElement) {
      this.usaScoreElement.textContent = state.usaScore.toString();
    }
    if (this.ussrScoreElement) {
      this.ussrScoreElement.textContent = state.ussrScore.toString();
    }
    if (this.nastinessElement) {
      this.nastinessElement.textContent = state.nastiness.toString();
      
      // Color code nastiness based on tension level
      if (state.nastiness >= 127) {
        this.nastinessElement.style.color = '#ff0000'; // Red - Nuclear war
        this.nastinessElement.style.fontWeight = 'bold';
      } else if (state.nastiness >= 100) {
        this.nastinessElement.style.color = '#ff8800'; // Orange - Critical tension
        this.nastinessElement.style.fontWeight = 'bold';
      } else if (state.nastiness >= 80) {
        this.nastinessElement.style.color = '#ffaa00'; // Yellow - High tension
      } else {
        this.nastinessElement.style.color = '#000000'; // Black - Normal
        this.nastinessElement.style.fontWeight = 'normal';
      }
    }
    if (this.levelElement) {
      this.levelElement.textContent = state.level.toString();
    }
    
    // Update turn phase with color coding
    if (this.turnPhaseElement) {
      this.turnPhaseElement.textContent = status.turnPhase;
      
      // Color code based on phase
      if (status.turnPhase === 'NUCLEAR WAR!') {
        this.turnPhaseElement.style.color = '#ff0000';
        this.turnPhaseElement.style.fontWeight = 'bold';
        this.turnPhaseElement.style.backgroundColor = '#ffcccc';
      } else if (status.turnPhase === 'Critical Tension') {
        this.turnPhaseElement.style.color = '#ff8800';
        this.turnPhaseElement.style.fontWeight = 'bold';
        this.turnPhaseElement.style.backgroundColor = '#ffe6cc';
      } else if (status.turnPhase === 'Crisis Active') {
        this.turnPhaseElement.style.color = '#ffaa00';
        this.turnPhaseElement.style.fontWeight = 'bold';
        this.turnPhaseElement.style.backgroundColor = '#fff2cc';
      } else if (status.turnPhase === 'Processing Turn...') {
        this.turnPhaseElement.style.color = '#0066cc';
        this.turnPhaseElement.style.fontWeight = 'bold';
        this.turnPhaseElement.style.backgroundColor = '#cce6ff';
      } else {
        this.turnPhaseElement.style.color = '#000000';
        this.turnPhaseElement.style.fontWeight = 'normal';
        this.turnPhaseElement.style.backgroundColor = 'transparent';
      }
    }
    
    // Update selected country
    if (this.selectedCountryElement) {
      if (state.hitCountry > 0) {
        const country = COUNTRY_BY_ID.get(state.hitCountry);
        this.selectedCountryElement.textContent = country ? country.name : 'Unknown';
      } else {
        this.selectedCountryElement.textContent = 'None';
      }
    }
    
    // Update news
    this.updateNews();
  }
  
  private updateNews(): void {
    // L'élément news n'existe plus dans l'interface originale
    if (!this.newsContentElement) return;
    
    const currentNews = this.gameEngine.getRecentNews();
    
    if (currentNews && currentNews.length > 0) {
      const latestNews = currentNews[0];
      const newsHTML = `
        <div class="news-item">
          <div class="news-title">${latestNews.headline}</div>
          <div>Level: ${latestNews.oldValue} → ${latestNews.newValue}</div>
          <div>Importance: ${latestNews.newsWorth}</div>
        </div>
      `;
      
      this.newsContentElement.innerHTML = newsHTML;
    } else {
      this.newsContentElement.innerHTML = `
        <div class="news-item">
          <div class="news-title">Welcome to Balance of Power</div>
          <div>Click on a country to select it and view its information.</div>
        </div>
      `;
    }
  }
  
  private renderCountryList(): void {
    this.countryListRenderer.setGameState(this.gameEngine.getGameState());
    this.countryListRenderer.render();
  }
  
  // Crisis dialog
  private showCrisisDialog(crisis: Crisis): void {
    const dialog = document.createElement('div');
    dialog.id = 'crisis-dialog';
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #8B0000;
      border: 3px solid #FF0000;
      padding: 20px;
      z-index: 2000;
      color: white;
      font-family: monospace;
      min-width: 400px;
      max-width: 600px;
    `;

    const headline = `Crisis in ${crisis.subject} involving ${crisis.object}`;
    const responseOptions = [
      { id: 'ignore', name: 'Ignore Crisis', description: 'Do nothing and hope it resolves itself' },
      { id: 'diplomatic', name: 'Diplomatic Solution', description: 'Attempt to resolve through diplomacy' },
      { id: 'military', name: 'Military Action', description: 'Use military force to resolve the crisis' }
    ];

    dialog.innerHTML = `
      <h2 style="color: #FFD700; text-align: center; margin-bottom: 20px;">🚨 INTERNATIONAL CRISIS 🚨</h2>
      <div style="margin-bottom: 15px;">
        <strong>${headline}</strong>
      </div>
      <div style="margin-bottom: 15px;">
        <div>Crisis Level: ${crisis.crisisLevel}/9</div>
        <div>Prestige at Risk: ${crisis.prestigeAtRisk}</div>
        <div>USA Interest: ${crisis.usaInterest}/7</div>
        <div>USSR Interest: ${crisis.ussrInterest}/7</div>
      </div>
      <div style="margin-bottom: 20px;">
        <strong>How do you respond?</strong>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${responseOptions.map((response, index) => `
          <button id="crisis-response-${index}" style="
            padding: 10px;
            background: #444;
            color: white;
            border: 1px solid #666;
            cursor: pointer;
            font-family: monospace;
          ">${response.description}</button>
        `).join('')}
      </div>
    `;

    document.body.appendChild(dialog);

    // Add event listeners for response buttons
    responseOptions.forEach((response, index) => {
      const button = dialog.querySelector(`#crisis-response-${index}`) as HTMLButtonElement;
      button.addEventListener('click', () => {
        this.handleCrisisResponse(crisis, response);
        document.body.removeChild(dialog);
      });
    });
  }

  private handleCrisisResponse(crisis: Crisis, response: any): void {
    // Simple crisis handling - just show a message
    let message = '';
    if (response.id === 'ignore') {
      message = 'Crisis ignored. Situation may worsen.';
    } else if (response.id === 'diplomatic') {
      message = 'Diplomatic solution attempted. Crisis resolved peacefully.';
    } else if (response.id === 'military') {
      message = 'Military action taken. Crisis resolved with force.';
    }
    
    alert(message);
    this.updateUI();
    this.renderCountryList();
  }

  // Menu methods - exact implementation from Pascal source
  private showAppleMenu(): void {
    this.showAboutDialog();
  }

  private showAboutDialog(): void {
    // Implementation of DoAboutBOP2 from Pascal source
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ffffff;
      border: 2px solid #000000;
      padding: 20px;
      z-index: 2000;
      font-family: monospace;
      text-align: center;
      min-width: 300px;
    `;
    
    dialog.innerHTML = `
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Balance of Power</div>
      <div style="font-size: 14px; margin-bottom: 5px;">by Chris Crawford</div>
      <div style="font-size: 12px; margin-bottom: 5px;">Copyright (c) 1988 Chris Crawford</div>
      <div style="font-size: 12px; margin-bottom: 5px;">All Rights Reserved</div>
      <div style="font-size: 12px; margin-bottom: 20px;">Version 2.08</div>
      <button onclick="this.parentElement.remove()" style="padding: 5px 15px; background: #c0c0c0; border: 1px solid #000000; cursor: pointer; font-family: monospace;">
        OK
      </button>
    `;
    
    document.body.appendChild(dialog);
  }

  private showGameMenu(): void {
    this.showMenuDialog('Game Menu', [
      'New Game',
      'Load Game',
      'Save Game',
      'Exit'
    ], (selection) => {
      switch (selection) {
        case 'New Game':
          this.gameEngine.initializeNewGame();
          this.updateUI();
          break;
        case 'Load Game':
          this.loadGame();
          break;
        case 'Save Game':
          this.saveGame();
          break;
        case 'Exit':
          this.closeApplication();
          break;
      }
    });
  }

  private showPoliticalMenu(): void {
    this.showMenuDialog('Political Menu', [
      'Clear Map',
      'Spheres',
      'Major Events',
      'Military Power',
      'Turmoil',
      'Support',
      'USA Finlandization',
      'USSR Finlandization',
      'Wars'
    ], (selection) => {
      switch (selection) {
        case 'Clear Map':
          this.reviseMap(0); // ClrMap
          break;
        case 'Spheres':
          this.reviseMap(1); // Spheres
          break;
        case 'Major Events':
          this.reviseMap(2); // MEvents
          break;
        case 'Military Power':
          this.reviseMap(3); // MPower
          break;
        case 'Turmoil':
          this.reviseMap(4); // Turmoil
          break;
        case 'Support':
          this.reviseMap(5); // Support
          break;
        case 'USA Finlandization':
          this.reviseMap(6); // USAFinl
          break;
        case 'USSR Finlandization':
          this.reviseMap(7); // USSRFinl
          break;
        case 'Wars':
          this.reviseMap(8); // Wars
          break;
      }
    });
  }

  private showRelationsMenu(): void {
    // Exact implementation from Pascal source - ReviseMap with relation modes
    this.showMenuDialog('Relations Menu', [
      'Diplomatic Relations',  // WhoDipRel = 9
      'Military Aid',          // WhoMilAid = 10
      'Insurgency Aid',        // WhoInsg = 11
      'Government Intervention', // WhoIntG = 12
      'Rebel Intervention',    // WhoIntR = 13
      'Economic Aid',          // WhoEcon = 14
      'Destabilization',       // WhoDest = 15
      'Treaties',              // WhoTret = 16
      'Pressure',              // WhoPres = 17
      'Trade',                 // WhoTrade = 18
      'At War'                 // WhoAtWar = 19
    ], (selection) => {
      switch (selection) {
        case 'Diplomatic Relations':
          this.reviseMap(9); // WhoDipRel
          break;
        case 'Military Aid':
          this.reviseMap(10); // WhoMilAid
          break;
        case 'Insurgency Aid':
          this.reviseMap(11); // WhoInsg
          break;
        case 'Government Intervention':
          this.reviseMap(12); // WhoIntG
          break;
        case 'Rebel Intervention':
          this.reviseMap(13); // WhoIntR
          break;
        case 'Economic Aid':
          this.reviseMap(14); // WhoEcon
          break;
        case 'Destabilization':
          this.reviseMap(15); // WhoDest
          break;
        case 'Treaties':
          this.reviseMap(16); // WhoTret
          break;
        case 'Pressure':
          this.reviseMap(17); // WhoPres
          break;
        case 'Trade':
          this.reviseMap(18); // WhoTrade
          break;
        case 'At War':
          this.reviseMap(19); // WhoAtWar
          break;
      }
    });
  }

  private showPolicyMenu(): void {
    // Exact implementation from Pascal source - SetPolicy(theItem)
    this.setPolicy();
  }

  private showEventsMenu(): void {
    // Exact implementation from Pascal source - GiveInfo(theItem)
    this.showMenuDialog('Events Menu', [
      'Recent Events',
      'Major Events', 
      'Crisis Events',
      'Random Events'
    ], (selection) => {
      switch (selection) {
        case 'Recent Events':
          this.giveInfo(1);
          break;
        case 'Major Events':
          this.giveInfo(2);
          break;
        case 'Crisis Events':
          this.giveInfo(3);
          break;
        case 'Random Events':
          this.giveInfo(4);
          break;
      }
    });
  }

  private showBriefingMenu(): void {
    // Exact implementation from Pascal source - DoCloseUp, DoBackGd, DoHistory
    this.showMenuDialog('Briefing Menu', [
      'Closeup',    // CloseUp = 1
      'Background', // BackGrnd = 2
      'History'     // History = 3
    ], (selection) => {
      switch (selection) {
        case 'Closeup':
          this.doCloseUp();
          break;
        case 'Background':
          this.doBackGd();
          break;
        case 'History':
          this.doHistory();
          break;
      }
    });
  }

  private showMenuDialog(title: string, options: string[], callback: (selection: string) => void): void {
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #c0c0c0;
      border: 2px solid #000000;
      padding: 10px;
      z-index: 2000;
      font-family: monospace;
      font-size: 12px;
      min-width: 200px;
    `;

    dialog.innerHTML = `
      <div style="background: #000000; color: #ffffff; padding: 5px; margin: -10px -10px 10px -10px; text-align: center; font-weight: bold;">
        ${title}
      </div>
      ${options.map(option => `
        <div class="menu-option" style="padding: 5px; cursor: pointer; border: 1px solid #808080; margin-bottom: 2px; background: #e0e0e0;">
          ${option}
        </div>
      `).join('')}
      <div style="text-align: center; margin-top: 10px;">
        <button onclick="this.parentElement.parentElement.remove()" style="padding: 5px 10px; background: #c0c0c0; border: 1px solid #000000; cursor: pointer; font-family: monospace;">
          Cancel
        </button>
      </div>
    `;

    // Add click handlers for options
    const optionsElements = dialog.querySelectorAll('.menu-option');
    optionsElements.forEach((element, index) => {
      element.addEventListener('click', () => {
        callback(options[index]);
        dialog.remove();
      });
      element.addEventListener('mouseenter', () => {
        (element as HTMLElement).style.backgroundColor = '#ffffff';
      });
      element.addEventListener('mouseleave', () => {
        (element as HTMLElement).style.backgroundColor = '#e0e0e0';
      });
    });

    document.body.appendChild(dialog);
  }

  private closeApplication(): void {
    if (confirm('Are you sure you want to exit the game?')) {
      window.close();
    }
  }

  private openCountryDetails(): void {
    // Open country details modal for the selected country
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    
    if (hitCountry > 0) {
      this.countryDetailModal.show(hitCountry);
    } else {
      alert('Please select a country first to view its details.');
    }
  }

  // Placeholder methods for authentic menu actions
  private showClearMapDialog(): void {
    alert('Clear Map - Coming soon!');
  }

  private showSpheresDialog(): void {
    alert('Spheres - Coming soon!');
  }

  private showMajorEventsDialog(): void {
    alert('Major Events - Coming soon!');
  }

  private showMilitaryPowerDialog(): void {
    alert('Military Power - Coming soon!');
  }

  private showTurmoilDialog(): void {
    alert('Turmoil - Coming soon!');
  }

  private showSupportDialog(): void {
    alert('Support - Coming soon!');
  }

  private showUSAFinlandizationDialog(): void {
    alert('USA Finlandization - Coming soon!');
  }

  private showUSSRFinlandizationDialog(): void {
    alert('USSR Finlandization - Coming soon!');
  }

  private showWarsDialog(): void {
    alert('Wars - Coming soon!');
  }

  private showDiplomaticRelationsDialog(): void {
    alert('Diplomatic Relations - Coming soon!');
  }

  private showMilitaryAidDialog(): void {
    alert('Military Aid - Coming soon!');
  }

  private showInsurgencyAidDialog(): void {
    alert('Insurgency Aid - Coming soon!');
  }

  private showGovernmentInterventionDialog(): void {
    alert('Government Intervention - Coming soon!');
  }

  private showRebelInterventionDialog(): void {
    alert('Rebel Intervention - Coming soon!');
  }

  private showEconomicAidDialog(): void {
    alert('Economic Aid - Coming soon!');
  }

  private showDestabilizationDialog(): void {
    alert('Destabilization - Coming soon!');
  }

  private showTreatiesDialog(): void {
    alert('Treaties - Coming soon!');
  }

  private showPressureDialog(): void {
    alert('Pressure - Coming soon!');
  }

  private showTradeDialog(): void {
    alert('Trade - Coming soon!');
  }

  private showAtWarDialog(): void {
    alert('At War - Coming soon!');
  }

  private showRecentEventsDialog(): void {
    alert('Recent Events - Coming soon!');
  }

  private showCrisisEventsDialog(): void {
    alert('Crisis Events - Coming soon!');
  }

  private showRandomEventsDialog(): void {
    alert('Random Events - Coming soon!');
  }

  private showDebugMenu(): void {
    // Debug menu - only available in debug builds (like in Pascal source)
    this.showMenuDialog('Debug Menu', [
      'Debug 1',
      'Debug 2', 
      'History 2'
    ], (selection) => {
      switch (selection) {
        case 'Debug 1':
          this.showDebug1Dialog();
          break;
        case 'Debug 2':
          this.showDebug2Dialog();
          break;
        case 'History 2':
          this.showHistory2Dialog();
          break;
      }
    });
  }

  private showDebug1Dialog(): void {
    alert('Debug 1 - Coming soon!');
  }

  private showDebug2Dialog(): void {
    alert('Debug 2 - Coming soon!');
  }

  private showHistory2Dialog(): void {
    alert('History 2 - Coming soon!');
  }

  // Exact implementations from Pascal source code
  private reviseMap(mode: number): void {
    // Implementation of ReviseMap from StdRoutines.p
    // This function changes the map display based on the mode
    console.log(`ReviseMap called with mode: ${mode}`);
    
    // Update the country list colors based on the mode using real game data
    this.updateCountryColors(mode);
    
    // Update the map title based on mode
    this.updateMapTitle(mode);
    
    // Update the status bar to show current mode
    this.updateStatusBar(mode);
  }

  private updateCountryColors(mode: number): void {
    // Implementation of the color logic from ReviseMap using real game data
    const gameState = this.gameEngine.getGameState() as any;
    
    // Get all country buttons
    const countryButtons = document.querySelectorAll('.country-button');
    
    countryButtons.forEach((button, index) => {
      const countryId = index + 1; // Countries are 1-indexed
      let color = '#ffffff'; // Default white
      
      switch (mode) {
        case 0: // Clear Map
          color = '#ffffff';
          break;
        case 1: // Spheres - Use real sphere calculation
          const sphere = this.calculateCountrySphere(countryId, gameState);
          color = this.getSphereColor(sphere);
          break;
        case 2: // Major Events - Use real event flags
          const events = this.getCountryEvents(countryId);
          color = this.getEventColor(events);
          break;
        case 3: // Military Power - Use real military power
          const militaryPower = this.calculateMilitaryPower(countryId, gameState);
          color = this.getPowerColor(militaryPower);
          break;
        case 4: // Turmoil - Use real turmoil calculation
          const turmoil = this.calculateTurmoilLevel(countryId, gameState);
          color = this.getTurmoilColor(turmoil);
          break;
        case 5: // Support - Use real government popularity
          const support = this.getGovernmentSupport(countryId, gameState);
          color = this.getSupportColor(support);
          break;
        case 6: // USA Finlandization - Use real finlandization probability
          const usaFinl = this.getFinlandizationProb(1, countryId, gameState);
          color = this.getFinlandizationColor(usaFinl);
          break;
        case 7: // USSR Finlandization - Use real finlandization probability
          const ussrFinl = this.getFinlandizationProb(2, countryId, gameState);
          color = this.getFinlandizationColor(ussrFinl);
          break;
        case 8: // Wars - Use real war status
          const warStatus = this.getWarStatus(countryId);
          color = this.getWarColor(warStatus);
          break;
        case 9: // Diplomatic Relations - Use real diplomatic relations
          const dipRel = this.getDiplomaticRelation(countryId);
          color = this.getDiplomaticColor(dipRel);
          break;
        case 10: // Military Aid - Use real military aid data
          const milAid = this.getMilitaryAid(countryId);
          color = this.getAidColor(milAid);
          break;
        case 11: // Insurgency Aid - Use real insurgency aid data
          const insgAid = this.getInsurgencyAid(countryId);
          color = this.getAidColor(insgAid);
          break;
        case 12: // Government Intervention - Use real intervention data
          const govIntv = this.getGovernmentIntervention(countryId);
          color = this.getInterventionColor(govIntv);
          break;
        case 13: // Rebel Intervention - Use real intervention data
          const rebIntv = this.getRebelIntervention(countryId);
          color = this.getInterventionColor(rebIntv);
          break;
        case 14: // Economic Aid - Use real economic aid data
          const econAid = this.getEconomicAid(countryId);
          color = this.getAidColor(econAid);
          break;
        case 15: // Destabilization - Use real destabilization data
          const destab = this.getDestabilization(countryId);
          color = this.getDestabilizationColor(destab);
          break;
        case 16: // Treaties - Use real treaty data
          const treaties = this.getTreaties(countryId);
          color = this.getTreatyColor(treaties);
          break;
        case 17: // Pressure - Use real pressure data
          const pressure = this.getPressure(countryId);
          color = this.getPressureColor(pressure);
          break;
        case 18: // Trade - Use real trade data
          const trade = this.getTrade(countryId);
          color = this.getTradeColor(trade);
          break;
        case 19: // At War - Use real war status
          const atWar = this.getAtWarStatus(countryId);
          color = this.getWarColor(atWar);
          break;
      }
      
      (button as HTMLElement).style.backgroundColor = color;
    });
  }

  private updateMapTitle(mode: number): void {
    const titles = [
      'Clear Map',
      'Spheres of Influence',
      'Major Events',
      'Military Power',
      'Turmoil',
      'Government Support',
      'USA Finlandization',
      'USSR Finlandization',
      'Wars',
      'Diplomatic Relations',
      'Military Aid',
      'Insurgency Aid',
      'Government Intervention',
      'Rebel Intervention',
      'Economic Aid',
      'Destabilization',
      'Treaties',
      'Pressure',
      'Trade',
      'At War'
    ];
    
    const titleElement = document.querySelector('#game-title');
    if (titleElement && titles[mode]) {
      titleElement.textContent = `BALANCE OF POWER - ${titles[mode]}`;
    }
  }

  private updateStatusBar(mode: number): void {
    // Update the status bar to show current map mode
    const statusElement = document.querySelector('#status-bar');
    if (statusElement) {
      const titles = [
        'Clear Map',
        'Spheres of Influence',
        'Major Events',
        'Military Power',
        'Turmoil',
        'Government Support',
        'USA Finlandization',
        'USSR Finlandization',
        'Wars',
        'Diplomatic Relations',
        'Military Aid',
        'Insurgency Aid',
        'Government Intervention',
        'Rebel Intervention',
        'Economic Aid',
        'Destabilization',
        'Treaties',
        'Pressure',
        'Trade',
        'At War'
      ];
      
      if (titles[mode]) {
        // Add a small indicator to show current map mode
        let modeIndicator = statusElement.querySelector('.map-mode');
        if (!modeIndicator) {
          modeIndicator = document.createElement('div');
          modeIndicator.className = 'map-mode';
          (modeIndicator as HTMLElement).style.cssText = `
            position: absolute;
            top: 5px;
            right: 10px;
            background: #000;
            color: #fff;
            padding: 2px 6px;
            font-size: 10px;
            border: 1px solid #fff;
          `;
          statusElement.appendChild(modeIndicator);
        }
        modeIndicator.textContent = `Map: ${titles[mode]}`;
      }
    }
  }

  // Helper methods for ReviseMap implementation using real game data
  private calculateCountrySphere(countryId: number, gameState: any): number {
    // Calculate sphere of influence based on diplomatic relations and policies
    if (countryId <= 2) return countryId; // USA = 1, USSR = 2
    
    // Calculate influence from both superpowers
    const usaInfluence = this.calculateInfluence(1, countryId, gameState);
    const ussrInfluence = this.calculateInfluence(2, countryId, gameState);
    
    if (usaInfluence > ussrInfluence + 50) return 1; // USA sphere
    if (ussrInfluence > usaInfluence + 50) return 2; // USSR sphere
    return 0; // Neutral
  }

  private calculateInfluence(superpower: number, country: number, gameState: any): number {
    // Calculate total influence using the formula from GAME_RULES.md
    let influence = 0;
    
    // Treaty influence
    if (gameState.treaty && gameState.treaty[superpower] && gameState.treaty[superpower][country]) {
      influence += gameState.treaty[superpower][country];
    }
    
    // Economic aid influence
    if (gameState.econAid && gameState.econAid[superpower] && gameState.econAid[superpower][country]) {
      influence += gameState.econAid[superpower][country];
    }
    
    // Military aid influence
    if (gameState.miltAid && gameState.miltAid[superpower] && gameState.miltAid[superpower][country]) {
      influence += gameState.miltAid[superpower][country];
    }
    
    // Government intervention influence (positive)
    if (gameState.intvGovt && gameState.intvGovt[superpower] && gameState.intvGovt[superpower][country]) {
      influence += 2 * gameState.intvGovt[superpower][country];
    }
    
    // Destabilization influence (negative)
    if (gameState.destab && gameState.destab[superpower] && gameState.destab[superpower][country]) {
      influence -= 2 * gameState.destab[superpower][country];
    }
    
    // Insurgency aid influence (negative)
    if (gameState.insgAid && gameState.insgAid[superpower] && gameState.insgAid[superpower][country]) {
      influence -= 2 * gameState.insgAid[superpower][country];
    }
    
    // Rebel intervention influence (negative)
    if (gameState.intvRebl && gameState.intvRebl[superpower] && gameState.intvRebl[superpower][country]) {
      influence -= 4 * gameState.intvRebl[superpower][country];
    }
    
    return influence;
  }

  private getSphereColor(sphere: number): string {
    switch (sphere) {
      case 1: return '#0000ff'; // USA blue
      case 2: return '#ff0000'; // USSR red
      default: return '#ffffff'; // Neutral white
    }
  }

  private getCountryEvents(countryId: number): number {
    const gameState = this.gameEngine.getGameState();
    if (gameState.finlFlag && gameState.finlFlag[countryId]) return 1; // Finlandization
    if (gameState.coupFlag && gameState.coupFlag[countryId]) return 2; // Coup
    if (gameState.rebWinFlag && gameState.rebWinFlag[countryId]) return 3; // Revolution
    return 0; // No events
  }

  private getEventColor(events: number): string {
    switch (events) {
      case 1: return '#ffff00'; // Finlandization - yellow
      case 2: return '#ff8000'; // Coup - orange
      case 3: return '#ff0000'; // Revolution - red
      default: return '#ffffff'; // No events - white
    }
  }

  private calculateMilitaryPower(countryId: number, gameState: any): number {
    // Calculate military power using real game data
    if (gameState.milPowr && gameState.milPowr[countryId]) {
      return gameState.milPowr[countryId];
    }
    return 0;
  }

  private getPowerColor(power: number): string {
    if (power > 1000) return '#ff0000'; // High power - red
    if (power > 500) return '#ff8000'; // Medium power - orange
    if (power > 100) return '#ffff00'; // Low power - yellow
    return '#ffffff'; // Very low power - white
  }

  private calculateTurmoilLevel(countryId: number, gameState: any): number {
    // Calculate turmoil level using real game data
    if (gameState.strngRat && gameState.strngRat[countryId]) {
      return gameState.strngRat[countryId];
    }
    return 0;
  }

  private getTurmoilColor(turmoil: number): string {
    if (turmoil > 100) return '#ff0000'; // High turmoil - red
    if (turmoil > 50) return '#ff8000'; // Medium turmoil - orange
    if (turmoil > 20) return '#ffff00'; // Low turmoil - yellow
    return '#ffffff'; // Stable - white
  }

  private getGovernmentSupport(countryId: number, gameState: any): number {
    // Get government popularity using real game data
    if (gameState.gPopular && gameState.gPopular[countryId]) {
      return gameState.gPopular[countryId];
    }
    return 0;
  }

  private getSupportColor(support: number): string {
    if (support > 8) return '#00ff00'; // High support - green
    if (support > 6) return '#80ff00'; // Medium support - light green
    if (support > 4) return '#ffff00'; // Low support - yellow
    return '#ff0000'; // Very low support - red
  }

  private getFinlandizationProb(superpower: number, countryId: number, gameState: any): number {
    // Get finlandization probability using real game data
    if (gameState.finlProb && gameState.finlProb[superpower] && gameState.finlProb[superpower][countryId]) {
      return gameState.finlProb[superpower][countryId];
    }
    return 0;
  }

  private getFinlandizationColor(prob: number): string {
    if (prob > 100) return '#ff0000'; // High probability - red
    if (prob > 80) return '#ff8000'; // Medium probability - orange
    if (prob > 60) return '#ffff00'; // Low probability - yellow
    return '#ffffff'; // Very low probability - white
  }

  private getWarStatus(countryId: number): boolean {
    const gameState = this.gameEngine.getGameState();
    // Check if country is at war with any other country
    for (let i = 1; i <= 80; i++) {
      if (gameState.dipAff && gameState.dipAff[countryId] && gameState.dipAff[countryId][i] === -127) {
        return true;
      }
    }
    return false;
  }

  private getWarColor(warStatus: boolean): string {
    return warStatus ? '#ff0000' : '#ffffff'; // Red if at war, white if not
  }

  private getDiplomaticRelation(countryId: number): number {
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    if (hitCountry > 0 && gameState.dipAff && gameState.dipAff[hitCountry]) {
      return gameState.dipAff[hitCountry][countryId] || 0;
    }
    return 0;
  }

  private getDiplomaticColor(relation: number): string {
    if (relation > 50) return '#00ff00'; // Friendly - green
    if (relation > 0) return '#80ff00'; // Neutral-positive - light green
    if (relation > -50) return '#ffff00'; // Neutral-negative - yellow
    return '#ff0000'; // Hostile - red
  }

  private getMilitaryAid(countryId: number): number {
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    if (hitCountry > 0 && gameState.miltAid && gameState.miltAid[hitCountry]) {
      return gameState.miltAid[hitCountry][countryId] || 0;
    }
    return 0;
  }

  private getInsurgencyAid(countryId: number): number {
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    if (hitCountry > 0 && gameState.insgAid && gameState.insgAid[hitCountry]) {
      return gameState.insgAid[hitCountry][countryId] || 0;
    }
    return 0;
  }

  private getGovernmentIntervention(countryId: number): number {
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    if (hitCountry > 0 && gameState.intvGovt && gameState.intvGovt[hitCountry]) {
      return gameState.intvGovt[hitCountry][countryId] || 0;
    }
    return 0;
  }

  private getRebelIntervention(countryId: number): number {
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    if (hitCountry > 0 && gameState.intvRebl && gameState.intvRebl[hitCountry]) {
      return gameState.intvRebl[hitCountry][countryId] || 0;
    }
    return 0;
  }

  private getEconomicAid(countryId: number): number {
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    if (hitCountry > 0 && gameState.econAid && gameState.econAid[hitCountry]) {
      return gameState.econAid[hitCountry][countryId] || 0;
    }
    return 0;
  }

  private getDestabilization(countryId: number): number {
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    if (hitCountry > 0 && gameState.destab && gameState.destab[hitCountry]) {
      return gameState.destab[hitCountry][countryId] || 0;
    }
    return 0;
  }

  private getTreaties(countryId: number): number {
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    if (hitCountry > 0 && gameState.treaty && gameState.treaty[hitCountry]) {
      return gameState.treaty[hitCountry][countryId] || 0;
    }
    return 0;
  }

  private getPressure(countryId: number): number {
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    if (hitCountry > 0 && gameState.pressure && gameState.pressure[hitCountry]) {
      return gameState.pressure[hitCountry][countryId] || 0;
    }
    return 0;
  }

  private getTrade(countryId: number): number {
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    if (hitCountry > 0 && gameState.trade && gameState.trade[hitCountry]) {
      return gameState.trade[hitCountry][countryId] || 0;
    }
    return 0;
  }

  private getAtWarStatus(countryId: number): boolean {
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    if (hitCountry > 0 && gameState.dipAff && gameState.dipAff[hitCountry]) {
      return gameState.dipAff[hitCountry][countryId] === -127;
    }
    return false;
  }

  private getAidColor(aid: number): string {
    if (aid > 50) return '#00ff00'; // High aid - green
    if (aid > 20) return '#80ff00'; // Medium aid - light green
    if (aid > 0) return '#ffff00'; // Low aid - yellow
    return '#ffffff'; // No aid - white
  }

  private getInterventionColor(intervention: number): string {
    if (intervention > 50) return '#ff0000'; // High intervention - red
    if (intervention > 20) return '#ff8000'; // Medium intervention - orange
    if (intervention > 0) return '#ffff00'; // Low intervention - yellow
    return '#ffffff'; // No intervention - white
  }

  private getDestabilizationColor(destab: number): string {
    if (destab > 50) return '#ff0000'; // High destabilization - red
    if (destab > 20) return '#ff8000'; // Medium destabilization - orange
    if (destab > 0) return '#ffff00'; // Low destabilization - yellow
    return '#ffffff'; // No destabilization - white
  }

  private getTreatyColor(treaty: number): string {
    if (treaty > 50) return '#00ff00'; // Strong treaty - green
    if (treaty > 20) return '#80ff00'; // Medium treaty - light green
    if (treaty > 0) return '#ffff00'; // Weak treaty - yellow
    return '#ffffff'; // No treaty - white
  }

  private getPressureColor(pressure: number): string {
    if (pressure > 50) return '#ff0000'; // High pressure - red
    if (pressure > 20) return '#ff8000'; // Medium pressure - orange
    if (pressure > 0) return '#ffff00'; // Low pressure - yellow
    return '#ffffff'; // No pressure - white
  }

  private getTradeColor(trade: number): string {
    if (trade > 50) return '#00ff00'; // High trade - green
    if (trade > 20) return '#80ff00'; // Medium trade - light green
    if (trade > 0) return '#ffff00'; // Low trade - yellow
    return '#ffffff'; // No trade - white
  }

  // Exact implementations of Pascal source functions
  private setPolicy(): void {
    // Implementation of SetPolicy from Pascal source
    // This opens the policy dialog for the selected country
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    
    if (hitCountry > 0) {
      // Open the country detail modal (which contains policy controls)
      this.countryDetailModal.show(hitCountry);
      
      // Update the status bar to show selected country
      this.updateSelectedCountryStatus(hitCountry);
    } else {
      alert('Please select a country first to set policies.');
    }
  }

  private updateSelectedCountryStatus(countryId: number): void {
    // Update the status bar to show the selected country
    const selectedElement = document.querySelector('#selected-country');
    if (selectedElement) {
      const countryName = this.getCountryName(countryId);
      selectedElement.textContent = countryName;
    }
  }

  private giveInfo(infoType: number): void {
    // Implementation of GiveInfo from Pascal source
    // This shows information dialogs based on the info type
    switch (infoType) {
      case 1: // Recent Events
        this.showRecentEventsInfo();
        break;
      case 2: // Major Events
        this.showMajorEventsInfo();
        break;
      case 3: // Crisis Events
        this.showCrisisEventsInfo();
        break;
      case 4: // Random Events
        this.showRandomEventsInfo();
        break;
    }
  }

  private showRecentEventsInfo(): void {
    const gameState = this.gameEngine.getGameState() as any;
    const recentNews = this.gameEngine.getRecentNews();
    
    let message = 'Recent Events:\n\n';
    if (recentNews && recentNews.length > 0) {
      recentNews.slice(0, 5).forEach((news: any, index) => {
        message += `${index + 1}. ${news.headline}\n`;
        if (news.description) {
          message += `   ${news.description}\n`;
        }
        message += '\n';
      });
    } else {
      message += 'No recent events to report.';
    }
    
    // Show in a proper dialog instead of alert
    this.showInfoDialog('Recent Events', message);
  }

  private showInfoDialog(title: string, content: string): void {
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #c0c0c0;
      border: 2px solid #000000;
      padding: 20px;
      max-width: 600px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 1000;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-line;
    `;
    
    dialog.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 10px; text-align: center;">${title}</div>
      <div style="margin-bottom: 15px;">${content}</div>
      <button onclick="this.parentElement.remove()" style="padding: 5px 15px; background: #c0c0c0; border: 1px solid #000000; cursor: pointer; font-family: monospace;">
        OK
      </button>
    `;
    
    document.body.appendChild(dialog);
  }

  private showMajorEventsInfo(): void {
    const gameState = this.gameEngine.getGameState() as any;
    let message = 'Major Events:\n\n';
    
    // Check for major events in the game state using real data
    let hasEvents = false;
    
    if (gameState.finlFlag) {
      for (let i = 1; i <= 80; i++) {
        if (gameState.finlFlag[i]) {
          message += `• Finlandization in ${this.getCountryName(i)}\n`;
          hasEvents = true;
        }
      }
    }
    
    if (gameState.coupFlag) {
      for (let i = 1; i <= 80; i++) {
        if (gameState.coupFlag[i]) {
          message += `• Coup d'état in ${this.getCountryName(i)}\n`;
          hasEvents = true;
        }
      }
    }
    
    if (gameState.rebWinFlag) {
      for (let i = 1; i <= 80; i++) {
        if (gameState.rebWinFlag[i]) {
          message += `• Revolution in ${this.getCountryName(i)}\n`;
          hasEvents = true;
        }
      }
    }
    
    if (!hasEvents) {
      message += 'No major events currently active.';
    }
    
    this.showInfoDialog('Major Events', message);
  }

  private showCrisisEventsInfo(): void {
    const gameState = this.gameEngine.getGameState() as any;
    let message = 'Crisis Events:\n\n';
    
    // Check for crisis conditions using real game data
    let hasCrisis = false;
    
    if (gameState.nastiness > 100) {
      message += `• High tension level: ${gameState.nastiness}\n`;
      hasCrisis = true;
    }
    
    if (gameState.nastiness > 120) {
      message += `• CRITICAL TENSION! Nuclear war risk!\n`;
      hasCrisis = true;
    }
    
    // Check for superpower conflicts using real diplomatic relations
    if (gameState.dipAff && gameState.dipAff[1] && gameState.dipAff[1][2] < -100) {
      message += `• USA-USSR relations severely strained\n`;
      hasCrisis = true;
    }
    
    // Check for active wars
    if (gameState.dipAff) {
      let warCount = 0;
      for (let i = 1; i <= 80; i++) {
        for (let j = 1; j <= 80; j++) {
          if (gameState.dipAff[i] && gameState.dipAff[i][j] === -127) {
            warCount++;
          }
        }
      }
      if (warCount > 0) {
        message += `• ${warCount} active wars detected\n`;
        hasCrisis = true;
      }
    }
    
    if (!hasCrisis) {
      message += 'No crisis events currently active.';
    }
    
    this.showInfoDialog('Crisis Events', message);
  }

  private showRandomEventsInfo(): void {
    const gameState = this.gameEngine.getGameState();
    let message = 'Random Events:\n\n';
    
    // Show random events that might occur
    message += 'Possible random events:\n';
    message += '• Economic crises\n';
    message += '• Natural disasters\n';
    message += '• Political scandals\n';
    message += '• Military accidents\n';
    message += '• Diplomatic breakthroughs\n\n';
    message += 'These events occur randomly during gameplay.';
    
    alert(message);
  }

  private doCloseUp(): void {
    // Implementation of DoCloseUp from Pascal source
    // This opens the country detail window
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    
    if (hitCountry > 0) {
      this.countryDetailModal.show(hitCountry);
      
      // Update the status bar to show selected country
      this.updateSelectedCountryStatus(hitCountry);
    } else {
      alert('Please select a country first to view its details.');
    }
  }

  private doBackGd(): void {
    // Implementation of DoBackGd from Pascal source
    // This shows background information about the selected country
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    
    if (hitCountry > 0) {
      this.showBackgroundInfo(hitCountry);
    } else {
      alert('Please select a country first to view its background.');
    }
  }

  private showBackgroundInfo(countryId: number): void {
    const countryName = this.getCountryName(countryId);
    const gameState = this.gameEngine.getGameState() as any;
    
    // Create background dialog with interactive map visualization
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #c0c0c0;
      border: 3px solid #000000;
      padding: 15px;
      z-index: 2000;
      width: 85%;
      height: 85%;
      max-width: 900px;
      max-height: 700px;
      overflow: auto;
      font-family: 'Courier New', monospace;
      font-size: 11px;
    `;
    
    dialog.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid #000000; padding-bottom: 10px;">
        <h3 style="margin: 0; color: #000000; font-size: 14px; font-weight: bold;">Background: ${countryName}</h3>
        <button id="close-background" style="padding: 4px 8px; background: #ffffff; border: 2px solid #000000; cursor: pointer; font-family: 'Courier New', monospace; font-size: 12px;">×</button>
      </div>
      
      <div style="display: flex; gap: 15px; height: calc(100% - 80px);">
        <!-- Map Visualization Area -->
        <div style="flex: 1; background: #ffffff; border: 2px solid #000000; padding: 15px;">
          <div style="margin-bottom: 15px; border-bottom: 1px solid #000000; padding-bottom: 10px;">
            <div style="margin-bottom: 8px;">
              <label style="margin-right: 15px; font-weight: bold;">Resource:</label>
              <select id="resource-select" style="margin-right: 15px; padding: 2px; border: 1px solid #000000; font-family: 'Courier New', monospace;">
                <option value="gnp">GNP</option>
                <option value="military">Military Spending</option>
                <option value="population">Population</option>
                <option value="consumption">Consumption Spending</option>
                <option value="investment">Investment Spending</option>
                <option value="military-personnel">Military Personnel</option>
              </select>
            </div>
            <div>
              <label style="margin-right: 15px; font-weight: bold;">Per:</label>
              <select id="per-select" style="padding: 2px; border: 1px solid #000000; font-family: 'Courier New', monospace;">
                <option value="absolute">Absolute</option>
                <option value="capita">Per Capita</option>
                <option value="gnp">Per GNP</option>
              </select>
            </div>
          </div>
          
          <div id="map-visualization" style="height: 350px; background: #f8f8f8; border: 2px solid #000000; padding: 15px; overflow: auto; position: relative;">
            <div style="text-align: center; margin-top: 120px; color: #000000; font-size: 12px;">
              <div style="font-weight: bold; margin-bottom: 10px;">Map visualization for ${countryName}</div>
              <div>Resource: <span id="current-resource" style="font-weight: bold;">GNP</span></div>
              <div>Mode: <span id="current-mode" style="font-weight: bold;">Absolute</span></div>
              <div style="margin-top: 15px; font-size: 14px; color: #000000;">
                Value: <span id="current-value" style="font-weight: bold;">0</span> <span id="current-unit">million</span>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 15px; font-size: 10px; border-top: 1px solid #000000; padding-top: 10px;">
            <div style="font-weight: bold; margin-bottom: 8px;">Legend:</div>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 12px; height: 12px; background: #ffffff; border: 1px solid #000000;"></div>
                <span>No data</span>
              </div>
              <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 12px; height: 12px; background: #e0e0e0; border: 1px solid #000000;"></div>
                <span>Low value</span>
              </div>
              <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 12px; height: 12px; background: #a0a0a0; border: 1px solid #000000;"></div>
                <span>Medium value</span>
              </div>
              <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 12px; height: 12px; background: #606060; border: 1px solid #000000;"></div>
                <span>High value</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Country Details -->
        <div style="width: 320px; background: #ffffff; border: 2px solid #000000; padding: 15px;">
          <h4 style="margin: 0 0 15px 0; font-size: 13px; font-weight: bold; border-bottom: 1px solid #000000; padding-bottom: 8px;">${countryName} Details</h4>
          <div id="country-details" style="line-height: 1.6;">
            <div style="margin-bottom: 8px;"><strong>GNP:</strong> $${this.formatNumber(gameState.gnp?.[countryId] || 0)} million</div>
            <div style="margin-bottom: 8px;"><strong>Population:</strong> ${this.formatNumber(gameState.popln?.[countryId] || 0)} million</div>
            <div style="margin-bottom: 8px;"><strong>Military Spending:</strong> $${this.formatNumber(gameState.miltSpnd?.[countryId] || 0)} million</div>
            <div style="margin-bottom: 8px;"><strong>Consumption Spending:</strong> $${this.formatNumber(gameState.consSpnd?.[countryId] || 0)} million</div>
            <div style="margin-bottom: 8px;"><strong>Investment Spending:</strong> $${this.formatNumber(gameState.invtSpnd?.[countryId] || 0)} million</div>
            <div style="margin-bottom: 8px;"><strong>Military Personnel:</strong> ${this.formatNumber(gameState.milMen?.[countryId] || 0)} thousand</div>
            <div style="margin-bottom: 8px;"><strong>Government Popularity:</strong> ${gameState.gPopular?.[countryId] || 0}/10</div>
            <div style="margin-bottom: 8px;"><strong>Military Power:</strong> ${this.getMilitaryPowerText(gameState.milPowr?.[countryId] || 0)}</div>
            <div style="margin-bottom: 8px;"><strong>Government Philosophy:</strong> ${this.getGovernmentPhilosophy(gameState.govtWing?.[countryId] || 0)}</div>
            <div style="margin-bottom: 8px;"><strong>Government Stability:</strong> ${this.getGovernmentStability(gameState.strngRat?.[countryId] || 0)}</div>
            <div style="margin-bottom: 8px;"><strong>Sphere of Influence:</strong> ${this.getSphereOfInfluence(countryId, gameState)}</div>
            <div style="margin-bottom: 8px;"><strong>Capital:</strong> ${this.getCapitalName(countryId)}</div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Add event listeners
    dialog.querySelector('#close-background')?.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    const resourceSelect = dialog.querySelector('#resource-select') as HTMLSelectElement;
    const perSelect = dialog.querySelector('#per-select') as HTMLSelectElement;
    const currentResource = dialog.querySelector('#current-resource') as HTMLElement;
    const currentMode = dialog.querySelector('#current-mode') as HTMLElement;
    const currentValue = dialog.querySelector('#current-value') as HTMLElement;
    const currentUnit = dialog.querySelector('#current-unit') as HTMLElement;
    
    const updateVisualization = () => {
      const resource = resourceSelect.value;
      const per = perSelect.value;
      
      currentResource.textContent = resourceSelect.options[resourceSelect.selectedIndex].text;
      currentMode.textContent = perSelect.options[perSelect.selectedIndex].text;
      
      let value = 0;
      let unit = '';
      
      switch (resource) {
        case 'gnp':
          value = gameState.gnp?.[countryId] || 0;
          unit = 'million';
          break;
        case 'military':
          value = gameState.miltSpnd?.[countryId] || 0;
          unit = 'million';
          break;
        case 'population':
          value = gameState.popln?.[countryId] || 0;
          unit = 'million';
          break;
        case 'consumption':
          value = gameState.consSpnd?.[countryId] || 0;
          unit = 'million';
          break;
        case 'investment':
          value = gameState.invtSpnd?.[countryId] || 0;
          unit = 'million';
          break;
        case 'military-personnel':
          value = gameState.milMen?.[countryId] || 0;
          unit = 'thousand';
          break;
      }
      
      if (per === 'capita' && gameState.popln?.[countryId] > 0) {
        value = Math.round(value / gameState.popln[countryId]);
        unit = `per capita`;
      } else if (per === 'gnp' && gameState.gnp?.[countryId] > 0) {
        value = Math.round((value / gameState.gnp[countryId]) * 100);
        unit = `% of GNP`;
      }
      
      currentValue.textContent = this.formatNumber(value);
      currentUnit.textContent = unit;
    };
    
    resourceSelect.addEventListener('change', updateVisualization);
    perSelect.addEventListener('change', updateVisualization);
    
    // Initialize with current values
    updateVisualization();
  }

  private doHistory(): void {
    // Implementation of DoHistory from Pascal source
    // This shows the history of the selected country
    const gameState = this.gameEngine.getGameState();
    const hitCountry = gameState.hitCountry || 0;
    
    if (hitCountry > 0) {
      this.showCountryHistory(hitCountry);
    } else {
      alert('Please select a country first to view its history.');
    }
  }

  private showCountryHistory(countryId: number): void {
    const countryName = this.getCountryName(countryId);
    const gameState = this.gameEngine.getGameState() as any;
    
    // Create history dialog with interactive charts
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #c0c0c0;
      border: 2px solid #000000;
      padding: 20px;
      z-index: 2000;
      width: 90%;
      height: 90%;
      max-width: 1000px;
      max-height: 700px;
      overflow: auto;
      font-family: 'Courier New', monospace;
      font-size: 11px;
    `;
    
    dialog.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #000000;">History of ${countryName}</h3>
        <button id="close-history" style="padding: 5px 10px; background: #ffffff; border: 1px solid #000000; cursor: pointer;">×</button>
      </div>
      
      <div style="margin-bottom: 10px; font-size: 10px; color: #666;">
        [WHO: dark: USSR | light: USA] [WHAT: gray: anti-govt | solid: pro-govt] [parallel lines: major event]
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; height: calc(100% - 80px);">
        <!-- Left Column: Military & Intervention -->
        <div style="background: #ffffff; border: 1px solid #000000; padding: 10px;">
          <h4 style="margin: 0 0 10px 0; text-align: center;">Military & Intervention</h4>
          <div id="military-chart" style="height: 200px; background: #f8f8f8; border: 1px solid #000000; position: relative;">
            <div style="position: absolute; top: 10px; left: 10px; font-size: 9px;">
              <div>Military Aid (USA/USSR)</div>
              <div>Government Intervention</div>
              <div>Rebel Intervention</div>
            </div>
            <div id="military-graph" style="position: absolute; bottom: 10px; left: 10px; right: 10px; height: 150px; background: #ffffff; border: 1px solid #000000;"></div>
          </div>
        </div>
        
        <!-- Center Column: Diplomatic & Economic -->
        <div style="background: #ffffff; border: 1px solid #000000; padding: 10px;">
          <h4 style="margin: 0 0 10px 0; text-align: center;">Diplomatic & Economic</h4>
          <div id="diplomatic-chart" style="height: 200px; background: #f8f8f8; border: 1px solid #000000; position: relative;">
            <div style="position: absolute; top: 10px; left: 10px; font-size: 9px;">
              <div>Diplomatic Relations</div>
              <div>Economic Aid</div>
              <div>Destabilization</div>
            </div>
            <div id="diplomatic-graph" style="position: absolute; bottom: 10px; left: 10px; right: 10px; height: 150px; background: #ffffff; border: 1px solid #000000;"></div>
          </div>
        </div>
        
        <!-- Right Column: Political & Influence -->
        <div style="background: #ffffff; border: 1px solid #000000; padding: 10px;">
          <h4 style="margin: 0 0 10px 0; text-align: center;">Political & Influence</h4>
          <div id="political-chart" style="height: 200px; background: #f8f8f8; border: 1px solid #000000; position: relative;">
            <div style="position: absolute; top: 10px; left: 10px; font-size: 9px;">
              <div>Government Popularity</div>
              <div>Finlandization</div>
              <div>Treaties & Pressure</div>
            </div>
            <div id="political-graph" style="position: absolute; bottom: 10px; left: 10px; right: 10px; height: 150px; background: #ffffff; border: 1px solid #000000;"></div>
          </div>
        </div>
      </div>
      
      <!-- Major Events Timeline -->
      <div style="margin-top: 15px; background: #ffffff; border: 1px solid #000000; padding: 10px;">
        <h4 style="margin: 0 0 10px 0;">Major Events Timeline</h4>
        <div id="events-timeline" style="height: 80px; background: #f8f8f8; border: 1px solid #000000; padding: 5px; overflow-y: auto;">
          <div style="font-size: 9px;">
            <div>1989: Game Start</div>
            <div>1990: ${this.getMajorEventText(countryId, gameState, 1990)}</div>
            <div>1991: ${this.getMajorEventText(countryId, gameState, 1991)}</div>
            <div>1992: ${this.getMajorEventText(countryId, gameState, 1992)}</div>
            <div>1993: ${this.getMajorEventText(countryId, gameState, 1993)}</div>
            <div>1994: ${this.getMajorEventText(countryId, gameState, 1994)}</div>
            <div>1995: ${this.getMajorEventText(countryId, gameState, 1995)}</div>
            <div>1996: ${this.getMajorEventText(countryId, gameState, 1996)}</div>
            <div>1997: ${this.getMajorEventText(countryId, gameState, 1997)}</div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Add event listeners
    dialog.querySelector('#close-history')?.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    // Generate historical data and charts
    this.generateHistoryCharts(dialog, countryId, gameState);
  }

  private generateHistoryCharts(dialog: HTMLElement, countryId: number, gameState: any): void {
    // Generate military chart with more detailed data
    const militaryGraph = dialog.querySelector('#military-graph') as HTMLElement;
    if (militaryGraph) {
      const militaryData = [
        { label: 'USA Military Aid', value: gameState.miltAid?.[1]?.[countryId] || 0, color: '#ffffff', border: '#000000' },
        { label: 'USSR Military Aid', value: gameState.miltAid?.[2]?.[countryId] || 0, color: '#000000', border: '#000000' },
        { label: 'USA Gov Intervention', value: gameState.intvGovt?.[1]?.[countryId] || 0, color: '#ffffff', border: '#000000' },
        { label: 'USSR Gov Intervention', value: gameState.intvGovt?.[2]?.[countryId] || 0, color: '#000000', border: '#000000' },
        { label: 'USA Rebel Intervention', value: gameState.intvRebl?.[1]?.[countryId] || 0, color: '#ffffff', border: '#000000' },
        { label: 'USSR Rebel Intervention', value: gameState.intvRebl?.[2]?.[countryId] || 0, color: '#000000', border: '#000000' }
      ];
      militaryGraph.innerHTML = this.createDetailedChart(militaryData);
    }

    // Generate diplomatic chart with more detailed data
    const diplomaticGraph = dialog.querySelector('#diplomatic-graph') as HTMLElement;
    if (diplomaticGraph) {
      const diplomaticData = [
        { label: 'USA Diplomatic', value: gameState.dipAff?.[1]?.[countryId] || 0, color: '#ffffff', border: '#000000' },
        { label: 'USSR Diplomatic', value: gameState.dipAff?.[2]?.[countryId] || 0, color: '#000000', border: '#000000' },
        { label: 'USA Economic Aid', value: gameState.econAid?.[1]?.[countryId] || 0, color: '#ffffff', border: '#000000' },
        { label: 'USSR Economic Aid', value: gameState.econAid?.[2]?.[countryId] || 0, color: '#000000', border: '#000000' },
        { label: 'USA Destabilization', value: gameState.destab?.[1]?.[countryId] || 0, color: '#ffffff', border: '#000000' },
        { label: 'USSR Destabilization', value: gameState.destab?.[2]?.[countryId] || 0, color: '#000000', border: '#000000' }
      ];
      diplomaticGraph.innerHTML = this.createDetailedChart(diplomaticData);
    }

    // Generate political chart with more detailed data
    const politicalGraph = dialog.querySelector('#political-graph') as HTMLElement;
    if (politicalGraph) {
      const politicalData = [
        { label: 'Gov Popularity', value: gameState.gPopular?.[countryId] || 0, color: '#000000', border: '#000000' },
        { label: 'USA Finlandization', value: gameState.finlProb?.[1]?.[countryId] || 0, color: '#ffffff', border: '#000000' },
        { label: 'USSR Finlandization', value: gameState.finlProb?.[2]?.[countryId] || 0, color: '#000000', border: '#000000' },
        { label: 'USA Treaties', value: gameState.treaty?.[1]?.[countryId] || 0, color: '#ffffff', border: '#000000' },
        { label: 'USSR Treaties', value: gameState.treaty?.[2]?.[countryId] || 0, color: '#000000', border: '#000000' },
        { label: 'USA Pressure', value: gameState.pressure?.[1]?.[countryId] || 0, color: '#ffffff', border: '#000000' }
      ];
      politicalGraph.innerHTML = this.createDetailedChart(politicalData);
    }

    // Generate events timeline
    const eventsTimeline = dialog.querySelector('#events-timeline') as HTMLElement;
    if (eventsTimeline) {
      const currentYear = gameState.year || 1987;
      let timelineHTML = '<div style="font-size: 9px; line-height: 1.4;">';
      
      for (let year = 1987; year <= Math.min(currentYear, 1997); year++) {
        const eventText = this.getMajorEventText(countryId, gameState, year);
        timelineHTML += `<div style="margin-bottom: 3px;"><strong>${year}:</strong> ${eventText}</div>`;
      }
      
      timelineHTML += '</div>';
      eventsTimeline.innerHTML = timelineHTML;
    }

    // Generate recent changes
    const recentChanges = dialog.querySelector('#recent-changes') as HTMLElement;
    if (recentChanges) {
      let changesHTML = '';
      
      // Check for recent policy changes
      if (gameState.oldEconomicAid?.[1]?.[countryId] !== gameState.econAid?.[1]?.[countryId]) {
        changesHTML += `<div>USA Economic Aid: ${gameState.oldEconomicAid?.[1]?.[countryId] || 0} → ${gameState.econAid?.[1]?.[countryId] || 0}</div>`;
      }
      
      if (gameState.oldMilitaryAid?.[1]?.[countryId] !== gameState.miltAid?.[1]?.[countryId]) {
        changesHTML += `<div>USA Military Aid: ${gameState.oldMilitaryAid?.[1]?.[countryId] || 0} → ${gameState.miltAid?.[1]?.[countryId] || 0}</div>`;
      }
      
      if (gameState.oldDestabilization?.[1]?.[countryId] !== gameState.destab?.[1]?.[countryId]) {
        changesHTML += `<div>USA Destabilization: ${gameState.oldDestabilization?.[1]?.[countryId] || 0} → ${gameState.destab?.[1]?.[countryId] || 0}</div>`;
      }
      
      if (changesHTML === '') {
        changesHTML = '<div>No recent changes</div>';
      }
      
      recentChanges.innerHTML = changesHTML;
    }
  }

  private createDetailedChart(data: Array<{label: string, value: number, color: string, border: string}>): string {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const chartHeight = 140;
    const barWidth = 18;
    const spacing = 3;
    
    let chartHTML = '<div style="display: flex; align-items: end; height: 100%; padding: 5px; justify-content: space-around;">';
    
    data.forEach((item, index) => {
      const barHeight = Math.max((item.value / maxValue) * chartHeight, 2);
      
      chartHTML += `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="
            width: ${barWidth}px;
            height: ${barHeight}px;
            background: ${item.color};
            border: 1px solid ${item.border};
            margin-bottom: 2px;
          " title="${item.label}: ${item.value}"></div>
          <div style="
            font-size: 7px;
            text-align: center;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">${item.value}</div>
        </div>
      `;
    });
    
    chartHTML += '</div>';
    return chartHTML;
  }

  private getMajorEventText(countryId: number, gameState: any, year: number): string {
    // Generate major event text based on game state
    const currentYear = gameState.year || 1989;
    
    if (year > currentYear) {
      return 'Future year';
    }
    
    // Check for major events based on game state
    if (gameState.finlFlag?.[countryId]) {
      return 'Finlandization occurred';
    }
    if (gameState.coupFlag?.[countryId]) {
      return 'Coup attempt';
    }
    if (gameState.rebWinFlag?.[countryId]) {
      return 'Rebel victory';
    }
    
    // Check for significant policy changes
    const usaInfluence = this.calculateInfluence(1, countryId, gameState);
    const ussrInfluence = this.calculateInfluence(2, countryId, gameState);
    
    if (Math.abs(usaInfluence - ussrInfluence) > 50) {
      return 'Major influence shift';
    }
    
    return 'Normal development';
  }

  private getCountryName(countryId: number): string {
    // Get country name by ID using the same data source as CountryListRenderer
    const country = COUNTRY_BY_ID.get(countryId);
    return country ? country.name : `Country ${countryId}`;
  }

  private getMilitaryPowerText(militaryPower: number): string {
    if (militaryPower >= 80) return 'Very Strong';
    if (militaryPower >= 60) return 'Strong';
    if (militaryPower >= 40) return 'Moderate';
    if (militaryPower >= 20) return 'Weak';
    return 'Very Weak';
  }

  private getGovernmentPhilosophy(wing: number): string {
    if (wing > 50) return 'Right-wing';
    if (wing < -50) return 'Left-wing';
    return 'Centrist';
  }

  private getGovernmentStability(stability: number): string {
    if (stability >= 80) return 'Very Stable';
    if (stability >= 60) return 'Stable';
    if (stability >= 40) return 'Moderate';
    if (stability >= 20) return 'Unstable';
    return 'Very Unstable';
  }

  private getSphereOfInfluence(countryId: number, gameState: any): string {
    const usaInfluence = this.calculateInfluence(1, countryId, gameState);
    const ussrInfluence = this.calculateInfluence(2, countryId, gameState);
    
    if (usaInfluence > ussrInfluence + 20) return 'USA Sphere';
    if (ussrInfluence > usaInfluence + 20) return 'USSR Sphere';
    return 'Neutral';
  }

  private formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    } else {
      return value.toString();
    }
  }

  private getCapitalName(countryId: number): string {
    // Return capital name for the country
    const capitals: { [key: number]: string } = {
      1: 'Washington', 2: 'Moscow', 3: 'London', 4: 'Paris', 5: 'Bonn',
      6: 'Rome', 7: 'Madrid', 8: 'Lisbon', 9: 'Athens', 10: 'Ankara',
      11: 'Cairo', 12: 'Tehran', 13: 'Baghdad', 14: 'Riyadh', 15: 'Jerusalem',
      16: 'Damascus', 17: 'Amman', 18: 'Beirut', 19: 'Kuwait City', 20: 'Doha',
      21: 'Abu Dhabi', 22: 'Muscat', 23: 'Sanaa', 24: 'Khartoum', 25: 'Tripoli',
      26: 'Tunis', 27: 'Algiers', 28: 'Rabat', 29: 'Nouakchott', 30: 'Bamako',
      31: 'Ouagadougou', 32: 'Niamey', 33: 'N\'Djamena', 34: 'Khartoum', 35: 'Addis Ababa',
      36: 'Nairobi', 37: 'Kampala', 38: 'Kigali', 39: 'Bujumbura', 40: 'Dar es Salaam',
      41: 'Lusaka', 42: 'Harare', 43: 'Gaborone', 44: 'Windhoek', 45: 'Pretoria',
      46: 'Maputo', 47: 'Antananarivo', 48: 'Port Louis', 49: 'Victoria', 50: 'Mogadishu',
      51: 'Djibouti', 52: 'Asmara', 53: 'Kabul', 54: 'Islamabad', 55: 'New Delhi',
      56: 'Kathmandu', 57: 'Thimphu', 58: 'Dhaka', 59: 'Rangoon', 60: 'Bangkok',
      61: 'Vientiane', 62: 'Phnom Penh', 63: 'Hanoi', 64: 'Kuala Lumpur', 65: 'Singapore',
      66: 'Jakarta', 67: 'Manila', 68: 'Seoul', 69: 'Pyongyang', 70: 'Tokyo',
      71: 'Beijing', 72: 'Taipei', 73: 'Ulaanbaatar', 74: 'Canberra', 75: 'Wellington',
      76: 'Suva', 77: 'Port Moresby', 78: 'Honiara', 79: 'Port Vila', 80: 'Nuku\'alofa'
    };
    return capitals[countryId] || 'Unknown';
  }
  
  // Public method to start the game
  start(): void {
    this.renderCountryList();
    this.updateUI();
  }
}
