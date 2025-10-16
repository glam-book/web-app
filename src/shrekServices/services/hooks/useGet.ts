import { Effect } from 'effect';
import { useQuery } from '@tanstack/react-query';

import { schemas, store, fetchList } from '@/shrekServices/services';

const query = 'services';

export const useGet = (...[userId]: Partial<Parameters<typeof fetchList>>) =>
  useQuery({
    queryKey: [query, { userId }],
    queryFn: () => {
      if (userId) {
        store.queriesStore.getState().setIt([query, { userId }]);

        return Effect.runPromise(fetchList(userId)).catch(
          () =>
            new Map([
              [
                1,
                schemas.Itself.make({
                  id: 1,
                  title: 'FIRST SERVICE 💅',
                }),
              ],
            ]),
        );
      }
    },
  });
