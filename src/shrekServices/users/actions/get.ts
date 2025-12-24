import { pipe } from 'effect';

import { UserProfile } from '@/schemas';
import { rest } from '@/services';
import { tryDecodeInto } from '@/utils';

export const get = (id: number | string) =>
  pipe(rest.client(`users/${id}`), tryDecodeInto(UserProfile));
