import { create } from 'zustand';

type State = {
  queries: unknown[];
};

type Actions = {
  // setIt: (queries: unknown[]) => void;
};

export const makeQueriesStore = () =>
  create<State & Actions>()(() => ({
    queries: [],
  }));
