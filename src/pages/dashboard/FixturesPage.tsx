// src/pages/dashboard/FixturesPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { RefreshCw, AlertTriangle, ShieldX } from 'lucide-react';
import MatchStatsModal from '../../components/MatchStatsModal';
import './FixturesPage.css';
import type { Fixture, MatchStat, PlayerMatchStat, HeadToHeadStats, PaginatedResponse } from '../../types';


// Oppdatert ModalData-interfacet til å inkludere H2H
interface ModalData {
  teamStats: MatchStat[];
  playerStats: PlayerMatchStat[];
  h2hStats: HeadToHeadStats | null;
  fixtureInfo: { homeTeamName: string; awayTeamName: string };
}

const FixturesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'results'>('upcoming');
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppending, setIsAppending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  const fetchFixtures = useCallback(async (fetchPage: number, append = false) => {
    if (!append) {
      setIsLoading(true);
      setFixtures([]);
    } else {
      setIsAppending(true);
    }
    setError(null);

    const endpoint = activeTab === 'upcoming' ? 'upcoming' : 'results';

    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8080/api/v1/fixtures/${endpoint}?page=${fetchPage}&size=25`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Kunne ikke hente ${activeTab} kamper. Serveren svarte med status ${response.status}.`);
      }

      const data: PaginatedResponse<Fixture> = await response.json();
      
      setFixtures(prev => append ? [...prev, ...data.content] : data.content);
      setPage(data.number);
      setTotalPages(data.totalPages);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
      setIsAppending(false);
    }
  }, [getToken, activeTab]);

  useEffect(() => {
    fetchFixtures(0);
  }, [fetchFixtures]); 

  const handleTabClick = (tab: 'upcoming' | 'results') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(0);
  };

  const handleLoadMore = () => {
    if (page < totalPages - 1) {
      fetchFixtures(page + 1, true);
    }
  };

  const handleRowClick = async (fixture: Fixture) => {
    if (activeTab !== 'results') return;
    
    setIsLoadingModal(true);
    setIsModalOpen(true);
    setModalData(null);
    try {
        const token = await getToken();
        if (!token) throw new Error("Autentiseringstoken mangler.");

        // Hent all statistikk parallelt for best ytelse
        const [teamStatsResponse, playerStatsResponse, h2hStatsResponse] = await Promise.all([
            fetch(`http://localhost:8080/api/v1/statistics/fixture/${fixture.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`http://localhost:8080/api/v1/statistics/players/fixture/${fixture.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`http://localhost:8080/api/v1/statistics/h2h/${fixture.id}`, { // <-- Henter H2H-data
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const teamStats = teamStatsResponse.ok ? await teamStatsResponse.json() : [];
        const playerStats = playerStatsResponse.ok ? await playerStatsResponse.json() : [];
        const h2hStats = h2hStatsResponse.ok ? await h2hStatsResponse.json() : null;
        
        setModalData({ 
            teamStats, 
            playerStats,
            h2hStats, // <-- Setter H2H-data
            fixtureInfo: { homeTeamName: fixture.homeTeamName, awayTeamName: fixture.awayTeamName } 
        });

    } catch (err: any) {
        console.error(err);
        setModalData({ 
            teamStats: [], 
            playerStats: [],
            h2hStats: null,
            fixtureInfo: { homeTeamName: 'Feil', awayTeamName: err.message } 
        });
    } finally {
        setIsLoadingModal(false);
    }
  };

  const renderContent = () => {
    if (isLoading) return <div className="loading-state"><RefreshCw className="loading-spinner" size={48} /><p>Laster kamper...</p></div>;
    if (error) return <div className="error-box full-page-error"><AlertTriangle size={32} /><p>{error}</p></div>;
    if (fixtures.length === 0) {
      return (
        <div className="empty-state">
          <ShieldX size={48} />
          <h3>Ingen kamper funnet</h3>
          <p>Det er ingen {activeTab === 'upcoming' ? 'kommende kamper' : 'resultater'} i databasen som matcher kriteriene.</p>
        </div>
      );
    }

    return (
      <div className="table-container">
        <table className="fixtures-table">
          <thead>
            <tr>
              <th>Dato</th>
              <th>Hjemmelag</th>
              <th>Resultat</th>
              <th>Bortelag</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map(fixture => (
              <tr 
                key={fixture.id} 
                className={activeTab === 'results' ? 'clickable-row' : ''}
                onClick={() => handleRowClick(fixture)}
                title={activeTab === 'results' ? 'Klikk for å se detaljert statistikk' : ''}
              >
                <td>{new Date(fixture.date).toLocaleString('no-NO')}</td>
                <td>{fixture.homeTeamName}</td>
                <td>
                  <div className="fixture-result">
                    {(fixture.goalsHome !== null && fixture.goalsAway !== null) 
                      ? `${fixture.goalsHome} - ${fixture.goalsAway}`
                      : '-'}
                  </div>
                </td>
                <td>{fixture.awayTeamName}</td>
                <td><span className={`status-badge status-${fixture.status.toLowerCase()}`}>{fixture.status}</span></td>
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
            <h1 className="dashboard-page-title">Kampoversikt</h1>
            <button className="action-btn" onClick={() => fetchFixtures(0)} disabled={isLoading || isAppending} title="Oppdater listen">
                <RefreshCw size={16} />
            </button>
        </div>

        <div className="tabs-container">
            <button 
              className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`} 
              onClick={() => handleTabClick('upcoming')}
            >
              Kommende
            </button>
            <button 
              className={`tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => handleTabClick('results')}
            >
              Resultater
            </button>
        </div>
        
        <div className="content-container">
            {renderContent()}
        </div>

        {page < totalPages - 1 && (
            <div className="load-more-container">
                <button onClick={handleLoadMore} disabled={isAppending} className="cta-button-outlined">
                    {isAppending ? 'Laster...' : 'Last inn flere'}
                </button>
            </div>
        )}
        
        <MatchStatsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            teamStats={modalData?.teamStats || []}
            playerStats={modalData?.playerStats || []}
            h2hStats={modalData?.h2hStats || null}
            fixtureInfo={modalData?.fixtureInfo || { homeTeamName: '', awayTeamName: '' }}
            isLoading={isLoadingModal}
        />
    </div>
  );
};

export default FixturesPage;