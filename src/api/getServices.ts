import { flow } from 'effect';

import { rest } from '@/services';

export const getServices = flow(
  (userId: number | string) => `/api/v1/service/list/${userId ?? ''}`,
  rest.client,
);
