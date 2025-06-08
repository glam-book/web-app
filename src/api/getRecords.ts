import { format } from 'date-fns';
import { Effect, Schema, Console, pipe } from 'effect';

import { RecordList } from '@/schemas';

export const getRecords = (date = new Date('2024-12-26')) =>
  pipe(
    Effect.tryPromise(() =>
      fetch(
        `http://localhost:8095/api/v1/record?date=${format(date, 'yyyy-MM-dd')}`,
      ).then((res) => res.json()),
    ),

    Effect.tryMap({
      try: (data) =>
        Schema.decodeUnknownSync(RecordList, {
          onExcessProperty: 'preserve',
        })(data),
      catch: (error) => error,
    }),

    Effect.tap(Console.debug),
  );
