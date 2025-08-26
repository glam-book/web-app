import { Schema } from 'effect';

export const Service = Schema.Struct({
  id: Schema.optional(Schema.Number),
  title: Schema.String,
});
