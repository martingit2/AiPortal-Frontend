import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import './App.css'; // Du kan beholde eller endre denne for global app-styling

// Placeholder for sider som Clerk vil bruke/omdirigere til
const SignInPage: React.FC = () => <div>Logg inn her (Clerk vil håndtere dette)</div>;
const SignUpPage: React.FC = () => <div>Registrer deg her (Clerk vil håndtere dette)</div>;
const DashboardPage: React.FC = () => <div>Velkommen til ditt Dashboard! (Beskyttet)</div>;


function App() {
  return (
    <>
      {/* Navigasjon kan flyttes til en egen Navbar-komponent senere */}
      {/* Foreløpig holder vi den enkel eller lar landingssiden ha sin egen header */}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} /> {/* Clerk bruker ofte * for sub-ruter */}
        <Route path="/sign-up/*" element={<SignUpPage />} /> {/* Clerk bruker ofte * for sub-ruter */}
        <Route path="/dashboard" element={<DashboardPage />} /> {/* Denne vil vi beskytte senere */}
        {/* Du kan legge til en 404-side her også:
        <Route path="*" element={<div>Side ikke funnet</div>} />
        */}
      </Routes>
    </>
  );
}

export default App;