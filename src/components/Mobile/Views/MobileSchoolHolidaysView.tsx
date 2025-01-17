import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Holiday } from '../../../types/holiday';

interface MobileSchoolHolidaysViewProps {
  holidays?: Holiday[];
  personId: 1 | 2;
  onHolidaySelect: (date: Date) => void;
}

export const MobileSchoolHolidaysView: React.FC<MobileSchoolHolidaysViewProps> = ({
  holidays = [],
  personId,
  onHolidaySelect
}) => {
  const getHolidayDate = (holiday: Holiday): { start: Date; end: Date } => {
    if ('start' in holiday && holiday.start && 'end' in holiday && holiday.end) {
      const [startYear, startMonth, startDay] = holiday.start.split('-').map(Number);
      const [endYear, endMonth, endDay] = holiday.end.split('-').map(Number);
      return {
        start: new Date(startYear, startMonth - 1, startDay, 12, 0, 0, 0),
        end: new Date(endYear, endMonth - 1, endDay, 12, 0, 0, 0)
      };
    }
    throw new Error('Invalid holiday dates');
  };

  const formatHolidayName = (name: string): string => {
    return name
      .split(' ')
      .map((word, index) => {
        if (index === 0 || word.includes('-')) {
          return word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-');
        }
        return word;
      })
      .join(' ');
  };

  const sortedHolidays = [...(holidays || [])]
    .filter(h => h.type === 'school')
    .sort((a, b) => {
      const aDate = getHolidayDate(a);
      const bDate = getHolidayDate(b);
      return aDate.start.getTime() - bDate.start.getTime();
    });

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Schulferien</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedHolidays.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Keine Schulferien gefunden
            </div>
          ) : (
            sortedHolidays.map(holiday => {
              const dates = getHolidayDate(holiday);
              return (
                <button
                  key={dates.start.toString()}
                  onClick={() => onHolidaySelect(dates.start)}
                  className="w-full px-4 py-2 flex flex-col gap-1 hover:bg-gray-50 active:bg-gray-100 text-left"
                >
                  <span className="text-sm text-gray-900 font-medium">
                    {formatHolidayName(holiday.name)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {format(dates.start, 'dd.MM.yyyy', { locale: de })} - {format(dates.end, 'dd.MM.yyyy', { locale: de })}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}; 