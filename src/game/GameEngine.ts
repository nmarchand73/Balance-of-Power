import { GameState, createInitialGameState, PolicyType } from './GameState.js';
import { GameMechanics } from './GameMechanics.js';
import { PolicyManager } from './PolicyManager.js';
import { NewsManager } from './NewsManager.js';
import { SaveLoadManager } from './SaveLoadManager.js';
import { ScoreCalculator } from './ScoreCalculator.js';

// Main game engine that coordinates all game systems
export class GameEngine {
  private gameState: GameState;
  private gameMechanics: GameMechanics;
  private policyManager: PolicyManager;
  private newsManager: NewsManager;
  private scoreCalculator: ScoreCalculator;
  private isProcessingTurn: boolean = false;

  constructor() {
    this.gameState = createInitialGameState();
    this.gameMechanics = new GameMechanics(this.gameState);
    this.policyManager = new PolicyManager(this.gameState, this.gameMechanics);
    this.newsManager = new NewsManager(this.gameState);
    this.scoreCalculator = new ScoreCalculator();
    
    console.log('🎮 Game Engine initialized');
  }

  // Initialize new game
  public initializeNewGame(level: number = 1, humanPlayer: number = 1): void {
    console.log(`🎮 Initializing new game - Level: ${level}, Human: ${humanPlayer === 1 ? 'USA' : 'USSR'}`);
    
    this.gameState = createInitialGameState();
    this.gameState.level = level;
    this.gameState.humanPlayer = humanPlayer;
    this.gameState.computerPlayer = humanPlayer === 1 ? 2 : 1;
    
    // Reinitialize managers with new state
    this.gameMechanics = new GameMechanics(this.gameState);
    this.policyManager = new PolicyManager(this.gameState, this.gameMechanics);
    this.newsManager = new NewsManager(this.gameState);
    
    console.log('✅ New game initialized');
  }

  // Load game from save
  public loadGame(slot: number = 0): boolean {
    console.log(`📂 Loading game from slot ${slot}`);
    
    const loadedState = SaveLoadManager.loadGame(slot);
    if (!loadedState) {
      console.log('❌ Failed to load game');
      return false;
    }
    
    this.gameState = loadedState;
    
    // Reinitialize managers with loaded state
    this.gameMechanics = new GameMechanics(this.gameState);
    this.policyManager = new PolicyManager(this.gameState, this.gameMechanics);
    this.newsManager = new NewsManager(this.gameState);
    
    console.log('✅ Game loaded successfully');
    return true;
  }

  // Save game
  public saveGame(slot: number = 0): boolean {
    console.log(`💾 Saving game to slot ${slot}`);
    return SaveLoadManager.saveGame(this.gameState, slot);
  }

  // Auto-save
  public autoSave(): boolean {
    return SaveLoadManager.autoSave(this.gameState);
  }

  // Process next turn - CORRECTED to match GAME_RULES.md sequence
  public async processTurn(): Promise<void> {
    if (this.isProcessingTurn) {
      console.log('⏳ Turn already being processed');
      return;
    }

    this.isProcessingTurn = true;
    console.log(`🎮 Processing turn for year ${this.gameState.year}`);

    try {
      // CORRECTED ORDER: Generate news FIRST (before ReactNews phase)
      this.newsManager.generateNews();
      
      // Step 1: Process game mechanics (PrePlanMove + ReactNews + MainMove)
      this.gameMechanics.processTurn();
      
      // Step 2: Auto-save
      this.autoSave();
      
      console.log(`✅ Turn processed successfully. Year: ${this.gameState.year}`);
    } catch (error) {
      console.error('❌ Error processing turn:', error);
    } finally {
      this.isProcessingTurn = false;
    }
  }

  // Apply policy
  public applyPolicy(superpower: number, countryId: number, policyType: PolicyType, value: number): boolean {
    console.log(`📋 Applying policy: ${superpower === 1 ? 'USA' : 'USSR'} -> ${countryId}, ${PolicyType[policyType]}, ${value}`);
    
    const success = this.policyManager.applyPolicy(superpower, countryId, policyType, value);
    
    if (success) {
      // Update scores immediately
      this.updateScores();
      
      // Auto-save after policy change
      this.autoSave();
    }
    
    return success;
  }

