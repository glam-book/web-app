import { Schema, pipe } from 'effect';

import { DateFromStringCustom } from '@/transformers';
import { Service } from '@/schemas';

export const Record = Schema.Struct({
  id: Schema.Number,

  from: pipe(
    Schema.propertySignature(DateFromStringCustom),
    Schema.fromKey('tsFrom'),
  ),

  to: pipe(
    Schema.propertySignature(DateFromStringCustom),
    Schema.fromKey('tsTo'),
  ),

  sign: pipe(
    Schema.optionalWith(Schema.String, { default: () => '' }),
    Schema.fromKey('comment'),
  ),

  serviceIdList: pipe(
    Schema.optionalWith(
      Schema.transform(
        Schema.Array(Service.pipe(Schema.pick('id'))),
        Schema.SetFromSelf(Schema.Number),
        {
          decode: (items) => new Set(items.map(({ id }) => id)),
          encode: (set) => Array.from(set, (id) => ({ id })),
        },
      ),
      {
        default: () => new Set<number>(),
      },
    ),
    Schema.fromKey('serviceInfo'),
  ),
});
