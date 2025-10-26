import { PolicyType } from './GameState.js';
import { COUNTRY_BY_ID } from '../data/countries.js';

// Content types
export enum ContentType {
  HEADLINE = 'headline',
  NEWS_ITEM = 'news_item',
  CRISIS_MESSAGE = 'crisis_message',
  ADVISORY_MESSAGE = 'advisory_message',
  COUNTRY_DESCRIPTION = 'country_description',
  POLICY_DESCRIPTION = 'policy_description'
}

// Content template interface
export interface ContentTemplate {
  id: string;
  type: ContentType;
  template: string;
  variables: string[];
  category?: string;
}

// Content manager class
export class ContentManager {
  private templates: Map<string, ContentTemplate> = new Map();
  private headlines: Map<string, string[]> = new Map();

  constructor() {
    this.initializeContent();
  }

  // Initialize all content templates
  private initializeContent(): void {
    this.initializeHeadlines();
    this.initializeCrisisMessages();
    this.initializeAdvisoryMessages();
    this.initializePolicyDescriptions();
  }

  // Initialize headline templates
  private initializeHeadlines(): void {
    // Economic Aid headlines
    this.headlines.set('econ_aid', [
      "{subject} provides economic assistance to {object}",
      "{subject} announces economic aid package for {object}",
      "{subject} extends economic cooperation to {object}",
      "Economic aid from {subject} reaches {object}",
      "{subject} offers economic support to {object}"
    ]);

    // Military Aid headlines
    this.headlines.set('mil_aid', [
      "{subject} provides military assistance to {object}",
      "{subject} announces military aid package for {object}",
      "{subject} extends military cooperation to {object}",
      "Military aid from {subject} reaches {object}",
      "{subject} offers military support to {object}"
    ]);

    // Insurgency Aid headlines
    this.headlines.set('insg_aid', [
      "{subject} supports insurgent groups in {object}",
      "{subject} provides covert aid to rebels in {object}",
      "{subject} backs anti-government forces in {object}",
      "Insurgent support from {subject} reaches {object}",
      "{subject} aids rebel movements in {object}"
    ]);

    // Government Intervention headlines
    this.headlines.set('gov_intv', [
      "{subject} intervenes in {object} government affairs",
      "{subject} takes direct action in {object}",
      "{subject} launches government intervention in {object}",
      "{subject} exerts pressure on {object} government",
      "{subject} intervenes directly in {object}"
    ]);

    // Rebel Intervention headlines
    this.headlines.set('reb_intv', [
      "{subject} supports rebel forces in {object}",
      "{subject} backs insurgent movements in {object}",
      "{subject} aids anti-government forces in {object}",
      "{subject} supports rebel cause in {object}",
      "{subject} backs insurgent groups in {object}"
    ]);

    // Pressure headlines
    this.headlines.set('pressure', [
      "{subject} applies diplomatic pressure on {object}",
      "{subject} increases pressure on {object}",
      "{subject} exerts diplomatic pressure on {object}",
      "{subject} steps up pressure on {object}",
      "{subject} applies pressure to {object}"
    ]);

    // Treaty headlines
    this.headlines.set('treaty', [
      "{subject} signs treaty with {object}",
      "{subject} announces treaty with {object}",
      "{subject} concludes treaty with {object}",
      "{subject} enters into treaty with {object}",
      "{subject} signs agreement with {object}"
    ]);

    // Crisis headlines
    this.headlines.set('crisis', [
      "International crisis erupts over {subject} actions in {object}",
      "{subject} actions in {object} spark international crisis",
      "Crisis develops over {subject} policy toward {object}",
      "{subject} actions in {object} cause diplomatic crisis",
      "International tensions rise over {subject} actions in {object}"
    ]);

    // Nuclear crisis headlines
    this.headlines.set('nuclear_crisis', [
      "Nuclear war threat escalates over {subject} actions in {object}",
      "{subject} actions in {object} bring world to brink of nuclear war",
      "Nuclear crisis develops over {subject} policy toward {object}",
      "{subject} actions in {object} threaten nuclear conflict",
      "World faces nuclear crisis over {subject} actions in {object}"
    ]);

    // Revolution headlines
    this.headlines.set('revolution', [
      "Revolution breaks out in {object}",
      "{object} government overthrown by revolution",
      "Revolutionary forces seize power in {object}",
      "{object} experiences revolutionary upheaval",
      "Revolution sweeps through {object}"
    ]);

    // Coup headlines
    this.headlines.set('coup', [
      "Military coup overthrows {object} government",
      "{object} government toppled in military coup",
      "Coup d'état removes {object} government",
      "Military coup seizes power in {object}",
      "{object} government falls to military coup"
    ]);

    // War headlines
    this.headlines.set('war', [
      "War breaks out between {subject} and {object}",
      "{subject} declares war on {object}",
      "Armed conflict erupts between {subject} and {object}",
      "{subject} launches military attack on {object}",
      "War erupts between {subject} and {object}"
    ]);
  }

  // Initialize crisis messages
  private initializeCrisisMessages(): void {
    const crisisTemplates: ContentTemplate[] = [
      {
        id: 'crisis_back_down',
        type: ContentType.CRISIS_MESSAGE,
        template: "{subject} backs down from confrontation with {object}",
        variables: ['subject', 'object']
      },
      {
        id: 'crisis_negotiate',
        type: ContentType.CRISIS_MESSAGE,
        template: "{subject} offers to negotiate with {object}",
        variables: ['subject', 'object']
      },
      {
        id: 'crisis_refuse',
        type: ContentType.CRISIS_MESSAGE,
        template: "{subject} refuses to negotiate with {object}",
        variables: ['subject', 'object']
      },
      {
        id: 'crisis_threaten',
        type: ContentType.CRISIS_MESSAGE,
        template: "{subject} threatens war if {object} continues current policy",
        variables: ['subject', 'object']
      },
      {
        id: 'nuclear_war',
        type: ContentType.CRISIS_MESSAGE,
        template: "NUCLEAR WAR! The world has ended in nuclear holocaust.",
        variables: []
      }
    ];

    crisisTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Initialize advisory messages
  private initializeAdvisoryMessages(): void {
    const advisoryTemplates: ContentTemplate[] = [
      {
        id: 'advisor_economic',
        type: ContentType.ADVISORY_MESSAGE,
        template: "Economic aid will improve relations with {object} and increase our influence.",
        variables: ['object']
      },
      {
        id: 'advisor_military',
        type: ContentType.ADVISORY_MESSAGE,
        template: "Military aid will strengthen {object} and deter our enemies.",
        variables: ['object']
      },
      {
        id: 'advisor_insurgency',
        type: ContentType.ADVISORY_MESSAGE,
        template: "Supporting insurgents in {object} will destabilize the current government.",
        variables: ['object']
      },
      {
        id: 'advisor_intervention',
        type: ContentType.ADVISORY_MESSAGE,
        template: "Direct intervention in {object} will secure our interests but may provoke crisis.",
        variables: ['object']
      },
      {
        id: 'advisor_pressure',
        type: ContentType.ADVISORY_MESSAGE,
        template: "Diplomatic pressure on {object} may force compliance without military action.",
        variables: ['object']
      },
      {
        id: 'advisor_treaty',
        type: ContentType.ADVISORY_MESSAGE,
        template: "A treaty with {object} will formalize our relationship and provide stability.",
        variables: ['object']
      },
      {
        id: 'advisor_crisis',
        type: ContentType.ADVISORY_MESSAGE,
        template: "This action may trigger an international crisis. Consider the consequences carefully.",
        variables: []
      },
      {
        id: 'advisor_nuclear',
        type: ContentType.ADVISORY_MESSAGE,
        template: "WARNING: This action may lead to nuclear war! The stakes are extremely high.",
        variables: []
      }
    ];

    advisoryTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Initialize policy descriptions
  private initializePolicyDescriptions(): void {
    const policyTemplates: ContentTemplate[] = [
      {
        id: 'policy_econ_desc',
        type: ContentType.POLICY_DESCRIPTION,
        template: "Economic Aid: Provide financial assistance to strengthen the economy and improve relations.",
        variables: []
      },
      {
        id: 'policy_mil_desc',
        type: ContentType.POLICY_DESCRIPTION,
        template: "Military Aid: Supply weapons and military equipment to strengthen the armed forces.",
        variables: []
      },
      {
        id: 'policy_insg_desc',
        type: ContentType.POLICY_DESCRIPTION,
        template: "Insurgency Aid: Support rebel groups and anti-government forces to destabilize the regime.",
        variables: []
      },
      {
        id: 'policy_gov_intv_desc',
        type: ContentType.POLICY_DESCRIPTION,
        template: "Government Intervention: Direct military or political intervention to support the current government.",
        variables: []
      },
      {
        id: 'policy_reb_intv_desc',
        type: ContentType.POLICY_DESCRIPTION,
        template: "Rebel Intervention: Direct military support for rebel forces against the current government.",
        variables: []
      },
      {
        id: 'policy_pressure_desc',
        type: ContentType.POLICY_DESCRIPTION,
        template: "Pressure: Apply diplomatic pressure through sanctions, threats, or other non-military means.",
        variables: []
      },
      {
        id: 'policy_treaty_desc',
        type: ContentType.POLICY_DESCRIPTION,
        template: "Treaty: Sign formal agreements for mutual cooperation, defense, or economic partnership.",
        variables: []
      }
    ];

    policyTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Generate headline
  public generateHeadline(type: string, subject: number, object: number, verb?: PolicyType): string {
    const templates = this.headlines.get(type);
    if (!templates || templates.length === 0) {
      return `Action by ${this.getCountryName(subject)} affects ${this.getCountryName(object)}`;
    }

    const template = templates[Math.floor(Math.random() * templates.length)];
    return this.processTemplate(template, {
      subject: this.getCountryName(subject),
      object: this.getCountryName(object)
    });
  }

  // Generate policy headline
  public generatePolicyHeadline(subject: number, verb: PolicyType, object: number): string {
    const verbMap: Record<PolicyType, string> = {
      [PolicyType.ECON]: 'econ_aid',
      [PolicyType.MILTRY]: 'mil_aid',
      [PolicyType.INSG]: 'insg_aid',
      [PolicyType.INT_GOV]: 'gov_intv',
      [PolicyType.INT_REB]: 'reb_intv',
      [PolicyType.PRESSUR]: 'pressure',
      [PolicyType.TREATO]: 'treaty',
      [PolicyType.DESTABL]: 'insg_aid',
      [PolicyType.TRADO]: 'treaty'
    };

    const headlineType = verbMap[verb] || 'econ_aid';
    return this.generateHeadline(headlineType, subject, object);
  }

  // Generate crisis headline
  public generateCrisisHeadline(subject: number, object: number, crisisLevel: number): string {
    if (crisisLevel <= 3) {
      return this.generateHeadline('nuclear_crisis', subject, object);
    } else {
      return this.generateHeadline('crisis', subject, object);
    }
  }

  // Generate advisory message
  public generateAdvisoryMessage(type: string, object?: number): string {
    const template = this.templates.get(type);
    if (!template) {
      return "Consider your options carefully.";
    }

    const variables: Record<string, string> = {};
    if (object) {
      variables.object = this.getCountryName(object);
    }

    return this.processTemplate(template.template, variables);
  }

  // Generate policy description
  public generatePolicyDescription(verb: PolicyType): string {
    const verbMap: Record<PolicyType, string> = {
      [PolicyType.ECON]: 'policy_econ_desc',
      [PolicyType.MILTRY]: 'policy_mil_desc',
      [PolicyType.INSG]: 'policy_insg_desc',
      [PolicyType.INT_GOV]: 'policy_gov_intv_desc',
      [PolicyType.INT_REB]: 'policy_reb_intv_desc',
      [PolicyType.PRESSUR]: 'policy_pressure_desc',
      [PolicyType.TREATO]: 'policy_treaty_desc',
      [PolicyType.DESTABL]: 'policy_insg_desc',
      [PolicyType.TRADO]: 'policy_treaty_desc'
    };

    const templateId = verbMap[verb] || 'policy_econ_desc';
    const template = this.templates.get(templateId);
    
    if (!template) {
      return "Policy action available.";
    }

    return template.template;
  }

  // Generate country description
  public generateCountryDescription(countryId: number): string {
    const country = COUNTRY_BY_ID.get(countryId);
    if (!country) {
      return "Country information not available.";
    }

    const descriptions = [
      `${country.name} is a nation with a population of ${country.population.toLocaleString()} and a GNP of $${country.gnp.toLocaleString()}.`,
      `${country.name} has a military spending of $${country.militarySpending.toLocaleString()} and ${country.militaryMen.toLocaleString()} military personnel.`,
      `The government of ${country.name} has a ${country.governmentWing > 0 ? 'right-wing' : 'left-wing'} orientation with a stability rating of ${country.governmentStability}.`,
      `${country.name} has a prestige value of ${country.prestigeValue.toLocaleString()} and is considered ${this.getPrestigeLevel(country.prestigeValue)}.`
    ];

    return descriptions.join(' ');
  }

  // Get country name
  private getCountryName(countryId: number): string {
    const country = COUNTRY_BY_ID.get(countryId);
    return country ? country.name : `Country ${countryId}`;
  }

  // Get prestige level description
  private getPrestigeLevel(prestige: number): string {
    if (prestige >= 1000) return 'a major power';
    if (prestige >= 500) return 'a regional power';
    if (prestige >= 100) return 'a significant nation';
    return 'a minor nation';
  }

  // Process template with variables
  private processTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }

    return result;
  }

  // Get all available headline types
  public getHeadlineTypes(): string[] {
    return Array.from(this.headlines.keys());
  }

  // Get all available templates
  public getTemplates(): ContentTemplate[] {
    return Array.from(this.templates.values());
  }

  // Add custom template
  public addTemplate(template: ContentTemplate): void {
    this.templates.set(template.id, template);
  }

  // Add custom headline type
  public addHeadlineType(type: string, templates: string[]): void {
    this.headlines.set(type, templates);
  }
}
