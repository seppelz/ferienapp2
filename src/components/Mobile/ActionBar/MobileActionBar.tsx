import React, { useState } from 'react';
import { exportService } from '../../../services/exportService';
import { VacationPlan } from '../../../types/vacationPlan';
import { Holiday } from '../../../types/holiday';
import { MobileExportModal } from '../Export/MobileExportModal';

interface MobileActionBarProps {
  onAddVacation: () => void;
  personId: 1 | 2;
  vacationPlans?: VacationPlan[];
  holidays?: Holiday[];
  otherPersonVacations?: VacationPlan[];
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({
  onAddVacation,
  personId,
  vacationPlans = [],
  holidays = [],
  otherPersonVacations = []
}) => {
  const [showExportModal, setShowExportModal] = useState(false);

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

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-around items-center z-40">
        <button
          onClick={onAddVacation}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors"
          aria-label="Urlaub hinzufügen"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Urlaub</span>
        </button>

        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg active:bg-gray-200 transition-colors"
          aria-label="Exportieren"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export</span>
        </button>
      </div>

      <MobileExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </>
  );
}; 