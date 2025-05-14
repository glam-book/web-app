export const getNumberOfSections = (sectionSizeInMinutes: number): number =>
  Math.ceil((24 * 60) / sectionSizeInMinutes);
