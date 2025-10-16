import { Effect, Schema, flow } from 'effect';
import { format } from 'date-fns';
import { produce } from 'immer';
import { useQuery } from '@tanstack/react-query';

import { makeQueriesStore } from '@/store';
import { setQueryData, getQueryData } from '@/lib/tanstackQuery';
import { rest } from '@/services';
import { Record as Itself } from '@/schemas/Record';
import { contramap } from '@/utils';

const resource = 'record';

const queriesStore = makeQueriesStore();

const mutateRecordList = (
  mutation: (old: Map<number, typeof Itself.Type>) => unknown,
) => setQueryData(queriesStore.getState().queries, mutation);

const actions = rest.makeResourceListActions({
  resource,
  Itself,
  adapter: (userId: number | string, date: Date) =>
    `${userId}?date=${format(date, 'yyyy-MM-dd')}`,

  resourceStoreActions: {
    deleteOne: id =>
      mutateRecordList(old =>
        produce(old, draft => {
          draft.delete(id);
        }),
      ),

    setOne: item =>
      mutateRecordList((old = new Map()) =>
        produce(old, draft => {
          draft.set(item.id, item);
        }),
      ),

    getOne: id =>
      getQueryData<Map<number, typeof Itself.Type>>(
        queriesStore.getState().queries,
      )?.get(id),
  },
});

const fetchList = flow(
  contramap(actions.fetchList, (...args) => {
    queriesStore.setState({ queries: [resource, ...args] });
    return args;
  }),
  Effect.runPromise,
);

export const useGet = (...params: Partial<Parameters<typeof fetchList>>) =>
  useQuery({
    queryKey: [resource, ...params],
    queryFn: () => {
      if (params.every(Boolean)) {
        return fetchList(...(params as Parameters<typeof fetchList>));
      }
    },
  });

export const deleteOne = flow(
  actions.deleteOneOptimistic,
  Effect.runPromiseExit,
);

export const finishEdit = flow(
  actions.finishEdit,
  x => x !== undefined && Effect.runPromiseExit(x),
);

export const startEdit = flow(
  Schema.Struct({
    ...Itself.fields,
    id: Schema.optional(Schema.Number),
  }).make,
  actions.startEdit,
);

export const { store } = actions;
