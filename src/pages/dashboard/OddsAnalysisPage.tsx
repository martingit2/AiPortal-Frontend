// src/pages/dashboard/OddsAnalysisPage.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { RefreshCw, AlertTriangle, HelpCircle, TrendingUp, Target, ArrowDownUp } from 'lucide-react';
import MatchStatsModal from '../../components/MatchStatsModal';
import './OddsAnalysisPage.css';
import type { MatchStat, ValueBet, PlayerMatchStat, HeadToHeadStats } from '../../types';

// Interface for den prosesserte listen vi skal vise
interface ProcessedBet {
  key: string;
  fixtureId: number;
  matchDisplay: string;
  homeTeamName: string;
  awayTeamName: string;
  market: string;
  selection: string;
  value: number;
  ourProbability: number;
  marketOdds: number;
  bookmaker: string;
}

interface ModalData {
  teamStats: MatchStat[];
  playerStats: PlayerMatchStat[];
  h2hStats: HeadToHeadStats | null;
  fixtureInfo: { homeTeamName: string; awayTeamName: string; };
}

const OddsAnalysisPage: React.FC = () => {
  const [rawValueBets, setRawValueBets] = useState<ValueBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

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
      setRawValueBets(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchValueBets();
  }, [fetchValueBets]);

  const handleRowClick = async (fixtureId: number, homeTeamName: string, awayTeamName: string) => {
    setIsLoadingModal(true);
    setIsModalOpen(true);
    setModalData(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Autentiseringstoken mangler.");

      const [teamStatsResponse, playerStatsResponse, h2hStatsResponse] = await Promise.all([
          fetch(`http://localhost:8080/api/v1/statistics/fixture/${fixtureId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`http://localhost:8080/api/v1/statistics/players/fixture/${fixtureId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`http://localhost:8080/api/v1/statistics/h2h/${fixtureId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const teamStats = teamStatsResponse.ok ? await teamStatsResponse.json() : [];
      const playerStats = playerStatsResponse.ok ? await playerStatsResponse.json() : [];
      const h2hStats = h2hStatsResponse.ok ? await h2hStatsResponse.json() : null;
      
      setModalData({ 
        teamStats, 
        playerStats,
        h2hStats,
        fixtureInfo: { homeTeamName, awayTeamName } 
      });

    } catch (err: any) {
      console.error(err);
      setModalData({ 
        teamStats: [], 
        playerStats: [],
        h2hStats: null,
        fixtureInfo: { homeTeamName: 'Feil', awayTeamName: 'Data ikke funnet' } 
      });
    } finally {
      setIsLoadingModal(false);
    }
  };

  const processedBets = useMemo(() => {
    const allBets: ProcessedBet[] = [];

    rawValueBets.forEach(bet => {
        const marketDesc = bet.marketDescription || "";

        if (marketDesc.includes("Kampvinner")) {
            const outcomes = [
                { selection: "Hjemme", value: bet.valueHome, prob: 1 / bet.aracanixHomeOdds, odds: bet.marketHomeOdds },
                { selection: "Uavgjort", value: bet.valueDraw, prob: 1 / bet.aracanixDrawOdds, odds: bet.marketDrawOdds },
                { selection: "Borte", value: bet.valueAway, prob: 1 / bet.aracanixAwayOdds, odds: bet.marketAwayOdds }
            ];
            outcomes.forEach(outcome => {
                if (outcome.value > 0) { // Viser kun bets med positiv verdi
                    allBets.push({
                        key: `${bet.fixtureId}-${marketDesc}-${outcome.selection}`,
                        fixtureId: bet.fixtureId,
                        matchDisplay: `${bet.homeTeamName} vs ${bet.awayTeamName}`,
                        homeTeamName: bet.homeTeamName, awayTeamName: bet.awayTeamName,
                        market: marketDesc,
                        selection: outcome.selection, value: outcome.value,
                        ourProbability: isFinite(outcome.prob) ? outcome.prob : 0,
                        marketOdds: outcome.odds, bookmaker: bet.bookmakerName
                    });
                }
            });
        } else if (marketDesc.includes("Over/Under")) {
            const outcomes = [
                { selection: "Over 2.5", value: bet.valueHome, prob: 1 / bet.aracanixHomeOdds, odds: bet.marketHomeOdds },
                { selection: "Under 2.5", value: bet.valueAway, prob: 1 / bet.aracanixAwayOdds, odds: bet.marketAwayOdds }
            ];
            outcomes.forEach(outcome => {
                if (outcome.value > 0) { // Viser kun bets med positiv verdi
                    allBets.push({
                        key: `${bet.fixtureId}-${marketDesc}-${outcome.selection}`,
                        fixtureId: bet.fixtureId,
                        matchDisplay: `${bet.homeTeamName} vs ${bet.awayTeamName}`,
                        homeTeamName: bet.homeTeamName, awayTeamName: bet.awayTeamName,
                        market: "Over/Under 2.5",
                        selection: outcome.selection, value: outcome.value,
                        ourProbability: isFinite(outcome.prob) ? outcome.prob : 0,
                        marketOdds: outcome.odds, bookmaker: bet.bookmakerName
                    });
                }
            });
        }
    });
    return allBets.sort((a, b) => b.value - a.value);
  }, [rawValueBets]);

  const getValueClass = (value: number) => {
    if (value > 0.10) return 'value-high';
    if (value > 0) return 'value-medium';
    return '';
  };

  const getMarketIcon = (market: string) => {
    if (market.includes("Kampvinner")) return <Target size={18} />;
    if (market.includes("Over/Under")) return <ArrowDownUp size={18} />;
    return <TrendingUp size={18} />;
  }

  const renderContent = () => {
    if (isLoading) return <div className="loading-state"><RefreshCw className="loading-spinner" size={48} /><p>Kjører analyser...</p></div>;
    if (error) return <div className="error-box full-page-error"><AlertTriangle size={32} /><p>{error}</p></div>;
    
    // NY, FORBEDRET LOGIKK
    if (rawValueBets.length > 0 && processedBets.length === 0) {
        return (
             <div className="empty-state">
                <HelpCircle size={48} />
                <h3>Ingen *Positive* Verdispill Funnet</h3>
                <p>Modellene fant ingen spill med positiv forventet verdi. Prøv igjen senere eller juster modellene.</p>
            </div>
        )
    }
    
    if (processedBets.length === 0 && !isLoading) {
      return (
        <div className="empty-state">
          <HelpCircle size={48} />
          <h3>Ingen Analyser Funnet</h3>
          <p>Systemet fant ingen kamper med odds å analysere, eller ingen aktive porteføljer.</p>
        </div>
      );
    }

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Kamp</th>
              <th>Marked</th>
              <th>Utfall</th>
              <th className="value-col">Verdi</th>
              <th className="value-col">Vår Sanns.</th>
              <th className="value-col">Markedsodds</th>
            </tr>
          </thead>
          <tbody>
            {processedBets.map(bet => (
              <tr 
                key={bet.key}
                className="clickable-row"
                onClick={() => handleRowClick(bet.fixtureId, bet.homeTeamName, bet.awayTeamName)}
                title="Klikk for å se detaljert kampstatistikk"
              >
                <td>{bet.matchDisplay}</td>
                <td><div className="market-cell">{getMarketIcon(bet.market)} {bet.market}</div></td>
                <td><div className="bet-selection">{bet.selection}</div></td>
                <td className={`value-cell ${getValueClass(bet.value)}`}>{(bet.value * 100).toFixed(1)}%</td>
                <td className="value-cell">{(bet.ourProbability * 100).toFixed(1)}%</td>
                <td className="value-cell">{bet.marketOdds > 0 ? `${bet.marketOdds.toFixed(2)} (${bet.bookmaker})` : '-'}</td>
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
      <p style={{marginBottom: '2rem', color: 'var(--text-on-light-secondary)'}}>
        Viser alle funnede spill med positiv forventet verdi, sortert etter høyest verdi.
      </p>
      {renderContent()}

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

export default OddsAnalysisPage;