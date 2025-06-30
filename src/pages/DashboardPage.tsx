import React, { useEffect, useState } from 'react';
import { UserButton, useAuth } from '@clerk/clerk-react';

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
                if (!token) {
                    throw new Error("Kunne ikke hente autentiseringstoken.");
                }

                // Kall det sikrede endepunktet på backenden
                const response = await fetch('http://localhost:8081/api/v1/secure/me', { // SJEKK AT PORTEN ER KORREKT
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
    }, [getToken]); // useEffect kjører når komponenten lastes og getToken-funksjonen er tilgjengelig

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <h1>Aracanix Dashboard</h1>
                <UserButton afterSignOutUrl="/" />
            </header>
            
            <main>
                <h2>Sikker API-kommunikasjon</h2>
                <p>Her er data hentet fra et beskyttet endepunkt (`/api/v1/secure/me`) på din Spring Boot-server.</p>

                {isLoading && <p>Laster sikret brukerdata fra backend...</p>}
                
                {error && (
                    <div style={{ color: 'red', border: '1px solid red', padding: '1rem', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
                        <strong>Feil ved API-kall:</strong>
                        <pre>{error}</pre>
                    </div>
                )}
                
                {userDataFromBackend && (
                    <div style={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: '1.6' }}>
                        <h3>Data mottatt fra Backend:</h3>
                        <pre>{JSON.stringify(userDataFromBackend, null, 2)}</pre>
                    </div>
                )}

                <hr style={{margin: '2rem 0'}} />
                <p><strong>Clerk User ID (hentet fra frontend hook):</strong> {userId}</p>
            </main>
        </div>
    );
};

export default DashboardPage;