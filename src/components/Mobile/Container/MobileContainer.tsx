import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { MobileLayout } from '../Layout/MobileLayout';
import { MobileHeader } from '../Layout/MobileHeader';
import { MobileActionBar } from '../ActionBar/MobileActionBar';
import { MobileViewTabs } from '../Navigation/MobileViewTabs';
import { MobileStateSelector } from '../Layout/MobileStateSelector';
import { MobileVacationDaysCounter } from '../Layout/MobileVacationDaysCounter';
import { MobileHolidaysView } from '../Views/MobileHolidaysView';
import { MobileSchoolHolidaysView } from '../Views/MobileSchoolHolidaysView';
import { MobilePlanningView } from '../Views/MobilePlanningView';
import { MobileCalendarView } from '../Views/MobileCalendarView';
import { MobileBridgeDaysView } from '../Views/MobileBridgeDaysView';
import { MobileExportModal } from '../Export/MobileExportModal';
import { Holiday, BridgeDay } from '../../../types/holiday';
import { GermanState } from '../../../types/GermanState';
import { VacationPlan } from '../../../types/vacationPlan';
import { AnimatePresence, motion } from 'framer-motion';
import { TutorialModal } from '../Tutorial/TutorialModal';
import { exportService } from '../../../services/exportService';
import { eachDayOfInterval, isWeekend, isSameDay } from 'date-fns';
import { useFirstTimeUser } from '../../../hooks/useFirstTimeUser';

type ViewType = 'holidays' | 'school' | 'bridge' | 'planning' | 'calendar';

interface MobileContainerProps {
  personId: 1 | 2;
  selectedState: GermanState;
  onStateChange: (state: GermanState) => void;
  holidays: Holiday[];
  bridgeDays: BridgeDay[];
  vacationPlans: VacationPlan[];
  onAddVacation: (start: Date, end: Date) => void;
  onRemoveVacation: (id: string) => void;
  onPersonSwitch: () => void;
  availableVacationDays: number;
  onAvailableDaysChange: (days: number) => void;
  otherPersonVacations: VacationPlan[];
  isLoading?: boolean;
  error?: Error | null;
}

// Loading Skeleton Component
const ViewSkeleton: React.FC = () => (
  <div className="animate-pulse p-4 space-y-4">
    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

// Error Component
const ErrorView: React.FC<{ error: Error; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-4 text-center h-full">
    <div className="text-red-500 mb-2">
      <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Ein Fehler ist aufgetreten
    </h3>
    <p className="text-sm text-gray-500 mb-4">
      {error.message}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Erneut versuchen
      </button>
    )}
  </div>
);

