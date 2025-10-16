export const contramap =
  <
    TF extends (...args: unknown[]) => unknown,
    A extends Parameters<TF>,
    R extends ReturnType<TF>,
  >(
    f: (...args: A) => R,
    transform: (...args: A) => A,
  ) =>
  (...a: A) =>
    f(...transform(...a));
