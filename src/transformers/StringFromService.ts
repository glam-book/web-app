import { Schema } from 'effect';

import { Service } from '@/schemas';

export const StringFromService = Schema.transform(Service, Schema.String, {
  strict: true,
  decode: ({ title }) => title,
  encode: (sign) => ({ title: sign }),
});
