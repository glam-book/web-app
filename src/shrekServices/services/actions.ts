import { Schema, flow } from 'effect';

import { queryClient } from '@/services';
import { Itself } from '@/shrekServices/services/schemas';

const resource = 'service';

export const {
  startEdit: _startEdit,
  store,
  useGet,
  finishEdit,
  deleteOne,
} = queryClient.makeResourceListActionsTemplate({
  resource,
  Itself,
  adapter: (userId: number | string) => String(userId),
});

export const startEdit = flow(
  Schema.Struct({
    ...Itself.fields,
    id: Schema.optional(Schema.Number),
  }).make,
  _startEdit,
);
