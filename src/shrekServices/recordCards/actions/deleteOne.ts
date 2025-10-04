import { Effect, flow } from 'effect';
import { produce } from 'immer';

import { deleteRecord } from '@/api';
import { store } from '@/shrekServices/recordCards';

export const deleteOne = flow(
  (id: number | undefined = store.editableRightNow.getState().fields?.id) => id,
  Effect.fromNullable,

  Effect.tap(id => {
    const { fields, reset } = store.editableRightNow.getState();
    if (id === fields?.id) reset();
  }),

  Effect.andThen(id => Effect.fromNullable(store.getIt()?.get(id))),

  Effect.tap(record =>
    store.mutateAreself(old =>
      produce(old, draft => {
        draft.delete(record.id);
        return draft;
      }),
    ),
  ),

  Effect.andThen(record => deleteRecord(record.id)),
  Effect.runPromiseExit,
);
