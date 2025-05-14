type AnyFunc = (...args: any[]) => any;

type Curry<Fn extends AnyFunc> =
  Parameters<Fn> extends [infer FirstArg, ...infer Rest]
    ? (arg: FirstArg) => Curry<(...args: Rest) => ReturnType<Fn>>
    : ReturnType<Fn>;

export function curry<T extends AnyFunc, TAgg extends unknown[]>(
  func: T,
  agg?: TAgg,
): Curry<T> {
  const aggregatedArgs = agg ?? [];
  if (func.length === aggregatedArgs.length) return func(...aggregatedArgs);
  return ((arg: any) => curry(func, [...aggregatedArgs, arg])) as any;
}
