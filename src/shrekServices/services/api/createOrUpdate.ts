import { flow, Schema } from 'effect';

import { ItselfWithOptionalId } from '@/shrekServices/services/schemas';
import { http } from '@/services';

export const createOrUpdate = flow(
  (service: typeof ItselfWithOptionalId.Type): [string, RequestInit] => [
    '/api/v1/service',
    {
      method: 'POST',
      body: JSON.stringify(Schema.encodeSync(ItselfWithOptionalId)(service)),
    },
  ],
  args => http.liveClient(...args),
);
