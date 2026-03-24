import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/query';
import '@/lib/i18n/config';
import './index.css';
import './styles/global.scss';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#1f2937',
            color: '#f3f4f6',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#f3f4f6' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#f3f4f6' },
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
);
