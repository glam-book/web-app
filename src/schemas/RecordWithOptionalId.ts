import { Schema } from 'effect';

import { StringFromService } from '@/transformers';

export const RecordWithOptionalId = Schema.Struct({
  id: Schema.optional(Schema.Number),
  tsFrom: Schema.DateFromString,
  tsTo: Schema.DateFromString,
  serviceInfo: StringFromService,
}).pipe(Schema.rename({ tsFrom: 'from', tsTo: 'to', serviceInfo: 'sign' }));
