export const convertMinutesToUnits = (
  numberOfSections: number,
  oneSectionSize: number,
  minutes: number,
): number => numberOfSections * oneSectionSize * (minutes / (24 * 60));

export const convertUnitsToMinutes = (
  numberOfSections: number,
  oneSectionSize: number,
  units: number,
) => (units * 24 * 60) / (numberOfSections * oneSectionSize);
