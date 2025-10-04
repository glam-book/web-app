import { flow, Schema } from 'effect';

import { RecordWithOptionalId } from '@/schemas';
import { http } from '@/services';

export const createOrUpdateRecord = flow(
  (record: typeof RecordWithOptionalId.Type): [string, RequestInit] => [
    'api/v1/record',
    {
      method: 'POST',
      body: JSON.stringify(Schema.encodeSync(RecordWithOptionalId)(record)),
    },
  ],
  args => http.liveClient(...args),
);
