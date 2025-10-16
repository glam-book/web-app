import { Effect, flow } from 'effect';

import * as http from '@/services/http';
import { tgUser } from '@/constants';
import { contramap } from '@/utils';

const getCorrectRestUrl = (input: string | URL): string => {
  const inputString = input.toString();

  if (inputString.startsWith('http')) {
    return inputString;
  }

  const apiPath = __API_PATH__;
  const inputWithoutApiPath = inputString.replace(
    apiPath.replace(/^\/*(.*?)\/*$/, (_, g: string) => g),
    '',
  );
  const result = `${apiPath}${inputWithoutApiPath}`.replace(/\/{2,}/g, '/');

  return result;
};

export const client = flow(
  contramap(
    http.client,
    (url, ...rest) => [getCorrectRestUrl(url), ...rest] as const,
  ),
  Effect.provideService(http.ClientConfig, {
    defaultHeaders: { 'X-tg-data': tgUser, 'Content-Type': 'application/json' },
  }),
);

