import { Holiday, SingleDayHoliday, MultiDayHoliday, RawSchoolHoliday, RawPublicHoliday } from '../../types';
import { GermanState } from '../../types';
import { holidays } from '../../data/holidays';

const createSingleDayHoliday = (
  rawHoliday: RawSchoolHoliday | RawPublicHoliday,
  type: 'school' | 'public',
  state: GermanState,
  details?: { description: string; familyActivities?: string[] }
): SingleDayHoliday => {
  const { start, end, ...rest } = rawHoliday;
  return {
    ...rest,
    type,
    state,
    date: start,
    details
  };
};

const createMultiDayHoliday = (
  rawHoliday: RawSchoolHoliday | RawPublicHoliday,
  type: 'school' | 'public',
  state: GermanState,
  details?: { description: string; familyActivities?: string[] }
): MultiDayHoliday => {
  const { ...rest } = rawHoliday;
  return {
    ...rest,
    type,
    state,
    start: rest.start,
    end: rest.end!,
    details
  };
};

export const getStateHolidays = (
  stateCode: GermanState,
  year: number,
  stateSpecificDetails: Record<string, { description: string; traditions?: string[]; culturalSignificance?: string; locations?: string[] }>
): Holiday[] => {
  const stateHolidays = holidays.publicHolidays[year][stateCode] || [];
  const nationalHolidays = holidays.publicHolidays[year]["ALL"] || [];

  return [...stateHolidays, ...nationalHolidays].map(holiday => {
    const details = stateSpecificDetails[holiday.name];
    if (!holiday.end) {
      return createSingleDayHoliday(holiday, 'public', stateCode, details);
    }
    return createMultiDayHoliday(holiday, 'public', stateCode, details);
  });
};

export const getStateSchoolHolidays = (
  stateCode: GermanState,
  year: number,
  familyActivities: Record<string, { description: string; activities: string[] }>
): Holiday[] => {
  const schoolHolidays = holidays.schoolHolidays[year][stateCode] || [];

  return schoolHolidays.map(holiday => {
    const holidayName = holiday.name.split(" ")[0];
    const holidayInfo = familyActivities[holidayName] || {
      description: `${holiday.name} in ${stateCode}`,
      activities: []
    };

    const details = {
      description: holidayInfo.description,
      familyActivities: holidayInfo.activities
    };

    if (!holiday.end) {
      return createSingleDayHoliday(holiday, 'school', stateCode, details);
    }
    return createMultiDayHoliday(holiday, 'school', stateCode, details);
  });
}; 