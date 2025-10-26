// Composant pour afficher la liste des pays cliquables
import { COUNTRIES } from '../data/countries.js';

export class CountryListRenderer {
  private container: HTMLElement;
  private countryDetailModal: any;
  private gameState: any;
  private uiManager: any; // Reference to UIManager for country selection

  constructor(container: HTMLElement, countryDetailModal: any, uiManager?: any) {
    this.container = container;
    this.countryDetailModal = countryDetailModal;
    this.uiManager = uiManager;
  }

  public setGameState(gameState: any): void {
    // Store game state for potential use
    this.gameState = gameState;
  }
  
  public render(): void {
    // Vider le conteneur complètement
    this.container.innerHTML = '';
    
    // Starting country list render

    // Créer une interface simple et propre
    const mainContainer = document.createElement('div');
    mainContainer.id = 'main-game-interface';
    mainContainer.className = 'main-game-interface';

    // Titre principal
    const title = document.createElement('h1');
    title.className = 'game-title';
    title.textContent = 'BALANCE OF POWER - 1989';
    mainContainer.appendChild(title);

    // Sous-titre
    const subtitle = document.createElement('p');
    subtitle.className = 'game-subtitle';
    subtitle.textContent = 'Select a country to view details and apply policies';
    mainContainer.appendChild(subtitle);

    // Container pour les pays
    const countriesContainer = document.createElement('div');
    countriesContainer.className = 'countries-container';

    // Utiliser tous les pays du jeu (80 pays)
    const countries = COUNTRIES.map(country => ({
      id: country.id,
      name: country.name,
      category: getCountryCategory(country.id)
    }));

    // Fonction pour déterminer la catégorie d'un pays
    function getCountryCategory(countryId: number): string {
      // Superpowers
      if (countryId === 1 || countryId === 2) return 'Superpower';
      
      // Great Powers (pays avec une puissance significative)
      if ([17, 18, 20, 22, 19, 47, 43].includes(countryId)) return 'Great Power';
      
      // Regional Powers (pays moyens)
      if ([58, 12, 46, 14, 8, 27, 34].includes(countryId)) return 'Regional Power';
      
      // Strategic (pays stratégiques)
      if ([57, 3, 28, 49, 55, 51, 24, 7, 21, 26, 29, 30, 31].includes(countryId)) return 'Strategic';
      
      // Tous les autres pays
      return 'Other';
    }

    // Organiser par catégories
    const categories = {
      'Superpower': countries.filter(c => c.category === 'Superpower'),
      'Great Power': countries.filter(c => c.category === 'Great Power'),
      'Regional Power': countries.filter(c => c.category === 'Regional Power'),
      'Strategic': countries.filter(c => c.category === 'Strategic'),
      'Other': countries.filter(c => c.category === 'Other')
    };

    // Créer les sections par catégorie
    Object.entries(categories).forEach(([categoryName, categoryCountries]) => {
      const categorySection = document.createElement('div');
      categorySection.className = 'category-section';

      const categoryTitle = document.createElement('h2');
      categoryTitle.className = 'category-title';
      categoryTitle.textContent = categoryName.toUpperCase();
      categorySection.appendChild(categoryTitle);

      const countriesGrid = document.createElement('div');
      countriesGrid.className = 'countries-grid';

      categoryCountries.forEach(country => {
        const countryButton = document.createElement('button');
        countryButton.className = 'country-button';
        countryButton.textContent = country.name;
        countryButton.setAttribute('data-country-id', country.id.toString());
        
        countryButton.addEventListener('click', () => {
          this.handleCountryClick(country.id);
        });

        countriesGrid.appendChild(countryButton);
      });

      categorySection.appendChild(countriesGrid);
      countriesContainer.appendChild(categorySection);
    });

    mainContainer.appendChild(countriesContainer);
    this.container.appendChild(mainContainer);

    // Ajouter les styles
    this.addStyles();
    
    // Country list render completed
  }

