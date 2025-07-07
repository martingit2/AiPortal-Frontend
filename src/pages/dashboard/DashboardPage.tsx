// src/pages/dashboard/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import './DashboardPage.css'; // Importer en dedikert CSS-fil for denne siden

const DashboardPage: React.FC = () => {
    const { getToken, userId } = useAuth();
    const [userDataFromBackend, setUserDataFromBackend] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSecureData = async () => {
            setIsLoading(true);
            try {
                // Hent JWT-tokenet fra Clerk
                const token = await getToken();
                console.log("Clerk JWT Token:", token);
            
                if (!token) {
                    throw new Error("Kunne ikke hente autentiseringstoken.");
                }

                // Kall det sikrede endepunktet på backenden
                const response = await fetch('http://localhost:8080/api/v1/secure/me', { // Pass på at porten (8080) er korrekt
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP-feil! Status: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                setUserDataFromBackend(data);
                setError(null);

            } catch (e: any) {
                console.error("Feil ved henting av sikret brukerdata:", e);
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSecureData();
    }, [getToken]);

    return (
        // Den ytre div-en er ikke lenger nødvendig siden DashboardLayout håndterer padding
        // Men vi kan ha en wrapper hvis vi vil ha egne stiler for siden
        <div className="dashboard-page">
            <h1 className="dashboard-page-title">Dashboard Oversikt</h1>
            
            {/* Midlertidig seksjon for å vise API-kommunikasjon */}
            <div className="api-test-section">
                <h2>Sikker API-kommunikasjon</h2>
                <p>Her er data hentet fra et beskyttet endepunkt (`/api/v1/secure/me`) på din Spring Boot-server.</p>

                {isLoading && <div className="loading-indicator">Laster sikret brukerdata...</div>}
                
                {error && (
                    <div className="error-box">
                        <strong>Feil ved API-kall:</strong>
                        <pre>{error}</pre>
                    </div>
                )}
                
                {userDataFromBackend && (
                    <div className="data-box">
                        <h3>Data mottatt fra Backend:</h3>
                        <pre>{JSON.stringify(userDataFromBackend, null, 2)}</pre>
                    </div>
                )}

                <hr style={{margin: '2rem 0'}} />
                <p><strong>Clerk User ID (fra frontend hook):</strong> {userId}</p>
            </div>
        </div>
    );
};

export default DashboardPage;