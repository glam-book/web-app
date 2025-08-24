import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { State, Actions } from './types';

const defaultState: State = {
  isUnfreezed: false,
  isResizeMode: false,
  fields: undefined,
};

export const editableRightNowCard = create<State & Actions>()(
  immer((set) => ({
    ...defaultState,

    toggle: (key, value) =>
      set((state) => {
        state[key] = value ?? !state[key];
      }),

    setFields: (fields) => {
      set((state) => {
        state.fields = fields;
      });
    },

    reset: () => set(defaultState),
  })),
);
