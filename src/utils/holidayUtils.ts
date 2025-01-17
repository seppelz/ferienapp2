import { Holiday, SingleDayHoliday, MultiDayHoliday, RawPublicHoliday, RawSchoolHoliday, HolidayDetails } from '../types/holiday';

export function createHoliday(
  rawHoliday: RawPublicHoliday | RawSchoolHoliday,
  type: 'public' | 'school',
  isRegional: boolean,
  details: HolidayDetails
): Holiday {
  const base = {
    name: rawHoliday.name,
    type,
    isRegional,
    details,
  };

  if (!rawHoliday.end) {
    // Single day holiday
    return {
      ...base,
      date: rawHoliday.start,
    } as SingleDayHoliday;
  } else {
    // Multi-day holiday
    return {
      ...base,
      start: rawHoliday.start,
      end: rawHoliday.end,
    } as MultiDayHoliday;
  }
} 