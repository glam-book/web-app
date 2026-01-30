import { Schema } from 'effect';

import { DateFromStringCustom } from '@/transformers/DateFromStringCustom';

const Contact = Schema.Struct({
  firstName: Schema.optionalWith(Schema.String, { default: () => '' }),
  lastName: Schema.optionalWith(Schema.String, { default: () => '' }),
  tgUserName: Schema.optionalWith(Schema.String, { default: () => '' }),
});

const ServicePreview = Schema.Struct({
  id: Schema.Number,
  title: Schema.optionalWith(Schema.String, { default: () => '' }),
  price: Schema.optionalWith(Schema.Number, { default: () => 0 }),
  isHourlyPrice: Schema.optionalWith(Schema.Boolean, { default: () => false }),
});

export const PendingDetails = Schema.Array(
  Schema.Struct({
    contact: Contact,
    requestTime: Schema.propertySignature(DateFromStringCustom),
    confirmed: Schema.optionalWith(Schema.String, { default: () => 'CREATED' }),
    services: Schema.Array(ServicePreview),
  }),
);

export type PendingDetails = typeof PendingDetails.Type;
