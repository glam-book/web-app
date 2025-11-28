import { pipe } from 'effect';

import { getMe } from '@/api';
import { UserProfile } from '@/schemas';
import { tryDecodeInto } from '@/utils';

export const get = pipe(getMe, tryDecodeInto(UserProfile));
