// src/pages/dashboard/DataFeedPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { MessageSquare, RefreshCw, AlertTriangle, Bot, PlayCircle, Trash2 } from 'lucide-react'; // Importer Trash2
import './DataFeedPage.css';
import type { PaginatedResponse } from '../../types';


interface TweetDto {
  id: number;
  tweetId: string;
  authorUsername: string;
  content: string;
  tweetedAt: string;
  sourceBotName: string;
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
      
      const data: PaginatedResponse<TweetDto> = await response.json();
      
      const sortedTweets = data.content.sort((a, b) => new Date(b.tweetedAt).getTime() - new Date(a.tweetedAt).getTime());
      setTweets(sortedTweets);

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
      const response = await fetch('http://localhost:8080/api/v1/analyses/sentiment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweetId: tweetDataId }),
      });
      if (response.status === 202) {
        alert("Analyse startet! Gå til 'Mine Analyser' for å se status.");
      } else {
        const errorText = await response.text();
        throw new Error(`Kunne ikke starte analyse. Server svarte med ${response.status}: ${errorText}`);
      }
    } catch (err: any) {
      alert("Feil: " + err.message);
    }
  };

  /**
   * NY FUNKSJON: Håndterer sletting av en tweet.
   * @param tweetId ID-en (fra vår database) til tweeten som skal slettes.
   */
  const handleDeleteTweet = async (tweetId: number) => {
    if (!window.confirm("Er du sikker på at du vil slette denne tweeten permanent?")) return;

    try {
      const token = await getToken();
      if (!token) throw new Error("Token mangler for sletting.");

      const response = await fetch(`http://localhost:8080/api/v1/tweets/${tweetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) { // Suksess er 200 OK eller 204 No Content
        // Oppdater UI-et ved å fjerne tweeten fra state (optimistic update)
        setTweets(currentTweets => currentTweets.filter(tweet => tweet.id !== tweetId));
      } else {
        throw new Error(`Kunne ikke slette tweet. Serveren svarte med status ${response.status}.`);
      }
    } catch (err: any) {
      console.error("Feil ved sletting av tweet:", err);
      alert("Feil: " + err.message);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      // ... (uendret)
      return (
        <div className="loading-state">
          <RefreshCw className="loading-spinner" size={48} />
          <p>Laster tweet-feed...</p>
        </div>
      );
    }
  
    if (error) {
      // ... (uendret)
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
              <div className="tweet-actions">
                <button 
                  className="action-btn analyze-btn" 
                  title="Start innsiktsanalyse"
                  onClick={() => handleStartAnalysis(tweet.id)}
                >
                  <PlayCircle size={16} />
                  <span>Analyser</span>
                </button>
                <button 
                  className="action-btn delete-btn" 
                  title="Slett denne tweeten"
                  onClick={() => handleDeleteTweet(tweet.id)}
                >
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