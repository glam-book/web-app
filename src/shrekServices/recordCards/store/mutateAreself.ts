import { setQueryData } from '@/lib/tanstackQuery';
import { type RecordList } from '@/schemas';
import { queriesStore } from '@/shrekServices/recordCards/store/queriesStore';

export const mutateAreself = (
  mutation: (old: typeof RecordList.Type) => void,
) => {
  setQueryData(queriesStore.getState().queries, mutation);
};
