import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';
import './OddsAnalysisPage.css'; 

// Type for å matche ValueBetDto fra backend
interface ValueBet {
  fixtureId: number;
  homeTeamName: string;
  awayTeamName: string;
  fixtureDate: string;
  marketHomeOdds: number;
  marketDrawOdds: number;
  marketAwayOdds: number;
  bookmakerName: string;
  aracanixHomeOdds: number;
  aracanixDrawOdds: number;
  aracanixAwayOdds: number;
  valueHome: number;
  valueDraw: number;
  valueAway: number;
}

const OddsAnalysisPage: React.FC = () => {
  const [valueBets, setValueBets] = useState<ValueBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchValueBets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8080/api/v1/value-bets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Kunne ikke hente oddsanalyse.');
      }
      const data: ValueBet[] = await response.json();
      setValueBets(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchValueBets();
  }, [fetchValueBets]);

  const formatOdds = (odds: number) => odds.toFixed(2);

  const getValueClass = (value: number) => {
    if (value > 0.1) return 'value-high'; // Over 10% value
    if (value > 0.02) return 'value-medium'; // Over 2% value
    return ''; // Ingen spesiell farge
  };

  const renderContent = () => {
    if (isLoading) return <div className="loading-state"><RefreshCw className="loading-spinner" size={48} /><p>Kjører analyser...</p></div>;
    if (error) return <div className="error-box full-page-error"><AlertTriangle size={32} /><p>{error}</p></div>;
    if (valueBets.length === 0) {
      return (
        <div className="empty-state">
          <HelpCircle size={48} />
          <h3>Ingen Verdispill Funnet</h3>
          <p>Systemet fant ingen kamper med positiv forventet verdi basert på nåværende data.</p>
        </div>
      );
    }

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Kamp</th>
              <th>Dato</th>
              <th>Marked Odds (H/U/B)</th>
              <th>Vår Odds (H/U/B)</th>
              <th className="value-col">Value H</th>
              <th className="value-col">Value U</th>
              <th className="value-col">Value B</th>
            </tr>
          </thead>
          <tbody>
            {valueBets.map(bet => (
              <tr key={bet.fixtureId}>
                <td>{bet.homeTeamName} vs {bet.awayTeamName}</td>
                <td>{new Date(bet.fixtureDate).toLocaleString('no-NO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                <td>{formatOdds(bet.marketHomeOdds)} / {formatOdds(bet.marketDrawOdds)} / {formatOdds(bet.marketAwayOdds)} ({bet.bookmakerName})</td>
                <td>{formatOdds(bet.aracanixHomeOdds)} / {formatOdds(bet.aracanixDrawOdds)} / {formatOdds(bet.aracanixAwayOdds)}</td>
                <td className={`value-cell ${getValueClass(bet.valueHome)}`}>{(bet.valueHome * 100).toFixed(1)}%</td>
                <td className={`value-cell ${getValueClass(bet.valueDraw)}`}>{(bet.valueDraw * 100).toFixed(1)}%</td>
                <td className={`value-cell ${getValueClass(bet.valueAway)}`}>{(bet.valueAway * 100).toFixed(1)}%</td>
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
        <h1 className="dashboard-page-title">Oddsanalyse & Verdispill</h1>
        <button className="action-btn" onClick={fetchValueBets} disabled={isLoading} title="Kjør analyse på nytt">
          <RefreshCw size={16} />
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default OddsAnalysisPage;