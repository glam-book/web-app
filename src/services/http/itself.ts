import { Effect, Context } from 'effect';

export class ClientConfig extends Context.Tag('HttpClientConfig')<
  ClientConfig,
  {
    readonly defaultHeaders: HeadersInit;
  }
>() {}

export const client = Effect.fn(function* (
  ...[input, { headers, ...init } = {}]: [string | URL, RequestInit?]
) {
  const { defaultHeaders } = yield* ClientConfig;

  return yield* Effect.tryPromise(() =>
    fetch(input, {
      ...init,
      headers: { ...defaultHeaders, ...headers },
    }).then(res => {
        console.time('a');
        return res.json();
      }),
  );
});
