import { Schema } from 'effect';

export const MapFromArrayWithIds = <
  A extends Record<string, unknown> & { id: number },
  I,
  R,
>(
  itemSchema: Schema.Schema<A, I, R>,
) =>
  Schema.transform(
    Schema.Array(itemSchema),
    Schema.MapFromSelf({
      key: Schema.Number,
      value: Schema.typeSchema(itemSchema),
    }),
    {
      strict: true,
      decode: (items) => new Map(items.map((i) => [i.id, i])),
      encode: (map) => Array.from(map, ([, item]) => item),
    },
  );
