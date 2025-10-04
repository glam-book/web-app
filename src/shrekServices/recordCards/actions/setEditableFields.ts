import { flow } from 'effect';

import { RecordWithOptionalId } from '@/schemas';
import { recordCards } from '@/shrekServices';

export const setEditableFields = flow(
  RecordWithOptionalId.make,
  recordCards.store.editableRightNow.getState().setFields,
);
