// src/App.tsx
import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import './App.css';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const DashboardPage: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Velkommen til ditt Aracanix Dashboard!</h1>
        <UserButton afterSignOutUrl="/" />
      </div>
      <p>Dette er en beskyttet side, kun tilgjengelig for innloggede brukere.</p>
      <p>Her vil du kunne kontrollere boter, AI-modeller, se analyser og statistikk.</p>
    </div>
  );
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Vi har fjernet /sign-in og /sign-up rutene her.
            Clerk vil nå enten bruke sine hostede sider hvis en full omdirigering skjer,
            eller bare vise modalen uten å matche en spesifikk React Router-rute.
        */}
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <DashboardPage />
              </SignedIn>
              <SignedOut>
                {/* Hvis brukeren ikke er logget inn og prøver å nå /dashboard,
                    vil Clerk sin <SignedIn>/<SignedOut> logikk ofte håndtere
                    omdirigering til pålogging (enten modal eller hostet side).
                    En <Navigate to="/" /> er en trygg fallback her for å sende dem til forsiden.
                */}
                <Navigate to="/" replace />
              </SignedOut>
            </>
          }
        />
        <Route 
          path="*" 
          element={
            <div style={{ textAlign: 'center', padding: '5rem' }}>
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