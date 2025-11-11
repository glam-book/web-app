export const between = (
  n: number,
  min: number,
  max: number,
  options: { strict: boolean } = { strict: false },
) => (options.strict ? n > min && n < max : n >= min && n <= max);
