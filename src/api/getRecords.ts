import { format } from 'date-fns';
import { Effect, Schema, Console, pipe } from 'effect';

import { RecordList } from '@/schemas';
import { externalData } from '@/store';

export const getRecords = (userId: number, date = new Date('2024-12-26')) =>
  pipe(
    Effect.tryPromise(() =>
      fetch(
        `api/v1/record/list/${userId ?? ''}?date=${format(date, 'yyyy-MM-dd')}`,
        {
          headers: { 'X-tg-data': String(externalData.getState().user) },
        },
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