  // Get policy value
  public getPolicyValue(superpower: number, countryId: number, policyType: PolicyType): number {
    return this.policyManager.getPolicyValue(superpower, countryId, policyType);
  }

  // Get country policies
  public getCountryPolicies(countryId: number): { [key: string]: { usa: number, ussr: number } } {
    return this.policyManager.getCountryPolicies(countryId);
  }

  // Calculate total influence
  public calculateTotalInfluence(superpower: number, countryId: number): number {
    return this.policyManager.calculateTotalInfluence(superpower, countryId);
  }

  // Get policy recommendations
  public getPolicyRecommendations(superpower: number, countryId: number): PolicyType[] {
    return this.policyManager.getPolicyRecommendations(superpower, countryId);
  }

  // Update scores
  public updateScores(): void {
    const scores = ScoreCalculator.calculateScores(this.gameState);
    this.gameState.usaScore = scores.usaScore;
    this.gameState.ussrScore = scores.ussrScore;
    
    // Update country colors
    this.updateCountryColors();
  }

  // Update country colors
  private updateCountryColors(): void {
    for (let i = 1; i <= 80; i++) {
      this.gameState.countryColors[i] = this.getCountryColorIndex(this.gameState, i);
    }
  }

  // Get country color index (private helper)
  private getCountryColorIndex(gameState: GameState, countryId: number): number {
    const usaInfluence = ScoreCalculator.calculateInfluence(gameState, 1, countryId);
    const ussrInfluence = ScoreCalculator.calculateInfluence(gameState, 2, countryId);
    
    if (usaInfluence > ussrInfluence) return 1; // USA
    if (ussrInfluence > usaInfluence) return 2; // USSR
    return 0; // Neutral
  }

  // Get country color
  public getCountryColor(countryId: number): string {
    return ScoreCalculator.getCountryColor(this.gameState, countryId);
  }

  // Get recent news
  public getRecentNews(count: number = 10) {
    return this.newsManager.getRecentNews(count);
  }

  // Get news by country
  public getNewsByCountry(countryId: number) {
    return this.newsManager.getNewsByCountry(countryId);
  }

  // Get crisis news
  public getCrisisNews() {
    return this.newsManager.getCrisisNews();
  }

  // Get news worthiness
  public getNewsWorthiness(): number {
    return this.newsManager.getNewsWorthiness();
  }

  // Get game state
  public getGameState(): GameState {
    return this.gameState;
  }

  // Get game status
  public getGameStatus(): { 
    isGameOver: boolean, 
    winner: string | null, 
    year: number, 
    level: number,
    usaScore: number,
    ussrScore: number,
    nastiness: number,
    turnPhase: string,
    isProcessingTurn: boolean,
    nuclearWarRisk: boolean,
    crisisCount: number
  } {
    return {
      isGameOver: this.gameState.quitFlag || this.gameState.winFlag,
      winner: this.gameState.winFlag ? 
        (this.gameState.usaScore > this.gameState.ussrScore ? 'USA' : 'USSR') : null,
      year: this.gameState.year,
      level: this.gameState.level,
      usaScore: this.gameState.usaScore,
      ussrScore: this.gameState.ussrScore,
      nastiness: this.gameState.nastiness,
      turnPhase: this.getTurnPhase(),
      isProcessingTurn: this.isProcessingTurn,
      nuclearWarRisk: this.gameState.nastiness >= 100,
      crisisCount: this.getCrisisCount()
    };
  }

  // Get current turn phase
  private getTurnPhase(): string {
    if (this.isProcessingTurn) {
      return 'Processing Turn...';
    }
    
    // Check if it's the start of a new year
    if (this.gameState.year === 1989) {
      return 'Game Start';
    }
    
    // Check for nuclear war
    if (this.gameState.nastiness >= 127) {
      return 'NUCLEAR WAR!';
    }
    
    // Check for high tension
    if (this.gameState.nastiness >= 100) {
      return 'Critical Tension';
    }
    
    // Check for crisis
    if (this.getCrisisCount() > 0) {
      return 'Crisis Active';
    }
    
    return 'Planning Phase';
  }

  // Get crisis count
  private getCrisisCount(): number {
    let crisisCount = 0;
    for (let i = 1; i <= 80; i++) {
      if (this.gameState.coupFlag[i] || this.gameState.revolutionFlag[i] || this.gameState.finlandizationFlag[i]) {
        crisisCount++;
      }
    }
    return crisisCount;
  }

