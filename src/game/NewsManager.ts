import { GameState, NewsItem, PolicyType } from './GameState.js';

// News and events system based on original game mechanics
export class NewsManager {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  // Generate news based on game events
  public generateNews(): void {
    console.log('📰 Generating news...');
    
    // Process policy changes
    this.processPolicyNews();
    
    // Process random events
    this.processRandomEvents();
    
    // Process crisis events
    this.processCrisisEvents();
    
    // Process diplomatic events
    this.processDiplomaticEvents();
    
    // Clean up old news
    this.cleanupOldNews();
  }

  // Process news from policy changes
  private processPolicyNews(): void {
    // This would be called when policies are applied
    // For now, we'll generate some sample news
  }

  // Process random events
  private processRandomEvents(): void {
    const eventChance = 0.15; // 15% chance per turn
    
    if (Math.random() < eventChance) {
      this.generateRandomEvent();
    }
  }

  // Generate a random event
  private generateRandomEvent(): void {
    const eventTypes = [
      'coup', 'revolution', 'crisis', 'treaty', 'assassination',
      'election', 'natural_disaster', 'economic_crisis', 'military_coup'
    ];
    
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const countryId = Math.floor(Math.random() * 80) + 1;
    
    this.createEventNews(eventType, countryId);
  }

  // Create news item for an event
  private createEventNews(eventType: string, countryId: number): void {
    const country = this.gameState.countries.find(c => c.id === countryId);
    const countryName = country ? country.name : `Country ${countryId}`;
    
    const eventTemplates = {
      coup: [
        `Military coup in ${countryName}`,
        `${countryName} government overthrown`,
        `Coup d'etat reported in ${countryName}`,
        `Military takes control in ${countryName}`
      ],
      revolution: [
        `Revolution breaks out in ${countryName}`,
        `Popular uprising in ${countryName}`,
        `Revolutionary forces gain ground in ${countryName}`,
        `${countryName} in revolutionary turmoil`
      ],
      crisis: [
        `Political crisis in ${countryName}`,
        `${countryName} faces government crisis`,
        `Constitutional crisis in ${countryName}`,
        `Political instability in ${countryName}`
      ],
      treaty: [
        `${countryName} signs new treaty`,
        `International treaty signed by ${countryName}`,
        `${countryName} enters new alliance`,
        `Treaty negotiations completed in ${countryName}`
      ],
      assassination: [
        `Political assassination in ${countryName}`,
        `Leader assassinated in ${countryName}`,
        `Assassination attempt in ${countryName}`,
        `Political violence in ${countryName}`
      ],
      election: [
        `Elections held in ${countryName}`,
        `${countryName} goes to polls`,
        `Election results announced in ${countryName}`,
        `Democratic process in ${countryName}`
      ],
      natural_disaster: [
        `Natural disaster strikes ${countryName}`,
        `${countryName} hit by natural disaster`,
        `Emergency declared in ${countryName}`,
        `Disaster relief needed in ${countryName}`
      ],
      economic_crisis: [
        `Economic crisis in ${countryName}`,
        `${countryName} faces economic turmoil`,
        `Financial crisis hits ${countryName}`,
        `Economic instability in ${countryName}`
      ],
      military_coup: [
        `Military coup in ${countryName}`,
        `Armed forces seize power in ${countryName}`,
        `Military junta takes control in ${countryName}`,
        `Coup attempt in ${countryName}`
      ]
    };

    const templates = (eventTemplates as any)[eventType] || [`Event in ${countryName}`];
    const headline = templates[Math.floor(Math.random() * templates.length)];
    
    const newsItem: NewsItem = {
      id: this.gameState.newsCounter++,
      subject: 0, // Random event
      verb: this.getEventPolicyType(eventType),
      object: countryId,
      oldValue: 0,
      newValue: 1,
      host: countryId,
      crisisValue: this.isCrisisEvent(eventType),
      newsWorth: this.calculateEventNewsWorth(eventType),
      headline: headline
    };

    this.gameState.newsQueue.push(newsItem);
    console.log(`📰 News: ${headline}`);
    
    // Process the event effects
    this.processEventEffects(eventType, countryId);
  }

  // Get policy type for event
  private getEventPolicyType(eventType: string): PolicyType {
    const eventPolicyMap = {
      coup: PolicyType.INT_GOV,
      revolution: PolicyType.INT_REB,
      crisis: PolicyType.PRESSUR,
      treaty: PolicyType.TREATO,
      assassination: PolicyType.DESTABL,
      election: PolicyType.ECON,
      natural_disaster: PolicyType.ECON,
      economic_crisis: PolicyType.ECON,
      military_coup: PolicyType.INT_GOV
    };

    return (eventPolicyMap as any)[eventType] || PolicyType.ECON;
  }

