import { Schema } from 'effect';
import { format } from 'date-fns';

export const DateFromStringCustom = Schema.transform(
  Schema.String,
  Schema.DateFromSelf,
  {
    strict: true,
    decode: (input) => new Date(input),
    encode: (date) => format(date, "y-MM-dd'T'HH:mm:ss"),
  },
);
