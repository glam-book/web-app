import { useState, useEffect } from 'react';

export const useFreakyState = <V>(
  initialV: V,
): [V, React.Dispatch<React.SetStateAction<V>>] => {
  const [v, setV] = useState<V>(initialV);

  useEffect(
    () => setV(typeof initialV === 'function' ? initialV() : initialV),
    [initialV],
  );

  return [v, setV];
};
