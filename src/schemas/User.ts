import { Schema } from 'effect';

const TgContact = Schema.Struct({
  tgUserName: Schema.optional(Schema.NullOr(Schema.String)),
});

export const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.optional(Schema.NullOr(Schema.String)),
  lastName: Schema.optional(Schema.NullOr(Schema.String)),
  middleName: Schema.optional(Schema.NullOr(Schema.String)),
  login: Schema.optional(Schema.NullOr(Schema.String)),
  profileIcon: Schema.optional(Schema.NullOr(Schema.String)),
  contacts: Schema.optional(Schema.NullOr(Schema.Array(TgContact))),
  email: Schema.optional(Schema.NullOr(Schema.String)),
  phone: Schema.optional(Schema.NullOr(Schema.String)),
});