  // Check if event is a crisis
  private isCrisisEvent(eventType: string): boolean {
    const crisisEvents = ['coup', 'revolution', 'assassination', 'military_coup'];
    return crisisEvents.includes(eventType);
  }

  // Calculate news worthiness of event
  private calculateEventNewsWorth(eventType: string): number {
    const worthMap = {
      coup: 5,
      revolution: 6,
      crisis: 4,
      treaty: 3,
      assassination: 7,
      election: 2,
      natural_disaster: 4,
      economic_crisis: 3,
      military_coup: 6
    };

    return (worthMap as any)[eventType] || 2;
  }

  // Process effects of events
  private processEventEffects(eventType: string, countryId: number): void {
    switch (eventType) {
      case 'coup':
        this.processCoupEffects(countryId);
        break;
      case 'revolution':
        this.processRevolutionEffects(countryId);
        break;
      case 'crisis':
        this.processCrisisEffects(countryId);
        break;
      case 'treaty':
        this.processTreatyEffects(countryId);
        break;
      case 'assassination':
        this.processAssassinationEffects(countryId);
        break;
      case 'election':
        this.processElectionEffects(countryId);
        break;
      case 'natural_disaster':
        this.processNaturalDisasterEffects(countryId);
        break;
      case 'economic_crisis':
        this.processEconomicCrisisEffects(countryId);
        break;
      case 'military_coup':
        this.processMilitaryCoupEffects(countryId);
        break;
    }
  }

  // Process coup effects
  private processCoupEffects(countryId: number): void {
    this.gameState.coupFlag[countryId] = true;
    this.gameState.governmentStrength[countryId] = Math.floor(this.gameState.governmentStrength[countryId] / 2);
    this.gameState.governmentPopularity[countryId] = Math.max(0, this.gameState.governmentPopularity[countryId] - 20);
    this.gameState.nastiness += 10;
  }

  // Process revolution effects
  private processRevolutionEffects(countryId: number): void {
    this.gameState.revolutionFlag[countryId] = true;
    this.gameState.governmentStrength[countryId] = Math.floor(this.gameState.governmentStrength[countryId] / 3);
    this.gameState.insurgencyStrength[countryId] *= 2;
    this.gameState.governmentPopularity[countryId] = Math.max(0, this.gameState.governmentPopularity[countryId] - 30);
    this.gameState.nastiness += 15;
  }

  // Process crisis effects
  private processCrisisEffects(countryId: number): void {
    this.gameState.governmentPopularity[countryId] = Math.max(0, this.gameState.governmentPopularity[countryId] - 10);
    this.gameState.nastiness += 5;
  }

  // Process treaty effects
  private processTreatyEffects(countryId: number): void {
    // Random superpower benefits
    const superpower = Math.random() < 0.5 ? 1 : 2;
    this.gameState.treaties[superpower][countryId] = Math.min(this.gameState.treaties[superpower][countryId] + 1, 7);
    this.gameState.governmentPopularity[countryId] = Math.min(100, this.gameState.governmentPopularity[countryId] + 5);
  }

  // Process assassination effects
  private processAssassinationEffects(countryId: number): void {
    this.gameState.governmentStrength[countryId] = Math.floor(this.gameState.governmentStrength[countryId] * 0.8);
    this.gameState.governmentPopularity[countryId] = Math.max(0, this.gameState.governmentPopularity[countryId] - 25);
    this.gameState.nastiness += 20;
  }

  // Process election effects
  private processElectionEffects(countryId: number): void {
    // Elections can go either way
    if (Math.random() < 0.5) {
      this.gameState.governmentPopularity[countryId] = Math.min(100, this.gameState.governmentPopularity[countryId] + 10);
    } else {
      this.gameState.governmentPopularity[countryId] = Math.max(0, this.gameState.governmentPopularity[countryId] - 5);
    }
  }

  // Process natural disaster effects
  private processNaturalDisasterEffects(countryId: number): void {
    this.gameState.governmentStrength[countryId] = Math.floor(this.gameState.governmentStrength[countryId] * 0.9);
    this.gameState.governmentPopularity[countryId] = Math.max(0, this.gameState.governmentPopularity[countryId] - 15);
  }

  // Process economic crisis effects
  private processEconomicCrisisEffects(countryId: number): void {
    this.gameState.governmentPopularity[countryId] = Math.max(0, this.gameState.governmentPopularity[countryId] - 20);
    this.gameState.insurgencyStrength[countryId] = Math.min(this.gameState.governmentStrength[countryId], this.gameState.insurgencyStrength[countryId] + 50);
  }

