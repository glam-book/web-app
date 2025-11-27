import { Schema } from 'effect';

export const UserProfile = Schema.Struct({
  id: Schema.Number,
  name: Schema.optional(Schema.String),
  lastName: Schema.optional(Schema.String),
  middleName: Schema.optional(Schema.String),
  login: Schema.optional(Schema.String),

  profileIcon: Schema.optional(Schema.String),
  contacts: Schema.optional(Schema.Array(Schema.Unknown)),
});
