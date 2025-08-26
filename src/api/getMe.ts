import { Effect, Schema, Console, pipe } from 'effect';

import { Me } from '@/schemas';
import { externalData } from '@/store';

export const getMe = () =>
  pipe(
    Effect.tryPromise(() =>
      fetch('api/v1/info/me', {
        headers: { 'X-tg-data': String(externalData.getState().user) },
      }).then((res) => res.json()),
    ),

    Effect.tryMap({
      try: (data) => Schema.decodeUnknownSync(Me)(data),
      catch: (error) => error,
    }),

    Effect.tap(Console.debug),
  );
