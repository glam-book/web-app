import { create } from 'zustand';

type State = {
  user: string;
};

export const externalData = create<State>()(() => ({
  user: String(window.Telegram?.WebApp?.initData),
}));
