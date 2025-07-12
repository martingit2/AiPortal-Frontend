// src/pages/dashboard/TeamDetailsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { RefreshCw, AlertTriangle, Calendar, Shield, BarChartHorizontal, CornerUpRight, Angry } from 'lucide-react';
import MatchStatsModal from '../../components/MatchStatsModal';

import './TeamDetailsPage.css';
import type { Fixture, MatchStat } from '../../types';
import type { ChartDataPoint } from '../../components/TeamFormChart';
import TeamFormChart from '../../components/TeamFormChart';


// --- TYPER OG KONSTANTER ---

interface TeamDetails {
  teamName: string;
  season: number;
  fixtures: Fixture[];
}

interface ModalData {
  stats: MatchStat[];
  fixtureInfo: { homeTeamName: string; awayTeamName: string };
}

// Utvidet for å inkludere flere stats for grafen
interface FormStatRaw extends MatchStat {
    fixtureId: number;
}

// Konfigurasjon for de valgbare statistikkene
type StatKey = 'shotsOnGoal' | 'corners' | 'fouls';

const STAT_CONFIG: Record<StatKey, { name: string; color: string; icon: React.ReactNode }> = {
  shotsOnGoal: { name: 'Skudd på mål', color: '#8884d8', icon: <BarChartHorizontal size={16}/> },
  corners: { name: 'Hjørnespark', color: '#82ca9d', icon: <CornerUpRight size={16}/> },
  fouls: { name: 'Frispark imot', color: '#ffc658', icon: <Angry size={16}/> },
};


