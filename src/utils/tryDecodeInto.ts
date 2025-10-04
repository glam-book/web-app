import { Effect, Schema } from 'effect';

import { SchemaParsingError } from '@/errors';

export const tryDecodeInto = <A, I>(schema: Schema.Schema<A, I, never>) =>
  Effect.tryMap({
    try: x =>
      Schema.decodeUnknownSync(schema, { onExcessProperty: 'preserve' })(x),
    catch: error => new SchemaParsingError(error),
  });
