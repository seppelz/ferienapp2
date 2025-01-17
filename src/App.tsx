import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MainLayout } from './layouts/MainLayout';
import { PersonProvider } from './contexts/PersonContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  // Use /app basename only in production
  const basename = import.meta.env.DEV ? '' : '/app';
  
  return (
    <HelmetProvider>
      <Router basename={basename}>
        <NotificationProvider>
          <PersonProvider>
            <Routes>
              <Route path="/" element={<MainLayout />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </PersonProvider>
        </NotificationProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
