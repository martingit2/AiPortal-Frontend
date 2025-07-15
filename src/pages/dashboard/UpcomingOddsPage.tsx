// src/pages/dashboard/UpcomingOddsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { RefreshCw, AlertTriangle, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import OddsDetailModal from '../../components/OddsDetailModal';
import './UpcomingOddsPage.css';
import type { UpcomingFixtureWithOdds } from '../../types';

const UpcomingOddsPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<UpcomingFixtureWithOdds[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<UpcomingFixtureWithOdds | null>(null);

  const fetchUpcomingOdds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8080/api/v1/fixtures/upcoming-with-odds', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Kunne ikke hente data for kommende odds.');
      }
      const data: UpcomingFixtureWithOdds[] = await response.json();
      setFixtures(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchUpcomingOdds();
  }, [fetchUpcomingOdds]);

  const handleRowClick = (fixture: UpcomingFixtureWithOdds) => {
    if (fixture.hasOdds) {
      setSelectedFixture(fixture);
      setIsModalOpen(true);
    }
  };

  const renderContent = () => {
    if (isLoading) return <div className="loading-state"><RefreshCw className="loading-spinner" size={48} /><p>Henter oversikt...</p></div>;
    if (error) return <div className="error-box full-page-error"><AlertTriangle size={32} /><p>{error}</p></div>;

    const validFixtures = fixtures.filter(
      fixture => fixture.homeTeamName && fixture.awayTeamName && fixture.homeTeamName.trim() !== ''
    );

    if (validFixtures.length === 0) {
      return (
        <div className="empty-state">
          <HelpCircle size={48} />
          <h3>Ingen kommende kamper</h3>
          <p>Systemet fant ingen kommende kamper med fullstendig informasjon i databasen.</p>
        </div>
      );
    }

    return (
      <div className="odds-overview-container">
        <table className="odds-table">
          <thead>
            <tr>
              <th>Dato</th>
              <th>Liga</th>
              <th>Kamp</th>
              <th>Odds Status</th>
            </tr>
          </thead>
          <tbody>
            {validFixtures.map(fixture => (
              <tr 
                key={fixture.fixtureId} 
                className={fixture.hasOdds ? 'clickable-row' : ''}
                onClick={() => handleRowClick(fixture)}
                title={fixture.hasOdds ? 'Klikk for å se tilgjengelig odds' : ''}
              >
                <td>{new Date(fixture.date).toLocaleString('no-NO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                <td>{fixture.leagueName}</td>
                <td>{fixture.homeTeamName} vs {fixture.awayTeamName}</td>
                <td>
                  {fixture.hasOdds ? (
                    <span className="odds-status available"><CheckCircle size={16} /> Tilgjengelig</span>
                  ) : (
                    <span className="odds-status missing"><XCircle size={16} /> Mangler</span>
                  )}
                </td>
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
        <h1 className="dashboard-page-title">Oversikt: Kommende Odds</h1>
        <button className="action-btn" onClick={fetchUpcomingOdds} disabled={isLoading} title="Oppdater oversikt">
          <RefreshCw size={16} />
        </button>
      </div>
      <p style={{marginBottom: '2rem', color: 'var(--text-on-light-secondary)'}}>
        Denne siden gir deg en sanntidsoversikt over hvilke kommende kamper systemet har hentet odds for. 
        Hvis en kamp mangler odds, kan det være fordi den er for langt frem i tid. Prøv å kjøre "Odds-boten" fra admin-panelet nærmere kampstart.
      </p>
      {renderContent()}

      <OddsDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fixture={selectedFixture}
      />
    </div>
  );
};

export default UpcomingOddsPage;