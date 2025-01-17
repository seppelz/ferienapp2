import React from 'react';
import { Holiday } from '../../types/holiday';
import { differenceInBusinessDays } from 'date-fns';
import { usePersonContext } from '../../contexts/PersonContext';

interface VacationCounterProps {
  holidays: Holiday[];
  personId: 1 | 2;
}

export const VacationCounter: React.FC<VacationCounterProps> = ({ holidays, personId }) => {
  const { persons } = usePersonContext();
  const person = personId === 1 ? persons.person1 : persons.person2;

  if (!person) return null;

  const totalVacationDays = person.vacationPlans.reduce((total, plan) => {
    const days = Math.ceil((plan.end.getTime() - plan.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return total + days;
  }, 0);

  const bridgeDays = holidays.reduce((total, holiday) => {
    if (holiday.type === 'bridge') {
      if ('date' in holiday && holiday.date) {
        const startDate = new Date(holiday.date);
        const endDate = new Date(holiday.date);
        return total + 1;
      } else if ('start' in holiday && 'end' in holiday && holiday.start && holiday.end) {
        return total + differenceInBusinessDays(new Date(holiday.end), new Date(holiday.start)) + 1;
      }
    }
    return total;
  }, 0);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Urlaubstage:</span>
        <span className="font-medium text-gray-900">{totalVacationDays}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Brückentage:</span>
        <span className="font-medium text-gray-900">{bridgeDays}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Gesamt:</span>
        <span className="font-medium text-gray-900">{totalVacationDays + bridgeDays}</span>
      </div>
    </div>
  );
};

const calculateVacationDays = (holidays: Holiday[]): number => {
  return holidays.reduce((total, holiday) => {
    if ('date' in holiday && holiday.date) {
      return total + 1;
    } else if ('start' in holiday && 'end' in holiday && holiday.start && holiday.end) {
      return total + differenceInBusinessDays(new Date(holiday.end), new Date(holiday.start)) + 1;
    }
    return total;
  }, 0);
}; 