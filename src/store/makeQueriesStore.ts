import { create } from 'zustand';

type State = {
  queries: unknown[];
};

export const makeQueriesStore = () =>
  create<State>()(() => ({
    queries: [],
  }));
