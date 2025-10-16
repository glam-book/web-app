import { Effect, flow } from 'effect';
import { produce } from 'immer';

import { tryDecodeInto, zipEffectivelyWithSameInput } from '@/utils';
import { createOrUpdate } from '@/shrekServices/services/api';
import { store } from '@/shrekServices/services';
import { Itself } from '@/shrekServices/services/schemas';

export const createOrUpdateOptimistic = flow(
  zipEffectivelyWithSameInput(
    flow(createOrUpdate, tryDecodeInto(Itself)),
    flow(
      input => ({ id: Date.now(), ...input }),
      Itself.make,
      Effect.succeed,
      Effect.tap(optimistic =>
        store.areself.mutate(old =>
          produce(old, draft => {
            draft.set(optimistic.id, optimistic);
          }),
        ),
      ),
    ),
    { concurrent: true },
  ),

  Effect.tap(([result, optimistic]) =>
    store.areself.mutate(old =>
      produce(old, draft => {
        draft.delete(optimistic.id);
        draft.set(result.id, result);
      }),
    ),
  ),

  Effect.runPromiseExit,
);
