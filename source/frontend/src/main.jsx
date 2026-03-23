import './global-shim.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import App from './App';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        {/* GoogleOAuthProvider must wrap the entire app */}
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <NotificationProvider>
              <WishlistProvider>
                <ToastProvider>
                  <App />
                </ToastProvider>
              </WishlistProvider>
            </NotificationProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
