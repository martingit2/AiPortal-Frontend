// src/App.tsx
import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';

// Importer hovedkomponenter/layouts
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';

// Importer alle sidene som skal vises inne i dashboardet

import BotsPage from './pages/dashboard/BotsPage';
import DataFeedPage from './pages/dashboard/DataFeedPage'; // <-- Importerer den nye Data Feed-siden

// Importer Clerk-komponenter for autentiseringssjekk
import { SignedIn, SignedOut } from '@clerk/clerk-react';

import './App.css';
import DashboardPage from './pages/dashboard/DashboardPage';

// Placeholder for sider som ikke er fullt implementert ennå
const AnalysesPage: React.FC = () => <h1 className="dashboard-page-title">Mine Analyser (kommer snart)</h1>;
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
          {/* 
            "Nested" ruter. 
            Disse vil bli rendret inne i DashboardLayout's <Outlet />-komponent.
          */}
          <Route index element={<DashboardPage />} /> {/* Vises på /dashboard */}
          <Route path="analyser" element={<AnalysesPage />} />  {/* Vises på /dashboard/analyser */}
          <Route path="boter" element={<BotsPage />} />      {/* Vises på /dashboard/boter */}
          <Route path="data-feed" element={<DataFeedPage />} />  {/* Vises på /dashboard/data-feed */}
          <Route path="modeller" element={<ModelsPage />} />  {/* Vises på /dashboard/modeller */}
          <Route path="innstillinger" element={<SettingsPage />} /> {/* Vises på /dashboard/innstillinger */}
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