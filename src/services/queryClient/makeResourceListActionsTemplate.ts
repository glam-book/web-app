import { Effect, flow } from 'effect';
import { type Draft, produce } from 'immer';
import { useQuery } from '@tanstack/react-query';

import { makeQueriesStore } from '@/store';
import { rest } from '@/services';
import { contramap } from '@/utils';
import {
  setQueryData,
  getQueryData,
  invalidateQueries,
} from '@/lib/tanstackQuery';

export const makeResourceListActionsTemplate = <
  T extends { id: number },
  T0 extends { id: number },
  A extends unknown[],
>(
  options: Omit<
    Parameters<typeof rest.makeResourceListActions<T, T0, A>>[number],
    'resourceStoreActions'
  >,
) => {
  const mutateList = (
    mutation: (old?: Map<number, typeof options.Itself.Type>) => unknown,
  ) => {
    setQueryData(queriesStore.getState().queries, mutation);
  };

  const queriesStore = makeQueriesStore();

  const queryActions: Parameters<
    typeof rest.makeResourceListActions<T, T0, A>
  >[number]['resourceStoreActions'] = {
    deleteOne: id =>
      mutateList(old =>
        produce(old, draft => {
          if (id !== undefined) draft?.delete(id);
        }),
      ),

    setOne: item =>
      mutateList((old = new Map()) =>
        produce(old, draft => {
          draft.set(item.id, item as Draft<T>);
        }),
      ),

    getOne: id =>
      getQueryData<Map<number, typeof options.Itself.Type>>(
        queriesStore.getState().queries,
      )?.get(id),
  };

  const actions = rest.makeResourceListActions<T, T0, A>({
    ...options,
    resourceStoreActions: queryActions,
  });

  const fetchList = flow(
    contramap(actions.fetchList, (...args) => {
      queriesStore.setState({ queries: [options.resource, ...args] });
      return args;
    }),
    Effect.runPromise,
  );

  const useGet = (...params: Partial<Parameters<typeof fetchList>>) =>
    useQuery({
      queryKey: [options.resource, ...params],
      enabled: params.every(Boolean),
      queryFn: () => fetchList(...(params as Parameters<typeof fetchList>)),
    });

  const deleteOne = flow(actions.deleteOneOptimistic, Effect.runPromiseExit);

  const finishEdit = flow(actions.finishEdit, x => {
    if (x) return Effect.runPromiseExit(x);
  });

  return {
    useGet,
    deleteOne,
    finishEdit,
    resetEdit: actions.resetEdit,
    startEdit: actions.startEdit,
    store: {
      editableRightNow: actions.store.editableRightNow,
      listActions: queryActions,
    },
  } as const;
};
