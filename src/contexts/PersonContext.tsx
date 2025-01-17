import React, { createContext, useContext, useState, useEffect } from 'react';
import { GermanState } from '../types/GermanState';
import { Person, PersonInfo } from '../types/person';
import { VacationPlan } from '../types/vacationPlan';
import { usePersonStorage } from '../hooks/usePersonStorage';
import { useNotification } from './NotificationContext';
import { calculateVacationEfficiency } from '../utils/vacationEfficiency';

interface PersonContextType {
  persons: PersonInfo;
  isLoading: boolean;
  error: Error | null;
  updatePerson: (personId: 1 | 2, updates: Partial<Person>) => Promise<void>;
  addVacationPlan: (personId: 1 | 2, plan: Omit<VacationPlan, 'id' | 'personId'>) => Promise<void>;
  updateVacationPlan: (personId: 1 | 2, planId: string, updates: Partial<Omit<VacationPlan, 'id' | 'personId'>>) => Promise<void>;
  deleteVacationPlan: (personId: 1 | 2, planId: string) => Promise<void>;
  clearPersons: () => Promise<void>;
}

export const PersonContext = createContext<PersonContextType | null>(null);

export const usePersonContext = () => {
  const context = useContext(PersonContext);
  if (!context) {
    throw new Error('usePersonContext must be used within a PersonProvider');
  }
  return context;
};

const DEFAULT_PERSON_INFO: PersonInfo = {
  person1: {
    id: 1,
    selectedState: GermanState.BE,
    availableVacationDays: 30,
    vacationPlans: []
  },
  person2: null
};

