// src/components/CreateBotModal.tsx

import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import './CreateBotModal.css';

interface CreateBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBotCreated: () => void;
}

// Oppdater dette interfacet til å inkludere ALLE nye bot-typer
interface BotFormData {
  name: string;
  sourceType: 'TWITTER' | 'SPORT_API' | 'LEAGUE_STATS' | 'HISTORICAL_FIXTURE_DATA' | 'STOCK_API' | 'CRYPTO_API';
  sourceIdentifier: string;
}

const CreateBotModal: React.FC<CreateBotModalProps> = ({ isOpen, onClose, onBotCreated }) => {
  const [formData, setFormData] = useState<BotFormData>({
    name: '',
    sourceType: 'TWITTER',
    sourceIdentifier: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  if (!isOpen) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as BotFormData[keyof BotFormData] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8080/api/v1/bots', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kunne ikke opprette bot. Prøv igjen.');
      }

      onBotCreated();
      onClose();
      setFormData({ name: '', sourceType: 'TWITTER', sourceIdentifier: '' });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hjelpetekst som endrer seg basert på valgt kildetype
  const getPlaceholderText = () => {
    switch (formData.sourceType) {
      case 'TWITTER':
        return "F.eks. 'FabrizioRomano'";
      case 'SPORT_API':
        return "For enkelt-lag: 'ligaId:sesong:lagId'";
      case 'LEAGUE_STATS':
        return "For hel liga (kun lag-stats): 'ligaId:sesong'";
      case 'HISTORICAL_FIXTURE_DATA':
        return "For hel sesong (kamp-stats): 'ligaId:sesong'";
      default:
        return 'Kilde-identifikator';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Opprett Ny Bot</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Navn på Bot</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="F.eks. 'Premier League 2023 Historikk'"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sourceType">Kildetype</label>
            <select
              id="sourceType"
              name="sourceType"
              value={formData.sourceType}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="TWITTER">Twitter</option>
              <option value="SPORT_API">Sport API (Enkelt-lag)</option>
              <option value="LEAGUE_STATS">Liga-statistikk (Oversikt)</option>
              <option value="HISTORICAL_FIXTURE_DATA">Historisk Kampdata (Detaljert)</option>
              <option value="STOCK_API">Aksje API</option>
              <option value="CRYPTO_API">Krypto API</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="sourceIdentifier">Kilde-identifikator</label>
            <input
              type="text"
              id="sourceIdentifier"
              name="sourceIdentifier"
              value={formData.sourceIdentifier}
              onChange={handleChange}
              placeholder={getPlaceholderText()}
              required
              disabled={isSubmitting}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="action-btn" onClick={onClose} disabled={isSubmitting}>
              Avbryt
            </button>
            <button type="submit" className="cta-button-outlined" disabled={isSubmitting}>
              {isSubmitting ? 'Lagrer...' : 'Lagre Bot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBotModal;