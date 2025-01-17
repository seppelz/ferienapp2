import React from 'react';
import { format, isWeekend, isSameDay, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import { Holiday, MultiDayHoliday } from '../../types/holiday';
import { VacationPlan } from '../../types/holiday';
import { useTheme } from '../../hooks/useTheme';

interface MonthCalendarProps {
  month: Date;
  state: string;
  secondState: string | null;
  holidays: Holiday[];
  secondStateHolidays: Holiday[];
  bridgeDays: Date[];
  secondStateBridgeDays: Date[];
  vacationPlans: VacationPlan[];
  secondStateVacationPlans: VacationPlan[];
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  month,
  holidays,
  secondStateHolidays,
  bridgeDays,
  secondStateBridgeDays,
  vacationPlans,
  secondStateVacationPlans
}) => {
  const theme = useTheme();

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

  const isInVacation = (date: Date, plans: VacationPlan[]) => {
    return plans.some(plan => 
      plan.isVisible && 
      isWithinInterval(date, { start: new Date(plan.start), end: new Date(plan.end) })
    );
  };

  const getHolidayInterval = (schoolHoliday: Holiday): Interval => {
    if ('date' in schoolHoliday && schoolHoliday.date) {
      const date = new Date(schoolHoliday.date);
      return {
        start: date,
        end: date
      };
    } else if ('start' in schoolHoliday && 'end' in schoolHoliday && schoolHoliday.start && schoolHoliday.end) {
      return {
        start: new Date(schoolHoliday.start),
        end: new Date(schoolHoliday.end)
      };
    }
    throw new Error('Invalid holiday dates');
  };

  const isInSchoolHolidays = (date: Date, holidayList: Holiday[]) => {
    return holidayList.some(holiday => {
      if (holiday.type === 'school') {
        try {
          const interval = getHolidayInterval(holiday);
          return isWithinInterval(date, interval);
        } catch (e) {
          return false;
        }
      }
      return false;
    });
  };

  const getDayClasses = (date: Date) => {
    const baseClasses = `w-6 h-6 flex items-center justify-center text-xs select-none ${theme.calendar.day.base}`;
    const classes = [baseClasses];
    const isWeekendDay = isWeekend(date);
    const isFirstStateHoliday = holidays.find(h => 
      h.date ? isSameDay(new Date(h.date), date) : false
    );
    const isSecondStateHoliday = secondStateHolidays.find(h => 
      h.date ? isSameDay(new Date(h.date), date) : false
    );
    const isFirstStateBridgeDay = bridgeDays.some(d => isSameDay(date, d));
    const isSecondStateBridgeDay = secondStateBridgeDays.some(d => isSameDay(date, d));
    const isFirstStateSchoolHoliday = isInSchoolHolidays(date, holidays);
    const isSecondStateSchoolHoliday = isInSchoolHolidays(date, secondStateHolidays);
    const isFirstStateVacation = isInVacation(date, vacationPlans);
    const isSecondStateVacation = isInVacation(date, secondStateVacationPlans);

    // Weekday text color
    classes.push(isWeekendDay ? 'text-neutral-500' : 'text-neutral-900');

    // Holiday colors
    if (isFirstStateHoliday && isSecondStateHoliday) {
      classes.push('bg-red-100 text-red-700');
    } else if (isFirstStateHoliday) {
      classes.push('bg-red-100 text-red-700');
    } else if (isSecondStateHoliday) {
      classes.push('bg-red-100 text-red-700');
    }

    // Bridge day colors
    if (isFirstStateBridgeDay && isSecondStateBridgeDay) {
      classes.push('bg-orange-100 text-orange-700');
    } else if (isFirstStateBridgeDay) {
      classes.push('bg-orange-100 text-orange-700');
    } else if (isSecondStateBridgeDay) {
      classes.push('bg-orange-100 text-orange-700');
    }

    // School holiday colors
    if (isFirstStateSchoolHoliday && isSecondStateSchoolHoliday) {
      classes.push('bg-purple-100 text-purple-700');
    } else if (isFirstStateSchoolHoliday) {
      classes.push('bg-purple-100 text-purple-700');
    } else if (isSecondStateSchoolHoliday) {
      classes.push('bg-purple-100 text-purple-700');
    }

    // Vacation colors
    if (isFirstStateVacation && isSecondStateVacation) {
      classes.push('bg-gradient-to-r from-emerald-500 to-cyan-500 text-white');
    } else if (isFirstStateVacation) {
      classes.push('bg-emerald-100 text-emerald-700');
    } else if (isSecondStateVacation) {
      classes.push('bg-cyan-100 text-cyan-700');
    }

    return classes.join(' ');
  };

  const getDayInfo = (date: Date): { title: string; details: string[] } => {
    const info: { title: string; details: string[] } = { title: '', details: [] };
    
    // Check holidays
    const firstStateHoliday = holidays.find(h => 
      h.date ? isSameDay(new Date(h.date), date) : false
    );
    const secondStateHoliday = secondStateHolidays.find(h => 
      h.date ? isSameDay(new Date(h.date), date) : false
    );
    
    if (firstStateHoliday) {
      info.details.push(firstStateHoliday.name);
    }
    if (secondStateHoliday && secondStateHoliday.name !== firstStateHoliday?.name) {
      info.details.push(secondStateHoliday.name);
    }

    if (bridgeDays.some(d => isSameDay(date, d))) {
      info.details.push('Brückentag Person 1');
    }
    if (secondStateBridgeDays.some(d => isSameDay(date, d))) {
      info.details.push('Brückentag Person 2');
    }

    if (isInSchoolHolidays(date, holidays)) {
      info.details.push('Schulferien Person 1');
    }
    if (isInSchoolHolidays(date, secondStateHolidays)) {
      info.details.push('Schulferien Person 2');
    }

    if (isInVacation(date, vacationPlans)) {
      info.details.push('Urlaub Person 1');
    }
    if (isInVacation(date, secondStateVacationPlans)) {
      info.details.push('Urlaub Person 2');
    }

    info.title = info.details.join(' | ');
    return info;
  };

  const days = getDaysInMonth(month);
  const firstDayOffset = days[0].getDay() || 7;

  return (
    <div className={`${theme.calendar.container} overflow-hidden select-none`}>
      <h3 className={`text-xs font-medium ${theme.text.body} py-1 text-center border-b ${theme.effects.glass.light}`}>
        {format(month, 'MMMM', { locale: de })} {month.getMonth() === 0 && '2025'}
      </h3>
      <div className="p-1">
        <div className="grid grid-cols-7 gap-px">
          {/* Weekday headers */}
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div key={day} className={`text-[10px] font-medium ${theme.text.body} h-6 flex items-center justify-center w-6 mx-auto`}>
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOffset - 1 }).map((_, i) => (
            <div key={`empty-${i}`} className="h-6 w-6 mx-auto" />
          ))}

          {/* Calendar days */}
          {days.map((date) => {
            const dayInfo = getDayInfo(date);
            return (
              <div
                key={date.getTime()}
                className={getDayClasses(date)}
                title={dayInfo.title}
              >
                {format(date, 'd')}
                {dayInfo.title && (
                  <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 ${theme.effects.glass.dark} ${theme.text.small} ${theme.effects.rounded.md} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10`}>
                    {dayInfo.details.map((detail, index) => (
                      <div key={index}>{detail}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthCalendar; 