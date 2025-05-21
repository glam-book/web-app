import type { CardProps } from '../types';

export const checkIsCardChanged = (
  a: CardProps['fields'],
  b: CardProps['fields'],
): boolean =>
  Number(a.from) !== Number(b.from) ||
  Number(a.to) !== Number(b.to) ||
  a.sign !== b.sign;
