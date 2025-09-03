import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { State, Actions } from './types';

export const records = create<State & Actions>()(
  immer((set) => ({
    records: new Map(),

    setRecords: (records) =>
      set((state) => {
        state.records = records;
      }),

    addRecord: (record) =>
      set((state) => {
        state.records.set(record.id, record);
      }),

    removeRecord: (id) => {
      set((state) => {
        state.records.delete(id);
      });
    },
  })),
);
