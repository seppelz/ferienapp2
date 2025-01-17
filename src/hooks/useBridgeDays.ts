import { useCallback, useMemo } from 'react';
import { Holiday, BridgeDay } from '../types/holiday';
import { GermanState } from '../types/GermanState';
import { holidayService } from '../services/holidayService';
import { bridgeDayService } from '../services/bridgeDayService';
import { getHolidayDate } from '../services/bridgeDayService';
import { isSameDay } from 'date-fns';

interface BridgeDaysResult {
  holidays: Holiday[];
  bridgeDays: BridgeDay[];
  isLoading: boolean;
  getBridgeDays: () => BridgeDay[];
  isPublicHoliday: (d: Date) => boolean;
}

export function useBridgeDays(state: GermanState | null): BridgeDaysResult {
  const memoizedState = useMemo(() => state, [state]);
  const year = new Date().getFullYear();

  const holidays = useMemo((): Holiday[] => {
    if (!memoizedState) {
      return [];
    }
    return [
      ...holidayService.getPublicHolidays(year, memoizedState),
      ...holidayService.getSchoolHolidays(year, memoizedState)
    ];
  }, [memoizedState, year]);

  const getBridgeDays = useCallback((): BridgeDay[] => {
    if (!memoizedState) {
      return [];
    }
    return bridgeDayService.calculateBridgeDays(holidays, memoizedState);
  }, [memoizedState, holidays]);

  const bridgeDays = useMemo(() => getBridgeDays(), [getBridgeDays]);

  const isPublicHoliday = useCallback(
    (d: Date): boolean => {
      if (!memoizedState) {
        return false;
      }
      const publicHolidays = holidayService.getPublicHolidays(year, memoizedState);
      return publicHolidays.some(h => isSameDay(getHolidayDate(h), d));
    },
    [memoizedState, year]
  );

  return {
    holidays,
    bridgeDays,
    isLoading: !memoizedState,
    getBridgeDays,
    isPublicHoliday,
  };
} 