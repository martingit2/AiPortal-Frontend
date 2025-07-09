// src/pages/dashboard/TeamDetailsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { RefreshCw, AlertTriangle, Calendar, Users } from 'lucide-react';
import MatchStatsModal from '../../components/MatchStatsModal';
import './TeamDetailsPage.css';

// ---- Interfacer for datastrukturer ----

// Dette matcher Fixture-entiteten i backend
interface Fixture {
  id: number;
  date: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  goalsHome: number | null;
  goalsAway: number | null;
}

// Dette matcher den nye TeamDetailsDto fra backend
interface TeamDetails {
  teamName: string;
  season: number;
  fixtures: Fixture[];
}

// Data for modalen (fra MatchStatsModal.tsx)
interface MatchStat {
  teamName: string;
  shotsOnGoal: number;
  shotsOffGoal: number;
  totalShots: number;
  blockedShots: number;
  shotsInsideBox: number;
  shotsOutsideBox: number;
  fouls: number;
  cornerKicks: number;
  offsides: number;
  ballPossession: string;
  yellowCards: number;
  redCards: number;
  goalkeeperSaves: number;
  totalPasses: number;
  passesAccurate: number;
  passesPercentage: string;
}

interface ModalData {
  stats: MatchStat[];
  fixtureInfo: { homeTeamName: string; awayTeamName: string };
}

const TeamDetailsPage: React.FC = () => {
    const { teamId, season } = useParams<{ teamId: string; season: string }>();
    const { getToken } = useAuth();
    
    // Forenklet state: én for all data, én for lasting, én for feil
    const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // States for modalen
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<ModalData | null>(null);

    const fetchData = useCallback(async () => {
        if (!teamId || !season) return;
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            // Ett enkelt, rent API-kall
            const response = await fetch(`http://localhost:8080/api/v1/fixtures/team-details/team/${teamId}/season/${season}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Fant ingen kamper for dette laget i den valgte sesongen. Har den historiske datainnsamleren kjørt?");
                }
                throw new Error("En ukjent feil oppstod ved henting av kampdata.");
            }
            const data: TeamDetails = await response.json();
            setTeamDetails(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [teamId, season, getToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleRowClick = async (fixture: Fixture) => {
        setIsModalOpen(true);
        setModalData(null);
        try {
            const token = await getToken();
            const response = await fetch(`http://localhost:8080/api/v1/statistics/fixture/${fixture.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error("Statistikk for denne kampen er ikke tilgjengelig.");
            }
            const stats = await response.json();
            setModalData({ stats, fixtureInfo: { homeTeamName: fixture.homeTeamName, awayTeamName: fixture.awayTeamName } });
        } catch (err: any) {
            console.error(err);
            setModalData({ stats: [], fixtureInfo: { homeTeamName: 'Feil', awayTeamName: err.message } });
        }
    };

    const renderContent = () => {
        if (isLoading) return <div className="loading-state"><RefreshCw className="loading-spinner" /> Laster kamper...</div>;
        if (error) return <div className="error-box full-page-error"><AlertTriangle /> {error}</div>;
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
                    Kamper for {teamDetails?.teamName || `Lag ID: ${teamId}`}
                </h1>
                <div className="page-header-info">
                    <span><Calendar size={16} /> Sesong: {season}</span>
                </div>
            </div>

            {renderContent()}

            <MatchStatsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                stats={modalData?.stats || []}
                fixtureInfo={modalData?.fixtureInfo || { homeTeamName: '', awayTeamName: '' }}
            />
            
            <Link to="/dashboard/fotball-stats" className="back-link">
                ← Tilbake til ligatabellene
            </Link>
        </div>
    );
};

export default TeamDetailsPage;