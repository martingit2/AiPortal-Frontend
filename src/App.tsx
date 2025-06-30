import React from 'react';
import { Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

import './App.css';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/dashboard/DashboardPage';

// Lag en enkel placeholder for de andre sidene
const AnalysesPage: React.FC = () => <h2>Mine Analyser</h2>;
const BotsPage: React.FC = () => <h2>Mine Boter</h2>;
const ModelsPage: React.FC = () => <h2>Mine Modeller</h2>;
const SettingsPage: React.FC = () => <h2>Innstillinger</h2>;

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Beskyttet rute som bruker DashboardLayout */}
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <DashboardLayout />
              </SignedIn>
              <SignedOut>
                <Navigate to="/" replace /> 
              </SignedOut>
            </>
          }
        >
          {/* "Nested" ruter. Disse vil bli rendret inne i DashboardLayout's <Outlet /> */}
          <Route index element={<DashboardPage />} /> {/* Vises på /dashboard */}
          <Route path="analyser" element={<AnalysesPage />} /> {/* Vises på /dashboard/analyser */}
          <Route path="boter" element={<BotsPage />} /> {/* Vises på /dashboard/boter */}
          <Route path="modeller" element={<ModelsPage />} /> {/* Vises på /dashboard/modeller */}
          <Route path="innstillinger" element={<SettingsPage />} /> {/* Vises på /dashboard/innstillinger */}
        </Route>

        <Route 
          path="*" 
          element={
            <div style={{ textAlign: 'center', padding: '5rem', fontFamily: 'sans-serif' }}>
              <h2>404 - Side ikke funnet</h2>
              <p>Beklager, vi fant ikke siden du lette etter.</p>
              <Link to="/" style={{color: 'var(--primary-purple)', textDecoration:'underline'}}>Tilbake til forsiden</Link>
            </div>
          } 
        />
      </Routes>
    </>
  );
}

export default App;