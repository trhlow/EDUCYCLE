import { BrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ToastProvider } from '../../components/Toast';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { QueryProvider } from '../../context/QueryProvider';
import { ThemeProvider } from '../../context/ThemeContext';
import { WishlistProvider } from '../../context/WishlistContext';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <WishlistProvider>
                  <ToastProvider>{children}</ToastProvider>
                </WishlistProvider>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryProvider>
  );
}
