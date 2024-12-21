import { useRef, useEffect } from 'react';

export const useCurrentRef = <T>(value: T): React.RefObject<T> => {
  const valueRef = useRef<T>(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  return valueRef;
};
