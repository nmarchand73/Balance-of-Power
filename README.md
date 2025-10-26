# Balance of Power - Web Edition

Une adaptation web moderne du jeu de stratégie géopolitique classique **Balance of Power** de Chris Crawford, simulant la Guerre Froide entre les USA et l'URSS.

## 🎮 À Propos du Jeu

Balance of Power est un jeu de stratégie géopolitique où vous dirigez soit les États-Unis soit l'Union Soviétique pendant la Guerre Froide. Votre objectif est d'influencer 80 pays du monde entier via la diplomatie, l'aide économique/militaire, et la déstabilisation, tout en évitant de déclencher une guerre nucléaire.

### Mécaniques Principales

- **80 pays** avec des données géopolitiques réalistes
- **Système de relations diplomatiques** complexe
- **Actions politiques** : aide économique, militaire, interventions, pressions
- **Système de crises** avec escalade nucléaire
- **Intelligence artificielle** sophistiquée avec 4 niveaux de difficulté
- **Système de news** dynamique avec headlines contextuelles

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd balance-of-power-web

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:3001`

### Build de Production

```bash
# Construire pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## 🏗️ Architecture Technique

### Stack Technologique

- **Frontend** : TypeScript + HTML5 Canvas
- **Bundler** : Vite
- **Rendu** : Canvas 2D API pour la carte interactive
- **Stockage** : LocalStorage pour les sauvegardes

### Structure des Modules

```
src/
├── main.ts                 # Point d'entrée
├── game/
│   ├── GameEngine.ts       # Moteur principal
│   ├── GameState.ts        # État du jeu
│   ├── GameMechanics.ts    # Mécaniques de jeu
│   ├── AIEngine.ts         # Intelligence artificielle
│   ├── CrisisManager.ts    # Gestion des crises
│   ├── ContentManager.ts   # Gestion du contenu
│   ├── PolicyManager.ts    # Gestion des politiques
│   ├── NewsManager.ts      # Gestion des actualités
│   ├── SaveLoadManager.ts  # Sauvegarde/Chargement
│   └── ScoreCalculator.ts  # Calcul des scores
├── data/
│   ├── countries.ts        # Données des 80 pays
│   ├── relations.ts        # Relations diplomatiques
│   └── constants.ts        # Constantes du jeu
├── ui/
│   ├── UIManager.ts        # Gestion de l'interface
│   ├── CountryListRenderer.ts # Rendu de la liste des pays
│   └── CountryDetailModal.ts  # Modal des détails de pays
└── index.html              # Page principale
```

## 🎯 Fonctionnalités Implémentées

### ✅ Systèmes Complets

- **Moteur de jeu** : Logique complète de tour, calculs de scores, gestion d'état
- **Intelligence artificielle** : IA sophistiquée avec décisions stratégiques variées
- **Système de crises** : Détection, escalade nucléaire, réponses du joueur
- **Système de contenu** : Headlines dynamiques, descriptions de politiques
- **Interface utilisateur** : Liste interactive des pays, dialogues, panels d'information
- **Sauvegarde/Chargement** : Persistance des parties via LocalStorage
- **Menus authentiques** : Système de menus fidèle au jeu original Pascal
- **Fenêtres Background et History** : Interface détaillée avec graphiques interactifs

### 🎮 Actions Disponibles

- **Aide Économique** : Renforce l'économie et améliore les relations
- **Aide Militaire** : Fournit armes et équipement militaire
- **Aide à l'Insurrection** : Soutient les groupes rebelles
- **Intervention Gouvernementale** : Action militaire directe pour soutenir le gouvernement
- **Intervention Rebelle** : Soutien militaire aux forces rebelles
- **Pression Diplomatique** : Sanctions et menaces non-militaires
- **Traités** : Accords formels de coopération

### 🚨 Système de Crises

- **Détection automatique** : Crises déclenchées par des actions provocatrices
- **Escalade nucléaire** : Niveaux 1-9 avec risque de guerre nucléaire
- **Réponses du joueur** : Reculer, négocier, refuser, menacer
- **Conséquences** : Impact sur prestige et relations diplomatiques

## 🎨 Interface Utilisateur

### Écran Principal

- **Liste des pays** : Vue interactive des 80 pays organisés par catégories
- **Panel de scores** : Scores USA/USSR en temps réel
- **Panel de news** : Événements et headlines dynamiques
- **Barre de statut** : Informations sur le tour actuel et le pays sélectionné
- **Menus authentiques** : Apple, Game, Political, Relations, Policy, Events, Briefing, Debug

