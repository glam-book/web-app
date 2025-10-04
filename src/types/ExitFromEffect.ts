import type { Effect, Exit } from 'effect';

export type ExitFromEffect<
  EffectType extends Effect.Effect<unknown, unknown, unknown>,
> = Exit.Exit<
  Effect.Effect.Success<EffectType>,
  Effect.Effect.Error<EffectType>
>;
