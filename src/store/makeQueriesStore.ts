import { create } from 'zustand';

type State = {
  queries: unknown[];
};

type Actions = {
  getIt: () => unknown[];
  setIt: (queries: unknown[]) => void;
};

export const makeQueriesStore = () =>
  create<State & Actions>()((set, get) => ({
    queries: [],
    getIt: () => get().queries,
    setIt: queries =>
      set({
        queries,
      }),
  }));
