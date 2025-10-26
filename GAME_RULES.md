# Balance of Power - Règles Métier Complètes

*Basé sur l'analyse du code source Pascal original (BOP2Source)*

## 📋 Table des Matières

1. [Objectif du Jeu](#objectif-du-jeu)
2. [Structure du Jeu](#structure-du-jeu)
3. [Système de Scores](#système-de-scores)
4. [Types de Politiques](#types-de-politiques)
5. [Système de Crises et Escalade Nucléaire](#système-de-crises-et-escalade-nucléaire)
6. [Mécaniques de Tour](#mécaniques-de-tour)
7. [Événements Internes des Pays](#événements-internes-des-pays)
8. [Système de Ressources](#système-de-ressources)
9. [Intelligence Artificielle](#intelligence-artificielle)
10. [Calculs de Développement](#calculs-de-développement)
11. [Système de News](#système-de-news)
12. [Formules Mathématiques](#formules-mathématiques)

---

## 🎯 Objectif du Jeu

### Objectif Principal
Accumuler le plus de points d'influence possible en 8 ans (1989-1997) sans déclencher une guerre nucléaire.

### Conditions de Victoire/Défaite
- **Victoire** : Le joueur avec le score le plus élevé à la fin de 1997 gagne
- **Défaite** : Si `Nastiness` atteint 127, une guerre nucléaire éclate et le jeu se termine immédiatement

### Durée du Jeu
- **Période** : 1989-1997 (8 ans)
- **Tours** : 1 tour = 1 année
- **Total** : 8 tours maximum

---

## 🏛️ Structure du Jeu

### Superpuissances
- **USA** (ID: 1) - États-Unis
- **USSR** (ID: 2) - Union Soviétique

### Pays Mineurs
- **80 pays** (ID: 3-80) sont les cibles d'influence
- Chaque pays a des caractéristiques uniques (population, GNP, stabilité, etc.)

### Attributs des Superpuissances
```pascal
Pugnacty[1..2]  // Agressivité (0-127)
Integrty[1..2]  // Intégrité/Fiabilité (0-127) 
Adventur[1..2]  // Prise de risque (0-127)
```

### Niveaux de Difficulté
- **Niveau 1** : IA basique, politiques limitées
- **Niveau 2** : IA améliorée, plus de politiques
- **Niveau 3** : IA avancée, toutes les politiques
- **Niveau 4** : IA maximale + IA des pays mineurs

---

## 📊 Système de Scores

### Calcul des Scores Principaux
```pascal
PROCEDURE CalcScores;
VAR Sum1, Sum2: LongInt;
BEGIN
  Sum1 := 0; Sum2 := 0;
  FOR i := 3 TO NoCntry DO BEGIN
    Sum1 := Sum1 + ord4(DipAff^^[i,1]) * ord4(PrestVal[i]);
    Sum2 := Sum2 + ord4(DipAff^^[i,2]) * ord4(PrestVal[i]);
  END;
  USAStrng := Sum1 div 1024; 
  USSRStrng := Sum2 div 1024;
END;
```

**Formule** : `Score = Σ(DiplomaticAffinity[country,superpower] × PrestigeValue[country]) ÷ 1024`

### Calcul de l'Influence sur un Pays
```pascal
FUNCTION Influence(SuperPower, Minor: Integer): Integer;
VAR x: Integer;
BEGIN
  x := Treaty[SuperPower,Minor]
    + EconAid[SuperPower,Minor]
    + MiltAid^^[SuperPower,Minor]
    + 2*IntvGovt^^[SuperPower,Minor]
    - 2*Destab[SuperPower,Minor]
    - 2*InsgAid^^[SuperPower,Minor]
    - 4*IntvRebl^^[SuperPower,Minor];
  IF x < 0 THEN x := 0;
  Influence := x;
END;
```

### Composants de l'Influence
- **+1** : Traités
- **+1** : Aide économique
- **+1** : Aide militaire
- **+2** : Intervention gouvernementale
- **-2** : Déstabilisation
- **-2** : Aide à l'insurrection
- **-4** : Intervention rebelle

---

## 🎮 Types de Politiques

### 1. Aide Économique (Econ)
- **Niveaux** : 0-5
- **Conversion** : `[0,1,2,5,10,20]`
- **Limite** : Basée sur `EconAMax(DipAff)` et ressources disponibles
- **Effet** : Améliore les relations diplomatiques, réduit l'instabilité

### 2. Aide Militaire (Miltry)
- **Niveaux** : 0-5  
- **Conversion** : `[0,1,5,20,50,100]`
- **Limite** : Basée sur `MilMax(DipAff)` et ressources militaires
- **Effet** : Renforce le gouvernement du pays cible

### 3. Aide à l'Insurrection (Insg)
- **Niveaux** : 0-5
- **Limite** : Basée sur `InsgAMax(superpower, country)` et `StrngRat`
- **Effet** : Renforce les rebelles contre le gouvernement
- **Contrainte** : Plus efficace si le pays est instable

### 4. Intervention Gouvernementale (IntGov)
- **Niveaux** : 0-5
- **Conversion** : `[0,1,5,20,100,500]`
- **Limite** : Basée sur `IntvGMax(Treaty, DipAff)` et troupes disponibles
- **Effet** : Soutien militaire direct au gouvernement
- **Risque** : Peut déclencher des crises

### 5. Intervention Rebelle (IntReb)
- **Niveaux** : 0-5
- **Limite** : Basée sur `InsgIMax(superpower, country)`
- **Effet** : Soutien militaire direct aux rebelles
- **Risque** : Très provocateur, augmente `Nastiness`

### 6. Pression Diplomatique (Pressur)
- **Niveaux** : 0-5
- **Effet** : Menaces non-militaires, augmente `Nastiness`
- **Utilisation** : Pour forcer des changements sans intervention militaire

### 7. Traités (Treato)
- **Niveaux** : 0-5
- **Limite** : Basée sur `TreatMax(Integrity + DipAff - Pugnacity)`
- **Effet** : Accords formels de coopération
- **Avantage** : Améliore toutes les autres politiques

### 8. Déstabilisation (Destabl)
- **Niveaux** : 0-5
- **Effet** : Actions secrètes pour affaiblir le gouvernement
- **Risque** : Peut déclencher des coups d'État

### 9. Commerce (Trado)
- **Niveaux** : 0-5 (défaut: 4)
- **Effet** : Relations commerciales, réduit les tensions
- **Avantage** : Politique la moins risquée

---

## ⚠️ Système de Crises et Escalade Nucléaire

### Niveau de Tension (Nastiness)
- **Plage** : 1-127
- **Augmentation** : Actions provocatrices (IntReb, Insg, Destabl, Pressur)
- **Diminution** : -4 par tour automatiquement
- **Seuil critique** : 127 = Guerre nucléaire immédiate

### Déclenchement de Crises
```pascal
IF ((Subject[i] = Human) & (NewNVal[i] > OldNVal[i]) & NOT TwoPFlag & NOT CrisisVal[i]) THEN
BEGIN
  x := -(GImpt(Subject[i], Verb[i], Object[i], OldNVal[i], NewNVal[i], 0, y, z));
  IF x < Abs(Random div 1024) THEN
    BEGIN
      // Crise déclenchée
      QuitFlag := Crisis(i);
    END;
END;
```

### Escalade Nucléaire Immédiate
**Condition critique** : USA et USSR interviennent dans le même pays
```pascal
IF ((IntvGovt^^[1,i] > 0) AND (IntvRebl^^[2,i] > 0)) OR
   ((IntvGovt^^[2,i] > 0) AND (IntvRebl^^[1,i] > 0)) THEN
BEGIN
  DipAff^^[1,2] := -127; 
  DipAff^^[2,1] := -127;
  Nastiness := 127;
  Pugnacty[1] := 127; 
  Pugnacty[2] := 127;
END;
```

### Types de Crises
1. **Crise Directe** : Confrontation USA-USSR
2. **Crise Mineure** : Pays mineur défie une superpuissance
3. **Crise Automatique** : Escalade nucléaire immédiate

---

## 🔄 Mécaniques de Tour

### Structure Générale d'un Tour
Un tour complet suit cette séquence :
```pascal
PROCEDURE NextTurn;
BEGIN
  PrePlanMove;        // Phase 1: Préparation
  TimeMesg('React to News');
  ReactNews;          // Phase 2: Réactions aux événements
  IF NOT QuitFlag THEN MainMove;  // Phase 3: Développement et IA
END;
```

### PrePlanMove (Phase 1: Préparation du Tour)
```pascal
PROCEDURE PrePlanMove;
BEGIN
  Year := Year + 1;  // Incrémenter l'année
  
  // Sauvegarder toutes les anciennes valeurs pour comparaisons
  FOR i := 1 TO NoCntry DO BEGIN
    OldGStrg[i] := GovtStrg[i]; 
    OldIStrg[i] := InsgStrg[i];
    OldGPopl[i] := GPopular[i];
    FOR j := 1 TO 2 DO BEGIN
      RevlGain[j,i] := 0; 
      CoupGain[j,i] := 0; 
      FinlGain[j,i] := 0;
      OldFinPb[j,i] := FinlProb[j,i];
      EconAOld[j,i] := EconAid[j,i]; 
      DestaOld[j,i] := Destab[j,i];
      TreatOld[j,i] := Treaty[j,i]; 
      PressOld[j,i] := Pressure[j,i];
    END;
    // Sauvegarder les politiques des superpuissances et pays mineurs
    FOR j := 1 TO CntryCount DO BEGIN
      MiltAOld^^[j,i] := MiltAid^^[j,i]; 
      InsgAOld^^[j,i] := InsgAid^^[j,i];
      IntvGOld^^[j,i] := IntvGovt^^[j,i]; 
      IntvROld^^[j,i] := IntvRebl^^[j,i];
    END;
    
    // Normaliser les forces gouvernementales
    IF GovtStrg[i] = 0 THEN GovtStrg[i] := 1;
    IF InsgStrg[i] > GovtStrg[i] THEN InsgStrg[i] := GovtStrg[i];
    
    // Recalculer SqrtStrg (ratio de force)
    temp := ord4(InsgStrg[i]);
    x := (6400*temp) div GovtStrg[i];
    IF x < 1 THEN x := 1;
    IF x > 6400 THEN x := 6400;
    temp := ord4(x);
    SqrtStrg[i] := MySqrt(temp);
    
    // VÉRIFICATION CRITIQUE: Escalade nucléaire USA-USSR
    IF ((IntvGovt^^[1,i] > 0) AND (IntvRebl^^[2,i] > 0)) OR
       ((IntvGovt^^[2,i] > 0) AND (IntvRebl^^[1,i] > 0)) THEN BEGIN
      DipAff^^[1,2] := -127; 
      DipAff^^[2,1] := -127;
      Nastiness := 127;  // Guerre nucléaire immédiate
      Pugnacty[1] := 127; 
      Pugnacty[2] := 127;
    END;
    
    // Guerres entre pays mineurs (niveau 4 seulement)
    IF Level = 4 THEN BEGIN
      FOR j := 3 TO NoCntry DO BEGIN
        IF IntvGovt^^[i,j] > 0 THEN BEGIN
          FOR k := 1 TO NoCntry DO IF IntvRebl^^[k,j] > 0 THEN BEGIN
            ChgDipAff(k,i,-Nastiness div 8);
            ChgDipAff(i,k,-Nastiness div 8);
          END;
        END;
        IF IntvRebl^^[i,j] > 0 THEN BEGIN
          FOR k := 1 TO NoCntry DO IF IntvGovt^^[k,j] > 0 THEN BEGIN
            ChgDipAff(k,i,-Nastiness div 8);
            ChgDipAff(i,k,-Nastiness div 8);
          END;
        END;
      END;
    END;
  END;
END;
```

### ReactNews (Phase 2: Réactions aux Événements)
```pascal
PROCEDURE ReactNews;
VAR i,j,x,y,z: Integer;
    WindFlag,CrisFlag: Boolean;
BEGIN
  WindFlag := FALSE; 
  CrisFlag := FALSE;
  i := 1;
  
  // Traiter chaque événement dans la queue de news
  WHILE i <= NewsQCtr DO BEGIN
    IF NOT QuitFlag THEN BEGIN
      IF Subject[i] <> Object[i] THEN BEGIN
        // Augmenter Nastiness pour les actions provocatrices
        IF ((Verb[i] = IntReb) OR (Verb[i] = Insg) OR (Verb[i] = Destabl) OR (Verb[i] = Pressur))
           AND (Subject[i] < 3) THEN BEGIN
          Nastiness := Nastiness + NewNVal[i] - OldNVal[i];
          IF Nastiness > 127 THEN Nastiness := 127;
          IF Nastiness < 1 THEN Nastiness := 1;
        END;
        
        // Vérifier les crises potentielles
        IF (Subject[i] = Human) AND (NewNVal[i] > OldNVal[i])
           AND NOT TwoPFlag AND NOT CrisisVal[i] THEN BEGIN
          x := -(GImpt(Subject[i],Verb[i],Object[i],OldNVal[i],NewNVal[i],0,y,z));
          IF x < Abs(Random div 1024) THEN BEGIN
            // Crise déclenchée
            IF NOT WindFlag THEN BEGIN
              GagaWindow;
              RespHndl := GetNewControl(130,MyWind);
              WindFlag := TRUE;
            END;
            IF Human = 1 THEN x := 790 ELSE x := 890;
            HeadLine(x,1,0,Subject[i],Object[i],OldNVal[i],CrisisVal[i]);
            TransNews(i,FALSE,TRUE);
            InitCursor; 
            CullFlag := FALSE; 
            CrisFlag := TRUE;
            QuitFlag := Crisis(i);  // Gestion de la crise
            IF NOT QuitFlag THEN BEGIN
              SetCursor(GetCursor(4)^^);
              ClearRect(0,0,250,225);
              IF CullFlag THEN i := i-1;
            END;
          END;
        END ELSE BEGIN
          // Vérifier les crises IA vs pays mineurs
          IF (Subject[i] > 2) AND (NewNVal[i] > OldNVal[i]) AND (NOT TwoPFlag)
             AND (Influence(Cmptr,Subject[i]) > 3) THEN BEGIN
            x := -(GImpt(Subject[i],Verb[i],Object[i],OldNVal[i],NewNVal[i],0,y,z));
            IF z > Abs(Random div 1024) THEN BEGIN
              CmptrCrisis(i);  // Crise IA vs pays mineur
            END;
          END;
        END;
      END;
    END;
    i := i+1;
  END;
  
  // Calculer les réactions diplomatiques des pays mineurs
  IF NOT QuitFlag THEN BEGIN
    IF WindFlag THEN ClearDeck;
    NewsQCtr := 0;
    IF Year > 1989 THEN BEGIN
      FOR i := 3 TO NoCntry DO BEGIN
        FOR j := 1 TO 2 DO BEGIN
          MinorRej(i,j);  // Réactions mineures
          // Calcul des réactions diplomatiques
          x := (25*ord4((256*(EconConv(EconAid[j,i]))) div GNP[i])) div (GPopular[i]+1)
               -(32*Destab[j,i])
               +((MiltAid^^[j,i]*MiltPress[i]) div 8)
               -(12*InsgAid^^[j,i])
               +(((IntvGovt^^[j,i])*MiltPress[i]) div 4)
               -(64*IntvRebl^^[j,i])
               -(16*Pressure[j,i])
               +((((Treaty[j,i]*Integrty[j]) div 128)*MiltPress[i]) div 8)
               +(8*(Trade[j,i]-3));
          x := x div 8;
          ChgDipAff(i,j,x);
        END;
        
        // Réactions des pays mineurs entre eux (niveau 4)
        IF Level = 4 THEN BEGIN
          FOR j := 3 TO NoCntry DO BEGIN
            x := ((MiltAid^^[j,i]*MiltPress[i]) div 8)
                 -(12*InsgAid^^[j,i])
                 +(((IntvGovt^^[j,i])*MiltPress[i]) div 4)
                 -(64*IntvRebl^^[j,i]);
            x := x div 8;
            ChgDipAff(i,j,x);
          END;
        END;
      END;
      CalcScores;
      WritScor;
    END;
  END;
END;
```

### MainMove (Phase 3: Développement et IA)
```pascal
PROCEDURE MainMove;
BEGIN
  TimeMesg('Save History');
  // Sauvegarder l'historique pour cette année
  
  // Sauvegarder les données historiques
  FOR i := 1 TO NoCntry DO BEGIN
    MAidDum[1,i] := MiltAid^^[1,i];
    MAidDum[2,i] := MiltAid^^[2,i];
    IAidDum[1,i] := InsgAid^^[1,i];
    IAidDum[2,i] := InsgAid^^[2,i];
    IntvGDum[1,i] := IntvGovt^^[1,i];
    IntvGDum[2,i] := IntvGovt^^[2,i];
    IntvIDum[1,i] := IntvRebl^^[1,i];
    IntvIDum[2,i] := IntvRebl^^[2,i];
    DipAffDum[1,i] := DipAff^^[1,i];
    DipAffDum[2,i] := DipAff^^[2,i];
  END;
  
  // Sauvegarder sur disque
  x := FSOpen('SavedGame',0,StartDummy);
  temp := LongInt(@HistDum2)-LongInt(@HistDum1);
  delta := LongInt(@StartDummy)-LongInt(@EndDummy)
           +LongInt(9*ord4(SizeOf(TwoDArr)))
           +LongInt(ord4(SizeOf(TwoFArr)));
  x := SetFPos(StartDummy,1,delta+(Year-1989)*temp);
  x := FSWrite(StartDummy,temp,@HistDum1);
  x := FSClose(StartDummy);
  x := FlushVol(NIL,0);
  
  // Défi de copyright en 1990
  IF Year = 1990 THEN BEGIN
    // Système de vérification de copyright complexe
    // (code omis pour la clarté)
  END;
  
  RandSeed := TickCount;
  
  // PHASE PRINCIPALE: Développement des pays
  DevelopC;
  
  // IA du joueur ordinateur
  IF NOT TwoPFlag THEN BEGIN 
    TimeMesg('Computer AI'); 
    CompuAI; 
  END;
  
  // IA des pays mineurs (niveau 4 seulement)
  IF Level = 4 THEN BEGIN 
    TimeMesg('MinorAI'); 
    MinorAI; 
  END;
  
  // Réduction automatique de la tension
  Nastiness := Nastiness - 4; 
  IF Nastiness < 0 THEN Nastiness := 0;
  
  LastNews := 1;
  
  // Mise à jour des attributs des superpuissances
  FOR j := 1 TO 2 DO BEGIN
    Pugnacty[j] := Pugnacty[j] - 4;
    Adventur[j] := Pugnacty[j] + Nastiness - Pugnacty[3-j] - MiltFrac[j] + 32;
    IF Adventur[j] < 1 THEN Adventur[j] := 1;
    Integrty[j] := Integrty[j] + 5; 
    IF Integrty[j] > 127 THEN Integrty[j] := 127;
  END;
  
  TimeMesg('Calculate Scores');
  CalcScores;
  
  // Initialisation des scores de référence en 1989
  IF Year = 1989 THEN BEGIN
    IUSAStrng := USAStrng; 
    IUSSRStrng := USSRStrng;
    FOR i := 1 TO NoCntry DO BEGIN
      OldGStrg[i] := GovtStrg[i];
      OldIStrg[i] := InsgStrg[i];
      OldGPopl[i] := GPopular[i];
      OldFinPb[1,i] := FinlProb[1,i];
      OldFinPb[2,i] := FinlProb[2,i];
    END;
  END;
  
  // Calcul des scores annuels
  OldAScor := USAStrng; 
  OldRScor := USSRStrng;
  USAScor[Year-1988] := USAStrng - IUSAStrng; 
  USSRScor[Year-1988] := USSRStrng - IUSSRStrng;
  
  ClearRect(450,20,500,40); 
  TextFont(0); 
  TextSize(12); 
  MoveTo(450,36); 
  MyWrite(Year);
  TimeMesg('    ');
  WritScor;
END;
```

### DevelopC (Développement des Pays)
```pascal
PROCEDURE DevelopC;
BEGIN
  FOR i := 1 TO NoCntry DO BEGIN
    TimeMesg(Concat('Events inside ',CntryNam[i]));
    
    // Réinitialiser les flags d'événements
    FinlFlag[i] := FALSE; 
    CoupFlag[i] := FALSE; 
    RebWinFlag[i] := FALSE;
    
    // Calcul de la puissance militaire
    x := MilMen[i]; 
    temp := (MiltSpnd[i] + GovtAid[i]) div 2;
    IF temp < 1 THEN temp := 1;
    y := Arf1(i,1) + Arf1(i,2);  // Interventions gouvernementales
    MilPowr[i] := ((4*temp*x) div (temp+x)) + y;
    
    // Guerres entre pays mineurs (niveau 4)
    IF (i > 2) AND (Level = 4) THEN BEGIN
      FOR j := 3 TO NoCntry DO IF DipAff^^[i,j] = -127 THEN BEGIN
        MilPowr[i] := MilPowr[i] - (MilPowr[j] div 4); 
        GNP[i] := GNP[i] - (MilPowr[j] div 4);
        IF GNP[i] < 1 THEN GNP[i] := 1;
        IF MilPowr[i] < 1 THEN BEGIN
          // Reddition - le pays devient satellite
          FOR k := 1 TO NoCntry DO 
            IF DipAff^^[j,k] <= -127 THEN DipAff^^[i,k] := -120
                                     ELSE DipAff^^[i,k] := DipAff^^[j,k];
          GovtWing[i] := GovtWing[j];
          InsgWing[i] := -GovtWing[j];
          InsrtNews(i,6,j,2,1,i,FALSE);
          DipAff^^[i,j] := 0;
          DipAff^^[j,i] := 0;
          DipAff^^[i,i] := 127;
        END ELSE BEGIN 
          InsrtNews(i,6,j,1,1,i,TRUE); 
          DipAff^^[j,i] := -127; 
        END;
      END;
    END;
    
    // Calcul de la puissance rebelle
    x := ((((256-Maturity[i])*ord4(Popln[i]) div 256)*ord4(SqrtStrg[i])) div 80);
    temp := 0;
    FOR j := 1 TO CntryCount DO temp := temp + 2*MAidConv(InsgAid^^[j,i]);
    IF temp < ((x div 8)+1) THEN temp := ((x div 8)+1);
    y := Arf2(i,1) + Arf2(i,2);  // Interventions rebelles
    InsgPowr[i] := ((4*temp*x) div (temp+x)) + y;
    IF i < 3 THEN InsgPowr[i] := 1;
    
    // Interaction militaire/rebelle
    MilPowr[i] := MilPowr[i] - (InsgPowr[i] div 4); 
    IF MilPowr[i] < 1 THEN MilPowr[i] := 1;
    InsgPowr[i] := InsgPowr[i] - (MilPowr[i] div 4); 
    IF InsgPowr[i] < 1 THEN InsgPowr[i] := 1;
    
    // Mise à jour des forces
    GovtStrg[i] := MilPowr[i]; 
    InsgStrg[i] := InsgPowr[i];
    StrngRat[i] := GovtStrg[i] div InsgStrg[i];
    IF (InsgStrg[i] = 1) AND (GovtStrg[i] < 8192) THEN StrngRat[i] := 4*StrngRat[i];
    
    // Vérification de révolution
    IF StrngRat[i] < 1 THEN Revolution(i);
    
    // Économie et démographie
    ConsPress := (20-GPopular[i])*10;
    IF ConsPress < 1 THEN ConsPress := 1;
    InvtPress := (80-InvtFrac[i])*2;
    IF InvtPress < 1 THEN InvtPress := 1;
    MiltPress[i] := SqrtStrg[i] + FinlProb[1,i] + FinlProb[2,i];
    IF MiltPress[i] < 1 THEN MiltPress[i] := 1;
    
    Sum := ConsPress + InvtPress + MiltPress[i];
    Pot := 0;
    IF ConsFrac[i] > 16 THEN BEGIN ConsFrac[i] := ConsFrac[i]-8; Pot := 8; END;
    IF InvtFrac[i] > 16 THEN BEGIN InvtFrac[i] := InvtFrac[i]-8; Pot := Pot+8; END;
    IF MiltFrac[i] > 16 THEN BEGIN MiltFrac[i] := MiltFrac[i]-8; Pot := Pot+8; END;
    
    InvtFrac[i] := InvtFrac[i] + ((InvtPress*Pot) div Sum);
    MiltFrac[i] := MiltFrac[i] + ((MiltPress[i]*Pot) div Sum);
    ConsFrac[i] := 255 - InvtFrac[i] - MiltFrac[i];
    
    // Croissance économique et démographique
    OldConsS := (ord4(ConsSpnd[i])*255) div Popln[i];
    x := EconConv(EconAid[1,i]) + EconConv(EconAid[2,i]);
    PseudGNP := GNP[i] + x;
    temp := ord4(PseudGNP)*2*(InvtFrac[i]-30);
    GNP[i] := GNP[i] + (temp div 1000);
    
    // Croissance démographique
    x := 30-(OldConsS div 40); IF x < 1 THEN x := 1;
    temp := ord4(Popln[i])*x;
    IF temp < 1000 THEN temp := 1000;
    Popln[i] := Popln[i] + (temp div 1000);
    
    // Calcul des ressources
    MilMen[i] := (ord4(Popln[i])*DrafFrac[i]) div 256;
    ConsSpnd[i] := (ord4(ConsFrac[i])*PseudGNP) div 256;
    InvtSpnd[i] := (ord4(InvtFrac[i])*PseudGNP) div 256;
    IF InvtSpnd[i] < 1 THEN InvtSpnd[i] := 1;
    MiltSpnd[i] := (PseudGNP-ConsSpnd[i]-InvtSpnd[i])*10;
    IF MiltSpnd[i] < 1 THEN MiltSpnd[i] := 1;
    
    // Correction des ressources négatives (superpuissances)
    IF i < 3 THEN BEGIN
      x := (MiltSpnd[i] div 8) + GovtAid[i];
      WHILE x < 0 DO BEGIN
        ConsFrac[i] := ConsFrac[i] - 1;
        MiltFrac[i] := MiltFrac[i] + 1;
        ConsSpnd[i] := (ord4(ConsFrac[i])*PseudGNP) div 256;
        MiltSpnd[i] := (PseudGNP-ConsSpnd[i]-InvtSpnd[i])*10;
        x := (MiltSpnd[i] div 8) + GovtAid[i];
      END;
    END;
    
    // Calcul de la popularité gouvernementale
    temp := (ConsFrac[i]*ord4(PseudGNP)) div Popln[i];
    delta := (ord4(temp-OldConsS)*100) div (OldConsS+1);
    GPopular[i] := GPopular[i] + delta + (Abs(GovtWing[i]) div 64) - 3;
    IF GPopular[i] < 0 THEN GPopular[i] := 0;
    IF i < 3 THEN GPopular[i] := 20;
    
    // Vérification de coup d'État
    IF (GPopular[i] <= (Destab[1,i] + Destab[2,i])) AND (Level > 1) THEN BEGIN
      CoupFlag[i] := TRUE;
      Virgin[i] := FALSE;
      x := GovtWing[i]; 
      GovtWing[i] := InsgWing[i]; 
      InsgWing[i] := x;
      LeftPowr[i] := (GovtWing[i] < 0);
      GPopular[i] := 10 + (128-Abs(GovtWing[i])) div 8;
      GovtStrg[i] := GovtStrg[i] - (GovtStrg[i] div 8);
      InsrtNews(i,2,i,0,(Maturity[i] div 64)+1,i,FALSE);
      
      FOR j := 1 TO 2 DO BEGIN
        x := Should(Treaty[j,i]) - (Maturity[i] div 2);
        IF x > 128 THEN x := 128; 
        IF x < 0 THEN x := 0;
        Integrty[j] := (Integrty[j]*(128-x)) div 128;
        x := InsgWing[i] - GovtWing[j]; 
        y := GovtWing[i] - GovtWing[j];
        x := (Abs(x) - Abs(y)) div 2;
        CoupGain[j,i] := (ord4(x)*PrestVal[i]) div 1024;
        ChgDipAff(i,j,x); 
        MinorRej(i,j);
      END;
    END;
    
    // IA de politique étrangère
    CntryRnd[i] := Random;
    x := (6400*ord4(InsgStrg[i])) div GovtStrg[i];
    IF x < 1 THEN x := 1;
    IF x > 6400 THEN x := 6400;
    temp := ord4(x);
    SqrtStrg[i] := MySqrt(temp);
    
    IF i > 2 THEN DoFinliz(i);  // Calcul de finlandisation
    
    // Réinitialiser les politiques temporaires
    FOR j := 1 TO 2 DO BEGIN
      Pressure[j,i] := 0; 
      Destab[j,i] := 0;
    END;
    
    // Vérifier les limites de politiques
    FOR j := 1 TO CntryCount DO BEGIN
      x := InsgAMax(j,i); 
      y := InsgIMax(j,i);
      IF InsgAid^^[j,i] > x THEN InsgAid^^[j,i] := x;
      IF IntvRebl^^[j,i] > y THEN IntvRebl^^[j,i] := y;
      IF j < 3 THEN MinorRej(i,j);
    END;
  END;
END;
```

---

## 🏛️ Événements Internes des Pays

### Révolutions
**Condition** : `StrngRat[country] < 1` (force rebelle > force gouvernementale)

**Effets** :
- Échange des rôles gouvernement/rebelle
- Réinitialisation de toutes les politiques
- Changement d'orientation politique
- Perte d'intégrité des superpuissances
- Nouvelle popularité gouvernementale

### Coups d'État
**Condition** : `GPopular[country] <= Destab[USA,country] + Destab[USSR,country]`

**Effets** :
- Changement de gouvernement
- Perte d'intégrité des superpuissances
- Réduction de la force gouvernementale
- Nouvelle orientation politique

### Finlandisation
**Condition** : `FinlProb[superpower, country] > 127`

**Effets** :
- Le pays devient un satellite de la superpuissance dominante
- Changement d'orientation politique vers la superpuissance
- Gain/perte de prestige selon la superpuissance
- Amélioration/détérioration des relations diplomatiques

### Guerres entre Pays Mineurs (Niveau 4)
- **Condition** : Relations diplomatiques à -127
- **Effet** : Réduction mutuelle de puissance militaire et économique
- **Résolution** : Reddition ou négociation

---

## 🎯 Système de Ressources

### Ressources Militaires
**Disponibles** : `(MiltSpnd[superpower] ÷ 8) + GovtAid[superpower]`
**Utilisées** : Aide militaire + Aide à l'insurrection
**Conversion** : `MAidConv()` pour les coûts réels

### Troupes Disponibles
**Disponibles** : `(MilMen[superpower] ÷ 4) - TotlIntv[superpower]`
**Utilisées** : Interventions gouvernementales + Interventions rebelles
**Conversion** : `IntvConv()` pour les coûts réels

### Ressources Économiques
**Disponibles** : `(GNP[superpower] ÷ 44) - (2 × Σ(EconConv(EconAid[superpower,country])))`
**Utilisées** : Aide économique uniquement
**Conversion** : `EconConv()` pour les coûts réels

### Contraintes de Ressources
- **Aide Militaire** : Limité par `MilMax(DipAff)` et ressources disponibles
- **Interventions** : Limitées par `IntvGMax()` et troupes disponibles
- **Aide Économique** : Limité par `EconAMax()` et budget disponible

---

## 🧠 Intelligence Artificielle

### IA des Superpuissances
**Évaluation** : Basée sur `GImpt()` (importance géopolitique)
```pascal
GImpt := ((z*x*y*t*v) div 64) * ord4(PrestVal[Obj]);
// z = DontMess factor
// x = Diplomatic affinity
// y = Treaty bonus
// t = Adventure factor
// v = Hurt value
```

**Décisions** : Basées sur `Need` calculé selon la situation
- **Aide Économique** : `Need := (22-GPopular[j]) div 3`
- **Aide Militaire** : `Need := (SqrtStrg[j]+HFinProb) div 8`
- **Interventions** : Basées sur la stabilité et les menaces

**Contraintes** : Respect des limites de ressources et diplomatiques

### IA des Pays Mineurs (Niveau 4)
**Objectif** : Maximiser leur influence régionale
**Actions** : Aide militaire/intervention vers pays voisins
**Ressources** : Basées sur `StrngRat` et `ResrcFrac`
**Stratégie** : Soutien aux alliés, opposition aux ennemis

### Facteurs de Décision IA
1. **Importance géopolitique** du pays cible
2. **Relations diplomatiques** actuelles
3. **Ressources disponibles** de la superpuissance
4. **Menaces** perçues (instabilité, influence adverse)
5. **Opportunités** (faiblesse gouvernementale, proximité)

---

## 📈 Calculs de Développement

### Puissance Militaire
```pascal
MilPowr[i] := ((4*temp*x) div (temp+x)) + y;
// temp = (MiltSpnd[i] + GovtAid[i]) div 2
// x = MilMen[i]
// y = Interventions gouvernementales des superpuissances
```

### Puissance Rebelle
```pascal
InsgPowr[i] := ((4*temp*x) div (temp+x)) + y;
// temp = Σ(MAidConv(InsgAid[superpower,i]))
// x = Population × SqrtStrg[i] ÷ 80
// y = Interventions rebelles des superpuissances
```

### Économie et Démographie
- **Croissance économique** : Basée sur `InvtFrac` et aide économique
- **Croissance démographique** : Basée sur `ConsSpnd` et `Maturity`
- **Dépenses** : Répartition entre consommation, investissement, militaire
- **Popularité** : Basée sur les dépenses de consommation et stabilité

### Facteurs de Stabilité
- **Ratio de force** : `StrngRat = GovtStrg ÷ InsgStrg`
- **Popularité** : `GPopular` basée sur les dépenses et orientation
- **Maturité** : `Maturity` basée sur l'historique de violence
- **Pression militaire** : `MiltPress` basée sur les tensions

---

## 🎲 Système de News

### Importance des Événements
```pascal
Import := Import * (1 + Abs(New - Old));
IF Old > New THEN Import := Import - 1;
Import := MySqrt(((MySqrt(ord4(PrestVal[Sub]) * PrestVal[Obj])) + 1) * ord4(Import));
```

### Types de News
1. **Politiques** : Changements de politiques des superpuissances
2. **Événements** : Révolutions, coups d'État, finlandisation
3. **Crises** : Confrontations directes entre superpuissances
4. **Développements** : Changements économiques et militaires

### Facteurs d'Importance
- **Prestige** des pays impliqués
- **Amplitude** du changement de politique
- **Type** d'événement (crise > politique > développement)
- **Relations** diplomatiques existantes

### Queue de News
- **Maximum** : 128 événements
- **Tri** : Par importance décroissante
- **Traitement** : Séquentiel avec vérification de crises

---

## 🧮 Formules Mathématiques

### Conversions de Politiques
```pascal
// Aide Économique
EconConv(0) = 0; EconConv(1) = 1; EconConv(2) = 2; 
EconConv(3) = 5; EconConv(4) = 10; EconConv(5) = 20;

// Aide Militaire  
MAidConv(0) = 0; MAidConv(1) = 1; MAidConv(2) = 5;
MAidConv(3) = 20; MAidConv(4) = 50; MAidConv(5) = 100;

// Interventions
IntvConv(0) = 0; IntvConv(1) = 1; IntvConv(2) = 5;
IntvConv(3) = 20; IntvConv(4) = 100; IntvConv(5) = 500;
```

### Limites de Politiques
```pascal
// Aide Économique
EconAMax(x) := 
  IF x > 20 THEN 5
  ELSE IF x > 0 THEN 4
  ELSE IF x > -20 THEN 3
  ELSE IF x > -40 THEN 2
  ELSE IF x > -60 THEN 1
  ELSE 0;

// Aide Militaire
MilMax(x) :=
  IF x > 40 THEN 5
  ELSE IF x > 20 THEN 4
  ELSE IF x > 0 THEN 3
  ELSE IF x > -20 THEN 2
  ELSE IF x > -40 THEN 1
  ELSE 0;
```

### Calcul de l'Importance Géopolitique
```pascal
FUNCTION GImpt(Sub, Ver, Obj, Old, New, Bias: Integer): Integer;
VAR x, y, z, t, v: Integer;
BEGIN
  x := DipAff^^[i,Obj] div 4;  // Affinité diplomatique
  y := (Should(Treaty[i,Obj]) div 4) + 1;  // Bonus traité
  z := (ord4(DontMess[Obj]) * 1280) div SumDMess;  // Facteur "DontMess"
  t := Adventur[i] div 2;  // Facteur aventure
  v := Hurt(Ver, Obj, Old, New);  // Impact de la politique
  
  GImpt := ((ord4(z) * x * y * t * v) div 64) * ord4(PrestVal[Obj]);
END;
```

### Calcul des Réactions Diplomatiques
```pascal
x := (25*ord4((256*(EconConv(EconAid[j,i]))) div GNP[i])) div (GPopular[i]+1)
     -(32*Destab[j,i])
     +((MiltAid^^[j,i]*MiltPress[i]) div 8)
     -(12*InsgAid^^[j,i])
     +(((IntvGovt^^[j,i])*MiltPress[i]) div 4)
     -(64*IntvRebl^^[j,i])
     -(16*Pressure[j,i])
     +((((Treaty[j,i]*Integrty[j]) div 128)*MiltPress[i]) div 8)
     +(8*(Trade[j,i]-3));
```

---

## 📝 Notes d'Implémentation

### Points Critiques
1. **Précision des calculs** : Utiliser des entiers longs pour éviter les débordements
2. **Ordre des opérations** : Respecter l'ordre des phases de tour
3. **Gestion des ressources** : Vérifier les contraintes avant chaque action
4. **Escalade nucléaire** : Vérification immédiate lors des interventions

### Différences avec l'Implémentation Actuelle
1. **Calcul des scores** : Formule simplifiée vs formule Pascal complète
2. **Contraintes de ressources** : Limites approximatives vs calculs précis
3. **Système de crises** : Logique simplifiée vs mécanisme complexe
4. **Événements internes** : Manquants vs système complet
5. **Conversions de politiques** : Valeurs approximatives vs valeurs exactes

### Recommandations
1. **Implémenter progressivement** les mécaniques complexes
2. **Tester chaque formule** avec des valeurs connues
3. **Valider les résultats** contre le jeu original
4. **Documenter les écarts** pour les corrections futures

---

*Ce document constitue la référence complète des règles métier de Balance of Power basée sur l'analyse du code source Pascal original.*
