import { create } from 'zustand';

type State = {
  id?: number;
};

export const me = create<State>()(() => ({
  id: undefined,
}));
