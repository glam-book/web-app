import { isValid as isValidDate, isEqual as isEqualDates } from 'date-fns';

const arePrimitiveSetsEqual = <T>(s1: Set<T>, s2: Set<T>): boolean => {
  if (s1.size !== s2.size) {
    return false;
  }

  for (const el of s1) {
    if (!s2.has(el)) {
      return false;
    }
  }

  return true;
};

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
      if (a1 instanceof Set && b1 instanceof Set) {
        isEqual = arePrimitiveSetsEqual(a1, b1);
      } else {
        isEqual = deepEqual(a1, b1);
      }
    } else {
      isEqual = a1 === b1;
    }

    if (!isEqual) {
      break;
    }
  }

  return isEqual;
};
