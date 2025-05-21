import { useState, useEffect } from 'react';

export const useFreakyState = <V>(
  initialV: V | (() => V),
): [V, React.Dispatch<React.SetStateAction<V>>] => {
  const [v, setV] = useState<V>(initialV);
  useEffect(() => setV(initialV), [initialV]);
  return [v, setV];
};
