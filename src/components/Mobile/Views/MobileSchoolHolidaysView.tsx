import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Holiday } from '../../../types/holiday';

interface MobileSchoolHolidaysViewProps {
  schoolHolidays: Holiday[];
  personId: 1 | 2;
  onHolidaySelect?: (date: Date) => void;
}

export const MobileSchoolHolidaysView: React.FC<MobileSchoolHolidaysViewProps> = ({
  schoolHolidays,
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

  const getHolidayEndDate = (holiday: Holiday): Date => {
    if ('date' in holiday && holiday.date) {
      return new Date(holiday.date);
    } else if ('end' in holiday && holiday.end) {
      return new Date(holiday.end);
    }
    return getHolidayDate(holiday);
  };

  const sortedHolidays = [...schoolHolidays].sort((a, b) => {
    const aDate = getHolidayDate(a);
    const bDate = getHolidayDate(b);
    return aDate.getTime() - bDate.getTime();
  });

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Schulferien</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedHolidays.map(holiday => (
            <button
              key={`${getHolidayDate(holiday).toString()}-${getHolidayEndDate(holiday).toString()}`}
              onClick={() => onHolidaySelect?.(getHolidayDate(holiday))}
              className="w-full px-4 py-2 flex justify-between items-center hover:bg-gray-50 active:bg-gray-100 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900">
                  {format(getHolidayDate(holiday), 'dd.MM.')} - {format(getHolidayEndDate(holiday), 'dd.MM.yyyy', { locale: de })}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {holiday.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 