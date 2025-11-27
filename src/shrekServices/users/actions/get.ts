import { pipe } from 'effect';

import { getUser } from '@/api';
import { UserProfile } from '@/schemas';
import { tryDecodeInto } from '@/utils';

export const get = (id: number | string) => pipe(getUser(id), tryDecodeInto(UserProfile));
