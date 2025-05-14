import { getHours, getMinutes } from 'date-fns';

export const convertDateToUnits = (
  numberOfSections: number,
  oneSectionSize: number,
  date: Date,
): number => {
  const minutes = getHours(date) * 60 + getMinutes(date);
  const minutesInOneDay = 24 * 60;

  return numberOfSections * (minutes / minutesInOneDay) * oneSectionSize;
};
