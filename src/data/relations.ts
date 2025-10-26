// Initial diplomatic relations extracted from Init.p
// These represent the starting diplomatic affinity values between countries

export interface DiplomaticRelation {
  fromCountry: number;
  toCountry: number;
  affinity: number; // -127 to 127, where 127 is very friendly, -127 is very hostile
}

// Initial diplomatic relations from USA perspective
export const USA_INITIAL_RELATIONS: DiplomaticRelation[] = [
  // USA relations (SetHDipAff calls)
  { fromCountry: 1, toCountry: 1, affinity: 127 },   // USA-USA
  { fromCountry: 1, toCountry: 2, affinity: -80 },  // USA-USSR
  { fromCountry: 1, toCountry: 3, affinity: 40 },   // USA-Mexico
  { fromCountry: 1, toCountry: 4, affinity: 50 },   // USA-Honduras
  { fromCountry: 1, toCountry: 5, affinity: -100 },  // USA-Nicaragua
  { fromCountry: 1, toCountry: 6, affinity: 30 },   // USA-Panama
  { fromCountry: 1, toCountry: 7, affinity: -80 },  // USA-Cuba
  { fromCountry: 1, toCountry: 8, affinity: -10 },  // USA-Argentina
  { fromCountry: 1, toCountry: 9, affinity: 50 },    // USA-Colombia
  { fromCountry: 1, toCountry: 10, affinity: 20 },  // USA-Peru
  { fromCountry: 1, toCountry: 11, affinity: 20 },  // USA-Venezuela
  { fromCountry: 1, toCountry: 12, affinity: 20 },  // USA-Brazil
  { fromCountry: 1, toCountry: 13, affinity: 20 },  // USA-Chile
  { fromCountry: 1, toCountry: 14, affinity: 20 },   // USA-Canada
  { fromCountry: 1, toCountry: 15, affinity: 20 },   // USA-Greece
  { fromCountry: 1, toCountry: 16, affinity: 20 },   // USA-Sweden
  { fromCountry: 1, toCountry: 17, affinity: 20 },   // USA-Britain
  { fromCountry: 1, toCountry: 18, affinity: 20 },   // USA-France
  { fromCountry: 1, toCountry: 19, affinity: 20 },   // USA-Spain
  { fromCountry: 1, toCountry: 20, affinity: 20 },   // USA-West Germany
  { fromCountry: 1, toCountry: 21, affinity: 20 },   // USA-Romania
  { fromCountry: 1, toCountry: 22, affinity: 20 },   // USA-Italy
  { fromCountry: 1, toCountry: 23, affinity: 20 },   // USA-East Germany
  { fromCountry: 1, toCountry: 24, affinity: 20 },   // USA-Poland
  { fromCountry: 1, toCountry: 25, affinity: 20 },   // USA-Czechoslovakia
  { fromCountry: 1, toCountry: 26, affinity: 20 },   // USA-Yugoslavia
  { fromCountry: 1, toCountry: 27, affinity: 20 },   // USA-South Africa
  { fromCountry: 1, toCountry: 28, affinity: 20 },   // USA-Egypt
  { fromCountry: 1, toCountry: 29, affinity: 20 },   // USA-Tunisia
  { fromCountry: 1, toCountry: 30, affinity: 20 },   // USA-Morocco
  { fromCountry: 1, toCountry: 31, affinity: 20 },   // USA-Algeria
  { fromCountry: 1, toCountry: 32, affinity: 20 },   // USA-Libya
  { fromCountry: 1, toCountry: 33, affinity: 20 },   // USA-Mali
  { fromCountry: 1, toCountry: 34, affinity: 20 },   // USA-Nigeria
  { fromCountry: 1, toCountry: 35, affinity: 20 },   // USA-Sudan
  { fromCountry: 1, toCountry: 36, affinity: 20 },   // USA-Ethiopia
  { fromCountry: 1, toCountry: 37, affinity: 20 },   // USA-Kenya
  { fromCountry: 1, toCountry: 38, affinity: 20 },   // USA-Zaire
  { fromCountry: 1, toCountry: 39, affinity: 20 },   // USA-Tanzania
  { fromCountry: 1, toCountry: 40, affinity: 20 },   // USA-Mozambique
  { fromCountry: 1, toCountry: 41, affinity: 20 },   // USA-Zambia
  { fromCountry: 1, toCountry: 42, affinity: 20 },   // USA-Angola
  { fromCountry: 1, toCountry: 43, affinity: 20 },   // USA-Japan
  { fromCountry: 1, toCountry: 44, affinity: 20 },   // USA-North Korea
  { fromCountry: 1, toCountry: 45, affinity: 20 },   // USA-South Korea
  { fromCountry: 1, toCountry: 46, affinity: 20 },   // USA-Australia
  { fromCountry: 1, toCountry: 47, affinity: 20 },   // USA-China
  { fromCountry: 1, toCountry: 48, affinity: 20 },   // USA-Vietnam
  { fromCountry: 1, toCountry: 49, affinity: 20 },   // USA-Turkey
  { fromCountry: 1, toCountry: 50, affinity: 20 },   // USA-Syria
  { fromCountry: 1, toCountry: 51, affinity: 20 },   // USA-Israel
  { fromCountry: 1, toCountry: 52, affinity: 20 },   // USA-Taiwan
  { fromCountry: 1, toCountry: 53, affinity: 20 },   // USA-Iraq
  { fromCountry: 1, toCountry: 54, affinity: 20 },   // USA-Saudi Arabia
  { fromCountry: 1, toCountry: 55, affinity: 20 },   // USA-Iran
  { fromCountry: 1, toCountry: 56, affinity: 20 },   // USA-Afghanistan
  { fromCountry: 1, toCountry: 57, affinity: 20 },   // USA-Pakistan
  { fromCountry: 1, toCountry: 58, affinity: 20 },   // USA-India
  { fromCountry: 1, toCountry: 59, affinity: 20 },   // USA-Burma
  { fromCountry: 1, toCountry: 60, affinity: 20 },   // USA-Thailand
  { fromCountry: 1, toCountry: 61, affinity: 20 },   // USA-Indonesia
  { fromCountry: 1, toCountry: 62, affinity: 20 },   // USA-Philippines
  { fromCountry: 1, toCountry: 63, affinity: 20 },   // USA-Guatemala
  { fromCountry: 1, toCountry: 64, affinity: 20 },   // USA-El Salvador
  { fromCountry: 1, toCountry: 65, affinity: 20 },   // USA-Costa Rica
  { fromCountry: 1, toCountry: 66, affinity: 20 },   // USA-Mauritania
  { fromCountry: 1, toCountry: 67, affinity: 20 },   // USA-Guinea
  { fromCountry: 1, toCountry: 68, affinity: 20 },   // USA-Ivory Coast
  { fromCountry: 1, toCountry: 69, affinity: 20 },   // USA-Burkina Faso
  { fromCountry: 1, toCountry: 70, affinity: 20 },   // USA-Ghana
  { fromCountry: 1, toCountry: 71, affinity: 20 },   // USA-Niger
  { fromCountry: 1, toCountry: 72, affinity: 20 },   // USA-Chad
  { fromCountry: 1, toCountry: 73, affinity: 20 },   // USA-Cameroon
  { fromCountry: 1, toCountry: 74, affinity: 20 },   // USA-Central Africa
  { fromCountry: 1, toCountry: 75, affinity: 20 },   // USA-Congo
  { fromCountry: 1, toCountry: 76, affinity: 20 },   // USA-Zimbabwe
  { fromCountry: 1, toCountry: 77, affinity: 20 },   // USA-Botswana
  { fromCountry: 1, toCountry: 78, affinity: 20 },   // USA-Jordan
  { fromCountry: 1, toCountry: 79, affinity: 20 },   // USA-Lebanon
  { fromCountry: 1, toCountry: 80, affinity: 20 }    // USA-Bolivia
];

