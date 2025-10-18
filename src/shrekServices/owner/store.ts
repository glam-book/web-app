import { create } from 'zustand';

type State = {
  id?: number | string;
};

export const store = create<State>()(() => ({}));