export const MobileContainer: React.FC<MobileContainerProps> = ({
  personId,
  selectedState,
  onStateChange,
  holidays,
  bridgeDays,
  vacationPlans,
  onAddVacation,
  onRemoveVacation,
  onPersonSwitch,
  availableVacationDays,
  onAvailableDaysChange,
  otherPersonVacations,
  isLoading = false,
  error = null
}) => {
  const [activeView, setActiveView] = useState<ViewType>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const { isFirstTimeUser, markTutorialAsSeen } = useFirstTimeUser();

  const getHolidayDate = (holiday: Holiday): Date => {
    if ('date' in holiday && holiday.date) {
      return new Date(holiday.date);
    } else if ('start' in holiday && holiday.start) {
      return new Date(holiday.start);
    }
    throw new Error('Invalid holiday date');
  };

  // Show tutorial automatically for first-time users
  useEffect(() => {
    if (isFirstTimeUser) {
      setShowTutorial(true);
    }
  }, [isFirstTimeUser]);

  // Handle tutorial close
  const handleTutorialClose = () => {
    setShowTutorial(false);
    markTutorialAsSeen();
  };

  // Calculate efficiency score
  const efficiency = useMemo(() => {
    if (!vacationPlans.length) return undefined;
    
    let totalRequiredDays = 0;
    let totalGainedDays = 0;
    
    vacationPlans.forEach(vacation => {
      const days = eachDayOfInterval({ start: vacation.start, end: vacation.end });
      // Required days are workdays that aren't public holidays
      const requiredDays = days.filter(d => 
        !isWeekend(d) && !holidays.some(h => 
          h.type === 'public' && isSameDay(getHolidayDate(h), d)
        )
      ).length;
      
      // Gained days are the total consecutive days off (including weekends and holidays)
      const gainedDays = days.length;
      
      totalRequiredDays += requiredDays;
      totalGainedDays += gainedDays;
    });
    
    // Return the efficiency multiplier (e.g., 5 means 5x efficiency)
    return totalRequiredDays > 0 ? totalGainedDays / totalRequiredDays : undefined;
  }, [vacationPlans, holidays]);

  // Get accent color based on person
  const accentColor = personId === 1 ? '#10b981' : '#06b6d4';
  
  // Handle view changes with announcements and transitions
  const handleViewChange = (view: ViewType) => {
    setIsViewTransitioning(true);
    setActiveView(view);
    const viewNames = {
      holidays: 'Feiertage',
      school: 'Schulferien',
      bridge: 'Brückentage',
      planning: 'Planung',
      calendar: 'Kalender'
    };
    setAnnouncement(`Ansicht gewechselt zu ${viewNames[view]}`);
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsViewTransitioning(false);
    }, 300);
  };

  // Handle holiday selection with announcements
  const handleHolidaySelect = (date: Date) => {
    setSelectedDate(date);
    setActiveView('calendar');
    setAnnouncement('Datum ausgewählt. Kalenderansicht geöffnet.');
  };

  // Enhanced vacation handlers with announcements
  const handleAddVacation = (start: Date, end: Date) => {
    onAddVacation(start, end);
    setStatusMessage('Urlaub erfolgreich hinzugefügt');
  };

  const handleRemoveVacation = (id: string) => {
    onRemoveVacation(id);
    setStatusMessage('Urlaub erfolgreich entfernt');
  };

  const handleExport = (type: 'ics' | 'hr' | 'celebration') => {
    exportService.exportVacationPlan(
      vacationPlans,
      holidays,
      personId,
      type,
      otherPersonVacations
    );
    setShowExportModal(false);
  };

  // Clear announcements after they're read
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Filter holidays by type for different views
  const publicHolidays = holidays.filter(h => h.type === 'public');
  const schoolHolidays = holidays.filter(h => h.type === 'school');

  const isPublicHoliday = (date: Date) => {
    return publicHolidays.some(h => isSameDay(getHolidayDate(h), date));
  };

  // Define layout components
  const header = (
    <MobileHeader
      title={`Urlaub ${personId === 2 ? "Person 2" : "Ich"}`}
      onPersonSwitch={onPersonSwitch}
      personId={personId}
      onTutorialOpen={() => setShowTutorial(true)}
      onExportOpen={() => setShowExportModal(true)}
    />
  );

  const stateSelector = (
    <MobileStateSelector
      selectedState={selectedState}
      onStateChange={onStateChange}
      personId={personId}
    />
  );

  const vacationCounter = (
    <MobileVacationDaysCounter
      availableVacationDays={availableVacationDays}
      onAvailableDaysChange={onAvailableDaysChange}
      vacationPlans={vacationPlans}
      accentColor={personId === 1 ? 'emerald' : 'cyan'}
      holidays={holidays}
      otherPersonVacations={otherPersonVacations}
    />
  );

  const viewTabs = (
    <MobileViewTabs
      activeView={activeView}
      onViewChange={setActiveView}
      personId={personId}
      vacationPlans={vacationPlans}
    />
  );

  // Render current view
  const renderCurrentView = () => {
    const viewProps = {
      'aria-live': 'polite' as const,
      role: 'region' as const,
      'aria-label': `${activeView === 'holidays' ? 'Feiertage' :
                     activeView === 'school' ? 'Schulferien' :
                     activeView === 'bridge' ? 'Brückentage' :
                     activeView === 'planning' ? 'Planung' : 'Kalender'} Ansicht`
    };

    const contentProps = {
      role: 'region' as const,
      'aria-label': 'Inhalt'
    };

    // Wrap the view content with motion.div for transitions
    const renderView = (content: React.ReactNode) => (
      <motion.div
        className="h-full flex flex-col"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        {...viewProps}
      >
        <div className="flex-1 overflow-y-auto" {...contentProps}>
          {content}
        </div>
      </motion.div>
    );

    if (isLoading) {
      return renderView(<ViewSkeleton />);
    }

    if (error) {
      return renderView(<ErrorView error={error} />);
    }

    switch (activeView) {
      case 'holidays':
        return renderView(
          <MobileHolidaysView
            holidays={publicHolidays}
            personId={personId}
            onHolidaySelect={handleHolidaySelect}
          />
        );
      case 'school':
        return renderView(
          <MobileSchoolHolidaysView
            schoolHolidays={schoolHolidays}
            personId={personId}
            onHolidaySelect={handleHolidaySelect}
          />
        );
      case 'bridge':
        return renderView(
          <MobileBridgeDaysView
            holidays={holidays}
            vacations={vacationPlans}
            onSelectBridgeDay={handleAddVacation}
            personId={personId}
            state={selectedState}
            availableVacationDays={availableVacationDays}
          />
        );
      case 'planning':
        return renderView(
          <MobilePlanningView
            vacationPlans={vacationPlans}
            onRemoveVacation={handleRemoveVacation}
            availableVacationDays={availableVacationDays}
            personId={personId}
            holidays={holidays}
            otherPersonVacations={otherPersonVacations}
          />
        );
      case 'calendar':
      default:
        return renderView(
          <MobileCalendarView
            holidays={holidays}
            bridgeDays={bridgeDays}
            vacationPlans={vacationPlans}
            onAddVacation={handleAddVacation}
            onRemoveVacation={handleRemoveVacation}
            personId={personId}
            otherPersonVacations={otherPersonVacations}
            initialDate={selectedDate}
          />
        );
    }
  };

  return (
    <MobileLayout
      header={header}
      stateSelector={stateSelector}
      vacationCounter={vacationCounter}
      viewTabs={viewTabs}
      actionBar={null}
      efficiency={efficiency}
      personId={personId}
      vacationPlans={vacationPlans}
      holidays={holidays}
    >
      <AnimatePresence mode="wait">
        {renderCurrentView()}
      </AnimatePresence>
      <TutorialModal
        isOpen={showTutorial}
        onClose={handleTutorialClose}
      />
      <MobileExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </MobileLayout>
  );
}; 