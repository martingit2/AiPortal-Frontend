// src/components/CreatePortfolioModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { AnalysisModel } from '../types';
import './CreatePortfolioModal.css';

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPortfolioCreated: () => void;
}

interface PortfolioFormData {
  name: string;
  startingBalance: number;
  discordWebhookUrl: string;
  modelId: string; // Lagres som streng fra select-elementet
}

const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({ isOpen, onClose, onPortfolioCreated }) => {
  const [formData, setFormData] = useState<PortfolioFormData>({
    name: '',
    startingBalance: 10000,
    discordWebhookUrl: '',
    modelId: ''
  });
  const [availableModels, setAvailableModels] = useState<AnalysisModel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (!isOpen) return;

    const fetchModels = async () => {
      try {
        const token = await getToken();
        const response = await fetch('http://localhost:8080/api/v1/models', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Kunne ikke hente tilgjengelige modeller.");
        const data: AnalysisModel[] = await response.json();
        setAvailableModels(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, modelId: String(data[0].id) }));
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchModels();
  }, [isOpen, getToken]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = name === 'startingBalance';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getToken();
      const payload = { ...formData, modelId: parseInt(formData.modelId, 10) };
      const response = await fetch('http://localhost:8080/api/v1/portfolios', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Kunne ikke opprette portefølje.');
      }
      onPortfolioCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Opprett Ny Portefølje</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Porteføljenavn</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="modelId">Tilknyttet Modell</label>
            <select id="modelId" name="modelId" value={formData.modelId} onChange={handleChange} required>
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>{model.modelName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="startingBalance">Startsaldo</label>
            <input type="number" id="startingBalance" name="startingBalance" value={formData.startingBalance} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="discordWebhookUrl">Discord Webhook URL (valgfritt)</label>
            <input type="url" id="discordWebhookUrl" name="discordWebhookUrl" value={formData.discordWebhookUrl} onChange={handleChange} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="action-btn" onClick={onClose} disabled={isSubmitting}>Avbryt</button>
            <button type="submit" className="cta-button-outlined" disabled={isSubmitting}>
              {isSubmitting ? 'Oppretter...' : 'Opprett Portefølje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePortfolioModal;