import { create } from 'zustand';

type State = {
  calendarId?: number | string;
};

export const store = create<State>()(() => ({}));
