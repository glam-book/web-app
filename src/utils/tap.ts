export const tap =
  <T>(fn: (arg: T) => unknown) =>
  (arg: T): T => {
    fn(arg);
    return arg;
  };
