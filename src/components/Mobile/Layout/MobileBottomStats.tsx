import React from 'react';
import { Holiday } from '../../../types/holiday';
import { VacationPlan } from '../../../types/vacationPlan';
import { isWeekend, isSameDay, eachDayOfInterval, differenceInBusinessDays } from 'date-fns';
import { holidayColors } from '../../../constants/colors';

interface MobileBottomStatsProps {
  vacationPlans: VacationPlan[];
  holidays: Holiday[];
  personId: 1 | 2;
}

export const MobileBottomStats: React.FC<MobileBottomStatsProps> = ({
  vacationPlans,
  holidays,
  personId
}) => {
  const colors = personId === 1 ? holidayColors.person1.ui : holidayColors.person2.ui;
  
  const getHolidayDate = (holiday: Holiday): Date => {
    if ('date' in holiday && holiday.date) {
      return new Date(holiday.date);
    } else if ('start' in holiday && holiday.start) {
      return new Date(holiday.start);
    }
    throw new Error('Invalid holiday date');
  };

  const isPublicHoliday = (date: Date) => {
    return holidays.some(h => 
      h.type === 'public' && isSameDay(getHolidayDate(h), date)
    );
  };

  // Calculate vacation days and additional free days
  const stats = vacationPlans.reduce((acc, vacation) => {
    if (!vacation.isVisible) return acc;

    const allDays = eachDayOfInterval({ start: vacation.start, end: vacation.end });
    
    // Count workdays that are not holidays as vacation days
    const vacationDays = allDays.filter(date => {
      if (isWeekend(date)) return false;
      return !isPublicHoliday(date);
    }).length;

    // Count weekends and holidays as additional free days
    const additionalFreeDays = allDays.filter(date => {
      if (isWeekend(date)) return true;
      return isPublicHoliday(date);
    }).length;

    return {
      vacationDays: acc.vacationDays + vacationDays,
      additionalFreeDays: acc.additionalFreeDays + additionalFreeDays
    };
  }, { vacationDays: 0, additionalFreeDays: 0 });

  const totalFreeDays = stats.vacationDays + stats.additionalFreeDays;

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r ${
      personId === 1 
        ? 'from-emerald-200 to-emerald-100'
        : 'from-cyan-200 to-cyan-100'
    } border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-lg`}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Freie Tage insgesamt:</span>
        <div className={`px-2 py-1 rounded-full ${
          personId === 1 
            ? 'bg-emerald-500 text-white'
            : 'bg-cyan-500 text-white'
        } font-medium text-sm`}>
          {totalFreeDays}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Urlaubstage:</span>
        <div className={`px-2 py-1 rounded-full ${
          personId === 1 
            ? 'bg-emerald-500 text-white'
            : 'bg-cyan-500 text-white'
        } font-medium text-sm`}>
          {stats.vacationDays}
        </div>
      </div>
    </div>
  );
};
