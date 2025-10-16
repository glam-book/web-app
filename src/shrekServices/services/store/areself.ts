import { setQueryData } from '@/lib/tanstackQuery';
import { type List } from '@/shrekServices/services/schemas';
import { queriesStore } from '@/shrekServices/services/store/queriesStore';

export const mutate = (mutation: (old: typeof List.Type) => void) => {
  setQueryData(queriesStore.getState().queries, mutation);
};
