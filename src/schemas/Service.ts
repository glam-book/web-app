import { Schema } from 'effect';

export const Service = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
});
