export const getTimeByIndex = (
  idx: number,
  sectionSizeInMinutes: number,
): string => {
  const mm = `${String((idx * sectionSizeInMinutes) % 60).padStart(2, '0')}`;
  const hh = `${String(Math.floor(idx / (60 / sectionSizeInMinutes))).padStart(2, '0')}`;
  return `${hh}:${mm}`;
};
