import { type Record } from '@/schemas';
import type { WithoutReadonly, Prettify } from '@/types';

export type State = {
  isUnfreezed: boolean;
  isResizeMode: boolean;
  fields?: Prettify<WithoutReadonly<typeof Record.Type>>;
};

export type Actions = {
  setFields: (fields: State['fields']) => void;
  reset: () => void;
  toggle: (
    key: {
      [K in keyof State]-?: State[K] extends boolean ? K : never;
    }[keyof State],
    value?: boolean,
  ) => void;
};
