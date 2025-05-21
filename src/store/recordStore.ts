import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type Record = {
  id: number;
  from: Date;
  to: Date;
  sign: string;
};

type State = {
  records: Map<Record['id'], Record>;
};

type Actions = {
  addRecord: (card: Record) => void;
  addRandom: () => void;
};

export const recordsStore = create<State & Actions>()(
  immer((set) => ({
    records: new Map([
      [
        1,
        {
          id: 1,
          sign: 'Record: 1',
          from: new Date(2000, 1, 1, 12),
          to: new Date(2000, 1, 1, 13, 30),
        },
      ],
    ]),

    addRecord: (record) =>
      set((state) => {
        state.records.set(record.id, record);
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
