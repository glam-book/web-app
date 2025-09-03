import { Schema } from 'effect';

import { Record } from '@/schemas';

export const RecordWithOptionalId = Schema.extend(
  Record.pipe(Schema.omit('id')),
  Schema.Struct({ id: Schema.optional(Schema.Number) }),
);
