import { produce } from 'immer';
import { setQueryData } from '@/lib/tanstackQuery';
import { type RecordList } from '@/schemas';
import { queriesStore } from '@/shrekServices/recordCards/store/queriesStore';

export const mutateAreself = (
  mutation: (old: typeof RecordList.Type) => void,
) => {
  setQueryData(queriesStore.getState().queries, mutation);
};

/* const mutateMap = produce((draft: any, snapshot: any) => {
  draft.set(snapshot.fields.id, snapshot.fields);
}); */
// mutateMap(new Map(), new Map())
