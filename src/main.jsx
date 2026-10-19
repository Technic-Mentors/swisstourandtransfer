import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { SiteProvider } from './context/SiteContext';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';
import { initAdminTheme } from './hooks/useAdminTheme';
import { initPublicTheme } from './hooks/usePublicTheme';

// Apply the saved admin theme before first paint so the panel never flashes.
initAdminTheme();
initPublicTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SiteProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SiteProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
