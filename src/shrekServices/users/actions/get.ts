import { pipe } from 'effect';

import { User } from '@/schemas';
import { rest } from '@/services';
import { tryDecodeInto } from '@/utils';

export const get = (id: number | string) =>
  pipe(rest.client(`users/${id}`), tryDecodeInto(User));
