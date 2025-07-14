// src/components/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom'; // Bruk NavLink for aktiv-state styling
import { LayoutDashboard, BarChart3, Bot, BrainCircuit, Settings, MessageSquare, PieChart, Target, CalendarClock, ListChecks } from 'lucide-react';
import './Sidebar.css'; // Dedikert CSS for sidebaren

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Aracanix
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end> {/* 'end' prop sikrer at denne kun er aktiv på nøyaktig /dashboard */}
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
        <NavLink to="/dashboard/data-feed"> {/* NY LENKE */}
          <MessageSquare size={20} />
          <span>Data Feed</span>
        </NavLink>
        <NavLink to="/dashboard/modeller">
          <BrainCircuit size={20} />
          <span>Modeller</span>
        </NavLink>
        <NavLink to="/dashboard/fotball-stats">
          <PieChart size={20} />
          <span>Fotball-stats</span>
        </NavLink>
        <NavLink to="/dashboard/odds-analyse">
          <Target size={20} />
          <span>Oddsanalyse</span>
        </NavLink>
        <NavLink to="/dashboard/fixtures">
        <CalendarClock size={20} />
        <span>Kamper</span>
        </NavLink>
        <NavLink to="/dashboard/upcoming-odds"> 
          <ListChecks size={20} />
          <span>Kommende Odds</span>
        </NavLink>
        
        {/* Skillelinje for å separere hovednavigasjon fra innstillinger etc. */}
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