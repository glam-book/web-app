import { pipe } from 'effect';

import { Me } from '@/schemas';
import { getMe } from '@/api';
import { tryDecodeInto } from '@/utils';

export const get = pipe(getMe, tryDecodeInto(Me));
