// src/pages/dashboard/ModelsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BrainCircuit, RefreshCw, AlertTriangle, Trash2, Eye, Target, ArrowDownUp } from 'lucide-react';

import type { AnalysisModel } from '../../types';
import './ModelsPage.css';
import ModelDetailModal from '../../components/ModelDetailModal';

const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<AnalysisModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AnalysisModel | null>(null);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8080/api/v1/models', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Kunne ikke hente modeller.');
      const data: AnalysisModel[] = await response.json();
      setModels(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleDeleteModel = async (id: number) => {
    if (!window.confirm("Er du sikker på at du vil slette denne modell-oppføringen? Handlingen kan ikke angres.")) return;
    
    const originalModels = models;
    setModels(currentModels => currentModels.filter(m => m.id !== id));

    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8080/api/v1/models/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        setModels(originalModels);
        throw new Error('Kunne ikke slette modellen.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openModal = (model: AnalysisModel) => {
    setSelectedModel(model);
    setIsModalOpen(true);
  };
  
  const getMarketTypeClass = (marketType: string) => {
    if (marketType.includes('MATCH_WINNER')) return 'match-winner';
    if (marketType.includes('OVER_UNDER')) return 'over-under';
    return '';
  };
  
  const getMarketTypeIcon = (marketType: string) => {
    if (marketType.includes('MATCH_WINNER')) return <Target size={14} />;
    if (marketType.includes('OVER_UNDER')) return <ArrowDownUp size={14} />;
    return null;
  };

  const renderContent = () => {
    if (isLoading) return <div className="loading-state"><RefreshCw className="loading-spinner" size={48} /><p>Laster modeller...</p></div>;
    if (error) return <div className="error-box full-page-error"><AlertTriangle size={32} /><p>{error}</p></div>;
    if (models.length === 0) {
      return (
        <div className="empty-state">
          <BrainCircuit size={48} />
          <h3>Ingen Modeller Registrert</h3>
          <p>Kjør et treningsskript i ML-tjenesten for å registrere din første modell her.</p>
        </div>
      );
    }

    return (
      <div className="models-list">
        {models.map(model => (
          <div key={model.id} className="model-card">
            <div className="model-card-header">
              <h3 className="model-name">{model.modelName}</h3>
              <span className={`market-type-badge ${getMarketTypeClass(model.marketType)}`}>
                {getMarketTypeIcon(model.marketType)} {model.marketType.replace('_', ' ')}
              </span>
            </div>
            <div className="model-card-body">
              <div className="metric-display">
                <span className="metric-value accuracy">{(model.accuracy * 100).toFixed(1)}%</span>
                <span className="metric-label">Nøyaktighet</span>
              </div>
              <div className="metric-display">
                <span className="metric-value log-loss">{model.logLoss.toFixed(3)}</span>
                <span className="metric-label">Log Loss</span>
              </div>
            </div>
            <div className="model-card-footer">
              <span>Trent: {new Date(model.trainingTimestamp).toLocaleString('no-NO')}</span>
              <div className="bot-card-actions">
                 <button className="action-btn" onClick={() => openModal(model)} title="Vis detaljer">
                    <Eye size={16} />
                 </button>
                 <button className="action-btn delete-btn" onClick={() => handleDeleteModel(model.id)} title="Slett">
                    <Trash2 size={16} />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="dashboard-page-title">Modell-laboratorium</h1>
        <button className="action-btn" onClick={fetchModels} disabled={isLoading} title="Oppdater liste">
          <RefreshCw size={16} />
        </button>
      </div>
      {renderContent()}
      
      <ModelDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        model={selectedModel}
      />
    </div>
  );
};

export default ModelsPage;