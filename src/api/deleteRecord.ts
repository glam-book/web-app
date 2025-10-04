import { Effect, Console, pipe, Schema } from 'effect';

import { tgUser } from '@/constants';
import { SchemaParsingError } from '@/errors';

export const deleteRecord = (id: number) =>
  pipe(
    Effect.tryPromise(() =>
      fetch(`api/v1/record/${id}`, {
        headers: { 'X-tg-data': tgUser },
      }).then((res) => res.json()),
    ),

    Effect.tryMap({
      try: (data) =>
        Schema.decodeUnknownSync(
          Schema.Struct({
            success: Schema.Boolean,
          }),
        )(data),
      catch: (error) => new SchemaParsingError(error),
    }),

    Effect.tap(Console.debug),
  );
