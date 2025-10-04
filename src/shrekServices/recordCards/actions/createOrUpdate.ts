import { Effect, flow } from 'effect';
import { produce } from 'immer';

import { createOrUpdateRecord } from '@/api';
import { Record } from '@/schemas';
import { tryDecodeInto, zipEffectivelyWithSameInput } from '@/utils';
import { store } from '@/shrekServices/recordCards';
import { recordFromRecordWithOptionalId } from '@/shrekServices/recordCards/utils';

export const createOrUpdate = flow(createOrUpdateRecord, tryDecodeInto(Record));


/* export const createOrUpdateOptimistic = flow(
  zipEffectivelyWithSameInput(
    update,
    flow(
      input => Effect.succeed(input),
      Effect.tap(optimistic => {
        store.mutateAreself(old =>
          produce(old, draft => {
            draft.set(optimistic.id, optimistic);
          }),
        );
      }),
      Effect.tap(x => console.log('optimistic:::', x)),
    ),
    { concurrent: true },
  ),

  Effect.tap(([result, optimistic]) =>
    store.mutateAreself(old =>
      produce(old, draft => {
        draft.delete(optimistic.id);
        draft.set(result.id, result);
      }),
    ),
  ),
); */

/* export const createOrUpdateOptimisticRunnable = flow(
  createOrUpdateOptimistic,
  Effect.runPromise,
); */
