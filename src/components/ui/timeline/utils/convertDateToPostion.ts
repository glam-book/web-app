import { getHours, getMinutes } from 'date-fns';

export const convertDateToUnits = (
  date: Date,
  numberOfSections: number,
  oneSectionSize: number,
): number => {
  const minutes = getHours(date) * 60 + getMinutes(date);
  const minutesInOneDay = 24 * 60;

  return Math.round(
    numberOfSections * (minutes / minutesInOneDay) * oneSectionSize,
  );
};
