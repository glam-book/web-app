import { flow } from 'effect';

import { getServices } from '@/api';
import { List } from '@/shrekServices/services/schemas';
import { tryDecodeInto } from '@/utils';

export const fetchList = flow(getServices, tryDecodeInto(List));
