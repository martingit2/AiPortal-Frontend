// src/components/ModelDetailModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import type { AnalysisModel } from '../types';
import './ModelDetailModal.css';

interface ModelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: AnalysisModel | null;
}

const ModelDetailModal: React.FC<ModelDetailModalProps> = ({ isOpen, onClose, model }) => {
  if (!isOpen || !model) {
    return null;
  }

  // Parse feature importances fra JSON-streng
  let featureImportances: { name: string; importance: number }[] = [];
  try {
    const parsed = JSON.parse(model.featureImportances);
    // 'split' orient lager { index: [...], columns: [...], data: [[...]] }
    featureImportances = parsed.index.map((name: string, i: number) => ({
      name: name,
      importance: parsed.data[i][0]
    }));
  } catch (e) {
    console.error("Could not parse feature importances:", e);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="model-detail-content" onClick={(e) => e.stopPropagation()}>
        <div className="stats-modal-header">
          <h2>Modelldetaljer: {model.modelName}</h2>
          <button className="close-button" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="modal-content-area">
          <div className="report-section">
            <h4>Klassifiseringsrapport</h4>
            <pre>{model.classificationReport}</pre>
          </div>

          <div className="report-section">
            <h4>Feature Importance</h4>
            <table className="feature-importance-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Viktighet (Importance)</th>
                </tr>
              </thead>
              <tbody>
                {featureImportances.map((feature, index) => (
                  <tr key={index}>
                    <td>{feature.name}</td>
                    <td>{feature.importance.toFixed(5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailModal;