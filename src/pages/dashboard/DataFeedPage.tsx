import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { MessageSquare, RefreshCw, AlertTriangle, Bot, PlayCircle } from 'lucide-react';
import './DataFeedPage.css';

// Definerer typen for en enkelt tweet slik den kommer fra backenden (TweetDto)
interface TweetDto {
  id: number;
  tweetId: string;
  authorUsername: string;
  content: string;
  tweetedAt: string;
  sourceBotName: string;
}

// Definerer typen for den paginerte responsen fra Spring Boot
interface PaginatedResponse {
  content: TweetDto[];
  totalPages: number;
  totalElements: number;
  number: number;
}

const DataFeedPage: React.FC = () => {
  const [tweets, setTweets] = useState<TweetDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchTweets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Kunne ikke hente autentiseringstoken.");

      const response = await fetch('http://localhost:8080/api/v1/tweets?page=0&size=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Kunne ikke hente tweet-feed.');
      
      const data: PaginatedResponse = await response.json();
      setTweets(data.content);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  const handleStartAnalysis = async (tweetDataId: number) => {
    if (!window.confirm("Starte en sentimentanalyse for denne tweeten?")) return;
    
    try {
      const token = await getToken();
      if (!token) throw new Error("Token mangler.");

      // ENDRING HER: URL-en peker nå til det nye sentiment-endepunktet
      const response = await fetch('http://localhost:8080/api/v1/analyses/sentiment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweetId: tweetDataId }),
      });

      if (response.status === 202) { // 202 Accepted betyr at jobben er startet
        alert("Analyse startet! Gå til 'Mine Analyser' for å se status.");
      } else {
        const errorText = await response.text();
        throw new Error(`Kunne ikke starte analyse. Server svarte med ${response.status}: ${errorText}`);
      }
    } catch (err: any) {
      alert("Feil: " + err.message);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <RefreshCw className="loading-spinner" size={48} />
          <p>Laster tweet-feed...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="error-box full-page-error">
          <AlertTriangle size={32} style={{marginBottom: '1rem'}} />
          <strong>En feil oppstod</strong>
          <p>{error}</p>
          <button className="cta-button secondary" onClick={fetchTweets}>Prøv igjen</button>
        </div>
      );
    }
  
    if (tweets.length === 0) {
      return (
        <div className="empty-state">
          <MessageSquare size={48} />
          <h3>Ingen data funnet</h3>
          <p>Dine aktive boter har ikke hentet inn noen data ennå. Sjekk bot-status eller vent til neste kjøring.</p>
        </div>
      );
    }

    return (
      <div className="tweet-feed-container">
        {tweets.map(tweet => (
          <div key={tweet.id} className="tweet-card">
            <div className="tweet-header">
              <a 
                href={`https://twitter.com/${tweet.authorUsername}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="tweet-author"
              >
                @{tweet.authorUsername}
              </a>
              <div className="tweet-source-bot" title={`Hentet av boten: ${tweet.sourceBotName}`}>
                <Bot size={14} />
                <span>{tweet.sourceBotName}</span>
              </div>
            </div>
            <p className="tweet-content">{tweet.content}</p>
            <div className="tweet-footer">
                <a 
                    href={`https://twitter.com/${tweet.authorUsername}/status/${tweet.tweetId}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="tweet-time"
                    title={new Date(tweet.tweetedAt).toISOString()}
                >
                    {new Date(tweet.tweetedAt).toLocaleString('no-NO')}
                </a>
              <button 
                className="action-btn analyze-btn" 
                title="Start sentimentanalyse"
                onClick={() => handleStartAnalysis(tweet.id)}
              >
                <PlayCircle size={16} />
                <span>Analyser</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="dashboard-page-title">Data Feed</h1>
        <button className="action-btn" onClick={fetchTweets} disabled={isLoading} title="Oppdater feed">
          <RefreshCw size={16} />
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default DataFeedPage;