import { format } from 'date-fns';
import { flow } from 'effect';

import { http } from '@/services';

export const getRecords = flow(
  (userId: number | string, date: Date) =>
    `/api/v1/record/list/${userId ?? ''}?date=${format(date, 'yyyy-MM-dd')}`,
  http.liveClient,
);
