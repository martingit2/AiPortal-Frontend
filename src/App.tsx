// src/App.tsx
import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage'; // <--- IMPORTER DEN NYE FILEN
import './App.css';
import { SignedIn, SignedOut } from '@clerk/clerk-react'; // UserButton er ikke lenger nødvendig her

// DashboardPage-komponenten er nå fjernet fra denne filen.

function App() {
  return (
    <>
      {/* Ingen global header her, siden hver side (LandingPage, DashboardPage) håndterer sin egen. */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Beskyttet rute for Dashboard */}
        <Route
          path="/dashboard"
          element={
            <>
              {/* Viser DashboardPage kun hvis brukeren er logget inn */}
              <SignedIn>
                <DashboardPage />
              </SignedIn>
              {/* Omdirigerer til forsiden hvis brukeren ikke er logget inn */}
              <SignedOut>
                <Navigate to="/" replace /> 
              </SignedOut>
            </>
          }
        />

        {/* Catch-all rute for 404-sider */}
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