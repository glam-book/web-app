import { add, setHours, setMinutes, setSeconds } from 'date-fns';

export const setMinutesToDate = (sourceDate: Date) => (minutes: number) =>
  add(setHours(setMinutes(setSeconds(sourceDate, 0), 0), 0), {
    minutes,
  });
