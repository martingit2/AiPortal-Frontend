// src/components/OddsDetailModal.tsx

import React from 'react';
import { X } from 'lucide-react';

import './OddsDetailModal.css';
import type { UpcomingFixtureWithOdds } from '../types';

interface OddsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: UpcomingFixtureWithOdds | null;
}

const OddsDetailModal: React.FC<OddsDetailModalProps> = ({ isOpen, onClose, fixture }) => {
  if (!isOpen || !fixture) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="odds-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="stats-modal-header">
          <h2>Tilgjengelig Odds</h2>
          <button className="close-button" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="odds-modal-header">
            <h3>{fixture.homeTeamName} vs {fixture.awayTeamName}</h3>
        </div>

        <div className="modal-content-area">
          <table className="odds-detail-table">
            <thead>
              <tr>
                <th>Bookmaker</th>
                <th>Hjemme (1)</th>
                <th>Uavgjort (X)</th>
                <th>Borte (2)</th>
              </tr>
            </thead>
            <tbody>
              {fixture.odds.map((odd, index) => (
                <tr key={index}>
                  <td>{odd.bookmakerName}</td>
                  <td>{odd.homeOdds.toFixed(2)}</td>
                  <td>{odd.drawOdds.toFixed(2)}</td>
                  <td>{odd.awayOdds.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OddsDetailModal;