  private createCountryList(): HTMLElement {
    const listContainer = document.createElement('div');
    listContainer.id = 'country-list-container';
    listContainer.className = 'country-list-container';

    // Titre
    const title = document.createElement('div');
    title.className = 'country-list-title';
    title.textContent = 'BALANCE OF POWER - 1989';
    listContainer.appendChild(title);

    // Sous-titre
    const subtitle = document.createElement('div');
    subtitle.className = 'country-list-subtitle';
    subtitle.textContent = 'Select a country to view details';
    listContainer.appendChild(subtitle);

    // Liste des pays avec les vrais IDs du système de jeu (80 pays au total)
    const countries = [
      // Superpuissances
      { id: 1, name: 'USA', description: 'United States - Western Superpower', category: 'Superpower' },
      { id: 2, name: 'Soviet Union', description: 'Soviet Union - Eastern Superpower', category: 'Superpower' },
      
      // Grandes puissances européennes
      { id: 17, name: 'Britain', description: 'United Kingdom - European Power', category: 'Great Power' },
      { id: 18, name: 'France', description: 'France - European Power', category: 'Great Power' },
      { id: 20, name: 'West Germany', description: 'West Germany - European Power', category: 'Great Power' },
      { id: 22, name: 'Italy', description: 'Italy - European Power', category: 'Great Power' },
      { id: 19, name: 'Spain', description: 'Spain - European Power', category: 'Great Power' },
      
      // Grandes puissances asiatiques
      { id: 47, name: 'China', description: 'China - Asian Great Power', category: 'Great Power' },
      { id: 43, name: 'Japan', description: 'Japan - Asian Economic Power', category: 'Great Power' },
      
      // Puissances régionales importantes
      { id: 58, name: 'India', description: 'India - Emerging Power', category: 'Regional Power' },
      { id: 12, name: 'Brazil', description: 'Brazil - South American Power', category: 'Regional Power' },
      { id: 46, name: 'Australia', description: 'Australia - Oceanian Power', category: 'Regional Power' },
      { id: 14, name: 'Canada', description: 'Canada - USA Ally', category: 'Regional Power' },
      { id: 8, name: 'Argentina', description: 'Argentina - Regional Power', category: 'Regional Power' },
      { id: 27, name: 'South Africa', description: 'South Africa - African Power', category: 'Regional Power' },
      { id: 34, name: 'Nigeria', description: 'Nigeria - African Power', category: 'Regional Power' },
      
      // Pays stratégiques
      { id: 57, name: 'Pakistan', description: 'Pakistan - Strategic Country', category: 'Strategic' },
      { id: 3, name: 'Mexico', description: 'Mexico - USA Border', category: 'Strategic' },
      { id: 28, name: 'Egypt', description: 'Egypt - Middle East Strategic', category: 'Strategic' },
      { id: 49, name: 'Turkey', description: 'Turkey - Europe-Asia Bridge', category: 'Strategic' },
      { id: 55, name: 'Iran', description: 'Iran - Middle East Power', category: 'Strategic' },
      { id: 51, name: 'Israel', description: 'Israel - Middle East Strategic', category: 'Strategic' },
      { id: 24, name: 'Poland', description: 'Poland - Eastern Europe Strategic', category: 'Strategic' },
      { id: 7, name: 'Cuba', description: 'Cuba - Caribbean Strategic', category: 'Strategic' },
      { id: 21, name: 'Romania', description: 'Romania - Eastern Europe', category: 'Strategic' },
      { id: 26, name: 'Yugoslavia', description: 'Yugoslavia - Balkans', category: 'Strategic' }
    ];

    // Grouper les pays par catégorie
    const categories = {
      'Superpower': countries.filter(c => c.category === 'Superpower'),
      'Great Power': countries.filter(c => c.category === 'Great Power'),
      'Regional Power': countries.filter(c => c.category === 'Regional Power'),
      'Strategic': countries.filter(c => c.category === 'Strategic')
    };

    // Créer les sections par catégorie
    Object.entries(categories).forEach(([categoryName, categoryCountries]) => {
      const categorySection = document.createElement('div');
      categorySection.className = 'country-category';

      const categoryTitle = document.createElement('div');
      categoryTitle.className = 'category-title';
      categoryTitle.textContent = categoryName.toUpperCase();
      categorySection.appendChild(categoryTitle);

      const countryGrid = document.createElement('div');
      categoryCountries.forEach(country => {
        const countryItem = this.createCountryItem(country);
        countryGrid.appendChild(countryItem);
      });

      categorySection.appendChild(countryGrid);
      listContainer.appendChild(categorySection);
    });

    return listContainer;
  }