const TeamDetailsPage: React.FC = () => {
    const { teamId, season } = useParams<{ teamId: string; season: string }>();
    const { getToken } = useAuth();
    
    const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formChartData, setFormChartData] = useState<ChartDataPoint[]>([]);
    const [isLoadingChart, setIsLoadingChart] = useState(true);
    
    // NY STATE for å holde styr på valgt statistikk
    const [selectedStat, setSelectedStat] = useState<StatKey>('shotsOnGoal');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<ModalData | null>(null);
    const [isLoadingModal, setIsLoadingModal] = useState(false);

    const fetchData = useCallback(async () => {
        if (!teamId || !season) return;
        setIsLoading(true);
        setIsLoadingChart(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Token mangler.");

            const detailsResponse = await fetch(`http://localhost:8080/api/v1/fixtures/team-details/team/${teamId}/season/${season}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!detailsResponse.ok) throw new Error("Kunne ikke hente kampdetaljer.");
            const detailsData: TeamDetails = await detailsResponse.json();
            setTeamDetails(detailsData);
            
            const formResponse = await fetch(`http://localhost:8080/api/v1/statistics/form/team/${teamId}/season/${season}?limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!formResponse.ok) throw new Error("Kunne ikke hente form-statistikk.");
            const formStatsRaw: FormStatRaw[] = await formResponse.json();
            
            if (formStatsRaw.length > 0) {
                const combinedStats = formStatsRaw.map(stat => ({
                    ...stat,
                    fixture: detailsData.fixtures.find(f => f.id === stat.fixtureId)
                })).filter(item => item.fixture);
                
                combinedStats.sort((a, b) => new Date(a.fixture!.date).getTime() - new Date(b.fixture!.date).getTime());

                // Mapper til et mer komplett dataobjekt
                const chartData = combinedStats.map(stat => {
                    const opponent = stat.fixture!.homeTeamId.toString() === teamId ? stat.fixture!.awayTeamName : stat.fixture!.homeTeamName;
                    return {
                        matchDate: new Date(stat.fixture!.date).toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit' }),
                        opponent: `vs ${opponent}`,
                        shotsOnGoal: stat.shotsOnGoal,
                        corners: stat.cornerKicks,
                        fouls: stat.fouls,
                    };
                });
                setFormChartData(chartData);
            }
        } catch (e: any) {
            console.error("En feil oppstod under datahenting for detaljsiden:", e);
            setError(e.message);
        } finally {
            setIsLoading(false);
            setIsLoadingChart(false);
        }
    }, [teamId, season, getToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleRowClick = async (fixture: Fixture) => {
        setIsLoadingModal(true);
        setIsModalOpen(true);
        setModalData(null);
        try {
            const token = await getToken();
            const response = await fetch(`http://localhost:8080/api/v1/statistics/fixture/${fixture.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Statistikk for denne kampen er ikke tilgjengelig.");
            const stats: MatchStat[] = await response.json();
            setModalData({ stats, fixtureInfo: { homeTeamName: fixture.homeTeamName, awayTeamName: fixture.awayTeamName } });
        } catch (err: any) {
            console.error(err);
            setModalData({ stats: [], fixtureInfo: { homeTeamName: 'Feil', awayTeamName: err.message } });
        } finally {
             setIsLoadingModal(false);
        }
    };

    const renderFixturesTable = () => {
        if (isLoading) return <div className="loading-state"><RefreshCw className="loading-spinner" /> Laster kamper...</div>;
        if (error && !teamDetails) return <div className="error-box full-page-error"><AlertTriangle /> {error}</div>;
        if (!teamDetails || teamDetails.fixtures.length === 0) return <div className="empty-state">Ingen kamper funnet for dette laget i denne sesongen.</div>;

        return (
            <div className="stats-table-container">
                <table className="stats-table">
                    <thead>
                        <tr>
                            <th>Dato</th>
                            <th className="team-cell-home">Hjemmelag</th>
                            <th className="result-cell">Resultat</th>
                            <th className="team-cell-away">Bortelag</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamDetails.fixtures.map(fixture => (
                            <tr 
                                key={fixture.id} 
                                className="clickable-row" 
                                onClick={() => handleRowClick(fixture)}
                                title="Klikk for å se kampstatistikk"
                            >
                                <td>{new Date(fixture.date).toLocaleDateString('no-NO')}</td>
                                <td className={`team-cell-home ${teamId && parseInt(teamId) === fixture.homeTeamId ? 'highlight-team' : ''}`}>{fixture.homeTeamName}</td>
                                <td className="result-cell">
                                    {(fixture.goalsHome !== null && fixture.goalsAway !== null)
                                        ? `${fixture.goalsHome} - ${fixture.goalsAway}`
                                        : ' - '}
                                </td>
                                <td className={`team-cell-away ${teamId && parseInt(teamId) === fixture.awayTeamId ? 'highlight-team' : ''}`}>{fixture.awayTeamName}</td>
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
                <h1 className="dashboard-page-title">
                    Lagdetaljer
                </h1>
                <div className="page-header-info">
                    <span><Shield size={16} />{teamDetails?.teamName || `Lag ID: ${teamId}`}</span>
                    <span><Calendar size={16} /> Sesong: {season}</span>
                </div>
            </div>
            
            {/* --- GRAF-SEKSJON MED VALG --- */}
            <div className="chart-wrapper">
                <div className="chart-controls">
                    {Object.keys(STAT_CONFIG).map(key => (
                        <button 
                            key={key}
                            className={`stat-button ${selectedStat === key ? 'active' : ''}`}
                            onClick={() => setSelectedStat(key as StatKey)}
                        >
                            {STAT_CONFIG[key as StatKey].icon}
                            <span>{STAT_CONFIG[key as StatKey].name}</span>
                        </button>
                    ))}
                </div>
                {isLoadingChart ? (
                    <div className="loading-state"><RefreshCw className="loading-spinner" /> Laster grafdata...</div>
                ) : (
                    <TeamFormChart 
                        data={formChartData}
                        dataKey={selectedStat}
                        lineName={STAT_CONFIG[selectedStat].name}
                        lineColor={STAT_CONFIG[selectedStat].color}
                    />
                )}
            </div>
            
            <h2 className="section-header">Full Kamp-historikk</h2>
            {renderFixturesTable()}

            <MatchStatsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                stats={modalData?.stats || []}
                fixtureInfo={modalData?.fixtureInfo || { homeTeamName: '', awayTeamName: '' }}
                isLoading={isLoadingModal}
            />
            
            <Link to="/dashboard/fotball-stats" className="back-link">
                ← Tilbake til ligatabellene
            </Link>
        </div>
    );
};

export default TeamDetailsPage;