import { Console, Effect, pipe, Schema } from 'effect';

import { Record } from '@/schemas';
import { tgUser } from '@/constants';
import { SchemaParsingError } from '@/errors';

export const updateRecord = (record: typeof Record.Type) =>
  pipe(
    Effect.tryPromise(() =>
      fetch('api/v1/record', {
        method: 'POST',
        headers: {
          'X-tg-data': tgUser,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Schema.encodeSync(Record)(record)),
      }).then((res) => res.json()),
    ),

    Effect.tryMap({
      try: (data) =>
        Schema.decodeUnknownSync(Record, {
          onExcessProperty: 'preserve',
        })(data),
      catch: () => new SchemaParsingError(),
    }),

    Effect.tap(Console.debug),
  );
