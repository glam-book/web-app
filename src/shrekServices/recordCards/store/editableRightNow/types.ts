import type { Record, RecordWithOptionalId } from '@/schemas';

export type State = {
  isResizeMode: boolean;
  isNew: boolean;
  isUnfreezed: boolean;
  fields?: typeof Record.Type;
};

export type Actions = {
  setFields: (record: typeof RecordWithOptionalId.Type) => void;

  toggle: (
    key: {
      [K in keyof State]-?: State[K] extends boolean ? K : never;
    }[keyof Omit<State, 'isNew'>],
    value?: boolean,
  ) => void;

  addServices: (...idList: number[]) => void;

  reset: () => void;
};
