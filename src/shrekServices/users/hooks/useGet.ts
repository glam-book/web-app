import { useQuery } from '@tanstack/react-query';
import { Effect } from 'effect';

import { get } from '@/shrekServices/users';

const query = 'user';

export const useGet = (...[userId]: Partial<Parameters<typeof get>>) =>
  useQuery({
    queryKey: [query, { userId }],
    enabled: Boolean(userId),
    queryFn: () => Effect.runPromise(get(userId as string | number)),
  });
