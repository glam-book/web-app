import { flow } from 'effect';

import { getRecords } from '@/api';
import { RecordList } from '@/schemas';
import { tryDecodeInto } from '@/utils';

export const fetchList = flow(getRecords, tryDecodeInto(RecordList));
