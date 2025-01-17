import { holidays } from '../data/holidays';
import { Holiday } from '../types/holiday';
import { GermanState } from '../types/GermanState';

export function getStateHolidays(state: GermanState, year: number): Holiday[] {
  const stateHolidays = holidays.publicHolidays[year]?.[state] || [];
  
  return stateHolidays.map(holiday => ({
    name: holiday.name,
    date: holiday.start,
    description: "", // State-specific descriptions will be added in state files
    type: "public",
    nationwide: false
  }));
} 