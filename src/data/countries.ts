// Country data extraction script
// This script parses the InitCountry calls from the Pascal source

export interface CountryData {
  id: number;
  name: string;
  gnp: number;
  population: number;
  militarySpending: number;
  governmentWing: number;
  insurgencyWing: number;
  governmentStrength: number;
  insurgencyStrength: number;
  governmentGrowth: number;
  populationGrowth: number;
  governmentStability: number;
  investmentFraction: number;
  governmentPopularity: number;
  militaryMen: number;
  dontMess: number;
  deaths: number;
  // Calculated fields
  draftFraction: number;
  leftPower: boolean;
  maturity: number;
  prestigeValue: number;
  militaryPower: number;
  insurgencyPower: number;
}

// Raw country data extracted from Init.p
// Format: InitCountry(id, name, gnp, pop, milSpend, govWing, insWing, govStr, insStr, govGrowth, popGrowth, govStab, invtFrac, govPop, milMen, dontMess, deaths)
export const RAW_COUNTRY_DATA = [
  // USAmerica section
  [1, 'USA', 21350, 2140, 10665, 10, -125, 10000, 0, 25, 14, 9, 46, 255, 2130, 100, 434],
  [14, 'Canada', 2040, 228, 441, -10, -125, 10000, 0, 36, 20, 9, 56, 255, 77, 99, 12],
  [3, 'Mexico', 919, 592, 40, -30, 90, 2000, 0, 32, 33, 8, 56, 150, 95, 90, 781],
  [4, 'Honduras', 16, 30, 3, 40, -70, 150, 20, 15, 32, 6, 64, 140, 12, 70, 197],
  [5, 'Nicaragua', 21, 23, 4, -70, 60, 1000, 300, 24, 30, 7, 36, 110, 30, 50, 2000],
  [6, 'Panama', 23, 17, 2, 30, -70, 1000, 50, 41, 30, 7, 71, 70, 8, 80, 108],
  [7, 'Cuba', 123, 95, 80, -80, 30, 2000, 0, -5, 20, 6, 70, 40, 120, 10, 4192],
  
  // South America
  [8, 'Argentina', 534, 254, 157, 50, -80, 900, 40, 31, 16, 7, 54, 140, 160, 60, 11343],
  [9, 'Colombia', 230, 259, 16, 10, -50, 900, 100, 27, 32, 7, 51, 200, 50, 65, 9149],
  [10, 'Peru', 114, 153, 75, -30, -60, 600, 200, 27, 27, 6, 36, 86, 95, 65, 1061],
  [11, 'Venezuela', 399, 122, 65, 10, -70, 900, 50, 22, 36, 8, 102, 228, 55, 70, 1735],
  [12, 'Brazil', 1800, 1097, 174, 20, -60, 1200, 100, 43, 29, 7, 56, 120, 455, 60, 200],
  [13, 'Chile', 158, 103, 41, 70, -60, 1200, 100, 13, 21, 6, 24, 100, 110, 70, 748],
  
  // USSR
  [2, 'Soviet Union', 9678, 2550, 13482, -60, 30, 2000, 100, 38, 14, 7, 70, 50, 4600, 0, 411],
  [15, 'Greece', 324, 89, 145, -30, 80, 900, 0, 66, 7, 7, 61, 180, 190, 75, 9341],
  [16, 'Sweden', 873, 83, 293, -30, 110, 2000, 0, 31, 7, 9, 59, 255, 70, 70, 6],
  
  // Europe
  [17, 'Britain', 3195, 564, 1295, 0, -110, 5000, 0, 22, 5, 9, 46, 255, 345, 90, 1463],
  [18, 'France', 4730, 529, 1659, -20, 100, 3000, 0, 42, 10, 9, 54, 240, 575, 70, 164],
  [19, 'Spain', 1464, 375, 227, 10, -80, 3000, 0, 57, 10, 7, 54, 140, 375, 70, 216],
  [20, 'West Germany', 6316, 617, 1992, 10, -100, 5000, 0, 35, 9, 9, 56, 250, 495, 90, 61],
  [21, 'Romania', 362, 212, 346, -60, 100, 1000, 0, 83, 10, 7, 60, 50, 220, 5, 0],
  [22, 'Italy', 2609, 550, 569, 20, -50, 900, 100, 39, 7, 7, 51, 220, 500, 80, 259],
  [23, 'East Germany', 950, 171, 526, -60, 40, 2000, 0, 32, -3, 8, 70, 30, 220, 0, 140],
  [24, 'Poland', 1276, 338, 687, -60, 0, 2000, 300, 40, 12, 5, 60, 40, 435, 0, 575],
  [25, 'Czechoslovakia', 716, 148, 405, -60, 60, 2000, 0, 27, 7, 7, 60, 32, 210, 0, 101],
  [26, 'Yugoslavia', 461, 213, 193, -40, 30, 1200, 300, 55, 11, 6, 60, 60, 270, 20, 51],
  
  // Africa
  [27, 'South Africa', 438, 247, 175, 30, -30, 1000, 500, 23, 29, 8, 64, 120, 50, 60, 1707],
  [28, 'Egypt', 169, 375, 135, 10, -80, 500, 100, 15, 25, 6, 61, 100, 400, 60, 615],
  [29, 'Tunisia', 60, 57, 10, -30, 50, 1000, 50, 41, 20, 6, 74, 80, 20, 60, 3149],
  [30, 'Morocco', 129, 175, 45, 40, -60, 1000, 100, 19, 27, 6, 66, 150, 75, 60, 2297],
  [31, 'Algeria', 257, 168, 43, -50, 50, 900, 100, 18, 26, 7, 117, 50, 80, 50, 32767],
  [32, 'Libya', 198, 23, 47, -70, 50, 1000, 300, 105, 33, 5, 64, 30, 25, 30, 35],
  [33, 'Mali', 8, 57, 2, -70, 60, 500, 100, 9, 21, 4, 33, 30, 8, 50, 8],
  [34, 'Nigeria', 481, 630, 187, 10, -90, 600, 100, 34, 23, 5, 74, 100, 270, 50, 32767],
  [35, 'Sudan', 59, 183, 23, 20, -90, 600, 30, 1, 29, 4, 51, 50, 50, 50, 4356],
  [36, 'Ethiopia', 35, 281, 10, -60, 50, 600, 100, 20, 22, 3, 25, 40, 50, 20, 32767],
  [37, 'Kenya', 52, 132, 8, 20, -100, 1000, 0, 34, 32, 6, 61, 108, 9, 50, 14038],
  [38, 'Zaire', 65, 245, 3, 20, -10, 400, 200, 16, 25, 3, 87, 40, 55, 60, 14118],
  [39, 'Tanzania', 41, 154, 16, -50, 60, 600, 100, 30, 26, 5, 46, 60, 25, 50, 100],
  [40, 'Mozambique', 24, 92, 50, -70, 50, 900, 100, 20, 18, 4, 60, 50, 20, 30, 4620],
  [41, 'Zambia', 27, 50, 7, -70, 50, 900, 100, 20, 28, 3, 62, 92, 16, 40, 1338],
  [42, 'Angola', 28, 63, 10, -70, 50, 1000, 300, 36, 20, 4, 50, 40, 30, 30, 32767],
  
  // Asia
  [43, 'Japan', 8845, 1111, 626, 10, -90, 5000, 0, 77, 11, 9, 77, 240, 237, 90, 60],
  [44, 'North Korea', 170, 159, 121, -60, 30, 2000, 0, 38, 22, 5, 70, 20, 470, 0, 88],
  [45, 'South Korea', 480, 347, 326, 50, -30, 1500, 0, 71, 23, 7, 77, 90, 630, 95, 2747],
  [46, 'Australia', 1148, 138, 289, 0, -100, 3000, 0, 31, 21, 9, 59, 255, 70, 90, 0],
  [47, 'China', 2190, 8388, 1436, -60, 100, 1000, 0, 52, 16, 8, 70, 36, 4300, 50, 25961],
  [48, 'VietNam', 693, 435, 1386, -70, 110, 5000, 0, 8, 28, 6, 70, 20, 643, 10, 32767],
  [49, 'Turkey', 539, 399, 258, 50, -60, 2000, 0, 40, 26, 7, 46, 180, 453, 70, 267],
  [50, 'Syria', 78, 73, 118, -30, 60, 700, 200, 22, 30, 6, 32, 48, 230, 30, 1916],
  [51, 'Israel', 138, 34, 407, 20, -60, 2000, 0, 52, 39, 9, 59, 170, 190, 80, 84],
  [52, 'Taiwan', 149, 165, 209, 60, -100, 2000, 0, 63, 32, 8, 75, 80, 504, 70, 5349],
  [53, 'Iraq', 225, 111, 487, -50, 60, 600, 200, 33, 31, 5, 69, 30, 155, 40, 7215],
  [54, 'Saudi Arabia', 542, 90, 1383, 70, -70, 900, 200, 66, 25, 6, 77, 80, 95, 80, 1],
  [55, 'Iran', 555, 324, 1060, -30, 20, 700, 100, 81, 27, 6, 77, 50, 385, 50, 1025],
  [56, 'Afghanistan', 27, 193, 7, -80, 20, 200, 150, -1, 20, 2, 60, 26, 130, 20, 32767],
  [57, 'Pakistan', 182, 705, 91, -10, 20, 300, 100, 13, 23, 5, 41, 120, 502, 60, 32767],
  [58, 'India', 1175, 6132, 365, -30, 20, 500, 100, 13, 23, 6, 54, 200, 1670, 50, 7590],
  [59, 'Burma', 45, 312, 17, 30, -70, 400, 100, 7, 21, 6, 25, 50, 209, 50, 5598],
  [60, 'Thailand', 234, 421, 98, 30, -40, 500, 100, 46, 30, 8, 69, 120, 227, 60, 1570],
  [61, 'Indonesia', 458, 1360, 159, 40, -80, 800, 50, 24, 24, 7, 51, 100, 260, 70, 32767],
  [62, 'Philippines', 244, 444, 55, 30, -70, 800, 200, 25, 31, 3, 61, 84, 120, 80, 14001],
  
  // Additional countries
  [63, 'Guatemala', 61, 61, 6, 60, -60, 100, 20, 24, 29, 6, 51, 120, 13, 70, 499],
  [64, 'El Salvador', 28, 41, 5, 30, -70, 200, 50, 18, 31, 4, 59, 100, 8, 70, 25000],
  [65, 'Costa Rica', 34, 20, 0, 20, -80, 300, 20, 34, 34, 8, 62, 180, 2, 70, 76],
  [66, 'Mauritania', 4, 13, 3, 30, -40, 100, 10, 38, 19, 3, 102, 100, 3, 40, 3],
  [67, 'Guinea', 13, 44, 2, 30, -60, 150, 20, 2, 20, 5, 60, 100, 7, 50, 10],
  [68, 'Ivory Coast', 74, 49, 5, 50, -50, 200, 10, 35, 22, 6, 77, 120, 7, 50, 1],
  [69, 'Burkina Faso', 9, 60, 2, -30, 40, 100, 10, 7, 19, 2, 56, 60, 5, 40, 12],
  [70, 'Ghana', 42, 99, 7, -40, 30, 200, 40, -1, 27, 5, 25, 90, 20, 50, 125],
  [71, 'Niger', 12, 46, 1, -50, 40, 100, 10, -12, 26, 4, 15, 100, 4, 50, 24],
  [72, 'Chad', 6, 39, 2, 30, -70, 200, 80, -10, 14, 3, 44, 100, 11, 50, 2291],
  [73, 'Cameroon', 40, 64, 6, 40, -40, 100, 10, 30, 16, 5, 54, 100, 10, 50, 15725],
  [74, 'Central Africa', 5, 18, 1, 40, -60, 100, 10, 4, 18, 2, 36, 100, 3, 50, 2],
  [75, 'Congo', 9, 13, 4, -60, 40, 150, 10, 29, 20, 3, 40, 100, 7, 40, 742],
  [76, 'Zimbabwe', 33, 63, 22, -40, 70, 150, 20, 24, 38, 4, 44, 100, 15, 50, 3871],
  [77, 'Botswana', 5, 7, 1, -20, 40, 100, 10, 60, 20, 7, 67, 120, 1, 50, 6],
  [78, 'Jordan', 24, 27, 28, 40, -50, 300, 10, 13, 31, 8, 108, 180, 60, 70, 2159],
  [79, 'Lebanon', 33, 28, 8, 0, -30, 50, 40, 2, 28, 1, 51, 30, 20, 50, 32767],
  [80, 'Bolivia', 27, 54, 7, 50, -60, 200, 10, 25, 24, 4, 46, 60, 20, 70, 4414]
];

