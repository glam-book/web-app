import { add, startOfDay } from 'date-fns';

export const setMinutesToDate = (sourceDate: Date) => (minutes: number) =>
  add(startOfDay(sourceDate), { minutes });
