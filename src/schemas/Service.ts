import { Schema } from 'effect';

export const Service = Schema.Struct({
  id: Schema.Number,
  title: Schema.optionalWith(Schema.String, { default: () => '' }),
  price: Schema.optional(Schema.Number),
});
