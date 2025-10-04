import { type QueryClient } from '@tanstack/react-query';

import { queryClient } from '@/lib/tanstackQuery/queryClient';

export const setQueryData = (
  ...params: Parameters<InstanceType<typeof QueryClient>['setQueryData']>
) => queryClient.setQueryData(...params);
