import { Effect, pipe, Schema, Data, Console } from 'effect';

const getSomeDataFromTheServer = () =>
  fetch('path/to/some_data').then((res) => res.json());

class ValidationError extends Data.TaggedError('ValidationError') {}

const SomeData = Schema.Struct({
  A: Schema.Number,
  B: Schema.String,
}).pipe(Schema.rename({ A: 'a', B: 'b' }));

const someDataMapper = Effect.tryMap({
  try: (data: unknown) => Schema.decodeUnknownSync(SomeData)(data),
  catch: (errro) => new ValidationError(error),
});

interface T extends typeof SomeData.Type {};


const save = (data: typeof SomeData.Type): void => console.log(data);

const program = pipe(
  Effect.tryPromise(getSomeDataFromTheServer),
  someDataMapper,
  Effect.tap(save),
  Effect.catchTags({
    ValidationError: ,
    UnknownException: Console.error,
  }),
);

Effect.runPromise(program);
