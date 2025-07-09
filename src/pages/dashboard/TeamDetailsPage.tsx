// src/pages/dashboard/TeamDetailsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { RefreshCw, AlertTriangle, Calendar, Users } from 'lucide-react';
import MatchStatsModal from '../../components/MatchStatsModal';
import './TeamDetailsPage.css'; // Dedikert CSS-fil

// Interface for en kamp, hentet fra backend
interface Fixture {
  id: number;
  date: string;
  homeTeamName: string;
  awayTeamName: string;
  // Du kan legge til mål hvis/når du lagrer dem i Fixture-entiteten
  // goalsHome?: number;
  // goalsAway?: number;
}

// Interface for dataen som sendes til modalen
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
    // Hent teamId og season fra URL-en
    const { teamId, season } = useParams();
    const { getToken } = useAuth();
    
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [teamName, setTeamName] = useState<string>(''); // For å vise lagnavn i tittelen
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // States for modalen
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<ModalData | null>(null);
    const [isLoadingModal, setIsLoadingModal] = useState(false);

    const fetchFixtures = useCallback(async () => {
        if (!teamId || !season) return;
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch(`http://localhost:8080/api/v1/fixtures/team/${teamId}/season/${season}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Kunne ikke hente kampliste for laget.");
            
            const data: Fixture[] = await response.json();
            setFixtures(data);
            
            // Hent lagnavn fra den første kampen for å vise i tittelen
            if (data.length > 0) {
                setTeamName(data[0].homeTeamName === 'Your Team Name' ? data[0].awayTeamName : data[0].homeTeamName);
            }

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [teamId, season, getToken]);

    useEffect(() => {
        fetchFixtures();
    }, [fetchFixtures]);
    
    const handleRowClick = async (fixture: Fixture) => {
        setIsLoadingModal(true);
        setIsModalOpen(true);
        setModalData(null);
        try {
            const token = await getToken();
            const response = await fetch(`http://localhost:8080/api/v1/statistics/fixture/${fixture.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Kunne ikke hente kampstatistikk. Sørg for at den historiske datainnsamleren har kjørt for denne sesongen.");
            const stats = await response.json();
            setModalData({ stats, fixtureInfo: { homeTeamName: fixture.homeTeamName, awayTeamName: fixture.awayTeamName } });
        } catch (err: any) {
            console.error(err);
            setModalData({ stats: [], fixtureInfo: { homeTeamName: 'Feil', awayTeamName: err.message } });
        } finally {
            setIsLoadingModal(false);
        }
    };

    const renderFixtureList = () => {
        if (isLoading) return <div className="loading-state"><RefreshCw className="loading-spinner" /> Laster kamper...</div>;
        if (error) return <div className="error-box full-page-error"><AlertTriangle /> {error}</div>;
        if (fixtures.length === 0) return <div className="empty-state">Ingen kamper funnet for dette laget i denne sesongen.</div>;

        return (
            <div className="stats-table-container">
                <table className="stats-table">
                    <thead>
                        <tr>
                            <th>Dato</th>
                            <th>Hjemmelag</th>
                            <th>Bortelag</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fixtures.map(fixture => (
                            <tr 
                                key={fixture.id} 
                                className="clickable-row" 
                                onClick={() => handleRowClick(fixture)}
                                title="Klikk for å se kampstatistikk"
                            >
                                <td>{new Date(fixture.date).toLocaleDateString('no-NO')}</td>
                                <td className={fixture.homeTeamName === teamName ? 'highlight-team' : ''}>{fixture.homeTeamName}</td>
                                <td className={fixture.awayTeamName === teamName ? 'highlight-team' : ''}>{fixture.awayTeamName}</td>
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
                    Kamper for {teamName || 'Lag'}
                </h1>
                <div className="page-header-info">
                    <span><Calendar size={16} /> Sesong: {season}</span>
                    <span><Users size={16} /> Lag ID: {teamId}</span>
                </div>
            </div>

            {renderFixtureList()}

            <MatchStatsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                stats={modalData?.stats || []}
                fixtureInfo={modalData?.fixtureInfo || { homeTeamName: '', awayTeamName: '' }}
                // isLoading={isLoadingModal} // Kan implementeres for en spinner i modalen
            />
            
            <Link to="/dashboard/fotball-stats" className="back-link">
                ← Tilbake til ligatabellene
            </Link>
        </div>
    );
};

export default TeamDetailsPage;