import React from 'react';
import { StateSelect } from '../StateSelect';
import { GermanState } from '../../types/GermanState';
import styles from './AppNavbar.module.css';

interface AppNavbarProps {
  selectedState: GermanState | null;
  onStateChange: (state: GermanState | null) => void;
  onTogglePerson2: () => void;
  showPerson2: boolean;
  onShowTutorial: () => void;
  onExport: () => void;
  person2State?: GermanState | null;
  onPerson2StateChange?: (state: GermanState | null) => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  selectedState,
  onStateChange,
  onTogglePerson2,
  showPerson2,
  onShowTutorial,
  onExport,
  person2State,
  onPerson2StateChange
}) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        {/* Logo section */}
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <img src="/favicon.svg" alt="Logo" className={styles.logoImage} />
            <span className={styles.logoText}>Holiday Planner</span>
          </div>
        </div>

        {/* Main controls section */}
        <div className={styles.mainControls}>
          {/* Person 1 state selection */}
          <div className={styles.stateSelection}>
            <span className={styles.stateLabel}>Bundesland auswählen</span>
            <StateSelect
              selectedState={selectedState}
              onStateChange={onStateChange}
              placeholder="Bundesland für Person 1"
            />
          </div>

          {/* Year display */}
          <div className={styles.yearDisplay}>
            <span className={styles.year}>2025</span>
          </div>

          {/* Person 2 controls */}
          <div className={styles.person2Controls}>
            <button
              onClick={onTogglePerson2}
              className={`${styles.iconButton} ${showPerson2 ? styles.active : ''}`}
              aria-label="2. Person ein/ausblenden"
              title="2. Person ein/ausblenden"
            >
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
              <span className={styles.buttonText}>2. Person</span>
            </button>

            {/* Person 2 state selection */}
            {showPerson2 && onPerson2StateChange && (
              <div className={styles.stateSelection}>
                <StateSelect
                  selectedState={person2State ?? null}
                  onStateChange={onPerson2StateChange}
                  placeholder="Bundesland für Person 2"
                />
              </div>
            )}
          </div>

          {/* Additional controls */}
          <div className={styles.additionalControls}>
            <button
              onClick={onShowTutorial}
              className={styles.iconButton}
              aria-label="Tutorial anzeigen"
              title="Tutorial anzeigen"
            >
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </button>

            <button
              onClick={onExport}
              className={styles.iconButton}
              aria-label="Kalender exportieren"
              title="Kalender exportieren"
            >
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}; 