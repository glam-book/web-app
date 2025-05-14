import { getTimeByIndex } from './';

export const getTimeList = (
  numberOfSections: number,
  sectionSizeInMinutes: number,
) =>
  Array.from({ length: numberOfSections }, (_, idx) =>
    getTimeByIndex(idx, sectionSizeInMinutes),
  );
