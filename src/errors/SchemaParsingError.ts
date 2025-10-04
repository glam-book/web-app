import { Data } from 'effect';

export class SchemaParsingError extends Data.TaggedError('SchemaParsingError') {
  constructor(public error?: unknown) {
    super();
  }
}
