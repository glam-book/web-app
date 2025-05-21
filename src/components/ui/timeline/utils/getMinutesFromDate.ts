import { getHours, getMinutes } from 'date-fns';

export const getMinutesFromDate = (date: Date) =>
  getHours(date) * 60 + getMinutes(date);
