// src/components/MatchStatsModal.tsx

import React, { useState } from 'react';
import { RefreshCw, X, Users, BarChart, History } from 'lucide-react';
import './MatchStatsModal.css';
import type { MatchStat, PlayerMatchStat, HeadToHeadStats } from '../types';

interface MatchStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamStats: MatchStat[];
  playerStats: PlayerMatchStat[];
  h2hStats: HeadToHeadStats | null;
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
    const homeNum = parseFloat(String(homeValue).replace('%', ''));
    const awayNum = parseFloat(String(awayValue).replace('%', ''));
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
    const homePlayerSample = playerStats.find(p => p.teamId === playerStats[0]?.teamId);
    const homeTeamId = homePlayerSample?.teamId;

    const homePlayers = playerStats
        .filter(p => p.teamId === homeTeamId)
        .sort((a, b) => (a.substitute ? 1 : 0) - (b.substitute ? 1 : 0));

    const awayPlayers = playerStats
        .filter(p => p.teamId !== homeTeamId)
        .sort((a, b) => (a.substitute ? 1 : 0) - (b.substitute ? 1 : 0));

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
                <td className="numeric">{p.goalsTotal ?? 0}</td>
                <td className="numeric">{p.assists ?? 0}</td>
                <td className="numeric">{p.shotsTotal ?? 0}</td>
                <td className="numeric">{p.minutesPlayed ?? 0}</td>
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

// --- NY, FORBEDRET KOMPONENT: HeadToHeadComparison ---
const HeadToHeadComparison: React.FC<{ h2hStats: HeadToHeadStats | null; fixtureInfo: { homeTeamName: string; awayTeamName: string }; }> = ({ h2hStats, fixtureInfo }) => {
    if (!h2hStats || h2hStats.matchesPlayed === 0) {
        return <p style={{ textAlign: 'center', padding: '2rem' }}>Ingen tidligere møter funnet i databasen.</p>;
    }
    
    const { matchesPlayed, team1Wins, team2Wins, draws, avgTotalGoals } = h2hStats;
    
    const homeWinPct = (team1Wins / matchesPlayed) * 100;
    const drawPct = (draws / matchesPlayed) * 100;
    const awayWinPct = (team2Wins / matchesPlayed) * 100;

    return (
        <div className="h2h-container">
            <h4>Basert på de siste {matchesPlayed} møtene</h4>
            
            <div className="h2h-wins-bar" title={`H:${team1Wins} U:${draws} B:${team2Wins}`}>
                <div className="h2h-wins-bar-segment home" style={{ width: `${homeWinPct}%` }}></div>
                <div className="h2h-wins-bar-segment draw" style={{ width: `${drawPct}%` }}></div>
                <div className="h2h-wins-bar-segment away" style={{ width: `${awayWinPct}%` }}></div>
            </div>

            <div className="h2h-stats-details">
                <div className="h2h-stat home">
                    <span className="stat-value">{team1Wins}</span>
                    <span className="label">{fixtureInfo.homeTeamName} Seire</span>
                </div>
                <div className="h2h-stat draw">
                    <span className="stat-value">{draws}</span>
                    <span className="label">Uavgjort</span>
                </div>
                <div className="h2h-stat away">
                    <span className="stat-value">{team2Wins}</span>
                    <span className="label">{fixtureInfo.awayTeamName} Seire</span>
                </div>
            </div>

            <div className="h2h-avg-goals">
                <span className="label">Gjennomsnittlig Mål/Kamp</span>
                <span className="value">{avgTotalGoals.toFixed(2)}</span>
            </div>
        </div>
    );
};


const MatchStatsModal: React.FC<MatchStatsModalProps> = ({ isOpen, onClose, teamStats, playerStats, h2hStats, fixtureInfo, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'team' | 'player' | 'h2h'>('team');

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab('team');
    }
  }, [isOpen]);

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
    
    let content;
    switch (activeTab) {
        case 'player':
            content = <PlayerRatings playerStats={playerStats} fixtureInfo={fixtureInfo} />;
            break;
        case 'h2h':
            content = <HeadToHeadComparison h2hStats={h2hStats} fixtureInfo={fixtureInfo} />;
            break;
        case 'team':
        default:
            content = <TeamComparison teamStats={teamStats} fixtureInfo={fixtureInfo} />;
            break;
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
          <button className={`modal-tab ${activeTab === 'h2h' ? 'active' : ''}`} onClick={() => setActiveTab('h2h')}>
            <History size={16} style={{marginRight: '0.5rem'}}/> H2H
          </button>
        </div>
        <div className="modal-content-area">
          {content}
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