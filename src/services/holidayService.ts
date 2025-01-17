import { Holiday, SingleDayHoliday, MultiDayHoliday } from '../types/holiday';
import { GermanState } from '../types/GermanState';
import { holidays } from '../data/holidays';
import { parseDateString } from '../utils/dateUtils';
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

// Helper function to get end date from a Holiday
const getHolidayEndDate = (holiday: Holiday): Date => {
  if ('date' in holiday && holiday.date) {
    return startOfDay(new Date(holiday.date));
  } else if ('end' in holiday && holiday.end) {
    return startOfDay(new Date(holiday.end));
  }
  return getHolidayDate(holiday); // Default to start date if no end date
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

export const holidayService = {
  getHolidays(year: number, stateCode: GermanState): Holiday[] {
    const publicHolidays = this.getPublicHolidays(year, stateCode);
    const schoolHolidays = this.getSchoolHolidays(year, stateCode);
    return [...publicHolidays, ...schoolHolidays].sort((a, b) => {
      const dateA = getHolidayDate(a);
      const dateB = getHolidayDate(b);
      return dateA.getTime() - dateB.getTime();
    });
  },

  getPublicHolidays(year: number, stateCode: GermanState): Holiday[] {
    const stateHolidays = holidays.publicHolidays[year][stateCode] || [];
    const nationalHolidays = holidays.publicHolidays[year]["ALL"] || [];
    return [...stateHolidays, ...nationalHolidays].map(holiday => {
      const { start, end, ...rest } = holiday;
      if (!end) {
        return {
          ...rest,
          type: 'public' as const,
          state: stateCode,
          date: start
        } as SingleDayHoliday;
      }
      return {
        ...rest,
        type: 'public' as const,
        state: stateCode,
        start,
        end
      } as MultiDayHoliday;
    });
  },

  getSchoolHolidays(year: number, stateCode: GermanState): Holiday[] {
    const schoolHolidays = holidays.schoolHolidays[year][stateCode] || [];
    return schoolHolidays.map(holiday => {
      const { start, end, ...rest } = holiday;
      if (!end) {
        return {
          ...rest,
          type: 'school' as const,
          state: stateCode,
          date: start
        } as SingleDayHoliday;
      }
      return {
        ...rest,
        type: 'school' as const,
        state: stateCode,
        start,
        end
      } as MultiDayHoliday;
    });
  }
};