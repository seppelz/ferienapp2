import { useCallback, useMemo } from 'react';
import { Holiday } from '../types/holiday';
import { GermanState } from '../types/GermanState';
import { holidayService } from '../services/holidayService';
import { getHolidayDate, isHolidayOnDate } from '../services/bridgeDayService';

export function useHolidays(state: GermanState | null) {
  const memoizedState = useMemo(() => state, [state]);
  const year = new Date().getFullYear();

  const getHolidays = useCallback((): Holiday[] => {
    if (!memoizedState) {
      return [];
    }

    return [
      ...holidayService.getPublicHolidays(year, memoizedState),
      ...holidayService.getSchoolHolidays(year, memoizedState)
    ];
  }, [memoizedState, year]);

  const isHoliday = useCallback(
    (d: Date): boolean => {
      if (!memoizedState) {
        return false;
      }

      const holidays = getHolidays();
      return holidays.some(h => isHolidayOnDate(h, d));
    },
    [memoizedState, getHolidays]
  );

  return {
    getHolidays,
    isHoliday,
  };
} 