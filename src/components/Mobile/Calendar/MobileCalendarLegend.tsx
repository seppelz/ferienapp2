import React from 'react';
import { format, isWithinInterval, isSameMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { Holiday } from '../../../types/holiday';
import { VacationPlan } from '../../../types/vacationPlan';

interface LegendItem {
  color: string;
  label: string;
}

interface MobileCalendarLegendProps {
  currentMonth: Date;
  holidays?: Holiday[];
  schoolHolidays?: Holiday[];
  vacationPlans?: VacationPlan[];
}

export const MobileCalendarLegend: React.FC<MobileCalendarLegendProps> = ({
  currentMonth,
  holidays = [],
  schoolHolidays = [],
  vacationPlans = []
}) => {
  const legendItems: LegendItem[] = [
    { color: 'bg-red-100', label: 'Feiertag' },
    { color: 'bg-purple-100', label: 'Schulferien' },
    { color: 'bg-orange-100', label: 'Brückentag' },
    { color: 'bg-emerald-200', label: 'Mein Urlaub' },
    { color: 'bg-blue-200', label: 'Person 2 Urlaub' },
  ];

  // Filter holidays for current month
  const currentMonthHolidays = holidays.filter(holiday => {
    if ('date' in holiday && holiday.date) {
      return isSameMonth(new Date(holiday.date), currentMonth);
    }
    if ('start' in holiday && holiday.start && holiday.end) {
      const start = new Date(holiday.start);
      const end = new Date(holiday.end);
      return isSameMonth(start, currentMonth) || isSameMonth(end, currentMonth);
    }
    return false;
  });

  // Filter school holidays for current month
  const currentMonthSchoolHolidays = schoolHolidays.filter(holiday => {
    if ('start' in holiday && holiday.start && holiday.end) {
      const start = new Date(holiday.start);
      const end = new Date(holiday.end);
      return isSameMonth(start, currentMonth) || isSameMonth(end, currentMonth);
    }
    return false;
  });

  // Filter vacation plans for current month
  const currentMonthVacations = vacationPlans.filter(vacation => {
    return isSameMonth(vacation.start, currentMonth) || isSameMonth(vacation.end, currentMonth);
  });

  const formatDateRange = (start: Date, end: Date) => {
    const isSameMonthDates = isSameMonth(start, end);
    if (isSameMonthDates) {
      return `${format(start, 'd.', { locale: de })} - ${format(end, 'd. MMM', { locale: de })}`;
    }
    return `${format(start, 'd. MMM', { locale: de })} - ${format(end, 'd. MMM', { locale: de })}`;
  };

  const getDayCount = (start: Date, end: Date) => {
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} ${days === 1 ? 'Tag' : 'Tage'}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Legend - More compact */}
      <div className="px-2 py-1.5 border-b flex flex-wrap gap-x-3 gap-y-1 justify-center text-xs">
        {legendItems.map(({ color, label }) => (
          <div 
            key={label} 
            className="flex items-center gap-1.5"
          >
            <div 
              className={`w-3 h-3 rounded-sm ${color} border border-gray-200`} 
              aria-hidden="true"
            />
            <span className="font-medium text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      {/* Monthly Summary - Compact lists */}
      <div className="px-3 py-2 space-y-2 text-xs">
        {currentMonthHolidays.length > 0 && (
          <div>
            <h3 className="font-medium text-red-800">Feiertage</h3>
            <ul className="mt-0.5">
              {currentMonthHolidays.map(holiday => (
                <li key={holiday.name} className="text-gray-600 flex justify-between">
                  <span>{holiday.name}</span>
                  <span className="text-gray-500 ml-2">
                    {format(
                      new Date('date' in holiday && holiday.date ? holiday.date : 
                              'start' in holiday && holiday.start ? holiday.start : new Date()),
                      'd. MMM',
                      { locale: de }
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentMonthSchoolHolidays.length > 0 && (
          <div>
            <h3 className="font-medium text-purple-800">Schulferien</h3>
            <ul className="mt-0.5">
              {currentMonthSchoolHolidays.map(holiday => (
                <li key={holiday.name} className="text-gray-600 flex justify-between">
                  <span>{holiday.name}</span>
                  <span className="text-gray-500 ml-2">
                    {'start' in holiday && holiday.start && holiday.end && (
                      <>
                        {formatDateRange(new Date(holiday.start), new Date(holiday.end))}
                        <span className="ml-1">
                          ({getDayCount(new Date(holiday.start), new Date(holiday.end))})
                        </span>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentMonthVacations.length > 0 && (
          <div>
            <h3 className="font-medium text-emerald-800">Geplante Urlaube</h3>
            <ul className="mt-0.5">
              {currentMonthVacations.map((vacation, index) => (
                <li key={index} className="text-gray-600 flex justify-between">
                  <span>{vacation.personId === 1 ? 'Mein Urlaub' : 'Person 2 Urlaub'}</span>
                  <span className="text-gray-500 ml-2">
                    {formatDateRange(vacation.start, vacation.end)}
                    <span className="ml-1">({getDayCount(vacation.start, vacation.end)})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}; 