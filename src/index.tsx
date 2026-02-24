if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (event.reason.name === 'AbortError' || event.reason === 'The user aborted a request.')) {
    console.warn('Ignored harmless AbortError');
    event.preventDefault(); // Empêche le crash fatal
  }
});

window.onerror = (msg) => alert(msg);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
} catch (error) {
  alert("Erreur fatale au rendu : " + error);
  console.error("Erreur fatale :", error);
}