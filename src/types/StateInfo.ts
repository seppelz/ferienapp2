import { Holiday } from './holiday';
import { GermanState } from './GermanState';

export interface VacationDestination {
  name: string;
  description: string;
  attractions: string[];
  activities: string[];
}

export interface StateInfo {
  fullName: string;
  shortName: GermanState;
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
  seasonalTraditions: {
    season: string;
    description: string;
  }[];
  vacationDestinations: VacationDestination[];
  regionalSpecialties: {
    title: string;
    icon: string;
    items: {
      title: string;
      description: string;
      icon: string;
    }[];
  }[];
} 