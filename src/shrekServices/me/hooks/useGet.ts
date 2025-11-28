import { Effect } from 'effect';
import { useQuery } from '@tanstack/react-query';

import { get } from '@/shrekServices/me';

export const useGet = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: () =>
      Effect.runPromise(get).catch(error => {
        if (import.meta.env.DEV) {
          return { id: Date.now() };
        }

        throw error;
      }),
    staleTime: Infinity,
  });
