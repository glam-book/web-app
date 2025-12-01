import { pipe } from 'effect';

import { rest } from '@/services';
import { UserProfile } from '@/schemas';
import { tryDecodeInto } from '@/utils';

export const get = pipe(rest.client('users/me'), tryDecodeInto(UserProfile));
