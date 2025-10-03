import React, { useState, useEffect } from 'react';
import { isBefore, differenceInDays, startOfDay, parse, isValid, addMonths, isWithinInterval } from 'date-fns';
import { VacationPlan } from '../../types/vacationPlan';
import { Holiday } from '../../types/holiday';
import { GermanState } from '../../types/GermanState';

export interface BaseVacationPickerProps {
  personId: 1 | 2;
  holidays: Holiday[];
  bridgeDays: Date[];
  onSubmit: (plan: Omit<VacationPlan, 'id' | 'personId'>) => void;
  onClose: () => void;
  existingVacations: VacationPlan[];
  state: GermanState;
  year?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface VacationPickerState {
  startDate: Date | null;
  endDate: Date | null;
  currentMonth: Date;
  showCalendar: boolean;
}

export const useVacationPicker = (props: BaseVacationPickerProps) => {
  const year = props.year || new Date().getFullYear();
  
  const [state, setState] = useState<VacationPickerState>({
    startDate: null,
    endDate: null,
    currentMonth: new Date(year, 0, 1),
    showCalendar: true
  });

  const today = startOfDay(new Date());

  // Handle December to next year logic
  useEffect(() => {
    if (state.startDate && !state.endDate && state.startDate.getMonth() === 11) {
      const nextYear = new Date(state.startDate);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setState(prev => ({ ...prev, endDate: nextYear }));
    }
  }, [state.startDate]);

  const handleStartDateChange = (dateStr: string) => {
    const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    
    if (!isValid(parsedDate)) return;
    if (isBefore(parsedDate, today)) return;
    
    setState(prev => {
      const newState = { ...prev, startDate: parsedDate };
      if (prev.endDate && isBefore(prev.endDate, parsedDate)) {
        newState.endDate = parsedDate;
      }
      return newState;
    });
  };

  const handleEndDateChange = (dateStr: string) => {
    const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    
    if (!isValid(parsedDate)) return;
    if (state.startDate && isBefore(parsedDate, state.startDate)) return;
    
    setState(prev => ({ ...prev, endDate: parsedDate }));
  };

  const handleDateSelect = (date: Date) => {
    if (isDateBooked(date)) return;
    
    setState(prev => {
      if (!prev.startDate) {
        return { ...prev, startDate: date };
      }
      if (!prev.endDate) {
        if (isBefore(date, prev.startDate)) {
          return { ...prev, endDate: prev.startDate, startDate: date };
        }
        return { ...prev, endDate: date };
      }
      return { ...prev, startDate: date, endDate: null };
    });
  };

  const handleMonthChange = (increment: number) => {
    setState(prev => ({
      ...prev,
      currentMonth: addMonths(prev.currentMonth, increment)
    }));
  };

  const toggleCalendar = () => {
    setState(prev => ({ ...prev, showCalendar: !prev.showCalendar }));
  };

  const isDateBooked = (date: Date) => {
    return props.existingVacations.some(vacation => 
      isWithinInterval(date, { start: vacation.start, end: vacation.end })
    );
  };

  const getVacationDays = () => {
    if (!state.startDate || !state.endDate || !isValid(state.startDate) || !isValid(state.endDate)) {
      return 0;
    }
    return Math.abs(differenceInDays(state.endDate, state.startDate)) + 1;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.startDate && state.endDate && isValid(state.startDate) && isValid(state.endDate)) {
      props.onSubmit({
        start: state.startDate,
        end: state.endDate,
        isVisible: true,
        state: props.state
      });
    }
  };

  return {
    state,
    today,
    handleStartDateChange,
    handleEndDateChange,
    handleDateSelect,
    handleMonthChange,
    toggleCalendar,
    isDateBooked,
    getVacationDays,
    handleSubmit
  };
}; 