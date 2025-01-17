import React, { useMemo } from 'react';
import { format, eachDayOfInterval, isWeekend, isWithinInterval, isSameDay, addDays, subDays, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { VacationPlan } from '../types/vacationPlan';
import { GermanState } from '../types/GermanState';
import { Holiday, BridgeDay } from '../types/holiday';
import { analyzeVacationOpportunities, VacationRecommendation } from '../utils/smartVacationAnalysis';
import { useTheme } from '../hooks/useTheme';
import { calculateVacationDays } from '../utils/vacationCalculator';
import styles from './VacationList.module.css';

interface VacationListProps {
  vacations: VacationPlan[];
  otherPersonVacations?: VacationPlan[];
  onToggleVisibility: (id: string) => void;
  onRemove: (id: string) => void;
  personId?: 1 | 2;
  holidays?: Holiday[];
  bridgeDays?: BridgeDay[];
  onAddVacation?: (start: Date, end: Date) => void;
  availableVacationDays?: number;
  state: GermanState;
}

const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

const calculateVacationStats = (vacation: VacationPlan, holidays: Holiday[]) => {
  try {
    if (!isValidDate(vacation.start) || !isValidDate(vacation.end)) {
      console.error('Invalid vacation dates:', {
        start: vacation.start,
        end: vacation.end
      });
      return { requiredDays: 0, gainedDays: 0, displayStart: vacation.start, displayEnd: vacation.end };
    }

    // Calculate required days (workdays that need to be taken off)
    const allDays = eachDayOfInterval({ start: vacation.start, end: vacation.end });
    const requiredDays = allDays.reduce((count, d) => {
      if (isWeekend(d)) return count;
      const isPublicHoliday = holidays.some(h => {
        if (h.type !== 'public' || !h.date) return false;
        const holidayDate = new Date(h.date);
        return isValidDate(holidayDate) ? isSameDay(holidayDate, d) : false;
      });
      return isPublicHoliday ? count : count + 1;
    }, 0);

    // Find the full free period including surrounding weekends/holidays
    let displayStart = vacation.start;
    let displayEnd = vacation.end;

    // Look backwards for connected free days
    let currentDay = subDays(vacation.start, 1);
    while (isWeekend(currentDay) || holidays.some(h => {
      if (h.type !== 'public' || !h.date) return false;
      const holidayDate = new Date(h.date);
      return isValidDate(holidayDate) ? isSameDay(holidayDate, currentDay) : false;
    })) {
      displayStart = currentDay;
      currentDay = subDays(currentDay, 1);
    }

    // Look forwards for connected free days
    currentDay = addDays(vacation.end, 1);
    while (isWeekend(currentDay) || holidays.some(h => {
      if (h.type !== 'public' || !h.date) return false;
      const holidayDate = new Date(h.date);
      return isValidDate(holidayDate) ? isSameDay(holidayDate, currentDay) : false;
    })) {
      displayEnd = currentDay;
      currentDay = addDays(currentDay, 1);
    }

    // Calculate total gained days in the full period
    const gainedDays = differenceInDays(displayEnd, displayStart) + 1;
    
    return { requiredDays, gainedDays, displayStart, displayEnd };
  } catch (error) {
    console.error('Error calculating vacation stats:', error);
    return { 
      requiredDays: 0, 
      gainedDays: 0, 
      displayStart: vacation.start, 
      displayEnd: vacation.end 
    };
  }
};

const formatVacationDays = (vacationDays: Date[]): string => {
  return vacationDays
    .sort((a, b) => a.getTime() - b.getTime())
    .map(d => format(d, 'dd.MM.'))
    .join(' + ');
};

export const VacationList: React.FC<VacationListProps> = ({
  vacations,
  otherPersonVacations = [],
  onToggleVisibility,
  onRemove,
  personId = 1,
  holidays = [],
  bridgeDays = [],
  onAddVacation,
  availableVacationDays = 30,
  state,
}) => {
  const theme = useTheme();
  const { usedDays, gainedDays } = calculateVacationDays(vacations);
  const isOverLimit = usedDays > availableVacationDays;
  
  // Calculate total efficiency
  const totalStats = vacations.reduce((acc, vacation) => {
    const stats = calculateVacationStats(vacation, holidays);
    return {
      requiredDays: acc.requiredDays + stats.requiredDays,
      gainedDays: acc.gainedDays + stats.gainedDays
    };
  }, { requiredDays: 0, gainedDays: 0 });

  const efficiency = totalStats.requiredDays > 0 ? totalStats.gainedDays / totalStats.requiredDays : 1;

  const vacationStats = useMemo(() => {
    return vacations.reduce((acc, vacation) => {
      const stats = calculateVacationStats(vacation, holidays);
      acc[vacation.id] = stats;
      return acc;
    }, {} as Record<string, { requiredDays: number; gainedDays: number; displayStart: Date; displayEnd: Date }>);
  }, [vacations, holidays]);

  const stats = useMemo(() => {
    return vacations
      .filter(v => v.isVisible)
      .reduce((acc, vacation) => {
        const stats = vacationStats[vacation.id];
        return {
          requiredDays: acc.requiredDays + stats.requiredDays,
          gainedDays: acc.gainedDays + stats.gainedDays
        };
      }, { requiredDays: 0, gainedDays: 0 });
  }, [vacations, vacationStats]);

  const remainingDays = availableVacationDays - stats.requiredDays;

  const bestCombinations = useMemo(() => {
    if (!holidays || !state) return [];
    
    const recommendations = analyzeVacationOpportunities(holidays, state);
    
    return recommendations.filter(rec => {
      return !vacations.some(vacation => 
        isWithinInterval(rec.startDate, { start: vacation.start, end: vacation.end }) ||
        isWithinInterval(rec.endDate, { start: vacation.start, end: vacation.end })
      );
    });
  }, [holidays, state, vacations]);

  const enhancedRecommendations = useMemo(() => bestCombinations.map(rec => {
    const includesBridgeDay = bridgeDays?.some(bd => 
      isSameDay(new Date(bd.date), rec.startDate) ||
      isSameDay(new Date(bd.date), rec.endDate)
    );
    
    return {
      ...rec,
      includesBridgeDay
    };
  }), [bestCombinations, bridgeDays]);

  const getMatchingDays = (vacation: VacationPlan) => {
    const matchingVacations = otherPersonVacations.filter(otherVacation =>
      (vacation.start <= otherVacation.end && vacation.end >= otherVacation.start)
    );
    
    if (matchingVacations.length === 0) return 0;
    
    let matchingDays = 0;
    for (let current = new Date(vacation.start); current <= vacation.end; current.setDate(current.getDate() + 1)) {
      if (matchingVacations.some(mv => isWithinInterval(current, { start: mv.start, end: mv.end }))) {
        matchingDays++;
      }
    }
    return matchingDays;
  };

  const handleRecommendationClick = (rec: VacationRecommendation) => {
    if (onAddVacation && rec.startDate && rec.endDate) {
      onAddVacation(rec.startDate, rec.endDate);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Bridge Day Opportunities */}
      {enhancedRecommendations.length > 0 && (
        <div className="flex-none">
          <h4 className={`text-xs font-medium mb-1 ${personId === 1 ? 'text-emerald-600' : 'text-cyan-600'}`}>
            Brückentag-Möglichkeiten
          </h4>
          <div className="space-y-0.5">
            {enhancedRecommendations.map((rec, index) => {
              if (!rec.startDate || !rec.endDate) return null;
              const startDate = new Date(rec.startDate);
              const endDate = new Date(rec.endDate);
              if (!isValidDate(startDate) || !isValidDate(endDate)) return null;

              return (
                <button
                  key={index}
                  className={`${theme.card.base} ${theme.card.hover} w-full text-left py-1.5 px-3 ${
                    rec.includesBridgeDay ? 'bg-emerald-50' : ''
                  }`}
                  onClick={() => handleRecommendationClick(rec)}
                  role="button"
                  aria-label={`Brückentag-Empfehlung: ${rec.displayRange}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`${theme.text.body} text-sm`}>
                      {rec.displayRange}
                    </span>
                    <span className={`${theme.text.body} text-sm ml-2`}>
                      {rec.efficiencyDisplay}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Planned Vacations - Enhanced Scrollable Area */}
      <div className={styles.vacationList}>
        <div className={styles.vacationListHeader}>
          <h4 
            className={styles.vacationListTitle}
            style={{ '--person-color': personId === 1 ? '#059669' : '#0891b2' } as React.CSSProperties}
          >
            Geplante Urlaube
          </h4>
          <span className={styles.vacationListCount}>
            {vacations.length} {vacations.length === 1 ? 'Urlaub' : 'Urlaube'}
          </span>
        </div>

        <div className={styles.vacationListScroll}>
          {vacations.map((vacation) => {
            const matchingDays = getMatchingDays(vacation);
            const stats = vacationStats[vacation.id];
            
            return (
              <div
                key={vacation.id}
                className={`${styles.vacationItem} ${vacation.isVisible ? styles.visible : ''}`}
                style={{ 
                  '--person-bg': personId === 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                  '--person-border': personId === 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)'
                } as React.CSSProperties}
              >
                <label className={styles.vacationToggle}>
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={vacation.isVisible}
                    onChange={() => onToggleVisibility(vacation.id)}
                  />
                  <div className={`w-8 h-4 rounded-full peer bg-gray-200 peer-checked:${
                    personId === 1 ? 'bg-emerald-500' : 'bg-cyan-500'
                  } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all`}></div>
                </label>

                <div className={styles.vacationContent}>
                  <div className={styles.vacationDate}>
                    {format(stats.displayStart, 'd.M.', { locale: de })} - {format(stats.displayEnd, 'd.M.yy', { locale: de })}
                  </div>
                  <div className={styles.vacationStats}>
                    <span className={styles.vacationStat}>
                      {stats.requiredDays}d = {stats.gainedDays}d
                    </span>
                    {matchingDays > 0 && (
                      <span className={styles.sharedDays}>
                        ❤️ {matchingDays}d gemeinsam
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onRemove(vacation.id)}
                  className={styles.deleteButton}
                  title="Löschen"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
          {vacations.length === 0 && (
            <div className={`${theme.text.secondary} text-sm text-center py-4`}>
              Noch keine Urlaube geplant
            </div>
          )}
        </div>

        {/* Total Free Days Summary - Inside the list container */}
        <div className={styles.summary}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`${theme.text.heading} text-sm`}>Freie Tage insgesamt</h4>
              <p className={`${theme.text.secondary} text-xs`}>inkl. Wochenenden & Feiertage</p>
            </div>
            <div className={`text-xl font-bold ${personId === 1 ? 'text-emerald-600' : 'text-cyan-600'}`}>
              {gainedDays}
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>{usedDays} Urlaubstage</span>
            <span>{gainedDays - usedDays} zusätzliche freie Tage</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 