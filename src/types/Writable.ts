export type Writable<T extends Record<string, unknown>> = {
  -readonly [P in keyof T]: T[P];
};
