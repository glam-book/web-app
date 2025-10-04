import { Record } from '@/schemas';

export const RecordWitoutId = Record.omit('id');
