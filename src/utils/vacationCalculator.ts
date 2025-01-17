import { VacationPlan } from '../types/vacationPlan';
import { differenceInBusinessDays } from 'date-fns';

export const calculateVacationDays = (vacations: VacationPlan[]): { usedDays: number; gainedDays: number } => {
  const result = vacations.reduce((total, vacation) => {
    if (!vacation.isVisible) return total;
    
    const businessDays = differenceInBusinessDays(vacation.end, vacation.start) + 1;
    const totalDays = Math.ceil((vacation.end.getTime() - vacation.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      usedDays: total.usedDays + businessDays,
      gainedDays: total.gainedDays + totalDays
    };
  }, { usedDays: 0, gainedDays: 0 });

  return result;
}; 