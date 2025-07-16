// src/pages/dashboard/PortfoliosPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Briefcase, RefreshCw, AlertTriangle, PlusCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreatePortfolioModal from '../../components/CreatePortfolioModal';
import type { VirtualPortfolio } from '../../types';
import './PortfoliosPage.css';

const PortfoliosPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<VirtualPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPortfolios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8080/api/v1/portfolios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Kunne ikke hente porteføljer.');
      const data: VirtualPortfolio[] = await response.json();
      setPortfolios(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const handleToggleActive = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Forhindrer at navigeringen til detaljsiden trigges
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8080/api/v1/portfolios/${id}/toggle-active`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Kunne ikke oppdatere status.");
      }
      const updatedPortfolio: VirtualPortfolio = await response.json();
      setPortfolios(current => current.map(p => p.id === id ? updatedPortfolio : p));
    } catch (err: any) {
      setError("Kunne ikke oppdatere status. Prøver å laste på nytt.");
      fetchPortfolios(); 
    }
  };
  
  const handleDeletePortfolio = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Forhindrer at navigeringen til detaljsiden trigges
    if (!window.confirm("Er du sikker? Dette vil slette porteføljen og alle tilhørende bets permanent.")) return;
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8080/api/v1/portfolios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setPortfolios(current => current.filter(p => p.id !== id));
      } else {
        throw new Error("Kunne ikke slette porteføljen.");
      }
    } catch (err: any) {
      setError("Kunne ikke slette porteføljen.");
    }
  };

  const renderContent = () => {
    if (isLoading) return <div className="loading-state"><RefreshCw className="loading-spinner" size={48} /><p>Laster porteføljer...</p></div>;
    if (error) return <div className="error-box full-page-error"><AlertTriangle size={32} /><p>{error}</p></div>;
    if (portfolios.length === 0) {
      return (
        <div className="empty-state">
          <Briefcase size={48} />
          <h3>Ingen Porteføljer Opprettet</h3>
          <p>Start en ny betting-simulering ved å opprette din første portefølje.</p>
        </div>
      );
    }
    return (
      <div className="portfolios-list">
        {portfolios.map(p => {
          const roi = p.startingBalance > 0 ? ((p.currentBalance - p.startingBalance) / p.startingBalance) * 100 : 0;
          return (
            <div 
              key={p.id} 
              className="portfolio-card clickable-card"
              onClick={() => navigate(`/dashboard/portefoljer/${p.id}`)}
              title={`Se detaljer og bet-historikk for ${p.name}`}
            >
              <div className="portfolio-card-header">
                <h3 className="portfolio-name">{p.name}</h3>
                <div className="status-toggle" onClick={(e) => handleToggleActive(e, p.id)} title={p.isActive ? 'Deaktiver' : 'Aktiver'}>
                  <span className={`status-indicator-sm ${p.isActive ? 'active' : 'inactive'}`}></span>
                  <span>{p.isActive ? 'Aktiv' : 'Inaktiv'}</span>
                </div>
              </div>
              <div className="portfolio-card-body">
                <div className="balance-display">
                  <span className="balance-value">{p.currentBalance.toLocaleString('no-NO', { style: 'currency', currency: 'NOK' })}</span>
                  <span className="balance-label">Nåværende Saldo</span>
                </div>
                <div className="balance-display">
                  <span className={`balance-value roi ${roi >= 0 ? 'positive' : 'negative'}`}>{roi.toFixed(1)}%</span>
                  <span className="balance-label">ROI</span>
                </div>
              </div>
              <div className="portfolio-card-footer">
                <span title={p.model.modelName}>Modell: {p.model.modelName}</span>
                 <button className="action-btn delete-btn" onClick={(e) => handleDeletePortfolio(e, p.id)} title="Slett portefølje">
                    <Trash2 size={16} />
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="dashboard-page-title">Porteføljer</h1>
        <button className="cta-button-outlined" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} /> 
          <span>Opprett Ny Portefølje</span>
        </button>
      </div>
      {renderContent()}
      <CreatePortfolioModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPortfolioCreated={fetchPortfolios}
      />
    </div>
  );
};

export default PortfoliosPage;