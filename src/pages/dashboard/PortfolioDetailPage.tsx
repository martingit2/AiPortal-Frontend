// src/pages/dashboard/PortfolioDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';
import type { PlacedBet, VirtualPortfolio } from '../../types';
// Gjenbruker CSS fra en annen side for tabell-styling
import './FixturesPage.css'; 

const PortfolioDetailPage: React.FC = () => {
    const { portfolioId } = useParams<{ portfolioId: string }>();
    const [bets, setBets] = useState<PlacedBet[]>([]);
    const [portfolio, setPortfolio] = useState<VirtualPortfolio | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getToken } = useAuth();

    const fetchData = useCallback(async () => {
        if (!portfolioId) return;
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) throw new Error("Autentiseringstoken mangler.");

            // Henter både bet-historikk og porteføljeinfo samtidig
            const [betsResponse, allPortfoliosResponse] = await Promise.all([
                fetch(`http://localhost:8080/api/v1/portfolios/${portfolioId}/bets`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`http://localhost:8080/api/v1/portfolios`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            if (!betsResponse.ok || !allPortfoliosResponse.ok) {
                throw new Error("Kunne ikke hente porteføljedetaljer.");
            }
            
            const betsData: PlacedBet[] = await betsResponse.json();
            const allPortfoliosData: VirtualPortfolio[] = await allPortfoliosResponse.json();
            
            setBets(betsData);
            setPortfolio(allPortfoliosData.find(p => p.id === parseInt(portfolioId, 10)) || null);
            
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [portfolioId, getToken]);

    useEffect(() => {
        // Hent data ved lasting, og sett opp en poller for å oppdatere hvert 30. sekund
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const getStatusClass = (status: PlacedBet['status']) => {
        switch(status) {
            case 'WON': return 'status-won';
            case 'LOST': return 'status-lost';
            case 'PENDING': return 'status-pending';
            case 'PUSH': return 'status-neutral'; // For PUSH/VOID
            default: return '';
        }
    };

    const renderContent = () => {
        if (isLoading && bets.length === 0) return <div className="loading-state"><RefreshCw className="loading-spinner" /></div>;
        if (error) return <div className="error-box full-page-error">{error}</div>;

        if (bets.length === 0) {
            return (
                 <div className="empty-state">
                    <HelpCircle size={48} />
                    <h3>Ingen bets plassert</h3>
                    <p>Denne porteføljen har ikke plassert noen bets ennå. Sørg for at den er aktiv og at `BettingSimulationRunner`-jobben kjører.</p>
                </div>
            );
        }

        return (
            <div className="table-container">
                <table className="fixtures-table">
                    <thead>
                        <tr>
                            <th>Dato</th>
                            <th>Kamp</th>
                            <th>Marked</th>
                            <th>Utfall</th>
                            <th>Innsats</th>
                            <th>Odds</th>
                            <th>Status</th>
                            <th>Resultat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bets.map(bet => (
                            <tr key={bet.id}>
                                <td>{new Date(bet.placedAt).toLocaleString('no-NO')}</td>
                                <td>{bet.homeTeamName} vs {bet.awayTeamName}</td>
                                <td>{bet.market}</td>
                                <td>{bet.selection}</td>
                                <td>{bet.stake.toFixed(2)} kr</td>
                                <td>{bet.odds.toFixed(2)}</td>
                                <td><span className={`status-badge ${getStatusClass(bet.status)}`}>{bet.status}</span></td>
                                <td className={bet.profit ? (bet.profit > 0 ? 'profit-positive' : 'profit-negative') : ''}>
                                    {bet.profit !== null ? `${bet.profit.toFixed(2)} kr` : '-'}
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
            <Link to="/dashboard/portefoljer" className="back-link-lg">
                <ArrowLeft size={16} /> Tilbake til alle porteføljer
            </Link>
            <div className="page-header" style={{ marginTop: '1rem' }}>
                <h1 className="dashboard-page-title">{portfolio?.name || 'Laster...'}</h1>
                 <button className="action-btn" onClick={fetchData} disabled={isLoading} title="Oppdater liste">
                    <RefreshCw size={16} />
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

export default PortfolioDetailPage;