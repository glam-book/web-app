import { Effect } from 'effect';

import { getMe } from '@/api';

/* export const me = Effect.runPromise(
  getMe().pipe(
    Effect.catchAll((error) => {
      console.warn(error);
      return Effect.succeed({ id: Date.now() });
    }),
  ),
); */
