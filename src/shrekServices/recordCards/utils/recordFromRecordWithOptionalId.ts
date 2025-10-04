import { Record, type RecordWithOptionalId } from '@/schemas';

export const recordFromRecordWithOptionalId = (
  input: typeof RecordWithOptionalId.Type,
) => Record.make({ id: Date.now(), ...input });
