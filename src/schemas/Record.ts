import { Schema } from 'effect';

import { StringFromService, DateFromStringCustom } from '@/transformers';

export const Record = Schema.Struct({
  id: Schema.Number,
  ts_from: DateFromStringCustom,
  ts_to: DateFromStringCustom,
  service_info: StringFromService,
}).pipe(Schema.rename({ ts_from: 'from', ts_to: 'to', service_info: 'sign' }));
