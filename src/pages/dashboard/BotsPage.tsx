// src/pages/dashboard/BotsPage.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Bot, Trash2, Play, Pause, PlusCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import './BotsPage.css';
import CreateBotModal from '../../components/CreateBotModal';

interface BotConfig {
  id: number;
  name: string;
  sourceType: 'TWITTER' | 'SPORT_API' | 'LEAGUE_STATS' | 'STOCK_API' | 'CRYPTO_API';
  sourceIdentifier: string;
  status: 'ACTIVE' | 'PAUSED' | 'ERROR';
  lastRun: string | null;
}

const sourceTypeTitles: Record<string, string> = {
  TWITTER: 'Twitter Boter',
  SPORT_API: 'Sport API Boter (Enkelt-lag)',
  LEAGUE_STATS: 'Liga-Statistikk Boter',
  STOCK_API: 'Aksje-API Boter',
  CRYPTO_API: 'Krypto-API Boter'
};

const BotsPage: React.FC = () => {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getToken } = useAuth();

  const fetchBots = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8080/api/v1/bots', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Kunne ikke hente bot-data.');
      const data: BotConfig[] = await response.json();
      setBots(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const handleToggleStatus = async (botId: number, currentStatus: BotConfig['status']) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setBots(currentBots => 
      currentBots.map(bot => bot.id === botId ? { ...bot, status: newStatus } : bot)
    );
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8080/api/v1/bots/${botId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        setBots(currentBots => currentBots.map(bot => bot.id === botId ? { ...bot, status: currentStatus } : bot));
        throw new Error('Kunne ikke oppdatere bot-status.');
      }
    } catch (err: any) {
      console.error("Feil ved statusendring:", err);
      setError(err.message); 
    }
  };

  const handleDeleteBot = async (botId: number) => {
    if (!window.confirm("Er du sikker på at du vil slette denne boten? Handlingen kan ikke angres.")) return;
    const originalBots = bots;
    setBots(currentBots => currentBots.filter(bot => bot.id !== botId));
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8080/api/v1/bots/${botId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        setBots(originalBots);
        throw new Error('Kunne ikke slette boten.');
      }
    } catch (err: any) {
      console.error("Feil ved sletting:", err);
      setError(err.message);
      setBots(originalBots);
    }
  };
  
  const groupedAndSortedBots = useMemo(() => {
    if (bots.length === 0) return {};

    const grouped = bots.reduce((acc, bot) => {
      (acc[bot.sourceType] = acc[bot.sourceType] || []).push(bot);
      return acc;
    }, {} as Record<string, BotConfig[]>);

    for (const type in grouped) {
      grouped[type as keyof typeof grouped].sort((a, b) => {
        const statusA = a.status === 'ACTIVE' ? 0 : 1;
        const statusB = b.status === 'ACTIVE' ? 0 : 1;
        if (statusA !== statusB) {
          return statusA - statusB;
        }
        return a.name.localeCompare(b.name);
      });
    }

    return grouped;
  }, [bots]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <RefreshCw className="loading-spinner" size={48} />
          <p>Laster boter...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="error-box full-page-error">
          <AlertTriangle size={32} style={{marginBottom: '1rem'}} />
          <strong>En feil oppstod</strong>
          <p>{error}</p>
          <button className="cta-button secondary" onClick={() => fetchBots()}>Prøv igjen</button>
        </div>
      );
    }
    if (bots.length === 0) {
      return (
        <div className="empty-state">
          <Bot size={48} />
          <h3>Ingen boter funnet</h3>
          <p>Kom i gang ved å opprette din første datainnhentings-bot.</p>
          <button className="cta-button-outlined" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={18} /> 
            <span>Opprett Ny Bot</span>
          </button>
        </div>
      );
    }

    return (
      <div className="bots-page-container">
        {Object.entries(groupedAndSortedBots).map(([type, botList]: [string, BotConfig[]]) => (
          <section key={type} className="bot-group-section">
            <h2 className="bot-group-title">{sourceTypeTitles[type] || type}</h2>
            <div className="bots-list">
              {botList.map((bot) => ( // Nå vet TS at 'bot' er av typen BotConfig
                <div key={bot.id} className="bot-card">
                  <div className="bot-card-header">
                    <span className={`status-indicator status-${bot.status.toLowerCase()}`} title={`Status: ${bot.status}`}></span>
                    <h3 className="bot-name">{bot.name}</h3>
                    <span className="bot-type">{bot.sourceType.replace('_', ' ')}</span>
                  </div>
                  <div className="bot-card-body">
                    <p><strong>Kilde:</strong> <span>{bot.sourceIdentifier}</span></p>
                    <p><strong>Siste kjøring:</strong> <span>{bot.lastRun ? new Date(bot.lastRun).toLocaleString('no-NO') : 'Aldri'}</span></p>
                  </div>
                  <div className="bot-card-actions">
                    <button 
                      onClick={() => handleToggleStatus(bot.id, bot.status)} 
                      className="action-btn toggle-btn"
                      aria-label={bot.status === 'ACTIVE' ? 'Pause bot' : 'Start bot'}
                      title={bot.status === 'ACTIVE' ? 'Pause' : 'Start'}
                    >
                      {bot.status === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button 
                      onClick={() => handleDeleteBot(bot.id)} 
                      className="action-btn delete-btn"
                      aria-label="Slett bot"
                      title="Slett"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };
  
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="dashboard-page-title">Mine Boter</h1>
        {bots.length > 0 && 
          <button className="cta-button-outlined" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={18} /> 
            <span>Opprett Ny Bot</span>
          </button>
        }
      </div>
      {renderContent()}

      <CreateBotModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBotCreated={fetchBots}
      />
    </div>
  );
};

export default BotsPage;