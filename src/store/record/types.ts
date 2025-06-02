import { RecordList, Record } from '@/schemas';

export type Rec = typeof Record.Type;

export type State = {
  records: typeof RecordList.Type;
};

export type Actions = {
  setRecords: (records: State['records']) => void;
  addRecord: (record: Rec) => void;
  addRandom: () => void;
};
