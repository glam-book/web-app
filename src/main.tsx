import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { enableMapSet } from 'immer';
import { Routes } from '@generouted/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  init,
  mockTelegramEnv,
  emitEvent,
  swipeBehavior,
  retrieveLaunchParams,
  retrieveRawInitData,
} from '@tma.js/sdk-react';

import 'scrollyfills';

import { queryClient } from '@/lib/tanstackQuery';

import './index.css';

enableMapSet();

if (import.meta.env.DEV) {
  const noInsets = {
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  } as const;
  const themeParams = {
    accent_text_color: '#6ab2f2',
    bg_color: '#17212b',
    button_color: '#5288c1',
    button_text_color: '#ffffff',
    destructive_text_color: '#ec3942',
    header_bg_color: '#17212b',
    hint_color: '#708499',
    link_color: '#6ab3f3',
    secondary_bg_color: '#232e3c',
    section_bg_color: '#17212b',
    section_header_text_color: '#6ab3f3',
    subtitle_text_color: '#708499',
    text_color: '#f5f5f5',
  } as const;

  mockTelegramEnv({
    launchParams: {
      tgWebAppThemeParams: themeParams,
      tgWebAppData: new URLSearchParams([
        [
          'user',
          JSON.stringify({
            id: 1,
            first_name: 'Pavel',
          }),
        ],
        ['hash', ''],
        ['signature', ''],
        ['auth_date', Date.now().toString()],
      ]),
      tgWebAppStartParam: 'debug',
      tgWebAppVersion: '8',
      tgWebAppPlatform: 'tdesktop',
    },
    onEvent(e) {
      if (e.name === 'web_app_request_theme') {
        return emitEvent('theme_changed', { theme_params: themeParams });
      }
      if (e.name === 'web_app_request_viewport') {
        return emitEvent('viewport_changed', {
          height: window.innerHeight,
          width: window.innerWidth,
          is_expanded: true,
          is_state_stable: true,
        });
      }
      if (e.name === 'web_app_request_content_safe_area') {
        return emitEvent('content_safe_area_changed', noInsets);
      }
      if (e.name === 'web_app_request_safe_area') {
        return emitEvent('safe_area_changed', noInsets);
      }
    },
  });
}

init();

// console.log(retrieveRawInitData());
// console.log(retrieveLaunchParams().tgWebAppData?.start_param);
console.log(retrieveLaunchParams().tgWebAppPlatform);

// window.Telegram?.WebApp?.disableVerticalSwipes();
swipeBehavior.mount();
swipeBehavior.disableVertical();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Routes />
    </QueryClientProvider>
  </StrictMode>,
);
