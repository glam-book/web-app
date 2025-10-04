import { getQueryData } from '@/lib/tanstackQuery';
import { type RecordList } from '@/schemas';
import { queriesStore } from '@/shrekServices/recordCards/store/queriesStore';

export const getIt = () =>
  getQueryData<typeof RecordList.Type>(queriesStore.getState().queries);
