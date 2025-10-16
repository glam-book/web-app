import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { State, Actions } from './types';

const defaultState: State = {
  isResizeMode: false,
  isNew: false,
  isUnfreezed: false,
  fields: undefined,
};

export const editableRightNow = create<State & Actions>()(
  immer((set, get) => ({
    ...defaultState,

    toggle: (key, value) =>
      set(state => {
        state[key] = value ?? !state[key];
      }),

    reset: () => {
      set(editableRightNow.getInitialState());
    },

    setFields: fields => {
      const isNew = !fields.id;
      const id = isNew ? Date.now() : fields.id;

      set(state => {
        state.fields = { id, ...fields };
        state.isNew = get().fields ? get().isNew : isNew;
      });
    },

    addServices: (...idList) => {
      set(state => {
        idList.forEach(id => {
          state.fields?.serviceIdList.add(id);
        });
      });
    },
  })),
);