  private createCountryItem(country: any): HTMLElement {
    const item = document.createElement('div');
    item.className = 'country-item';
    item.setAttribute('data-country-id', country.id.toString());
    item.setAttribute('title', country.description);

    // Juste le nom du pays, pas de description visible
    const countryName = document.createElement('span');
    countryName.className = 'country-name';
    countryName.textContent = country.name;

    item.appendChild(countryName);

    // Ajouter l'événement de clic
    item.addEventListener('click', () => {
      this.handleCountryClick(country.id);
    });

    return item;
  }

  private handleCountryClick(countryId: number): void {
    // Select the country instead of opening the modal directly
    if (this.uiManager) {
      // Use UIManager's selectCountry method
      this.uiManager.selectCountry(countryId);
    } else {
      // Fallback: open modal directly if no UIManager reference
      if (this.countryDetailModal) {
        this.countryDetailModal.show(countryId);
      }
    }
  }

  private addStyles(): void {
    // Vérifier si les styles sont déjà ajoutés
    if (document.getElementById('country-list-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'country-list-styles';
    style.textContent = `
      .main-game-interface {
        padding: 20px;
        background-color: #0000ff;
        height: 100%;
        overflow-y: auto;
        font-family: 'Courier New', monospace;
        color: #ffffff;
      }

      .game-title {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        color: #ffffff;
        background-color: #000000;
        padding: 15px;
        margin-bottom: 10px;
        border: 3px solid #ffffff;
        text-transform: uppercase;
        letter-spacing: 2px;
      }

      .game-subtitle {
        font-size: 14px;
        text-align: center;
        color: #ffffff;
        margin-bottom: 30px;
        font-style: italic;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border: 1px solid #ffffff;
      }

      .countries-container {
        display: flex;
        flex-direction: column;
        gap: 25px;
      }

      .category-section {
        background-color: rgba(0, 0, 0, 0.3);
        border: 2px solid #ffffff;
        padding: 15px;
        border-radius: 5px;
      }

      .category-title {
        font-size: 18px;
        font-weight: bold;
        color: #ffffff;
        background-color: #000000;
        padding: 10px;
        margin-bottom: 15px;
        text-align: center;
        border: 2px solid #ffffff;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .countries-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 6px;
        padding: 6px;
      }

      .country-button {
        background-color: #ffffff;
        color: #000000;
        border: 2px solid #000000;
        padding: 6px 15px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        border-radius: 3px;
      }

      .country-button:hover {
        background-color: #ffff00;
        border-color: #ff0000;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      .country-button:active {
        background-color: #ff0000;
        color: #ffffff;
        transform: translateY(0);
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .countries-grid {
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }
        
        .game-title {
          font-size: 20px;
          padding: 12px;
        }
        
        .country-button {
          padding: 5px 12px;
          font-size: 12px;
        }
      }

      @media (max-width: 480px) {
        .countries-grid {
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 4px;
        }
        
        .game-title {
          font-size: 18px;
          padding: 10px;
        }
        
        .country-button {
          padding: 4px 10px;
          font-size: 11px;
        }
      }
    `;

    document.head.appendChild(style);
  }
}
