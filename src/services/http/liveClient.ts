import { Effect, flow } from 'effect';

import * as http from '@/services/http';
import { tgUser } from '@/constants';

export const liveClient = flow(
  http.client,
  Effect.provideService(http.ClientConfig, {
    defaultHeaders: { 'X-tg-data': tgUser, 'Content-Type': 'application/json' },
  }),
);
