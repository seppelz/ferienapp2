import React, { useEffect, useRef } from 'react';
import { format, isWeekend, isSameDay, isWithinInterval, isBefore, startOfDay, addMonths, addDays, addWeeks } from 'date-fns';
import { de } from 'date-fns/locale';
import { BaseCalendarProps, useCalendar } from '../../Shared/Calendar/BaseCalendar';
import { useTheme } from '../../../hooks/useTheme';
import { Holiday, BridgeDay, SingleDayHoliday, MultiDayHoliday } from '../../../types/holiday';
import { parseDateString } from '../../../utils/dateUtils';

interface HolidayType {
  type: Holiday["type"] | "bridge" | null;
  holiday: Holiday | null | undefined;
}

interface HolidayTypes {
  firstState: HolidayType;
  secondState: HolidayType;
}

export interface ExtendedBaseCalendarProps extends BaseCalendarProps {
  onVacationSelectComplete?: () => void;
  onDeleteVacation?: (personId: 1 | 2, index: number) => void;
  vacationCount?: { person1: number; person2: number };
  onStartVacationSelect?: () => void;
  recommendedDates?: {
    person1: Array<{ date: Date; reason?: string }>;
    person2: Array<{ date: Date; reason?: string }>;
  };
  activePersonId?: 1 | 2;
  onShowRecommendations?: (personId: 1 | 2) => void;
}

interface DateTooltipProps {
  date: Date;
  holidayTypes: HolidayTypes;
  vacationInfo: {
    person1Vacation: boolean;
    person2Vacation: boolean;
    isSharedVacation: boolean;
  };
  isSelectingVacation: boolean;
}