export const PersonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { savePersons, loadPersons, clearPersons: clearStorage } = usePersonStorage();
  const { showNotification } = useNotification();
  const [persons, setPersons] = useState<PersonInfo>(DEFAULT_PERSON_INFO);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const savedPersons = await loadPersons();
        if (savedPersons) {
          setPersons(savedPersons);
        } else {
          // Set default state when no data is found
          setPersons({
            person1: {
              id: 1,
              selectedState: GermanState.BE,
              availableVacationDays: 30,
              vacationPlans: []
            },
            person2: null
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
        showNotification('Fehler beim Laden der Daten', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const updatePerson = async (personId: 1 | 2, updates: Partial<Person>) => {
    try {
      setPersons(prev => {
        const newPersons: PersonInfo = personId === 2 && prev.person2 === null
          ? {
              ...prev,
              person2: {
                id: 2 as const,
                selectedState: updates.selectedState || prev.person1.selectedState,
                availableVacationDays: updates.availableVacationDays || 30,
                vacationPlans: [],
                ...updates
              }
            }
          : {
              ...prev,
              [`person${personId}`]: {
                ...prev[`person${personId}`],
                ...updates
              } as Person
            };
        
        // Save asynchronously
        savePersons(newPersons).catch(err => {
          showNotification('Fehler beim Speichern', 'error');
          console.error('Failed to save persons:', err);
        });
        
        return newPersons;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update person'));
      showNotification('Fehler beim Aktualisieren', 'error');
      throw err;
    }
  };

  const isDateRangeOverlapping = (start1: Date, end1: Date, start2: Date, end2: Date) => {
    return start1 <= end2 && end1 >= start2;
  };

  const isDateRangeInside = (innerStart: Date, innerEnd: Date, outerStart: Date, outerEnd: Date) => {
    return innerStart >= outerStart && innerEnd <= outerEnd;
  };

  const findOverlappingVacation = (
    personId: 1 | 2,
    start: Date,
    end: Date,
    excludePlanId?: string
  ): VacationPlan | null => {
    const existingPlans = persons[`person${personId}`]?.vacationPlans || [];
    return existingPlans.find(plan => 
      plan.id !== excludePlanId && 
      isDateRangeOverlapping(start, end, plan.start, plan.end)
    ) || null;
  };

  const addVacationPlan = async (personId: 1 | 2, plan: Omit<VacationPlan, 'id' | 'personId'>) => {
    try {
      setPersons(prev => {
        const existingPlans = prev[`person${personId}`]?.vacationPlans || [];
        
        // Check if the new vacation is completely inside an existing one
        const isInsideExisting = existingPlans.some(existingPlan =>
          isDateRangeInside(plan.start, plan.end, existingPlan.start, existingPlan.end)
        );

        if (isInsideExisting) {
          showNotification('Diese Urlaubstage sind bereits vollständig in einem bestehenden Urlaub enthalten.', 'warning');
          return prev;
        }

        // Find any overlapping vacation
        const overlappingPlan = findOverlappingVacation(personId, plan.start, plan.end);

        if (overlappingPlan) {
          showNotification('Überlappende Urlaubstage werden automatisch zusammengeführt.', 'info');
          // Merge the vacations by extending the date range
          const mergedPlan = calculateVacationEfficiency({
            ...overlappingPlan,
            start: new Date(Math.min(plan.start.getTime(), overlappingPlan.start.getTime())),
            end: new Date(Math.max(plan.end.getTime(), overlappingPlan.end.getTime()))
          });

          // Replace the overlapping plan with the merged one
          const updatedPlans = existingPlans
            .filter(p => p.id !== overlappingPlan.id)
            .concat(mergedPlan);

          // Sort by start date
          const sortedPlans = updatedPlans.sort((a, b) => 
            a.start.getTime() - b.start.getTime()
          );

          const newPersons = {
            ...prev,
            [`person${personId}`]: {
              ...prev[`person${personId}`],
              vacationPlans: sortedPlans
            } as Person
          };
          
          // Save asynchronously
          savePersons(newPersons).catch(err => {
            showNotification('Fehler beim Speichern', 'error');
            console.error('Failed to save vacation plan:', err);
          });
          
          return newPersons;
        }

        // No overlap, add as new vacation
        const newPlan = calculateVacationEfficiency({
          ...plan,
          id: Math.random().toString(36).substr(2, 9),
          personId
        });
        
        // Add new plan and sort all plans by start date
        const sortedPlans = [...existingPlans, newPlan].sort((a, b) => 
          a.start.getTime() - b.start.getTime()
        );

        const newPersons = {
          ...prev,
          [`person${personId}`]: {
            ...prev[`person${personId}`],
            vacationPlans: sortedPlans
          } as Person
        };
        
        // Save asynchronously
        savePersons(newPersons).catch(err => {
          showNotification('Fehler beim Speichern', 'error');
          console.error('Failed to save vacation plan:', err);
        });
        
        return newPersons;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add vacation plan'));
      showNotification('Fehler beim Hinzufügen des Urlaubs', 'error');
      throw err;
    }
  };

  const updateVacationPlan = async (
    personId: 1 | 2,
    planId: string,
    updates: Partial<Omit<VacationPlan, 'id' | 'personId'>>
  ) => {
    try {
      setPersons(prev => {
        const existingPlans = prev[`person${personId}`]?.vacationPlans || [];
        const currentPlan = existingPlans.find(p => p.id === planId);
        
        if (!currentPlan) return prev;

        const updatedPlan = calculateVacationEfficiency({ ...currentPlan, ...updates });

        // Check if the updated vacation would be completely inside another existing one
        const isInsideExisting = existingPlans.some(existingPlan =>
          existingPlan.id !== planId &&
          isDateRangeInside(updatedPlan.start, updatedPlan.end, existingPlan.start, existingPlan.end)
        );

        if (isInsideExisting) {
          showNotification('Diese Urlaubstage wären vollständig in einem bestehenden Urlaub enthalten.', 'warning');
          return prev;
        }

        // Find any overlapping vacation (excluding the current plan)
        const overlappingPlan = findOverlappingVacation(personId, updatedPlan.start, updatedPlan.end, planId);

        if (overlappingPlan) {
          showNotification('Überlappende Urlaubstage werden automatisch zusammengeführt.', 'info');
          // Merge the vacations by extending the date range
          const mergedPlan = calculateVacationEfficiency({
            ...overlappingPlan,
            start: new Date(Math.min(updatedPlan.start.getTime(), overlappingPlan.start.getTime())),
            end: new Date(Math.max(updatedPlan.end.getTime(), overlappingPlan.end.getTime()))
          });

          // Remove both plans and add the merged one
          const updatedPlans = existingPlans
            .filter(p => p.id !== planId && p.id !== overlappingPlan.id)
            .concat(mergedPlan);

          // Sort by start date
          const sortedPlans = updatedPlans.sort((a, b) => 
            a.start.getTime() - b.start.getTime()
          );

          const newPersons = {
            ...prev,
            [`person${personId}`]: {
              ...prev[`person${personId}`],
              vacationPlans: sortedPlans
            } as Person
          };
          
          // Save asynchronously
          savePersons(newPersons).catch(err => {
            showNotification('Fehler beim Speichern', 'error');
            console.error('Failed to update vacation plan:', err);
          });
          
          return newPersons;
        }

        // No overlap, just update the plan
        const updatedPlans = existingPlans.map(plan =>
          plan.id === planId ? updatedPlan : plan
        );

        // Sort by start date
        const sortedPlans = updatedPlans.sort((a, b) => 
          a.start.getTime() - b.start.getTime()
        );

        const newPersons = {
          ...prev,
          [`person${personId}`]: {
            ...prev[`person${personId}`],
            vacationPlans: sortedPlans
          } as Person
        };
        
        // Save asynchronously
        savePersons(newPersons).catch(err => {
          showNotification('Fehler beim Speichern', 'error');
          console.error('Failed to update vacation plan:', err);
        });
        
        return newPersons;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update vacation plan'));
      showNotification('Fehler beim Aktualisieren des Urlaubs', 'error');
      throw err;
    }
  };

  const deleteVacationPlan = async (personId: 1 | 2, planId: string) => {
    try {
      setPersons(prev => {
        const newPersons = {
          ...prev,
          [`person${personId}`]: {
            ...prev[`person${personId}`],
            vacationPlans: prev[`person${personId}`]?.vacationPlans.filter(plan => plan.id !== planId)
          } as Person
        };
        
        // Save asynchronously
        savePersons(newPersons).catch(err => {
          showNotification('Fehler beim Speichern', 'error');
          console.error('Failed to delete vacation plan:', err);
        });
        
        return newPersons;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete vacation plan'));
      showNotification('Fehler beim Löschen des Urlaubs', 'error');
      throw err;
    }
  };

  const clearPersons = async () => {
    try {
      await clearStorage();
      setPersons(DEFAULT_PERSON_INFO);
      showNotification('Alle Daten wurden zurückgesetzt', 'success');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to clear data'));
      showNotification('Fehler beim Zurücksetzen der Daten', 'error');
      throw err;
    }
  };

  return (
    <PersonContext.Provider
      value={{
        persons,
        isLoading,
        error,
        updatePerson,
        addVacationPlan,
        updateVacationPlan,
        deleteVacationPlan,
        clearPersons
      }}
    >
      {children}
    </PersonContext.Provider>
  );
}; 