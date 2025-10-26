import { GameState, createInitialGameState } from './GameState.js';

// Save/Load system based on original game mechanics
export class SaveLoadManager {
  private static readonly SAVE_KEY = 'balance_of_power_save';
  private static readonly AUTO_SAVE_KEY = 'balance_of_power_autosave';

  // Save game state to localStorage
  public static saveGame(gameState: GameState, slot: number = 0): boolean {
    try {
      const saveData = {
        version: '1.0',
        timestamp: Date.now(),
        gameState: gameState,
        slot: slot
      };

      const key = slot === 0 ? this.AUTO_SAVE_KEY : `${this.SAVE_KEY}_${slot}`;
      localStorage.setItem(key, JSON.stringify(saveData));
      
      console.log(`💾 Game saved to slot ${slot}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to save game:', error);
      return false;
    }
  }

  // Load game state from localStorage
  public static loadGame(slot: number = 0): GameState | null {
    try {
      const key = slot === 0 ? this.AUTO_SAVE_KEY : `${this.SAVE_KEY}_${slot}`;
      const saveDataStr = localStorage.getItem(key);
      
      if (!saveDataStr) {
        console.log(`📁 No save file found in slot ${slot}`);
        return null;
      }

      const saveData = JSON.parse(saveDataStr);
      
      // Validate save data
      if (!this.validateSaveData(saveData)) {
        console.error('❌ Invalid save data');
        return null;
      }

      // Create new game state and merge saved data
      const gameState = createInitialGameState();
      this.mergeSaveData(gameState, saveData.gameState);
      
      console.log(`📂 Game loaded from slot ${slot}`);
      return gameState;
    } catch (error) {
      console.error('❌ Failed to load game:', error);
      return null;
    }
  }

  // Validate save data structure
  private static validateSaveData(saveData: any): boolean {
    if (!saveData || typeof saveData !== 'object') {
      return false;
    }

    if (!saveData.version || !saveData.timestamp || !saveData.gameState) {
      return false;
    }

    if (typeof saveData.gameState !== 'object') {
      return false;
    }

    // Check required game state properties
    const requiredProps = [
      'year', 'level', 'humanPlayer', 'usaScore', 'ussrScore',
      'countries', 'diplomaticAffinity', 'economicAid', 'militaryAid'
    ];

    for (const prop of requiredProps) {
      if (!(prop in saveData.gameState)) {
        console.error(`❌ Missing required property: ${prop}`);
        return false;
      }
    }

    return true;
  }

  // Merge saved data into game state
  private static mergeSaveData(gameState: GameState, savedState: any): void {
    // Copy all properties from saved state
    Object.assign(gameState, savedState);
    
    // Ensure arrays are properly initialized
    this.ensureArrayIntegrity(gameState);
    
    // Recalculate derived values
    this.recalculateDerivedValues(gameState);
  }

  // Ensure array integrity
  private static ensureArrayIntegrity(gameState: GameState): void {
    const arrayProps = [
      'countryColors', 'prestigeValues', 'governmentStrength', 'insurgencyStrength',
      'governmentWing', 'insurgencyWing', 'leftPower', 'governmentPopularity',
      'militaryPower', 'insurgencyPower', 'strengthRatio', 'finlandizationFlag',
      'coupFlag', 'revolutionFlag', 'militaryPressure', 'dontMess',
      'governmentStability', 'usaScoreHistory', 'ussrScoreHistory'
    ];

    for (const prop of arrayProps) {
      if (!Array.isArray((gameState as any)[prop])) {
        (gameState as any)[prop] = new Array(81).fill(0);
      }
    }

    // Ensure policy matrices are properly sized
    const matrixProps = [
      'economicAid', 'militaryAid', 'insurgencyAid', 'governmentIntervention',
      'rebelIntervention', 'pressure', 'treaties', 'destabilization',
      'finlandizationProbability', 'interveneGovt', 'interveneRebs'
    ];

    for (const prop of matrixProps) {
      if (!Array.isArray((gameState as any)[prop])) {
        (gameState as any)[prop] = this.createPolicyMatrix(0);
      }
      
      // Ensure each superpower array is properly sized
      for (let i = 0; i <= 2; i++) {
        if (!Array.isArray((gameState as any)[prop][i])) {
          (gameState as any)[prop][i] = new Array(81).fill(0);
        }
      }
    }

    // Ensure diplomatic affinity matrix is properly sized
    if (!Array.isArray(gameState.diplomaticAffinity)) {
      gameState.diplomaticAffinity = this.createDiplomaticMatrix();
    }
  }

  // Create policy matrix
  private static createPolicyMatrix(defaultValue: number): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i <= 2; i++) {
      matrix[i] = new Array(81).fill(defaultValue);
    }
    return matrix;
  }

  // Create diplomatic matrix
  private static createDiplomaticMatrix(): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i <= 80; i++) {
      matrix[i] = new Array(81).fill(0);
    }
    return matrix;
  }

  // Recalculate derived values
  private static recalculateDerivedValues(gameState: GameState): void {
    // Recalculate prestige values
    for (const country of gameState.countries) {
      const countryId = country.id;
      const temp = Math.floor(country.militarySpending / 2);
      const prestige = Math.floor((16 * temp * country.militaryMen) / (temp + country.militaryMen));
      gameState.prestigeValues[countryId] = prestige;
    }

    // Recalculate average "don't mess with" factor
    let totalDontMess = 0;
    for (let i = 1; i <= 80; i++) {
      totalDontMess += gameState.dontMess[i] || 0;
    }
    gameState.averageDontMess = Math.floor(totalDontMess / 80);

    // Ensure minimum values
    for (let i = 1; i <= 80; i++) {
      if (gameState.governmentStrength[i] <= 0) {
        gameState.governmentStrength[i] = 1;
      }
      if (gameState.insurgencyStrength[i] < 0) {
        gameState.insurgencyStrength[i] = 0;
      }
    }
  }

  // Check if save exists
  public static hasSave(slot: number = 0): boolean {
    const key = slot === 0 ? this.AUTO_SAVE_KEY : `${this.SAVE_KEY}_${slot}`;
    return localStorage.getItem(key) !== null;
  }

  // Get save info
  public static getSaveInfo(slot: number = 0): { timestamp: number, year: number, level: number } | null {
    try {
      const key = slot === 0 ? this.AUTO_SAVE_KEY : `${this.SAVE_KEY}_${slot}`;
      const saveDataStr = localStorage.getItem(key);
      
      if (!saveDataStr) {
        return null;
      }

      const saveData = JSON.parse(saveDataStr);
      return {
        timestamp: saveData.timestamp,
        year: saveData.gameState.year,
        level: saveData.gameState.level
      };
    } catch (error) {
      console.error('❌ Failed to get save info:', error);
      return null;
    }
  }

  // Delete save
  public static deleteSave(slot: number): boolean {
    try {
      const key = `${this.SAVE_KEY}_${slot}`;
      localStorage.removeItem(key);
      console.log(`🗑️ Save slot ${slot} deleted`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete save:', error);
      return false;
    }
  }

  // Export save data
  public static exportSave(gameState: GameState): string {
    const saveData = {
      version: '1.0',
      timestamp: Date.now(),
      gameState: gameState
    };

    return JSON.stringify(saveData, null, 2);
  }

  // Import save data
  public static importSave(saveDataStr: string): GameState | null {
    try {
      const saveData = JSON.parse(saveDataStr);
      
      if (!this.validateSaveData(saveData)) {
        console.error('❌ Invalid imported save data');
        return null;
      }

      const gameState = createInitialGameState();
      this.mergeSaveData(gameState, saveData.gameState);
      
      console.log('📥 Save data imported successfully');
      return gameState;
    } catch (error) {
      console.error('❌ Failed to import save data:', error);
      return null;
    }
  }

  // Auto-save
  public static autoSave(gameState: GameState): boolean {
    return this.saveGame(gameState, 0);
  }

  // Get all available saves
  public static getAllSaves(): { slot: number, info: any }[] {
    const saves: { slot: number, info: any }[] = [];
    
    // Check auto-save
    const autoSaveInfo = this.getSaveInfo(0);
    if (autoSaveInfo) {
      saves.push({ slot: 0, info: autoSaveInfo });
    }
    
    // Check manual saves (slots 1-10)
    for (let slot = 1; slot <= 10; slot++) {
      const saveInfo = this.getSaveInfo(slot);
      if (saveInfo) {
        saves.push({ slot, info: saveInfo });
      }
    }
    
    return saves;
  }

  // Clear all saves
  public static clearAllSaves(): boolean {
    try {
      // Clear auto-save
      localStorage.removeItem(this.AUTO_SAVE_KEY);
      
      // Clear manual saves
      for (let slot = 1; slot <= 10; slot++) {
        localStorage.removeItem(`${this.SAVE_KEY}_${slot}`);
      }
      
      console.log('🗑️ All saves cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear saves:', error);
      return false;
    }
  }

  // Get save file size
  public static getSaveSize(slot: number = 0): number {
    const key = slot === 0 ? this.AUTO_SAVE_KEY : `${this.SAVE_KEY}_${slot}`;
    const saveDataStr = localStorage.getItem(key);
    
    if (!saveDataStr) {
      return 0;
    }
    
    return new Blob([saveDataStr]).size;
  }

  // Check if localStorage is available
  public static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}