const DateTooltip: React.FC<DateTooltipProps> = ({
  date,
  holidayTypes,
  vacationInfo,
  isSelectingVacation
}) => {
  const theme = useTheme();
  const items: { icon: string; text: string; className: string }[] = [];

  // Add holiday information
  if (holidayTypes.firstState.holiday?.name) {
    const holidayName = holidayTypes.firstState.holiday.name
      .split(' ')
      .map(word => {
        // Capitalize first letter of specific words
        if (['sommerferien', 'winterferien', 'osterferien', 'herbstferien', 'pfingstferien', 'weihnachtsferien'].includes(word.toLowerCase())) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        // Capitalize state names
        if (['baden-württemberg', 'bayern', 'berlin', 'brandenburg', 'bremen', 'hamburg', 'hessen', 'mecklenburg-vorpommern', 'niedersachsen', 'nordrhein-westfalen', 'rheinland-pfalz', 'saarland', 'sachsen', 'sachsen-anhalt', 'schleswig-holstein', 'thüringen'].includes(word.toLowerCase())) {
          return word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-');
        }
        return word;
      })
      .join(' ');

    const prefix = holidayTypes.firstState.type === 'school' ? 'Schulferien:' : 'Feiertag:';
    items.push({
      icon: holidayTypes.firstState.type === 'school' ? '📚' : '🎉',
      text: `${prefix} ${holidayName}`,
      className: holidayTypes.firstState.type === 'school' ? 'text-purple-700' : 'text-red-700'
    });
  }

  // Add bridge day information
  if (holidayTypes.firstState.type === 'bridge') {
    items.push({
      icon: '🌉',
      text: 'Brückentag Person 1',
      className: 'text-orange-700'
    });
  }
  if (holidayTypes.secondState.type === 'bridge') {
    items.push({
      icon: '🌉',
      text: 'Brückentag Person 2',
      className: 'text-orange-700'
    });
  }

  // Add vacation information
  if (vacationInfo.isSharedVacation) {
    items.push({
      icon: '✈️',
      text: 'Gemeinsamer Urlaub',
      className: 'text-sky-700'
    });
  } else {
    if (vacationInfo.person1Vacation) {
      items.push({
        icon: '🏖️',
        text: 'Urlaub Person 1',
        className: 'text-sky-700'
      });
    }
    if (vacationInfo.person2Vacation) {
      items.push({
        icon: '🏖️',
        text: 'Urlaub Person 2',
        className: 'text-emerald-700'
      });
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
      <div className={`${theme.effects.glass.light} ${theme.effects.rounded.lg} ${theme.effects.shadows.lg} p-2 text-sm`}>
        {items.map((item, index) => (
          <div key={index} className={`flex items-center gap-2 ${item.className} whitespace-nowrap ${theme.effects.transitions.default}`}>
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const getHolidayColor = (type: string, theme: any, personId: 1 | 2) => {
  switch (type) {
    case 'public':
      return 'bg-red-100/80 text-red-700';
    case 'bridge':
      return 'bg-orange-100/80 text-orange-700';
    case 'school':
      return 'bg-purple-100/80 text-purple-700';
    default:
      return personId === 1 
        ? 'bg-sky-100/80 text-sky-700'
        : 'bg-emerald-100/80 text-emerald-700';
  }
};

// Helper function to safely get date from a Holiday
const getHolidayDate = (holiday: Holiday): Date => {
  try {
    let date: Date;
    if ('date' in holiday && holiday.date) {
      // Parse the date and explicitly set the time to noon in local timezone
      const [year, month, day] = holiday.date.split('-').map(Number);
      date = new Date(year, month - 1, day, 12, 0, 0, 0);
    } else if ('start' in holiday && holiday.start) {
      // Parse the start date and explicitly set the time to noon in local timezone
      const [year, month, day] = holiday.start.split('-').map(Number);
      date = new Date(year, month - 1, day, 12, 0, 0, 0);
    } else {
      throw new Error('Invalid holiday date');
    }
    return date;
  } catch (error) {
    console.error('Error parsing holiday date:', error);
    throw error;
  }
};

// Helper function to check if a holiday is on a specific date
const isHolidayOnDate = (holiday: Holiday, date: Date): boolean => {
  try {
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
    
    if ('date' in holiday && holiday.date) {
      const [year, month, day] = holiday.date.split('-').map(Number);
      const holidayDate = new Date(year, month - 1, day, 12, 0, 0, 0);
      return isSameDay(holidayDate, compareDate);
    } else if ('start' in holiday && holiday.start && holiday.end) {
      const [startYear, startMonth, startDay] = holiday.start.split('-').map(Number);
      const [endYear, endMonth, endDay] = holiday.end.split('-').map(Number);
      const start = new Date(startYear, startMonth - 1, startDay, 12, 0, 0, 0);
      const end = new Date(endYear, endMonth - 1, endDay, 12, 0, 0, 0);
      return isWithinInterval(compareDate, { start, end });
    }
    return false;
  } catch (error) {
    console.error('Error checking holiday date:', error);
    return false;
  }
};

export const DesktopCalendar: React.FC<ExtendedBaseCalendarProps> = (props) => {
  const theme = useTheme();
  const {
    state,
    handleDateSelect,
    handleDateHover,
    handleMouseLeave,
    handleDateFocus: baseHandleDateFocus
  } = useCalendar(props);

  const handleDateFocus = (date: Date | null) => {
    if (date) {
      baseHandleDateFocus(date);
    }
  };

  const calendarRef = React.useRef<HTMLDivElement>(null);
  const focusedDateRef = React.useRef<Date>(startOfDay(new Date(props.month.getFullYear(), 0, 1)));
  const announcerRef = React.useRef<HTMLDivElement>(null);
  const recommendationsRef = React.useRef<HTMLDivElement>(null);
  const [selectedRecommendationIndex, setSelectedRecommendationIndex] = React.useState(-1);
  const today = startOfDay(new Date());

  const announce = (message: string) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = message;
    }
  };

  // Set initial focus on January 1st when starting vacation selection
  useEffect(() => {
    if (props.isSelectingVacation) {
      const initialDate = startOfDay(new Date(props.month.getFullYear(), 0, 1));
      focusedDateRef.current = initialDate;
      const dateButton = calendarRef.current?.querySelector(
        `[data-date="${format(initialDate, 'yyyy-MM-dd')}"]`
      ) as HTMLButtonElement;
      if (dateButton) {
        dateButton.focus();
        handleDateFocus(initialDate);
        announce('Urlaubsauswahl gestartet. Navigieren Sie mit den Pfeiltasten und wählen Sie mit der Eingabetaste.');
      }
    }
  }, [props.isSelectingVacation, props.month]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Handle global shortcuts (q, w, n, m, numbers) regardless of focus
      if (!props.isSelectingVacation) {
        let personId: 1 | 2;
        let vacationIndex: number;

        switch (e.key) {
          case 'q':
            if (props.activePersonId === 1) {
              e.preventDefault();
              if (props.onShowRecommendations) {
                props.onShowRecommendations(1);
              }
              announce('Empfehlungen für Person 1 geöffnet.');
            }
            return;
          case 'w':
            if (props.activePersonId === 2) {
              e.preventDefault();
              if (props.onStartVacationSelect) {
                props.onStartVacationSelect();
              }
              if (props.onShowRecommendations) {
                props.onShowRecommendations(2);
              }
              announce('Empfehlungen für Person 2 geöffnet.');
            }
            return;
          case 'n':
            if (props.activePersonId === 1) {
              e.preventDefault();
              props.onStartVacationSelect?.();
              announce('Urlaubsauswahl für Person 1 gestartet');
            }
            return;
          case 'm':
            if (props.activePersonId === 2) {
              e.preventDefault();
              props.onStartVacationSelect?.();
              announce('Urlaubsauswahl für Person 2 gestartet');
            }
            return;
          case '1':
          case '2':
          case '3':
          case '4':
            e.preventDefault();
            personId = 1;
            vacationIndex = parseInt(e.key) - 1;
            if (props.onDeleteVacation) {
              if (vacationIndex === 3 && (props.vacationCount?.person1 || 0) > 4) {
                // If pressing 4 and there are more than 4 vacations, delete the last one
                props.onDeleteVacation(personId, (props.vacationCount?.person1 || 0) - 1);
                announce(`Letzter Urlaub von Person 1 gelöscht`);
              } else if (vacationIndex < (props.vacationCount?.person1 || 0)) {
                props.onDeleteVacation(personId, vacationIndex);
                announce(`Urlaub ${e.key} von Person 1 gelöscht`);
              }
            }
            break;
          case '5':
          case '6':
          case '7':
          case '8':
            e.preventDefault();
            personId = 2;
            vacationIndex = parseInt(e.key) - 5;
            if (props.onDeleteVacation) {
              if (vacationIndex === 3 && (props.vacationCount?.person2 || 0) > 4) {
                // If pressing 8 and there are more than 4 vacations, delete the last one
                props.onDeleteVacation(personId, (props.vacationCount?.person2 || 0) - 1);
                announce(`Letzter Urlaub von Person 2 gelöscht`);
              } else if (vacationIndex < (props.vacationCount?.person2 || 0)) {
                props.onDeleteVacation(personId, vacationIndex);
                announce(`Urlaub ${vacationIndex + 1} von Person 2 gelöscht`);
              }
            }
            break;
        }
      }

      // Only handle calendar navigation when focused on calendar
      if (!calendarRef.current?.contains(document.activeElement)) {
        return;
      }

      e.preventDefault();
      let newDate = focusedDateRef.current;
      let navigationAnnouncement = '';

      // Handle navigation during vacation selection
      switch (e.key) {
        case 'ArrowLeft':
          newDate = addDays(focusedDateRef.current, -1);
          navigationAnnouncement = 'Ein Tag zurück';
          break;
        case 'ArrowRight':
          newDate = addDays(focusedDateRef.current, 1);
          navigationAnnouncement = 'Ein Tag vor';
          break;
        case 'ArrowUp':
          newDate = addWeeks(focusedDateRef.current, -1);
          navigationAnnouncement = 'Eine Woche zurück';
          break;
        case 'ArrowDown':
          newDate = addWeeks(focusedDateRef.current, 1);
          navigationAnnouncement = 'Eine Woche vor';
          break;
        case 'PageUp':
          newDate = addMonths(focusedDateRef.current, -1);
          navigationAnnouncement = 'Ein Monat zurück';
          break;
        case 'PageDown':
          newDate = addMonths(focusedDateRef.current, 1);
          navigationAnnouncement = 'Ein Monat vor';
          break;
        case 'Home':
          newDate = startOfDay(new Date(props.month.getFullYear(), 0, 1));
          navigationAnnouncement = 'Zum Jahresanfang';
          break;
        case 'End':
          newDate = startOfDay(new Date(props.month.getFullYear(), 11, 31));
          navigationAnnouncement = 'Zum Jahresende';
          break;
        case 'Enter':
        case ' ':
          if (!isDateDisabled(newDate)) {
            handleDateSelect(newDate);
            handleDateFocus(newDate);
            if (props.startDate && !props.endDate && props.onAddVacation) {
              const start = props.startDate < newDate ? props.startDate : newDate;
              const end = props.startDate < newDate ? newDate : props.startDate;
              props.onAddVacation({
                start,
                end,
                isVisible: true
              });
              announce(`Urlaub für Person ${props.activePersonId} erstellt`);
            } else {
              announce(`Startdatum für Person ${props.activePersonId} ausgewählt`);
            }
          }
          break;
        case 'Escape':
          if (props.onVacationSelectComplete) {
            props.onVacationSelectComplete();
            announce('Urlaubsauswahl abgebrochen');
          }
          break;
        default:
          return;
      }

      const dateButton = calendarRef.current?.querySelector(
        `[data-date="${format(newDate, 'yyyy-MM-dd')}"]`
      ) as HTMLButtonElement;

      if (dateButton && !isDateDisabled(newDate)) {
        dateButton.focus();
        focusedDateRef.current = newDate;
        handleDateFocus(newDate);
        handleDateHover(newDate);
        if (navigationAnnouncement) {
          announce(`${navigationAnnouncement}, ${format(newDate, 'd. MMMM', { locale: de })}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [props.isSelectingVacation, props.startDate, props.endDate, props.onAddVacation, props.activePersonId, props.vacationCount, props.onStartVacationSelect, props.onShowRecommendations, handleDateSelect, handleDateFocus, handleDateHover]);

  // Focus on newly created vacation
  useEffect(() => {
    if (props.endDate && !props.isSelectingVacation) {
      const dateButton = calendarRef.current?.querySelector(
        `[data-date="${format(props.endDate, 'yyyy-MM-dd')}"]`
      ) as HTMLButtonElement;
      if (dateButton) {
        dateButton.focus();
        handleDateFocus(props.endDate);
        focusedDateRef.current = props.endDate;
      }
    }
  }, [props.endDate, props.isSelectingVacation]);

  const isDateDisabled = (date: Date) => {
    // Don't allow dates in the past
    if (isBefore(date, today)) return true;
    
    return props.disabledDates?.some(range => 
      isWithinInterval(date, { start: range.start, end: range.end })
    );
  };

  const isDateInRange = (date: Date) => {
    if (!props.startDate || !props.endDate) return false;
    return isWithinInterval(date, { 
      start: props.startDate < props.endDate ? props.startDate : props.endDate,
      end: props.startDate < props.endDate ? props.endDate : props.startDate
    });
  };

  const getHolidayType = (
    date: Date,
    holidays: Holiday[],
    bridgeDays: BridgeDay[],
    secondStateHolidays: Holiday[],
    secondStateBridgeDays: BridgeDay[]
  ): {
    firstState: { type: Holiday['type'] | 'bridge' | null; holiday: Holiday | null };
    secondState: { type: Holiday['type'] | 'bridge' | null; holiday: Holiday | null };
  } => {
    const result = {
      firstState: { type: null as Holiday['type'] | 'bridge' | null, holiday: null as Holiday | null },
      secondState: { type: null as Holiday['type'] | 'bridge' | null, holiday: null as Holiday | null }
    };

    // Check bridge days for both states
    const firstStateBridgeDay = bridgeDays.find(bd => isHolidayOnDate(bd, date));
    const secondStateBridgeDay = secondStateBridgeDays.find(bd => isHolidayOnDate(bd, date));

    if (firstStateBridgeDay) {
      result.firstState = { type: 'bridge', holiday: null };
    }
    if (secondStateBridgeDay) {
      result.secondState = { type: 'bridge', holiday: null };
    }

    // Check holidays for both states
    const firstStateHoliday = holidays.find(h => isHolidayOnDate(h, date));
    const secondStateHoliday = secondStateHolidays.find(h => isHolidayOnDate(h, date));

    if (firstStateHoliday && !result.firstState.type) {
      result.firstState = { type: firstStateHoliday.type, holiday: firstStateHoliday };
    }
    if (secondStateHoliday && !result.secondState.type) {
      result.secondState = { type: secondStateHoliday.type, holiday: secondStateHoliday };
    }

    return result;
  };

  const getDateClasses = (date: Date) => {
    const isStart = props.startDate && isSameDay(date, props.startDate);
    const isEnd = props.endDate && isSameDay(date, props.endDate);
    const isInRange = isDateInRange(date);
    const holidayTypes = getHolidayType(date, props.holidays, props.bridgeDays, props.secondStateHolidays, props.secondStateBridgeDays);
    const isWeekendDay = isWeekend(date);
    const isHovered = state.hoveredDate && isSameDay(date, state.hoveredDate);
    const isFocused = state.focusedDate && isSameDay(date, state.focusedDate);
    const vacationInfo = props.getDateVacationInfo(date);

    // Base classes with focus outline always visible
    const baseClasses = `flex items-center justify-center ${theme.calendar.day.base} text-sm relative`;
    
    // Focus classes with high contrast and larger offset
    const focusClasses = isFocused 
      ? `outline outline-2 outline-offset-2 outline-blue-600 ring-2 ring-white ring-offset-2 ring-offset-white z-20` 
      : '';
    
    if (isBefore(date, today)) {
      return `${baseClasses} text-neutral-300 cursor-default ${focusClasses}`;
    }

    if (isStart || isEnd) {
      const color = props.activePersonId === 1 
        ? `bg-emerald-500 text-white hover:bg-emerald-600` 
        : `bg-cyan-500 text-white hover:bg-cyan-600`;
      return `${baseClasses} ${color} cursor-pointer ${focusClasses} ${isFocused && props.isSelectingVacation ? 'animate-pulse' : ''}`;
    }

    if (isInRange) {
      const color = props.activePersonId === 1 
        ? `bg-emerald-100 text-emerald-700` 
        : `bg-cyan-100 text-cyan-700`;
      return `${baseClasses} ${color} cursor-pointer ${focusClasses}`;
    }

    // Handle vacation and holiday combinations
    if (vacationInfo.isSharedVacation) {
      // If there's also a holiday, show a triple gradient
      if (holidayTypes.firstState.type === 'public' || holidayTypes.secondState.type === 'public') {
        return `${baseClasses} bg-gradient-to-r from-emerald-500 via-red-100/80 to-cyan-500 text-white cursor-pointer ${focusClasses}`;
      }
      if (holidayTypes.firstState.type === 'school' || holidayTypes.secondState.type === 'school') {
        return `${baseClasses} bg-gradient-to-r from-emerald-500 via-purple-100/80 to-cyan-500 text-white cursor-pointer ${focusClasses}`;
      }
      return `${baseClasses} bg-gradient-to-r from-emerald-500 to-cyan-500 text-white cursor-pointer ${focusClasses}`;
    }

    // Handle person1 vacation with holidays
    if (vacationInfo.person1Vacation) {
      if (holidayTypes.firstState.type === 'public') {
        return `${baseClasses} bg-gradient-to-r from-emerald-100 to-red-100/80 text-red-700 cursor-pointer ${focusClasses}`;
      }
      if (holidayTypes.firstState.type === 'school') {
        return `${baseClasses} bg-gradient-to-r from-emerald-100 to-purple-100/80 text-purple-700 cursor-pointer ${focusClasses}`;
      }
      if (holidayTypes.firstState.type === 'bridge') {
        return `${baseClasses} bg-gradient-to-r from-emerald-100 to-orange-100/80 text-orange-700 cursor-pointer ${focusClasses}`;
      }
      return `${baseClasses} bg-emerald-100 text-emerald-700 cursor-pointer ${focusClasses}`;
    }

    // Handle person2 vacation with holidays
    if (vacationInfo.person2Vacation) {
      if (holidayTypes.secondState.type === 'public') {
        return `${baseClasses} bg-gradient-to-r from-cyan-100 to-red-100/80 text-red-700 cursor-pointer ${focusClasses}`;
      }
      if (holidayTypes.secondState.type === 'school') {
        return `${baseClasses} bg-gradient-to-r from-cyan-100 to-purple-100/80 text-purple-700 cursor-pointer ${focusClasses}`;
      }
      if (holidayTypes.secondState.type === 'bridge') {
        return `${baseClasses} bg-gradient-to-r from-cyan-100 to-orange-100/80 text-orange-700 cursor-pointer ${focusClasses}`;
      }
      return `${baseClasses} bg-cyan-100 text-cyan-700 cursor-pointer ${focusClasses}`;
    }

    // Handle overlapping holidays between states
    if (holidayTypes.firstState.type && holidayTypes.secondState.type) {
      if (holidayTypes.firstState.type === holidayTypes.secondState.type) {
        if (holidayTypes.firstState.type === 'public') {
          return `${baseClasses} bg-red-100/80 text-red-700 cursor-pointer ${focusClasses}`;
        }
        if (holidayTypes.firstState.type === 'school') {
          return `${baseClasses} bg-purple-100/80 text-purple-700 cursor-pointer ${focusClasses}`;
        }
        if (holidayTypes.firstState.type === 'bridge') {
          return `${baseClasses} bg-orange-100/80 text-orange-700 cursor-pointer ${focusClasses}`;
        }
      }
      // Different holiday types overlapping
      const firstColor = holidayTypes.firstState.type === 'public' ? 'red' : 
                        holidayTypes.firstState.type === 'school' ? 'purple' : 'orange';
      const secondColor = holidayTypes.secondState.type === 'public' ? 'red' : 
                         holidayTypes.secondState.type === 'school' ? 'purple' : 'orange';
      return `${baseClasses} bg-gradient-to-r from-${firstColor}-100/80 to-${secondColor}-100/80 text-gray-700 cursor-pointer ${focusClasses}`;
    }

    // Handle single state holidays
    if (holidayTypes.firstState.type === 'public') {
      return `${baseClasses} bg-red-100/80 text-red-700 cursor-pointer ${focusClasses}`;
    }
    if (holidayTypes.firstState.type === 'school') {
      return `${baseClasses} bg-purple-100/80 text-purple-700 cursor-pointer ${focusClasses}`;
    }
    if (holidayTypes.firstState.type === 'bridge') {
      return `${baseClasses} bg-orange-100/80 text-orange-700 cursor-pointer ${focusClasses}`;
    }

    if (holidayTypes.secondState.type === 'public') {
      return `${baseClasses} bg-red-100/80 text-red-700 cursor-pointer ${focusClasses}`;
    }
    if (holidayTypes.secondState.type === 'school') {
      return `${baseClasses} bg-purple-100/80 text-purple-700 cursor-pointer ${focusClasses}`;
    }
    if (holidayTypes.secondState.type === 'bridge') {
      return `${baseClasses} bg-orange-100/80 text-orange-700 cursor-pointer ${focusClasses}`;
    }

    if (isWeekendDay) {
      return `${baseClasses} text-neutral-500 hover:bg-neutral-100 cursor-pointer ${focusClasses}`;
    }

    if (isFocused && props.isSelectingVacation) {
      return `${baseClasses} bg-blue-50 text-blue-700 cursor-pointer ${focusClasses}`;
    }

    if (isHovered && props.isSelectingVacation) {
      return `${baseClasses} bg-neutral-100 cursor-pointer ${focusClasses}`;
    }

    return `${baseClasses} hover:bg-neutral-100 cursor-pointer ${focusClasses}`;
  };

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

  const getDateAriaLabel = (date: Date, holidayTypes: ReturnType<typeof getHolidayType>, vacationInfo: ReturnType<typeof props.getDateVacationInfo>) => {
    const parts: string[] = [format(date, 'd. MMMM yyyy', { locale: de })];
    
    if (isWeekend(date)) {
      parts.push('Wochenende');
    }

    if (holidayTypes.firstState.holiday?.name) {
      const holidayName = holidayTypes.firstState.holiday.name
        .split(' ')
        .map(word => {
          // Capitalize first letter of specific words
          if (['sommerferien', 'winterferien', 'osterferien', 'herbstferien', 'pfingstferien', 'weihnachtsferien'].includes(word.toLowerCase())) {
            return word.charAt(0).toUpperCase() + word.slice(1);
          }
          // Capitalize state names
          if (['baden-württemberg', 'bayern', 'berlin', 'brandenburg', 'bremen', 'hamburg', 'hessen', 'mecklenburg-vorpommern', 'niedersachsen', 'nordrhein-westfalen', 'rheinland-pfalz', 'saarland', 'sachsen', 'sachsen-anhalt', 'schleswig-holstein', 'thüringen'].includes(word.toLowerCase())) {
            return word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-');
          }
          return word;
        })
        .join(' ');

      const prefix = holidayTypes.firstState.type === 'school' ? 'Schulferien:' : 'Feiertag:';
      parts.push(`${prefix} ${holidayName}`);
    }

    if (holidayTypes.secondState.holiday?.name && holidayTypes.secondState.holiday.name !== holidayTypes.firstState.holiday?.name) {
      const holidayName = holidayTypes.secondState.holiday.name
        .split(' ')
        .map(word => {
          // Capitalize first letter of specific words
          if (['sommerferien', 'winterferien', 'osterferien', 'herbstferien', 'pfingstferien', 'weihnachtsferien'].includes(word.toLowerCase())) {
            return word.charAt(0).toUpperCase() + word.slice(1);
          }
          // Capitalize state names
          if (['baden-württemberg', 'bayern', 'berlin', 'brandenburg', 'bremen', 'hamburg', 'hessen', 'mecklenburg-vorpommern', 'niedersachsen', 'nordrhein-westfalen', 'rheinland-pfalz', 'saarland', 'sachsen', 'sachsen-anhalt', 'schleswig-holstein', 'thüringen'].includes(word.toLowerCase())) {
            return word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-');
          }
          return word;
        })
        .join(' ');

      const prefix = holidayTypes.secondState.type === 'school' ? 'Schulferien:' : 'Feiertag:';
      parts.push(`${prefix} ${holidayName}`);
    }

    if (holidayTypes.firstState.type === 'bridge') {
      parts.push('Brückentag Person 1');
    }
    if (holidayTypes.secondState.type === 'bridge') {
      parts.push('Brückentag Person 2');
    }

    if (vacationInfo.person1Vacation) {
      parts.push('Urlaub Person 1');
    }
    if (vacationInfo.person2Vacation) {
      parts.push('Urlaub Person 2');
    }
    if (vacationInfo.isSharedVacation) {
      parts.push('Gemeinsamer Urlaub');
    }

    if (props.startDate && isSameDay(date, props.startDate)) {
      parts.push('Urlaubsbeginn');
    }
    if (props.endDate && isSameDay(date, props.endDate)) {
      parts.push('Urlaubsende');
    }

    if (isBefore(date, today)) {
      parts.push('Vergangener Tag');
    }

    return parts.join(', ');
  };

  const renderMonth = (monthDate: Date) => {
    const days = getDaysInMonth(monthDate);
    const firstDayOffset = days[0].getDay() || 7;

    return (
      <div key={monthDate.getTime()} className="p-1.5">
        <div 
          className="text-sm font-medium text-gray-900 h-7 flex items-center justify-center"
          role="heading" 
          aria-level={2}
        >
          {format(monthDate, 'MMMM yyyy', { locale: de })}
        </div>
        <div 
          className="grid grid-cols-7 gap-0.5"
          role="grid"
          aria-label={`Kalender für ${format(monthDate, 'MMMM yyyy', { locale: de })}`}
        >
          {/* Weekday headers */}
          <div role="row" className="contents">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
              <div 
                key={day} 
                role="columnheader"
                aria-label={day === 'Mo' ? 'Montag' : 
                          day === 'Di' ? 'Dienstag' :
                          day === 'Mi' ? 'Mittwoch' :
                          day === 'Do' ? 'Donnerstag' :
                          day === 'Fr' ? 'Freitag' :
                          day === 'Sa' ? 'Samstag' : 'Sonntag'}
                className="text-sm font-medium text-gray-500 h-7 w-7 flex items-center justify-center mx-auto"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Empty cells for days before month starts */}
          <div role="row" className="contents">
            {Array.from({ length: firstDayOffset - 1 }).map((_, i) => (
              <div key={`empty-${i}`} role="gridcell" aria-hidden="true" className="h-7" />
            ))}

            {/* Calendar days */}
            {days.map((date, dayIndex) => {
              const isDisabled = isDateDisabled(date);
              const holidayTypes = getHolidayType(date, props.holidays, props.bridgeDays, props.secondStateHolidays, props.secondStateBridgeDays);
              const vacationInfo = props.getDateVacationInfo(date);
              const dateStr = format(date, 'yyyy-MM-dd');

              return (
                <div
                  key={dayIndex}
                  className="relative"
                >
                  <button
                    data-date={dateStr}
                    className={`mx-auto h-7 w-7 ${getDateClasses(date)}`}
                    onClick={() => {
                      if (!isDisabled && props.isSelectingVacation) {
                        handleDateSelect(date);
                        handleDateFocus(date);
                      }
                    }}
                    onMouseEnter={() => {
                      if (!isDisabled) {
                        handleDateHover(date);
                        handleDateFocus(date);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isDisabled) {
                        handleMouseLeave();
                        handleDateFocus(null);
                      }
                    }}
                    onFocus={() => {
                      focusedDateRef.current = date;
                      if (!isDisabled) {
                        handleDateHover(date);
                        handleDateFocus(date);
                      }
                    }}
                    onBlur={() => {
                      if (!isDisabled) {
                        handleMouseLeave();
                        handleDateFocus(null);
                      }
                    }}
                    disabled={isDisabled}
                    tabIndex={isDisabled ? -1 : 0}
                    role="gridcell"
                    aria-label={getDateAriaLabel(date, holidayTypes, vacationInfo)}
                    aria-disabled={isDisabled}
                    aria-selected={
                      (props.startDate && isSameDay(date, props.startDate)) || 
                      (props.endDate && isSameDay(date, props.endDate)) || 
                      undefined
                    }
                    aria-current={isSameDay(date, today) ? 'date' : undefined}
                  >
                    {format(date, 'd')}
                    {vacationInfo.isSharedVacation && (
                      <div 
                        className="absolute -top-1 -right-1 w-3 h-3 text-red-500"
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>
                    )}
                  </button>
                  {(state.hoveredDate && isSameDay(date, state.hoveredDate) || 
                    state.focusedDate && isSameDay(date, state.focusedDate)) && (
                    <DateTooltip
                      date={date}
                      holidayTypes={holidayTypes}
                      vacationInfo={vacationInfo}
                      isSelectingVacation={props.isSelectingVacation || false}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={calendarRef}
      className={`relative ${theme.calendar.container}`}
      onMouseLeave={handleMouseLeave}
      role="grid"
      aria-label="Kalender"
    >
      <div 
        role="region" 
        aria-label="Tastaturnavigation"
        className="sr-only"
      >
        Tastenkürzel: N für Urlaub Person 1, M für Urlaub Person 2. 
        Q für Empfehlungen Person 1, W für Empfehlungen Person 2.
        Ziffern 1-4 zum Löschen der Urlaube von Person 1,
        Ziffern 5-8 zum Löschen der Urlaube von Person 2.
        Pfeiltasten für Navigation, Bild auf/ab für Monate,
        Enter oder Leertaste zum Auswählen, Escape zum Abbrechen,
        Pos1 für Jahresanfang und Ende für Jahresende.
      </div>
      <div 
        ref={announcerRef}
        role="status" 
        aria-live="assertive" 
        className="sr-only"
      />
      <div 
        role="region" 
        aria-label="Kalenderübersicht" 
        className="grid grid-cols-4 gap-1.5 h-full"
      >
        {Array.from({ length: 12 }, (_, i) => 
          addMonths(new Date(props.month.getFullYear(), 0, 1), i)
        ).map(renderMonth)}
      </div>
    </div>
  );
}; 