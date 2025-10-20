import { Effect, Schema, flow, pipe } from 'effect';
import { format } from 'date-fns';

import { queryClient, rest } from '@/services';
import { Record as Itself } from '@/schemas/Record';
import { tryDecodeInto } from '@/utils';

const resource = 'record';

export const {
  startEdit: _startEdit,
  store,
  useGet,
  finishEdit,
  deleteOne,
} = queryClient.makeResourceListActionsTemplate({
  resource,
  Itself,
  adapter: (userId: number | string, date: Date) =>
    `${userId}?date=${format(date, 'yyyy-MM-dd')}`,
});

export const startEdit = flow(
  Schema.Struct({
    ...Itself.fields,
    id: Schema.optional(Schema.Number),
  }).make,
  _startEdit,
);

export const makeAppointment = (
  recordId: (typeof Itself.Type)['id'],
  serviceIdList: number[],
) =>
  pipe(
    [
      `${resource}/pending/${recordId}`,
      { method: 'PUT', body: JSON.stringify(serviceIdList) },
    ] as const,
    params => rest.client(...params),
    tryDecodeInto(Itself),
    Effect.tap(record => store.listActions.setOne(record)),
    Effect.runPromise,
  );
