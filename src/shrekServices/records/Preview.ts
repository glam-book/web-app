import { Schema } from 'effect';

import { DateFromStringCustom } from '@/transformers/DateFromStringCustom';

export const Preview = Schema.Record({
  key: Schema.String,
  value: Schema.Array(
    Schema.Struct({
      day: Schema.Number,
      ts: Schema.propertySignature(DateFromStringCustom),
      isOwner: Schema.Boolean,
      canPending: Schema.Boolean,
      hasPendings: Schema.Boolean,
    }),
  ),
});
