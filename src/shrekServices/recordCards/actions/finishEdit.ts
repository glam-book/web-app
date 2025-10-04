import { Effect, Option, flow } from 'effect';
import { produce } from 'immer';

import { recordCards } from '@/shrekServices';
import { mutateAreself } from '@/shrekServices/recordCards/store';
import { createOrUpdate } from '@/shrekServices/recordCards/actions/createOrUpdate';
import { store } from '@/shrekServices/recordCards';
import { tap, dictionariesEquals } from '@/utils';
import { RecordWitoutId, RecordWithOptionalId } from '@/schemas';

type EditableRightNowState = ReturnType<
  typeof recordCards.store.editableRightNow.getState
>;

type ActiveEditableRightNowRecord = EditableRightNowState & {
  fields: NonNullable<EditableRightNowState['fields']>;
};

export const finishEdit = flow(
  recordCards.store.editableRightNow.getState,
  tap(state => state.reset()),

  Option.liftPredicate(
    (x): x is ActiveEditableRightNowRecord => x.fields !== undefined,
  ),

  Option.andThen(
    Option.liftPredicate(snapshot => {
      const a = snapshot.fields;
      const b = store.getIt()?.get(a.id);
      return snapshot.isNew || !b || !dictionariesEquals(a, b);
    }),
  ),

  Option.map(snapshot => {
    mutateAreself(old =>
      produce(old, draft => {
        draft.set(snapshot.fields.id, snapshot.fields);
      }),
    );

    return snapshot;
  }),

  Option.map(({ isNew, fields }): typeof RecordWithOptionalId.Type =>
    isNew ? RecordWitoutId.make(fields) : fields,
  ),

  Option.match({
    onNone: () => undefined,
    onSome: flow(createOrUpdate, Effect.runPromiseExit),
  }),
);

export const startEdit = flow(
  RecordWithOptionalId.make,
  store.editableRightNow.getState().setFields,
  store.editableRightNow.getState,

  Option.liftPredicate(
    (x): x is ActiveEditableRightNowRecord => x.isNew && x.fields !== undefined,
  ),

  Option.map(({ fields }) =>
    mutateAreself(old =>
      produce(old, draft => {
        draft.set(fields.id, fields);
      }),
    ),
  ),
);
