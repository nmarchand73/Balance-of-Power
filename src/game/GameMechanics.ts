import { GameState, PolicyType, NewsItem } from './GameState.js';
import { ScoreCalculator } from './ScoreCalculator.js';

// Game mechanics based on original Pascal source code
export class GameMechanics {
  private gameState: GameState;
  private scoreCalculator: ScoreCalculator;

  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.scoreCalculator = new ScoreCalculator();
  }

  // Main game turn processing (based on NextTurn from Main.p)
  public processTurn(): void {
    console.log(`🎮 Processing turn for year ${this.gameState.year}`);
    
    // Phase 1: PrePlanMove (Preparation)
    this.prePlanMove();
    
    // Phase 2: ReactNews (Reactions to events)
    this.reactNews();
    
    // Phase 3: MainMove (Development and AI) - only if not quit
    if (!this.gameState.quitFlag) {
      this.mainMove();
    }
    
    console.log(`✅ Turn processed. Year: ${this.gameState.year}`);
  }

  // Pre-planning phase (from PrePlanMove procedure)
  private prePlanMove(): void {
    console.log('📋 Pre-planning phase...');
    
    // Increment year
    this.gameState.year++;
    
    // Save old values for comparison
    this.saveOldValues();
    
    // Update government and insurgency strengths
    this.updateStrengths();
    
    // CRITICAL: Check for USA-USSR nuclear escalation
    this.checkNuclearEscalation();
    
    // Check for minor country wars (level 4 only)
    if (this.gameState.level === 4) {
      this.checkMinorCountryWars();
    }
  }

  // Save old values for comparison (from original code) - CORRECTED
  private saveOldValues(): void {
    for (let i = 1; i <= 80; i++) {
      // Save old strengths (from original: OldGStrg[i]:=GovtStrg[i]; OldIStrg[i]:=InsgStrg[i]; OldGPopl[i]:=GPopular[i])
      this.gameState.oldGovernmentStrength[i] = this.gameState.governmentStrength[i];
      this.gameState.oldInsurgencyStrength[i] = this.gameState.insurgencyStrength[i];
      this.gameState.oldGovernmentPopularity[i] = this.gameState.governmentPopularity[i];
      
      // Reset gains for each superpower (from original: RevlGain[j,i]:=0; CoupGain[j,i]:=0; FinlGain[j,i]:=0)
      for (let j = 1; j <= 2; j++) {
        this.gameState.revolutionGain[j][i] = 0;
        this.gameState.coupGain[j][i] = 0;
        this.gameState.finlandizationGain[j][i] = 0;
        
        // Save old policy values (from original: EconAOld[j,i]:=EconAid[j,i]; etc.)
        this.gameState.oldEconomicAid[j][i] = this.gameState.economicAid[j][i];
        this.gameState.oldDestabilization[j][i] = this.gameState.destabilization[j][i];
        this.gameState.oldTreaties[j][i] = this.gameState.treaties[j][i];
        this.gameState.oldPressure[j][i] = this.gameState.pressure[j][i];
        this.gameState.oldFinlandizationProb[j][i] = this.gameState.finlandizationProb[j][i];
        
        // Save old military policies (from original: MiltAOld^^[j,i]:=MiltAid^^[j,i]; etc.)
        this.gameState.oldMilitaryAid[j][i] = this.gameState.militaryAid[j][i];
        this.gameState.oldInsurgencyAid[j][i] = this.gameState.insurgencyAid[j][i];
        this.gameState.oldGovernmentIntervention[j][i] = this.gameState.governmentIntervention[j][i];
        this.gameState.oldRebelIntervention[j][i] = this.gameState.rebelIntervention[j][i];
      }
    }
  }

  // Update government and insurgency strengths (from original calculations)
  private updateStrengths(): void {
    for (let i = 1; i <= 80; i++) {
      const country = this.gameState.countries.find(c => c.id === i);
      if (!country) continue;

      // Ensure minimum government strength
      if (this.gameState.governmentStrength[i] === 0) {
        this.gameState.governmentStrength[i] = 1;
      }

      // Ensure insurgency doesn't exceed government strength
      if (this.gameState.insurgencyStrength[i] > this.gameState.governmentStrength[i]) {
        this.gameState.insurgencyStrength[i] = this.gameState.governmentStrength[i];
      }

      // Calculate strength ratio (from original SqrtStrg calculation)
      const temp = this.gameState.insurgencyStrength[i];
      const govtStrg = this.gameState.governmentStrength[i];
      let x = Math.floor((6400 * temp) / govtStrg);
      if (x < 1) x = 1;
      if (x > 6400) x = 6400;
      
      // Simplified strength ratio calculation
      this.gameState.strengthRatio[i] = Math.floor(Math.sqrt(x));
    }
  }

  // CRITICAL: Check for USA-USSR nuclear escalation (from original code)
  private checkNuclearEscalation(): void {
    for (let i = 1; i <= 80; i++) {
      // Debug: Check if matrices are properly initialized
      if (!this.gameState.governmentIntervention[1] || !this.gameState.rebelIntervention[1]) {
        console.error('❌ Policy matrices not properly initialized!');
        console.error('governmentIntervention[1]:', this.gameState.governmentIntervention[1]);
        console.error('rebelIntervention[1]:', this.gameState.rebelIntervention[1]);
        return;
      }
      
      const usaGovtIntervention = this.gameState.governmentIntervention[1][i];
      const ussrRebelIntervention = this.gameState.rebelIntervention[2][i];
      const ussrGovtIntervention = this.gameState.governmentIntervention[2][i];
      const usaRebelIntervention = this.gameState.rebelIntervention[1][i];

      if ((usaGovtIntervention > 0 && ussrRebelIntervention > 0) ||
          (ussrGovtIntervention > 0 && usaRebelIntervention > 0)) {
        // USA fights with USSR - IMMEDIATE NUCLEAR WAR
        this.gameState.diplomaticAffinity[1][2] = -127;
        this.gameState.diplomaticAffinity[2][1] = -127;
        this.gameState.nastiness = 127;
        this.gameState.pugnacity[1] = 127; // USA
        this.gameState.pugnacity[2] = 127; // USSR
        this.gameState.quitFlag = true; // Game over
        
        console.log(`💥 NUCLEAR WAR! USA-USSR conflict in country ${i}`);
        return; // Immediate game end
      }
    }
  }

  // Check for minor country wars (level 4 only)
  private checkMinorCountryWars(): void {
    for (let i = 3; i <= 80; i++) {
      for (let j = 3; j <= 80; j++) {
        if (i === j) continue;
        
        const iGovtIntervention = this.gameState.governmentIntervention[i][j];
        const iRebelIntervention = this.gameState.rebelIntervention[i][j];
        
        if (iGovtIntervention > 0 || iRebelIntervention > 0) {
          for (let k = 1; k <= 80; k++) {
            if (k === i) continue;
            const kRebelIntervention = this.gameState.rebelIntervention[k][j];
            const kGovtIntervention = this.gameState.governmentIntervention[k][j];
            
            if ((iGovtIntervention > 0 && kRebelIntervention > 0) ||
                (iRebelIntervention > 0 && kGovtIntervention > 0)) {
              // Diplomatic penalty
              const penalty = Math.floor(this.gameState.nastiness / 8);
              this.changeDiplomaticAffinity(i, k, -penalty);
              this.changeDiplomaticAffinity(k, i, -penalty);
            }
          }
        }
      }
    }
  }

  // Update diplomatic relations based on interventions
  private updateDiplomaticRelations(): void {
    // Simplified diplomatic updates based on interventions
    for (let countryId = 1; countryId <= 80; countryId++) {
      // Check USA vs USSR interventions in this country
      const usaGovtIntervention = this.gameState.governmentIntervention[1][countryId];
      const usaRebelIntervention = this.gameState.rebelIntervention[1][countryId];
      const ussrGovtIntervention = this.gameState.governmentIntervention[2][countryId];
      const ussrRebelIntervention = this.gameState.rebelIntervention[2][countryId];
      
      // Check for intervention conflicts between USA and USSR
      if ((usaGovtIntervention > 0 && ussrRebelIntervention > 0) ||
          (ussrGovtIntervention > 0 && usaRebelIntervention > 0)) {
        // Diplomatic penalty between USA and USSR
        const penalty = Math.floor(this.gameState.nastiness / 8);
        this.changeDiplomaticAffinity(1, 2, -penalty);
        this.changeDiplomaticAffinity(2, 1, -penalty);
        
        console.log(`⚠️ Diplomatic tension: USA-USSR conflict in country ${countryId}`);
      }
    }
  }

  // Process policy effects on countries
  private processPolicyEffects(): void {
    console.log('📋 Processing policy effects...');
    
    for (let i = 1; i <= 80; i++) {
      const country = this.gameState.countries.find(c => c.id === i);
      if (!country) continue;

      // Process economic aid effects
      const usaEconAid = this.gameState.economicAid[1][i];
      const ussrEconAid = this.gameState.economicAid[2][i];
      
      if (usaEconAid > 0) {
        // USA influence increases significantly
        this.gameState.governmentPopularity[i] += usaEconAid * 5; // Increased effect
        this.gameState.governmentWing[i] = Math.max(this.gameState.governmentWing[i] - usaEconAid * 2, -128);
        this.gameState.governmentStability[i] += usaEconAid * 3;
        // Update prestige value to reflect economic aid
        this.gameState.prestigeValues[i] += usaEconAid * 15;
      }
      
      if (ussrEconAid > 0) {
        // USSR influence increases significantly
        this.gameState.governmentPopularity[i] += ussrEconAid * 5; // Increased effect
        this.gameState.governmentWing[i] = Math.min(this.gameState.governmentWing[i] + ussrEconAid * 2, 127);
        this.gameState.governmentStability[i] += ussrEconAid * 3;
        // Update prestige value to reflect economic aid
        this.gameState.prestigeValues[i] += ussrEconAid * 15;
      }

      // Process military aid effects
      const usaMilAid = this.gameState.militaryAid[1][i];
      const ussrMilAid = this.gameState.militaryAid[2][i];
      
      if (usaMilAid > 0) {
        this.gameState.governmentStrength[i] += usaMilAid * 20; // Increased effect
        this.gameState.militaryPower[i] += usaMilAid * 10;
        this.gameState.governmentStability[i] += usaMilAid * 2;
        // Update prestige value to reflect military aid
        this.gameState.prestigeValues[i] += usaMilAid * 20;
      }
      
      if (ussrMilAid > 0) {
        this.gameState.governmentStrength[i] += ussrMilAid * 20; // Increased effect
        this.gameState.militaryPower[i] += ussrMilAid * 10;
        this.gameState.governmentStability[i] += ussrMilAid * 2;
        // Update prestige value to reflect military aid
        this.gameState.prestigeValues[i] += ussrMilAid * 20;
      }

      // Process destabilization effects
      const usaDestab = this.gameState.destabilization[1][i];
      const ussrDestab = this.gameState.destabilization[2][i];
      
      if (usaDestab > 0) {
        this.gameState.governmentStrength[i] -= usaDestab * 10; // Increased effect
        this.gameState.insurgencyStrength[i] += usaDestab * 5;
        this.gameState.governmentStability[i] -= usaDestab * 5;
        this.gameState.governmentPopularity[i] -= usaDestab * 3;
        // Reduce prestige value due to destabilization
        this.gameState.prestigeValues[i] -= usaDestab * 10;
      }
      
      if (ussrDestab > 0) {
        this.gameState.governmentStrength[i] -= ussrDestab * 10; // Increased effect
        this.gameState.insurgencyStrength[i] += ussrDestab * 5;
        this.gameState.governmentStability[i] -= ussrDestab * 5;
        this.gameState.governmentPopularity[i] -= ussrDestab * 3;
        // Reduce prestige value due to destabilization
        this.gameState.prestigeValues[i] -= ussrDestab * 10;
      }

      // Process pressure effects
      const usaPressure = this.gameState.pressure[1][i];
      const ussrPressure = this.gameState.pressure[2][i];
      
      if (usaPressure > 0) {
        this.gameState.governmentStability[i] -= usaPressure * 3;
        this.gameState.governmentPopularity[i] -= usaPressure * 2;
        // Reduce prestige value due to pressure
        this.gameState.prestigeValues[i] -= usaPressure * 5;
      }
      
      if (ussrPressure > 0) {
        this.gameState.governmentStability[i] -= ussrPressure * 3;
        this.gameState.governmentPopularity[i] -= ussrPressure * 2;
        // Reduce prestige value due to pressure
        this.gameState.prestigeValues[i] -= ussrPressure * 5;
      }

      // Clamp values
      this.gameState.governmentStrength[i] = Math.max(1, this.gameState.governmentStrength[i]);
      this.gameState.insurgencyStrength[i] = Math.max(0, this.gameState.insurgencyStrength[i]);
      this.gameState.governmentPopularity[i] = Math.max(0, Math.min(100, this.gameState.governmentPopularity[i]));
      this.gameState.governmentStability[i] = Math.max(0, Math.min(100, this.gameState.governmentStability[i]));
      this.gameState.governmentWing[i] = Math.max(-128, Math.min(127, this.gameState.governmentWing[i]));
      this.gameState.militaryPower[i] = Math.max(1, this.gameState.militaryPower[i]);
      this.gameState.prestigeValues[i] = Math.max(1, this.gameState.prestigeValues[i]);
    }
  }

  // Update scores and country colors
  private updateScores(): void {
    const scores = ScoreCalculator.calculateScores(this.gameState);
    this.gameState.usaScore = scores.usaScore;
    this.gameState.ussrScore = scores.ussrScore;
    
    // Update country colors
    this.updateCountryColors();
  }

  // Update country colors based on influence
  private updateCountryColors(): void {
    for (let i = 1; i <= 80; i++) {
      this.gameState.countryColors[i] = this.getCountryColorIndex(this.gameState, i);
    }
  }

  // Phase 2: ReactNews (Reactions to events)
  private reactNews(): void {
    console.log('📰 Reacting to news...');
    
    // Process news queue
    this.processNewsQueue();
    
    // Calculate diplomatic reactions
    this.calculateDiplomaticReactions();
    
    // Update scores
    this.updateScores();
  }

  // Phase 3: MainMove (Development and AI)
  private mainMove(): void {
    console.log('🎯 Main move phase...');
    
    // Save history
    this.saveHistory();
    
    // Develop countries
    this.developCountries();
    
    // Computer AI (if not two-player)
    if (!this.gameState.twoPlayerFlag) {
      this.computerAI();
    }
    
    // Minor country AI (level 4 only)
    if (this.gameState.level === 4) {
      this.minorCountryAI();
    }
    
    // Reduce nastiness automatically
    this.gameState.nastiness = Math.max(0, this.gameState.nastiness - 4);
    
    // Update superpower attributes
    this.updateSuperpowerAttributes();
    
    // Calculate scores
    this.updateScores();
    
    // Check victory conditions
    this.checkVictoryConditions();
  }

  // Process news queue
  private processNewsQueue(): void {
    // Process each news item in the queue
    for (let i = 0; i < this.gameState.newsQueue.length; i++) {
      const news = this.gameState.newsQueue[i];
      
      // Increase nastiness for provocative actions
      if (this.isProvocativeAction(news)) {
        this.gameState.nastiness = Math.min(127, this.gameState.nastiness + news.newValue - news.oldValue);
      }
      
      // Check for crisis potential
      this.checkCrisisPotential(news);
    }
    
    // Clear processed news
    this.gameState.newsQueue = [];
  }

  // Check if action is provocative
  private isProvocativeAction(news: any): boolean {
    const provocativeTypes = [PolicyType.INT_REB, PolicyType.INSG, PolicyType.DESTABL, PolicyType.PRESSUR];
    return provocativeTypes.includes(news.verb) && news.subject < 3;
  }

  // Check crisis potential
  private checkCrisisPotential(news: any): void {
    if (news.subject === this.gameState.humanPlayer && 
        news.newValue > news.oldValue && 
        !this.gameState.twoPlayerFlag) {
      
      // Calculate crisis probability
      const crisisProb = this.calculateCrisisProbability(news);
      
      if (Math.random() < crisisProb) {
        this.triggerCrisis(news);
      }
    }
  }

  // Calculate crisis probability
  private calculateCrisisProbability(news: any): number {
    // Simplified crisis probability calculation
    const importance = Math.abs(news.newValue - news.oldValue);
    const prestige = this.gameState.prestigeValues[news.object] || 1;
    return Math.min(0.5, importance * prestige / 10000);
  }

  // Trigger crisis
  private triggerCrisis(news: any): void {
    console.log(`⚠️ Crisis triggered: ${news.subject} -> ${news.object}`);
    this.gameState.nastiness += 10;
    // Add crisis news item
    this.gameState.newsQueue.push({
      id: this.gameState.newsCounter++,
      subject: news.subject,
      verb: news.verb,
      object: news.object,
      oldValue: news.oldValue,
      newValue: news.newValue,
      host: news.object,
      crisisValue: true,
      newsWorth: 100,
      headline: `Crisis in ${news.object}`,
      isCrisis: true
    });
  }

  // Calculate diplomatic reactions (from original ReactNews) - CORRECTED
  private calculateDiplomaticReactions(): void {
    console.log('🤝 Calculating diplomatic reactions...');
    
    // Only process if year > 1989 (from original: IF Year > 1989 THEN BEGIN)
    if (this.gameState.year <= 1989) return;
    
    for (let i = 3; i <= 80; i++) { // Minor countries only (3-80)
      for (let j = 1; j <= 2; j++) { // For each superpower
        // Original formula from GAME_RULES.md
        const econAid = this.econConv(this.gameState.economicAid[j][i]);
        const gnp = this.gameState.countries.find(c => c.id === i)?.gnp || 1000;
        const gPopular = this.gameState.governmentPopularity[i];
        const destab = this.gameState.destabilization[j][i];
        const miltAid = this.gameState.militaryAid[j][i];
        const miltPress = this.gameState.militaryPressure[i] || 1;
        const insgAid = this.gameState.insurgencyAid[j][i];
        const govtIntv = this.gameState.governmentIntervention[j][i];
        const rebelIntv = this.gameState.rebelIntervention[j][i];
        const pressure = this.gameState.pressure[j][i];
        const treaty = this.gameState.treaties[j][i];
        const integrity = this.gameState.integrity[j];
        const trade = this.gameState.trade[j][i];
        
        // Original formula exactly as specified
        let x = Math.floor((25 * Math.floor((256 * econAid) / gnp)) / (gPopular + 1))
                - (32 * destab)
                + Math.floor((miltAid * miltPress) / 8)
                - (12 * insgAid)
                + Math.floor((govtIntv * miltPress) / 4)
                - (64 * rebelIntv)
                - (16 * pressure)
                + Math.floor((Math.floor((treaty * integrity) / 128) * miltPress) / 8)
                + (8 * (trade - 3));
        
        x = Math.floor(x / 8);
        
        // Apply diplomatic change
        this.changeDiplomaticAffinity(i, j, x);
      }
      
      // Minor country reactions to each other (level 4 only)
      if (this.gameState.level === 4) {
        for (let j = 3; j <= 80; j++) {
          if (i === j) continue;
          
          const miltAid = this.gameState.militaryAid[j][i];
          const miltPress = this.gameState.militaryPressure[i] || 1;
          const insgAid = this.gameState.insurgencyAid[j][i];
          const govtIntv = this.gameState.governmentIntervention[j][i];
          const rebelIntv = this.gameState.rebelIntervention[j][i];
          
          // Original formula for minor-minor reactions
          let x = Math.floor((miltAid * miltPress) / 8)
                  - (12 * insgAid)
                  + Math.floor((govtIntv * miltPress) / 4)
                  - (64 * rebelIntv);
          
          x = Math.floor(x / 8);
          
          // Apply diplomatic change
          this.changeDiplomaticAffinity(i, j, x);
        }
      }
    }
  }

  // Economic aid conversion
  private econConv(level: number): number {
    const conversions = [0, 1, 2, 5, 10, 20];
    return conversions[Math.min(level, 5)] || 0;
  }

  // Save history
  private saveHistory(): void {
    // Save current state for historical tracking
    this.gameState.history.push({
      year: this.gameState.year,
      usaScore: this.gameState.usaScore,
      ussrScore: this.gameState.ussrScore,
      nastiness: this.gameState.nastiness,
      countries: JSON.parse(JSON.stringify(this.gameState.countries))
    });
  }

  // Develop countries (from DevelopC procedure)
  private developCountries(): void {
    for (let i = 1; i <= 80; i++) {
      console.log(`🏛️ Developing country ${i}...`);
      
      // Reset event flags
      this.gameState.finlandizationFlag[i] = false;
      this.gameState.coupFlag[i] = false;
      this.gameState.revolutionFlag[i] = false;
      
      // Calculate military power
      this.calculateMilitaryPower(i);
      
      // Calculate insurgency power
      this.calculateInsurgencyPower(i);
      
      // Check for revolutions
      this.checkRevolutionConditions(i);
      
      // Process economy and demography
      this.processEconomyAndDemography(i);
      
      // Check for coups
      this.checkCoupConditions(i);
      
      // Update finlandization
      this.updateFinlandization(i);
      
      // Reset temporary policies
      this.gameState.pressure[1][i] = 0;
      this.gameState.pressure[2][i] = 0;
      this.gameState.destabilization[1][i] = 0;
      this.gameState.destabilization[2][i] = 0;
    }
  }

  // Calculate military power (from original formula)
  private calculateMilitaryPower(countryId: number): void {
    const country = this.gameState.countries.find(c => c.id === countryId);
    if (!country) return;
    
    const milMen = country.militaryMen || 1000;
    const miltSpnd = country.militarySpending || 100;
    const govtAid = this.gameState.governmentAid[countryId] || 0;
    
    let temp = Math.floor((miltSpnd + govtAid) / 2);
    if (temp < 1) temp = 1;
    
    // Calculate intervention bonus
    let interventionBonus = 0;
    for (let sp = 1; sp <= 2; sp++) {
      const govtIntv = this.gameState.governmentIntervention[sp][countryId];
      if (govtIntv > 0) {
        interventionBonus += this.intvConv(govtIntv);
      }
    }
    
    // Original formula: MilPowr[i] := ((4*temp*x) div (temp+x)) + y;
    this.gameState.militaryPower[countryId] = Math.floor((4 * temp * milMen) / (temp + milMen)) + interventionBonus;
    
    // Update government strength
    this.gameState.governmentStrength[countryId] = this.gameState.militaryPower[countryId];
  }

  // Calculate insurgency power (from original formula)
  private calculateInsurgencyPower(countryId: number): void {
    const country = this.gameState.countries.find(c => c.id === countryId);
    if (!country) return;
    
    const maturity = this.gameState.maturity[countryId] || 128;
    const population = country.population || 1000000;
    const sqrtStrg = this.gameState.strengthRatio[countryId] || 1;
    
    // Calculate base insurgency strength
    let x = Math.floor((((256 - maturity) * population) / 256) * sqrtStrg) / 80;
    
    // Calculate insurgency aid bonus
    let temp = 0;
    for (let sp = 1; sp <= 2; sp++) {
      const insgAid = this.gameState.insurgencyAid[sp][countryId];
      temp += 2 * this.mAidConv(insgAid);
    }
    
    if (temp < Math.floor(x / 8) + 1) {
      temp = Math.floor(x / 8) + 1;
    }
    
    // Calculate intervention bonus
    let interventionBonus = 0;
    for (let sp = 1; sp <= 2; sp++) {
      const rebelIntv = this.gameState.rebelIntervention[sp][countryId];
      if (rebelIntv > 0) {
        interventionBonus += this.intvConv(rebelIntv);
      }
    }
    
    // Original formula: InsgPowr[i] := ((4*temp*x) div (temp+x)) + y;
    this.gameState.insurgencyPower[countryId] = Math.floor((4 * temp * x) / (temp + x)) + interventionBonus;
    
    // Superpowers don't have insurgency
    if (countryId < 3) {
      this.gameState.insurgencyPower[countryId] = 1;
    }
    
    // Update insurgency strength
    this.gameState.insurgencyStrength[countryId] = this.gameState.insurgencyPower[countryId];
    
    // Calculate strength ratio
    const govtStrg = this.gameState.governmentStrength[countryId];
    const insgStrg = this.gameState.insurgencyStrength[countryId];
    this.gameState.strengthRatio[countryId] = Math.floor(govtStrg / insgStrg);
  }

  // Military aid conversion
  private mAidConv(level: number): number {
    const conversions = [0, 1, 5, 20, 50, 100];
    return conversions[Math.min(level, 5)] || 0;
  }

  // Intervention conversion
  private intvConv(level: number): number {
    const conversions = [0, 1, 5, 20, 100, 500];
    return conversions[Math.min(level, 5)] || 0;
  }

  // Process economy and demography
  private processEconomyAndDemography(countryId: number): void {
    const country = this.gameState.countries.find(c => c.id === countryId);
    if (!country) return;
    
    // Calculate economic pressures
    const consPress = Math.max(1, (20 - this.gameState.governmentPopularity[countryId]) * 10);
    const invtPress = Math.max(1, (80 - this.gameState.investmentFraction[countryId]) * 2);
    const miltPress = Math.max(1, this.gameState.strengthRatio[countryId] + 
      (this.gameState.finlandizationProb[1][countryId] || 0) + 
      (this.gameState.finlandizationProb[2][countryId] || 0));
    
    this.gameState.militaryPressure[countryId] = miltPress;
    
    // Update economic fractions
    let pot = 0;
    if (this.gameState.consumptionFraction[countryId] > 16) {
      this.gameState.consumptionFraction[countryId] -= 8;
      pot += 8;
    }
    if (this.gameState.investmentFraction[countryId] > 16) {
      this.gameState.investmentFraction[countryId] -= 8;
      pot += 8;
    }
    if (this.gameState.militaryFraction[countryId] > 16) {
      this.gameState.militaryFraction[countryId] -= 8;
      pot += 8;
    }
    
    const sum = consPress + invtPress + miltPress;
    this.gameState.investmentFraction[countryId] += Math.floor((invtPress * pot) / sum);
    this.gameState.militaryFraction[countryId] += Math.floor((miltPress * pot) / sum);
    this.gameState.consumptionFraction[countryId] = 255 - this.gameState.investmentFraction[countryId] - this.gameState.militaryFraction[countryId];
    
    // Economic growth
    const econAidBonus = this.econConv(this.gameState.economicAid[1][countryId]) + 
                        this.econConv(this.gameState.economicAid[2][countryId]);
    const pseudGNP = country.gnp + econAidBonus;
    const growth = Math.floor((pseudGNP * 2 * (this.gameState.investmentFraction[countryId] - 30)) / 1000);
    country.gnp = Math.max(1, country.gnp + growth);
    
    // Population growth
    const oldConsS = Math.floor((this.gameState.consumptionSpending[countryId] * 255) / country.population);
    const popGrowth = Math.max(1, 30 - Math.floor(oldConsS / 40));
    const popIncrease = Math.floor((country.population * popGrowth) / 1000);
    country.population = Math.max(1000, country.population + popIncrease);
    
    // Update military men
    country.militaryMen = Math.floor((country.population * this.gameState.draftFraction[countryId]) / 256);
    
    // Update spending
    const newPseudGNP = country.gnp + econAidBonus;
    this.gameState.consumptionSpending[countryId] = Math.floor((this.gameState.consumptionFraction[countryId] * newPseudGNP) / 256);
    this.gameState.investmentSpending[countryId] = Math.floor((this.gameState.investmentFraction[countryId] * newPseudGNP) / 256);
    country.militarySpending = Math.max(1, (newPseudGNP - this.gameState.consumptionSpending[countryId] - this.gameState.investmentSpending[countryId]) * 10);
    
    // Update government popularity
    const newConsS = Math.floor((this.gameState.consumptionFraction[countryId] * newPseudGNP) / country.population);
    const delta = Math.floor(((newConsS - oldConsS) * 100) / (oldConsS + 1));
    this.gameState.governmentPopularity[countryId] = Math.max(0, 
      this.gameState.governmentPopularity[countryId] + delta + Math.floor(Math.abs(this.gameState.governmentWing[countryId]) / 64) - 3);
    
    // Superpowers have fixed popularity
    if (countryId < 3) {
      this.gameState.governmentPopularity[countryId] = 20;
    }
  }

  // Update superpower attributes
  // Update superpower attributes (from original MainMove) - CORRECTED
  private updateSuperpowerAttributes(): void {
    // CORRECTED: Use 1-based indexing for superpowers (1=USA, 2=USSR)
    for (let j = 1; j <= 2; j++) {
      // Reduce pugnacity (from original: Pugnacty[j] := Pugnacty[j] - 4)
      this.gameState.pugnacity[j] = Math.max(0, this.gameState.pugnacity[j] - 4);
      
      // Update adventure (from original formula)
      // Adventur[j] := Pugnacty[j] + Nastiness - Pugnacty[3-j] - MiltFrac[j] + 32;
      const otherSuperpower = j === 1 ? 2 : 1;
      const miltFrac = this.gameState.militaryFraction[j] || 0;
      this.gameState.adventure[j] = Math.max(1, 
        this.gameState.pugnacity[j] + this.gameState.nastiness - 
        this.gameState.pugnacity[otherSuperpower] - miltFrac + 32);
      
      // Increase integrity (from original: Integrty[j] := Integrty[j] + 5)
      this.gameState.integrity[j] = Math.min(127, this.gameState.integrity[j] + 5);
    }
  }

  // Computer AI (simplified version)
  private computerAI(): void {
    console.log('🤖 Computer AI processing...');
    
    // Simple AI that applies random policies
    for (let countryId = 3; countryId <= 80; countryId++) {
      if (Math.random() < 0.1) { // 10% chance per country
        const policyType = Math.floor(Math.random() * 9);
        const value = Math.floor(Math.random() * 6);
        this.applyPolicy(this.gameState.computerPlayer, countryId, policyType, value);
      }
    }
  }

  // Minor country AI (level 4 only)
  private minorCountryAI(): void {
    console.log('🌍 Minor country AI processing...');
    
    // Minor countries can apply policies to neighbors
    for (let i = 3; i <= 80; i++) {
      if (this.gameState.strengthRatio[i] > 64 && Math.random() < 0.05) {
        // Find a neighbor to influence
        const neighborId = Math.floor(Math.random() * 78) + 3;
        if (neighborId !== i) {
          const policyType = Math.floor(Math.random() * 4) + 1; // Military, Insurgency, Govt Intv, Rebel Intv
          const value = Math.floor(Math.random() * 3) + 1;
          this.applyPolicy(i, neighborId, policyType, value);
        }
      }
    }
  }

  // Calculate total influence (helper method) - CORRECTED to match GAME_RULES.md
  private calculateTotalInfluence(superpower: number, countryId: number): number {
    // Use exact formula from GAME_RULES.md
    // x := Treaty + EconAid + MiltAid + 2*IntvGovt - 2*Destab - 2*InsgAid - 4*IntvRebl
    const treaties = this.gameState.treaties[superpower][countryId] || 0;
    const economicAid = this.gameState.economicAid[superpower][countryId] || 0;
    const militaryAid = this.gameState.militaryAid[superpower][countryId] || 0;
    const governmentIntervention = this.gameState.governmentIntervention[superpower][countryId] || 0;
    const destabilization = this.gameState.destabilization[superpower][countryId] || 0;
    const insurgencyAid = this.gameState.insurgencyAid[superpower][countryId] || 0;
    const rebelIntervention = this.gameState.rebelIntervention[superpower][countryId] || 0;
    
    // Original formula exactly as specified
    let influence = treaties + economicAid + militaryAid 
                  + 2 * governmentIntervention 
                  - 2 * destabilization 
                  - 2 * insurgencyAid 
                  - 4 * rebelIntervention;
    
    // IF x < 0 THEN x := 0;
    return Math.max(0, influence);
  }

  // Update finlandization (from original DoFinliz)
  private updateFinlandization(countryId: number): void {
    if (countryId < 3) return; // Superpowers don't get finlandized
    
    // Calculate finlandization probability for each superpower
    for (let sp = 1; sp <= 2; sp++) {
      const influence = this.calculateTotalInfluence(sp, countryId);
      const prestige = this.gameState.prestigeValues[countryId];
      
      // Simplified finlandization calculation
      let prob = Math.floor((influence * prestige) / 1000);
      if (prob > 127) prob = 127;
      
      this.gameState.finlandizationProb[sp][countryId] = prob;
      
      // Check if finlandization occurs
      if (prob >= 100 && Math.random() < 0.1) { // 10% chance if threshold met
        this.gameState.finlandizationFlag[countryId] = true;
        console.log(`🇫🇮 Finlandization in country ${countryId} by superpower ${sp}`);
      }
    }
  }

  // Process random events
  private processRandomEvents(): void {
    // Random chance of events occurring
    if (Math.random() < 0.1) { // 10% chance per turn
      this.generateRandomEvent();
    }
  }

  // Generate a random event
  private generateRandomEvent(): void {
    const eventTypes = ['coup', 'revolution', 'crisis', 'treaty'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const countryId = Math.floor(Math.random() * 80) + 1;
    
    console.log(`📰 Random event: ${eventType} in country ${countryId}`);
    
    // Process the event
    switch (eventType) {
      case 'coup':
        this.processCoup(countryId);
        break;
      case 'revolution':
        this.processRevolution(countryId);
        break;
      case 'crisis':
        this.processCrisis(countryId);
        break;
      case 'treaty':
        this.processTreaty(countryId);
        break;
    }
  }

  // Process coup d'etat
  private processCoup(countryId: number): void {
    this.gameState.coupFlag[countryId] = true;
    this.gameState.governmentStrength[countryId] = Math.floor(this.gameState.governmentStrength[countryId] / 2);
    console.log(`💥 Coup d'etat in country ${countryId}`);
  }

  // Process revolution
  private processRevolution(countryId: number): void {
    this.gameState.revolutionFlag[countryId] = true;
    this.gameState.governmentStrength[countryId] = Math.floor(this.gameState.governmentStrength[countryId] / 3);
    this.gameState.insurgencyStrength[countryId] *= 2;
    console.log(`🔥 Revolution in country ${countryId}`);
  }

  // Process crisis
  private processCrisis(countryId: number): void {
    this.gameState.nastiness += 10;
    console.log(`⚠️ Crisis in country ${countryId}`);
  }

  // Process treaty
  private processTreaty(countryId: number): void {
    // Random superpower gets treaty
    const superpower = Math.random() < 0.5 ? 1 : 2;
    this.gameState.treaties[superpower][countryId] = Math.min(this.gameState.treaties[superpower][countryId] + 1, 7);
    console.log(`📜 Treaty signed with ${superpower === 1 ? 'USA' : 'USSR'} in country ${countryId}`);
  }

  // Check for crises and revolutions
  private checkCrises(): void {
    for (let i = 1; i <= 80; i++) {
      // Check for finlandization
      this.checkFinlandization(i);
      
      // Check for coup conditions
      this.checkCoupConditions(i);
      
      // Check for revolution conditions
      this.checkRevolutionConditions(i);
    }
  }

  // Check finlandization conditions
  private checkFinlandization(countryId: number): void {
    const usaInfluence = this.gameState.economicAid[1][countryId] + 
                        this.gameState.militaryAid[1][countryId] + 
                        this.gameState.treaties[1][countryId];
    const ussrInfluence = this.gameState.economicAid[2][countryId] + 
                         this.gameState.militaryAid[2][countryId] + 
                         this.gameState.treaties[2][countryId];
    
    if (usaInfluence >= 10 && ussrInfluence >= 10) {
      this.gameState.finlandizationFlag[countryId] = true;
      console.log(`🇫🇮 Finlandization in country ${countryId}`);
    }
  }

  // Check coup conditions
  private checkCoupConditions(countryId: number): void {
    if (this.gameState.governmentStrength[countryId] < this.gameState.insurgencyStrength[countryId] * 2) {
      if (Math.random() < 0.1) { // 10% chance
        this.processCoup(countryId);
      }
    }
  }

  // Check revolution conditions
  private checkRevolutionConditions(countryId: number): void {
    if (this.gameState.governmentPopularity[countryId] < 20 && 
        this.gameState.insurgencyStrength[countryId] > this.gameState.governmentStrength[countryId]) {
      if (Math.random() < 0.05) { // 5% chance
        this.processRevolution(countryId);
      }
    }
  }

  // Check victory conditions (from original game rules) - CORRECTED
  private checkVictoryConditions(): void {
    // CORRECTED: Victory is determined by highest score at end of 1997
    if (this.gameState.year >= 1997) {
      if (this.gameState.usaScore > this.gameState.ussrScore) {
        this.gameState.winFlag = true;
        console.log('🏆 USA Victory! Final Score: USA=' + this.gameState.usaScore + ', USSR=' + this.gameState.ussrScore);
      } else if (this.gameState.ussrScore > this.gameState.usaScore) {
        this.gameState.winFlag = true;
        console.log('🏆 USSR Victory! Final Score: USSR=' + this.gameState.ussrScore + ', USA=' + this.gameState.usaScore);
      } else {
        this.gameState.quitFlag = true;
        console.log('🤝 Tie Game! Both superpowers have equal scores: ' + this.gameState.usaScore);
      }
    }
    
    // Nuclear war condition (from original: Nastiness = 127)
    if (this.gameState.nastiness >= 127) {
      this.gameState.quitFlag = true;
      console.log('💥 NUCLEAR WAR! Game ended due to maximum tension (Nastiness = ' + this.gameState.nastiness + ')');
    }
  }

  // Apply policy change
  public applyPolicy(superpower: number, countryId: number, policyType: PolicyType, value: number): void {
    console.log(`📋 Applying policy: ${superpower === 1 ? 'USA' : 'USSR'} -> Country ${countryId}, Type ${policyType}, Value ${value}`);
    
    switch (policyType) {
      case PolicyType.ECON:
        this.gameState.economicAid[superpower][countryId] = Math.max(0, Math.min(7, value));
        break;
      case PolicyType.MILTRY:
        this.gameState.militaryAid[superpower][countryId] = Math.max(0, Math.min(7, value));
        break;
      case PolicyType.INSG:
        this.gameState.insurgencyAid[superpower][countryId] = Math.max(0, Math.min(7, value));
        break;
      case PolicyType.INT_GOV:
        this.gameState.governmentIntervention[superpower][countryId] = Math.max(0, Math.min(7, value));
        break;
      case PolicyType.INT_REB:
        this.gameState.rebelIntervention[superpower][countryId] = Math.max(0, Math.min(7, value));
        break;
      case PolicyType.PRESSUR:
        this.gameState.pressure[superpower][countryId] = Math.max(0, Math.min(7, value));
        break;
      case PolicyType.TREATO:
        this.gameState.treaties[superpower][countryId] = Math.max(0, Math.min(7, value));
        break;
      case PolicyType.DESTABL:
        this.gameState.destabilization[superpower][countryId] = Math.max(0, Math.min(7, value));
        break;
    }
    
    // Update diplomatic relations
    this.updateDiplomaticRelations();
  }

  // Change diplomatic affinity
  private changeDiplomaticAffinity(from: number, to: number, delta: number): void {
    const current = this.gameState.diplomaticAffinity[from][to] || 0;
    const newValue = Math.max(-127, Math.min(127, current + delta));
    this.gameState.diplomaticAffinity[from][to] = newValue;
    this.gameState.diplomaticAffinity[to][from] = newValue; // Symmetric
  }

  // Get country color index
  private getCountryColorIndex(gameState: GameState, countryId: number): number {
    const color = ScoreCalculator.getCountryColor(gameState, countryId);
    // Convert color string to index
    const colorMap: { [key: string]: number } = {
      '#ffffff': 0, // White
      '#00ffff': 1, // Cyan
      '#00ff00': 2, // Green
      '#ff0000': 3, // Red
      '#0000ff': 4, // Blue
      '#ffff00': 5, // Yellow
      '#ff00ff': 6, // Magenta
      '#808080': 7, // Gray
      '#8B4513': 8, // Brown
      '#000000': 9  // Black
    };
    return colorMap[color] || 0;
  }

  // Get current game state
  public getGameState(): GameState {
    return this.gameState;
  }

  // Set game state
  public setGameState(gameState: GameState): void {
    this.gameState = gameState;
  }
}
