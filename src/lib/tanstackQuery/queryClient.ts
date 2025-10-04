import { Duration } from 'effect';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Duration.toMillis('1 minute'),
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
