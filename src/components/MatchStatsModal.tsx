// src/components/MatchStatsModal.tsx

import React from 'react';
import { X } from 'lucide-react';
import './MatchStatsModal.css';
import type { MatchStat } from '../types';


// FJERN DEN LOKALE MatchStat-DEFINISJONEN HERFRA

interface MatchStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: MatchStat[];
  fixtureInfo: { homeTeamName: string; awayTeamName: string };
}

// Hjelpekomponent for å lage en rad i tabellen
const StatRow: React.FC<{ label: string; home: any; away: any }> = ({ label, home, away }) => {
  // Trygt håndtere null/undefined-verdier
  const homeValue = home ?? 'N/A';
  const awayValue = away ?? 'N/A';
  
  // Prøv å konvertere til tall for sammenligning, men håndter strenger som "55%"
  const homeNum = parseInt(homeValue, 10);
  const awayNum = parseInt(awayValue, 10);
  
  const homeClass = !isNaN(homeNum) && !isNaN(awayNum) && homeNum > awayNum ? 'winner' : '';
  const awayClass = !isNaN(homeNum) && !isNaN(awayNum) && awayNum > homeNum ? 'winner' : '';

  return (
    <tr>
      <td className={homeClass}>{homeValue}</td>
      <th>{label}</th>
      <td className={awayClass}>{awayValue}</td>
    </tr>
  );
};


const MatchStatsModal: React.FC<MatchStatsModalProps> = ({ isOpen, onClose, stats, fixtureInfo }) => {
  if (!isOpen) return null;

  // Sorterer for å sikre at vi alltid har hjemme- og bortelag riktig
  const homeStats = stats.find(s => s.teamName === fixtureInfo.homeTeamName);
  const awayStats = stats.find(s => s.teamName === fixtureInfo.awayTeamName);

  // Hvis en av statistikkene mangler, vis en ladetilstand eller feilmelding
  if (!homeStats || !awayStats) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="stats-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="stats-modal-header">
            <h2>Kampdetaljer</h2>
            <button className="close-button" onClick={onClose}><X size={24} /></button>
          </div>
          <p>Laster statistikk eller data er ikke tilgjengelig...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="stats-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="stats-modal-header">
          <h2>Kampdetaljer</h2>
          <button className="close-button" onClick={onClose}><X size={24} /></button>
        </div>
        <div className="teams-header">
          <h3>{homeStats.teamName}</h3>
          <span>vs</span>
          <h3>{awayStats.teamName}</h3>
        </div>
        <table className="stats-comparison-table">
          <tbody>
            <StatRow label="Ballbesittelse" home={homeStats.ballPossession} away={awayStats.ballPossession} />
            <StatRow label="Skudd på mål" home={homeStats.shotsOnGoal} away={awayStats.shotsOnGoal} />
            <StatRow label="Skudd utenfor" home={homeStats.shotsOffGoal} away={awayStats.shotsOffGoal} />
            <StatRow label="Totalt antall skudd" home={homeStats.totalShots} away={awayStats.totalShots} />
            <StatRow label="Blokkerte skudd" home={homeStats.blockedShots} away={awayStats.blockedShots} />
            <StatRow label="Hjørnespark" home={homeStats.cornerKicks} away={awayStats.cornerKicks} />
            <StatRow label="Frispark" home={homeStats.fouls} away={awayStats.fouls} />
            <StatRow label="Offsides" home={homeStats.offsides} away={awayStats.offsides} />
            <StatRow label="Keeperredninger" home={homeStats.goalkeeperSaves} away={awayStats.goalkeeperSaves} />
            <StatRow label="Gule kort" home={homeStats.yellowCards} away={awayStats.yellowCards} />
            <StatRow label="Røde kort" home={homeStats.redCards} away={awayStats.redCards} />
            <StatRow label="Vellykkede pasninger" home={`${homeStats.passesAccurate} (${homeStats.passesPercentage})`} away={`${awayStats.passesAccurate} (${awayStats.passesPercentage})`} />
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchStatsModal;