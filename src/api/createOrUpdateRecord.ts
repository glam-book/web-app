import { Effect, Schema, Console, pipe } from 'effect';

import { RecordWithOptionalId, Record } from '@/schemas';
import { externalData } from '@/store';

export const createOrUpdateRecord = (
  record: typeof RecordWithOptionalId.Type,
) =>
  pipe(
    Effect.tryPromise(() =>
      fetch('api/v1/record', {
        method: 'POST',
        headers: { 'X-tg-data': String(externalData.getState().user) },
        body: JSON.stringify(
          Schema.encodeSync(RecordWithOptionalId, undefined)(record),
        ),
      }).then((res) => res.json()),
    ),

    Effect.tryMap({
      try: (data) =>
        Schema.decodeUnknownSync(Record, {
          onExcessProperty: 'preserve',
        })(data),
      catch: (error) => error,
    }),

    Effect.tap(Console.debug),
  );
