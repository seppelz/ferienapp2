import React, { useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { DesktopCalendar } from '../Desktop/Calendar/DesktopCalendar';
import { MobileCalendar } from '../Mobile/Calendar/MobileCalendar';
import { BaseCalendarProps } from '../Shared/Calendar/BaseCalendar';
import { GermanState } from '../../types/GermanState';
import { Holiday, BridgeDay } from '../../types/holiday';
import { VacationPlan } from '../../types/vacationPlan';
import { differenceInDays, isWithinInterval, isSameDay } from 'date-fns';

interface CalendarProps {
  state: GermanState;
  secondState: GermanState | null;
  holidays: Holiday[];
  secondStateHolidays: Holiday[];
  bridgeDays: BridgeDay[];
  secondStateBridgeDays: BridgeDay[];
  vacationPlans: VacationPlan[];
  secondStateVacationPlans: VacationPlan[];
  onVacationSelect?: (start: Date, end: Date) => void;
  onAddVacation?: (plan: Omit<VacationPlan, 'id' | 'personId'>) => void;
  onDeleteVacation?: (personId: 1 | 2, index: number) => void;
  vacationCount?: { person1: number; person2: number };
  personId?: 1 | 2;
  isSelectingVacation?: boolean;
  onVacationSelectComplete?: () => void;
  onShowRecommendations?: (personId: 1 | 2) => void;
  year?: number;
}

export const Calendar: React.FC<CalendarProps> = (props) => {
  const [currentMonth] = useState(new Date(props.year || new Date().getFullYear(), 0));
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleDateSelect = (date: Date) => {
    if (!selectedStartDate) {
      setSelectedStartDate(date);
    } else if (!selectedEndDate) {
      const start = date < selectedStartDate ? date : selectedStartDate;
      const end = date < selectedStartDate ? selectedStartDate : date;
      
      if (props.onAddVacation) {
        props.onAddVacation({
          start,
          end,
          isVisible: true,
          state: props.state
        });
      } else if (props.onVacationSelect) {
        props.onVacationSelect(start, end);
      }

      // Reset dates after selection
      setTimeout(() => {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
      }, 100);
    }
  };

  const getDateVacationInfo = (date: Date) => {
    const person1Vacation = props.vacationPlans.some(vacation =>
      isSameDay(date, vacation.start) || isSameDay(date, vacation.end) ||
      isWithinInterval(date, { start: vacation.start, end: vacation.end })
    );

    const person2Vacation = props.secondStateVacationPlans.some(vacation =>
      isSameDay(date, vacation.start) || isSameDay(date, vacation.end) ||
      isWithinInterval(date, { start: vacation.start, end: vacation.end })
    );

    return {
      person1Vacation,
      person2Vacation,
      isSharedVacation: person1Vacation && person2Vacation
    };
  };

  const calendarData = {
    person1: props.holidays.map(h => ({ 
      date: h.date ? new Date(h.date) : (h.start ? new Date(h.start) : new Date()), 
      reason: h.name 
    })),
    person2: props.secondStateHolidays.map(h => ({ 
      date: h.date ? new Date(h.date) : (h.start ? new Date(h.start) : new Date()), 
      reason: h.name 
    }))
  };

  const baseCalendarProps: BaseCalendarProps = {
    month: currentMonth,
    startDate: selectedStartDate,
    endDate: selectedEndDate,
    onDateSelect: handleDateSelect,
    holidays: props.holidays,
    secondStateHolidays: props.secondStateHolidays,
    bridgeDays: props.bridgeDays,
    secondStateBridgeDays: props.secondStateBridgeDays,
    getDateVacationInfo,
    activePersonId: props.personId,
    tabIndex: 0,
    isSelectingVacation: props.isSelectingVacation,
    onDeleteVacation: props.onDeleteVacation,
    vacationCount: props.vacationCount,
    onVacationSelectComplete: props.onVacationSelectComplete,
    onShowRecommendations: props.onShowRecommendations,
    recommendedDates: calendarData
  };

  return isMobile ? (
    <MobileCalendar {...baseCalendarProps} personId={props.personId || 1} />
  ) : (
    <DesktopCalendar {...baseCalendarProps} />
  );
};

export default Calendar; 