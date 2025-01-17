import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Holiday } from '../../../types/holiday';
import { theme } from '../../../theme';

interface MobileHolidaysViewProps {
  holidays: Holiday[];
  personId: 1 | 2;
  onHolidaySelect: (date: Date) => void;
}

export const MobileHolidaysView: React.FC<MobileHolidaysViewProps> = ({
  holidays,
  personId,
  onHolidaySelect
}) => {
  const getHolidayDate = (holiday: Holiday): Date => {
    if ('date' in holiday && holiday.date) {
      return new Date(holiday.date);
    } else if ('start' in holiday && holiday.start) {
      return new Date(holiday.start);
    }
    throw new Error('Invalid holiday date');
  };

  const sortedHolidays = [...holidays].sort((a, b) => {
    const aDate = getHolidayDate(a);
    const bDate = getHolidayDate(b);
    return aDate.getTime() - bDate.getTime();
  });

  return (
    <div className="flex flex-col gap-2">
      {sortedHolidays.map(holiday => (
        <button
          key={getHolidayDate(holiday).toString()}
          onClick={() => onHolidaySelect(getHolidayDate(holiday))}
          className={`${theme.button.base} ${theme.button.secondary} w-full text-left`}
        >
          <div className="flex flex-col">
            <span className="font-medium">{holiday.name}</span>
            <span className="text-sm text-gray-500">
              {format(getHolidayDate(holiday), 'dd.MM.yyyy', { locale: de })}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}; 