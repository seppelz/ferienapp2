import { Holiday, SingleDayHoliday, MultiDayHoliday } from '../types/holiday';
import { GermanState } from '../types/GermanState';
import { holidays } from '../data/holidays';
import { isSameDay, startOfDay } from 'date-fns';

// Helper function to safely get date from a Holiday
export const getHolidayDate = (holiday: Holiday): Date => {
  if ('date' in holiday && holiday.date) {
    return startOfDay(new Date(holiday.date));
  } else if ('start' in holiday && holiday.start) {
    return startOfDay(new Date(holiday.start));
  }
  throw new Error('Invalid holiday date');
};

// Helper function to get end date from a Holiday
export const getHolidayEndDate = (holiday: Holiday): Date => {
  if ('date' in holiday && holiday.date) {
    return startOfDay(new Date(holiday.date));
  } else if ('end' in holiday && holiday.end) {
    return startOfDay(new Date(holiday.end));
  }
  return getHolidayDate(holiday); // Default to start date if no end date
};

// Helper function to check if a holiday is on a specific date
export const isHolidayOnDate = (holiday: Holiday, date: Date): boolean => {
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

export class BridgeDayService {
  private holidays: Holiday[];

  constructor(rawHolidays: any[]) {
    // Convert raw holidays to proper Holiday objects
    this.holidays = rawHolidays.map(holiday => {
      const { start, end, ...rest } = holiday;
      if (!end) {
        return {
          ...rest,
          type: 'public' as const,
          date: start
        } as SingleDayHoliday;
      }
      return {
        ...rest,
        type: 'public' as const,
        start,
        end
      } as MultiDayHoliday;
    });
  }

  calculateBridgeDays(holidays: Holiday[], state: GermanState) {
    // Implementation of bridge day calculation
    return [];
  }
}

export const bridgeDayService = new BridgeDayService(holidays.publicHolidays["2025"]["ALL"]); 