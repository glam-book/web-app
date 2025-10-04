import { type QueryClient } from '@tanstack/react-query';

import { queryClient } from '@/lib/tanstackQuery/queryClient';

export const getQueryData = <T>(
  ...params: Parameters<InstanceType<typeof QueryClient>['getQueryData']>
): T | undefined => queryClient.getQueryData(...params) as T;
