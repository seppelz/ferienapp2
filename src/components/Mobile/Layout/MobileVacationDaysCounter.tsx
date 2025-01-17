import React from 'react';
import { VacationPlan } from '../../../types/vacationPlan';
import { Holiday } from '../../../types/holiday';
import { eachDayOfInterval, isWeekend, isSameDay } from 'date-fns';

interface MobileVacationDaysCounterProps {
  availableVacationDays: number;
  onAvailableDaysChange: (days: number) => void;
  vacationPlans: VacationPlan[];
  accentColor: string;
  holidays: Holiday[];
  otherPersonVacations: VacationPlan[];
}

export const MobileVacationDaysCounter: React.FC<MobileVacationDaysCounterProps> = ({
  availableVacationDays,
  onAvailableDaysChange,
  vacationPlans,
  accentColor,
  holidays,
  otherPersonVacations
}) => {
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

  // Calculate used vacation days
  const usedDays = vacationPlans.reduce((total, vacation) => {
    if (!vacation.isVisible) return total;
    
    const days = eachDayOfInterval({ start: vacation.start, end: vacation.end });
    const workdays = days.filter(date => {
      // Skip weekends
      if (isWeekend(date)) return false;
      
      // Skip public holidays
      const isPublicHoliday = holidays.some(h => 
        h.type === 'public' && isSameDay(getHolidayDate(h), date)
      );
      
      return !isPublicHoliday;
    }).length;
    
    return total + workdays;
  }, 0);

  const remainingDays = availableVacationDays - usedDays;

  return (
    <div className="flex items-center gap-3" role="region" aria-label="Urlaubstage Übersicht">
      <div className="flex-1">
        <div className="relative inline-flex items-center">
          <input
            type="number"
            min="0"
            max="365"
            value={availableVacationDays}
            onChange={(e) => onAvailableDaysChange(Math.max(0, parseInt(e.target.value) || 0))}
            className={`w-16 pl-3 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-shadow
              ${accentColor === 'emerald' ? 'focus:ring-emerald-500/30' : 'focus:ring-cyan-500/30'}`}
          />
          <span className="ml-2 text-sm text-gray-600">Tage</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`text-sm font-medium ${accentColor === 'emerald' ? 'text-emerald-600' : 'text-cyan-600'}`}>
          {remainingDays}
        </div>
        <div className="text-sm text-gray-500">übrig</div>
      </div>
    </div>
  );
}; 