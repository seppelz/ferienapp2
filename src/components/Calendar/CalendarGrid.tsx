import React from 'react';
import { format, isWeekend, isSameDay, isWithinInterval, isBefore, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Holiday, BridgeDay, SingleDayHoliday, MultiDayHoliday } from '../../types/holiday';
import { parseDateString } from '../../utils/dateUtils';
import { useTheme } from '../../hooks/useTheme';

interface DateRange {
  start: Date;
  end: Date;
}

interface CalendarGridProps {
  month: Date;
  startDate: Date | null;
  endDate: Date | null;
  onDateSelect: (date: Date) => void;
  holidays: Holiday[];
  bridgeDays: Date[];
  disabledDates?: DateRange[];
  tabIndex?: number;
}

// Helper function to safely get date from a Holiday
const getHolidayDate = (holiday: Holiday): Date => {
  if ('date' in holiday && holiday.date) {
    return new Date(holiday.date);
  } else if ('start' in holiday && holiday.start) {
    return new Date(holiday.start);
  }
  throw new Error('Invalid holiday date');
};

// Helper function to check if a holiday is on a specific date
const isHolidayOnDate = (holiday: Holiday, date: Date): boolean => {
  try {
    if ('date' in holiday && holiday.date) {
      return isSameDay(new Date(holiday.date), date);
    } else if ('start' in holiday && holiday.start && holiday.end) {
      const start = new Date(holiday.start);
      const end = new Date(holiday.end);
      return isWithinInterval(date, { start, end });
    }
    return false;
  } catch {
    return false;
  }
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  month,
  startDate,
  endDate,
  onDateSelect,
  holidays,
  bridgeDays,
  disabledDates = [],
  tabIndex = 0
}) => {
  const theme = useTheme();
  const today = startOfDay(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const days = [];
    while (firstDay.getMonth() === month) {
      days.push(new Date(firstDay));
      firstDay.setDate(firstDay.getDate() + 1);
    }
    return days;
  };

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, today)) return true;
    
    return disabledDates.some(range => 
      isWithinInterval(date, { start: range.start, end: range.end })
    );
  };

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return isWithinInterval(date, { 
      start: startDate < endDate ? startDate : endDate,
      end: startDate < endDate ? endDate : startDate
    });
  };

  const getHolidayType = (date: Date, holidays: Holiday[], bridgeDays: Date[]): { 
    holiday: Holiday | null;
    type: Holiday['type'] | 'bridge' | null;
  } => {
    const isBridgeDay = bridgeDays.some(bd => isSameDay(bd, date));
    if (isBridgeDay) {
      return { holiday: null, type: 'bridge' };
    }

    const holiday = holidays.find(h => isHolidayOnDate(h, date));
    return holiday ? { holiday, type: holiday.type } : { holiday: null, type: null };
  };

  const getDayClasses = (date: Date) => {
    const baseClasses = `w-8 h-8 flex items-center justify-center ${theme.calendar.day.base} text-sm relative`;
    const classes = [baseClasses];

    const isDisabled = isDateDisabled(date);
    const isStart = startDate && isSameDay(date, startDate);
    const isEnd = endDate && isSameDay(date, endDate);
    const isInRange = isDateInRange(date);
    const { holiday, type } = getHolidayType(date, holidays, bridgeDays);
    const isWeekendDay = isWeekend(date);
    const isBooked = disabledDates.some(range => 
      isWithinInterval(date, { start: range.start, end: range.end })
    );

    if (isDisabled) {
      classes.push('text-neutral-300 cursor-not-allowed');
      if (isBooked) {
        classes.push('bg-neutral-100');
      }
    } else {
      classes.push('cursor-pointer hover:bg-neutral-100');
      if (isStart || isEnd) {
        classes.push('bg-emerald-500 text-white hover:bg-emerald-600');
      } else if (isInRange) {
        classes.push('bg-emerald-100 text-emerald-700');
      } else if (holiday) {
        if (type === 'bridge') {
          classes.push('bg-orange-100 text-orange-700');
        } else if (type === 'public') {
          classes.push('bg-red-100 text-red-700');
        } else if (type === 'school') {
          classes.push('bg-purple-100 text-purple-700');
        }
      } else if (isWeekendDay) {
        classes.push('text-neutral-500');
      }
    }

    return classes.join(' ');
  };

  const days = getDaysInMonth(month);
  const firstDayOffset = days[0].getDay() || 7;

  return (
    <div className={theme.calendar.container}>
      <div className={`${theme.text.heading} mb-2 text-center text-sm`}>
        {format(month, 'MMMM yyyy', { locale: de })}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
          <div key={day} className={`text-xs font-medium ${theme.text.body} h-8 flex items-center justify-center`}>
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOffset - 1 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Calendar days */}
        {days.map((date) => (
          <div
            key={date.getTime()}
            className={getDayClasses(date)}
            onClick={() => !isDateDisabled(date) && onDateSelect(date)}
            role="button"
            tabIndex={isDateDisabled(date) ? -1 : tabIndex}
            aria-label={format(date, 'd. MMMM yyyy', { locale: de })}
            aria-disabled={isDateDisabled(date)}
          >
            {format(date, 'd')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid; 