import { Schema } from 'effect';

export const MapFromArrayWithIdsOrUndefined = <
  A extends { id: number },
  I = never,
  R = never,
>(
  value: Schema.Schema<A, I, R>,
) =>
  Schema.transform(
    Schema.UndefinedOr(Schema.Array(value)),

    Schema.MapFromSelf({
      key: Schema.Number,
      value: Schema.typeSchema(value),
    }),

    {
      strict: true,
      decode: (items = []) => new Map(items.map(i => [i.id, i])),
      encode: map => Array.from(map, ([, item]) => item),
    },
  );
