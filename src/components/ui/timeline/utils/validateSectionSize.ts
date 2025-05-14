import { minSectionSizeInMinutes } from '../constants';

export const validateSectionSize = (
  sectionSizeInMinutes: number,
): number => Math.max(sectionSizeInMinutes, minSectionSizeInMinutes);
