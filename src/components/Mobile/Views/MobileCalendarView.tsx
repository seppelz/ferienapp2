import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MobileCalendar } from '../Calendar/MobileCalendar';
import { MobileCalendarLegend } from '../Calendar/MobileCalendarLegend';
import { Holiday, BridgeDay } from '../../../types/holiday';
import { VacationPlan } from '../../../types/vacationPlan';
import { isWithinInterval, isSameDay, min, max, addDays, isBefore, differenceInDays } from 'date-fns';

interface MobileCalendarViewProps {
  holidays: Holiday[];
  bridgeDays: BridgeDay[];
  vacationPlans: VacationPlan[];
  onAddVacation: (start: Date, end: Date) => void;
  onRemoveVacation: (id: string) => void;
  personId: 1 | 2;
  otherPersonVacations: VacationPlan[];
  initialDate?: Date | null;
}

export const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({
  holidays,
  bridgeDays,
  vacationPlans,
  onAddVacation,
  onRemoveVacation,
  personId,
  otherPersonVacations = [],
  initialDate = null
}) => {
  const [month, setMonth] = useState(() => initialDate || new Date(2025, 0, 1));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTimeout, setFeedbackTimeout] = useState<NodeJS.Timeout | null>(null);

  // Convert BridgeDay[] to Date[]
  const bridgeDayDates = useMemo(() => 
    bridgeDays.map(bd => bd.date)
  , [bridgeDays]);

  // Update month when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setMonth(initialDate);
    }
  }, [initialDate]);

  // Cleanup feedback timeout
  useEffect(() => {
    return () => {
      if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
      }
    };
  }, [feedbackTimeout]);

  // Get vacation info for a date
  const getDateVacationInfo = useCallback((date: Date) => {
    const person1Vacation = personId === 1 && vacationPlans.some(vacation =>
      vacation.isVisible && isWithinInterval(date, { start: vacation.start, end: vacation.end })
    );
    const person2Vacation = personId === 2 && vacationPlans.some(vacation =>
      vacation.isVisible && isWithinInterval(date, { start: vacation.start, end: vacation.end })
    );
    const isSharedVacation = otherPersonVacations.some(otherVacation =>
      isWithinInterval(date, { start: otherVacation.start, end: otherVacation.end }) &&
      vacationPlans.some(vacation =>
        vacation.isVisible && isWithinInterval(date, { start: vacation.start, end: vacation.end })
      )
    );

    return {
      person1Vacation: person1Vacation || false,
      person2Vacation: person2Vacation || false,
      isSharedVacation
    };
  }, [personId, vacationPlans, otherPersonVacations]);

  // Show feedback message with auto-clear
  const showFeedback = useCallback((message: string, duration: number = 3000) => {
    setFeedbackMessage(message);
    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
    }
    const timeout = setTimeout(() => {
      setFeedbackMessage(null);
    }, duration);
    setFeedbackTimeout(timeout);
  }, [feedbackTimeout]);

  // Memoize expensive date operations
  const isDateRangeFullyContained = useCallback((start: Date, end: Date) => {
    return vacationPlans.some(vacation =>
      vacation.isVisible && 
      isWithinInterval(start, { start: vacation.start, end: vacation.end }) &&
      isWithinInterval(end, { start: vacation.start, end: vacation.end })
    );
  }, [vacationPlans]);

  const findOverlappingVacations = useCallback((start: Date, end: Date) => {
    return vacationPlans.filter(vacation =>
      vacation.isVisible && (
        isWithinInterval(start, { start: vacation.start, end: vacation.end }) ||
        isWithinInterval(end, { start: vacation.start, end: vacation.end }) ||
        isWithinInterval(vacation.start, { start, end }) ||
        isWithinInterval(vacation.end, { start, end })
      )
    );
  }, [vacationPlans]);

  const handleDateSelect = useCallback((date: Date) => {
    if (!startDate) {
      setStartDate(date);
      setEndDate(date); // Set endDate to same as startDate to show selection
      showFeedback('Wählen Sie das Enddatum');
    } else {
      const start = isBefore(startDate, date) ? startDate : date;
      const end = isBefore(startDate, date) ? date : startDate;

      // Check if the selected range is fully contained in an existing vacation
      if (isDateRangeFullyContained(start, end)) {
        showFeedback('Dieser Zeitraum ist bereits als Urlaub eingetragen');
        setStartDate(null);
        setEndDate(null);
        return;
      }

      // Find any overlapping or adjacent vacations
      const overlappingVacations = findOverlappingVacations(start, end);

      if (overlappingVacations.length > 0) {
        showFeedback('Überlappende Urlaube werden zusammengeführt');
        
        // Remove overlapping vacations
        overlappingVacations.forEach(vacation => {
          onRemoveVacation(vacation.id);
        });

        // Create the new vacation that includes all dates
        const allDates = [
          ...overlappingVacations.map(v => [v.start, v.end]).flat(),
          start,
          end
        ];
        const mergedStart = min(allDates);
        const mergedEnd = max(allDates);

        onAddVacation(mergedStart, mergedEnd);
      } else {
        // Create new vacation
        onAddVacation(start, end);
        showFeedback('Urlaub wurde eingetragen');
      }

      // Reset selection
      setStartDate(null);
      setEndDate(null);
    }
  }, [startDate, isDateRangeFullyContained, findOverlappingVacations, onRemoveVacation, onAddVacation, showFeedback]);

  const handleMonthChange = useCallback((direction: number) => {
    // Ensure direction is either 1 or -1
    const normalizedDirection = direction > 0 ? 1 : -1;
    setMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + normalizedDirection, 1));
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-lg mx-auto p-4 flex flex-col h-full relative">
        {/* Feedback Message Overlay */}
        {feedbackMessage && (
          <div className="absolute top-6 right-6 z-50">
            <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-gray-700 border border-gray-200">
              {feedbackMessage}
            </div>
          </div>
        )}
        
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="max-h-[calc(100dvh-16rem)]">
            <MobileCalendar
              month={month}
              holidays={holidays}
              secondStateHolidays={[]}
              bridgeDays={bridgeDays}
              secondStateBridgeDays={[]}
              startDate={startDate}
              endDate={endDate}
              onDateSelect={handleDateSelect}
              disabledDates={[]}
              personId={personId}
              onMonthChange={handleMonthChange}
              isSelectingVacation={true}
              getDateVacationInfo={getDateVacationInfo}
              tabIndex={0}
              recommendedDates={{
                person1: [],
                person2: []
              }}
              vacationPlans={vacationPlans}
              initialDate={initialDate}
            />
            <MobileCalendarLegend 
              currentMonth={month}
              holidays={holidays}
              schoolHolidays={holidays.filter(h => h.type === 'school')}
              vacationPlans={vacationPlans}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 