import React from 'react';
import { usePersonContext } from '../contexts/PersonContext';
import Calendar from '../components/Calendar/Calendar';
import { useBridgeDays } from '../hooks/useBridgeDays';

interface HomePageProps {
  isSelectingVacation?: boolean;
  onVacationSelectComplete?: () => void;
  selectedPersonId?: 1 | 2;
  onShowRecommendations?: (personId: 1 | 2) => void;
  year?: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  isSelectingVacation = false,
  onVacationSelectComplete,
  selectedPersonId = 1,
  onShowRecommendations,
  year = new Date().getFullYear()
}) => {
  const { persons, addVacationPlan, deleteVacationPlan } = usePersonContext();
  const { 
    holidays: person1Holidays, 
    bridgeDays: person1BridgeDays, 
    isLoading: isFirstStateLoading 
  } = useBridgeDays(persons.person1?.selectedState || null, year);
  const { 
    holidays: person2Holidays, 
    bridgeDays: person2BridgeDays, 
    isLoading: isSecondStateLoading 
  } = useBridgeDays(persons.person2?.selectedState || null, year);

  const isLoading = isFirstStateLoading || (persons.person2 && isSecondStateLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Lade Feiertage...</div>
      </div>
    );
  }

  if (!persons.person1?.selectedState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Bitte wählen Sie ein Bundesland aus.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Calendar
        state={persons.person1.selectedState}
        secondState={persons.person2?.selectedState || null}
        holidays={person1Holidays || []}
        secondStateHolidays={person2Holidays || []}
        bridgeDays={person1BridgeDays || []}
        secondStateBridgeDays={person2BridgeDays || []}
        vacationPlans={persons.person1.vacationPlans || []}
        secondStateVacationPlans={persons.person2?.vacationPlans || []}
        onAddVacation={(plan) => {
          addVacationPlan(selectedPersonId, plan);
          if (onVacationSelectComplete) {
            onVacationSelectComplete();
          }
        }}
        onDeleteVacation={(personId, index) => {
          const plans = personId === 1 ? persons.person1.vacationPlans : persons.person2?.vacationPlans || [];
          const planId = plans[index]?.id;
          if (planId) {
            deleteVacationPlan(personId, planId);
          }
        }}
        vacationCount={{
          person1: persons.person1.vacationPlans.length,
          person2: persons.person2?.vacationPlans.length || 0
        }}
        personId={selectedPersonId}
        isSelectingVacation={isSelectingVacation}
        onVacationSelectComplete={onVacationSelectComplete}
        onShowRecommendations={onShowRecommendations}
        year={year}
      />
    </div>
  );
};

export default HomePage; 