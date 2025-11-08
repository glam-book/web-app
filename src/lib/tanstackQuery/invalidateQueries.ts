import { queryClient } from '@/lib/tanstackQuery/queryClient';

export const invalidateQueries = (queries: unknown[]) =>
  queryClient.invalidateQueries({ queryKey: queries });
