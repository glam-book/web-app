import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { enableMapSet } from 'immer';
import { Routes } from '@generouted/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
// import { init } from '@telegram-apps/sdk-react';
import 'scrollyfills';

import { queryClient } from '@/lib/tanstackQuery';

import { App } from './App.tsx';

import './index.css';

// init();

enableMapSet();

// window.Telegram?.WebApp?.disableVerticalSwipes();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Routes />
    </QueryClientProvider>
  </StrictMode>,
);
