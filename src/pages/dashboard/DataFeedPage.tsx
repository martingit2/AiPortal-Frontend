// src/pages/dashboard/DataFeedPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { MessageSquare, RefreshCw, AlertTriangle } from 'lucide-react';
import './DataFeedPage.css'; // Dedikert CSS-fil

// Definerer typen for en enkelt tweet slik den kommer fra backenden
interface TweetData {
  id: number;
  tweetId: string;
  authorUsername: string;
  content: string;
  tweetedAt: string; // Kommer som en ISO 8601 streng
  createdAt: string;
}

// Definerer typen for den paginerte responsen fra Spring Boot
interface PaginatedResponse {
  content: TweetData[];
  totalPages: number;
  totalElements: number;
  number: number; // Nåværende sidenummer (0-basert)
  size: number;
}

const DataFeedPage: React.FC = () => {
  const [tweets, setTweets] = useState<TweetData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Legg til state for paginering hvis du vil bygge ut det senere
  // const [currentPage, setCurrentPage] = useState(0);
  // const [totalPages, setTotalPages] = useState(0);
  
  const { getToken } = useAuth();

  // Funksjon for å hente tweets, pakket inn i useCallback for stabilitet
  const fetchTweets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Kunne ikke hente autentiseringstoken. Prøv å logge inn på nytt.");
      }

      // Vi henter kun første side med 50 tweets for nå
      const response = await fetch('http://localhost:8080/api/v1/tweets?page=0&size=50&sort=createdAt,desc', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        // Prøv å lese feilmelding fra serveren
        const errorBody = await response.text();
        throw new Error(`Kunne ikke hente tweet-feed. Server svarte med status ${response.status}: ${errorBody}`);
      }
      
      const data: PaginatedResponse = await response.json();
      setTweets(data.content);
      // setTotalPages(data.totalPages);
      // setCurrentPage(data.number);

    } catch (e: any) {
      console.error("Feil ved henting av tweet-feed:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  // Hent tweets når komponenten lastes inn for første gang
  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]); // Avhengigheten til fetchTweets (som har getToken) sikrer at kallet gjøres når alt er klart

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
              <a 
                href={`https://twitter.com/${tweet.authorUsername}/status/${tweet.tweetId}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="tweet-time"
                title={new Date(tweet.tweetedAt).toISOString()}
              >
                {new Date(tweet.tweetedAt).toLocaleString('no-NO')}
              </a>
            </div>
            <p className="tweet-content">{tweet.content}</p>
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