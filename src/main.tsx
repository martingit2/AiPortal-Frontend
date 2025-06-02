// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react'; // <--- IMPORTER


// Importer publishable key fra environment variabler
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        // localization={daDK} // Valgfritt: Hvis du vil ha dansk/norsk tekst på Clerk-komponenter
        // appearance={{ // Valgfritt: For å style Clerk-komponenter
        //   baseTheme: dark, // Eksempel, hvis du har et mørkt tema
        //   variables: {
        //     colorPrimary: 'var(--primary-purple)' // Bruk CSS-variabler for konsistens
        //   }
        // }}
      >
        <App />
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);