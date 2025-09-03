import { Schema } from 'effect';

import { StringFromService, DateFromStringCustom } from '@/transformers';

export const Record = Schema.Struct({
  id: Schema.Number,
  tsFrom: DateFromStringCustom,
  tsTo: DateFromStringCustom,
  serviceInfo: StringFromService,
}).pipe(Schema.rename({ tsFrom: 'from', tsTo: 'to', serviceInfo: 'sign' }));
