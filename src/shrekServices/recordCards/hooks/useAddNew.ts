import { useMutation } from '@tanstack/react-query';
import { produce } from 'immer';

import { recordCards } from '@/shrekServices';
import { Record, RecordList } from '@/schemas';

export const useAddNew = () =>
  useMutation({
    mutationKey: ['addNewRecord'],

    mutationFn: (...[record]: Parameters<typeof recordCards.addNewRunnable>) =>
      recordCards.addNewRunnable(record).catch(() =>
        Record.make({
          id: Date.now(),
          ...record,
        }),
      ),

    onMutate: async (variables, ctx) => {
      const { queries } = recordCards.store.queriesStore.getState();
      await ctx.client.cancelQueries({ queryKey: queries });
      const optimisticValue = Record.make({ id: Date.now(), ...variables });
      const snapshot = ctx.client.getQueryData(queries);

      console.log({ snapshot });

      ctx.client.setQueryData(
        queries,
        (old: typeof RecordList.Type = new Map()) =>
          produce(old, draft => {
            draft.set(optimisticValue.id, optimisticValue);
          }),
      );

      return { optimisticValue, snapshot };
    },

    onSuccess: (result, _variables, onMutateResult, ctx) => {
      console.log('succ');
      const { queries } = recordCards.store.queriesStore.getState();

      ctx.client.setQueryData(queries, (old: typeof RecordList.Type) =>
        produce(old, draft => {
          draft.delete(onMutateResult?.optimisticValue.id ?? NaN);
          draft.set(result.id, result);
        }),
      );
    },

    onError: (error, _variables, onMutateResult, ctx) => {
      console.error('error from mutation:::', error);

      const { queries } = recordCards.store.queriesStore.getState();
      ctx.client.setQueryData(queries, () => onMutateResult?.snapshot);
    },
  });
