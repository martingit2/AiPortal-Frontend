import React from 'react';
import { NavLink } from 'react-router-dom'; // Bruk NavLink for aktiv-state styling
import { LayoutDashboard, BarChart3, Bot, BrainCircuit, Settings } from 'lucide-react';
import './Sidebar.css'; // Dedikert CSS for sidebaren

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Aracanix {/* Du kan også ha en logo-ikon her */}
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end> {/* 'end' prop er viktig for rot-lenken */}
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/dashboard/analyser">
          <BarChart3 size={20} />
          <span>Analyser</span>
        </NavLink>
        <NavLink to="/dashboard/boter">
          <Bot size={20} />
          <span>Boter</span>
        </NavLink>
        <NavLink to="/dashboard/modeller">
          <BrainCircuit size={20} />
          <span>Modeller</span>
        </NavLink>
        {/* Skillelinje */}
        <hr className="sidebar-divider" /> 
        <NavLink to="/dashboard/innstillinger">
          <Settings size={20} />
          <span>Innstillinger</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;