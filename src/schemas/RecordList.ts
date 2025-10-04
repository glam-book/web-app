import { MapFromArrayWithIdsOrUndefined } from '@/transformers';
import { Record } from '@/schemas';

export const RecordList = MapFromArrayWithIdsOrUndefined(Record);
