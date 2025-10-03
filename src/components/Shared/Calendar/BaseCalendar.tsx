import React from 'react';
import { Holiday, BridgeDay } from '../../../types/holiday';

export interface BaseCalendarProps {
  month: Date;
  startDate: Date | null;
  endDate: Date | null;
  onDateSelect: (date: Date) => void;
  holidays: Holiday[];
  secondStateHolidays: Holiday[];
  bridgeDays: BridgeDay[];
  secondStateBridgeDays: BridgeDay[];
  getDateVacationInfo: (date: Date) => {
    person1Vacation: boolean;
    person2Vacation: boolean;
    isSharedVacation: boolean;
  };
  activePersonId?: 1 | 2;
  tabIndex: number;
  isSelectingVacation?: boolean;
  disabledDates?: Array<{ start: Date; end: Date }>;
  onDateClick?: (date: Date) => void;
  onAddVacation?: (vacation: { start: Date; end: Date; isVisible: boolean }) => void;
  onDeleteVacation?: (personId: 1 | 2, index: number) => void;
  vacationCount?: { person1: number; person2: number };
  onVacationSelectComplete?: () => void;
  onShowRecommendations?: (personId: 1 | 2) => void;
  recommendedDates?: {
    person1: Array<{ date: Date; reason?: string }>;
    person2: Array<{ date: Date; reason?: string }>;
  };
  year?: number;
}

export interface CalendarState {
  hoveredDate: Date | null;
  focusedDate: Date | null;
}

export const useCalendar = (props: BaseCalendarProps) => {
  const [state, setState] = React.useState<CalendarState>({
    hoveredDate: null,
    focusedDate: null
  });

  const handleDateSelect = (date: Date) => {
    if (props.onDateSelect) {
      props.onDateSelect(date);
    }
  };

  const handleDateHover = (date: Date) => {
    if (!props.isSelectingVacation) return;
    setState(prev => ({ ...prev, hoveredDate: date }));
  };

  const handleDateFocus = (date: Date) => {
    setState(prev => ({ ...prev, focusedDate: date }));
  };

  const handleMouseLeave = () => {
    setState(prev => ({ ...prev, hoveredDate: null }));
  };

  return {
    state,
    handleDateSelect,
    handleDateHover,
    handleDateFocus,
    handleMouseLeave
  };
}; 