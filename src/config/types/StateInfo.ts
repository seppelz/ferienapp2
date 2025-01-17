import { Holiday, SeasonalTradition } from '../../types/holiday';

export interface VacationDestination {
  name: string;
  description: string;
  attractions: string[];
  activities: string[];
}

export interface RegionalSpecialtyItem {
  title: string;
  description: string;
  icon: string;
}

export interface RegionalSpecialtyCategory {
  title: string;
  icon: string;
  items: RegionalSpecialtyItem[];
}

export interface StateInfo {
  fullName: string;
  shortName: string;
  capital: string;
  description: string;
  culturalHighlights: string[];
  keyFacts: {
    population: string;
    area: string;
    founded: string;
    economicStrength: string[];
  };
  holidays: Holiday[];
  schoolHolidays: Holiday[];
  uniqueHolidayInfo: string;
  traditionInfo: string;
  seasonalTraditions: SeasonalTradition[];
  vacationDestinations: VacationDestination[];
  regionalSpecialties: RegionalSpecialtyCategory[];
} 