export type MapValueType<T> = T extends Map<any, infer V> ? V : never;
