import { Holiday } from '../types/holiday';
import { GermanState } from '../types/GermanState';
import { isSameDay, startOfDay } from 'date-fns';

// Helper function to safely get date from a Holiday
const getHolidayDate = (holiday: Holiday): Date => {
  if ('date' in holiday && holiday.date) {
    return startOfDay(new Date(holiday.date));
  } else if ('start' in holiday && holiday.start) {
    return startOfDay(new Date(holiday.start));
  }
  throw new Error('Invalid holiday date');
};

// Helper function to check if a holiday is on a specific date
const isHolidayOnDate = (holiday: Holiday, date: Date): boolean => {
  try {
    const targetDate = startOfDay(date);
    if ('date' in holiday && holiday.date) {
      return isSameDay(startOfDay(new Date(holiday.date)), targetDate);
    } else if ('start' in holiday && holiday.start && holiday.end) {
      const start = startOfDay(new Date(holiday.start));
      const end = startOfDay(new Date(holiday.end));
      return targetDate >= start && targetDate <= end;
    }
    return false;
  } catch {
    return false;
  }
};

export class BridgeDayAnalyzer {
  constructor(private holidays: Holiday[]) {}

  findHolidaysInYear(year: number): Holiday[] {
    return this.holidays.filter(h => getHolidayDate(h).getFullYear() === year);
  }

  findConnectedHolidays(year: number): [Holiday, Holiday][] {
    const yearHolidays = this.findHolidaysInYear(year);
    const connectedPairs: [Holiday, Holiday][] = [];

    for (let i = 0; i < yearHolidays.length; i++) {
      const holiday1 = yearHolidays[i];
      const date1 = getHolidayDate(holiday1);

      for (let j = i + 1; j < yearHolidays.length; j++) {
        const holiday2 = yearHolidays[j];
        const date2 = getHolidayDate(holiday2);

        // Check if holidays are within 4 days of each other
        const daysDiff = Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 4) {
          connectedPairs.push([holiday1, holiday2]);
        }
      }
    }

    return connectedPairs;
  }

  isPublicHoliday(date: Date): boolean {
    return this.holidays.some(holiday => isHolidayOnDate(holiday, date));
  }
} 