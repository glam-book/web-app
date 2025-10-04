import { Effect } from 'effect';

import { updateRecord } from '@/api';
import { recordCards } from '@/shrekServices';

export const update = (record: Parameters<typeof updateRecord>[number]) => {
  recordCards.store.areself.setState((state) => {
    state.records.set(record.id, record);
  });

  return Effect.runPromiseExit(
    updateRecord(record).pipe(
      Effect.tap((result) => {
        recordCards.store.areself.setState((state) => {
          state.records.set(result.id, result);
        });
      }),
    ),
  );
};
