import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import './CreateBotModal.css'; // Dedikert CSS

// Definerer hvilke props komponenten tar imot
interface CreateBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBotCreated: () => void; // Funksjon for å oppdatere bot-listen etterpå
}

// Definerer typen for dataen i skjemaet
interface BotFormData {
  name: string;
  sourceType: 'TWITTER' | 'SPORT_API' | 'STOCK_API' | 'CRYPTO_API';
  sourceIdentifier: string;
}

const CreateBotModal: React.FC<CreateBotModalProps> = ({ isOpen, onClose, onBotCreated }) => {
  const [formData, setFormData] = useState<BotFormData>({
    name: '',
    sourceType: 'TWITTER', // Standardverdi
    sourceIdentifier: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  // Returner ingenting hvis modalen ikke skal vises
  if (!isOpen) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        throw new Error('Kunne ikke opprette bot. Prøv igjen.');
      }

      // Suksess!
      onBotCreated(); // Kall funksjonen for å hente bot-listen på nytt
      onClose(); // Lukk modalen
      // Nullstill skjemaet for neste gang
      setFormData({ name: '', sourceType: 'TWITTER', sourceIdentifier: '' });

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
              placeholder="F.eks. 'Fotballnyheter fra Romano'"
              required
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
            >
              <option value="TWITTER">Twitter</option>
              <option value="SPORT_API">Sport API</option>
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
              placeholder="F.eks. 'FabrizioRomano' eller 'TSLA'"
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="action-btn" onClick={onClose} disabled={isSubmitting}>
              Avbryt
            </button>
            <button type="submit" className="cta-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Lagrer...' : 'Lagre Bot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBotModal;