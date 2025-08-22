import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { enableMapSet } from 'immer';
import { init } from '@telegram-apps/sdk-react';
import 'scrollyfills';

import { App } from './App.tsx';

import './index.css';

// init();

enableMapSet();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
