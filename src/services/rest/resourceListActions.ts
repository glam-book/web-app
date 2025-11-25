import { Effect, Schema, flow, pipe } from 'effect';
import { create } from 'zustand';

import { rest } from '@/services';
import { deepEqual, tryDecodeInto } from '@/utils';
import { MapFromArrayWithIdsOrUndefined } from '@/transformers';

type State<T> = {
  fields?: T;
  isNew: boolean;
};

type Actions = {
  reset: () => void;
};

const makeEditableRightNowStore = <T extends { id: number }>() =>
  create<State<T> & Actions>()((set, _get, api) => ({
    fields: undefined,
    isNew: false,

    reset: () => {
      set(api.getInitialState());
    },
  }));

export const makeResourceListActions = function <
  T extends { id: number },
  T0 extends { id: number },
  A extends unknown[],
  W extends Omit<T, 'id'> = Omit<T, 'id'>,
  O extends W & { id?: number } = W & { id?: number },
>({
  Itself,
  resource,
  adapter,
  resourceStoreActions,
}: {
  Itself: Schema.Schema<T, T0>;
  resource: string;
  adapter: (...args: A) => string;
  resourceStoreActions: {
    deleteOne: (id?: number) => void;
    setOne: (item: T) => void;
    getOne: (id: number) => T | undefined;
  };
}) {
  const fetchList = flow(
    adapter,
    queryString => `${resource}/list/${queryString}`,
    rest.client,
    tryDecodeInto(MapFromArrayWithIdsOrUndefined(Itself)),
  );

  const createOrUpdate = (item: Omit<T0, 'id'> & { id?: number }) =>
    pipe(
      [
        resource,
        {
          method: 'POST',
          body: JSON.stringify(item),
        },
      ] as const,
      params => rest.client(...params),
      tryDecodeInto(Itself),
    );

  const editableRightNow = makeEditableRightNowStore<T>();

  const resetEdit = () => {
    const { fields, isNew, reset } = editableRightNow.getState();
    if (isNew) resourceStoreActions.deleteOne(fields?.id);
    reset();
  };

  const finishEdit = () => {
    const { fields, isNew } = editableRightNow.getState();

    editableRightNow.getState().reset();

    if (fields === undefined) return;

    const b = resourceStoreActions.getOne(fields.id);
    const isThereAnyPointInMovingForward = isNew || !b || !deepEqual(fields, b);

    if (!isThereAnyPointInMovingForward) return;

    resourceStoreActions.setOne(fields);

    return pipe(
      Schema.encodeSync(Itself)(fields),
      ({ id, ...withoutId }) => (isNew ? withoutId : { id, ...withoutId }),
      createOrUpdate,
      Effect.tap(result => {
        resourceStoreActions.deleteOne(fields.id);
        resourceStoreActions.setOne(result);
      }),
    );
  };

  const startEdit = (item: O) => {
    const { id = Date.now(), ...withoutId } = item;
    const editableRightNowState = editableRightNow.getState();

    if (editableRightNowState.fields?.id === id) return;

    // fiber test
    const fiber = finishEdit()?.pipe(Effect.runFork);

    const optimistic = { ...withoutId, id };

    editableRightNow.setState({
      isNew: item.id === undefined,
      fields: optimistic as unknown as T,
    });

    resourceStoreActions.setOne(optimistic as unknown as T);

    return fiber;
  };

  const deleteOne = (id: number) =>
    pipe(
      [`${resource}/${id}`, { method: 'DELETE' }] as const,
      params => rest.client(...params),
      tryDecodeInto(Schema.Struct({ success: Schema.Boolean })),
    );

  const deleteOneOptimistic = (id = editableRightNow.getState().fields?.id) =>
    pipe(
      id,
      Effect.fromNullable,
      Effect.tap(resourceStoreActions.deleteOne),
      Effect.andThen(xid => {
        const { fields, isNew, reset } = editableRightNow.getState();
        const recordIsBeingEditedRightNow = xid === fields?.id;
        if (recordIsBeingEditedRightNow) reset();
        return recordIsBeingEditedRightNow && isNew ? undefined : xid;
      }),
      Effect.andThen(Effect.fromNullable),
      Effect.andThen(deleteOne),
    );

  return {
    fetchList,
    createOrUpdate,
    deleteOne,

    deleteOneOptimistic,
    startEdit,
    resetEdit,
    finishEdit,

    store: {
      editableRightNow,
    },
  } as const;
};
