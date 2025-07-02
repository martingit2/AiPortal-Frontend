// src/App.tsx
import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';

// Importer hovedkomponenter/layouts
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';

// Importer alle sidene som skal vises inne i dashboardet
;
import BotsPage from './pages/dashboard/BotsPage';
import DataFeedPage from './pages/dashboard/DataFeedPage';
import AnalysesPage from './pages/dashboard/AnalysesPage'; // Importerer den nye siden

// Importer Clerk-komponenter for autentiseringssjekk
import { SignedIn, SignedOut } from '@clerk/clerk-react';

import './App.css';
import DashboardPage from './pages/dashboard/DashboardPage';

// Placeholder for sider som ikke er fullt implementert ennå
const ModelsPage: React.FC = () => <h1 className="dashboard-page-title">Mine Modeller (kommer snart)</h1>;
const SettingsPage: React.FC = () => <h1 className="dashboard-page-title">Innstillinger (kommer snart)</h1>;

function App() {
  return (
    <>
      <Routes>
        {/* Offentlig rute for landingssiden */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Beskyttet rute for hele dashboardet som bruker DashboardLayout */}
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
          {/* "Nested" ruter */}
          <Route index element={<DashboardPage />} />
          <Route path="analyser" element={<AnalysesPage />} />
          <Route path="boter" element={<BotsPage />} />
          <Route path="data-feed" element={<DataFeedPage />} />
          <Route path="modeller" element={<ModelsPage />} />
          <Route path="innstillinger" element={<SettingsPage />} />
        </Route>

        {/* Catch-all rute for 404 - sider som ikke finnes */}
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