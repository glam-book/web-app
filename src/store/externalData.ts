import { create } from 'zustand';

type State = {
  data?: unknown;
};

export const externalData = create<State>()(() => ({
  data: undefined,
}));
