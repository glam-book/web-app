import { isValid as isValidDate, isEqual as isEqualDates } from 'date-fns';

export const deepEqual = <T extends object>(a: T, b: T): boolean => {
  if (a === b) return true;

  if (Object.values(a).length !== Object.values(b).length) return false;

  let isEqual = false;

  for (const k in a) {
    const a1 = a[k];
    const b1 = b[k];

    if (isValidDate(a1) && isValidDate(b1)) {
      isEqual = isEqualDates(a1 as unknown as Date, b1 as unknown as Date);
    } else if (
      typeof a1 === 'object' &&
      a1 !== null &&
      typeof b1 === 'object' &&
      b1 !== null
    ) {
      isEqual = deepEqual(a1, b1);
    } else {
      isEqual = a1 === b1;
    }

    if (!isEqual) {
      break;
    }
  }

  return isEqual;
};
