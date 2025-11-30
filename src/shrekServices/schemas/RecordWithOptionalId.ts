import { Schema } from 'effect';

import { Record } from './Record';

export const RecordWithOptionalId = Schema.Struct({
  ...Record.fields,
  id: Schema.optional(Schema.Number),
});
