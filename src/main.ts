import { UIManager } from './ui/UIManager.js';
import { GameEngine } from './game/GameEngine.js';
import { COUNTRIES, COUNTRY_BY_ID, RAW_COUNTRY_DATA } from './data/countries.js';

// Expose data globally for debugging
(window as any).COUNTRIES = COUNTRIES;
(window as any).COUNTRY_BY_ID = COUNTRY_BY_ID;
(window as any).RAW_COUNTRY_DATA = RAW_COUNTRY_DATA;

// Main application class
class BalanceOfPowerApp {
  private uiManager: UIManager;
  private gameEngine: GameEngine;
  
  constructor() {
    this.gameEngine = new GameEngine();
    this.uiManager = new UIManager(this.gameEngine);
  }
  
  // Get the game engine for external access
  getGameEngine(): GameEngine {
    return this.gameEngine;
  }
  
  // Initialize the application
  async init(): Promise<void> {
    try {
      // Start the UI manager
      this.uiManager.start();
      
      // Balance of Power initialized successfully
    } catch (error) {
      console.error('Failed to initialize Balance of Power:', error);
      this.showError('Failed to initialize the game. Please refresh the page.');
    }
  }
  
  // Show error message
  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff0000;
      color: white;
      padding: 20px;
      border: 2px solid #ff6666;
      z-index: 10000;
      font-family: monospace;
      text-align: center;
    `;
    errorDiv.innerHTML = `
      <h3>Error</h3>
      <p>${message}</p>
      <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px;">Reload Page</button>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const app = new BalanceOfPowerApp();
  await app.init();
  
  // Expose gameEngine globally for testing
  (window as any).gameEngine = app.getGameEngine();
});

// Export for potential external use
export { BalanceOfPowerApp };
