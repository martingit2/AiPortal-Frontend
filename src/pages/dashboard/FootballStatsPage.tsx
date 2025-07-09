// src/pages/dashboard/FootballStatsPage.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { RefreshCw, AlertTriangle, ShieldCheck, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FootballStatsPage.css';

// ---- Interfacer for datastrukturer ----

// Data som kommer fra backend
interface TeamStatsDtoFromApi {
  id: number;
  teamId: number; // <-- VIKTIG: Lagets faktiske ID
  teamName: string;
  season: number;
  playedTotal: number;
  winsTotal: number;
  drawsTotal: number;
  lossesTotal: number;
  goalsForTotal: number;
  goalsAgainstTotal: number;
}

// Gruppert data fra backend
interface LeagueStatsGroupFromApi {
  groupTitle: string;
  statistics: TeamStatsDtoFromApi[];
}

// Data etter at vi har behandlet den i frontend
interface ProcessedTeamStats extends TeamStatsDtoFromApi {
  points: number;
  goalDifference: number;
}

interface ProcessedLeagueGroup {
  groupTitle: string;
  statistics: ProcessedTeamStats[];
}

// Hjelpefunksjon for fargelegging
const getColorClassForValue = (value: number): string => {
  if (value > 0) return 'positive-value';
  if (value < 0) return 'negative-value';
  return '';
};


const FootballStatsPage: React.FC = () => {
  const [groupedStats, setGroupedStats] = useState<LeagueStatsGroupFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8080/api/v1/statistics/teams/grouped', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Kunne ikke hente statistikk.');
      
      const data: LeagueStatsGroupFromApi[] = await response.json();
      setGroupedStats(data);

      if (data.length > 0 && openGroups.size === 0) {
        setOpenGroups(new Set([data[0].groupTitle]));
      }

    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, openGroups.size]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prevOpenGroups => {
      const newOpenGroups = new Set(prevOpenGroups);
      if (newOpenGroups.has(groupTitle)) {
        newOpenGroups.delete(groupTitle);
      } else {
        newOpenGroups.add(groupTitle);
      }
      return newOpenGroups;
    });
  };

  const processedData: ProcessedLeagueGroup[] = useMemo(() => {
    return groupedStats.map(group => {
      const calculatedStats = group.statistics.map(team => {
        const points = (team.winsTotal * 3) + team.drawsTotal;
        const goalDifference = team.goalsForTotal - team.goalsAgainstTotal;
        return { ...team, points, goalDifference };
      });

      const sortedStats = calculatedStats.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsForTotal - a.goalsForTotal;
      });

      return { ...group, statistics: sortedStats };
    });
  }, [groupedStats]);

  const handleTeamRowClick = (teamId: number, season: number) => {
    navigate(`/dashboard/team-details/${teamId}/season/${season}`);
  };


  const renderContent = () => {
    if (isLoading) return <div className="loading-state"><RefreshCw className="loading-spinner" size={48} /><p>Laster statistikk...</p></div>;
    if (error) return <div className="error-box full-page-error"><AlertTriangle size={32} /><p>{error}</p></div>;
    if (processedData.length === 0) {
      return (
        <div className="empty-state">
          <ShieldCheck size={48} />
          <h3>Ingen statistikk funnet</h3>
          <p>Dine aktive datainnsamlere har ikke hentet inn noen data ennå.</p>
        </div>
      );
    }

    return (
      <div className="stats-groups-container">
        {processedData.map(group => (
          <div key={group.groupTitle} className="league-section">
            <button className="accordion-header" onClick={() => toggleGroup(group.groupTitle)} aria-expanded={openGroups.has(group.groupTitle)}>
              <h3>{group.groupTitle}</h3>
              <ChevronDown className={`accordion-chevron ${openGroups.has(group.groupTitle) ? 'open' : ''}`} size={20} />
            </button>
            
            {openGroups.has(group.groupTitle) && (
              <div className="accordion-content">
                <div className="stats-table-container">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th className="position-col">#</th>
                        <th>Lag</th>
                        <th>Kamper</th>
                        <th>V</th>
                        <th>U</th>
                        <th>T</th>
                        <th>Mål+</th>
                        <th>Mål-</th>
                        <th>+/-</th>
                        <th className="points-col">Poeng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.statistics.map((team, index) => (
                        <tr 
                          key={team.id} 
                          className="clickable-row"
                          onClick={() => handleTeamRowClick(team.teamId, team.season)} // <-- FIKS: Bruker team.teamId
                          title={`Klikk for å se detaljer for ${team.teamName}`}
                        >
                          <td className="position-col">{index + 1}</td>
                          <td>{team.teamName}</td>
                          <td>{team.playedTotal}</td>
                          <td>{team.winsTotal}</td>
                          <td>{team.drawsTotal}</td>
                          <td>{team.lossesTotal}</td>
                          <td>{team.goalsForTotal}</td>
                          <td>{team.goalsAgainstTotal}</td>
                          <td className={getColorClassForValue(team.goalDifference)}>
                            {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                          </td>
                          <td className="points-col">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
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