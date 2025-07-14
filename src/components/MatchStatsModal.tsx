// src/components/MatchStatsModal.tsx

import React, { useState } from 'react';
import { RefreshCw, X, Users, BarChart } from 'lucide-react';
import './MatchStatsModal.css';
import type { MatchStat, PlayerMatchStat } from '../types';

interface MatchStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamStats: MatchStat[];
  playerStats: PlayerMatchStat[];
  fixtureInfo: { homeTeamName: string; awayTeamName: string };
  isLoading: boolean;
}

const TeamComparison: React.FC<{ teamStats: MatchStat[]; fixtureInfo: { homeTeamName: string; awayTeamName: string }; }> = ({ teamStats, fixtureInfo }) => {
  const homeStats = teamStats.find(s => s.teamName === fixtureInfo.homeTeamName);
  const awayStats = teamStats.find(s => s.teamName === fixtureInfo.awayTeamName);

  if (!homeStats || !awayStats) {
    return <p>Lagstatistikk er ikke tilgjengelig.</p>;
  }
  
  const StatRow: React.FC<{ label: string; home: any; away: any }> = ({ label, home, away }) => {
    const homeValue = home ?? 'N/A';
    const awayValue = away ?? 'N/A';
    const homeNum = parseInt(String(homeValue).replace('%', ''));
    const awayNum = parseInt(String(awayValue).replace('%', ''));
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
  
  return (
    <>
      <div className="teams-header">
        <h3>{homeStats.teamName}</h3>
        <span>vs</span>
        <h3>{awayStats.teamName}</h3>
      </div>
      <table className="stats-comparison-table">
        <tbody>
          <StatRow label="Ballbesittelse" home={homeStats.ballPossession} away={awayStats.ballPossession} />
          <StatRow label="Skudd på mål" home={homeStats.shotsOnGoal} away={awayStats.shotsOnGoal} />
          <StatRow label="Skudd totalt" home={homeStats.totalShots} away={awayStats.totalShots} />
          <StatRow label="Hjørnespark" home={homeStats.cornerKicks} away={awayStats.cornerKicks} />
          <StatRow label="Frispark" home={homeStats.fouls} away={awayStats.fouls} />
          <StatRow label="Keeperredninger" home={homeStats.goalkeeperSaves} away={awayStats.goalkeeperSaves} />
          <StatRow label="Gule kort" home={homeStats.yellowCards} away={awayStats.yellowCards} />
        </tbody>
      </table>
    </>
  );
};

const PlayerRatings: React.FC<{ playerStats: PlayerMatchStat[]; fixtureInfo: { homeTeamName: string; awayTeamName: string; }; }> = ({ playerStats, fixtureInfo }) => {
    // Finner teamId for et av lagene for å kunne splitte spillerne korrekt
    const homeTeamId = playerStats.find(p => p.teamId)?.teamId;
    const homePlayers = playerStats.filter(p => p.teamId === homeTeamId).sort((a,b) => (a.substitute ? 1 : -1) - (b.substitute ? 1 : -1));
    const awayPlayers = playerStats.filter(p => p.teamId !== homeTeamId).sort((a,b) => (a.substitute ? 1 : -1) - (b.substitute ? 1 : -1));

    const renderPlayerTable = (players: PlayerMatchStat[]) => (
        <table className="player-stats-table">
          <thead>
            <tr>
              <th>Spiller</th>
              <th className="numeric">Rating</th>
              <th className="numeric">Mål</th>
              <th className="numeric">Assists</th>
              <th className="numeric">Skudd</th>
              <th className="numeric">Min</th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.playerId} style={{ opacity: p.substitute ? 0.7 : 1 }}>
                <td>{p.playerName}{p.captain && ' (C)'}</td>
                <td className="numeric rating">{p.rating || '-'}</td>
                <td className="numeric">{p.goalsTotal}</td>
                <td className="numeric">{p.assists}</td>
                <td className="numeric">{p.shotsTotal}</td>
                <td className="numeric">{p.minutesPlayed}</td>
              </tr>
            ))}
          </tbody>
        </table>
    );
    
    if (playerStats.length === 0) {
        return <p>Spillerstatistikk er ikke tilgjengelig for denne kampen.</p>;
    }

    return (
        <div className="player-stats-grid">
            <div className="team-player-list">
                <h4>{fixtureInfo.homeTeamName}</h4>
                {renderPlayerTable(homePlayers)}
            </div>
            <div className="team-player-list">
                <h4>{fixtureInfo.awayTeamName}</h4>
                {renderPlayerTable(awayPlayers)}
            </div>
        </div>
    );
};

const MatchStatsModal: React.FC<MatchStatsModalProps> = ({ isOpen, onClose, teamStats, playerStats, fixtureInfo, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'team' | 'player'>('team');

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="modal-loading-state">
          <RefreshCw className="loading-spinner" size={32} />
          <p>Laster kampstatistikk...</p>
        </div>
      );
    }
    
    return (
      <>
        <div className="modal-tabs">
          <button className={`modal-tab ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
            <Users size={16} style={{marginRight: '0.5rem'}}/> Lagstatistikk
          </button>
          <button className={`modal-tab ${activeTab === 'player' ? 'active' : ''}`} onClick={() => setActiveTab('player')}>
            <BarChart size={16} style={{marginRight: '0.5rem'}}/> Spillerstatistikk
          </button>
        </div>
        <div className="modal-content-area">
          {activeTab === 'team' ? (
            <TeamComparison teamStats={teamStats} fixtureInfo={fixtureInfo} />
          ) : (
            <PlayerRatings playerStats={playerStats} fixtureInfo={fixtureInfo} />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="stats-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="stats-modal-header">
          <h2>Kampdetaljer</h2>
          <button className="close-button" onClick={onClose}><X size={24} /></button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default MatchStatsModal;