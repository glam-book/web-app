import type { RecordList } from '@/schemas';

export type State = {
  records: typeof RecordList.Type;
};

export type Actions = {
  delete: (id: number) => void;
};
