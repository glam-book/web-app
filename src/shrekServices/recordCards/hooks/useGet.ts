import { addHours } from 'date-fns';
import { Effect } from 'effect';
import { useQuery } from '@tanstack/react-query';

import { recordCards } from '@/shrekServices';
import { Record } from '@/schemas';

const query = 'records';

export const useGet = (
  ...[userId, date]: Partial<Parameters<typeof recordCards.fetchList>>
) =>
  useQuery({
    queryKey: [query, { userId, date }],
    queryFn: () => {
      if (userId && date) {
        recordCards.store.queriesStore
          .getState()
          .setIt([query, { userId, date }]);

        return Effect.runPromise(recordCards.fetchList(userId, date)).catch(
          () =>
            new Map([
              [
                1,
                Record.make({
                  id: 1,
                  from: date,
                  to: addHours(date, 1),
                  sign: 'FROM CATCH',
                }),
              ],
            ]),
        );
      }
    },
  });
