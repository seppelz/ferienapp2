import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Holiday } from '../../../types/holiday';

interface MobileHolidaysViewProps {
  holidays?: Holiday[];
  personId: 1 | 2;
  onHolidaySelect: (date: Date) => void;
}

export const MobileHolidaysView: React.FC<MobileHolidaysViewProps> = ({
  holidays = [],
  personId,
  onHolidaySelect
}) => {
  const getHolidayDate = (holiday: Holiday): Date => {
    if ('date' in holiday && holiday.date) {
      const [year, month, day] = holiday.date.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    } else if ('start' in holiday && holiday.start) {
      const [year, month, day] = holiday.start.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }
    throw new Error('Invalid holiday date');
  };

  const sortedHolidays = [...(holidays || [])]
    .filter(h => h.type === 'public')
    .sort((a, b) => {
      const aDate = getHolidayDate(a);
      const bDate = getHolidayDate(b);
      return aDate.getTime() - bDate.getTime();
    });

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Feiertage</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedHolidays.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Keine Feiertage gefunden
            </div>
          ) : (
            sortedHolidays.map(holiday => (
              <button
                key={getHolidayDate(holiday).toString()}
                onClick={() => onHolidaySelect(getHolidayDate(holiday))}
                className="w-full px-4 py-2 flex justify-between items-center hover:bg-gray-50 active:bg-gray-100 text-left"
              >
                <span className="text-sm text-gray-900">
                  {format(getHolidayDate(holiday), 'dd.MM.yyyy', { locale: de })}
                </span>
                <span className="text-sm text-gray-600 font-medium">
                  {holiday.name}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}; 