  // Check if it's human player's turn
  public isHumanPlayerTurn(): boolean {
    return this.gameState.humanPlayer === 1; // Simplified - always human turn for now
  }

  // Get available saves
  public getAvailableSaves(): { slot: number, info: any }[] {
    return SaveLoadManager.getAllSaves();
  }

  // Export game
  public exportGame(): string {
    return SaveLoadManager.exportSave(this.gameState);
  }

  // Import game
  public importGame(saveData: string): boolean {
    const importedState = SaveLoadManager.importSave(saveData);
    if (!importedState) {
      return false;
    }
    
    this.gameState = importedState;
    
    // Reinitialize managers
    this.gameMechanics = new GameMechanics(this.gameState);
    this.policyManager = new PolicyManager(this.gameState, this.gameMechanics);
    this.newsManager = new NewsManager(this.gameState);
    
    return true;
  }

  // Get country by ID
  public getCountryById(countryId: number) {
    return this.gameState.countries.find(c => c.id === countryId);
  }

  // Get diplomatic affinity
  public getDiplomaticAffinity(from: number, to: number): number {
    return this.gameState.diplomaticAffinity[from]?.[to] || 0;
  }

  // Get country statistics
  public getCountryStatistics(countryId: number): {
    governmentStrength: number,
    insurgencyStrength: number,
    governmentPopularity: number,
    militaryPower: number,
    prestigeValue: number,
    finlandizationFlag: boolean,
    coupFlag: boolean,
    revolutionFlag: boolean,
    totalUsaInfluence: number,
    totalUssrInfluence: number
  } {
    return {
      governmentStrength: this.gameState.governmentStrength[countryId],
      insurgencyStrength: this.gameState.insurgencyStrength[countryId],
      governmentPopularity: this.gameState.governmentPopularity[countryId],
      militaryPower: this.gameState.militaryPower[countryId],
      prestigeValue: this.gameState.prestigeValues[countryId],
      finlandizationFlag: this.gameState.finlandizationFlag[countryId],
      coupFlag: this.gameState.coupFlag[countryId],
      revolutionFlag: this.gameState.revolutionFlag[countryId],
      totalUsaInfluence: this.calculateTotalInfluence(1, countryId),
      totalUssrInfluence: this.calculateTotalInfluence(2, countryId)
    };
  }

  // Reset game
  public resetGame(): void {
    console.log('🔄 Resetting game');
    this.initializeNewGame(this.gameState.level, this.gameState.humanPlayer);
  }

  // Set difficulty level
  public setDifficultyLevel(level: number): void {
    this.gameState.level = Math.max(1, Math.min(4, level));
    console.log(`🎯 Difficulty level set to ${level}`);
  }

  // Set human player
  public setHumanPlayer(player: number): void {
    this.gameState.humanPlayer = player === 1 ? 1 : 2;
    this.gameState.computerPlayer = this.gameState.humanPlayer === 1 ? 2 : 1;
    console.log(`👤 Human player set to ${this.gameState.humanPlayer === 1 ? 'USA' : 'USSR'}`);
  }

  // Enable/disable two-player mode
  public setTwoPlayerMode(enabled: boolean): void {
    this.gameState.twoPlayerFlag = enabled;
    console.log(`👥 Two-player mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get game statistics
  public getGameStatistics(): {
    totalCountries: number,
    countriesWithUsaInfluence: number,
    countriesWithUssrInfluence: number,
    countriesInCrisis: number,
    averageNastiness: number,
    totalNewsItems: number
  } {
    let countriesWithUsaInfluence = 0;
    let countriesWithUssrInfluence = 0;
    let countriesInCrisis = 0;
    
    for (let i = 1; i <= 80; i++) {
      if (this.calculateTotalInfluence(1, i) > 0) countriesWithUsaInfluence++;
      if (this.calculateTotalInfluence(2, i) > 0) countriesWithUssrInfluence++;
      if (this.gameState.coupFlag[i] || this.gameState.revolutionFlag[i]) countriesInCrisis++;
    }
    
    return {
      totalCountries: 80,
      countriesWithUsaInfluence,
      countriesWithUssrInfluence,
      countriesInCrisis,
      averageNastiness: this.gameState.nastiness,
      totalNewsItems: this.gameState.newsQueue.length
    };
  }
}