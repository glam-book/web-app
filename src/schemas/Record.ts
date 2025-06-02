import { Schema } from 'effect';

import { StringFromService } from '@/transformers';

export const Record = Schema.Struct({
  id: Schema.Number,
  ts_from: Schema.DateFromString,
  ts_to: Schema.DateFromString,
  service_info: StringFromService,
}).pipe(Schema.rename({ ts_from: 'from', ts_to: 'to', service_info: 'sign' }));
