import { createRoot } from 'react-dom/client';

import '@fontsource/roboto-condensed/400.css';
import '@fontsource/roboto-condensed/500.css';
import '@fontsource/roboto-condensed/700.css';

import App from '@/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/hooks/AuthContext';
import { bootstrapAuth } from '@/services/bootstrap';

import './styles/main.css';

const authService = bootstrapAuth();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <AuthProvider authService={authService}>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);
