import { Schema, pipe } from 'effect';

import { Service } from '@/schemas';
import { DateFromStringCustom } from '@/transformers/DateFromStringCustom';

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
          decode: items => new Set(items.map(({ id }) => id)),
          encode: set => Array.from(set, id => ({ id })),
        },
      ),
      {
        default: () => new Set<number>(),
      },
    ),
    Schema.fromKey('serviceInfo'),
  ),

  owner: Schema.optionalWith(Schema.Boolean, { default: () => false }),

  pendings: pipe(
    Schema.optionalWith(
      Schema.Struct({
        limits: Schema.Number,
        active: Schema.Number,
      }),
      { default: () => ({ limits: 1, active: 0 }) },
    ),
    Schema.fromKey('recordPendings'),
  ),

  pendigable: Schema.optionalWith(Schema.Boolean, { default: () => true }),
});
