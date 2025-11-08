import { Effect, Schema, flow, pipe } from 'effect';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

import { queryClient, rest } from '@/services';
import { Record as Itself } from '@/schemas/Record';
import { tryDecodeInto } from '@/utils';
import { invalidateQueries } from '@/lib/tanstackQuery';

import { Preview } from './Preview';

const resource = 'record';

export const {
  startEdit: _startEdit,
  store,
  useGet,
  finishEdit: _finishEdit,
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

export const getPreview = (userId: number | string, month: Date) =>
  pipe(
    `${resource}/calendar?userId=${userId}&month=${format(month, 'MM')}&year=${format(month, 'yyyy')}`,
    rest.client,
    tryDecodeInto(Preview),
    Effect.runPromise,
  );

export const useGetPreview = (
  userId: number | string | undefined,
  month: Date,
) =>
  useQuery({
    queryKey: [`${resource}/preview`, userId, month],
    enabled: [userId, month].every(Boolean),
    queryFn: () => getPreview(userId as number | string, month),
  });

export const invalidatePreview = () =>
  invalidateQueries([`${resource}/preview`]);

export const finishEdit = flow(_finishEdit, x => {
  x?.then(invalidatePreview);
  return x;
});