// Initial diplomatic relations from USSR perspective
export const USSR_INITIAL_RELATIONS: DiplomaticRelation[] = [
  // USSR relations (SetCDipAff calls)
  { fromCountry: 2, toCountry: 1, affinity: -80 },  // USSR-USA
  { fromCountry: 2, toCountry: 2, affinity: 127 },   // USSR-USSR
  { fromCountry: 2, toCountry: 3, affinity: 10 },    // USSR-Mexico
  { fromCountry: 2, toCountry: 4, affinity: -30 },    // USSR-Honduras
  { fromCountry: 2, toCountry: 5, affinity: 80 },     // USSR-Nicaragua
  { fromCountry: 2, toCountry: 6, affinity: 0 },     // USSR-Panama
  { fromCountry: 2, toCountry: 7, affinity: 100 },   // USSR-Cuba
  { fromCountry: 2, toCountry: 8, affinity: 0 },     // USSR-Argentina
  { fromCountry: 2, toCountry: 9, affinity: 0 },     // USSR-Colombia
  { fromCountry: 2, toCountry: 10, affinity: 0 },    // USSR-Peru
  { fromCountry: 2, toCountry: 11, affinity: 0 },    // USSR-Venezuela
  { fromCountry: 2, toCountry: 12, affinity: 0 },    // USSR-Brazil
  { fromCountry: 2, toCountry: 13, affinity: 0 },    // USSR-Chile
  { fromCountry: 2, toCountry: 14, affinity: 0 },    // USSR-Canada
  { fromCountry: 2, toCountry: 15, affinity: 0 },      // USSR-Greece
  { fromCountry: 2, toCountry: 16, affinity: 0 },    // USSR-Sweden
  { fromCountry: 2, toCountry: 17, affinity: 0 },    // USSR-Britain
  { fromCountry: 2, toCountry: 18, affinity: 0 },    // USSR-France
  { fromCountry: 2, toCountry: 19, affinity: 0 },    // USSR-Spain
  { fromCountry: 2, toCountry: 20, affinity: 0 },    // USSR-West Germany
  { fromCountry: 2, toCountry: 21, affinity: 0 },    // USSR-Romania
  { fromCountry: 2, toCountry: 22, affinity: 0 },    // USSR-Italy
  { fromCountry: 2, toCountry: 23, affinity: 0 },    // USSR-East Germany
  { fromCountry: 2, toCountry: 24, affinity: 0 },    // USSR-Poland
  { fromCountry: 2, toCountry: 25, affinity: 0 },    // USSR-Czechoslovakia
  { fromCountry: 2, toCountry: 26, affinity: 0 },    // USSR-Yugoslavia
  { fromCountry: 2, toCountry: 27, affinity: 0 },    // USSR-South Africa
  { fromCountry: 2, toCountry: 28, affinity: 0 },    // USSR-Egypt
  { fromCountry: 2, toCountry: 29, affinity: 0 },    // USSR-Tunisia
  { fromCountry: 2, toCountry: 30, affinity: 0 },    // USSR-Morocco
  { fromCountry: 2, toCountry: 31, affinity: 0 },    // USSR-Algeria
  { fromCountry: 2, toCountry: 32, affinity: 0 },    // USSR-Libya
  { fromCountry: 2, toCountry: 33, affinity: 0 },    // USSR-Mali
  { fromCountry: 2, toCountry: 34, affinity: 0 },    // USSR-Nigeria
  { fromCountry: 2, toCountry: 35, affinity: 0 },    // USSR-Sudan
  { fromCountry: 2, toCountry: 36, affinity: 0 },    // USSR-Ethiopia
  { fromCountry: 2, toCountry: 37, affinity: 0 },    // USSR-Kenya
  { fromCountry: 2, toCountry: 38, affinity: 0 },    // USSR-Zaire
  { fromCountry: 2, toCountry: 39, affinity: 0 },    // USSR-Tanzania
  { fromCountry: 2, toCountry: 40, affinity: 0 },    // USSR-Mozambique
  { fromCountry: 2, toCountry: 41, affinity: 0 },    // USSR-Zambia
  { fromCountry: 2, toCountry: 42, affinity: 0 },    // USSR-Angola
  { fromCountry: 2, toCountry: 43, affinity: 0 },    // USSR-Japan
  { fromCountry: 2, toCountry: 44, affinity: 0 },    // USSR-North Korea
  { fromCountry: 2, toCountry: 45, affinity: 0 },    // USSR-South Korea
  { fromCountry: 2, toCountry: 46, affinity: 0 },    // USSR-Australia
  { fromCountry: 2, toCountry: 47, affinity: 0 },    // USSR-China
  { fromCountry: 2, toCountry: 48, affinity: 0 },    // USSR-Vietnam
  { fromCountry: 2, toCountry: 49, affinity: 0 },    // USSR-Turkey
  { fromCountry: 2, toCountry: 50, affinity: 0 },    // USSR-Syria
  { fromCountry: 2, toCountry: 51, affinity: 0 },    // USSR-Israel
  { fromCountry: 2, toCountry: 52, affinity: 0 },    // USSR-Taiwan
  { fromCountry: 2, toCountry: 53, affinity: 0 },    // USSR-Iraq
  { fromCountry: 2, toCountry: 54, affinity: 0 },    // USSR-Saudi Arabia
  { fromCountry: 2, toCountry: 55, affinity: 0 },    // USSR-Iran
  { fromCountry: 2, toCountry: 56, affinity: 0 },    // USSR-Afghanistan
  { fromCountry: 2, toCountry: 57, affinity: 0 },    // USSR-Pakistan
  { fromCountry: 2, toCountry: 58, affinity: 0 },    // USSR-India
  { fromCountry: 2, toCountry: 59, affinity: 0 },    // USSR-Burma
  { fromCountry: 2, toCountry: 60, affinity: 0 },    // USSR-Thailand
  { fromCountry: 2, toCountry: 61, affinity: 0 },    // USSR-Indonesia
  { fromCountry: 2, toCountry: 62, affinity: 0 },    // USSR-Philippines
  { fromCountry: 2, toCountry: 63, affinity: 0 },    // USSR-Guatemala
  { fromCountry: 2, toCountry: 64, affinity: 0 },    // USSR-El Salvador
  { fromCountry: 2, toCountry: 65, affinity: 0 },    // USSR-Costa Rica
  { fromCountry: 2, toCountry: 66, affinity: 0 },    // USSR-Mauritania
  { fromCountry: 2, toCountry: 67, affinity: 0 },    // USSR-Guinea
  { fromCountry: 2, toCountry: 68, affinity: 0 },    // USSR-Ivory Coast
  { fromCountry: 2, toCountry: 69, affinity: 0 },    // USSR-Burkina Faso
  { fromCountry: 2, toCountry: 70, affinity: 0 },    // USSR-Ghana
  { fromCountry: 2, toCountry: 71, affinity: 0 },    // USSR-Niger
  { fromCountry: 2, toCountry: 72, affinity: 0 },    // USSR-Chad
  { fromCountry: 2, toCountry: 73, affinity: 0 },    // USSR-Cameroon
  { fromCountry: 2, toCountry: 74, affinity: 0 },    // USSR-Central Africa
  { fromCountry: 2, toCountry: 75, affinity: 0 },    // USSR-Congo
  { fromCountry: 2, toCountry: 76, affinity: 0 },    // USSR-Zimbabwe
  { fromCountry: 2, toCountry: 77, affinity: 0 },    // USSR-Botswana
  { fromCountry: 2, toCountry: 78, affinity: 0 },    // USSR-Jordan
  { fromCountry: 2, toCountry: 79, affinity: 0 },    // USSR-Lebanon
  { fromCountry: 2, toCountry: 80, affinity: 0 }     // USSR-Bolivia
];

// Combine all initial relations
export const INITIAL_DIPLOMATIC_RELATIONS: DiplomaticRelation[] = [
  ...USA_INITIAL_RELATIONS,
  ...USSR_INITIAL_RELATIONS
];

// Create a matrix for easy lookup
export function createDiplomaticMatrix(): number[][] {
  const matrix: number[][] = [];
  
  // Initialize matrix with neutral relations (0)
  for (let i = 0; i <= 80; i++) {
    matrix[i] = [];
    for (let j = 0; j <= 80; j++) {
      matrix[i][j] = 0;
    }
  }
  
  // Set self-relations to maximum
  for (let i = 1; i <= 80; i++) {
    matrix[i][i] = 127;
  }
  
  // Apply initial relations
  for (const relation of INITIAL_DIPLOMATIC_RELATIONS) {
    matrix[relation.fromCountry][relation.toCountry] = relation.affinity;
    // Diplomatic relations are symmetric
    matrix[relation.toCountry][relation.fromCountry] = relation.affinity;
  }
  
  return matrix;
}
