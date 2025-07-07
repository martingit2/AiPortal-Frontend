// src/pages/dashboard/FootballStatsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import './FootballStatsPage.css';

// ENDRET: Interfacet matcher nå TeamStatisticsDto
interface TeamStatsDto {
  id: number;
  teamName: string;
  leagueName: string;
  season: number;
  playedTotal: number;
  winsTotal: number;
  drawsTotal: number;
  lossesTotal: number;
  goalsForTotal: number;
  goalsAgainstTotal: number;
  sourceBotName: string; // Dette feltet finnes nå i DTO-en
}

const FootballStatsPage: React.FC = () => {
  const [stats, setStats] = useState<TeamStatsDto[]>([]); // Bruker det nye interfacet
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8080/api/v1/statistics/teams', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Kunne ikke hente statistikk.');
      }
      const data: TeamStatsDto[] = await response.json(); // Forventer en liste av DTOs
      setStats(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // renderContent-metoden forblir den samme, men datastrukturen den bruker
  // (team-objektet i map-funksjonen) er nå TeamStatsDto
  const renderContent = () => {
    if (isLoading) return <div className="loading-state"><RefreshCw className="loading-spinner" size={48} /><p>Laster statistikk...</p></div>;
    if (error) return <div className="error-box full-page-error"><AlertTriangle size={32} /><p>{error}</p></div>;
    if (stats.length === 0) {
      return (
        <div className="empty-state">
          <ShieldCheck size={48} />
          <h3>Ingen statistikk funnet</h3>
          <p>Dine aktive sports-boter har ikke hentet inn noen data ennå.</p>
        </div>
      );
    }

    return (
      <div className="stats-table-container">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Lag</th>
              <th>Liga</th>
              <th>Sesong</th>
              <th>Kamper</th>
              <th>V</th>
              <th>U</th>
              <th>T</th>
              <th>Mål+</th>
              <th>Mål-</th>
              <th>Målforskjell</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(team => (
              <tr key={team.id}>
                <td>{team.teamName}</td>
                <td>{team.leagueName}</td>
                <td>{team.season}</td>
                <td>{team.playedTotal}</td>
                <td>{team.winsTotal}</td>
                <td>{team.drawsTotal}</td>
                <td>{team.lossesTotal}</td>
                <td>{team.goalsForTotal}</td>
                <td>{team.goalsAgainstTotal}</td>
                <td>{team.goalsForTotal - team.goalsAgainstTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="dashboard-page-title">Lagstatistikk</h1>
        <button className="action-btn" onClick={fetchStats} disabled={isLoading} title="Oppdater statistikk">
          <RefreshCw size={16} />
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default FootballStatsPage;