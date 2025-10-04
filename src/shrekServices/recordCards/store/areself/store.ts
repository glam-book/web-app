import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { State, Actions } from './types';

export const areself = create<State & Actions>()(
  immer((set) => ({
    records: new Map(),

    delete: (id) => {
      set((state) => {
        state.records.delete(id);
      });
    },
  })),
);
