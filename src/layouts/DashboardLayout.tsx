import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Searchbar from '../components/Searchbar';
import { UserButton } from '@clerk/clerk-react';
import './DashboardLayout.css';

const DashboardLayout: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main-content">
        <header className="dashboard-header">
          {/* Ingen tom div her lenger */}
          <Searchbar />
          <div className="user-button-wrapper">
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="dashboard-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;