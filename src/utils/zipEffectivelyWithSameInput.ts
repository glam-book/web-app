import { Effect } from 'effect';

export const zipEffectivelyWithSameInput =
  <Input, A1, A2, E1, E2, C1, C2>(
    f1: (x: Input) => Effect.Effect<A1, E1, C1>,
    f2: (x: Input) => Effect.Effect<A2, E2, C2>,
    options?: Parameters<typeof Effect.zip>[2],
  ) =>
  (x: Input) =>
    Effect.zip(f1(x), f2(x), options);
