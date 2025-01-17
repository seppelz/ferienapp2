import { GermanState } from './GermanState';

export type HolidayType = 'public' | 'school' | 'regional' | 'bridge' | 'optional';

export interface BaseHoliday {
  name: string;
  state?: GermanState;
  type: HolidayType;
  details?: {
    description: string;
    traditions?: string[];
    locations?: string[];
    culturalSignificance?: string;
    activities?: string[];
  };
  isRegional?: boolean;
}

export interface SingleDayHoliday extends BaseHoliday {
  date: string;
  start?: never;
  end?: never;
}

export interface MultiDayHoliday extends BaseHoliday {
  date?: never;
  start: string;
  end: string;
}

export type Holiday = SingleDayHoliday | MultiDayHoliday;

export interface VacationPlan {
  start: string;
  end: string;
  id: string;
  state: GermanState;
  isVisible?: boolean;
}

export interface StateVacationInfo {
  state: GermanState;
  availableVacationDays: number;
  vacationPlans: VacationPlan[];
}

export interface BridgeDay extends SingleDayHoliday {
  type: 'bridge';
  connectedHolidays: Holiday[];
  requiredVacationDays: number;
  totalDaysOff: number;
  efficiency: number;
  pattern: string;
  periodStart: string;
  periodEnd: string;
}

export interface VacationPeriod {
  startDate: string;
  endDate: string;
  holidays: Holiday[];
  bridgeDays: BridgeDay[];
  requiredVacationDays: number;
  totalDaysOff: number;
  efficiency: number;
}

// Raw data interfaces for the holidays.json/ts file
export interface RawHolidayDate {
  start: string;
  end?: string;
}

export interface RawSchoolHoliday extends RawHolidayDate {
  name: string;
}

export interface RawPublicHoliday extends RawHolidayDate {
  name: string;
  nationwide?: boolean;
}

export interface HolidayData {
  schoolHolidays: Record<string, Record<GermanState | string, RawSchoolHoliday[]>>;
  publicHolidays: Record<string, Record<GermanState | 'ALL' | string, RawPublicHoliday[]>>;
}

export interface SeasonalTradition {
  season: string;
  description: string;
}

export interface HolidayDetails {
  description: string;
  traditions?: string[];
  locations?: string[];
  culturalSignificance?: string;
  familyActivities?: string[];
} 