### Fenêtres Spécialisées

- **Background Modal** : 
  - Sélecteurs interactifs pour les ressources (GNP, Military Spending, Population, etc.)
  - Visualisation de la carte avec légende
  - Détails complets du pays sélectionné
  - Calculs per capita et per GNP

- **History Modal** :
  - Trois graphiques détaillés (Military & Intervention, Diplomatic & Economic, Political & Influence)
  - Timeline des événements majeurs
  - Graphiques interactifs avec couleurs distinctes USA/USSR
  - Section des changements récents

### Dialogues

- **Dialogue Policy** : Sliders pour ajuster les niveaux d'action
- **Dialogue Crisis** : Choix de réponse aux crises internationales
- **Dialogue Closeup** : Informations détaillées sur un pays

## 🧠 Intelligence Artificielle

L'IA implémente une stratégie sophistiquée basée sur :

- **Évaluation des pays** : Importance géopolitique et prestige
- **Calcul des menaces** : Relations diplomatiques et opportunités
- **Décisions stratégiques** : Aide économique, militaire, interventions
- **Niveaux de difficulté** : 4 niveaux avec IA plus agressive

## 📊 Données du Jeu

### Pays (80 au total)

Chaque pays contient :
- Population et PIB
- Dépenses militaires et personnel
- Orientation gouvernementale (gauche/droite)
- Stabilité gouvernementale
- Valeur de prestige

### Relations Diplomatiques

- Matrice 80x80 des affinités diplomatiques
- Relations initiales basées sur l'histoire
- Évolution dynamique selon les actions

## 🔧 Développement

### Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run lint         # Vérifier le code
```

### Ajout de Fonctionnalités

1. **Nouveaux pays** : Modifier `src/data/countries.ts`
2. **Nouvelles politiques** : Étendre `PolicyType` dans `GameState.ts`
3. **Nouveau contenu** : Ajouter des templates dans `ContentManager.ts`
4. **Nouvelle IA** : Modifier la logique dans `AIEngine.ts`

## 🚀 Déploiement

### Options de Déploiement

- **Netlify** : Déploiement automatique depuis Git
- **Vercel** : Optimisé pour les applications web modernes
- **GitHub Pages** : Hébergement gratuit pour projets open source
- **Serveur personnel** : Build statique à servir

### Configuration de Production

```bash
# Build optimisé
npm run build

# Les fichiers sont générés dans dist/
# Servir le contenu de dist/ via un serveur web
```

## 📝 Notes de Version

### Version 1.0.0

- ✅ Moteur de jeu complet
- ✅ IA sophistiquée avec 4 niveaux
- ✅ Système de crises et escalade nucléaire
- ✅ Système de contenu dynamique
- ✅ Interface utilisateur moderne avec liste des pays
- ✅ Sauvegarde/chargement
- ✅ 80 pays avec données réalistes
- ✅ Menus authentiques fidèles au jeu original
- ✅ Fenêtres Background et History avec graphiques interactifs
- ✅ Système de sélection de pays amélioré
- ✅ Intégration temps réel avec l'état du jeu

### Nouvelles Fonctionnalités (Dernière mise à jour)

- **Interface Background améliorée** : Sélecteurs interactifs pour visualiser différentes ressources (GNP, dépenses militaires, population, etc.) avec calculs per capita et per GNP
- **Interface History enrichie** : Graphiques détaillés montrant l'évolution des relations diplomatiques, aides militaires/économiques, et événements politiques
- **Système de menus authentique** : Menus Apple, Game, Political, Relations, Policy, Events, Briefing, Debug fidèles au jeu original Pascal
- **Sélection de pays améliorée** : Possibilité de sélectionner un pays sans ouvrir immédiatement le modal, avec bouton "Details" pour accéder aux informations
- **Affichage de tous les pays** : Liste complète des 80 pays organisés par catégories (Superpower, Great Power, Regional Power, Strategic, Other)

## 🤝 Contribution

Ce projet est une adaptation fidèle du jeu original Balance of Power. Pour contribuer :

1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Ouvrir une Pull Request

## 📄 Licence

⚠️ **Important** : Balance of Power est sous copyright de Chris Crawford. Cette adaptation est créée à des fins éducatives et de préservation du patrimoine vidéoludique.

## 🙏 Remerciements

- **Chris Crawford** : Créateur original de Balance of Power
- **Communauté** : Pour la préservation des jeux classiques
- **Contributeurs** : Pour leur travail sur cette adaptation

---

*Balance of Power Web Edition - Préserver l'héritage des jeux de stratégie classiques*