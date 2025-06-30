import React from 'react';
import { Outlet } from 'react-router-dom'; // VIKTIG for å vise "nested" ruter

import { UserButton } from '@clerk/clerk-react';
import './DashboardLayout.css'; // Dedikert CSS for layouten
import Sidebar from '../components/Sidebar';

const DashboardLayout: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar
       />
      <div className="dashboard-main-content">
        <header className="dashboard-header">
          {/* Du kan ha en global søkeboks eller andre elementer her */}
          <div className="header-spacer"></div> {/* For å skyve UserButton til høyre */}
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="dashboard-page-content">
          <Outlet /> {/* Her vil DashboardHomePage, AnalysesPage etc. bli rendret */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;