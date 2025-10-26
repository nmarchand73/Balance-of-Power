# Balance of Power - Web Edition

A modern web adaptation of the classic geopolitical strategy game **Balance of Power** by Chris Crawford, simulating the Cold War between the USA and USSR.

## 🎮 About the Game

Balance of Power is a geopolitical strategy game where you lead either the United States or the Soviet Union during the Cold War. Your objective is to influence 80 countries worldwide through diplomacy, economic/military aid, and destabilization, while avoiding nuclear war.

### Main Mechanics

- **80 countries** with realistic geopolitical data
- **Complex diplomatic relations system**
- **Political actions**: economic aid, military aid, interventions, pressure
- **Crisis system** with nuclear escalation
- **Sophisticated artificial intelligence** with 4 difficulty levels
- **Dynamic news system** with contextual headlines

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the project
git clone https://github.com/nmarchand73/Balance-of-Power.git
cd Balance-of-Power

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3001`

### Production Build

```bash
# Build for production
npm run build

# Preview the build
npm run preview
```

## 🏗️ Technical Architecture

### Technology Stack

- **Frontend**: TypeScript + HTML5 Canvas
- **Bundler**: Vite
- **Rendering**: Canvas 2D API for interactive map
- **Storage**: LocalStorage for saves

### Module Structure

```
src/
├── main.ts                 # Entry point
├── game/
│   ├── GameEngine.ts       # Main engine
│   ├── GameState.ts        # Game state
│   ├── GameMechanics.ts    # Game mechanics
│   ├── AIEngine.ts         # Artificial intelligence
│   ├── CrisisManager.ts    # Crisis management
│   ├── ContentManager.ts   # Content management
│   ├── PolicyManager.ts    # Policy management
│   ├── NewsManager.ts      # News management
│   ├── SaveLoadManager.ts  # Save/Load management
│   └── ScoreCalculator.ts  # Score calculation
├── data/
│   ├── countries.ts        # 80 countries data
│   ├── relations.ts        # Diplomatic relations
│   └── constants.ts        # Game constants
├── ui/
│   ├── UIManager.ts        # Interface management
│   ├── CountryListRenderer.ts # Country list rendering
│   └── CountryDetailModal.ts  # Country detail modal
└── index.html              # Main page
```

## 🎯 Implemented Features

### ✅ Complete Systems

- **Game engine**: Complete turn logic, score calculations, state management
- **Artificial intelligence**: Sophisticated AI with varied strategic decisions
- **Crisis system**: Detection, nuclear escalation, player responses
- **Content system**: Dynamic headlines, policy descriptions
- **User interface**: Interactive country list, dialogs, information panels
- **Save/Load**: Game persistence via LocalStorage
- **Authentic menus**: Menu system faithful to the original Pascal game
- **Background and History windows**: Detailed interface with interactive charts

### 🎮 Available Actions

- **Economic Aid**: Strengthens economy and improves relations
- **Military Aid**: Provides weapons and military equipment
- **Insurgency Aid**: Supports rebel groups
- **Government Intervention**: Direct military action to support government
- **Rebel Intervention**: Military support for rebel forces
- **Diplomatic Pressure**: Non-military sanctions and threats
- **Treaties**: Formal cooperation agreements

### 🚨 Crisis System

- **Automatic detection**: Crises triggered by provocative actions
- **Nuclear escalation**: Levels 1-9 with nuclear war risk
- **Player responses**: Back down, negotiate, refuse, threaten
- **Consequences**: Impact on prestige and diplomatic relations

## 🎨 User Interface

### Main Screen

- **Country list**: Interactive view of 80 countries organized by categories
- **Score panel**: Real-time USA/USSR scores
- **News panel**: Dynamic events and headlines
- **Status bar**: Information about current turn and selected country
- **Authentic menus**: Apple, Game, Political, Relations, Policy, Events, Briefing, Debug

### Specialized Windows

- **Background Modal**: 
  - Interactive selectors for resources (GNP, Military Spending, Population, etc.)
  - Map visualization with legend
  - Complete details of selected country
  - Per capita and per GNP calculations

- **History Modal**:
  - Three detailed charts (Military & Intervention, Diplomatic & Economic, Political & Influence)
  - Major events timeline
  - Interactive charts with distinct USA/USSR colors
  - Recent changes section

### Dialogs

- **Policy Dialog**: Sliders to adjust action levels
- **Crisis Dialog**: Response choices to international crises
- **Closeup Dialog**: Detailed information about a country

## 🧠 Artificial Intelligence

The AI implements sophisticated strategy based on:

- **Country evaluation**: Geopolitical importance and prestige
- **Threat calculation**: Diplomatic relations and opportunities
- **Strategic decisions**: Economic aid, military aid, interventions
- **Difficulty levels**: 4 levels with more aggressive AI

## 📊 Game Data

### Countries (80 total)

Each country contains:
- Population and GDP
- Military spending and personnel
- Government orientation (left/right)
- Government stability
- Prestige value

### Diplomatic Relations

- 80x80 matrix of diplomatic affinities
- Initial relations based on history
- Dynamic evolution based on actions

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Code verification
```

### Adding Features

1. **New countries**: Modify `src/data/countries.ts`
2. **New policies**: Extend `PolicyType` in `GameState.ts`
3. **New content**: Add templates in `ContentManager.ts`
4. **New AI**: Modify logic in `AIEngine.ts`

## 🚀 Deployment

### Deployment Options

- **Netlify**: Automatic deployment from Git
- **Vercel**: Optimized for modern web applications
- **GitHub Pages**: Free hosting for open source projects
- **Personal server**: Static build to serve

### Production Configuration

```bash
# Optimized build
npm run build

# Files are generated in dist/
# Serve dist/ content via web server
```

## 📝 Version Notes

### Version 1.0.0

- ✅ Complete game engine
- ✅ Sophisticated AI with 4 levels
- ✅ Crisis system and nuclear escalation
- ✅ Dynamic content system
- ✅ Modern user interface with country list
- ✅ Save/load functionality
- ✅ 80 countries with realistic data
- ✅ Authentic menus faithful to original game
- ✅ Background and History windows with interactive charts
- ✅ Improved country selection system
- ✅ Real-time integration with game state

### Latest Features (Recent Update)

- **Enhanced Background interface**: Interactive selectors to visualize different resources (GNP, military spending, population, etc.) with per capita and per GNP calculations
- **Enriched History interface**: Detailed charts showing evolution of diplomatic relations, military/economic aid, and political events
- **Authentic menu system**: Apple, Game, Political, Relations, Policy, Events, Briefing, Debug menus faithful to original Pascal game
- **Improved country selection**: Ability to select a country without immediately opening modal, with "Details" button to access information
- **Complete country display**: Full list of 80 countries organized by categories (Superpower, Great Power, Regional Power, Strategic, Other)

## 🤝 Contributing

This project is a faithful adaptation of the original Balance of Power game. To contribute:

1. Fork the project
2. Create a feature branch
3. Commit changes
4. Open a Pull Request

## 📄 License

⚠️ **Important**: Balance of Power is copyrighted by Chris Crawford. This adaptation is created for educational purposes and preservation of video game heritage.

## 🙏 Acknowledgments

- **Chris Crawford**: Original creator of Balance of Power
- **Community**: For preserving classic games
- **Contributors**: For their work on this adaptation

---

*Balance of Power Web Edition - Preserving the legacy of classic strategy games*