// Convert raw data to structured country objects
export function createCountryData(rawData: number[]): CountryData {
  const [
    id, name, gnp, population, militarySpending, governmentWing, insurgencyWing,
    governmentStrength, insurgencyStrength, governmentGrowth, populationGrowth,
    governmentStability, investmentFraction, governmentPopularity, militaryMen,
    dontMess, deaths
  ] = rawData;

  // Apply the same calculations as in InitCountry
  const adjustedGnp = Math.floor(gnp / 2);
  const adjustedMilSpend = Math.floor(militarySpending / 2);
  const draftFraction = Math.floor((militaryMen * 255) / population);
  const leftPower = governmentWing < 0;
  const maturity = Math.max(0, 256 - Math.floor(deaths / population));

  return {
    id,
    name: String(name),
    gnp: adjustedGnp,
    population,
    militarySpending: adjustedMilSpend,
    governmentWing,
    insurgencyWing,
    governmentStrength,
    insurgencyStrength,
    governmentGrowth,
    populationGrowth,
    governmentStability,
    investmentFraction,
    governmentPopularity,
    militaryMen,
    dontMess,
    deaths,
    draftFraction,
    leftPower,
    maturity,
    prestigeValue: 0, // Will be calculated during game initialization
    militaryPower: 0, // Will be calculated during game initialization
    insurgencyPower: 0 // Will be calculated during game initialization
  };
}

// Generate all country data
export const COUNTRIES: CountryData[] = RAW_COUNTRY_DATA.map((rawData: (string | number)[]) => {
  // Convert all items to numbers, handling country names specially
  const convertedData = rawData.map((item, index) => {
    if (index === 1) { // Country name is at index 1
      return item; // Keep as string
    }
    if (typeof item === 'string') {
      const num = parseFloat(item);
      return isNaN(num) ? 0 : num;
    }
    return item;
  });
  return createCountryData(convertedData as number[]);
});

// Create lookup maps for easy access
export const COUNTRY_BY_ID = new Map(COUNTRIES.map(country => [country.id, country]));
export const COUNTRY_BY_NAME = new Map(COUNTRIES.map(country => [country.name, country]));

// Export specific countries for easy access
export const USA = COUNTRY_BY_ID.get(1)!;
export const USSR = COUNTRY_BY_ID.get(2)!;
