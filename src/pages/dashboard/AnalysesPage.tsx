import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { FileText, RefreshCw, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import './AnalysesPage.css'; // Dedikert CSS-fil

// Typer for analyse-data
interface Analysis {
  id: number;
  name: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  result: string; // JSON-streng
  createdAt: string;
  completedAt: string | null;
}

const AnalysesPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchAnalyses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8080/api/v1/analyses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Kunne ikke hente analyser.');
      }
      const data: Analysis[] = await response.json();
      setAnalyses(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAnalyses();
    // Sett opp en poller for å oppdatere status automatisk hvert 10. sekund
    const interval = setInterval(fetchAnalyses, 10000); 
    return () => clearInterval(interval); // Rydd opp intervallet når komponenten unmountes
  }, [fetchAnalyses]);

  const renderStatusIcon = (status: Analysis['status']) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={18} className="status-icon completed" />;
      case 'RUNNING': return <RefreshCw size={18} className="status-icon running loading-spinner" />;
      case 'FAILED': return <XCircle size={18} className="status-icon failed" />;
      case 'QUEUED': return <Clock size={18} className="status-icon queued" />;
      default: return null;
    }
  };

  const renderContent = () => {
    if (isLoading && analyses.length === 0) return <p className="loading-indicator">Laster analyser...</p>;
    if (error) return <div className="error-box">Feil: {error}</div>;
    if (analyses.length === 0) {
      return (
        <div className="empty-state">
          <FileText size={48} />
          <h3>Ingen analyser startet</h3>
          <p>Gå til Data Feed for å velge data og starte din første analyse.</p>
        </div>
      );
    }

    return (
      <div className="analyses-list">
        {analyses.map(analysis => (
          <div key={analysis.id} className="analysis-card">
            <div className="analysis-status">
              {renderStatusIcon(analysis.status)}
              <span>{analysis.status}</span>
            </div>
            <h3 className="analysis-name">{analysis.name}</h3>
            <div className="analysis-details">
              <span>Opprettet: {new Date(analysis.createdAt).toLocaleString('no-NO')}</span>
              {analysis.completedAt && <span>Fullført: {new Date(analysis.completedAt).toLocaleString('no-NO')}</span>}
            </div>
            {analysis.status === 'COMPLETED' && (
              <details className="analysis-result">
                <summary>Vis Resultat</summary>
                <pre>{JSON.stringify(JSON.parse(analysis.result), null, 2)}</pre>
              </details>
            )}
            {analysis.status === 'FAILED' && (
                 <div className="analysis-error-result">
                    <strong>Feil:</strong>
                    <p>{analysis.result}</p>
                 </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="dashboard-page-title">Mine Analyser</h1>
        <button className="action-btn" onClick={fetchAnalyses} disabled={isLoading} title="Oppdater liste">
          <RefreshCw size={16} />
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default AnalysesPage;