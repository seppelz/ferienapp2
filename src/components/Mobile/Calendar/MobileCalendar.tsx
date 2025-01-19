import React, { useMemo, useCallback, useEffect } from 'react';
import { format, isWeekend, isSameDay, isWithinInterval, isBefore, startOfDay, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { BaseCalendarProps, useCalendar } from '../../Shared/Calendar/BaseCalendar';
import { holidayColors } from '../../../constants/colors';
import { Holiday, BridgeDay, SingleDayHoliday, MultiDayHoliday } from '../../../types/holiday';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { VacationPlan } from '../../../types/vacationPlan';

interface HolidayType {
  type: Holiday["type"] | "bridge" | "vacation" | null;
  holiday?: Holiday;
}

interface HolidayTypes {
  firstState: HolidayType;
  secondState: HolidayType;
}

interface MobileCalendarProps extends Omit<BaseCalendarProps, 'getDateVacationInfo'> {
  personId: 1 | 2;
  onMonthChange?: (direction: number) => void;
  vacationPlans?: VacationPlan[];
  bridgeDays: BridgeDay[];
  month: Date;
  getDateVacationInfo: (date: Date) => {
    person1Vacation: boolean;
    person2Vacation: boolean;
    isSharedVacation: boolean;
  };
  initialDate?: Date | null;
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

export const MobileCalendar: React.FC<MobileCalendarProps> = (props) => {
  const {
    state,
    handleDateHover,
    handleDateSelect,
    handleMouseLeave
  } = useCalendar(props);

  const today = useMemo(() => startOfDay(new Date()), []);

  // Animation for swipe gestures
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  // Reset animation when month changes
  useEffect(() => {
    api.start({ x: 0, immediate: true });
  }, [props.month]);

  // Handle month change
  const handleMonthChange = (direction: number) => {
    props.onMonthChange?.(direction);
  };

  // Bind swipe gesture
  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], tap, event }) => {
      if (tap && props.isSelectingVacation) {
        // Only handle date selection on tap, not swipe
        const target = event.target as HTMLElement;
        const dateButton = target.closest('button');
        if (dateButton) {
          const date = new Date(dateButton.parentElement?.dataset.date || '');
          if (!isDateDisabled(date)) {
            handleDateSelect(date);
          }
        }
        return;
      }

      if (!active) {
        if (Math.abs(mx) > 50) {
          handleMonthChange(xDir > 0 ? -1 : 1);
        }
        api.start({ x: 0 });
      } else {
        api.start({ x: mx, immediate: true });
      }
    },
    {
      axis: 'x',
      swipe: {
        distance: 50
      },
      preventScroll: true,
      eventOptions: { passive: false },
      bounds: undefined,
      rubberband: true,
      from: () => [x.get(), 0],
      filterTaps: true,
      touchAction: 'none'
    }
  );

  // Memoize expensive date operations
  const isDateDisabled = useCallback((date: Date) => {
    if (isBefore(date, today)) return true;
    
    return props.disabledDates?.some(range => 
      isWithinInterval(date, { start: range.start, end: range.end })
    );
  }, [today, props.disabledDates]);

  const isDateInRange = useCallback((date: Date) => {
    if (!props.startDate || !props.endDate) return false;
    return isWithinInterval(date, { 
      start: props.startDate < props.endDate ? props.startDate : props.endDate,
      end: props.startDate < props.endDate ? props.endDate : props.startDate
    });
  }, [props.startDate, props.endDate]);

  const isDateInVacation = useCallback((date: Date) => {
    return props.vacationPlans?.some(vacation => 
      vacation.isVisible && isWithinInterval(date, { start: vacation.start, end: vacation.end })
    );
  }, [props.vacationPlans]);

  const getHolidayType = (date: Date): HolidayType => {
    const holiday = props.holidays.find(h => isHolidayOnDate(h, date));
    const bridgeDay = props.bridgeDays.find(bd => isHolidayOnDate(bd, date));
    const vacationInfo = props.getDateVacationInfo(date);

    if (vacationInfo.person1Vacation || vacationInfo.person2Vacation || vacationInfo.isSharedVacation) {
      return { type: 'vacation' };
    }

    if (bridgeDay) {
      return { type: 'bridge' };
    }

    if (holiday) {
      return { type: holiday.type, holiday };
    }

    return { type: null };
  };

  // Generate calendar grid
  const weeks = useMemo<Date[][]>(() => {
    const firstDay = new Date(props.month.getFullYear(), props.month.getMonth(), 1);
    const lastDay = new Date(props.month.getFullYear(), props.month.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (startDate.getDay() + 6) % 7);
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (7 - endDate.getDay()) % 7);
    
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(new Date(d));
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [props.month]);

  // Memoize date classes generation
  const getDateClasses = useCallback((date: Date) => {
    const isDisabled = isDateDisabled(date);
    const isSelected = isDateInRange(date);
    const { type } = getHolidayType(date);
    const isWeekendDay = isWeekend(date);
    const isToday = isSameDay(date, today);
    const isCurrentMonth = date.getMonth() === props.month.getMonth();
    const vacationInfo = props.getDateVacationInfo(date);

    const baseClasses = "flex flex-col items-center justify-center w-12 h-11 text-sm transition-all duration-200 ease-in-out touch-manipulation relative";
    const cursorClasses = props.isSelectingVacation && !isDisabled 
      ? "cursor-pointer hover:scale-105 active:scale-95 hover:shadow-lg active:shadow-sm" 
      : "cursor-default";
    const textColorClass = !isCurrentMonth ? "text-gray-500" : isDisabled ? "text-gray-400" : "text-gray-900";
    const focusClasses = "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:z-10";
    const todayClasses = isToday ? "ring-2 ring-blue-500 ring-offset-2 font-bold" : "";
    
    if (isDisabled) {
      return `${baseClasses} ${textColorClass} ${cursorClasses} opacity-50 ${focusClasses}`;
    }

    if (isSelected) {
      const personColor = props.personId === 1 ? 'emerald' : 'blue';
      return `${baseClasses} bg-${personColor}-200 text-${personColor}-800 font-semibold shadow-md hover:shadow-lg 
        ${cursorClasses} ${focusClasses} ${todayClasses}`;
    }

    // Build background classes based on all active states
    let bgClasses = '';
    let textColor = 'text-gray-900';

    const states = [];
    if (type === 'public') states.push('red');
    if (type === 'school') states.push('purple');
    if (type === 'bridge') states.push('orange');
    
    // Add vacation states with correct colors
    if (vacationInfo.person1Vacation) states.push('emerald');
    if (vacationInfo.person2Vacation) states.push('blue');

    if (states.length > 1) {
      // Multiple states - create gradient
      bgClasses = `bg-gradient-to-r from-${states[0]}-100 to-${states[1]}-200`;
      // Use more vibrant color for vacation states
      if (states[0] === 'emerald' || states[0] === 'blue') {
        textColor = `text-${states[0]}-800`;
      } else {
        textColor = `text-${states[0]}-700`;
      }
    } else if (states.length === 1) {
      // Single state - use more vibrant color for vacation states
      const intensity = states[0] === 'emerald' || states[0] === 'blue' ? '200' : '100';
      bgClasses = `bg-${states[0]}-${intensity}`;
      textColor = states[0] === 'emerald' || states[0] === 'blue' 
        ? `text-${states[0]}-800`
        : `text-${states[0]}-700`;
    }

    return `${baseClasses} ${bgClasses} ${textColor} font-semibold shadow-md hover:shadow-lg 
      ${cursorClasses} ${focusClasses} ${todayClasses}`;

  }, [isDateDisabled, isDateInRange, getHolidayType, props.isSelectingVacation, props.getDateVacationInfo, props.month, props.personId, today]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const isDisabled = isDateDisabled(date);
    if (isDisabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleDateSelect(date);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        const prevDay = addDays(date, -1);
        const prevDayElement = document.querySelector(`[data-date="${format(prevDay, 'yyyy-MM-dd')}"]`) as HTMLElement;
        prevDayElement?.focus();
        break;
      case 'ArrowRight':
        e.preventDefault();
        const nextDay = addDays(date, 1);
        const nextDayElement = document.querySelector(`[data-date="${format(nextDay, 'yyyy-MM-dd')}"]`) as HTMLElement;
        nextDayElement?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevWeek = addDays(date, -7);
        const prevWeekElement = document.querySelector(`[data-date="${format(prevWeek, 'yyyy-MM-dd')}"]`) as HTMLElement;
        prevWeekElement?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextWeek = addDays(date, 7);
        const nextWeekElement = document.querySelector(`[data-date="${format(nextWeek, 'yyyy-MM-dd')}"]`) as HTMLElement;
        nextWeekElement?.focus();
        break;
      case 'Tab':
        // Let the default tab behavior work naturally
        // The tab order will flow to the next focusable element (navigation buttons)
        break;
    }
  };

  // Memoize expensive date operations
  const getBridgeDayInfo = (date: Date) => {
    const bridgeDay = props.bridgeDays?.find(bd => isHolidayOnDate(bd, date));
    return bridgeDay;
  };

  return (
    <div className="relative w-full">
      <div className="select-none bg-white rounded-xl shadow-lg p-4">
        {/* Month Navigation - Enhanced styling */}
        <div 
          className="flex items-center justify-between mb-4 px-2"
          role="toolbar"
          aria-label="Monatsnavigation"
        >
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full touch-manipulation
              transition-all duration-200 ease-in-out hover:scale-110 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Vorheriger Monat"
            type="button"
            tabIndex={0}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div 
            className="text-lg font-semibold text-gray-900 tracking-tight"
            role="heading"
            aria-level={2}
          >
            {format(props.month, 'MMMM yyyy', { locale: de })}
          </div>

          <button
            onClick={() => handleMonthChange(1)}
            className="p-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full touch-manipulation
              transition-all duration-200 ease-in-out hover:scale-110 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Nächster Monat"
            type="button"
            tabIndex={0}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <animated.div
          {...bind()}
          style={{ 
            x,
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none'
          }}
          className="w-full touch-none"
        >
          <div className="grid grid-cols-7 bg-gray-50/50 rounded-lg overflow-hidden shadow-inner">
            {/* Weekday headers - Enhanced styling */}
            <div className="contents" role="row">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
                <div
                  key={day}
                  className="bg-white/80 backdrop-blur-sm py-2 text-xs font-semibold text-gray-600 text-center border-b 
                    border-gray-100 tracking-wider uppercase"
                  role="columnheader"
                  aria-label={day === 'Mo' ? 'Montag' : 
                             day === 'Di' ? 'Dienstag' :
                             day === 'Mi' ? 'Mittwoch' :
                             day === 'Do' ? 'Donnerstag' :
                             day === 'Fr' ? 'Freitag' :
                             day === 'Sa' ? 'Samstag' : 'Sonntag'}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid - Remove touch handlers from buttons */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} role="row" className="contents">
                {week.map((date, dayIndex) => {
                  const isDisabled = isDateDisabled(date);
                  const holidayInfo = getHolidayType(date);
                  const isToday = isSameDay(date, today);
                  const vacationInfo = props.getDateVacationInfo(date);
                  const isSelected = isDateInRange(date);
                  const isCurrentMonth = date.getMonth() === props.month.getMonth();

                  const dateLabel = [
                    format(date, 'd. MMMM yyyy', { locale: de }),
                    isToday && 'Heute',
                    holidayInfo.holiday?.name,
                    vacationInfo.isSharedVacation && 'Gemeinsamer Urlaub',
                    isDisabled && 'Nicht verfügbar'
                  ].filter(Boolean).join(', ');

                  return (
                    <div
                      key={dayIndex}
                      className={`relative bg-white border-b border-r last:border-r-0 focus-within:z-10`}
                      data-date={format(date, 'yyyy-MM-dd')}
                    >
                      <button
                        className={`w-full h-11 flex flex-col items-center justify-center ${getDateClasses(date)} 
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                          ${!isCurrentMonth ? 'focus:ring-gray-400' : ''}`}
                        onKeyDown={(e) => handleKeyDown(e, date)}
                        role="gridcell"
                        aria-disabled={isDisabled}
                        aria-label={dateLabel}
                        aria-selected={isSelected}
                        tabIndex={isDisabled ? -1 : (isCurrentMonth ? 0 : -1)}
                        type="button"
                      >
                        <span className={`
                          ${isToday ? 'font-bold' : ''}
                          ${!isSameDay(date, props.month) ? 'text-gray-400' : ''}
                        `}>
                          {format(date, 'd')}
                        </span>
                        {vacationInfo.isSharedVacation && (
                          <div 
                            className="absolute top-0.5 right-0.5 text-[8px] text-yellow-600"
                            aria-hidden="true"
                          >
                            ❤️
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </animated.div>

        {/* Enhanced swipe hint */}
        <div 
          className="text-center text-xs text-gray-500 mt-3 font-medium tracking-wide animate-pulse"
          aria-hidden="true"
        >
          ← Wischen zum Monatswechsel →
        </div>
      </div>
    </div>
  );
}; 