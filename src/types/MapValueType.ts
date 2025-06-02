export type MapValueType<T> = T extends Map<unknown, infer V> ? V : never;
