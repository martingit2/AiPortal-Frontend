// src/pages/dashboard/FootballStatsPage.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { RefreshCw, AlertTriangle, ShieldCheck, ChevronDown, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FootballStatsPage.css';

// ---- Interfacer  ----
interface TeamStatsDtoFromApi {
  id: number; teamId: number; teamName: string; season: number;
  playedTotal: number; winsTotal: number; drawsTotal: number; lossesTotal: number;
  goalsForTotal: number; goalsAgainstTotal: number; leagueName: string;
}
interface LeagueStatsGroupFromApi {
  groupTitle: string; statistics: TeamStatsDtoFromApi[];
}
interface ProcessedTeamStats extends TeamStatsDtoFromApi {
  points: number; goalDifference: number;
}
interface ProcessedLeagueGroup {
  groupTitle: string; statistics: ProcessedTeamStats[];
}
interface SeasonGroup {
    season: number; leagues: ProcessedLeagueGroup[];
}
// Hjelpefunksjon 
const getColorClassForValue = (value: number): string => {
  if (value > 0) return 'positive-value';
  if (value < 0) return 'negative-value';
  return '';
};


const FootballStatsPage: React.FC = () => {
  const [rawGroupedStats, setRawGroupedStats] = useState<LeagueStatsGroupFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
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
      setRawGroupedStats(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const groupedBySeason: SeasonGroup[] = useMemo(() => {
    const processedLeagues = rawGroupedStats.map(group => {
      const calculatedStats = group.statistics.map(team => ({
        ...team,
        points: (team.winsTotal * 3) + team.drawsTotal,
        goalDifference: team.goalsForTotal - team.goalsAgainstTotal,
      }));
      calculatedStats.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsForTotal - a.goalsForTotal);
      return { ...group, statistics: calculatedStats };
    });

    const bySeason = processedLeagues.reduce((acc, league) => {
      const season = parseInt(league.groupTitle.slice(-4), 10);
      if (!isNaN(season)) {
        (acc[season] = acc[season] || []).push(league);
      }
      return acc;
    }, {} as Record<number, ProcessedLeagueGroup[]>);

    return Object.entries(bySeason)
      .map(([season, leagues]) => ({
        season: parseInt(season),
        leagues: leagues.sort((a,b) => a.groupTitle.localeCompare(b.groupTitle))
      }))
      .sort((a, b) => b.season - a.season);

  }, [rawGroupedStats]);

  // --- NY, FORBEDRET LOGIKK ---
  // Denne hooken kjører KUN når den sorterte listen 'groupedBySeason' endres.
  useEffect(() => {
    // Hvis vi har data og ingen trekkspill er åpne, åpne det første i den sorterte listen.
    if (groupedBySeason.length > 0 && openAccordions.size === 0) {
        const firstSeason = groupedBySeason[0];
        if (firstSeason.leagues.length > 0) {
            const firstLeagueTitle = firstSeason.leagues[0].groupTitle;
            setOpenAccordions(new Set([firstLeagueTitle]));
        }
    }
    // Avhengigheten [groupedBySeason, openAccordions.size] sikrer at dette kun kjører
    // ved første lasting eller hvis alle trekkspill lukkes manuelt.
  }, [groupedBySeason, openAccordions.size]);


  const handleTeamRowClick = (teamId: number, season: number) => {
    navigate(`/dashboard/team-details/${teamId}/season/${season}`);
  };


  const renderContent = () => {
    if (isLoading) return <div className="loading-state"><RefreshCw className="loading-spinner" size={48} /><p>Laster statistikk...</p></div>;
    if (error) return <div className="error-box full-page-error"><AlertTriangle size={32} /><p>{error}</p></div>;
    if (groupedBySeason.length === 0) {
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
        {groupedBySeason.map(({ season, leagues }) => (
          <div key={season} className="season-section">
            <h2 className="season-title">
              <Calendar size={24} /> <span>{season}</span>
            </h2>
            {leagues.map(group => (
              <div key={group.groupTitle} className="league-section">
                <button className="accordion-header" onClick={() => toggleAccordion(group.groupTitle)} aria-expanded={openAccordions.has(group.groupTitle)}>
                  <h3>{group.groupTitle}</h3>
                  <ChevronDown className={`accordion-chevron ${openAccordions.has(group.groupTitle) ? 'open' : ''}`} size={20} />
                </button>
                
                {openAccordions.has(group.groupTitle) && (
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
                              onClick={() => handleTeamRowClick(team.teamId, team.season)}
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