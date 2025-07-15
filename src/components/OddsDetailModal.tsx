// src/components/OddsDetailModal.tsx

import React from 'react';
import { X } from 'lucide-react';
import type { UpcomingFixtureWithOdds } from '../types';
import './OddsDetailModal.css';

interface OddsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: UpcomingFixtureWithOdds | null;
}

const OddsDetailModal: React.FC<OddsDetailModalProps> = ({ isOpen, onClose, fixture }) => {
  if (!isOpen || !fixture) {
    return null;
  }

  const oddsByBookmaker = fixture.odds.reduce((acc, odd) => {
    (acc[odd.bookmakerName] = acc[odd.bookmakerName] || []).push(odd);
    return acc;
  }, {} as Record<string, typeof fixture.odds>);

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
          {Object.entries(oddsByBookmaker).map(([bookmakerName, oddsList]) => (
            <div key={bookmakerName} className="bookmaker-section">
              <h4>{bookmakerName}</h4>
              {oddsList.map((market, marketIndex) => (
                <div key={marketIndex} className="market-section">
                  <h5>{market.betName}</h5>
                  <table className="odds-detail-table">
                    <thead>
                      <tr>
                        <th>Valg</th>
                        {market.odds[0]?.handicap && <th>Handicap</th>}
                        {market.odds[0]?.points && <th>Linje</th>}
                        <th>Odds</th>
                      </tr>
                    </thead>
                    <tbody>
                      {market.odds.map((detail, detailIndex) => (
                        <tr key={detailIndex}>
                          <td>{detail.name}</td>
                          {detail.handicap && <td>{detail.handicap}</td>}
                          {detail.points && <td>{detail.points}</td>}
                          <td>{detail.odds.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OddsDetailModal;