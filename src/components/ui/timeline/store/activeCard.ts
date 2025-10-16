import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { records } from '@/shrekServices';

type State = {
  isResizeMode: boolean;
  isUnfreezed: boolean;
};

type Actions = {
  reset: () => void;

  toggle: (
    key: {
      [K in keyof State]-?: State[K] extends boolean ? K : never;
    }[keyof State],
    value?: boolean,
  ) => void;
};

export const activeCard = create<State & Actions>()(
  immer((set, _, api) => ({
    isResizeMode: false,
    isUnfreezed: false,

    reset: () => {
      set(api.getInitialState());
    },

    toggle: (key, value) => {
      set(state => {
        state[key] = value ?? !state[key];
      });
    },
  })),
);

records.store.editableRightNow.subscribe(state => {
  if (state.fields === undefined) {
    activeCard.getState().reset();
  }
});