  // Process military coup effects
  private processMilitaryCoupEffects(countryId: number): void {
    this.gameState.coupFlag[countryId] = true;
    this.gameState.governmentStrength[countryId] = Math.floor(this.gameState.governmentStrength[countryId] * 0.7);
    this.gameState.militaryPower[countryId] *= 1.2;
    this.gameState.nastiness += 12;
  }

  // Process crisis events
  private processCrisisEvents(): void {
    // Check for escalating tensions
    if (this.gameState.nastiness > 80) {
      if (Math.random() < 0.2) { // 20% chance
        this.generateCrisisEvent();
      }
    }
  }

  // Generate crisis event
  private generateCrisisEvent(): void {
    const crisisTypes = ['superpower_confrontation', 'regional_conflict', 'nuclear_tension'];
    const crisisType = crisisTypes[Math.floor(Math.random() * crisisTypes.length)];
    
    const headline = this.generateCrisisHeadline(crisisType);
    
    const newsItem: NewsItem = {
      id: this.gameState.newsCounter++,
      subject: 0,
      verb: PolicyType.PRESSUR,
      object: 0,
      oldValue: 0,
      newValue: 1,
      host: 0,
      crisisValue: true,
      newsWorth: 10,
      headline: headline
    };

    this.gameState.newsQueue.push(newsItem);
    console.log(`🚨 Crisis News: ${headline}`);
    
    // Increase global tension
    this.gameState.nastiness = Math.min(127, this.gameState.nastiness + 20);
  }

  // Generate crisis headline
  private generateCrisisHeadline(crisisType: string): string {
    const headlines = {
      superpower_confrontation: [
        'USA-USSR tensions reach critical level',
        'Superpower confrontation imminent',
        'Cold War tensions escalate',
        'Nuclear standoff reported'
      ],
      regional_conflict: [
        'Regional conflict threatens global stability',
        'Proxy war escalates',
        'Regional tensions spill over',
        'Conflict zone expands'
      ],
      nuclear_tension: [
        'Nuclear tensions rise',
        'Nuclear threat reported',
        'Nuclear standoff continues',
        'Nuclear crisis escalates'
      ]
    };

    const crisisHeadlines = (headlines as any)[crisisType] || ['Crisis reported'];
    return crisisHeadlines[Math.floor(Math.random() * crisisHeadlines.length)];
  }

  // Process diplomatic events
  private processDiplomaticEvents(): void {
    // Check for major diplomatic changes
    for (let i = 1; i <= 2; i++) {
      for (let j = 1; j <= 2; j++) {
        if (i !== j) {
          const affinity = this.gameState.diplomaticAffinity[i][j];
          if (affinity < -100 || affinity > 100) {
            this.generateDiplomaticNews(i, j, affinity);
          }
        }
      }
    }
  }

  // Generate diplomatic news
  private generateDiplomaticNews(superpower1: number, superpower2: number, affinity: number): void {
    const superpower1Name = superpower1 === 1 ? 'USA' : 'USSR';
    const superpower2Name = superpower2 === 1 ? 'USA' : 'USSR';
    
    let headline: string;
    if (affinity < -100) {
      headline = `Tensions between ${superpower1Name} and ${superpower2Name} reach new low`;
    } else {
      headline = `${superpower1Name} and ${superpower2Name} improve relations`;
    }
    
    const newsItem: NewsItem = {
      id: this.gameState.newsCounter++,
      subject: superpower1,
      verb: PolicyType.TREATO,
      object: superpower2,
      oldValue: 0,
      newValue: Math.abs(affinity),
      host: 0,
      crisisValue: affinity < -100,
      newsWorth: Math.abs(affinity) / 20,
      headline: headline
    };

    this.gameState.newsQueue.push(newsItem);
    console.log(`📰 Diplomatic News: ${headline}`);
  }

  // Clean up old news
  private cleanupOldNews(): void {
    // Keep only the last 50 news items
    if (this.gameState.newsQueue.length > 50) {
      this.gameState.newsQueue = this.gameState.newsQueue.slice(-50);
    }
  }

  // Get recent news
  public getRecentNews(count: number = 10): NewsItem[] {
    return this.gameState.newsQueue.slice(-count);
  }

  // Get news by country
  public getNewsByCountry(countryId: number): NewsItem[] {
    return this.gameState.newsQueue.filter(news => 
      news.object === countryId || news.host === countryId
    );
  }

  // Get crisis news
  public getCrisisNews(): NewsItem[] {
    return this.gameState.newsQueue.filter(news => news.crisisValue);
  }

  // Get news worthiness score
  public getNewsWorthiness(): number {
    if (this.gameState.newsQueue.length === 0) return 0;
    
    const totalWorth = this.gameState.newsQueue.reduce((sum, news) => sum + news.newsWorth, 0);
    return totalWorth / this.gameState.newsQueue.length;
  }
}
