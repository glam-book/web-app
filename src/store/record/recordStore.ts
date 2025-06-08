import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { State, Actions } from './types';

export const recordsStore = create<State & Actions>()(
  immer((set) => ({
    records: new Map(),

    setRecords: (records) =>
      set((state) => {
        state.records = records;
      }),

    addRecord: (record) =>
      set((state) => {
        const id = Number(record.id);
        state.records.set(id, { ...record, id });
      }),

    addRandom: () => {
      set((state) => {
        const randomId = Math.floor(Math.random() * 10_000);

        state.records.set(randomId, {
          id: randomId,
          sign: `Random card: ${randomId}`,
          from: new Date(2025, 5, 19, 10),
          to: new Date(2025, 5, 19, 10, 30),
        });
      });
    },
  })),
);
